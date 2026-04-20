async function main() {
  const access = process.env.REPLIZ_ACCESS_KEY;
  const secret = process.env.REPLIZ_SECRET_KEY;
  if (!access || !secret) throw new Error('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY');
  const auth = Buffer.from(`${access}:${secret}`).toString('base64');

  const accountId = process.argv[2];
  const startIso = process.argv[3];
  const endIso = process.argv[4];
  if (!accountId || !startIso || !endIso) {
    console.error('Usage: node repliz_check_ig.js <accountId> <startIso> <endIso>');
    process.exit(2);
  }
  const start = new Date(startIso);
  const end = new Date(endIso);

  let page = 1;
  const limit = 50;
  const all = [];
  while (page <= 10) {
    const url = `https://api.repliz.com/public/schedule?page=${page}&limit=${limit}&accountIds%5B%5D=${encodeURIComponent(accountId)}`;
    const r = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    const j = await r.json();
    const docs = j.docs || j.data || j.result || [];
    all.push(...docs);
    if (docs.length < limit) break;
    if (j.hasNextPage === false) break;
    page += 1;
  }

  const sel = all.filter((s) => {
    const when = new Date(s.scheduleAt || s.schedule_at || s.publishAt || s.createdAt);
    return when >= start && when < end;
  });
  sel.sort((a, b) => new Date(a.scheduleAt) - new Date(b.scheduleAt));

  const out = sel.map((s) => ({
    id: s._id,
    type: s.type,
    scheduleAt: s.scheduleAt,
    status: s.status,
    mediaCount: (s.medias || []).length,
    medias: (s.medias || []).map((m) => ({ type: m.type, url: m.url, thumbnail: m.thumbnail }))
  }));

  console.log(JSON.stringify({ found: out.length, items: out }, null, 2));
}

main().catch((e) => {
  console.error(String(e && e.stack || e));
  process.exit(1);
});
