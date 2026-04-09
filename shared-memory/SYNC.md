# SYNC.md — Shared Memory Sync Guide

This shared-memory hub is used by:
- /root/.openclaw/workspace (main / Exel)
- /root/.openclaw/workspace-quanxi
- /root/.openclaw/workspace-doni

## Local Shared Mode (active now)
Core files are symlinked from each workspace to this directory:
- AGENTS.md
- USER.md
- MEMORY.md
- TOOLS.md
- HEARTBEAT.md

## GitHub Sync Mode (optional)
Use script: `scripts/shared_memory_sync.sh`

Required env:
- `REPO_URL` (e.g. https://github.com/<user>/<repo>.git)
- auth via either:
  - `GITHUB_TOKEN` (script will use HTTPS token auth)
  - existing git credential helper/auth

Commands:
- pull: `bash scripts/shared_memory_sync.sh pull`
- push: `bash scripts/shared_memory_sync.sh push`
- full: `bash scripts/shared_memory_sync.sh full`

## Recommended Cron (optional)
Every 15 minutes push:
`*/15 * * * * REPO_URL=https://github.com/<user>/<repo>.git GITHUB_TOKEN=<token> bash /root/.openclaw/workspace/scripts/shared_memory_sync.sh push >> /tmp/shared-memory-sync.log 2>&1`
