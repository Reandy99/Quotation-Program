#!/usr/bin/env node

/*
  Media healthcheck for Repliz export files.
  Usage:
    node scripts/repliz_media_healthcheck.js <file1.json> <file2.json> ...

  Checks each media URL with HEAD (fallback GET), records HTTP status + content-type.
*/

const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/repliz_media_healthcheck.js <export.json> [...]');
  process.exit(1);
}

function safeJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function normUrl(u) {
  if (!u || typeof u !== 'string') return null;
  return u.trim();
}

function domainOf(u) {
  try { return new URL(u).host; } catch { return 'invalid'; }
}

async function checkUrl(url) {
  const out = { url, ok: false, status: null, contentType: null, length: null, method: null, error: null };
  const timeoutMs = 12000;
  const attempts = Number(process.env.ATTEMPTS || 3);
  const backoffMs = Number(process.env.BACKOFF_MS || 250);

  const errToStr = (e) => {
    const msg = e?.message || String(e);
    const cause = e?.cause?.message || e?.cause?.code || e?.cause;
    return cause ? `${msg} (cause: ${cause})` : msg;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const doFetch = async (method) => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(new Error('timeout')), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: ac.signal,
        headers: method === 'GET' ? { Range: 'bytes=0-1023' } : undefined
      });
      out.status = res.status;
      out.contentType = res.headers.get('content-type');
      out.length = res.headers.get('content-length');
      out.method = method;
      // Some hosts block HEAD but allow GET, or vice versa.
      if (res.ok) {
        // treat as ok only if it looks like an image/video.
        const ct = (out.contentType || '').toLowerCase();
        out.ok = ct.startsWith('image/') || ct.startsWith('video/') || ct.includes('application/octet-stream');
        if (!out.ok && method === 'GET') {
          // if content-type missing but ok, still mark ok
          out.ok = true;
        }
      }
      // drain small body if GET
      if (method === 'GET') {
        try { await res.arrayBuffer(); } catch {}
      }
      return out;
    } finally {
      clearTimeout(t);
    }
  };

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const r1 = await doFetch('HEAD');
      if (r1.ok || (r1.status && r1.status < 400 && r1.contentType)) return r1;
    } catch (e) {
      out.error = errToStr(e);
    }

    try {
      const r2 = await doFetch('GET');
      if (r2.ok) return r2;
      // If GET returns non-ok but not a hard fail, no need to retry.
      return r2;
    } catch (e) {
      out.error = errToStr(e);
      if (attempt < attempts) await sleep(backoffMs * attempt);
    }
  }

  return out;
}

async function run() {
  const items = [];
  for (const f of files) {
    const p = path.resolve(f);
    const data = safeJson(p);
    const platform = data.platform || 'unknown';
    for (const it of (data.items || [])) {
      const scheduleId = it.scheduleId;
      const wib = it.wib;
      const status = it.status;
      const media = Array.isArray(it.media) ? it.media.map(normUrl).filter(Boolean) : [];
      for (const url of media) items.push({ platform, file: p, scheduleId, wib, status, url });
    }
  }

  const unique = new Map();
  for (const it of items) {
    if (!unique.has(it.url)) unique.set(it.url, it);
  }

  const urls = [...unique.keys()];

  // simple concurrency limiter
  const conc = Number(process.env.CONCURRENCY || 10);
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const my = idx++;
      const url = urls[my];
      const meta = unique.get(url);
      const r = await checkUrl(url);
      results.push({ ...meta, ...r, domain: domainOf(url) });
    }
  }

  await Promise.all(Array.from({ length: Math.min(conc, urls.length) }, worker));

  // Summaries
  const byPlatform = {};
  for (const r of results) {
    const p = r.platform;
    byPlatform[p] ||= { total: 0, ok: 0, bad: 0, badSamples: [], domains: {} };
    byPlatform[p].total++;
    byPlatform[p].domains[r.domain] = (byPlatform[p].domains[r.domain] || 0) + 1;
    if (r.ok) byPlatform[p].ok++;
    else {
      byPlatform[p].bad++;
      if (byPlatform[p].badSamples.length < 10) {
        byPlatform[p].badSamples.push({ wib: r.wib, scheduleId: r.scheduleId, status: r.status, url: r.url, http: r.status, ct: r.contentType });
      }
    }
  }

  const overall = {
    checkedAt: new Date().toISOString(),
    uniqueMediaUrls: urls.length,
    ok: results.filter(r => r.ok).length,
    bad: results.filter(r => !r.ok).length,
    byPlatform,
  };

  const outPath = process.env.OUT || path.resolve('/root/.openclaw/workspace/audit/repliz_media_healthcheck_report.json');
  fs.writeFileSync(outPath, JSON.stringify({ overall, results }, null, 2));
  console.log(JSON.stringify({ outPath, overall }, null, 2));
}

run().catch((e) => {
  console.error('Fatal:', e.stack || e.message || String(e));
  process.exit(1);
});
