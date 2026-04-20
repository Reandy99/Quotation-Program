#!/usr/bin/env node

// Replace media for a single LinkedIn schedule (Whitepaper) by WIB date+time.

const ACCOUNT_ID = '69ba44a7bcf47d3964974d41';
const BASE = process.env.REPLIZ_API_BASE || 'https://api.repliz.com/public';
const KEY = process.env.REPLIZ_ACCESS_KEY;
const SEC = process.env.REPLIZ_SECRET_KEY;

if (!KEY || !SEC) {
  console.error('Missing REPLIZ_ACCESS_KEY or REPLIZ_SECRET_KEY');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${KEY}:${SEC}`).toString('base64');
const TZ = 'Asia/Jakarta';

const TARGET_WIB_DATE = process.env.TARGET_WIB_DATE || '2026-05-23';
const TARGET_WIB_TIME = process.env.TARGET_WIB_TIME || '08:00';
const NEW_MEDIA_URL = process.env.NEW_MEDIA_URL || 'http://43.156.181.204/media/whitepaper/20260420T052336Z-gold-gathering-awakening-stage.jpg';

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
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`
  };
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

async function apiDelete(id) {
  const base = BASE.endsWith('/') ? BASE : (BASE + '/');
  const url = new URL(`schedule/${id}`, base);
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: auth } });
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => '');
    throw new Error(`DELETE HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
}

async function apiCreate(payload) {
  const base = BASE.endsWith('/') ? BASE : (BASE + '/');
  const url = new URL('schedule', base);
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

function pickCreatePayload(oldDoc, newMedias) {
  return {
    accountId: ACCOUNT_ID,
    scheduleAt: oldDoc.scheduleAt,
    title: oldDoc.title || '',
    description: oldDoc.description || '',
    type: oldDoc.type || 'image',
    medias: newMedias,
    replies: Array.isArray(oldDoc.replies) ? oldDoc.replies : []
  };
}

(async () => {
  const all = await fetchAll();

  const candidates = all
    .filter((s) => s?.scheduleAt)
    .map((s) => ({ s, ...wibParts(s.scheduleAt) }))
    .filter((x) => x.date === TARGET_WIB_DATE && x.time === TARGET_WIB_TIME);

  if (candidates.length === 0) {
    console.error(`No schedule found for ${TARGET_WIB_DATE} ${TARGET_WIB_TIME} WIB`);
    process.exit(2);
  }

  if (candidates.length > 1) {
    console.error(`Multiple schedules found for ${TARGET_WIB_DATE} ${TARGET_WIB_TIME} WIB: ${candidates.map((c) => c.s._id || c.s.id).join(', ')}`);
    process.exit(3);
  }

  const oldDoc = candidates[0].s;
  const oldId = oldDoc._id || oldDoc.id;

  const oldMedias = Array.isArray(oldDoc.medias) ? oldDoc.medias.filter(Boolean) : [];
  const newMedias = oldMedias.length ? oldMedias.slice() : [NEW_MEDIA_URL];
  newMedias[0] = NEW_MEDIA_URL;

  // Basic duplicate check: ensure NEW_MEDIA_URL isn't already used in May schedules.
  const inMay = all.filter((s) => s?.scheduleAt && wibParts(s.scheduleAt).date.startsWith('2026-05-'));
  const used = inMay.some((s) => Array.isArray(s.medias) && s.medias.includes(NEW_MEDIA_URL));
  if (used) {
    console.error(`Refusing: NEW_MEDIA_URL already used somewhere in May schedules: ${NEW_MEDIA_URL}`);
    process.exit(4);
  }

  console.log(JSON.stringify({
    action: 'replace_media',
    target: { wibDate: TARGET_WIB_DATE, wibTime: TARGET_WIB_TIME },
    oldId,
    oldMediasCount: oldMedias.length,
    newMediasCount: newMedias.length,
    newHero: NEW_MEDIA_URL
  }, null, 2));

  // Replace via delete + create.
  await apiDelete(oldId);
  const created = await apiCreate(pickCreatePayload(oldDoc, newMedias));

  console.log(JSON.stringify({ ok: true, createdId: created?.id || created?._id || null }, null, 2));
})();
