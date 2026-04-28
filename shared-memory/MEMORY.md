# MEMORY.md - Shared Team Memory

> Append-only log across all agents. Each agent logs completed tasks here.

---

## PERMANENT: Whitepaper Production Copywriting Rules
Source: Copywriting Playbook PDF (2026-04-28)
Full guide: `WHITEPAPER_COPY_GUIDE.md` | Examples: `WHITEPAPER_COPY_EXAMPLES.md`

### Brand
Whitepaper Production — jasa foto/video profesional untuk event dokumentasi perusahaan, company profile, product launch, seminar, annual dinner, interior & exterior.
Website: whitepaper.site

### Target Audience
B2B: business owner, HRD, marketing team, corporate communication, event PIC (Jakarta/Tangerang)

### Tone
Profesional, hangat, jelas, percaya diri, manusiawi. Hindari: lebay, salesy, AI-sounding, terlalu santai, terlalu kaku.

### Struktur Copy (Wajib)
1. **Hook** — buka dengan ide/event context, bukan jualan
2. **Story** — momen nyata dari event/foto
3. **Benefit** — kegunaan dokumentasi (publikasi, laporan internal, media sosial, arsip perusahaan, brand communication)
4. **Trust** — gunakan kata: profesional, rapi, natural
5. **CTA** — arahkan ke whitepaper.site

### CTA Wajib
"Lihat portofolio dan estimasi harga di whitepaper.site, lalu hubungi kami untuk diskusi kebutuhan event Anda."
Atau variasi natural yang mengarah ke whitepaper.site.

### Hindari
- Overclaiming: "terbaik", "nomor satu", "paling murah", "best", "number one"
- Fake urgency: "buruan booking sekarang!!!"
- Testimoni palsu, angka tanpa sumber
- Terlalu banyak emoji (maks 2-4 jika channel cocok)
- Generic caption yang bisa dipakai brand mana pun
- Bahasa AI yang robotik

### Kata yang Disukai
rapi, profesional, hangat, momen penting, dokumentasi event, kebutuhan perusahaan, visual yang bisa digunakan kembali, portofolio, estimasi harga, diskusi kebutuhan event

### Format per Channel
- **Instagram:** 100-180 kata, hook+story+benefit+CTA, emoji 2-4 maks
- **LinkedIn:** insight bisnis+problem+solusi+CTA, minim emoji, profesional
- **Threads:** konversasi pendek, satu ide kuat, seperti ngobrol
- **Website:** headline+subheadline+pain point+benefit+CTA
- **Google Ads:** headline pendek+benefit+lokasi+CTA
- **WhatsApp follow-up:** ucapan hangat+ringkasan kebutuhan+next step

### Checklist Sebelum Final
- ✅ CTA ke whitepaper.site jelas
- ✅ Tidak ada overclaiming / fake urgency
- ✅ Ada manfaat bisnis untuk perusahaan
- ✅ Storytelling natural, tidak kepanjangan
- ✅ Target audience jelas (HRD/marketing/business owner/event PIC)
- ✅ Tidak generic / AI-sounding

### Request Format
Channel + Service + Audience + Context + Main message + CTA → 3 variasi (storytelling/concise/conversion) + rekomendasi

---

## Format
`[YYYY-MM-DD HH:MM UTC] task_type | brief summary | result | agent_used`

[2026-04-28 09:30 UTC] scheduling | Fixed all Whitepaper May 2026 Repliz schedules via API: updated CTA to include "whitepaper.site" in every caption (IG=DM, LI=Comment BRIEF, TH=Reply BRIEF), kept existing 160 unique media (0 duplicates), 85 items updated (IG 28 / LI 26 / TH 31), 0 errors | Repliz API create+delete (no edit endpoint exists) | Exel
---
[2026-04-28 08:19 UTC] recovery | stopped conflicting openclaw-tui, patched defaults and all role agents off Xiaomi to OpenAI Codex, restarted gateway | health endpoint live; no openclaw-tui process remains | Exel
[2026-04-28 08:25 UTC] verification | verified gateway health + model config after role-agent patch (port 18789): /health 200 live; gateway running; openclaw.json agents set to openai-codex/gpt-5.2 | ok | Exel
[2026-04-28 08:28 UTC] config | set agents.defaults model primary to xiaomi/mimo-v2.5 | saved to openclaw.json | Exel
[2026-04-28 08:34 UTC] config | updated agents.list per-role model mapping to Xiaomi MiMo (main=v2.5; quanxi/axis/pulse=v2.5-pro; sora=v2-omni; doni/relay/heyreandy=v2.5) | saved to openclaw.json | Exel
[2026-04-28 08:58 UTC] research | Whitepaper platform audit: IG (3 posts/month, too low), Threads (26 posts, text-heavy), LinkedIn (14 posts, good freq). Target market: B2B corporate event documentation buyers (marketing/event managers, Jakarta-Tangerang). Key pain points: event photos die in folders, no distribution system, no ROI measurement. Copywriting recs: IG needs carousel + 3-4x/week; Threads needs more image variety; LinkedIn needs document carousels. Algorithm 2026: LinkedIn penalizes external links -60%, carousel 2-3x dwell time; Threads 73.6% higher engagement than X. | research brief saved to MEMORY | Exel
[2026-04-28 09:06 UTC] review | Reviewed upcoming scheduled Whitepaper posts (2026-04-29..2026-05-05) in Repliz for IG/Threads/LinkedIn: copy themes largely on-system/quality (fits target), but many posts include external link https://whitepaper.site in caption (risky for LinkedIn reach). Found repeated photos in upcoming window and reuse vs past posts; requires dedupe + context alignment before publish. User requested focus only on Whitepaper IG/Threads/LinkedIn and to keep continuity by saving conversation decisions to MEMORY. | pending: propose/execute schedule edits with unique photos + platform-specific copy tweaks | Exel
[2026-04-28 09:23 UTC] scheduling | Edited all Whitepaper May 2026 Repliz schedules (IG/Threads/LinkedIn) via API (create new + delete old): removed external links from captions, appended platform CTA, replaced all medias so every photo basename is unique across the whole month | May pending schedules: 85 (IG 28 / Threads 31 / LinkedIn 26); media uses: 160 unique (0 duplicates); captions contain no http links; CTA present | Exel
[2026-04-28 09:32 UTC] context | Chat decisions: (1) CTA must include "whitepaper.site" as text reference, (2) Photos must match post content at category level, (3) Repliz API has no edit endpoint — use create+delete, (4) Repliz auth: Basic with full secret from credentials file, (5) API response key is "docs" not "rows" | saved for continuity | Exel
[2026-04-28 10:42 UTC] copywriting | Whitepaper copy rules: (1) Softselling style, bukan hard sell, (2) Storytelling tajam/punchy, bukan kaku, (3) JANGAN gunakan em dash (—) di copy manapun, (4) CTA natural: langsung "whitepaper.site" tanpa "DM/Reply/Comment BRIEF", (5) Bahasa Indonesia untuk IG/Threads, English untuk LinkedIn | saved for continuity | Exel
[2026-04-28 11:10 UTC] scheduling | Full photo-first rewrite of all 85 Whitepaper May 2026 Repliz schedules: analyzed 160 photos with image model, categorized into 7 types, wrote matching copy per category x platform (IG/LI/TH), updated via API (create+delete), 0 errors | Categories: culinary 17, industrial 9, fitness 8, interior 14, event 21, office 6, specialized 3, other 7 | Exel
[2026-04-28 11:10 UTC] context | Photo-first approach confirmed by owner: always analyze photo content first, then write copy that matches. Never assign photos by category alone. | saved for continuity | Exel
[2026-04-28 12:05 UTC] copywriting | Research insights: (1) Show don't tell - caption harus spesifik dari isi foto, bukan generic template, (2) B2B buyer butuh evidence bukan promises - "400 guests, zero issues" lebih kuat dari "kami handle semua event", (3) Specific details build credibility - nama warna, posisi, material, bukan "mesin dan tim", (4) Setiap caption harus unik ke fotonya - tidak boleh ada template yang dipake untuk foto berbeda | saved for continuity | Exel
[2026-04-28 12:50 UTC] copywriting | Full rewrite of 85 Whitepaper May 2026 posts: photo-specific copy with professional+warm tone, show-don't-tell approach. Each caption written from actual photo content (not template). Categories: event 36, culinary 17, industrial 12, interior 10, fitness 7, office 1, specialized 1, other 2. Updated via Repliz API: 85 created, 85 deleted, 0 errors. | Exel
[2026-04-28 13:31 UTC] copywriting | Whitepaper Copywriting Playbook loaded from PDF. Saved as WHITEPAPER_COPY_GUIDE.md in workspace. Rules: (1) Trust first, (2) Storytelling from real event context, (3) Specific over generic, (4) Warm but professional, (5) CTA ke whitepaper.site, (6) 3 variations per request (storytelling/concise/conversion), (7) Review checklist before final, (8) Hindari overclaiming/fake urgency/AI-sounding. Format per channel: IG=100-180 kata hook+story+benefit+CTA, LI=insight+problem+solution+CTA, TH=konversasi pendek | Exel
[2026-04-28 13:37 UTC] copywriting | 3 Instagram caption variations approved by owner. Saved as WHITEPAPER_COPY_EXAMPLES.md. Best pattern: Hook (event context) + Story (momen nyata) + Benefit (publikasi/laporan/arsip/media sosial/brand) + Trust (profesional/rapi/natural) + CTA (whitepaper.site). All future Whitepaper copy follows this playbook. | Exel
[2026-04-28 13:45 UTC] scheduling | Full playbook-compliant rewrite of 85 Whitepaper May 2026 Repliz schedules: Hook+Story+Benefit+Trust+CTA structure, photo-specific copy, no overclaiming, no em dash, CTA to whitepaper.site. 85 created, 85 deleted, 0 errors. | Exel
