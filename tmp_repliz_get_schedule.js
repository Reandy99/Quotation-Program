const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.log('MISSING_ENV');process.exit(1);}
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');
const id=process.argv[2];
if(!id){console.error('usage: node tmp_repliz_get_schedule.js <scheduleId>');process.exit(1);}
(async()=>{
  const url=`https://api.repliz.com/public/schedule/${id}`;
  const r=await fetch(url,{headers:{Authorization:auth}});
  if(!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const j=await r.json();
  console.log(JSON.stringify(j,null,2));
})().catch(e=>{console.error(String(e&&e.stack||e));process.exit(1);});
