#!/usr/bin/env node

const ACCOUNT_ID = '69ba44a7bcf47d3964974d41'; // LinkedIn
const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;
if (!KEY || !SEC) {
  console.error('Missing REPLIZ_ACCESS_KEY or REPLIZ_SECRET_KEY');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${KEY}:${SEC}`).toString('base64');

const TZ = 'Asia/Jakarta';
const WANT_MONTH = '2026-05';

function wibMonth(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get('year')}-${get('month')}`;
}

async function fetchPage(page) {
  const limit = 100;
  const base = BASE.endsWith('/') ? BASE : (BASE + '/');
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
  const inMonth = all.filter((s) => s?.scheduleAt && wibMonth(s.scheduleAt) === WANT_MONTH);

  let withMedia = 0;
  let mediaCount = 0;
  const mediaSet = new Set();
  const heroSet = new Set();

  for (const s of inMonth) {
    const medias = Array.isArray(s.medias) ? s.medias.filter(Boolean) : [];
    if (medias.length) {
      withMedia++;
      medias.forEach((m) => mediaSet.add(m));
      mediaCount += medias.length;
      heroSet.add(medias[0]);
    }
  }

  console.log(JSON.stringify({
    accountId: ACCOUNT_ID,
    totalInMonth: inMonth.length,
    postsWithMedia: withMedia,
    totalMediaSlots: mediaCount,
    uniqueMediaUrls: mediaSet.size,
    uniqueHeroMediaUrls: heroSet.size
  }, null, 2));
})().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
