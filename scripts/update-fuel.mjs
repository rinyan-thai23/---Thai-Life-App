import {writeFile,rename} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export const API='https://oil-price.bangchak.co.th/ApiOilPrice2/en';
export function parseFuel(raw){
 const r=raw?.[0];
 if(!r||!/^\d{2}\/\d{2}\/\d{4}$/.test(r.OilDateNow))throw Error('Invalid fuel date');
 let list=r.OilList;for(let i=0;i<2&&typeof list==='string';i++)list=JSON.parse(list);
 if(!Array.isArray(list)||list.length<4)throw Error('Incomplete fuel data');
 const items=list.map(x=>{if(typeof x.OilName!=='string'||!Number.isFinite(x.PriceToday)||x.PriceToday<=0)throw Error('Invalid fuel price');if(x.PriceTomorrow!=null&&(!Number.isFinite(x.PriceTomorrow)||x.PriceTomorrow<=0))throw Error('Invalid tomorrow price');return {name:x.OilName,price:x.PriceToday,tomorrow:x.PriceTomorrow??null}});
 if(new Set(items.map(x=>x.name)).size!==items.length)throw Error('Duplicate fuel');
 return {source:API,date:r.OilDateNow,announcement_date:r.OilPriceDate,effective_note:r.OilRemark2,items};
}
async function main(){
 const response=await fetch(API,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Fuel HTTP '+response.status);
 const data=parseFuel(await response.json());data.fetched_at=new Date().toISOString();
 const target=new URL('../docs/fuel.json',import.meta.url),tmp=new URL('../docs/fuel.json.tmp',import.meta.url);
 await writeFile(tmp,JSON.stringify(data,null,2)+'\n');await rename(tmp,target);
 console.log('Saved '+data.items.length+' official fuel prices');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=1});
