const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
function context() {
  const tables = {
    '為替': [['key','value'],['thb_jpy',4.6],['usd_thb',33],['is_sample',true],['as_of','']],
    'ラッキーナンバー': [['number','is_sample','date'],['07',true,''],['18',true,''],['63',true,'']],
    '休日': [['date','name_ja','name_en','type','province','source','checked_at'],['2026-01-01','元日','New Year','bank','all','https://example.org','2026-01-01']],
    '出力': [['key','value'],['updated_at','old'],['daily_json','old JSON']]
  };
  let failOutput = false;
  function sheet(name) {
    function range(row,col,n,m) {return {
      getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>tables[name][row+i-1]?.[col+j-1]??'')),
      setValues(values){
        if(name==='出力'&&failOutput){failOutput=false;throw Error('write failed')}
        assert.equal(values.length,n);values.forEach((r,i)=>{assert.equal(r.length,m);tables[name][row+i-1]??=[];r.forEach((v,j)=>tables[name][row+i-1][col+j-1]=v)});return this;
      },
      clearContent(){for(let i=0;i<n;i++)for(let j=0;j<m;j++)if(tables[name][row+i-1])tables[name][row+i-1][col+j-1]='';return this},
      setNumberFormat(){return this}
    }}
    return {getDataRange:()=>range(1,1,tables[name].length,Math.max(...tables[name].map(r=>r.length))),getRange:range};
  }
  const c=vm.createContext({console,Utilities:{formatDate:()=> '2026-10-05T03:00:00+07:00'},
    PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'test'})},
    SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush(){}},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})}});
  vm.runInContext(fs.readFileSync(path.join(root,'gas/Code.gs'),'utf8')+'\n'+fs.readFileSync(path.join(root,'gas/Updates.gs'),'utf8'),c);
  return {c,tables,fail:()=>failOutput=true};
}
test('FX converts USD quotes to THB/JPY and rejects stale/mismatched/invalid quotes',()=>{
  const {c}=context();const data=[{base:'USD',quote:'JPY',rate:157.67,date:'2026-10-02'},{base:'USD',quote:'THB',rate:33.595,date:'2026-10-02'}];
  assert.equal(c.parseExchangeRates_(data,'2026-10-05').thb_jpy,157.67/33.595);
  assert.throws(()=>c.parseExchangeRates_(data,'2026-10-20'));
  assert.throws(()=>c.parseExchangeRates_([data[0],{...data[1],date:'2026-10-01'}],'2026-10-05'));
  assert.throws(()=>c.parseExchangeRates_([data[0],{...data[1],rate:0}],'2026-10-05'));
});
test('random draws always contain three distinct two-digit strings, including 00',()=>{
  const {c}=context();assert.equal(c.randomLuckyNumbers_(()=>0).join(','),'00,01,02');
  for(let i=0;i<1000;i++){const n=c.randomLuckyNumbers_(Math.random);assert.equal(new Set(n).size,3);assert.ok(n.every(x=>/^\d{2}$/.test(x)))}
});
test('official BOT fixtures parse current/next year and Bangkok restriction',()=>{
  const {c}=context();
  for(const y of [2026,2027]){const data=JSON.parse(fs.readFileSync(path.join(__dirname,`fixtures/bot-${y}.json`)));const rows=c.parseHolidays_(data,y,'2026-10-05');assert.ok(rows.length>=18);assert.ok(rows.every(r=>r[0].startsWith(String(y))));if(y===2026)assert.equal(rows.find(r=>r[0]==='2026-10-16')[4],'Bangkok')}
  assert.throws(()=>c.parseHolidays_({holidayCalendarLists:[{year:'2026',month:'February',date:'Monday 30',holidayDescription:'Bad date'}]},2026,'2026-10-05'));
});
test('successful lucky update publishes JSON with correct strings and timestamp',()=>{
  const {c,tables}=context();const d=JSON.parse(c.updateLuckyNumbers());assert.equal(d.lucky.numbers.length,3);assert.equal(d.lucky.is_sample,false);assert.equal(d.lucky.date,'2026-10-05');assert.ok(d.lucky.updated_at);assert.equal(JSON.parse(tables['出力'][2][1]).lucky.numbers.join(','),d.lucky.numbers.join(','));
});
test('invalid input keeps sheets and published JSON unchanged',()=>{
  const {c,tables}=context();const before=JSON.stringify(tables);assert.throws(()=>c.updateSection_('為替',[['thb_jpy',0],['usd_thb',33],['is_sample',false],['as_of','2026-10-05']]));assert.equal(JSON.stringify(tables),before);
});
test('output write failure rolls back the changed sheet and keeps old JSON',()=>{
  const {c,tables,fail}=context();fail();assert.throws(()=>c.updateLuckyNumbers(),/write failed/);assert.equal(tables['ラッキーナンバー'][1][0],'07');assert.equal(tables['出力'][2][1],'old JSON');
});
test('holiday update preserves manually entered non-BOT holidays',()=>{
  const {c,tables}=context();const rows=c.parseHolidays_(JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/bot-2026.json'))),2026,'2026-10-05');
  tables['休日'][1][0]='2026-02-01';const d=JSON.parse(c.updateSection_('休日',rows,{year:2026,nextPublished:false}));assert.ok(d.holidays.some(h=>h.source==='https://example.org'));assert.equal(d.holidays.length,21);
});
