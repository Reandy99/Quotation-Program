const fs=require('fs');
const path=require('path');

function norm(s){return String(s??'').replace(/\r\n/g,'\n').trim();}

function loadJson(p){return JSON.parse(fs.readFileSync(p,'utf8'));}

function main(){
  const mappingPath=process.env.DIFF_MAPPING;
  const backupAllPath=process.env.DIFF_BACKUP_ALL; // _all.json
  const outPath=process.env.DIFF_OUT;
  const overridePath=process.env.DIFF_OVERRIDE || null; // array with scheduleId + newText or newCaption
  const overrideIds=(process.env.DIFF_OVERRIDE_IDS||'').split(',').map(s=>s.trim()).filter(Boolean);

  if(!mappingPath||!backupAllPath||!outPath){
    console.error('Usage: DIFF_MAPPING=... DIFF_BACKUP_ALL=... DIFF_OUT=... [DIFF_OVERRIDE=...] [DIFF_OVERRIDE_IDS=a,b,c] node repliz_dryrun_diff.js');
    process.exit(1);
  }

  const mapping=loadJson(mappingPath);
  const backupAll=loadJson(backupAllPath);

  const backupById=new Map();
  for(const s of backupAll){
    const id=s?._id||s?.id;
    if(id) backupById.set(id,s);
  }

  const overrides=new Map();
  if(overridePath){
    const arr=loadJson(overridePath);
    for(const it of arr){
      const t=it.newText ?? it.newCaption;
      if(it.scheduleId && typeof t==='string') overrides.set(it.scheduleId,norm(t));
    }
  }

  let missing=0, changed=0, same=0;
  const items=[];
  for(const it of mapping){
    const id=it.scheduleId;
    const old=backupById.get(id);
    if(!old){missing++; items.push({scheduleId:id, status:'MISSING_IN_BACKUP'}); continue;}
    let next=norm(it.newCaption ?? it.newText);
    if(overrideIds.includes(id) && overrides.has(id)) next=overrides.get(id);
    const prev=norm(old.description);
    const isSame = prev===next;
    if(isSame) same++; else changed++;
    items.push({
      scheduleId:id,
      scheduleAt: old.scheduleAt,
      accountId: old.accountId,
      type: old.type,
      prevLen: prev.length,
      nextLen: next.length,
      deltaLen: next.length-prev.length,
      willChange: !isSame,
      overrideApplied: overrideIds.includes(id)
    });
  }

  const report={
    generatedAt: new Date().toISOString(),
    mappingPath,
    backupAllPath,
    counts:{total:mapping.length, missing, willChange:changed, noOp:same},
    items
  };

  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  fs.writeFileSync(outPath,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.counts));
}

main();
