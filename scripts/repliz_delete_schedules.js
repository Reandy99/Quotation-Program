/* Delete Repliz schedules in bulk.

Usage:
  node repliz_delete_schedules.js <scheduleIds.json> --dry-run
  node repliz_delete_schedules.js <scheduleIds.json> --apply

scheduleIds.json format: ["scheduleId", ...]
*/

const fs = require('fs');

const ak = process.env.REPLIZ_ACCESS_KEY;
const sk = process.env.REPLIZ_SECRET_KEY;
if (!ak || !sk) {
  console.error('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${ak}:${sk}`).toString('base64');

const idsPath = process.argv[2];
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (!idsPath) {
  console.error('Usage: node repliz_delete_schedules.js <scheduleIds.json> [--dry-run|--apply]');
  process.exit(1);
}

const ids = JSON.parse(fs.readFileSync(idsPath, 'utf8'));
if (!Array.isArray(ids) || ids.length === 0) {
  console.error('scheduleIds.json must be a non-empty array');
  process.exit(1);
}

async function api(path, { method = 'GET', body } = {}) {
  const url = `https://api.repliz.com${path}`;
  const headers = { Authorization: auth };
  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const r = await fetch(url, { method, headers, body: payload });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!r.ok) {
    const msg = json ? JSON.stringify(json) : text;
    throw new Error(`${method} ${path} failed: ${r.status} ${msg}`);
  }
  return json ?? text;
}

(async () => {
  console.log(`mode: ${dryRun ? 'DRY_RUN' : 'APPLY'} | deletes: ${ids.length}`);

  for (const [i, id] of ids.entries()) {
    console.log(`${i + 1}/${ids.length} delete ${id}`);
    if (dryRun) continue;
    await api(`/public/schedule/${id}`, { method: 'DELETE' });
  }

  console.log('done');
})().catch((e) => {
  console.error(String((e && e.stack) || e));
  process.exit(1);
});
