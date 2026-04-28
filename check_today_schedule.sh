#!/bin/bash
TODAY=$(TZ=Asia/Jakarta date +%Y-%m-%d)
echo "Checking schedule for $TODAY"
if [ -f "/root/.openclaw/workspace/repliz-schedule-index.json" ]; then
  jq -r --arg today "$TODAY" '.[$today][] | "WIB: \(.date) \(.time)\nCaption: \(.caption)\nImages: \(.images)\nAccount: \(.accountId)\n---"' /root/.openclaw/workspace/repliz-schedule-index.json
else
  echo "Index file not found"
fi