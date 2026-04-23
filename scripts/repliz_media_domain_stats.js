#!/usr/bin/env node

const fs = require('fs');

const base = '/root/.openclaw/workspace/';
const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/repliz_media_domain_stats.js <export.json> [...]');
  process.exit(1);
}

const days = Number(process.env.DAYS || 14);
const now = Date.now();
const horizon = now + days * 24 * 3600 * 1000;

function host(u) {
  try { return new URL(u).host; } catch { return 'invalid'; }
}

const stats = {};
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(base + f, 'utf8'));
  const platform = j.platform;
  for (const it of (j.items || [])) {
    const t = it.scheduleAt ? new Date(it.scheduleAt).getTime() : null;
    if (!t || t < now || t > horizon) continue;
    if (String(it.status || '').toLowerCase() !== 'pending') continue;

    const media = Array.isArray(it.media) ? it.media : [];
    for (const u of media) {
      const h = host(u);
      stats[platform] ||= { totalMedia: 0, byHost: {} };
      stats[platform].totalMedia++;
      stats[platform].byHost[h] = (stats[platform].byHost[h] || 0) + 1;
    }
  }
}

console.log(JSON.stringify({ nowISO: new Date(now).toISOString(), days, stats }, null, 2));
