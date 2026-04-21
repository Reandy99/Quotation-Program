const fs=require('fs');
const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.log('MISSING_ENV');process.exit(1);}
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');

const IG_ACCOUNT_ID='69c5142b5f0c5e58b4b4a26e'; // whitepaper.prod IG
// May 1-31 WIB => 2026-04-30 17:00Z .. 2026-05-31 16:59:59Z
const START_UTC=new Date('2026-04-30T17:00:00.000Z');
const END_UTC=new Date('2026-05-31T16:59:59.999Z');

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

function inRange(iso){
  if(!iso) return false;
  const d=new Date(iso);
  return d>=START_UTC && d<=END_UTC;
}

function toWIBDate(iso){
  const d=new Date(iso);
  const w=new Date(d.getTime()+7*3600*1000);
  const pad=n=>String(n).padStart(2,'0');
  return `${w.getUTCFullYear()}-${pad(w.getUTCMonth()+1)}-${pad(w.getUTCDate())}`;
}

(async()=>{
  const all=await getSchedules(IG_ACCOUNT_ID);
  const within=all.filter(s=>inRange(s.scheduleAt));
  within.sort((a,b)=>new Date(a.scheduleAt)-new Date(b.scheduleAt));
  const items=within.map(s=>({
    scheduleId:s._id,
    scheduleAt:s.scheduleAt,
    dateWIB:toWIBDate(s.scheduleAt),
    type:s.type,
    medias:(Array.isArray(s.medias)?s.medias:[]).map(m=>({type:m.type,url:m.url,thumbnail:m.thumbnail,alt:m.alt})),
    caption:(s.description||'').trim(),
    mediaCount:Array.isArray(s.medias)?s.medias.length:0
  }));
  const byDate={};
  for(const it of items){
    byDate[it.dateWIB]=byDate[it.dateWIB]||[];
    byDate[it.dateWIB].push({scheduleId:it.scheduleId,type:it.type,mediaCount:it.mediaCount});
  }
  console.log(JSON.stringify({count:items.length,byDate,items},null,2));
})().catch(e=>{console.error(String(e&&e.stack||e));process.exit(1);});
