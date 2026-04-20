#!/usr/bin/env node

// Fetch full schedule docs for an account for a given month (WIB) and output minimal but complete media arrays.

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const WANT_MONTH = process.env.WANT_MONTH || '2026-05';
const TZ = process.env.TZ || 'Asia/Jakarta';

const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;

if (!ACCOUNT_ID) {
  console.error('Missing ACCOUNT_ID');
  process.exit(1);
}
if (!KEY || !SEC) {
  console.error('Missing REPLIZ_ACCESS_KEY or REPLIZ_SECRET_KEY');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${KEY}:${SEC}`).toString('base64');

function baseUrl() {
  return BASE.endsWith('/') ? BASE : BASE + '/';
}

function wibParts(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return {
    month: `${get('year')}-${get('month')}`,
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
    wib: `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
  };
}

function mediaKey(m) {
  if (typeof m === 'string') return m;
  if (m && typeof m === 'object') return m.url || m.thumbnail || JSON.stringify(m);
  return String(m);
}

async function fetchPage(page) {
  const limit = 100;
  const url = new URL('schedule', baseUrl());
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.append('accountIds[]', ACCOUNT_ID);
  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchAll() {
  let page = 1;
  const all = [];
  while (true) {
    const data = await fetchPage(page);
    if (!data?.docs?.length) break;
    all.push(...data.docs);
    if (data.page >= data.totalPages) break;
    page = data.page + 1;
  }
  return all;
}

(async () => {
  const all = await fetchAll();
  const inMonth = all
    .filter((s) => s?.scheduleAt)
    .map((s) => ({ s, ...wibParts(s.scheduleAt) }))
    .filter((x) => x.month === WANT_MONTH)
    .sort((a, b) => new Date(a.s.scheduleAt) - new Date(b.s.scheduleAt));

  const items = inMonth.map((x) => {
    const mediasRaw = Array.isArray(x.s.medias) ? x.s.medias.filter(Boolean) : [];
    const mediaKeys = mediasRaw.map(mediaKey);
    return {
      id: x.s._id || x.s.id,
      scheduleAt: x.s.scheduleAt,
      wib: x.wib,
      date: x.date,
      time: x.time,
      type: x.s.type || null,
      description: x.s.description || '',
      medias: x.s.medias || [],
      mediaKeys
    };
  });

  console.log(JSON.stringify({ accountId: ACCOUNT_ID, month: WANT_MONTH, count: items.length, items }, null, 2));
})().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
