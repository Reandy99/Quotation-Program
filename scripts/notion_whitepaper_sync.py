#!/usr/bin/env python3
"""Helpers to log Whitepaper social content into Notion.

Reads static config (token + database id) embedded in this file.
Only used inside this VPS; do NOT commit publicly.
"""

import os
import sys
import json
from datetime import datetime
from typing import Optional, List
import urllib.request

NOTION_TOKEN = "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"
DATABASE_ID = "ee39bb3c3d7543eda8ed6c92bf27810c"
NOTION_VERSION = "2022-06-28"


def _request(method: str, path: str, payload: Optional[dict] = None) -> dict:
    url = f"https://api.notion.com/v1{path}"
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body)


def create_log_entry(
    date: Optional[str],
    platforms: List[str],
    status: str,
    title: str,
    threads_copy: str = "",
    linkedin_copy: str = "",
    instagram_copy: str = "",
    notes: str = "",
) -> dict:
    """Create a new page in the Whitepaper Content Log database.

    - date: ISO date (YYYY-MM-DD) or None for today
    - platforms: e.g. ["Threads", "LinkedIn"]
    - status: one of Draft / Scheduled / Posted / Skipped
    - title: page title in Notion
    """

    if not date:
        date = datetime.utcnow().date().isoformat()

    properties = {
        "Name": {
            "title": [
                {
                    "type": "text",
                    "text": {"content": title},
                }
            ]
        },
        "Date": {
            "date": {"start": date},
        },
        "Platform": {
            "multi_select": [{"name": p} for p in platforms],
        },
        "Status": {
            "select": {"name": status},
        },
        "Threads Copy": {
            "rich_text": [
                {"type": "text", "text": {"content": threads_copy}}
            ]
            if threads_copy
            else [],
        },
        "LinkedIn Copy": {
            "rich_text": [
                {"type": "text", "text": {"content": linkedin_copy}}
            ]
            if linkedin_copy
            else [],
        },
        "Instagram Copy": {
            "rich_text": [
                {"type": "text", "text": {"content": instagram_copy}}
            ]
            if instagram_copy
            else [],
        },
        "Notes": {
            "rich_text": [
                {"type": "text", "text": {"content": notes}}
            ]
            if notes
            else [],
        },
    }

    payload = {
        "parent": {"database_id": DATABASE_ID},
        "properties": properties,
    }
    return _request("POST", "/pages", payload)


def main(argv: list) -> None:
    """Simple CLI for quick manual logging.

    Usage examples:
      python3 notion_whitepaper_sync.py test
    """

    if len(argv) <= 1:
        print("Usage: notion_whitepaper_sync.py [test|title] ...", file=sys.stderr)
        sys.exit(1)

    if argv[1] == "test":
        res = create_log_entry(
            date=None,
            platforms=["Threads", "LinkedIn"],
            status="Draft",
            title="TEST · Whitepaper workflow wiring",
            notes="Created automatically to verify Notion integration from OpenClaw.",
        )
        print(json.dumps({"id": res.get("id"), "url": res.get("url")}, indent=2))
        return

    # Minimal: treat remaining args as title for a Draft log with no copies yet.
    title = " ".join(argv[1:])
    res = create_log_entry(
        date=None,
        platforms=["Threads", "LinkedIn"],
        status="Draft",
        title=title,
    )
    print(json.dumps({"id": res.get("id"), "url": res.get("url")}, indent=2))


if __name__ == "__main__":
    main(sys.argv)
