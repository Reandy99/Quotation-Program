import json, datetime

IG_ID='69c5142b5f0c5e58b4b4a26e'
TZ='Asia/Jakarta'
MONTH='2026-05'
TIME='10:30'

ig=json.load(open('/root/.openclaw/workspace/state/whitepaper/ig-may-2026-full.json'))
li=json.load(open('/root/.openclaw/workspace/state/whitepaper/li-may-2026-full.json'))

# media keys already used in IG (any index)
ig_used=set()
ig_dates=set()
for it in ig['items']:
    ig_dates.add(it['date'])
    for k in it.get('mediaKeys',[]):
        ig_used.add(k)

all_days=[f"{MONTH}-{d:02d}" for d in range(1,32)]
missing=[d for d in all_days if d not in ig_dates]

# candidates from LinkedIn (flatten all mediaKeys) not used in IG
candidates=[]
seen=set()
for it in li['items']:
    for k in it.get('mediaKeys',[]):
        if k in ig_used: continue
        if k in seen: continue
        seen.add(k)
        candidates.append(k)

if len(candidates) < len(missing):
    raise SystemExit(f"Not enough candidates: need {len(missing)}, have {len(candidates)}")

# captions pool (generic, cocok event/corporate)
caps=[
"Konten event yang premium itu bukan kebetulan. Dia hasil dari briefing yang jelas dan eksekusi yang rapi.",
"Kalau dokumentasi event kamu bikin orang langsung paham skala acaranya, trust naik tanpa banyak kata.",
"Momen terbaik seringnya cuma lewat sekali. Makanya kita selalu siapin shotlist dan backup angle.",
"Bukan soal banyak foto, tapi urutan cerita yang kebaca. Itu yang bikin konten terasa hidup.",
"Wide shot buat skala, close-up buat emosi, detail buat kredibilitas. Baru lengkap.",
"Brand yang terlihat premium biasanya konsisten di detail kecil, termasuk dokumentasi.",
"Kalau output akhirnya mau dipakai buat marketing, workflow-nya harus dirancang dari awal.",
"Dokumentasi bukan arsip. Ini aset kepercayaan yang bisa dipakai 30 hari setelah event.",
"Yang bikin visual terasa ‘mahal’ itu rapi. Clean, jelas, dan punya konteks.",
"Kalau kamu mau event kamu terlihat besar, jangan cuma foto dekor. Tunjukin momentum dan interaksi.",
"Konten yang bantu closing biasanya menonjolkan hasil dan dampak, bukan sekadar proses.",
"BTS yang tepat bukan cuma seru, tapi bukti kalau kamu serius dan profesional.",
"Kalau kamu punya event dalam waktu dekat dan mau hasilnya siap jadi konten, DM gue."
]

items=[]
for i,date in enumerate(missing):
    url=candidates[i]
    cap=caps[i % len(caps)]
    scheduleAt=f"{date}T{TIME}:00+07:00"
    items.append({
        "platform":"instagram",
        "accountId": IG_ID,
        "scheduleAt": scheduleAt,
        "type":"image",
        "description": cap,
        "medias":[{"type":"image","url":url,"thumbnail":url,"alt":"Whitepaper Production"}],
        "replies":[]
    })

plan={
  "generatedAt": datetime.datetime.utcnow().isoformat()+"Z",
  "timezone": TZ,
  "month": MONTH,
  "notes": "Fill missing IG days in May 2026 using unique images not already used on IG May schedule (may overlap with LinkedIn).",
  "missingDates": missing,
  "items": items
}

out='/root/.openclaw/workspace/state/whitepaper/ig-may-2026-fill-plan.json'
json.dump(plan, open(out,'w'), ensure_ascii=False, indent=2)
print('wrote', out, 'items', len(items))
print('missing', missing)
