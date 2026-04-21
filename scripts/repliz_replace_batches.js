const fs=require('fs');

const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.error('Missing keys');process.exit(1);}
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');

const mappingPath=process.env.REPLACE_MAPPING;
const apply=String(process.env.REPLACE_APPLY||'false').toLowerCase()==='true';
const batchSize=parseInt(process.env.REPLACE_BATCH_SIZE||'10',10);
const delayMs=parseInt(process.env.REPLACE_DELAY_MS||'2500',10);
const outReport=process.env.REPLACE_REPORT;

if(!mappingPath||!outReport){
  console.error('Usage: REPLACE_MAPPING=... REPLACE_REPORT=... [REPLACE_APPLY=true] node repliz_replace_batches.js');
  process.exit(1);
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function norm(s){return String(s??'').replace(/\r\n/g,'\n').trim();}

async function api(path,{method='GET',body}={}){
  const url=`https://api.repliz.com${path}`;
  const headers={Authorization:auth};
  let payload;
  if(body!==undefined){headers['Content-Type']='application/json'; payload=JSON.stringify(body);}
  const r=await fetch(url,{method,headers,body:payload});
  const text=await r.text();
  let json=null; try{json=JSON.parse(text);}catch{}
  if(!r.ok){
    const msg=json?JSON.stringify(json):text;
    const err=new Error(`${method} ${path} failed: ${r.status} ${msg}`);
    err.status=r.status;
    err.payload=msg;
    throw err;
  }
  return json ?? text;
}

async function safe(fn){
  try{ return {ok:true, val: await fn()}; }
  catch(e){ return {ok:false, err: String(e&&e.message||e)}; }
}

(async()=>{
  const mapping=JSON.parse(fs.readFileSync(mappingPath,'utf8'));
  if(!Array.isArray(mapping)||!mapping.length) throw new Error('mapping must be non-empty array');
  console.log(`mode: ${apply?'APPLY':'DRY'} items: ${mapping.length} batchSize:${batchSize} delayMs:${delayMs}`);

  const report={
    generatedAt: new Date().toISOString(),
    mode: apply?'APPLY':'DRY',
    mappingPath,
    batchSize,
    delayMs,
    batches:[],
    summary:{total:mapping.length, success:0, failed:0, created:0, deleted:0}
  };

  for(let start=0; start<mapping.length; start+=batchSize){
    const batch=mapping.slice(start,start+batchSize);
    const batchRep={index: (start/batchSize)+1, start, size: batch.length, success:0, failed:0, items:[]};

    for(const item of batch){
      const scheduleId=item.scheduleId;
      const newText=norm(item.newText);
      const rec={scheduleId, ok:false};

      const got=await safe(()=>api(`/public/schedule/${scheduleId}`));
      if(!got.ok){
        rec.error=`GET_FAILED ${got.err}`;
        batchRep.failed++; report.summary.failed++;
        batchRep.items.push(rec);
        if(batchRep.failed>2){
          report.batches.push(batchRep);
          fs.writeFileSync(outReport,JSON.stringify(report,null,2));
          throw new Error(`HARD_STOP: >2 failures in batch ${batchRep.index}`);
        }
        continue;
      }

      const old=got.val;
      rec.oldScheduleAt=old.scheduleAt;
      rec.accountId=old.accountId;
      rec.type=old.type;
      rec.oldId = old._id || old.id || scheduleId;

      if(!apply){
        rec.ok=true;
        batchRep.success++; report.summary.success++;
        batchRep.items.push(rec);
        continue;
      }

      // Create new schedule first
      const createBody={
        title: old.title || '',
        description: newText,
        type: old.type,
        medias: Array.isArray(old.medias)?old.medias:[],
        scheduleAt: old.scheduleAt,
        accountId: old.accountId,
      };
      if(Array.isArray(old.replies) && old.replies.length) createBody.replies=old.replies;
      if(old.additionalInfo) createBody.additionalInfo=old.additionalInfo;

      let created;
      // retry create once on transient
      for(let attempt=1; attempt<=2; attempt++){
        try{
          created=await api('/public/schedule',{method:'POST',body:createBody});
          break;
        }catch(e){
          rec.createError=String(e&&e.message||e);
          if(attempt===2) throw e;
          await sleep(1200);
        }
      }

      const newId=created?._id || created?.id;
      rec.newId=newId;
      report.summary.created++;

      // verify new schedule exists
      const verify=await safe(()=>api(`/public/schedule/${newId}`));
      if(!verify.ok){
        rec.error=`VERIFY_NEW_FAILED ${verify.err}`;
        // attempt rollback
        await safe(()=>api(`/public/schedule/${newId}`,{method:'DELETE'}));
        batchRep.failed++; report.summary.failed++;
        batchRep.items.push(rec);
        if(batchRep.failed>2){
          report.batches.push(batchRep);
          fs.writeFileSync(outReport,JSON.stringify(report,null,2));
          throw new Error(`HARD_STOP: >2 failures in batch ${batchRep.index}`);
        }
        continue;
      }

      // delete old schedule
      const del=await safe(()=>api(`/public/schedule/${scheduleId}`,{method:'DELETE'}));
      if(!del.ok){
        rec.error=`DELETE_OLD_FAILED ${del.err}`;
        // rollback delete new
        await safe(()=>api(`/public/schedule/${newId}`,{method:'DELETE'}));
        batchRep.failed++; report.summary.failed++;
        batchRep.items.push(rec);
        if(batchRep.failed>2){
          report.batches.push(batchRep);
          fs.writeFileSync(outReport,JSON.stringify(report,null,2));
          throw new Error(`HARD_STOP: >2 failures in batch ${batchRep.index}`);
        }
        continue;
      }

      report.summary.deleted++;
      rec.ok=true;
      batchRep.success++; report.summary.success++;
      batchRep.items.push(rec);

      await sleep(delayMs);
    }

    report.batches.push(batchRep);
    fs.writeFileSync(outReport,JSON.stringify(report,null,2));
  }

  fs.writeFileSync(outReport,JSON.stringify(report,null,2));
  console.log('done',report.summary);
})();
