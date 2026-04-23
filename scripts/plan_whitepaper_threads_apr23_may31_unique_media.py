#!/usr/bin/env python3
import json, re
from pathlib import Path

ROOT = Path('/root/.openclaw/workspace')
CURR = ROOT / 'audit' / 'repliz_whitepaper_threads_apr23_may31_current.json'
OUT_ITEMS = ROOT / 'scripts' / 'whitepaper_threads_apr23_may31_unique_media.json'
OUT_DELETE = ROOT / 'scripts' / 'whitepaper_threads_apr23_may31_delete_ids.json'

# Build candidate image pool by scanning workspace JSON/MD/TXT (excluding node_modules/.git).
SCAN_DIRS = [
  ROOT,
  ROOT / 'audit',
  ROOT / 'scripts',
  ROOT / 'memory',
]

RX = re.compile(r'(https?://ocindonesia\.my\.id/media/whitepaper/[^\s"\)\]]+|https?://whitepaper\.site/images/[^\s"\)\]]+)')

VALID_EXT = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

def sanitize(u: str) -> str | None:
  if not u:
    return None
  # strip common trailing punctuation / escapes from markdown/json
  u = u.strip().strip('`').strip('"').strip("'")
  u = u.rstrip('\\').rstrip('`').rstrip('"').rstrip("'").rstrip(')').rstrip(']').rstrip('>')
  if '...' in u:
    return None
  if '<' in u or '>' in u:
    return None
  if 'nama-file' in u.lower():
    return None
  lower = u.lower()
  if not lower.endswith(VALID_EXT):
    return None
  return u

def load_pool():
  urls = []
  seen = set()

  def scan_file(p: Path):
    try:
      # Skip huge files
      if p.stat().st_size > 8_000_000:
        return
      text = p.read_text('utf-8', errors='ignore')
    except Exception:
      return
    for raw in RX.findall(text):
      u = sanitize(raw)
      if not u:
        continue
      if u not in seen:
        seen.add(u)
        urls.append(u)

  for d in SCAN_DIRS:
    if not d.exists():
      continue
    for p in d.rglob('*'):
      if p.is_dir():
        continue
      sp = str(p)
      if '/node_modules/' in sp or '/.git/' in sp:
        continue
      if p.suffix.lower() not in ('.json', '.md', '.txt'):
        continue
      scan_file(p)

  return urls


def main():
  curr = json.loads(CURR.read_text('utf-8'))
  items = curr['items']
  if len(items) != 39:
    raise SystemExit(f'Expected 39 items in current export, got {len(items)}')

  # Delete list
  delete_ids = [it['scheduleId'] for it in items]

  # Media pool
  pool = load_pool()
  if len(pool) < 78:
    raise SystemExit(f'Need at least 78 unique image URLs, pool has {len(pool)}')

  # Sort pool for stability
  pool = sorted(pool)

  # Create new schedule items mirroring scheduleAt with 2 unique images each.
  out = []
  used = set()
  pi = 0

  def take_one():
    nonlocal pi
    while pi < len(pool) and pool[pi] in used:
      pi += 1
    if pi >= len(pool):
      raise RuntimeError('Ran out of images in pool')
    u = pool[pi]
    used.add(u)
    pi += 1
    return u

  for it in items:
    scheduleAt = it['scheduleAt']
    desc = it['caption']

    img1 = take_one()
    img2 = take_one()

    out.append({
      'scheduleAt': scheduleAt,
      'type': 'image',
      'description': desc,
      'medias': [
        {'type': 'image', 'url': img1, 'thumbnail': img1, 'alt': 'Dokumentasi event corporate (foto 1).'},
        {'type': 'image', 'url': img2, 'thumbnail': img2, 'alt': 'Dokumentasi event corporate (foto 2).'},
      ]
    })

  OUT_ITEMS.write_text(json.dumps(out, ensure_ascii=False, indent=2), 'utf-8')
  OUT_DELETE.write_text(json.dumps(delete_ids, ensure_ascii=False, indent=2), 'utf-8')
  print('wrote', OUT_ITEMS, 'items', len(out))
  print('wrote', OUT_DELETE, 'deleteIds', len(delete_ids))

if __name__ == '__main__':
  main()
