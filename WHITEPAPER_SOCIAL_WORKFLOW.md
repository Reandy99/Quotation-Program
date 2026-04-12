# Whitepaper Social Workflow (Threads · LinkedIn · Instagram)

Scope: konten untuk brand **White Paper Production** di akun:
- **Threads**: `whitepaper.prod` (Repliz accountId: `69db171284ebdfba15c9ab58`)
- **LinkedIn**: `Whitepaper Production` company page (accountId: `69ba44a7bcf47d3964974d41`)
- **Instagram**: `whitepaper.prod` (accountId: `69c5142b5f0c5e58b4b4a26e`)

Peran:
- **Exel (main)**: orkestrasi, koordinasi agent, eksekusi Repliz (schedule/delete), jaga konsistensi workflow.
- **DONI**: riset & penulisan sosmed (Threads, LinkedIn, IG) dengan pendekatan research‑first.
- **Quanxi**: automasi teknis / integrasi tambahan jika diperlukan (bukan bagian alur harian default).

Cadence & tujuan:
- Target **baseline**: ±1 post per akun **setiap 3–4 hari** (Threads, LinkedIn, IG). Bisa lebih sering kalau ada campaign, tapi ini ritme default.
- Tujuan utama:
  - Bangun brand & trust untuk White Paper Production.
  - Bikin orang penasaran & mau cek **whitepaper.site**.
  - Ujungnya: leads untuk corporate event, company profile, dan layanan terkait.

---

## Workflow 1–9 (Final)

### 1) Ambil konteks & target batch
- Platform aktif batch ini: **Threads + LinkedIn** (IG opsional; bisa ikut untuk visual cutdown).
- Target batch:
  - 1–3 ide konten per platform (bukan per hari; yang penting ritme 3–4 hari sekali per akun).
- Pastikan jelas:
  - Audience: founder / marketer / tim growth / HR / CorpComm B2B.
  - Tujuan batch: trust, edukasi, bikin penasaran, bukan hard-sell.

### 2) Riset cepat (research‑first)
- Cek 1–2 sumber publik:
  - Artikel / blog soal B2B, LinkedIn thought leadership, corporate content.
  - Contoh thread / LinkedIn post yang perform (hook, struktur, gaya bahasa).
- Tarik 3–5 pattern:
  - Format: list, cerita pendek, checklist, opini.
  - Tipe hook yang kuat.
  - Panjang & ritme kalimat.

### 3) Mapping ke konteks White Paper
- Uji tiap pattern: relevan ke salah satu pilar?
  - Corporate **event documentation**.
  - **Company profile** photo/video.
  - **Interior/office** & ruang kerja.
  - Cara kerja White Paper: direct service, long‑term asset, fast delivery.
- Selalu pakai sudut pandang **“saya Reandy”**:
  - Pengalaman nyata di lapangan.
  - Pelajaran dari project.
  - Opini pribadi soal dokumentasi corporate.

### 4) Tentukan ide post batch
- Susun 3–4 tema yang:
  - Saling melengkapi (bukan mengulang kalimat yang sama).
  - Menyentuh kombinasi: cerita, insight, checklist, trust/social proof.
- Bagi platform:
  - **Threads**: lebih ngobrol, santai, bisa multi‑post (thread).
  - **LinkedIn**: lebih rapi, B2B‑ish, tetap personal.
  - **Instagram** (kalau dipakai): caption menyokong visual/event/behind‑the‑scenes.

### 5) Nulis versi Threads
- Persona: **“saya Reandy”**.
- Bahasa: Indonesia, boleh selip istilah English seperlunya.
- Struktur per thread:
  - Hook 1–2 baris.
  - Cerita/insight singkat.
  - 1–2 poin konkret (lesson, checklist, pertanyaan reflektif).
  - Soft CTA (ajak orang share pengalaman / kasih pendapat).
- Aturan gaya:
  - Tanpa em dash ("—").
  - Kalimat tidak bertele‑tele, tapi tetap hangat & manusiawi.
  - Perhatikan limit karakter per post Threads.

### 6) Nulis versi LinkedIn
- Masih persona **“saya Reandy”**, sedikit lebih formal.
- Struktur:
  - Konteks bisnis / observasi.
  - Pengalaman nyata / case kecil.
  - Insight praktis buat marketing/HR/CorpComm.
  - Soft CTA: komentar, share pengalaman, bukan “DM sekarang” / hard CTA.
- Panjang: lebih panjang dari Threads, tapi tetap mudah discan (paragraf pendek, bullet bila perlu).

### 7) Nulis versi Instagram (opsional tapi sudah di‑define)
- Fokus ke **visual utama** (foto event, BTS, detail kantor, portrait, dll.).
- Caption:
  - 1–2 kalimat konteks.
  - 1–2 kalimat insight atau cerita pendek.
  - 1 kalimat soft CTA (misal: ajakan simpan post / cek whitepaper.site).
- Tone tetap: personal, profesional santai, tidak lebay.

### 8) Jadwalkan via Repliz
- Gunakan Repliz API (`https://api.repliz.com/public`) dengan **Access Key / Secret Key** yang sudah dikonfigurasi di server (tidak ditaruh di file ini).
- Platform & accountId:
  - Threads: `69db171284ebdfba15c9ab58`.
  - LinkedIn: `69ba44a7bcf47d3964974d41`.
  - Instagram: `69c5142b5f0c5e58b4b4a26e`.
- Prinsip jadwal:
  - Ritme: **±1 post / 3–4 hari per akun**.
  - Threads: sebar di jam 10.00–20.00 WIB.
  - LinkedIn: sebar di jam kerja 09.30–18.00 WIB.
  - Instagram: ikut slot visual yang relevan (tidak wajib setiap batch).
- Setiap kali posting baru:
  - **Hapus** schedule lama yang mau diganti (di accountId yang sama saja).
  - **Buat schedule baru** dengan teks final hasil langkah 5–7.

### 9) Log & evaluasi
- Simpan ide & teks penting ke **Notion Content Calendar** (Notion = source of truth untuk stok ide & arsip copy).
- Setelah konten tayang:
  - Cek konsistensi persona (“saya Reandy”).
  - Cek variasi topik (tidak muter di poin yang sama terus).
  - Tinjau kekuatan hook & kejelasan CTA.
- Catat 2–3 hal yang mau diperbaiki untuk batch berikut (misal: lebih banyak contoh konkret, pendekkan paragraf pertama, perjelas CTA, dsb.).

---

## Catatan operasional

- **Model untuk DONI**: default `openai-codex/gpt-5.1` khusus tugas sosmed/whitepaper.
- **n8n**: tidak dipakai untuk posting sosmed Whitepaper (Repliz + OpenClaw saja).
- **Perubahan workflow**: kalau ada revisi besar (frekuensi, platform, tone), update file ini dan Notion di saat yang sama supaya tidak ada versi ganda.
