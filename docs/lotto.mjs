import {validateLotto,checkTicket} from './lotto-schema.mjs';
const $=id=>document.getElementById(id);
const text=(ja,en)=>document.documentElement.lang==='en'?en:ja;
let data=null,busy=false,failed=false;
const prizes={first:['1等','First prize'],second:['2等','Second prize'],third:['3等','Third prize'],fourth:['4等','Fourth prize'],fifth:['5等','Fifth prize'],near1:['1等前後賞','Adjacent first prizes'],last2:['下2桁','Last 2 digits'],last3f:['前3桁','First 3 digits'],last3b:['後3桁','Last 3 digits']};
let checked=false;
function check(){
  const result=$('lotto-check-result');
  if(!data){result.textContent=text('結果の取得後に確認してください。','Wait for results to load.');return}
  try{const matches=checkTicket(data,$('lotto-ticket').value);result.textContent=data.date+' '+text('抽選分：','draw: ')+(matches.length?matches.map(k=>text(...prizes[k])).join('・')+text('に一致しました。',' matched.'):text('該当する番号はありません。','No matching prizes.'))+text(' お手元のくじの抽選日と公式結果も確認してください。',' Check your ticket date and official results.');}
  catch{result.textContent=text('6桁の数字を入力してください。先頭の0も必要です。','Enter all 6 digits, including leading zeros.');}
}
function render(){
  $('lotto-ticket-label').textContent=text('自分の6桁の番号（この端末で照合）','Your 6-digit number (checked on this device)');
  $('lotto-check-button').textContent=text('番号を確認','Check number');
  $('lotto-all-title').textContent=text('2〜5等の番号をすべて見る','Show all second–fifth prize numbers');
  $('lotto-check-button').disabled=!data;
  const all=$('lotto-all-list');all.replaceChildren();
  if(data)for(const key of ['second','third','fourth','fifth']){const group=document.createElement('section'),title=document.createElement('h3'),numbers=document.createElement('div');title.textContent=text(...prizes[key]);numbers.className='lotto-number-list';for(const n of data[key]){const span=document.createElement('span');span.textContent=n;numbers.append(span)}group.append(title,numbers);all.append(group)}
  if(checked)check();
  $('lotto-heading').textContent=text('タイの宝くじ結果','Thai lottery results');
  $('lotto-refresh').textContent=text('結果を更新','Refresh results');
  $('lotto-official').textContent=text('公式サイトで最新結果を見る','See latest results on GLO');
  const summary=$('lotto-summary');summary.replaceChildren();
  if(data){
    const date=document.createElement('span');date.className='lotto-draw-date';date.textContent=data.date+text(' 抽選',' draw');
    const highlights=document.createElement('span');highlights.className='lotto-highlights';
    for(const key of ['first','last2']){const tile=document.createElement('span'),label=document.createElement('span'),number=document.createElement('strong');tile.className='lotto-highlight';label.textContent=text(...prizes[key]);number.textContent=data[key][0];tile.append(label,number);highlights.append(tile)}
    summary.append(date,highlights);
  }else summary.textContent=text('結果を読み込み中…','Loading results…');
  $('lotto-status').textContent=busy?text('更新中…','Updating…'):failed?text('取得できませんでした。保存済みの結果があれば表示しています。','Could not refresh. Showing saved results if available.'):text('毎日5:00・16:30ごろ（タイ時間）に確認。抽選日を確認してください。','Checked around 05:00 and 16:30 Thailand time daily. Check the draw date.');
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
$('lotto-check-form').addEventListener('submit',event=>{event.preventDefault();checked=true;check()});
$('lotto-ticket').addEventListener('input',()=>{checked=false;$('lotto-check-result').textContent=''});
$('lotto-refresh').addEventListener('click',load);
$('language').addEventListener('click',render);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load()});
load();
