/* Replace Repliz schedules by creating a new schedule (optionally with updated text and/or medias)
   and deleting the old one.

Usage:
  node tmp_repliz_replace_schedules.js mapping.json --dry-run
  node tmp_repliz_replace_schedules.js mapping.json --apply

mapping.json format:
  [
    {
      "scheduleId": "...",
      "newText": "...",
      "newMedias": [ {"type":"image","url":"...","thumbnail":"...","alt":"..."}, ... ]
    },
    ...
  ]
*/

const fs=require('fs');

const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.error('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY');process.exit(1);}
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');

const mappingPath=process.argv[2];
const apply=process.argv.includes('--apply');
const dryRun=process.argv.includes('--dry-run') || !apply;

if(!mappingPath){
  console.error('Usage: node tmp_repliz_replace_schedules.js <mapping.json> [--dry-run|--apply]');
  process.exit(1);
}

const mapping=JSON.parse(fs.readFileSync(mappingPath,'utf8'));
if(!Array.isArray(mapping) || mapping.length===0){
  console.error('mapping.json must be a non-empty array');
  process.exit(1);
}

async function api(path, {method='GET', body}={}){
  const url=`https://api.repliz.com${path}`;
  const headers={Authorization:auth};
  let payload;
  if(body!==undefined){
    headers['Content-Type']='application/json';
    payload=JSON.stringify(body);
  }
  const r=await fetch(url,{method,headers,body:payload});
  const text=await r.text();
  let json;
  try{ json=JSON.parse(text); }catch{ json=null; }
  if(!r.ok){
    const msg=json?JSON.stringify(json):text;
    throw new Error(`${method} ${path} failed: ${r.status} ${msg}`);
  }
  return json ?? text;
}

function normalizeNewText(t){
  return String(t||'').replace(/\r\n/g,'\n').trim();
}

function normalizeNewMedias(m){
  if(m===undefined || m===null) return null;
  if(!Array.isArray(m)) throw new Error('newMedias must be an array when provided');
  // keep only known-ish fields; API ignores unknowns but we keep payload tidy
  return m.map(x=>({
    type: x.type || 'image',
    url: x.url,
    thumbnail: x.thumbnail || x.url,
    alt: x.alt || '',
  }));
}

(async()=>{
  console.log(`mode: ${dryRun?'DRY_RUN':'APPLY'} | items: ${mapping.length}`);

  for(const [idx,item] of mapping.entries()){
    const scheduleId=item.scheduleId;
    const newText=normalizeNewText(item.newText);
    const newMedias=normalizeNewMedias(item.newMedias);
    if(!scheduleId || !newText){
      throw new Error(`Invalid mapping at index ${idx}`);
    }

    const old=await api(`/public/schedule/${scheduleId}`);

    // Build create payload from old schedule
    const createBody={
      title: old.title || '',
      description: newText,
      type: old.type,
      medias: newMedias || (Array.isArray(old.medias)?old.medias:[]),
      scheduleAt: old.scheduleAt,
      accountId: old.accountId,
    };
    if(Array.isArray(old.replies) && old.replies.length){
      createBody.replies=old.replies;
    }
    if(old.additionalInfo){
      createBody.additionalInfo=old.additionalInfo;
    }

    const preview=newText.replace(/\s+/g,' ').slice(0,90);
    console.log(`${idx+1}/${mapping.length} ${scheduleId} @ ${old.scheduleAt} -> ${preview}${newText.length>90?'...':''}`);

    if(dryRun) continue;

    // Create new schedule first
    const created=await api('/public/schedule',{method:'POST',body:createBody});
    const newId=created?._id || created?.id;

    // Delete old schedule
    try{
      await api(`/public/schedule/${scheduleId}`,{method:'DELETE'});
    }catch(e){
      // rollback: delete newly created schedule to avoid duplicates
      if(newId){
        try{ await api(`/public/schedule/${newId}`,{method:'DELETE'}); }catch{}
      }
      throw e;
    }
  }

  console.log('done');
})().catch(e=>{
  console.error(String(e&&e.stack||e));
  process.exit(1);
});
