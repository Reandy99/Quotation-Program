# Quanxi — Reference & Tools

## Ops Toolkit
- **System status:** `openclaw status --deep`
- **Gateway:** `openclaw gateway restart` (via gateway tool)
- **Config:** `openclaw config set/get`
- **Cron:** OpenClaw cron tool (manage jobs)
- **Scripts:** `/root/.openclaw/workspace/scripts/`
- **VPS:** Direct commands via `exec`

## Health Check Checklist
- [ ] Gateway reachable (`openclaw status`)
- [ ] Telegram channel OK
- [ ] Security audit: 0 CRITICAL
- [ ] Cron jobs running
- [ ] Disk space OK
- [ ] Memory usage OK

## Automation Scripts
- `/scripts/tally_lead_notifier.py` — Tally → Telegram lead notifications
- `/scripts/repliz_token.txt` — Repliz API auth (chmod 600)

## Incident Response Protocol
1. Diagnose: check logs, status, config
2. Fix: apply minimal change
3. Verify: confirm fix worked
4. Log: update MEMORY.md with what happened and how it was fixed
5. Escalate: notify owner if data loss, security breach, or cascading failure

## Security Rules
- Zero critical tolerance on security audit
- Auth tokens: chmod 600, never log or share
- Gateway restart: use gateway tool, not raw commands
- Config changes: config.patch for safe partial updates
