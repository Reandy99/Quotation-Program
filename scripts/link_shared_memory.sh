#!/usr/bin/env bash
set -euo pipefail

SHARED_DIR="${SHARED_DIR:-/root/.openclaw/workspace/shared-memory}"
TARGETS=(
  "/root/.openclaw/workspace"
  "/root/.openclaw/workspace-quanxi"
  "/root/.openclaw/workspace-doni"
)
FILES=(AGENTS.md USER.md MEMORY.md TOOLS.md HEARTBEAT.md)

for t in "${TARGETS[@]}"; do
  mkdir -p "$t"
  for f in "${FILES[@]}"; do
    src="$SHARED_DIR/$f"
    dst="$t/$f"
    # backup non-symlink existing file once
    if [[ -e "$dst" && ! -L "$dst" ]]; then
      cp -f "$dst" "$t/$f.local.bak"
    fi
    ln -sfn "$src" "$dst"
  done
  mkdir -p "$t/memory"
  if [[ ! -L "$t/memory/shared" ]]; then
    ln -sfn "$SHARED_DIR/memory" "$t/memory/shared"
  fi
  echo "Linked shared memory into $t"
done
