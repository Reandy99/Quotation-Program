#!/usr/bin/env node

const fs = require('fs');

const base = '/root/.openclaw/workspace/';
const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node scripts/repliz_upcoming_report.js <export.json> [...]');
  process.exit(1);
}

const now = Date.now();
const withinDays = Number(process.env.DAYS || 7);
const horizon = now + withinDays * 24 * 3600 * 1000;

const all = [];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(base + f, 'utf8'));
  for (const it of (j.items || [])) {
    all.push({
      platform: j.platform,
      scheduleId: it.scheduleId,
      scheduleAt: it.scheduleAt,
      wib: it.wib,
      status: it.status,
      captionLen: (it.caption || '').length,
      mediaCount: Array.isArray(it.media) ? it.media.length : 0,
    });
  }
}

const upcomingPending = all
  .filter(x => x.scheduleAt && new Date(x.scheduleAt).getTime() >= now)
  .filter(x => String(x.status || '').toLowerCase() === 'pending')
  .sort((a, b) => new Date(a.scheduleAt) - new Date(b.scheduleAt));

const nextNdays = upcomingPending.filter(x => {
  const t = new Date(x.scheduleAt).getTime();
  return t <= horizon;
});

function groupByPlatform(arr) {
  const m = {};
  for (const x of arr) {
    (m[x.platform] ||= []).push(x);
  }
  return m;
}

const gNext = groupByPlatform(nextNdays);
const gAll = groupByPlatform(upcomingPending);

const out = {
  nowISO: new Date(now).toISOString(),
  days: withinDays,
  totalsUpcomingPending: Object.fromEntries(['instagram', 'threads', 'linkedin'].map(p => [p, (gAll[p] || []).length])),
  nextByPlatform: Object.fromEntries(['instagram', 'threads', 'linkedin'].map(p => [
    p,
    {
      count: (gNext[p] || []).length,
      next: (gNext[p] || []).slice(0, 10).map(x => ({ wib: x.wib, id: x.scheduleId, media: x.mediaCount, captionLen: x.captionLen }))
    }
  ])),
};

console.log(JSON.stringify(out, null, 2));
