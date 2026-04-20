#!/usr/bin/env node

// List schedules for a given Repliz account in a given month (WIB) and print compact info.

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const WANT_MONTH = process.env.WANT_MONTH || '2026-05'; // YYYY-MM
const TZ = process.env.TZ || 'Asia/Jakarta';

const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;

if (!ACCOUNT_ID) {
  console.error('Missing ACCOUNT_ID env');
  process.exit(1);
}
if (!KEY || !SEC) {
  console.error('Missing REPLIZ_ACCESS_KEY or REPLIZ_SECRET_KEY');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${KEY}:${SEC}`).toString('base64');

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
    time: `${get('hour')}:${get('minute')}`
  };
}

async function fetchPage(page) {
  const limit = 100;
  const base = BASE.endsWith('/') ? BASE : BASE + '/';
  const url = new URL('schedule', base);
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
    const desc = (x.s.description || x.s.title || '').replace(/\s+/g, ' ').trim();
    const medias = Array.isArray(x.s.medias) ? x.s.medias.filter(Boolean) : [];
    return {
      id: x.s._id || x.s.id,
      wib: `${x.date} ${x.time}`,
      type: x.s.type || null,
      mediaCount: medias.length,
      hero: medias[0] || null,
      textPreview: desc.slice(0, 80)
    };
  });

  console.log(JSON.stringify({ accountId: ACCOUNT_ID, month: WANT_MONTH, count: items.length, items }, null, 2));
})().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
