#!/usr/bin/env node

// Bulk create Repliz schedules from a plan JSON.
// Skips items if the same accountId already has a schedule at the same scheduleAt.

const fs = require('fs');
const path = require('path');

const PLAN_PATH = process.env.PLAN_PATH;
if (!PLAN_PATH) {
  console.error('Missing PLAN_PATH env');
  process.exit(1);
}

const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;

if (!KEY || !SEC) {
  console.error('Missing REPLIZ_ACCESS_KEY or REPLIZ_SECRET_KEY');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${KEY}:${SEC}`).toString('base64');

function baseUrl() {
  return BASE.endsWith('/') ? BASE : BASE + '/';
}

async function fetchPage(accountId, page) {
  const limit = 100;
  const url = new URL('schedule', baseUrl());
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.append('accountIds[]', accountId);
  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchAll(accountId) {
  let page = 1;
  const all = [];
  while (true) {
    const data = await fetchPage(accountId, page);
    if (!data?.docs?.length) break;
    all.push(...data.docs);
    if (data.page >= data.totalPages) break;
    page = data.page + 1;
  }
  return all;
}

async function apiCreate(payload) {
  const url = new URL('schedule', baseUrl());
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`POST HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function normalizeScheduleAt(x) {
  // Accept ISO strings with offset; store as ISO-Z string for consistent comparisons.
  const d = new Date(x);
  if (isNaN(d)) return x;
  return d.toISOString();
}

function buildPayload(item) {
  const p = {
    accountId: item.accountId,
    scheduleAt: normalizeScheduleAt(item.scheduleAt),
    description: item.description || '',
    type: item.type || undefined,
    replies: Array.isArray(item.replies) ? item.replies : []
  };

  if (Array.isArray(item.medias) && item.medias.length) {
    p.medias = item.medias;
  } else if (item.medias && Array.isArray(item.medias) && item.medias.length === 0) {
    p.medias = [];
  }

  // Some accounts accept title; keep empty to be safe.
  if (typeof item.title === 'string') p.title = item.title;

  return p;
}

async function run() {
  const planRaw = fs.readFileSync(PLAN_PATH, 'utf8');
  const plan = JSON.parse(planRaw);
  const items = plan.items || [];

  // Group by accountId.
  const byAccount = new Map();
  for (const it of items) {
    if (!it.accountId || !it.scheduleAt) continue;
    if (!byAccount.has(it.accountId)) byAccount.set(it.accountId, []);
    byAccount.get(it.accountId).push(it);
  }

  const created = [];
  const skipped = [];
  const failed = [];

  for (const [accountId, list] of byAccount.entries()) {
    const existing = await fetchAll(accountId);
    const existingSet = new Set(
      existing
        .filter((s) => s?.scheduleAt)
        .map((s) => normalizeScheduleAt(s.scheduleAt))
    );

    for (const it of list) {
      const at = normalizeScheduleAt(it.scheduleAt);
      if (existingSet.has(at)) {
        skipped.push({ accountId, scheduleAt: at, reason: 'exists' });
        continue;
      }

      try {
        const payload = buildPayload(it);
        const res = await apiCreate(payload);
        const id = res?.id || res?._id || null;
        created.push({ accountId, scheduleAt: at, id, platform: it.platform || null });
        existingSet.add(at);
        // small delay to be gentle
        await new Promise((r) => setTimeout(r, 250));
      } catch (e) {
        failed.push({ accountId, scheduleAt: at, platform: it.platform || null, error: e.message });
      }
    }
  }

  const report = {
    planPath: PLAN_PATH,
    generatedAt: new Date().toISOString(),
    totals: { created: created.length, skipped: skipped.length, failed: failed.length },
    created,
    skipped,
    failed
  };

  const out = path.resolve('/root/.openclaw/workspace/state/whitepaper/repliz-bulk-create-report.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report.totals, null, 2));
  console.log('report', out);
}

run().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
