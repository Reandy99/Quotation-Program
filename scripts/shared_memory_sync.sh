#!/usr/bin/env bash
set -euo pipefail

# Shared memory Git sync for OpenClaw multi-agent setup
# Supports: pull | push | full

CMD="${1:-pull}"
SHARED_DIR="${SHARED_DIR:-/root/.openclaw/workspace/shared-memory}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
AGENT_NAME="${AGENT_NAME:-exel}"

log(){ echo "[$(date '+%F %T')] $*"; }

require_repo_url(){
  if [[ -z "$REPO_URL" ]]; then
    echo "REPO_URL is required (e.g. https://github.com/<user>/<repo>.git)" >&2
    exit 1
  fi
}

auth_repo_url(){
  if [[ -n "${GITHUB_TOKEN:-}" && "$REPO_URL" =~ ^https://github.com/ ]]; then
    echo "$REPO_URL" | sed "s#https://github.com/#https://x-access-token:${GITHUB_TOKEN}@github.com/#"
  else
    echo "$REPO_URL"
  fi
}

pull_sync(){
  require_repo_url
  local url
  url="$(auth_repo_url)"

  if [[ -d "$SHARED_DIR/.git" ]]; then
    log "Pulling latest shared memory..."
    git -C "$SHARED_DIR" fetch origin "$BRANCH"
    git -C "$SHARED_DIR" pull --rebase origin "$BRANCH"
  else
    log "Cloning shared memory repo to $SHARED_DIR"
    rm -rf "$SHARED_DIR"
    git clone -b "$BRANCH" "$url" "$SHARED_DIR"
  fi
}

push_sync(){
  require_repo_url
  if [[ ! -d "$SHARED_DIR/.git" ]]; then
    echo "No git repo at $SHARED_DIR. Run pull first." >&2
    exit 1
  fi

  if git -C "$SHARED_DIR" diff --quiet && git -C "$SHARED_DIR" diff --cached --quiet; then
    log "No changes to push"
    return 0
  fi

  log "Committing shared memory changes"
  git -C "$SHARED_DIR" add -A
  git -C "$SHARED_DIR" commit -m "[$AGENT_NAME] shared-memory update $(date '+%F %R')" || true
  git -C "$SHARED_DIR" push origin "$BRANCH"
}

case "$CMD" in
  pull|sync) pull_sync ;;
  push) push_sync ;;
  full) pull_sync; push_sync ;;
  *) echo "Usage: $0 {pull|push|full|sync}"; exit 1 ;;
esac

log "Done: $CMD"
