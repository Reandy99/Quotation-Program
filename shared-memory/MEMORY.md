# MEMORY.md — Shared Long-Term Memory

## Identity
- User: Reandy
- Assistant: Exel
- Timezone: Asia/Jakarta (WIB)

## Active Agent Topology
- main: Exel (orchestrator)
- quanxi: Expert coding specialist
- doni: Social media specialist
- heyreandy: Personal branding content specialist (AI automation 101 angle), workspace `/root/.openclaw/workspace-heyreandy`

## Operational Preferences
- Daily GitHub backup of the OpenClaw workspace runs at 23:00 WIB.
- Telegram is used as an admin-capable surface (cron/config control), not just read-only chat.
- Codex/cron jobs should not reference `openai-codex/gpt-5.1` (unsupported in this setup); use a supported Codex model (e.g. `openai-codex/gpt-5.3-codex`).
- Content guardrail: avoid generic openers like "Saya Reandy" at the start of generated posts; lead with a real hook.
- Threads/Repliz formatting guardrail: scheduled Threads copy must use real line breaks (no literal `\\n` / `\\n\\n` sequences) to avoid messy rendering.
- Exel should orchestrate and delegate: coding/infra tasks to Quanxi and social/content tasks to DONI rather than doing everything in the main agent.
- DONI should follow a research-first workflow before producing social/content outputs.
- Quanxi is expected to monitor the VPS/logs and attempt safe, conservative auto-recovery when issues appear.
- Quanxi and DONI each have dedicated workspaces (`workspace-quanxi`, `workspace-doni`) with their own core config files (AGENTS/IDENTITY/USER/TOOLS/HEARTBEAT/MEMORY).
- Additional Telegram bots for DONI and Quanxi are paired and associated with user Telegram ID 514720705.
- Public access is intended to go through the `ocindonesia.my.id` domain using nginx/Cloudflare (DNS setup was in progress as of 2026-04-10).

## Automation & Integrations
- Configuration backups are stored in `/root/.openclaw/workspace/backup-config/` as `config-backup-YYYY-MM-DD.tar.gz` archives containing `openclaw.json`, AGENTS/SOUL/USER/MEMORY, and related core config files; a weekly cron job (`config-backup-weekly`) creates these archives and a guardrail job (`guardrail-config-backup-freshness`) alerts if no recent backup exists.
- Whitepaper social workflow is automated via OpenClaw cron: a morning job at 07:15 WIB generates and schedules LinkedIn (and optional Threads) posts via the Repliz skill using the DONI+Exel SOP, and a nightly job at 22:00 WIB reviews recent Whitepaper posts and prepares a quality report for Reandy.
- Notion Content Log sync is currently manual: this runtime does not have a Notion integration/tool available, so any Notion logging should be prepared as copy-paste entries until Notion is connected.
- The ClawHub `repliz` skill is installed and should be the default for Repliz scheduling and management instead of ad-hoc curl or manual HTTP calls.
- Media handling for Whitepaper (dan akun terkait) sekarang pakai foto yang Reandy upload via Telegram ke VPS; Exel memilih foto yang belum dipakai dalam ±1 bulan (kecuali diminta ulang) dan menjadwalkan post text + image via Repliz, jadi Reandy tidak perlu upload manual di Repliz.
- Whitepaper image hosting experiment via `https://ocindonesia.my.id/media/whitepaper/` exists on the VPS, but as of 2026-04-20 the hostname was not publicly resolvable from the runtime and caused Repliz preview placeholders. For Repliz schedules that need guaranteed public image access, prefer stable public `https://whitepaper.site/images/...` URLs until `ocindonesia.my.id` DNS/public reachability is confirmed.
- n8n 2.15.1 is installed on the VPS and runs as a systemd service, exposing a local HTTP interface on port 5678 protected by basic auth.
- The n8n workflow "Youtube Video to Thread & X Content" (ID `AksEaOHOMxGrNdCj`) is imported but kept inactive until OpenRouter, Apify, and Blotato credentials are provided.

## Second Brain
- The `~/second-brain` Obsidian vault is initialized and under Git version control.
- The `openclaw-memory` entity page in that vault stores a detailed, canonical long-form profile of Reandy, the OpenClaw multi-agent topology, Whitepaper workflows, and guardrails; agents should treat it as the main deep context reference for OpenClaw-related work.

## Notes
- Keep memory concise and operational.
- Store long-term stable facts here.
- Put daily/raw events into memory/YYYY-MM-DD.md.

## Promoted From Short-Term Memory (2026-04-13)

<!-- openclaw-memory-promotion:memory:memory/2026-04-11.md:223:249 -->
- - Candidate: Reflections: Theme: `assistant` kept surfacing across 491 memories.; confidence: 0.99; evidence: memory/.dreams/session-corpus/2026-04-09.txt:2-2, memory/.dreams/session-corpus/2026-04-09.txt:4-4, memory/.dreams/session-corpus/2026-04-09.txt:6-6; note: reflection - confidence: 0.00 - evidence: memory/2026-04-11.md:203-206 - recalls: 0 - status: staged <!-- openclaw:dreaming:light:end --> ## REM Sleep <!-- openclaw:dreaming:rem:start --> ### Reflections - Theme: `user` kept surfacing across 599 memories. - confidence: 0.99 - evidence: memory/2026-04-09.md:1-13, memory/2026-04-09.md:3-6, memory/.dreams/session-corpus/2026-04-09.txt:1-1 - note: reflection - Theme: `assistant` kept surfacing across 591 memories. - confidence: 0.98 - evidence: memory/.dreams/session-corpus/2026-04-09.txt:2-2, memory/.dreams/session-corpus/2026-04-09.txt:4-4, memory/.dreams/session-corpus/2026-04-09.txt:6-6 - note: reflection ### Possible Lasting Truths - No strong candidate truths surfaced. <!-- openclaw:dreaming:rem:end --> - Set up n8n 2.15.1 as a systemd service on the VPS (local HTTP on port 5678 with basic auth). - Imported the "Youtube Video to Thread & X Content" n8n workflow (ID AksEaOHOMxGrNdCj) and left it inactive pending credentials for OpenRouter, Apify, and Blotato. - Created a one-shot cron reminder for 2026-04-11 19:00 WIB to follow up with Reandy about missing Blotato/account details. - Captured preference: Exel should delegate suitable technical tasks to Quanxi and content/copy tasks to DONI instead of doing everything in the main agent. [score=0.826 recalls=5 avg=0.805 source=memory/2026-04-11.md:223-249]

## Promoted From Short-Term Memory (2026-04-13)

<!-- openclaw-memory-promotion:memory:memory/2026-04-10.md:1:12 -->
- # 2026-04-10 - Reandy requested daily GitHub backup for all files at 23:00 WIB. - Reandy wants Telegram to have admin-capable operations (cron/config), not just read-only behavior. - Agent structure clarified: Exel (main orchestrator), Quanxi (coding), DONI (social media). - Reandy requested dedicated per-agent workspaces and complete core files for `workspace-quanxi` and `workspace-doni` (AGENTS/IDENTITY/USER/TOOLS/HEARTBEAT/MEMORY). - Reandy wants Exel to delegate social-media tasks to DONI and technical monitoring tasks to Quanxi. - Reandy wants DONI to be research-first before producing content. - Reandy wants Quanxi to continuously monitor VPS/logs and attempt safe auto-recovery when issues occur. - Additional Telegram bots were provided for DONI and Quanxi, and pairing approvals were confirmed for user Telegram sender ID 514720705. - Public access target set to domain `ocindonesia.my.id` via nginx/Cloudflare; DNS activation was still propagating during this session. [score=0.806 recalls=7 avg=0.443 source=memory/2026-04-10.md:1-12]

## Promoted From Short-Term Memory (2026-04-16)

<!-- openclaw-memory-promotion:memory:memory/2026-04-13.md:652:654 -->
- - Whitepaper social scope is now explicitly: LinkedIn, Threads, and Instagram. Content should be tailored per platform (more visual and concise for Instagram, conversational for Threads, more structured and educational for LinkedIn). - Repliz integration was exercised with a Python script that fetches and summarizes per-account daily posting counts for Whitepaper LinkedIn/Threads/Instagram and HeyReandy Threads based on a "today" window defined in WIB and converted to UTC. - User asked to review and possibly restructure the social-media workflow across agents (Exel, DONI, Quanxi) and wondered if a new dedicated agent is needed to handle current social accounts (Whitepaper + HeyReandy). [score=0.888 recalls=5 avg=0.970 source=memory/2026-04-13.md:652-654]
<!-- openclaw-memory-promotion:memory:memory/2026-04-11.md:208:225 -->
- - Candidate: Assistant: [[reply_to_current]] Iya, **secara umum sudah aman dan rapi** ✅ Tapi masih ada **2 hal pending** biar benar-benar final: 1) **Domain publik (`ocindonesia.my.id`)** Masih nunggu DNS aktif penuh, lalu lanjut setup nginx + `publicUrl`. 2) **Routing strict bot per agent** - confidence: 0.00 - evidence: memory/.dreams/session-corpus/2026-04-10.txt:872-872 - recalls: 0 - status: staged - Candidate: User: [cron:0bec0335-665a-4aa6-9322-1d52931021ae ask-doni-threads-brief] Tanyakan lagi ke Reandy detail brief untuk konten Threads tentang OpenAI (audience, tujuan, tone, panjang, CTA) seperti yang tadi dibahas. Current time: Friday, April 10th, 2026 - 6:31 AM (UTC) / 2026-04-10 - confidence: 0.00 - evidence: memory/.dreams/session-corpus/2026-04-10.txt:873-873 - recalls: 0 - status: staged - Candidate: Assistant: Siap Reandy, lanjut brief konten Threads tentang OpenAI ya. Biar hasilnya pas, jawab singkat poin ini: 1) Audience utama siapa? 2) Tujuan kontennya: edukasi / branding / conversion? 3) Tone: santai (gue-lo), semi-formal, atau formal? 4) Panjang: 5–7 tweet atau 8–12 twe - confidence: 0.00 - evidence: memory/.dreams/session-corpus/2026-04-10.txt:875-875 - recalls: 0 - status: staged - Candidate: Reflections: Theme: `assistant` kept surfacing across 491 memories.; confidence: 0.99; evidence: memory/.dreams/session-corpus/2026-04-09.txt:2-2, memory/.dreams/session-corpus/2026-04-09.txt:4-4, memory/.dreams/session-corpus/2026-04-09.txt:6-6; note: reflection - confidence: 0.00 - evidence: memory/2026-04-11.md:203-206 [score=0.847 recalls=4 avg=0.799 source=memory/2026-04-11.md:208-225]
<!-- openclaw-memory-promotion:memory:memory/2026-04-12.md:1:5 -->
- - Whitepaper social workflow is now fully automated: morning cron (07:15 WIB) generates & schedules fresh content (LinkedIn + optional Threads) via Repliz using DONI+Exel SOP; nightly cron (22:00 WIB) reviews all Whitepaper posts and sends a quality report to Reandy. - Repliz skill from ClawHub (`skills/repliz`) is installed and should be preferred over ad-hoc curl scripts for future Repliz operations. - For now, images for LinkedIn/Threads are *not* auto-uploaded (Cloudflare Images plan not enabled); Exel handles copy + schedule text, Reandy attaches photos manually in Repliz. If storage is added later, Exel should integrate it instead of changing the agreed workflow silently. - Second Brain vault `~/second-brain` is initialized and under Git; an `openclaw-memory` entity page now stores a detailed, persistent profile of Reandy (identity, preferences, OpenClaw multi-agent topology, Whitepaper workflows, and guardrails). Future agent behavior should treat that page as the canonical long-form memory reference for OpenClaw-related context about Reandy. [score=0.826 recalls=4 avg=0.925 source=memory/2026-04-12.md:1-5]
[2026-04-17T00:18:24Z] whitepaper-social-daily | Scheduled LinkedIn+Threads posts + Notion log | LinkedIn 09:45 WIB, Threads 12:30 WIB | agent_used=main
[2026-04-17T02:09:46Z] whitepaper-content-daily-run | Scheduled 3 new LinkedIn + 3 new Threads (text-only) while keeping existing 1+1 | LI: 11:45,14:15,17:15 WIB; TH: 10:30,16:00,19:00 WIB (plus existing LI 09:45, TH 12:30) | agent_used=main

## Promoted From Short-Term Memory (2026-04-18)

<!-- openclaw-memory-promotion:memory:memory/2026-04-14.md:1:5 -->
- # 2026-04-14 - Lanjutan debugging integrasi Repliz: `.env` sudah diisi `REPLIZ_ACCESS_KEY` dan `REPLIZ_SECRET_KEY`, tapi env di proses gateway masih kosong. Perlu investigasi lanjut soal mapping `env.vars` OpenClaw ke skill Repliz sebelum bisa dipakai penuh. Hindari `config.apply`/`update.run` tanpa izin eksplisit. - Agent Dashboard (di `agent-dashboard/`, listen port 4173) kembali di-update hari ini: file `app.js`, `data.json`, `index.html`, `server.js`, dan `style.css` sudah disesuaikan sebagai UI utama untuk status/task multi-agent. [score=0.806 recalls=3 avg=0.982 source=memory/2026-04-14.md:1-5]

[2026-04-17T23:00:00Z] whitepaper-threads-daily | Scheduled 4 Threads posts (text-only) | WIB: 10:15, 13:05, 16:40, 19:20 | agent_used=main
[2026-04-18T14:00:00Z] whitepaper-social-review-nightly | Reviewed last 24h schedules (success+pending) via Repliz for Threads/LinkedIn/IG | Found Threads posts rendered with literal \\n sequences; LinkedIn had 31 pending future posts updated in-window; IG none | agent_used=main

[2026-04-19T14:08:00Z] whatsapp-integration | Enabled WhatsApp channel/plugin + main routing on default account; generated pairing QR in Telegram | pending scan/link completion | agent_used=main
[2026-04-19T15:20:17Z] whitepaper-instagram-30day | Scheduled 9 Instagram album posts for next 30 days via Repliz using VPS-hosted Whitepaper images on ocindonesia media | cadence ~every 3-4 days, 2 photos per post, all pending | agent_used=main
[2026-04-19T22:18:00Z] whitepaper-instagram-media-fix | Recreated 9 pending Instagram schedules for 2026-04-20 through 2026-05-18 using publicly reachable `whitepaper.site/images` URLs after Repliz showed placeholder previews for `ocindonesia.my.id` image links | all 9 pending | agent_used=main

## Promoted From Short-Term Memory (2026-04-20)

<!-- openclaw-memory-promotion:memory:memory/2026-04-15.md:10:15 -->
- - Telegram slash command menu for the default bot was restored by refreshing native command registration and disabling Telegram native skill commands to reduce menu size; core native commands remain enabled. - Whitepaper content workflow now has a guardrail forbidding generic opening hooks like `Saya Reandy` at the start of generated posts; generation prompts were updated and gateway restarted to apply the change. - Pending Whitepaper Repliz schedules for 2026-04-15 were manually cleaned up: posts starting with `Saya Reandy` were replaced, and several weak hooks were strengthened while preserving scheduled publish times. - A dedicated `heyreandy` agent was created with its own workspace at `/root/.openclaw/workspace-heyreandy` for Reandy's personal-brand content focused on calm, practical "AI automation 101" topics like OpenClaw, Claude, AI agents, workflow automation, prompt ops, and useful new AI apps. - Two HeyReandy cron jobs were set up for a daily loop: morning research -> draft -> self-review -> schedule, and nightly review -> insight capture -> next-idea seeding, with Threads content expected to include a visual brief and post-publication reply sprint guidance. - Gateway was restarted on 2026-04-15 to stabilize the new HeyReandy agent model and reload updated HeyReandy daily automation prompts. [score=0.803 recalls=3 avg=1.000 source=memory/2026-04-15.md:10-15]
<!-- openclaw-memory-promotion:memory:memory/2026-04-15.md:14:17 -->
- - Two HeyReandy cron jobs were set up for a daily loop: morning research -> draft -> self-review -> schedule, and nightly review -> insight capture -> next-idea seeding, with Threads content expected to include a visual brief and post-publication reply sprint guidance. - Gateway was restarted on 2026-04-15 to stabilize the new HeyReandy agent model and reload updated HeyReandy daily automation prompts. - `openclaw doctor --non-interactive` reported the HeyReandy agent as active and the restart as successful, with non-blocking follow-up warnings about missing embeddings API key for semantic memory search, two orphan transcript files in the main session store, and gateway runtime depending on an nvm-managed Node installation. [score=0.803 recalls=3 avg=1.000 source=memory/2026-04-15.md:14-17]
