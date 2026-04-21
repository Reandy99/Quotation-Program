const ak=process.env.REPLIZ_ACCESS_KEY;
const sk=process.env.REPLIZ_SECRET_KEY;
if(!ak||!sk){console.error('Missing keys');process.exit(1);} 
const auth='Basic '+Buffer.from(`${ak}:${sk}`).toString('base64');
const id=process.env.TRY_ID;
if(!id){console.error('TRY_ID env required');process.exit(1);}

async function api(path,{method='GET',body}={}){
  const url=`https://api.repliz.com${path}`;
  const headers={Authorization:auth};
  let payload;
  if(body!==undefined){headers['Content-Type']='application/json'; payload=JSON.stringify(body);} 
  const r=await fetch(url,{method,headers,body:payload});
  const text=await r.text();
  let j=null; try{j=JSON.parse(text);}catch{}
  return {ok:r.ok,status:r.status,body:j??text};
}

(async()=>{
  const got=await api(`/public/schedule/${id}`);
  if(!got.ok) throw new Error(`GET failed ${got.status} ${JSON.stringify(got.body)}`);
  const old=got.body;
  const put=await api(`/public/schedule/${id}`,{method:'PUT',body:{description:old.description}});
  console.log('PUT',put.status, typeof put.body==='string'?put.body.slice(0,120):JSON.stringify(put.body).slice(0,120));
  const patch=await api(`/public/schedule/${id}`,{method:'PATCH',body:{description:old.description}});
  console.log('PATCH',patch.status, typeof patch.body==='string'?patch.body.slice(0,120):JSON.stringify(patch.body).slice(0,120));
})();
