'use strict';
(()=>{
const names={'Gasohol 95 S EVO':'95','Gasohol 91 S EVO':'91','Gasohol E20 S EVO':'E20','Gasohol E85 S EVO':'E85','Hi Diesel S':'軽油','DIESEL B20':'軽油B20','Hi Premium Diesel Plus':'プレミアム軽油','Hi Premium 98 Plus':'プレミアム98'};
const button=document.getElementById('fuel-refresh'),status=document.getElementById('fuel-status'),list=document.getElementById('fuel-list');let busy=false;
async function load(){if(busy)return;busy=true;button.disabled=true;status.textContent='価格を読み込み中…';try{
 const r=await fetch('fuel.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const data=await r.json();
 if(!Array.isArray(data.items)||!data.items.length||!Number.isFinite(Date.parse(data.fetched_at))||data.items.some(x=>typeof x.name!=='string'||!Number.isFinite(x.price)||x.price<=0))throw Error();
 const ordered=[...data.items].sort((a,b)=>{const keys=Object.keys(names);return (keys.indexOf(a.name)<0?99:keys.indexOf(a.name))-(keys.indexOf(b.name)<0?99:keys.indexOf(b.name))});
 list.replaceChildren(...ordered.map(x=>{const row=document.createElement('div'),label=document.createElement('span'),price=document.createElement('strong');row.className='fuel-row';label.textContent=names[x.name]||x.name;price.textContent=x.price.toFixed(2);row.append(label,price);return row}));
 status.textContent=(Date.now()-Date.parse(data.fetched_at)>48*3600000?'保存データが古くなっています。':'')+'取得：'+new Date(data.fetched_at).toLocaleString('ja-JP',{timeZone:'Asia/Bangkok'})+'（タイ時間）';
}catch{status.textContent='更新できませんでした。表示中の価格がある場合は前回取得分です。公式表示も確認できます。'}finally{busy=false;button.disabled=false}}
button.addEventListener('click',load);
const details=document.getElementById('fuel-official');details.addEventListener('toggle',()=>{if(details.open){const frame=document.getElementById('fuel-frame');if(!frame.hasAttribute('src'))frame.src=frame.dataset.src}});
load();
})();
