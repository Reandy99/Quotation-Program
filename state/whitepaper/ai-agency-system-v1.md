# Whitepaper AI Agency System v1

Tanggal: 2026-04-19 UTC
Owner: Reandy
Orchestrator: Exel
Mode: full collaboration by default

## 1. Tujuan utama

Membangun sistem AI agency di atas Whitepaper Production yang fokus pada 2 hasil:
1. mendatangkan lead baru
2. meningkatkan conversion menjadi sales

Whitepaper tidak dijual sebagai "AI agency murni".
Posisi yang lebih kuat adalah:

**Whitepaper = production house + AI-powered content and sales system**

Jadi klien tidak hanya membeli foto/video, tapi membeli:
- aset visual
- turunan konten
- sistem distribusi
- sistem follow-up lead

## 2. Kenapa sistem ini masuk akal

Berdasarkan riset terbaru:
- Gartner, 9 Maret 2026: 67 persen B2B buyers prefer rep-free experience, dan 45 persen melaporkan memakai AI dalam pembelian terbaru. Artinya buyer makin self-serve dan perlu buyer support yang low-friction.
- Gartner, 25 Juni 2025: 73 persen B2B buyers actively avoid irrelevant outreach. Jadi outbound harus personal dan relevan, bukan blasting.
- Salesforce State of Sales 2026: AI dan AI agents jadi growth tactic nomor 1 untuk sales teams, terutama untuk mengurangi research dan content creation time.
- LinkedIn B2B Benchmark 2024: social media dan visual content tetap jadi channel inti B2B marketing.
- McKinsey State of AI 2025: kebanyakan organisasi masih macet di pilot, dan yang paling berhasil justru redesign workflow dan menghubungkan AI ke growth, bukan efisiensi saja.

Inference: untuk Whitepaper, sistem terbaik bukan chatbot kompleks dulu, tapi workflow yang menghubungkan konten, CTA, qualification, proposal, dan follow-up.

## 3. Core positioning

### Offer utama
Whitepaper membantu brand B2B punya:
- dokumentasi visual yang rapi dan premium
- konten turunan multi-platform
- sistem distribusi dan follow-up berbasis AI

### Bentuk paket
1. Production Only
   - foto/video shoot
   - editing
   - final assets

2. Production + AI Content
   - shoot
   - editing
   - caption multi-platform
   - repurpose content
   - content plan 2 minggu

3. Production + AI Content + Monthly Lead System
   - shoot bulanan
   - repurpose rutin
   - scheduling
   - CTA/lead capture
   - sales follow-up assets
   - reporting

## 4. Sistem inti yang dibangun

### System A. Content-to-Lead Engine
Tujuan: mengubah 1 project jadi banyak konten yang menarik inbound lead.

Input:
- hasil shoot event/company profile/interior
- project notes
- buyer persona target

Output:
- 3 sampai 5 LinkedIn posts
- 3 sampai 5 Threads posts
- 2 sampai 4 Instagram posts/carousels
- 1 mini case study
- 1 CTA asset ke WhatsApp/form

CTA yang dipakai:
- minta rate card
- minta template brief event
- minta contoh output company profile
- minta checklist dokumentasi event

Success metric:
- inbound DM/WA
- klik ke landing/WA
- jumlah lead magnet request

### System B. Lead Magnet + Qualification Engine
Tujuan: mengubah perhatian jadi lead yang lebih siap jual.

Lead magnet awal yang direkomendasikan:
- template brief dokumentasi event
- checklist shot list corporate event
- panduan memilih vendor dokumentasi corporate
- mini service guide Whitepaper

Flow:
konten -> CTA -> WhatsApp/form -> AI qualification -> tag lead

Tagging lead:
- direct corporate
- EO/agency
- venue/partner
- event
- company profile
- interior/office
- hot / warm / cold
- budget low / mid / high

Success metric:
- jumlah lead qualified
- response time
- meeting booked

### System C. Sales Follow-Up Engine
Tujuan: menaikkan closing dari lead yang sudah masuk.

Flow:
- lead masuk
- AI ringkas kebutuhan lead
- AI sarankan pertanyaan discovery
- AI cocokkan ke paket layanan
- AI draft follow-up
- AI draft proposal/quotation
- AI reminder follow-up jika belum closing

Output:
- discovery summary
- follow-up WhatsApp draft
- proposal outline
- objection-handling notes

Success metric:
- reply rate
- meeting-to-proposal rate
- proposal-to-close rate

### System D. Outbound Personalized Prospecting Engine
Tujuan: cari lead baru secara aktif tanpa spam.

Target awal:
- corporate event organizers internal
- HR/Marcom/Internal Comms
- event agencies
- venue/hotel/ballroom
- coworking/serviced office

Flow:
- kumpulkan 20 sampai 50 target per minggu
- riset konteks singkat tiap target
- buat personalized outreach draft
- approve manual
- kirim via channel yang relevan

Rules:
- jangan full auto blast
- wajib ada riset dan konteks
- fokus ke high-fit target

Success metric:
- positive reply rate
- intro call booked
- partner/vendor meeting booked

### System E. Proof Engine
Tujuan: setiap project jadi senjata jualan berikutnya.

Setelah project selesai, AI bantu ubah menjadi:
- mini case study
- before/after narrative
- client proof post
- sales deck snippet
- follow-up asset ke prospek serupa

Success metric:
- frequency of proof content
- proposal acceptance improvement
- reuse of case studies in sales conversations

## 5. Agent roles

### Exel
Peran:
- orchestrator
- final reviewer
- task router
- KPI tracker
- output final ke user

Tanggung jawab:
- memastikan semua engine nyambung
- menentukan prioritas lead vs content vs ops
- menjaga kualitas output final

### DONI
Peran:
- research-first content strategist
- messaging and positioning specialist

Tanggung jawab:
- buyer research
- content angle
- hooks, captions, CTA
- lead magnet copy
- case study copy
- outbound personalization drafts

### Quanxi
Peran:
- technical systems and automation

Tanggung jawab:
- automasi routing
- lead tracking
- form/WA integration
- proposal generation helper
- reporting pipeline
- monitoring dan debugging

## 6. Funnel yang dipakai

### Funnel 1. Inbound Content Funnel
LinkedIn / IG / Threads -> CTA -> WhatsApp / form -> qualification -> discovery -> proposal -> close

Ini funnel utama untuk 30 hari pertama.

### Funnel 2. Partner Funnel
EO / agency / venue outreach -> pilot project -> referral/vendor partnership -> repeat work

Ini funnel kedua yang dibangun paralel tapi tidak jadi fokus pertama.

## 7. Prioritas implementasi 30 hari

### Phase 1, minggu 1
Bangun dasar lead engine
- definisikan 3 offer utama
- buat 2 lead magnet awal
- tentukan CTA standar
- buat template qualification
- buat struktur tag lead

### Phase 2, minggu 2
Bangun content-to-lead loop
- jadwal konten LinkedIn/IG/Threads yang diarahkan ke CTA
- setiap konten harus punya goal funnel yang jelas
- mulai kumpulkan lead masuk dalam format yang rapi

### Phase 3, minggu 3
Bangun follow-up engine
- template discovery
- template follow-up WA
- template proposal outline
- reminder logic untuk follow-up

### Phase 4, minggu 4
Bangun outbound terukur
- shortlist 20 sampai 30 target terbaik
- riset per target
- personalized outreach draft
- jalankan manual approval loop

## 8. Stack yang cocok dengan sistem kamu sekarang

Yang sudah ada dan bisa dipakai:
- OpenClaw multi-agent: Exel, DONI, Quanxi
- Repliz: scheduling konten
- website Whitepaper / whitepaper.site
- WhatsApp / Telegram routing
- n8n untuk automasi tambahan bila dibutuhkan

Yang perlu dibangun/dirapikan:
- lead intake format tunggal
- lead status tracker
- CTA library
- offer/pricing sheet
- proposal template
- proof/case study repository

## 9. KPI utama

Jangan ukur sukses dari jumlah automasi. Ukur dari:
- jumlah inbound leads per minggu
- qualified leads per minggu
- booked calls per minggu
- proposal keluar per bulan
- close rate
- average deal size
- repeat/referral rate

## 10. Rekomendasi praktis

Mulai dari 3 engine dulu:
1. Content-to-Lead Engine
2. Qualification Engine
3. Follow-Up Engine

Jangan mulai dari chatbot atau dashboard rumit dulu.

## 11. Output berikutnya yang harus dibuat

Setelah blueprint ini, next deliverable yang paling penting adalah:
1. daftar offer final dan positioning
2. CTA library
3. lead qualification form
4. follow-up WhatsApp flow
5. proposal template outline
6. 30-day content plan yang nyambung ke funnel

## Sources
- Gartner, March 9, 2026: https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience
- Gartner, June 25, 2025: https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience
- Salesforce, February 3, 2026: https://www.salesforce.com/news/stories/state-of-sales-report-announcement-2026/
- LinkedIn B2B Marketing Benchmark 2024: https://business.linkedin.com/advertise/resources/b2b-benchmark/2024
- McKinsey, November 5, 2025: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
