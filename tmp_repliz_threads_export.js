const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.log('MISSING_ENV');process.exit(1);}
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');

// Default range: 2026-04-22..2026-05-31 (WIB)
const START_UTC = new Date(process.argv[2] || '2026-04-21T17:00:00.000Z');
const END_UTC   = new Date(process.argv[3] || '2026-05-31T16:59:59.999Z');

async function getAllAccounts(){
  const out=[];
  let page=1;
  const limit=100;
  while(true){
    const url=new URL('https://api.repliz.com/public/account');
    url.searchParams.set('page',String(page));
    url.searchParams.set('limit',String(limit));
    const r=await fetch(url,{headers:{Authorization:auth}});
    if(!r.ok) throw new Error(`account page ${page} failed: ${r.status} ${await r.text()}`);
    const j=await r.json();
    const docs=j.docs||[];
    out.push(...docs);
    if(docs.length<limit) break;
    page++;
  }
  return out;
}

async function getSchedulesForAccount(accountId){
  const out=[];
  let page=1;
  const limit=100;
  while(true){
    const url=new URL('https://api.repliz.com/public/schedule');
    url.searchParams.set('page',String(page));
    url.searchParams.set('limit',String(limit));
    url.searchParams.set('accountIds[]',accountId);
    const r=await fetch(url,{headers:{Authorization:auth}});
    if(!r.ok) throw new Error(`schedule account ${accountId} page ${page} failed: ${r.status} ${await r.text()}`);
    const j=await r.json();
    const docs=j.docs||[];
    out.push(...docs);
    if(docs.length<limit) break;

    // early stop if last item older than start
    if(docs.length){
      const last=docs[docs.length-1];
      const lastD=last?.scheduleAt?new Date(last.scheduleAt):null;
      if(lastD && lastD < START_UTC) break;
    }

    page++;
  }
  return out;
}

function inRange(d){
  return d>=START_UTC && d<=END_UTC;
}

function normalize(s){
  return String(s||'').replace(/\r\n/g,'\n').trim();
}

(async()=>{
  const accounts=await getAllAccounts();
  const threadsAcc=accounts.filter(a=>String(a.type||'').toLowerCase()==='threads');

  const items=[];
  for(const acc of threadsAcc){
    const sched=await getSchedulesForAccount(acc._id);
    for(const s of sched){
      if(!s.scheduleAt) continue;
      const d=new Date(s.scheduleAt);
      if(!inRange(d)) continue;
      const desc=normalize(s.description);
      items.push({
        accountId: acc._id,
        username: acc.username,
        name: acc.name,
        scheduleId: s._id,
        scheduleAt: s.scheduleAt,
        status: s.status,
        type: s.type,
        mediasCount: Array.isArray(s.medias)?s.medias.length:0,
        repliesCount: Array.isArray(s.replies)?s.replies.length:0,
        text: desc,
        charCount: desc.length
      });
    }
  }

  items.sort((a,b)=> new Date(a.scheduleAt)-new Date(b.scheduleAt));

  // quick stats: average length per account
  const byUser={};
  for(const it of items){
    const k=`${it.username}`;
    byUser[k]=byUser[k]||{count:0,totalChars:0};
    byUser[k].count++;
    byUser[k].totalChars+=it.charCount;
  }

  // find repeated exact texts
  const freq=new Map();
  for(const it of items){
    const t=it.text;
    freq.set(t,(freq.get(t)||0)+1);
  }
  const repeats=[...freq.entries()].filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([text,count])=>({count,preview:text.slice(0,120)}));

  const summary={
    rangeUTC:{start:START_UTC.toISOString(),end:END_UTC.toISOString()},
    total: items.length,
    byUsername: Object.fromEntries(Object.entries(byUser).map(([u,v])=>[u,{count:v.count,avgChars: Math.round(v.totalChars/v.count)}])),
    repeats
  };

  console.log(JSON.stringify({summary,items},null,2));
})().catch(e=>{console.error(String(e&&e.stack||e));process.exit(1);});
