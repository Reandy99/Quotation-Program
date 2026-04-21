const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.log('MISSING_ENV');process.exit(1);}
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');

const IG_ACCOUNT_ID=process.argv[2] || '69c5142b5f0c5e58b4b4a26e';
const START_UTC = new Date('2026-04-21T17:00:00.000Z'); // 2026-04-22 00:00 WIB
const END_UTC   = new Date('2026-05-31T16:59:59.999Z'); // 2026-05-31 23:59:59 WIB

async function getSchedules(accountId){
  const out=[];
  let page=1;
  const limit=100;
  while(true){
    const url=new URL('https://api.repliz.com/public/schedule');
    url.searchParams.set('page',String(page));
    url.searchParams.set('limit',String(limit));
    url.searchParams.set('accountIds[]',accountId);
    const r=await fetch(url,{headers:{Authorization:auth}});
    if(!r.ok) throw new Error(`schedule failed ${r.status} ${await r.text()}`);
    const j=await r.json();
    const docs=j.docs||[];
    out.push(...docs);
    if(docs.length<limit) break;
    const last=docs[docs.length-1];
    const lastD=last?.scheduleAt?new Date(last.scheduleAt):null;
    if(lastD && lastD < START_UTC) break;
    page++;
  }
  return out;
}

(async()=>{
  const all=await getSchedules(IG_ACCOUNT_ID);
  const within=all.filter(s=>s.scheduleAt).filter(s=>{
    const d=new Date(s.scheduleAt);
    return d>=START_UTC && d<=END_UTC;
  });
  within.sort((a,b)=> new Date(a.scheduleAt)-new Date(b.scheduleAt));

  const sample=[within[0], within[Math.floor(within.length/2)], within[within.length-1]].filter(Boolean);
  const cleaned=sample.map(s=>({
    scheduleAt:s.scheduleAt,
    type:s.type,
    status:s.status,
    mediaCount:Array.isArray(s.medias)?s.medias.length:0,
    captionPreview:(s.description||'').replace(/\s+/g,' ').slice(0,220),
    captionLen:(s.description||'').length,
    id:s._id
  }));

  console.log(JSON.stringify({totalWithin:within.length,samples:cleaned},null,2));
})().catch(e=>{
  console.error(String(e&&e.stack||e));
  process.exit(1);
});
