# MEMORY.md — Shared Long-Term Memory

## Identity
- User: Reandy
- Assistant: Exel
- Timezone: Asia/Jakarta (WIB)

## Active Agent Topology
- main: Exel (orchestrator)
- quanxi: Expert coding specialist
- doni: Social media specialist

## Operational Preferences
- Daily GitHub backup of the OpenClaw workspace runs at 23:00 WIB.
- Telegram is used as an admin-capable surface (cron/config control), not just read-only chat.
- Exel should orchestrate and delegate: coding/infra tasks to Quanxi and social/content tasks to DONI rather than doing everything in the main agent.
- DONI should follow a research-first workflow before producing social/content outputs.
- Quanxi is expected to monitor the VPS/logs and attempt safe, conservative auto-recovery when issues appear.
- Quanxi and DONI each have dedicated workspaces (`workspace-quanxi`, `workspace-doni`) with their own core config files (AGENTS/IDENTITY/USER/TOOLS/HEARTBEAT/MEMORY).
- Additional Telegram bots for DONI and Quanxi are paired and associated with user Telegram ID 514720705.
- Public access is intended to go through the `ocindonesia.my.id` domain using nginx/Cloudflare (DNS setup was in progress as of 2026-04-10).

## Automation & Integrations
- Whitepaper social workflow is automated via OpenClaw cron: a morning job at 07:15 WIB generates and schedules LinkedIn (and optional Threads) posts via the Repliz skill using the DONI+Exel SOP, and a nightly job at 22:00 WIB reviews recent Whitepaper posts and prepares a quality report for Reandy.
- The ClawHub `repliz` skill is installed and should be the default for Repliz scheduling and management instead of ad-hoc curl or manual HTTP calls.
- For now, media handling for Whitepaper posts is text-first: Exel schedules only text via Repliz and Reandy manually attaches images; if a shared image storage service is enabled later, Exel should integrate it explicitly instead of changing the workflow silently.
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
