/**
 * Fix Repliz schedules that reference http://43.156.181.204/... by recreating
 * them with https://ocindonesia.my.id/... (to avoid mixed-content blocks in UI).
 *
 * Usage:
 *   node repliz_fix_https.js <scheduleId> [scheduleId...]
 */

async function req(method, path, body) {
  const access = process.env.REPLIZ_ACCESS_KEY;
  const secret = process.env.REPLIZ_SECRET_KEY;
  if (!access || !secret) throw new Error('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY');
  const auth = Buffer.from(`${access}:${secret}`).toString('base64');
  const url = `https://api.repliz.com${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = { _raw: text }; }
  if (!res.ok) {
    const msg = (json && (json.message || json.error?.message)) || text || `${res.status}`;
    throw new Error(`${method} ${path} -> ${res.status}: ${msg}`);
  }
  return json;
}

function fixUrl(u) {
  if (!u) return u;
  return u
    .replace(/^http:\/\/43\.156\.181\.204\b/i, 'https://ocindonesia.my.id')
    .replace(/^http:\/\/ocindonesia\.my\.id\b/i, 'https://ocindonesia.my.id');
}

function mapMedia(m) {
  const url = fixUrl(m.url);
  const thumbnail = fixUrl(m.thumbnail || m.url);
  return {
    type: m.type || 'image',
    url,
    thumbnail,
    ...(m.alt ? { alt: m.alt } : {})
  };
}

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) {
    console.error('Usage: node repliz_fix_https.js <scheduleId> [scheduleId...]');
    process.exit(2);
  }

  const results = [];

  for (const id of ids) {
    const s = await req('GET', `/public/schedule/${id}`);

    const oldMedias = s.medias || [];
    const newMedias = oldMedias.map(mapMedia);

    const changed = oldMedias.some((m, i) => (m.url !== newMedias[i].url) || ((m.thumbnail || m.url) !== newMedias[i].thumbnail));

    if (!changed) {
      results.push({ id, skipped: true, reason: 'no http->https change needed' });
      continue;
    }

    // Create first (safer), then delete old.
    const payload = {
      title: s.title || '',
      description: s.description || '',
      type: s.type,
      medias: newMedias,
      scheduleAt: s.scheduleAt,
      accountId: s.accountId
    };

    if (Array.isArray(s.replies) && s.replies.length) {
      payload.replies = s.replies;
    }

    if (s.additionalInfo) {
      payload.additionalInfo = s.additionalInfo;
    }

    const created = await req('POST', '/public/schedule', payload);

    await req('DELETE', `/public/schedule/${id}`);

    results.push({
      oldId: id,
      newId: created?._id || created?.id || created?.data?._id || null,
      scheduleAt: s.scheduleAt,
      type: s.type,
      oldUrls: oldMedias.map(m => m.url),
      newUrls: newMedias.map(m => m.url)
    });
  }

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((e) => {
  console.error(String(e && e.stack || e));
  process.exit(1);
});
