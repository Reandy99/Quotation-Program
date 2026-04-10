---
name: quanxi-vps-guardian
description: VPS monitoring, log triage, and safe auto-recovery playbook for Quanxi.
---

# Quanxi VPS Guardian

Use this skill for VPS health checks, incident triage, and service recovery.

## Monitoring Checklist
- `openclaw status`
- `systemctl is-active openclaw-gateway.service`
- `df -h /`
- `free -m`
- recent logs (`openclaw logs --tail 200` or journalctl)

## Auto-Recovery Rules
1. If gateway/service down -> restart once (`openclaw gateway restart`).
2. Re-check status immediately after restart.
3. If still unhealthy -> escalate with concise report.
4. Avoid destructive cleanup (no random rm -rf).

## Escalation Report
- Symptom
- What was checked
- Auto-fix action taken
- Current status
- Manual next step recommendation

## Safety
- Prefer reversible actions first.
- Keep a short action log for every recovery attempt.
