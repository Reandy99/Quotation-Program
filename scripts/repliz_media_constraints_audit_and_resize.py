#!/usr/bin/env python3
"""Audit and (optionally) generate Repliz-compliant image variants.

Constraints (from user screenshot):
- Max resolution: 1080x1920 (portrait) or 1920x1080 (landscape)
- Max file size: 20 MB per image
- File type: JPG/JPEG/WebP

We interpret max resolution as bounding boxes:
- If width >= height (landscape/square): width<=1920 AND height<=1080
- Else (portrait): width<=1080 AND height<=1920

Outputs:
- audit/repliz_media_constraints_audit.json
- scripts/repliz_media_resize_map.json   # {originalUrl: {newUrl, localPath, newSize, reason}}

If --resize is passed, writes resized files into:
  /var/www/ocindonesia/media/whitepaper/repliz/
"""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

import requests
from PIL import Image, ImageFile

ROOT = Path('/root/.openclaw/workspace')
OUT_AUDIT = ROOT / 'audit' / 'repliz_media_constraints_audit.json'
OUT_MAP = ROOT / 'scripts' / 'repliz_media_resize_map.json'

LOCAL_BASE = Path('/var/www/ocindonesia/media/whitepaper')
REPLIZ_DIR = LOCAL_BASE / 'repliz'
REPLIZ_URL_BASE = 'https://ocindonesia.my.id/media/whitepaper/repliz/'

MAX_BYTES = 20 * 1024 * 1024

ALLOWED_FORMATS = {'JPEG', 'WEBP'}

THREADS_FILE = ROOT / 'audit' / 'repliz_whitepaper_threads_apr23_may31_after_vision_captions.json'
IG_FILE = ROOT / 'audit' / 'repliz_whitepaper_instagram_apr23_may31_after_vision_captions.json'
LI_FILE = ROOT / 'audit' / 'repliz_whitepaper_linkedin_apr23_may31_after_website.json'


def gather_urls() -> list[str]:
  urls = []
  for p in [THREADS_FILE, IG_FILE, LI_FILE]:
    if not p.exists():
      continue
    data = json.loads(p.read_text('utf-8'))
    for it in data.get('items', []):
      if it.get('status') not in ('pending', 'success', 'error'):
        continue
      for u in (it.get('mediaUrls') or []):
        if u:
          urls.append(u)
  # preserve order but unique
  seen = set()
  out = []
  for u in urls:
    if u not in seen:
      seen.add(u)
      out.append(u)
  return out


def url_to_local_path(url: str) -> Optional[Path]:
  m = re.match(r'^https?://ocindonesia\.my\.id/media/whitepaper/(.+)$', url)
  if not m:
    return None
  rel = m.group(1)
  # prevent traversal
  rel = rel.replace('..', '')
  return LOCAL_BASE / rel


def probe_remote_image(url: str, timeout: int = 25) -> Tuple[Tuple[int, int], str, Optional[int]]:
  """Return (w,h), format, content_length."""
  # try HEAD for size/type
  clen = None
  try:
    r = requests.head(url, timeout=timeout, allow_redirects=True)
    if r.ok:
      if r.headers.get('Content-Length'):
        try:
          clen = int(r.headers['Content-Length'])
        except Exception:
          pass
  except Exception:
    pass

  # stream enough bytes to parse image
  parser = ImageFile.Parser()
  w = h = None
  fmt = None

  with requests.get(url, stream=True, timeout=timeout) as r:
    r.raise_for_status()
    for chunk in r.iter_content(chunk_size=65536):
      if not chunk:
        continue
      parser.feed(chunk)
      if parser.image is not None:
        im = parser.image
        w, h = im.size
        fmt = im.format
        break
  if w is None or h is None:
    # fallback full open
    with requests.get(url, stream=True, timeout=timeout) as r:
      r.raise_for_status()
      data = r.content
    from io import BytesIO
    with Image.open(BytesIO(data)) as im:
      w, h = im.size
      fmt = im.format
      if clen is None:
        clen = len(data)

  return (int(w), int(h)), str(fmt or ''), clen


def probe_local_image(path: Path) -> Tuple[Tuple[int, int], str, int]:
  size = path.stat().st_size
  with Image.open(path) as im:
    return im.size, im.format or '', size


def compliant(w: int, h: int, fmt: str, size_bytes: Optional[int]) -> Tuple[bool, list[str]]:
  reasons = []
  fmt_u = (fmt or '').upper()
  if fmt_u not in ALLOWED_FORMATS:
    reasons.append(f'format={fmt_u} not in {sorted(ALLOWED_FORMATS)}')

  if w >= h:
    if w > 1920 or h > 1080:
      reasons.append(f'resolution {w}x{h} exceeds landscape max 1920x1080')
  else:
    if w > 1080 or h > 1920:
      reasons.append(f'resolution {w}x{h} exceeds portrait max 1080x1920')

  if size_bytes is not None and size_bytes > MAX_BYTES:
    reasons.append(f'file_size {size_bytes} > {MAX_BYTES}')

  return (len(reasons) == 0), reasons


def target_box(w: int, h: int) -> Tuple[int, int]:
  return (1920, 1080) if w >= h else (1080, 1920)


def ensure_repliz_dir():
  REPLIZ_DIR.mkdir(parents=True, exist_ok=True)


def resize_to_repliz(src_path: Path, dst_path: Path, box: Tuple[int, int]):
  with Image.open(src_path) as im:
    im = im.convert('RGB') if im.mode not in ('RGB',) else im
    im.thumbnail(box, Image.Resampling.LANCZOS)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst_path, format='JPEG', quality=85, optimize=True, progressive=True)


def download_to_tmp(url: str, tmp_dir: Path) -> Path:
  tmp_dir.mkdir(parents=True, exist_ok=True)
  name = url.split('/')[-1].split('?')[0]
  if not name:
    name = 'image.jpg'
  dst = tmp_dir / name
  # ensure unique
  if dst.exists():
    return dst
  with requests.get(url, stream=True, timeout=60) as r:
    r.raise_for_status()
    with open(dst, 'wb') as f:
      for chunk in r.iter_content(chunk_size=1024*1024):
        if chunk:
          f.write(chunk)
  return dst


def main():
  ap = argparse.ArgumentParser()
  ap.add_argument('--resize', action='store_true', help='generate resized variants for noncompliant images')
  ap.add_argument('--limit', type=int, default=0, help='optional limit number of URLs to process')
  args = ap.parse_args()

  urls = gather_urls()
  if args.limit and args.limit > 0:
    urls = urls[: args.limit]

  ensure_repliz_dir()

  audit: list[Dict[str, Any]] = []
  resize_map: Dict[str, Any] = {}

  tmp_dir = Path('/tmp/repliz_media_dl')

  for idx, url in enumerate(urls, 1):
    local = url_to_local_path(url)
    info: Dict[str, Any] = {'url': url, 'index': idx, 'localPath': str(local) if local else None}

    try:
      if local and local.exists():
        (w, h), fmt, size_b = probe_local_image(local)
        info.update({'width': w, 'height': h, 'format': fmt, 'sizeBytes': size_b, 'source': 'local'})
      else:
        (w, h), fmt, clen = probe_remote_image(url)
        info.update({'width': w, 'height': h, 'format': fmt, 'sizeBytes': clen, 'source': 'remote'})

      ok, reasons = compliant(int(info['width']), int(info['height']), str(info['format']), info.get('sizeBytes'))
      info['compliant'] = ok
      info['reasons'] = reasons

      if not ok:
        box = target_box(int(info['width']), int(info['height']))
        info['targetBox'] = box

        # produce resized variant
        if args.resize:
          # choose a dst name based on basename
          base = url.split('/')[-1].split('?')[0]
          if not base.lower().endswith(('.jpg', '.jpeg', '.webp')):
            base = base + '.jpg'
          # normalize extension to .jpg
          base_no_ext = re.sub(r'\.(jpg|jpeg|webp)$', '', base, flags=re.I)
          dst_name = base_no_ext + '.jpg'
          dst_path = REPLIZ_DIR / dst_name

          if local and local.exists():
            src_for_resize = local
          else:
            src_for_resize = download_to_tmp(url, tmp_dir)

          if not dst_path.exists():
            resize_to_repliz(src_for_resize, dst_path, box)

          # verify
          (nw, nh), nfmt, nsize = probe_local_image(dst_path)
          nok, nreasons = compliant(nw, nh, nfmt, nsize)

          resize_map[url] = {
            'newUrl': REPLIZ_URL_BASE + dst_name,
            'dstPath': str(dst_path),
            'newSize': [nw, nh],
            'newBytes': nsize,
            'ok': nok,
            'reasons': nreasons,
            'from': 'local' if (local and local.exists()) else 'remote',
          }

    except Exception as e:
      info['error'] = str(e)

    audit.append(info)

  OUT_AUDIT.parent.mkdir(parents=True, exist_ok=True)
  OUT_AUDIT.write_text(json.dumps({'constraints': {
    'maxLandscape': [1920, 1080],
    'maxPortrait': [1080, 1920],
    'maxBytes': MAX_BYTES,
    'allowedFormats': sorted(ALLOWED_FORMATS),
  }, 'items': audit}, ensure_ascii=False, indent=2), 'utf-8')

  OUT_MAP.parent.mkdir(parents=True, exist_ok=True)
  OUT_MAP.write_text(json.dumps(resize_map, ensure_ascii=False, indent=2), 'utf-8')

  # summary
  total = len(audit)
  bad = sum(1 for x in audit if x.get('compliant') is False)
  err = sum(1 for x in audit if x.get('error'))
  print(f'total={total} noncompliant={bad} errors={err} resize_map={len(resize_map)}')


if __name__ == '__main__':
  main()
