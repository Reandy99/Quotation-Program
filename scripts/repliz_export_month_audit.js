#!/usr/bin/env node

// Export compact drafts (caption + media urls) for a given month (WIB) for Whitepaper IG/Threads/LinkedIn.

const fs = require('fs');
const path = require('path');

const WANT_MONTH = process.env.WANT_MONTH || '2026-05'; // YYYY-MM
const TZ = process.env.TZ || 'Asia/Jakarta';

const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;

const ACCOUNTS = {
  instagram: { accountId: '69c5142b5f0c5e58b4b4a26e' },
  threads: { accountId: '69db171284ebdfba15c9ab58' },
  linkedin: { accountId: '69ba44a7bcf47d3964974d41' }
};

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
    wib: `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
  };
}

function mediaUrl(m) {
  if (typeof m === 'string') return m;
  if (m && typeof m === 'object') return m.url || m.thumbnail || null;
  return null;
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
    const docs = data?.docs || [];
    if (!docs.length) break;
    all.push(...docs);
    if (data.page >= data.totalPages) break;
    page = data.page + 1;
  }
  return all;
}

async function run() {
  const outDir = path.resolve('/root/.openclaw/workspace/audit');
  fs.mkdirSync(outDir, { recursive: true });

  const summary = { month: WANT_MONTH, timezone: TZ, counts: {}, files: {} };

  for (const [platform, meta] of Object.entries(ACCOUNTS)) {
    const all = await fetchAll(meta.accountId);
    const inMonth = all
      .filter((s) => s?.scheduleAt)
      .map((s) => ({ s, ...wibParts(s.scheduleAt) }))
      .filter((x) => x.month === WANT_MONTH)
      .sort((a, b) => new Date(a.s.scheduleAt) - new Date(b.s.scheduleAt));

    const items = inMonth.map((x) => {
      const medias = Array.isArray(x.s.medias) ? x.s.medias.filter(Boolean) : [];
      return {
        platform,
        scheduleId: x.s._id || x.s.id,
        scheduleAt: x.s.scheduleAt,
        wib: x.wib,
        status: x.s.status || null,
        caption: x.s.description || x.s.title || '',
        media: medias.map(mediaUrl).filter(Boolean)
      };
    });

    const payload = {
      month: WANT_MONTH,
      timezone: TZ,
      platform,
      accountId: meta.accountId,
      count: items.length,
      items
    };

    const outPath = path.join(outDir, `repliz_whitepaper_${WANT_MONTH}_${platform}_drafts.json`);
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

    summary.counts[platform] = items.length;
    summary.files[platform] = outPath;
  }

  const summaryPath = path.join(outDir, `repliz_whitepaper_${WANT_MONTH}_summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  summary.files.summary = summaryPath;

  console.log(JSON.stringify(summary, null, 2));
}

run().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
