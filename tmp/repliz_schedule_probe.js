const https = require('https');
const auth = Buffer.from(`${process.env.REPLIZ_ACCESS_KEY}:${process.env.REPLIZ_SECRET_KEY}`).toString('base64');
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
(async()=>{
  const res=await get('/public/schedule?page=1&limit=5');
  console.log('STATUS',res.status);
  console.log(JSON.stringify(res.body,null,2).slice(0,5000));
})();
