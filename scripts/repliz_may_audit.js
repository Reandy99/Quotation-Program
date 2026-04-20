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
const WANT_MONTH = '2026-05';

function partsFmt(iso, opts) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, ...opts }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { get };
}

function wibDateTime(iso) {
  const { get } = partsFmt(iso, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

function wibDate(iso) {
  const { get } = partsFmt(iso, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function wibMonth(iso) {
  const { get } = partsFmt(iso, { year: 'numeric', month: '2-digit' });
  return `${get('year')}-${get('month')}`;
}

async function fetchPage(accountId, page) {
  const limit = 100;
  const base = BASE.endsWith('/') ? BASE : (BASE + '/');
  const url = new URL('schedule', base);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  url.searchParams.append('accountIds[]', accountId);

  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${url}: ${text.slice(0, 200)}`);
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

function mayDays() {
  const days = [];
  for (let i = 1; i <= 31; i++) {
    days.push(`${WANT_MONTH}-${String(i).padStart(2, '0')}`);
  }
  return days;
}

function mapToDupList(mp) {
  const out = [];
  for (const [media, occ] of mp.entries()) {
    if (occ.length > 1) out.push({ media, count: occ.length, occurrences: occ });
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

async function run() {
  const result = {
    month: WANT_MONTH,
    timezone: TZ,
    accounts: {},
    totals: {},
    duplicates: { anyMedia: [], heroMedia: [] },
    days: {}
  };

  const mediaMap = new Map();
  const heroMap = new Map();
  const dayAny = new Map();

  for (const [name, id] of Object.entries(ACCOUNTS)) {
    const all = await fetchAll(id);
    const inMonth = all.filter((s) => s?.scheduleAt && wibMonth(s.scheduleAt) === WANT_MONTH);

    result.accounts[name] = { accountId: id, totalAll: all.length, totalInMonth: inMonth.length };

    for (const s of inMonth) {
      const day = wibDate(s.scheduleAt);
      dayAny.set(day, (dayAny.get(day) || 0) + 1);

      const medias = Array.isArray(s.medias) ? s.medias.filter(Boolean) : [];
      medias.forEach((m, idx) => {
        const key = (typeof m === 'string') ? m : (m && typeof m === 'object' ? (m.url || m.thumbnail || JSON.stringify(m)) : String(m));
        const occ = {
          account: name,
          accountId: id,
          scheduleId: s._id || s.id,
          scheduleAt: s.scheduleAt,
          wib: wibDateTime(s.scheduleAt),
          mediaIndex: idx
        };

        if (!mediaMap.has(key)) mediaMap.set(key, []);
        mediaMap.get(key).push(occ);

        if (idx === 0) {
          if (!heroMap.has(key)) heroMap.set(key, []);
          heroMap.get(key).push(occ);
        }
      });
    }
  }

  const allDays = mayDays();
  const missingDays = allDays.filter((d) => !dayAny.has(d));

  result.days = {
    totalDays: allDays.length,
    daysWithAnyPost: dayAny.size,
    missingDays
  };

  result.duplicates.anyMedia = mapToDupList(mediaMap).slice(0, 50);
  result.duplicates.heroMedia = mapToDupList(heroMap).slice(0, 50);

  result.totals = {
    duplicateAnyMediaCount: result.duplicates.anyMedia.length,
    duplicateHeroMediaCount: result.duplicates.heroMedia.length
  };

  const fs = require('fs');
  const path = require('path');
  const outPath = path.resolve('/root/.openclaw/workspace/state/whitepaper/repliz-may-2026-audit.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log('saved', outPath);
  console.log('missingDays', missingDays);
  console.log('dupAny', result.totals.duplicateAnyMediaCount, 'dupHero', result.totals.duplicateHeroMediaCount);
  if (result.duplicates.anyMedia.length) {
    console.log(
      'topDupAny',
      result.duplicates.anyMedia.slice(0, 10).map((d) => ({ count: d.count, media: d.media }))
    );
  }
}

run().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
