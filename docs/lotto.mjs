import {validateLotto} from './lotto-schema.mjs';
const $=id=>document.getElementById(id);
const text=(ja,en)=>document.documentElement.lang==='en'?en:ja;
let data=null,busy=false,failed=false;
function render(){
  $('lotto-heading').textContent=text('タイの宝くじ結果','Thai lottery results');
  $('lotto-refresh').textContent=text('結果を更新','Refresh results');
  $('lotto-official').textContent=text('公式サイトで最新結果を見る','See latest results on GLO');
  $('lotto-summary').textContent=data?`${data.date}　${text('1等','First')}: ${data.first[0]} / ${text('下2桁','Last 2')}: ${data.last2[0]}`:text('結果を読み込み中…','Loading results…');
  $('lotto-status').textContent=busy?text('更新中…','Updating…'):failed?text('取得できませんでした。保存済みの結果があれば表示しています。','Could not refresh. Showing saved results if available.'):text('毎日16:30ごろ（タイ時間）に確認。抽選日を確認してください。','Checked around 16:30 Thailand time daily. Check the draw date.');
  if(!data&&!busy&&failed)$('lotto-summary').textContent=text('結果を取得できませんでした','Results unavailable');
  const list=$('lotto-grid');list.replaceChildren();
  if(data)for(const [key,ja,en] of [['first','1等','First prize'],['last2','下2桁','Last 2 digits'],['last3f','前3桁','First 3 digits'],['last3b','後3桁','Last 3 digits'],['near1','1等前後賞','Adjacent first prizes']]){
    const box=document.createElement('div'),label=document.createElement('span'),numbers=document.createElement('strong');label.textContent=text(ja,en);numbers.textContent=data[key].join(' / ');box.append(label,numbers);list.append(box);
  }
  const pdf=$('lotto-pdf');pdf.hidden=!data?.pdf_url;pdf.textContent=text('公式結果PDF','Official results PDF');if(data?.pdf_url)pdf.href=data.pdf_url;
  $('lotto-refresh').disabled=busy;
}
async function load(){
  if(busy)return;busy=true;failed=false;render();
  try{
    const r=await fetch('lotto-latest.json',{cache:'no-cache',signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw Error('HTTP');const next=validateLotto(await r.json());
    if(!data||next.date>=data.date)data=next;
    try{localStorage.setItem('thai-life-lotto',JSON.stringify(data))}catch{}
  }catch{failed=true}finally{busy=false;render()}
}
try{data=validateLotto(JSON.parse(localStorage.getItem('thai-life-lotto')))}catch{}
$('lotto-refresh').addEventListener('click',load);
$('language').addEventListener('click',render);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load()});
load();
