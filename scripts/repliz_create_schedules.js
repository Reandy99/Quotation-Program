/* Create Repliz schedules in bulk.

Usage:
  node tmp_repliz_create_schedules.js <accountId> <items.json> --dry-run
  node tmp_repliz_create_schedules.js <accountId> <items.json> --apply

items.json format: array of { scheduleAt, type, description, medias? }
*/

const fs = require('fs');

const ak = process.env.REPLIZ_ACCESS_KEY;
const sk = process.env.REPLIZ_SECRET_KEY;
if (!ak || !sk) {
  console.error('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${ak}:${sk}`).toString('base64');

const accountId = process.argv[2];
const itemsPath = process.argv[3];
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (!accountId || !itemsPath) {
  console.error('Usage: node tmp_repliz_create_schedules.js <accountId> <items.json> [--dry-run|--apply]');
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
if (!Array.isArray(items) || items.length === 0) {
  console.error('items.json must be a non-empty array');
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

function norm(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim();
}

(async () => {
  console.log(`mode: ${dryRun ? 'DRY_RUN' : 'APPLY'} | accountId: ${accountId} | items: ${items.length}`);

  for (const [i, it] of items.entries()) {
    const body = {
      title: '',
      accountId,
      scheduleAt: it.scheduleAt,
      type: it.type || 'text',
      description: norm(it.description),
      medias: Array.isArray(it.medias) ? it.medias : []
    };

    const preview = body.description.replace(/\s+/g, ' ').slice(0, 90);
    console.log(`${i + 1}/${items.length} @ ${body.scheduleAt} (${body.type}) -> ${preview}${body.description.length > 90 ? '…' : ''}`);

    if (dryRun) continue;

    const created = await api('/public/schedule', { method: 'POST', body });
    const newId = created?._id || created?.id;
    console.log(`  created: ${newId}`);
  }

  console.log('done');
})().catch((e) => {
  console.error(String((e && e.stack) || e));
  process.exit(1);
});
