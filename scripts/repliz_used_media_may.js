#!/usr/bin/env node

const ACCOUNTS = {
  linkedin: '69ba44a7bcf47d3964974d41',
  instagram: '69c5142b5f0c5e58b4b4a26e',
  threads: '69db171284ebdfba15c9ab58'
};

const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;
if (!KEY || !SEC) {
  console.error('Missing REPLIZ_ACCESS_KEY or REPLIZ_SECRET_KEY');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${KEY}:${SEC}`).toString('base64');

const TZ = 'Asia/Jakarta';
const WANT_MONTH = process.env.WANT_MONTH || '2026-05';

function baseUrl() {
  return BASE.endsWith('/') ? BASE : BASE + '/';
}

function wibMonth(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get('year')}-${get('month')}`;
}

function mediaKey(m) {
  if (typeof m === 'string') return m;
  if (m && typeof m === 'object') return m.url || m.thumbnail || JSON.stringify(m);
  return String(m);
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

(async () => {
  const used = new Set();
  const perAccount = {};

  for (const [name, id] of Object.entries(ACCOUNTS)) {
    const all = await fetchAll(id);
    const inMonth = all.filter((s) => s?.scheduleAt && wibMonth(s.scheduleAt) === WANT_MONTH);
    perAccount[name] = { accountId: id, count: inMonth.length };

    for (const s of inMonth) {
      const medias = Array.isArray(s.medias) ? s.medias.filter(Boolean) : [];
      for (const m of medias) used.add(mediaKey(m));
    }
  }

  const out = {
    month: WANT_MONTH,
    timezone: TZ,
    perAccount,
    usedMediaCount: used.size,
    usedMedia: Array.from(used)
  };

  const fs = require('fs');
  const path = require('path');
  const outPath = path.resolve('/root/.openclaw/workspace/state/whitepaper/repliz-used-media-may.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  console.log('saved', outPath);
  console.log('usedMediaCount', used.size);
})();
