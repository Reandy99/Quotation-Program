#!/usr/bin/env bash
set -euo pipefail

# Shared memory Git sync for OpenClaw multi-agent setup
# Syncs only one subdirectory inside a GitHub repo.
# Commands: pull | push | full | sync

CMD="${1:-pull}"
SHARED_DIR="${SHARED_DIR:-/root/.openclaw/workspace/shared-memory}"
REPO_URL="${REPO_URL:-}"
REPO_SUBDIR="${REPO_SUBDIR:-shared-memory}"
CLONE_DIR="${CLONE_DIR:-/root/.openclaw/workspace/.shared-memory-sync-repo}"
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

ensure_clone(){
  require_repo_url
  local url
  url="$(auth_repo_url)"

  if [[ -d "$CLONE_DIR/.git" ]]; then
    git -C "$CLONE_DIR" fetch origin "$BRANCH"
    git -C "$CLONE_DIR" checkout "$BRANCH"
    git -C "$CLONE_DIR" pull --rebase origin "$BRANCH"
  else
    rm -rf "$CLONE_DIR"
    git clone -b "$BRANCH" "$url" "$CLONE_DIR"
  fi

  mkdir -p "$CLONE_DIR/$REPO_SUBDIR"
}

pull_sync(){
  ensure_clone
  log "Pulling shared memory from repo subdir: $REPO_SUBDIR"
  mkdir -p "$SHARED_DIR"
  rm -rf "$SHARED_DIR"/*
  cp -a "$CLONE_DIR/$REPO_SUBDIR/." "$SHARED_DIR/" 2>/dev/null || true
  log "Pull complete"
}

push_sync(){
  ensure_clone
  log "Pushing shared memory to repo subdir: $REPO_SUBDIR"
  mkdir -p "$CLONE_DIR/$REPO_SUBDIR"
  rm -rf "$CLONE_DIR/$REPO_SUBDIR"/*
  cp -a "$SHARED_DIR/." "$CLONE_DIR/$REPO_SUBDIR/" 2>/dev/null || true

  git -C "$CLONE_DIR" add "$REPO_SUBDIR"
  if git -C "$CLONE_DIR" diff --cached --quiet; then
    log "No changes to push"
    return 0
  fi

  git -C "$CLONE_DIR" commit -m "[$AGENT_NAME] shared-memory update $(date '+%F %R')"
  git -C "$CLONE_DIR" push origin "$BRANCH"
  log "Push complete"
}

case "$CMD" in
  pull|sync) pull_sync ;;
  push) push_sync ;;
  full) pull_sync; push_sync ;;
  *) echo "Usage: $0 {pull|push|full|sync}"; exit 1 ;;
esac
