const https = require('https');
const auth = Buffer.from(`${process.env.REPLIZ_ACCESS_KEY}:${process.env.REPLIZ_SECRET_KEY}`).toString('base64');
const NOW = new Date('2026-04-19T15:05:00Z');
const REVIEW_SINCE = new Date('2026-04-18T14:00:00Z');
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const todayWibStartUtc = new Date(Date.UTC(2026,3,18,17,0,0)); // 2026-04-19 00:00 WIB
function get(path){
  return new Promise((resolve,reject)=>{
    https.get({hostname:'api.repliz.com',path,headers:{Authorization:`Basic ${auth}`}},res=>{
      let data='';
      res.on('data',d=>data+=d);
      res.on('end',()=>{
        try { resolve({status:res.statusCode,body:JSON.parse(data)}) }
        catch(e) { resolve({status:res.statusCode,raw:data}) }
      });
    }).on('error',reject);
  });
}
function fmtWib(iso){
  if(!iso) return null;
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit', hour12:false }).format(new Date(iso)).replace(',', ' WIB');
}
(async()=>{
  const accRes=await get('/public/account?page=1&limit=100');
  const accounts = accRes.body.docs || [];
  const whitepaperAccounts = accounts.filter(a => /whitepaper/i.test(a.name || a.username || '') && ['threads','instagram','linkedin'].includes((a.type||'').toLowerCase()));
  const accountMap = Object.fromEntries(whitepaperAccounts.map(a => [a._id, a]));

  let page=1, totalPages=1, all=[];
  do {
    const res = await get(`/public/schedule?page=${page}&limit=100`);
    const docs = res.body.docs || [];
    totalPages = res.body.totalPages || 1;
    all.push(...docs);
    page++;
  } while(page <= totalPages);

  const wp = all.filter(s => accountMap[s.accountId]);
  const byPlatform = {};
  for (const a of whitepaperAccounts) byPlatform[a.type] = {accountId:a._id, connected:a.isConnected, username:a.username};
  const recentSinceReview = wp.filter(s => new Date(s.updatedAt || s.createdAt || s.scheduleAt) >= REVIEW_SINCE).sort((a,b)=>new Date(b.scheduleAt)-new Date(a.scheduleAt));
  const todayWib = wp.filter(s => new Date(s.scheduleAt) >= todayWibStartUtc && new Date(s.scheduleAt) <= NOW).sort((a,b)=>new Date(a.scheduleAt)-new Date(b.scheduleAt));
  const upcoming = wp.filter(s => new Date(s.scheduleAt) > NOW).sort((a,b)=>new Date(a.scheduleAt)-new Date(b.scheduleAt));
  const latestByPlatform = {};
  for (const s of wp.sort((a,b)=>new Date(b.scheduleAt)-new Date(a.scheduleAt))) {
    const t = accountMap[s.accountId]?.type;
    if (t && !latestByPlatform[t]) latestByPlatform[t] = s;
  }
  const statusCountsUpcoming = {};
  for (const s of upcoming) {
    const t = accountMap[s.accountId]?.type;
    if (!t) continue;
    statusCountsUpcoming[t] ||= {};
    statusCountsUpcoming[t][s.status] = (statusCountsUpcoming[t][s.status]||0)+1;
  }
  const statusCountsRecent = {};
  for (const s of recentSinceReview) {
    const t = accountMap[s.accountId]?.type;
    if (!t) continue;
    statusCountsRecent[t] ||= {};
    statusCountsRecent[t][s.status] = (statusCountsRecent[t][s.status]||0)+1;
  }
  const threadsLiteralNewline = wp.filter(s => accountMap[s.accountId]?.type === 'threads' && typeof s.description === 'string' && s.description.includes('\\n')).slice(0,10).map(s=>({id:s._id,status:s.status,scheduleAt:s.scheduleAt,updatedAt:s.updatedAt,snippet:s.description.slice(0,120)}));
  const failedOrError = wp.filter(s => ['failed','error'].includes((s.status||'').toLowerCase())).sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,10).map(s=>({id:s._id,type:accountMap[s.accountId]?.type,status:s.status,scheduleAt:s.scheduleAt,updatedAt:s.updatedAt,snippet:(s.description||'').slice(0,120)}));
  const sampleRecent = recentSinceReview.slice(0,12).map(s=>({
    type: accountMap[s.accountId]?.type,
    status: s.status,
    scheduleAt: s.scheduleAt,
    scheduleAtWib: fmtWib(s.scheduleAt),
    updatedAt: s.updatedAt,
    hasLiteralNewline: typeof s.description === 'string' && s.description.includes('\\n'),
    preview: (s.description||'').replace(/\s+/g,' ').slice(0,100)
  }));
  const todaySummary = {};
  for (const s of todayWib) {
    const t = accountMap[s.accountId]?.type;
    if (!t) continue;
    todaySummary[t] ||= {count:0,statuses:{},times:[]};
    todaySummary[t].count++;
    todaySummary[t].statuses[s.status]=(todaySummary[t].statuses[s.status]||0)+1;
    todaySummary[t].times.push(fmtWib(s.scheduleAt));
  }
  console.log(JSON.stringify({
    whitepaperAccounts: whitepaperAccounts.map(a=>({type:a.type,accountId:a._id,username:a.username,connected:a.isConnected,updatedAt:a.updatedAt})),
    recentSinceReviewCount: recentSinceReview.length,
    statusCountsRecent,
    todayWibSummary: todaySummary,
    upcomingCounts: statusCountsUpcoming,
    latestByPlatform: Object.fromEntries(Object.entries(latestByPlatform).map(([k,v])=>[k,{status:v.status,scheduleAt:v.scheduleAt,scheduleAtWib:fmtWib(v.scheduleAt),updatedAt:v.updatedAt,preview:(v.description||'').replace(/\s+/g,' ').slice(0,100)}])),
    threadsLiteralNewlineCount: threadsLiteralNewline.length,
    threadsLiteralNewline,
    failedOrError,
    sampleRecent
  },null,2));
})();
