[2026-04-22 01:01 UTC] healthcheck | Ran daily `openclaw status --deep` | Gateway reachable; Telegram OK; security audit flagged 1 CRITICAL (small model fallback requires sandboxing + web tools disabled) | Exel
[2026-04-22 01:47 UTC] security-fix | Removed small OpenRouter free models (Nemotron 120B/9B/12B-VL) from default model fallbacks; security audit now 0 CRITICAL | Applied via `openclaw config set` + gateway restart; remaining warnings: trustedProxies empty + multi-user heuristic | Exel
[2026-04-22 12:26 UTC] context-tiering | Implemented token-efficient context tiering baseline | Minimized always-loaded context files (AGENTS.md + BOOTSTRAP.md), archived legacy refs, set cron agentTurn jobs to lightContext=true | Exel
[2026-04-22 13:47 UTC] context-tiering | Enabled chat-level lean loading + tool-result pruning | Set agents.defaults.contextInjection=continuation-skip, contextPruning=cache-ttl (2m) with earlier tool-result trimming, and toolResultMaxChars=15000 | Exel
[2026-04-22 14:09 UTC] context-tiering | Added chat router rules + tightened startup context budgets | Added Context Tiering section to AGENTS.md; set agents.defaults.startupContext dailyMemoryDays=1 and tighter contextLimits (memory/tool excerpts) | Exel
[2026-04-22 15:06 UTC] system-packages | Installed pip3 + jq | dnf install python3-pip (pip 23.3.1) and jq 1.7.1 | Exel
[2026-04-22 15:15 UTC] ops | Moved daily VPS/OpenClaw healthcheck cron to Quanxi | cron job system-healthcheck-daily now runs with agentId=quanxi (model xiaomi/mimo-v2-pro) | Exel
[2026-04-22 15:22 UTC] models | Set main chat default to GPT-5.2 and pinned existing cron jobs to Xiaomi Omni | agents.defaults.model.primary=openai-codex/gpt-5.2; updated cron payload.model to xiaomi/mimo-v2-omni | Exel
[2026-04-22 11:27 UTC] ops | Canva access approach (anti-bot) | To edit Canva reliably, use an OpenClaw **node host on the user’s laptop** (real browser) and access gateway privately via **Tailscale Serve** (`*.ts.net`); Tailscale Exit Node is optional and not required for this workflow | Exel

## Promoted From Short-Term Memory (2026-04-23)

<!-- openclaw-memory-promotion:memory:memory/2026-04-17.md:313:315 -->
- - status: staged [score=0.817 recalls=0 avg=0.620 source=memory/2026-04-17.md:297-297]
[2026-04-23 04:57 UTC] ops | Reconfigured OpenClaw for direct VPS access without Tailscale | Set gateway bind to lan, disabled Tailscale mode, allowed direct control UI origin, opened/persisted TCP 18789, verified external HTTP 200 on 43.156.181.204:18789 | Exel
[2026-04-23 05:37 UTC] ops | Moved OpenClaw Control behind HTTPS reverse proxy on VPS | Served Control UI at https://ocindonesia.my.id/openclaw/, set gateway.bind=loopback, basePath=/openclaw, disabled dangerous device-auth bypass, added auth rate limit, removed public firewall access to 18789, verified WhatsApp/Telegram OK | Exel
[2026-04-23 05:47 UTC] ops | Restored normal VPS outbound routing while keeping Tailscale as backup/admin path | Cleared active Tailscale exit node; policy rule 5270/table 52 remains for Tailscale, but default internet egress now uses eth0/main for 8.8.8.8, Telegram 149.154.167.220, and OpenAI 104.18.33.45; SSH public access preserved | Exel
