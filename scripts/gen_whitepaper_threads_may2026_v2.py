#!/usr/bin/env python3
import json, re
from pathlib import Path

MAP_PATH = Path(__file__).resolve().parents[1] / 'threads_to_ig_image_map.json'
OUT_PATH = Path(__file__).resolve().parents[1] / 'scripts' / 'whitepaper_threads_may2026_v2.json'

# A small pool of VPS-hosted images to use as complementary shots.
POOL = [
  'https://ocindonesia.my.id/media/whitepaper/DSC09096.jpg',
  'https://ocindonesia.my.id/media/whitepaper/event-REN02053.jpg',
  'https://ocindonesia.my.id/media/whitepaper/photo_2026-04-20_19-48-49.jpg',
  'https://ocindonesia.my.id/media/whitepaper/DSC09281.jpg',
  'https://ocindonesia.my.id/media/whitepaper/DSC09288.jpg',
]

def clean(s: str) -> str:
  return re.sub(r'\s+', ' ', (s or '').strip())

def pick_cta(text: str):
  t = text.lower()
  if 'brief' in t or 'briefing' in t:
    return ('BRIEF', 'Mau template brief 1 halaman? Komen: BRIEF')
  if 'checklist' in t:
    return ('CHECKLIST', 'Mau checklist lengkapnya? Komen: CHECKLIST')
  if '30 hari' in t or 'dipakai ulang' in t or 'pakai ulang' in t or 'evergreen' in t:
    return ('30HARI', 'Mau template “30 hari dari 1 event”? Komen: 30HARI')
  if 'audit' in t:
    return ('AUDIT', 'Kalau mau, aku bisa bantu audit (gratis) 5 foto terbaik kamu. Komen: AUDIT')
  if 'shotlist' in t:
    return ('SHOTLIST', 'Mau contoh shotlist-nya? Komen: SHOTLIST')
  return ('ANGLE', 'Mau aku kirim angle list yang aman buat corporate? Komen: ANGLE')

def add_value(old: str) -> str:
  o = clean(old)
  t = o.lower()
  key, cta = pick_cta(o)

  # Default value lines
  value = 'Biar hasilnya bisa kepakai buat sales deck, LinkedIn, dan laporan internal.'

  if 'ruangan kosong' in t or 'trust' in t or 'bukti sosial' in t:
    value = 'Yang bikin percaya itu: orangnya, energinya, dan skala acaranya kebaca.'
  elif 'cerita' in t or 'kebaca' in t or 'pembuka' in t or 'puncak' in t or 'penutup' in t:
    value = 'Ambil momen pembuka, puncak, penutup. Baru dokumentasi jadi cerita.'
  elif 'bts' in t or 'behind' in t:
    value = 'BTS yang rapi itu bukti proses. Brand jadi kelihatan serius dan profesional.'
  elif 'lighting' in t or 'audio' in t or 'stage' in t:
    value = 'Kalau basic-nya beres (lighting, audio, stage), konten langsung naik kelas.'
  elif 'frame' in t or 'satu frame' in t:
    value = 'Cari 1 “hero shot” yang kuat. Itu yang biasanya paling jualan.'
  elif 'mahal' in t or 'premium' in t:
    value = 'Premium itu seringnya clean: angle bersih, momen dapet, edit secukupnya.'
  elif 'repurpose' in t or 'konten' in t or '30 hari' in t:
    value = 'Jangan berhenti di 1 recap. Pecah jadi insight, BTS, dan highlight hasil.'

  # Compose
  desc = f"{o}\n\n{value}\n\n{cta}"

  # Safety: keep under Threads 500 chars
  if len(desc) > 480:
    desc = desc[:477].rstrip() + '…'
  return desc

def media_obj(url: str, alt: str):
  return {
    'type': 'image',
    'url': url,
    'thumbnail': url,
    'alt': alt,
  }

def main():
  data = json.loads(MAP_PATH.read_text('utf-8'))
  # Filter May 2026 entries
  items = [x for x in data if str(x.get('dateWIB','')).startswith('2026-05-')]
  items = sorted(items, key=lambda x: x['dateWIB'])
  if len(items) != 31:
    raise SystemExit(f'Expected 31 May items, got {len(items)}')

  out = []
  for i, it in enumerate(items):
    date = it['dateWIB']
    hero = it.get('imageUrl')
    # Complementary pick (rotate pool), avoid duplicate
    comp = POOL[i % len(POOL)]
    if comp == hero:
      comp = POOL[(i + 1) % len(POOL)]

    medias = [
      media_obj(hero, 'Foto event corporate (hero).'),
      media_obj(comp, 'Foto event corporate (supporting).'),
    ]

    out.append({
      'scheduleAt': f'{date}T06:05:00.000Z',
      'type': 'image',
      'description': add_value(it.get('oldText','')),
      'medias': medias,
    })

  OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), 'utf-8')
  print('wrote', str(OUT_PATH), 'items', len(out))

if __name__ == '__main__':
  main()
