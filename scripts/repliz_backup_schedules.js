const fs=require('fs');
const path=require('path');

const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.error('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY');process.exit(1);} 
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');

async function api(p){
  const url=`https://api.repliz.com${p}`;
  const r=await fetch(url,{headers:{Authorization:auth}});
  const text=await r.text();
  let j=null; try{j=JSON.parse(text);}catch{}
  if(!r.ok){
    throw new Error(`GET ${p} failed: ${r.status} ${j?JSON.stringify(j):text}`);
  }
  return j ?? text;
}

async function main(){
  const inPath=process.env.BACKUP_IN || process.argv[2];
  const outDir=process.env.BACKUP_OUT || process.argv[3];
  if(!inPath||!outDir){
    console.error('usage: BACKUP_IN=<mapping.json> BACKUP_OUT=<outDir> node repliz_backup_schedules.js');
    process.exit(1);
  }
  const mapping=JSON.parse(fs.readFileSync(inPath,'utf8'));
  if(!Array.isArray(mapping)||!mapping.length) throw new Error('mapping must be non-empty array');
  fs.mkdirSync(outDir,{recursive:true});

  const results=[];
  for(let i=0;i<mapping.length;i++){
    const id=mapping[i].scheduleId;
    const obj=await api(`/public/schedule/${id}`);
    results.push(obj);
    // also store per-item for easier inspection
    fs.writeFileSync(path.join(outDir,`${String(i+1).padStart(3,'0')}_${id}.json`),JSON.stringify(obj,null,2));
    process.stdout.write(`.${(i+1)%50===0?'\n':''}`);
  }
  process.stdout.write('\n');
  fs.writeFileSync(path.join(outDir,'_all.json'),JSON.stringify(results,null,2));
  console.log(`backed up ${results.length} schedules -> ${outDir}`);
}

main().catch(e=>{console.error(String(e&&e.stack||e));process.exit(1);});
