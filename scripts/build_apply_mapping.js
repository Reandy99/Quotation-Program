const fs=require('fs');

function norm(s){return String(s??'').replace(/\r\n/g,'\n').trim();}

const inPath=process.env.MAP_IN;
const outPath=process.env.MAP_OUT;
const overridePath=process.env.MAP_OVERRIDE||null;
const overrideIds=(process.env.MAP_OVERRIDE_IDS||'').split(',').map(s=>s.trim()).filter(Boolean);

if(!inPath||!outPath){
  console.error('Usage: MAP_IN=... MAP_OUT=... [MAP_OVERRIDE=...] [MAP_OVERRIDE_IDS=a,b] node build_apply_mapping.js');
  process.exit(1);
}

const arr=JSON.parse(fs.readFileSync(inPath,'utf8'));
if(!Array.isArray(arr)) throw new Error('MAP_IN must be array');

const overrides=new Map();
if(overridePath){
  const o=JSON.parse(fs.readFileSync(overridePath,'utf8'));
  for(const it of o){
    const t=it.newText ?? it.newCaption;
    if(it.scheduleId && typeof t==='string') overrides.set(it.scheduleId,norm(t));
  }
}

const out=[];
for(const it of arr){
  const id=it.scheduleId;
  let t=norm(it.newCaption ?? it.newText);
  if(overrideIds.includes(id) && overrides.has(id)) t=overrides.get(id);
  out.push({scheduleId:id,newText:t});
}

fs.writeFileSync(outPath,JSON.stringify(out,null,2));
console.log(`built ${out.length} items -> ${outPath}`);
