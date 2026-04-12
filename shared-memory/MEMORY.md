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
- n8n 2.15.1 is installed on the VPS and runs as a systemd service, exposing a local HTTP interface on port 5678 protected by basic auth.
- The n8n workflow "Youtube Video to Thread & X Content" (ID `AksEaOHOMxGrNdCj`) is imported but kept inactive until OpenRouter, Apify, and Blotato credentials are provided.

## Notes
- Keep memory concise and operational.
- Store long-term stable facts here.
- Put daily/raw events into memory/YYYY-MM-DD.md.
