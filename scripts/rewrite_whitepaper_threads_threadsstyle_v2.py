#!/usr/bin/env python3
import json, re
from pathlib import Path

ROOT = Path('/root/.openclaw/workspace')
SRC = ROOT / 'audit' / 'repliz_whitepaper_threads_apr23_may31_before_threadsstyle.json'
OUT = ROOT / 'scripts' / 'whitepaper_threads_threadsstyle_v2_mapping.json'

LINK = 'https://whitepaper.site'


def strip_cta(cap: str) -> str:
  cap = (cap or '').strip()
  # remove any existing link lines
  cap = re.sub(r'\n\n?Info lengkap:\s*https?://whitepaper\.site\s*$', '', cap, flags=re.IGNORECASE).strip()
  cap = re.sub(r'\n\n?https?://whitepaper\.site\s*$', '', cap, flags=re.IGNORECASE).strip()
  return cap


def mk(text: str) -> str:
  text = text.strip()
  # normalize blank lines
  text = re.sub(r'\n{3,}', '\n\n', text)
  if LINK not in text:
    text += f"\n\nDetail: {LINK}"
  # Threads cap
  if len(text) > 500:
    text = text[:497].rstrip() + '…'
  return text


def rewrite(base: str) -> str:
  b = strip_cta(base)
  low = b.lower()

  # Categories
  if 'ruangan kosong' in low:
    return mk(
      "Wide shot ruangan kosong itu kayak bilang: event-nya sepi.\n\nKalau mau trust naik, tunjukin 3 hal: orangnya, interaksinya, skala acaranya."
    )

  if 'cuma buat arsip' in low or ('arsip' in low and 'aset' in low):
    return mk(
      "Dokumentasi event itu bukan arsip. Itu aset marketing.\n\nKalau habis acara cuma upload lalu lupa, kamu buang aset yang paling gampang dipakai buat sales & employer branding."
    )

  if 'kebaca sebagai cerita' in low or '(bukan album)' in low or ('pembuka' in low and 'puncak' in low and 'penutup' in low):
    return mk(
      "Album itu kumpulan foto. Dokumentasi itu bikin orang yang nggak hadir *ngerti* apa yang terjadi.\n\nPakai 3 beat aja: pembuka, puncak, penutup."
    )

  if low.startswith('checklist'):
    return mk(
      "Kalau besok diminta bikin laporan event, ini 6 foto yang biasanya nyelametin: \n1) wide shot (skala)\n2) speaker + audience\n3) close-up ekspresi\n4) logo/signage\n5) networking\n6) BTS tim"
    )

  if 'sebelum hire' in low or 'tanya 3 hal' in low:
    return mk(
      "Semua vendor bisa bilang: \"bisa, aman.\"\n\nYang penting: mereka ngerti output kamu.\nTanya 3 hal ini: output buat apa, momen wajib apa, siapa yang mau diyakinin."
    )

  if 'over-edit' in low or 'over edit' in low:
    return mk(
      "Hot take: over-edit itu seringnya buat nutupin momen yang lemah.\n\nKalau basic-nya beres (lighting, angle, momen), edit clean aja udah keliatan premium."
    )

  if 'event selesai' in low and ('30 hari' in low or 'dipakai' in low):
    return mk(
      "1 event bisa jadi 30 hari konten. Tapi cuma kalau kamu pecahnya bener.\n\nJangan berhenti di recap. Pecah jadi: insight, BTS, highlight hasil."
    )

  if 'behind the scenes' in low or 'behind-the-scenes' in low or 'bts' in low:
    return mk(
      "BTS yang rapi itu bukan bonus. Itu sinyal: \"tim ini serius\".\n\nSatu momen preparation yang jelas kadang lebih meyakinkan daripada 10 foto dekor."
    )

  if 'audio' in low or 'lighting' in low or 'stage' in low:
    return mk(
      "Edit nggak bisa nyelametin lighting yang kacau.\n\nBasic dulu: lighting, audio, stage, crowd. Kalau ini beres, konten auto naik kelas."
    )

  if 'briefing' in low or 'brief' in low:
    return mk(
      "Konten event yang terasa premium itu dimulai *sebelum* event.\n\nBrief yang jelas > edit yang heboh."
    )

  if 'satu frame' in low or 'hero shot' in low:
    return mk(
      "1 hero shot yang kuat bisa ngalahin 20 foto biasa.\n\nCari frame yang jawab: siapa, di mana, dan kenapa ini penting."
    )

  if 'corporate event mahal' in low or 'persepsi' in low:
    return mk(
      "Di corporate event, yang dibeli itu persepsi.\n\nJadi kontennya harus nunjukin dampak dan energi, bukan cuma dekor."
    )

  if 'ekspresi' in low or 'audience inget' in low:
    return mk(
      "Kalau kamu mau orang inget event kamu, jangan cuma foto panggung.\n\nTangkap ekspresi audience. Itu yang bikin event terasa hidup."
    )

  if 'bukti sosial' in low:
    return mk(
      "Dokumentasi itu bukti sosial.\n\nKalau bukti sosialnya lemah, tim sales bakal kerja lebih berat buat ngejelasin ‘seberapa serius’ brand kamu."
    )

  if 'cek cepat' in low or ('siapa' in low and 'di mana' in low and 'kenapa penting' in low):
    return mk(
      "Quick check sebelum kamu bilang fotonya ‘bagus’:\n- kebaca siapa?\n- kebaca di mana?\n- kebaca kenapa ini penting?\n\nKalau 3 ini nggak kebaca, trust-nya nggak kebangun."
    )

  if 'brand kuat' in low or 'konsisten' in low:
    return mk(
      "Brand terlihat kuat itu bukan dari 1 post yang keren.\nTapi dari konsistensi visualnya.\n\nKalau output dokumentasi kamu naik-turun, orang juga bingung naruh trust-nya."
    )

  if 'momen paling mahal' in low:
    return mk(
      "Momen paling mahal di event seringnya bukan di panggung.\n\nJustru di interaksi kecil setelahnya: handshake, ngobrol, networking. Itu yang keliatan ‘real’."
    )

  if '3 layer' in low:
    return mk(
      "Kalau konten event kamu terasa ‘flat’, biasanya kurang 1 layer.\n\n3 layer yang aman: crowd (skala), speaker (momen), detail (kredibilitas)."
    )

  if 'closing' in low:
    return mk(
      "Konten yang paling bantu closing itu bukan yang paling rame.\n\nTapi yang paling jelas nunjukin hasil: energi, skala, dan outcome-nya kebaca."
    )

  if 'ngerti event dan ngerti marketing' in low:
    return mk(
      "Ada vendor yang jago motret.\nAda vendor yang ngerti marketing.\n\nKalau ketemu yang ngerti dua-duanya, hasilnya beda: konten jadi siap dipakai buat jualan."
    )

  if 'evergreen' in low or 'dipakai ulang' in low:
    return mk(
      "Kalau mau konten yang bisa dipakai ulang, cari footage yang evergreen.\n\nBukan yang cuma relevan 1 hari."
    )

  if 'wide shot' in low and 'reaction' in low:
    return mk(
      "Cara cepat naikin trust dari 1 event: \nwide shot (skala) + reaction shot (emosi).\n\nDua ini bikin orang langsung ‘ngeh’ event-nya serius."
    )

  if 'hadir next event' in low:
    return mk(
      "Tes paling jujur: \nkalau lihat kontenmu, orang kepikiran \"gue pengen hadir next event\" nggak?\n\nKalau iya, dokumentasimu sukses."
    )

  if 'checklist sebelum event' in low:
    return mk(
      "Pre-event checklist yang sering dilupain (padahal fatal):\n- rundown final\n- lighting siap\n- spot crowd\n- momen wajib\n\nKalau ini rapi, kerja di lapangan lebih tenang."
    )

  if 'sesudah event' in low:
    return mk(
      "Sesudah event, jangan simpen file doang.\n\nPecah jadi konten per segmen: recap, highlight hasil, BTS, quote. Baru asetnya ‘kerja’."
    )

  if 'audit' in low:
    return mk(
      "Mau tau dokumentasi kamu sudah ‘jual’ atau belum?\n\nCek 5 foto terkuatmu. Kalau kamu bingung milihnya, biasanya problemnya ada di shot plan."
    )

  # Fallback: keep the core idea but make it punchier
  first = b.split('\n', 1)[0].strip()
  if len(first) > 120:
    first = first[:117].rstrip() + '…'
  return mk(
    f"Real talk: {first}\n\nKalau kamu mau hasil yang kepakai (bukan sekadar bagus), planning-nya harus ikut marketing-nya."
  )


def main():
  data = json.loads(SRC.read_text('utf-8'))
  mapping = []
  for it in data['items']:
    if it.get('status') != 'pending':
      continue
    sid = it['scheduleId']
    old = it.get('caption') or ''
    new = rewrite(old)
    if new != old:
      mapping.append({'scheduleId': sid, 'newText': new})

  OUT.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), 'utf-8')
  print('wrote', OUT, 'items', len(mapping))

if __name__ == '__main__':
  main()
