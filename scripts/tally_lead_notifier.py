#!/usr/bin/env python3
"""Poll Tally form submissions and print one formatted message per new submission.

- Reads Tally API key from: /root/.openclaw/workspace/tmp/tally_api_key.txt
- Polls two forms: MerJlg (≤14 days) and J9VJbY (>14 days)
- Uses afterId per form stored in: /root/.openclaw/workspace/tmp/tally_last_seen.json
- De-dupes by submission_id in sqlite db: /root/.openclaw/workspace/tmp/tally_leads_notified.sqlite3
- Extracts key answers by matching question titles
- Prints messages to stdout (does not send Telegram)

Exit codes:
- 0 success
- non-zero on errors (fail gracefully)
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple


TALLY_API_BASE = "https://api.tally.so"

API_KEY_PATH = "/root/.openclaw/workspace/tmp/tally_api_key.txt"
STATE_JSON_PATH = "/root/.openclaw/workspace/tmp/tally_last_seen.json"
SQLITE_PATH = "/root/.openclaw/workspace/tmp/tally_leads_notified.sqlite3"

FORMS = {
    "MerJlg": {"label": "Request Quote (≤14 hari)", "kind": "LEQ_14"},
    "J9VJbY": {"label": "Plan Ahead (>14 hari)", "kind": "GT_14"},
}


@dataclass
class SubmissionMsg:
    form_id: str
    submission_id: str
    submitted_at: str
    text: str


def eprint(*args: Any) -> None:
    print(*args, file=sys.stderr)


def read_api_key(path: str = API_KEY_PATH) -> str:
    try:
        with open(path, "r", encoding="utf-8") as f:
            key = f.read().strip()
    except FileNotFoundError:
        raise RuntimeError(f"API key file not found: {path}")

    if not key:
        raise RuntimeError(f"API key file is empty: {path}")
    return key


def load_state(path: str = STATE_JSON_PATH) -> Dict[str, Dict[str, str]]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return {}
        # normalize
        out: Dict[str, Dict[str, str]] = {}
        for form_id, v in data.items():
            if isinstance(form_id, str) and isinstance(v, dict):
                after_id = v.get("afterId")
                if isinstance(after_id, str) and after_id:
                    out[form_id] = {"afterId": after_id}
        return out
    except FileNotFoundError:
        return {}
    except Exception as ex:
        raise RuntimeError(f"Failed to load state JSON {path}: {ex}")


def save_state(state: Dict[str, Dict[str, str]], path: str = STATE_JSON_PATH) -> None:
    tmp = path + ".tmp"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, path)


def init_db(path: str = SQLITE_PATH) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS notified (
            submission_id TEXT PRIMARY KEY,
            form_id TEXT NOT NULL,
            submitted_at TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notified_form ON notified(form_id)")
    conn.commit()
    return conn


def is_notified(conn: sqlite3.Connection, submission_id: str) -> bool:
    cur = conn.execute("SELECT 1 FROM notified WHERE submission_id = ? LIMIT 1", (submission_id,))
    return cur.fetchone() is not None


def mark_notified(conn: sqlite3.Connection, form_id: str, submission_id: str, submitted_at: str) -> None:
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "INSERT OR IGNORE INTO notified(submission_id, form_id, submitted_at, created_at) VALUES(?,?,?,?)",
        (submission_id, form_id, submitted_at, now),
    )
    conn.commit()


def http_get_json(url: str, token: str, max_attempts: int = 4, timeout: int = 30) -> Any:
    """GET JSON with minimal backoff for 429/5xx."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "openclaw-tally-lead-notifier/1.0",
    }

    backoff = 1.5
    last_err: Optional[Exception] = None
    for attempt in range(1, max_attempts + 1):
        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                return json.loads(body)
        except urllib.error.HTTPError as ex:
            last_err = ex
            status = getattr(ex, "code", None)
            retry_after = ex.headers.get("Retry-After") if ex.headers else None

            # 429 or transient 5xx
            if status in (429, 500, 502, 503, 504):
                sleep_s = None
                if retry_after:
                    try:
                        sleep_s = float(retry_after)
                    except Exception:
                        sleep_s = None
                if sleep_s is None:
                    sleep_s = backoff
                    backoff = min(backoff * 2, 30)

                if attempt < max_attempts:
                    time.sleep(sleep_s)
                    continue

            # non-retry or exhausted
            try:
                err_body = ex.read().decode("utf-8", errors="replace")
            except Exception:
                err_body = ""
            raise RuntimeError(f"HTTP {status} for {url}: {err_body[:500]}")
        except Exception as ex:
            last_err = ex
            if attempt < max_attempts:
                time.sleep(backoff)
                backoff = min(backoff * 2, 30)
                continue
            raise RuntimeError(f"Request failed for {url}: {ex}")

    raise RuntimeError(f"Request failed for {url}: {last_err}")


def list_submissions(form_id: str, token: str, after_id: Optional[str]) -> Dict[str, Any]:
    q = {
        "filter": "completed",
        "limit": 50,
    }
    if after_id:
        q["afterId"] = after_id

    url = f"{TALLY_API_BASE}/forms/{urllib.parse.quote(form_id)}/submissions?{urllib.parse.urlencode(q)}"
    data = http_get_json(url, token=token)
    if not isinstance(data, dict):
        raise RuntimeError(f"Unexpected list response type for {form_id}")
    return data


def normalize_title(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    return s


def title_score(title_norm: str, keywords: Iterable[str]) -> int:
    score = 0
    for kw in keywords:
        if kw in title_norm:
            score += 1
    return score


def pick_answer_field(answer: Any, formatted: Optional[str]) -> str:
    if formatted:
        return str(formatted).strip()

    if answer is None:
        return ""
    if isinstance(answer, (str, int, float, bool)):
        return str(answer).strip()
    if isinstance(answer, list):
        # e.g. multi select
        parts = [str(x).strip() for x in answer if str(x).strip()]
        return ", ".join(parts)
    if isinstance(answer, dict):
        # unknown shape; try common keys
        for k in ("value", "label", "name"):
            if k in answer and isinstance(answer[k], (str, int, float)):
                return str(answer[k]).strip()
        return json.dumps(answer, ensure_ascii=False)
    return str(answer).strip()


def build_question_maps(questions: List[Dict[str, Any]]) -> Tuple[Dict[str, str], Dict[str, str]]:
    """Return (questionId->title, titleNorm->questionId best-effort)."""
    qid_to_title: Dict[str, str] = {}
    title_to_qid: Dict[str, str] = {}

    for q in questions:
        qid = q.get("id")
        title = q.get("title")
        if isinstance(qid, str) and isinstance(title, str) and title.strip():
            qid_to_title[qid] = title.strip()
            tnorm = normalize_title(title)
            # keep first occurrence
            title_to_qid.setdefault(tnorm, qid)

    return qid_to_title, title_to_qid


def responses_to_title_map(
    questions: List[Dict[str, Any]], responses: List[Dict[str, Any]]
) -> Dict[str, str]:
    qid_to_title, _ = build_question_maps(questions)
    out: Dict[str, str] = {}

    for r in responses:
        qid = r.get("questionId")
        if not isinstance(qid, str):
            continue
        title = qid_to_title.get(qid)
        if not title:
            continue
        answer = pick_answer_field(r.get("answer"), r.get("formattedAnswer"))
        if not answer:
            continue
        out[normalize_title(title)] = answer

    return out


def best_match_value(title_map: Dict[str, str], keyword_sets: List[List[str]]) -> str:
    """Pick the best matched value by scoring title keyword hits across candidate keyword sets."""
    best = (0, "", "")  # score, titleNorm, value
    for tnorm, val in title_map.items():
        for kws in keyword_sets:
            sc = title_score(tnorm, kws)
            if sc > best[0]:
                best = (sc, tnorm, val)
    return best[2] if best[0] > 0 else ""


def fmt_dt_iso(iso_str: str) -> str:
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    except Exception:
        return iso_str


def build_message(form_id: str, submission: Dict[str, Any], questions: List[Dict[str, Any]]) -> SubmissionMsg:
    submission_id = str(submission.get("id") or "").strip()
    submitted_at = str(submission.get("submittedAt") or "").strip()

    responses = submission.get("responses") or []
    if not isinstance(responses, list):
        responses = []

    title_map = responses_to_title_map(questions, responses)

    # keyword sets (Indonesian + English)
    v_target_date = best_match_value(
        title_map,
        [
            ["target", "date"],
            ["tanggal"],
            ["start", "date"],
            ["desired", "date"],
            ["jadwal"],
        ],
    )
    v_area = best_match_value(
        title_map,
        [
            ["kota"],
            ["city"],
            ["area"],
            ["lokasi"],
            ["location"],
            ["wilayah"],
        ],
    )
    v_layanan = best_match_value(
        title_map,
        [
            ["layanan"],
            ["service"],
            ["jasa"],
            ["kebutuhan"],
            ["need"],
        ],
    )
    v_pic = best_match_value(
        title_map,
        [
            ["pic"],
            ["nama"],
            ["name"],
            ["contact", "person"],
        ],
    )
    v_whatsapp = best_match_value(
        title_map,
        [
            ["whatsapp"],
            ["wa"],
            ["phone"],
            ["telp"],
            ["nomor"],
        ],
    )
    v_email = best_match_value(
        title_map,
        [
            ["email"],
            ["e-mail"],
        ],
    )
    v_budget = best_match_value(
        title_map,
        [
            ["budget"],
            ["anggaran"],
            ["biaya"],
            ["harga"],
        ],
    )

    form_label = FORMS.get(form_id, {}).get("label", form_id)
    link = f"{TALLY_API_BASE}/forms/{form_id}/submissions/{submission_id}" if submission_id else ""

    lines: List[str] = []
    lines.append(f"[Tally Lead] {form_label}")
    if submitted_at:
        lines.append(f"Submitted: {fmt_dt_iso(submitted_at)}")
    if v_target_date:
        lines.append(f"Target date: {v_target_date}")
    if v_area:
        lines.append(f"Area: {v_area}")
    if v_layanan:
        lines.append(f"Service: {v_layanan}")
    if v_pic:
        lines.append(f"PIC: {v_pic}")
    if v_whatsapp:
        lines.append(f"WhatsApp: {v_whatsapp}")
    if v_email:
        lines.append(f"Email: {v_email}")
    if v_budget:
        lines.append(f"Budget: {v_budget}")
    if link:
        lines.append(f"Submission API: {link}")

    # always include IDs for dedupe/debug
    if submission_id:
        lines.append(f"submission_id: {submission_id}")

    text = "\n".join(lines)
    return SubmissionMsg(form_id=form_id, submission_id=submission_id, submitted_at=submitted_at, text=text)


def parse_list_payload(data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    questions = data.get("questions") or []
    submissions = data.get("submissions") or []
    if not isinstance(questions, list):
        questions = []
    if not isinstance(submissions, list):
        submissions = []
    # only dict items
    questions = [q for q in questions if isinstance(q, dict)]
    submissions = [s for s in submissions if isinstance(s, dict)]
    return questions, submissions


def sort_by_submitted_at(subs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    def key(s: Dict[str, Any]) -> Tuple[int, str]:
        iso = s.get("submittedAt")
        if isinstance(iso, str):
            try:
                dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return (int(dt.timestamp()), s.get("id") or "")
            except Exception:
                pass
        return (0, s.get("id") or "")

    return sorted(subs, key=key)


def newest_submission_id(subs: List[Dict[str, Any]]) -> str:
    # pick max by submittedAt timestamp; fallback to last item id
    best_ts = -1
    best_id = ""
    for s in subs:
        sid = s.get("id")
        if not isinstance(sid, str):
            continue
        iso = s.get("submittedAt")
        ts = -1
        if isinstance(iso, str):
            try:
                dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                ts = int(dt.timestamp())
            except Exception:
                ts = -1
        if ts > best_ts:
            best_ts = ts
            best_id = sid

    if best_id:
        return best_id

    # fallback
    for s in reversed(subs):
        sid = s.get("id")
        if isinstance(sid, str) and sid:
            return sid
    return ""


def run(baseline: bool) -> int:
    token = read_api_key()
    state = load_state()
    conn = init_db()

    updated_state = dict(state)

    for form_id in FORMS.keys():
        after_id = state.get(form_id, {}).get("afterId")
        data = list_submissions(form_id=form_id, token=token, after_id=after_id)
        questions, submissions = parse_list_payload(data)

        if baseline:
            # set afterId to newest we can see (so next run only new ones)
            newest_id = newest_submission_id(submissions)
            if newest_id:
                updated_state[form_id] = {"afterId": newest_id}
            continue

        # process oldest->newest to keep notifications ordered
        subs_sorted = sort_by_submitted_at(submissions)

        latest_processed_id = after_id or ""
        for sub in subs_sorted:
            sid = sub.get("id")
            if not isinstance(sid, str) or not sid:
                continue

            if is_notified(conn, sid):
                latest_processed_id = sid
                continue

            msg = build_message(form_id=form_id, submission=sub, questions=questions)
            if not msg.submission_id:
                continue

            print(msg.text)

            mark_notified(conn, form_id=form_id, submission_id=msg.submission_id, submitted_at=msg.submitted_at)
            latest_processed_id = msg.submission_id

        if latest_processed_id and latest_processed_id != after_id:
            updated_state[form_id] = {"afterId": latest_processed_id}

    save_state(updated_state)

    # Keep stdout clean: only messages.
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Poll Tally forms and print new submissions.")
    ap.add_argument(
        "--baseline",
        action="store_true",
        help="Only update afterId baseline for each form; do not print messages.",
    )
    args = ap.parse_args()

    try:
        return run(baseline=bool(args.baseline))
    except Exception as ex:
        eprint(f"ERROR: {ex}")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
