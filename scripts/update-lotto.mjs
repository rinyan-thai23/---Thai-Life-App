import {readFile,writeFile,rename} from 'node:fs/promises';
import {GLO_API,parseLotto,validateLotto} from '../docs/lotto-schema.mjs';
const response=await fetch(GLO_API,{method:'POST',headers:{'Content-Type':'application/json','User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error('GLO HTTP '+response.status);
const next=parseLotto(await response.json());
const file=new URL('../docs/lotto-latest.json',import.meta.url);
let old=null;
try{old=JSON.parse(await readFile(file,'utf8')); if(!/^\d{4}-\d{2}-\d{2}$/.test(old.date))throw Error('Invalid saved date')}catch(error){if(error.code!=='ENOENT')throw error}
if(old&&next.date<old.date)throw Error('GLO returned an older draw; keeping saved results');
if(JSON.stringify(old)===JSON.stringify(next)){console.log('Lottery results unchanged');}
else{
  const tmp=new URL('../docs/lotto-latest.json.tmp',import.meta.url);
  await writeFile(tmp,JSON.stringify(next,null,2)+'\n');await rename(tmp,file);
  console.log('Saved official lottery results:',next.date);
}
