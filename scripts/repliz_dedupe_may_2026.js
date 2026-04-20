#!/usr/bin/env node

// Dedupe media URLs across ALL May 2026 schedules (WIB) for Whitepaper accounts.
// Strategy:
// - Prefer keeping duplicates on LinkedIn vs Instagram.
// - Replace all other occurrences with unique images hosted on this VPS (http://43.156.181.204/media/whitepaper/<file>). 
// - Applies changes via DELETE+POST preserving scheduleAt/description/type/replies.

const fs = require('fs');
const path = require('path');

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

const MEDIA_HOST = process.env.MEDIA_HOST || 'http://43.156.181.204';
const MEDIA_DIR = process.env.MEDIA_DIR || '/var/www/ocindonesia/media/whitepaper';

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

function normalizeMedia(m) {
  if (typeof m === 'string') return { url: m, kind: 'string' };
  if (m && typeof m === 'object') return { url: m.url || m.thumbnail || JSON.stringify(m), kind: 'object' };
  return { url: String(m), kind: 'other' };
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

async function apiDelete(id) {
  const url = new URL(`schedule/${id}`, baseUrl());
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: auth } });
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => '');
    throw new Error(`DELETE HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
}

async function apiCreate(payload) {
  const url = new URL('schedule', baseUrl());
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`POST HTTP ${res.status}: ${text.slice(0, 300)}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function buildPayloadFromDoc(doc, newMedias) {
  const payload = {
    accountId: doc.accountId,
    scheduleAt: doc.scheduleAt,
    title: doc.title || '',
    description: doc.description || '',
    type: doc.type || undefined,
    medias: newMedias,
    replies: Array.isArray(doc.replies) ? doc.replies : []
  };
  return payload;
}

function listCandidateUrls() {
  const files = fs.readdirSync(MEDIA_DIR);
  const imgs = files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
  return imgs.map((f) => `${MEDIA_HOST}/media/whitepaper/${encodeURIComponent(f)}`);
}

function priorityKey(occ) {
  // lower is better
  const pr = { linkedin: 0, instagram: 1, threads: 2 };
  const p = pr[occ.account] ?? 9;
  return [p, occ.scheduleAt];
}

function preferKeep(occList, mediaUrl) {
  // Special-case: stage image, keep LinkedIn 2026-05-23 08:00 WIB if present.
  if (mediaUrl.includes('20260420T052336Z-gold-gathering-awakening-stage')) {
    const special = occList.find((o) => o.account === 'linkedin' && o.wib === '2026-05-23 08:00');
    if (special) return special;
  }

  // Otherwise: keep best priority (LinkedIn > IG), earliest scheduleAt.
  const sorted = [...occList].sort((a, b) => {
    const ak = priorityKey(a);
    const bk = priorityKey(b);
    if (ak[0] !== bk[0]) return ak[0] - bk[0];
    return new Date(ak[1]) - new Date(bk[1]);
  });
  return sorted[0];
}

async function run() {
  // Load schedules
  const allByAccount = {};
  for (const [name, id] of Object.entries(ACCOUNTS)) {
    const docs = await fetchAll(id);
    allByAccount[name] = docs.map((d) => ({ ...d, accountId: id }));
  }

  // Filter May
  const mayDocs = [];
  for (const [name, docs] of Object.entries(allByAccount)) {
    for (const d of docs) {
      if (!d.scheduleAt) continue;
      const p = wibParts(d.scheduleAt);
      if (p.month !== WANT_MONTH) continue;
      const medias = Array.isArray(d.medias) ? d.medias.filter(Boolean) : [];
      if (!medias.length) continue;
      mayDocs.push({ account: name, doc: d, wib: p.wib, scheduleAt: d.scheduleAt });
    }
  }

  // Build url -> occurrences
  const occMap = new Map();
  for (const x of mayDocs) {
    const medias = Array.isArray(x.doc.medias) ? x.doc.medias.filter(Boolean) : [];
    medias.forEach((m, idx) => {
      const nm = normalizeMedia(m);
      const url = nm.url;
      const occ = {
        account: x.account,
        accountId: x.doc.accountId,
        scheduleId: x.doc._id || x.doc.id,
        scheduleAt: x.doc.scheduleAt,
        wib: x.wib,
        mediaIndex: idx
      };
      if (!occMap.has(url)) occMap.set(url, []);
      occMap.get(url).push(occ);
    });
  }

  // Decide replacements
  const usedUrls = new Set(occMap.keys());
  const candidatesAll = listCandidateUrls();
  const candidateQueue = candidatesAll.filter((u) => !usedUrls.has(u));

  const replacements = []; // { mediaUrl, replaceOcc, newUrl }
  const keepers = [];

  for (const [mediaUrl, occs] of occMap.entries()) {
    if (occs.length <= 1) continue;
    const keep = preferKeep(occs, mediaUrl);
    keepers.push({ mediaUrl, keep });
    for (const occ of occs) {
      if (occ.scheduleId === keep.scheduleId && occ.mediaIndex === keep.mediaIndex) continue;
      const newUrl = candidateQueue.shift();
      if (!newUrl) {
        throw new Error('Not enough unique candidate images to replace duplicates.');
      }
      replacements.push({ mediaUrl, occ, newUrl });
      usedUrls.add(newUrl);
    }
  }

  // Group replacements by scheduleId
  const bySchedule = new Map();
  for (const r of replacements) {
    const key = `${r.occ.account}|${r.occ.scheduleId}`;
    if (!bySchedule.has(key)) bySchedule.set(key, []);
    bySchedule.get(key).push(r);
  }

  // Build doc lookup
  const docLookup = new Map();
  for (const x of mayDocs) {
    const sid = x.doc._id || x.doc.id;
    docLookup.set(`${x.account}|${sid}`, x.doc);
  }

  const changes = [];

  for (const [key, reps] of bySchedule.entries()) {
    const [account, scheduleId] = key.split('|');
    const doc = docLookup.get(key);
    if (!doc) continue;

    const oldMedias = Array.isArray(doc.medias) ? doc.medias.slice() : [];
    const newMedias = oldMedias.slice();

    for (const r of reps) {
      const idx = r.occ.mediaIndex;
      const old = newMedias[idx];
      if (typeof old === 'string') {
        newMedias[idx] = r.newUrl;
      } else if (old && typeof old === 'object') {
        newMedias[idx] = { ...old, url: r.newUrl, thumbnail: r.newUrl, alt: old.alt || 'Whitepaper Production' };
      } else {
        newMedias[idx] = r.newUrl;
      }

      changes.push({
        account,
        scheduleId,
        scheduleAt: doc.scheduleAt,
        wib: wibParts(doc.scheduleAt).wib,
        mediaIndex: idx,
        from: r.mediaUrl,
        to: r.newUrl
      });
    }

    // Apply replace via delete+create
    await apiDelete(scheduleId);
    const created = await apiCreate(buildPayloadFromDoc(doc, newMedias));
    const newId = created?.id || created?._id || null;

    // Update lookup so later operations (shouldn't happen) can reference new id if needed.
    docLookup.delete(key);
    // note: we don't cascade further changes in the same run to new ids.

    // Be gentle
    await new Promise((r) => setTimeout(r, 250));
  }

  const report = {
    month: WANT_MONTH,
    generatedAt: new Date().toISOString(),
    totals: {
      duplicateUrls: keepers.length,
      replacements: replacements.length,
      schedulesModified: bySchedule.size
    },
    keepers,
    changes
  };

  const out = path.resolve('/root/.openclaw/workspace/state/whitepaper/repliz-may-2026-dedupe-report.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report.totals, null, 2));
  console.log('report', out);
}

run().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
