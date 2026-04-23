#!/usr/bin/env python3
import json, re, hashlib
from pathlib import Path

ROOT = Path('/root/.openclaw/workspace')
SRC = ROOT / 'audit' / 'repliz_whitepaper_threads_apr23_may31_before_threadsstyle.json'
OUT = ROOT / 'scripts' / 'whitepaper_threads_threadsstyle_v3_mapping.json'

LINK = 'https://whitepaper.site'


def hpick(key: str, options: list[str]) -> str:
  h = hashlib.md5(key.encode('utf-8')).hexdigest()
  idx = int(h[:8], 16) % len(options)
  return options[idx]


def strip_cta(cap: str) -> str:
  cap = (cap or '').strip()
  cap = re.sub(r'\n\n?Info lengkap:\s*https?://whitepaper\.site\s*$', '', cap, flags=re.IGNORECASE).strip()
  cap = re.sub(r'\n\n?https?://whitepaper\.site\s*$', '', cap, flags=re.IGNORECASE).strip()
  return cap


def finalize(text: str) -> str:
  text = text.strip()
  text = re.sub(r'\n{3,}', '\n\n', text)
  if LINK not in text:
    text += f"\n\n{LINK}"
  # Threads cap
  if len(text) > 500:
    text = text[:497].rstrip() + '…'
  return text


def rewrite(key: str, base: str) -> str:
  b = strip_cta(base)
  low = b.lower()

  # Quick prompt endings (no keyword CTA)
  prompts = [
    "Pernah kejadian?",
    "Setuju?",
    "Yang paling sering miss di event kamu apa?",
    "Yang paling sering bikin konten event kamu ‘flat’ bagian mana?",
    "Kalau kamu HR/GA atau marketing, ini relatable nggak?",
  ]
  prompt = hpick(key + ':p', prompts)

  def with_prompt(t: str) -> str:
    return finalize(t + f"\n\n{prompt}")

  # Categories with multiple variants
  if 'ruangan kosong' in low:
    variants = [
      "Wide shot ruangan kosong itu ngasih sinyal: sepi.\n\nKalau mau trust naik, tunjukin: orang + interaksi + skala.",
      "Kalau foto event kamu cuma ruangan kosong, orang cuma dapet 1 pesan: nggak rame.\n\nCari momen yang ada manusianya.",
      "Ruangan bagus itu penting. Tapi tanpa orang, trust-nya nggak kebangun.\n\nAmbil crowd + reaction + branding shot.",
    ]
    return with_prompt(hpick(key, variants))

  if 'cuma buat arsip' in low or ('arsip' in low and 'aset' in low):
    variants = [
      "Dokumentasi event itu bukan arsip. Itu aset marketing.\n\nHabis event, aset ini yang dipakai buat sales deck, LinkedIn, sampai report internal.",
      "Banyak orang treat dokumentasi kayak folder: simpan, selesai.\n\nPadahal ini ‘amunisi’ paling gampang dipakai ulang.",
      "Kalau dokumentasi cuma jadi arsip, kamu rugi dua kali: bayar event, bayar konten lagi.\n\nBikin output yang bisa dipakai ulang.",
    ]
    return with_prompt(hpick(key, variants))

  if '(bukan album)' in low or 'kebaca sebagai cerita' in low or ('pembuka' in low and 'puncak' in low and 'penutup' in low):
    variants = [
      "Album itu random. Dokumentasi itu bikin orang yang nggak hadir paham.\n\nPakai 3 beat: pembuka, puncak, penutup.",
      "Kalau dokumentasi kamu terasa kayak album, ini yang kurang: alur.\n\n3 beat cukup: pembuka, puncak, penutup.",
      "Orang nggak butuh 50 foto. Mereka butuh ‘cerita’ yang kebaca.\n\nMulai dari pembuka, naik ke puncak, tutup dengan penutup.",
      "Biar konten event kamu kebaca sebagai cerita, bukan dump foto:\nPembuka → Puncak → Penutup.",
    ]
    return with_prompt(hpick(key, variants))

  if low.startswith('checklist'):
    variants = [
      "Kalau besok diminta bikin laporan event, ini 6 foto yang biasanya nyelametin:\n1) wide shot\n2) speaker + audience\n3) close-up ekspresi\n4) logo/signage\n5) networking\n6) BTS tim",
      "6 foto yang paling kepake habis event (bukan yang paling aesthetic):\n- skala (wide)\n- momen utama\n- reaksi\n- branding\n- networking\n- BTS",
      "Kalau kamu cuma boleh bawa pulang 6 jenis foto dari event, ambil ini dulu:\nwide, speaker+audiens, ekspresi, branding, networking, BTS.",
    ]
    return with_prompt(hpick(key, variants))

  if 'sebelum hire' in low or 'tanya 3 hal' in low:
    variants = [
      "Vendor bisa motret? Semua bisa.\n\nYang beda: mereka ngerti output kamu.\nTanya 3 hal ini: output buat apa, momen wajib apa, siapa yang mau diyakinin.",
      "Sebelum hire vendor dokumentasi, jangan tanya gear dulu.\n\nTanya: output dipakai buat apa, momen wajib apa, target audience siapa.",
      "Brief yang kosong bikin hasil kosong.\n\nSebelum hire, pastiin 3 hal ini kebaca: tujuan, momen wajib, audience.",
    ]
    return with_prompt(hpick(key, variants))

  if 'over-edit' in low or 'over edit' in low or 'clean' in low and 'over' in low:
    variants = [
      "Hot take: over-edit itu seringnya buat nutupin momen lemah.\n\nKalau basic-nya beres, edit clean aja udah keliatan premium.",
      "Banyak konten event kelihatan ‘murah’ karena kebanyakan efek.\n\nPremium itu biasanya clean: angle jelas, momen kuat.",
      "Edit itu finishing. Bukan penyelamat.\n\nKalau lighting + momen dapet, kamu nggak butuh edit heboh.",
    ]
    return with_prompt(hpick(key, variants))

  if '30 hari' in low or ('event selesai' in low and 'konten' in low):
    variants = [
      "1 event bisa jadi 30 hari konten. Tapi cuma kalau kamu pecahnya bener.\n\nRecap itu cuma awal.",
      "Event selesai itu bukan akhir konten.\n\nYang menang itu yang bisa repurpose: insight, BTS, highlight hasil.",
      "Kalau kontenmu berhenti di 1 recap, kamu rugi.\n\nPecah jadi: recap, insight, BTS, hasil.",
    ]
    return with_prompt(hpick(key, variants))

  if 'behind the scenes' in low or 'behind-the-scenes' in low or re.search(r'\bbts\b', low):
    variants = [
      "BTS yang rapi itu sinyal profesionalisme.\n\nOrang jadi percaya proses kamu bener, bukan cuma hasilnya bagus.",
      "BTS itu bukan ‘lucu-lucuan’.\n\nKalau diambil rapi, BTS jadi bukti: kamu serius.",
      "Satu foto persiapan yang jelas kadang lebih kuat daripada 10 foto dekor.\n\nItu BTS yang bener.",
    ]
    return with_prompt(hpick(key, variants))

  if 'audio' in low or 'lighting' in low or 'stage' in low:
    variants = [
      "Edit nggak bisa nyelametin lighting yang kacau.\n\nBasic dulu: lighting, audio, stage, crowd.",
      "Kalau konten event kamu terasa ‘flat’, cek basic-nya dulu.\nLighting + audio + stage itu fondasi.",
      "Sebelum mikirin preset, pastiin ini beres: lighting, audio, stage.\nKalau beres, konten auto naik kelas.",
    ]
    return with_prompt(hpick(key, variants))

  if 'briefing' in low or 'brief' in low:
    variants = [
      "Konten premium itu dimulai sebelum event.\n\nBrief yang jelas > edit yang heboh.",
      "Kalau brief-nya ngambang, hasilnya juga ngambang.\n\nMulai dari brief, bukan dari edit.",
      "Biar hasil konsisten, mulai dari brief yang rapi.\nEdit itu terakhir.",
    ]
    return with_prompt(hpick(key, variants))

  if 'satu frame' in low or 'hero shot' in low:
    variants = [
      "1 hero shot yang kuat bisa ngalahin 20 foto biasa.\n\nCari frame yang jawab: siapa, di mana, kenapa penting.",
      "Kalau kamu cuma pilih 1 foto buat sales deck, pilih ‘hero shot’.\nYang konteksnya kebaca.",
      "Satu frame yang kuat itu yang bikin orang berhenti scroll.\nKonteks dulu, baru aesthetic.",
    ]
    return with_prompt(hpick(key, variants))

  if 'persepsi' in low or 'mahal' in low:
    variants = [
      "Di corporate event, yang dibeli itu persepsi.\n\nJadi kontennya harus nunjukin dampak, bukan cuma dekor.",
      "Corporate event mahal karena efeknya, bukan dekor doang.\n\nKontenmu harus nunjukin: skala, energi, kredibilitas.",
      "Kalau event-nya premium, dokumentasinya nggak boleh ‘biasa’.\nPersepsinya harus kebaca.",
    ]
    return with_prompt(hpick(key, variants))

  if 'ekspresi' in low or 'audience' in low and 'ingat' in low:
    variants = [
      "Kalau mau orang inget event kamu, tangkap reaksi audience.\n\nBackdrop itu konteks. Ekspresi itu trust.",
      "Panggung itu penting. Tapi yang bikin event terasa hidup itu ekspresi audience.\n\nAmbil reaction shot.",
      "Satu reaction shot yang kuat sering lebih ‘jualan’ daripada foto dekor.\nEkspresi = bukti.",
    ]
    return with_prompt(hpick(key, variants))

  if 'bukti sosial' in low:
    variants = [
      "Dokumentasi = bukti sosial.\n\nKalau bukti sosialnya lemah, tim sales bakal kerja lebih berat buat jelasin brand kamu.",
      "Kalau kontenmu nggak bikin orang percaya, closing jadi berat.\n\nDokumentasi itu bukti sosial.",
      "Bukti sosial yang bagus itu kelihatan dari orang + momen + skala.\nDokumentasi harus nangkep itu.",
    ]
    return with_prompt(hpick(key, variants))

  if 'cek cepat' in low or ('siapa' in low and 'di mana' in low and 'penting' in low):
    variants = [
      "Quick check sebelum bilang fotonya ‘bagus’:\n- kebaca siapa?\n- kebaca di mana?\n- kebaca kenapa penting?",
      "Kalau 3 hal ini nggak kebaca, orang nggak akan peduli:\nsiapa, di mana, kenapa penting.",
      "Konten event yang kuat itu jelas konteksnya.\nSiapa, di mana, kenapa penting.",
    ]
    return with_prompt(hpick(key, variants))

  if 'konsisten' in low or 'brand kuat' in low:
    variants = [
      "Brand yang keliatan kuat itu konsisten.\n\nTermasuk di dokumentasi event. Kalau naik-turun, trust ikut naik-turun.",
      "Konten yang bikin orang percaya itu bukan 1 post keren.\nTapi konsistensi.\n\nDokumentasi itu bagian dari itu.",
      "Kalau mau hasil konsisten, prosesnya juga harus konsisten.\n\nBukan cuma editnya.",
    ]
    return with_prompt(hpick(key, variants))

  if 'momen paling mahal' in low:
    variants = [
      "Momen paling mahal seringnya bukan di panggung.\n\nJustru di interaksi kecil setelahnya: handshake, ngobrol, networking.",
      "Kalau kamu cuma foto panggung, kamu miss momen yang paling ‘real’.\n\nInteraksi kecil itu yang bikin trust.",
    ]
    return with_prompt(hpick(key, variants))

  if '3 layer' in low:
    variants = [
      "Konten event yang enak ditonton biasanya punya 3 layer:\n1) crowd (skala)\n2) speaker (momen)\n3) detail (kredibilitas)",
      "Kalau konten event kamu terasa flat, cek 3 layer ini:\ncrowd, speaker, detail.",
    ]
    return with_prompt(hpick(key, variants))

  if 'closing' in low:
    variants = [
      "Konten yang bantu closing itu yang bikin orang ‘ngeh’ hasilnya.\nBukan yang paling rame.\n\nOutcome harus kebaca.",
      "Kalau mau closing lebih gampang, jangan cuma show proses.\nShow hasil dan dampaknya.",
    ]
    return with_prompt(hpick(key, variants))

  if 'ngerti event dan ngerti marketing' in low:
    variants = [
      "Ada vendor yang jago motret. Ada vendor yang ngerti marketing.\n\nKalau ketemu yang ngerti dua-duanya, kontenmu jadi siap dipakai buat jualan.",
      "Motret bagus itu satu level.\nMotret yang ngerti marketing itu level lain.",
    ]
    return with_prompt(hpick(key, variants))

  if 'evergreen' in low or 'dipakai ulang' in low:
    variants = [
      "Kalau mau konten yang bisa dipakai ulang, cari yang evergreen.\n\nBukan yang cuma relevan 1 hari.",
      "Evergreen footage itu yang bikin library kamu kepakai berbulan-bulan.\nCari yang konteksnya panjang.",
    ]
    return with_prompt(hpick(key, variants))

  if 'wide shot' in low and 'reaction' in low:
    variants = [
      "2 shot yang paling cepat naikin trust:\nwide (skala) + reaction (emosi).",
      "Kalau kamu cuma boleh ambil 2 jenis shot: wide + reaction.\nDua ini langsung kebaca ‘rame’-nya.",
    ]
    return with_prompt(hpick(key, variants))

  if 'hadir next event' in low:
    variants = [
      "Tes paling jujur: lihat kontenmu, orang kepikiran \"gue pengen hadir next event\" nggak?",
      "Kalau kontenmu bikin orang pengen hadir next event, itu menang.\nItu tujuan dokumentasi.",
    ]
    return with_prompt(hpick(key, variants))

  if 'checklist sebelum event' in low:
    variants = [
      "Pre-event checklist yang sering dilupain (padahal fatal):\n- rundown final\n- lighting siap\n- spot crowd\n- momen wajib",
      "Sebelum event mulai, pastiin ini beres:\nrundown, lighting, spot crowd, momen wajib.",
    ]
    return with_prompt(hpick(key, variants))

  if 'sesudah event' in low:
    variants = [
      "Sesudah event, jangan simpen file doang.\n\nPecah jadi konten per segmen: recap, highlight hasil, BTS, quote.",
      "File banyak tapi nggak kepakai itu masalah paling mahal.\n\nSesudah event: pecah, susun, distribusi.",
    ]
    return with_prompt(hpick(key, variants))

  if 'audit' in low:
    variants = [
      "Mau tau dokumentasi kamu sudah ‘jual’ atau belum?\n\nCoba pilih 5 foto terkuatmu. Kalau bingung, biasanya shot plan-nya belum rapi.",
      "Kalau kamu mau audit cepat, jangan lihat jumlah foto.\nLihat: konteks kebaca nggak?",
    ]
    return with_prompt(hpick(key, variants))

  # Fallback
  first = b.split('\n', 1)[0].strip()
  if len(first) > 130:
    first = first[:127].rstrip() + '…'
  variants = [
    f"Real talk: {first}\n\nKalau kamu mau hasil yang kepakai (bukan sekadar bagus), planning-nya harus ikut marketing-nya.",
    f"{first}\n\nKonten yang kuat itu bukan soal banyak. Tapi soal konteks yang kebaca.",
  ]
  return with_prompt(hpick(key, variants))


def main():
  data = json.loads(SRC.read_text('utf-8'))
  mapping = []
  for it in data['items']:
    if it.get('status') != 'pending':
      continue
    sid = it['scheduleId']
    old = it.get('caption') or ''
    new = rewrite(sid, old)
    if new != old:
      mapping.append({'scheduleId': sid, 'newText': new})

  OUT.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), 'utf-8')
  print('wrote', OUT, 'items', len(mapping))

if __name__ == '__main__':
  main()
