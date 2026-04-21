const fs=require('fs');
const path=process.argv[2]||'/root/.openclaw/workspace/threads_export_2026-04-22_2026-05-31.json';
const j=JSON.parse(fs.readFileSync(path,'utf8'));
const items=(j.items||[]).filter(x=>x.username==='whitepaper.prod');
items.sort((a,b)=>new Date(a.scheduleAt)-new Date(b.scheduleAt));

function toWIB(iso){
  const d=new Date(iso);
  // WIB = UTC+7
  const w=new Date(d.getTime()+7*60*60*1000);
  const pad=n=>String(n).padStart(2,'0');
  return `${w.getUTCFullYear()}-${pad(w.getUTCMonth()+1)}-${pad(w.getUTCDate())} ${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())} WIB`;
}

const out=items.map((it,i)=>{
  return {
    n:i+1,
    scheduleId: it.scheduleId,
    scheduleAtUTC: it.scheduleAt,
    scheduleAtWIB: toWIB(it.scheduleAt),
    charCount: it.charCount,
    text: it.text
  };
});
console.log(JSON.stringify({count:out.length,items:out},null,2));
