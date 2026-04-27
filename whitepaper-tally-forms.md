# WhitePaper Photography — Tally Forms (Qualified ≤14 hari)

> Tujuan: hanya hitung lead yang **tanggal ≤14 hari** + **budget ≥ minimum**.
> WA tetap pakai nomor di website.

---

## FORM 1 — "WhitePaper Photography — Request Quote (≤14 Hari)"

**Cover / Intro (paste):**

Judul: **Request Quote (≤14 Hari)**

Deskripsi:
"Form ini untuk kebutuhan yang terjadi **dalam 14 hari ke depan**. Isi 1–2 menit supaya kami bisa kasih estimasi cepat dan akurat." 

Catatan kecil:
"Kalau kebutuhan kamu >14 hari, pilih **Tidak** di pertanyaan pertama—nanti kami arahkan ke form plan-ahead."

### Q1 (Gating)
- Tipe: Multiple choice (Ya/Tidak)
- Pertanyaan: **Kebutuhan kamu terjadi dalam 14 hari ke depan?**
- Opsi: **Ya** / **Tidak**
- Required: Yes

**Logic (wajib):**
- Jika jawab **Tidak** → tampilkan block info + link ke Form 2 (dan stop pertanyaan berikutnya).

**Block info ketika "Tidak":**
Teks:
"Untuk kebutuhan >14 hari, isi form ini ya supaya kami bisa bantu planning dari awal."
Tombol/link: **Isi Form Plan-Ahead** → (nanti isi link Form 2)

### Q2 — Kebutuhan
- Tipe: Multiple choice
- Pertanyaan: **Kamu butuh layanan apa?**
- Opsi:
  1) Corporate Event Documentation
  2) Company Profile Photo/Video
  3) Interior & Exterior
  4) Corporate Portrait / Headshot
- Required: Yes

### Q3 — Tanggal & jam
- Tipe: Date + Time (kalau Tally kamu pisah, pakai 2 pertanyaan)
- Pertanyaan: **Tanggal & jam pelaksanaan**
- Required: Yes

### Q4 — Lokasi
- Tipe: Short answer
- Pertanyaan: **Lokasi (kota + venue)**
- Placeholder: "Contoh: SCBD, Jakarta Selatan — The Ritz-Carlton"
- Required: Yes

### Q5 — Estimasi peserta
- Tipe: Multiple choice
- Pertanyaan: **Estimasi peserta / audience**
- Opsi: <50 / 50–100 / 100–300 / 300+
- Required: Yes

### Q6 — Budget range (conditional per layanan)
Bikin 3 pertanyaan budget terpisah (lebih gampang logic-nya), lalu tampilkan sesuai Q2.

**Q6A — Budget Corporate Event**
- Tipe: Multiple choice
- Pertanyaan: **Budget range untuk Corporate Event**
- Opsi: 3–5 jt / 5–8 jt / 8–12 jt / 12+ jt
- Required: Yes
- Logic: tampilkan hanya jika Q2 = Corporate Event Documentation

**Q6B — Budget Company Profile**
- Pertanyaan: **Budget range untuk Company Profile**
- Opsi: 12–20 jt / 20–35 jt / 35+ jt
- Required: Yes
- Logic: tampilkan hanya jika Q2 = Company Profile Photo/Video

**Q6C — Budget Interior**
- Pertanyaan: **Budget range untuk Interior & Exterior**
- Opsi: 5–8 jt / 8–12 jt / 12+ jt
- Required: Yes
- Logic: tampilkan hanya jika Q2 = Interior & Exterior

**(Opsional) Q6D — Budget Headshot**
- Kalau mau diseriusin: 3–5 jt / 5–8 jt / 8+ jt
- Kalau belum mau jualan headshot, boleh diarahkan ke Plan-Ahead.

### Q7 — Nama perusahaan + industri
- Tipe: Short answer
- Pertanyaan: **Nama perusahaan + industri**
- Placeholder: "Contoh: PT ABC — FMCG"
- Required: Yes

### Q8 — PIC
- Tipe: Short answer
- Pertanyaan: **Nama PIC + jabatan**
- Placeholder: "Contoh: Sari — Marketing Manager"
- Required: Yes

### Q9 — WhatsApp
- Tipe: Phone / Short answer
- Pertanyaan: **Nomor WhatsApp PIC**
- Required: Yes

### Q10 — Email kerja
- Tipe: Email
- Pertanyaan: **Email kerja**
- Required: Yes

### Q11 — Brief singkat (optional)
- Tipe: Long answer
- Pertanyaan: **Brief singkat / kebutuhan khusus (optional)**
- Optional

### Q12 — Upload (optional)
- Tipe: File upload
- Pertanyaan: **Upload rundown/brief (optional)**
- Optional

### Thank you page (paste)
Judul: **Thanks!**
Teks:
"Kami akan cek detail kamu. Kalau mau diproses lebih cepat, lanjut chat via WhatsApp dan paste format berikut:"

Template (paste):
"Halo WhitePaper Photography, saya mau request quote.
Kebutuhan:
Tanggal & Jam:
Lokasi:
Estimasi peserta:
Budget range:
Perusahaan:
PIC:
Catatan (optional):"

Tombol: **Chat WhatsApp** → pakai link WA di website (wa.me) yang sudah kamu pakai sekarang.

---

## FORM 2 — "WhitePaper Photography — Plan Ahead (>14 Hari)"

**Intro (paste):**
"Kalau kebutuhan kamu masih >14 hari, isi form ini supaya kami bisa bantu planning dari awal."

Pertanyaan minimal:
1) Layanan yang dibutuhkan (same as Q2)
2) Perkiraan tanggal (date)
3) Kota/area
4) Nama perusahaan + industri
5) Nama PIC + jabatan
6) No WhatsApp
7) Email
8) Notes (optional)

Thank you page:
- Tombol ke WhatsApp (link dari website)

---

## Output link + tracking (nanti dipakai di konten)
Setelah form jadi, kirim ke Exel:
- Link Form 1 (≤14 hari)
- Link Form 2 (>14 hari)

Nanti aku akan pakai query sederhana per platform, contoh:
- `?src=threads`
- `?src=instagram`
- `?src=linkedin`

---

## Next step (opsional, biar kamu dapat notif qualified otomatis)
Kalau kamu mau: Tally → kirim email notif ke Gmail khusus → OpenClaw Gmail hook → aku forward ringkasannya ke Telegram.
