'use strict';
(()=>{
const names={'Gasohol 95 S EVO':'95','Gasohol 91 S EVO':'91','Gasohol E20 S EVO':'E20','Gasohol E85 S EVO':'E85','Hi Diesel S':'軽油','DIESEL B20':'軽油B20','Hi Premium Diesel Plus':'プレミアム軽油','Hi Premium 98 Plus':'プレミアム98'};
const button=document.getElementById('fuel-refresh'),status=document.getElementById('fuel-status'),list=document.getElementById('fuel-list');let busy=false;
async function load(){if(busy)return;busy=true;button.disabled=true;status.textContent='価格を読み込み中…';try{
 const r=await fetch('fuel.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const data=await r.json();
 if(!Array.isArray(data.items)||!data.items.length||!Number.isFinite(Date.parse(data.fetched_at))||data.items.some(x=>typeof x.name!=='string'||!Number.isFinite(x.price)||x.price<=0))throw Error();
 const ordered=[...data.items].sort((a,b)=>{const keys=Object.keys(names);return (keys.indexOf(a.name)<0?99:keys.indexOf(a.name))-(keys.indexOf(b.name)<0?99:keys.indexOf(b.name))});
 const parts=String(data.date).split('/').map(Number);const base=new Date(Date.UTC(parts[2],parts[1]-1,parts[0]));if(!Number.isFinite(base.getTime()))throw Error();const next=new Date(base.getTime()+86400000);const current=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok'}).format(new Date())===data.date;
 const labels=[(current?'今日 ':'')+(base.getUTCMonth()+1)+'/'+base.getUTCDate(),(current?'明日 ':'')+(next.getUTCMonth()+1)+'/'+next.getUTCDate()];
 list.replaceChildren(...ordered.map(x=>{
  const row=document.createElement('div'),label=document.createElement('span'),values=document.createElement('div');row.className='fuel-row';label.className='fuel-name';label.textContent=names[x.name]||x.name;values.className='fuel-values';
  [x.price,x.tomorrow].forEach((value,i)=>{
   const cell=document.createElement('div'),caption=document.createElement('span'),line=document.createElement('div'),price=document.createElement('strong');
   caption.className='fuel-day';caption.textContent=labels[i];line.className='fuel-price-line';price.textContent=Number.isFinite(value)&&value>0?value.toFixed(2):'—';
   if(i===1)price.className='fuel-tomorrow';line.append(price);
   if(i===1){
    const badge=document.createElement('span');const valid=Number.isFinite(value)&&value>0;
    const cents=valid?Math.round(value*100)-Math.round(x.price*100):null;
    badge.className='fuel-diff '+(cents===null?'unknown':cents>0?'up':cents<0?'down':'same');
    badge.textContent=cents===null?'未定':cents===0?'--':(cents>0?'+':'-')+(Math.abs(cents)/100).toFixed(2);
    badge.setAttribute('aria-label',cents===null?'明日の価格未取得':cents===0?'今日と同額':'今日との差額 '+badge.textContent+' バーツ／リットル');line.append(badge);
   }
   cell.append(caption,line);values.append(cell);
  });
  row.append(label,values);return row;
 }));
 status.textContent=(Date.now()-Date.parse(data.fetched_at)>48*3600000?'保存データが古くなっています。':'')+'取得：'+new Date(data.fetched_at).toLocaleString('ja-JP',{timeZone:'Asia/Bangkok'})+'（タイ時間）';
}catch{status.textContent='更新できませんでした。表示中の価格がある場合は前回取得分です。公式表示も確認できます。'}finally{busy=false;button.disabled=false}}
button.addEventListener('click',load);
const details=document.getElementById('fuel-official');details.addEventListener('toggle',()=>{if(details.open){const frame=document.getElementById('fuel-frame');if(!frame.hasAttribute('src'))frame.src=frame.dataset.src}});
load();
})();
