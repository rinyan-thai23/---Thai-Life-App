const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(root,'docs/daily.json')));
function app(fetch, url='', saved={}) {
  const elements = new Map();
  const c = vm.createContext({console,URL,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch,
    window:{THAI_LIFE_CONFIG:{dailyUrl:url}},
    localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},
    document:{getElementById(id){if(!elements.has(id))elements.set(id,{addEventListener(){}});return elements.get(id)},addEventListener(){}},
  });
  vm.runInContext(fs.readFileSync(path.join(root,'docs/app.js'),'utf8').replace(/init\(\);\s*$/, ''),c);
  vm.runInContext('renderDaily=()=>{};',c);
  return {c,saved,get:()=>vm.runInContext('({dailyData,dailyFailed,dailyLoading})',c)};
}
test('configured endpoint used, successful JSON cached and offline data preserved',async()=>{
  let failed=false,seen;
  const {c,get,saved}=app(async(url,options)=>{seen={url,options};if(failed)throw Error('offline');return {ok:true,json:async()=>fixture}},'https://script.google.com/macros/s/example/exec');
  await c.loadDaily();assert.equal(seen.url,'https://script.google.com/macros/s/example/exec');assert.equal(seen.options.credentials,'omit');assert.equal(get().dailyFailed,false);assert.ok(saved['thai-life-daily-cache']);
  failed=true;await c.loadDaily();assert.equal(get().dailyFailed,true);assert.equal(get().dailyData.fx.thb_jpy,fixture.fx.thb_jpy);
});
test('fresh page recovers only cache belonging to configured endpoint',async()=>{
  const saved={'thai-life-daily-cache':JSON.stringify({url:'https://example.org/old',data:fixture})};
  const {c,get}=app(async()=>{throw Error('offline')},'https://example.org/new',saved);await c.loadDaily();assert.equal(get().dailyData,null);
  const restored=app(async()=>{throw Error('offline')},'https://example.org/old',saved);await restored.c.loadDaily();assert.equal(restored.get().dailyData.fx.thb_jpy,fixture.fx.thb_jpy);
});
test('invalid JSON never replaces previous valid shared data',async()=>{
  let data=fixture;const {c,get}=app(async()=>({ok:true,json:async()=>data}));await c.loadDaily();data={error:'not ready'};await c.loadDaily();assert.equal(get().dailyFailed,true);assert.equal(get().dailyData.schema_version,1);
});
test('empty config uses bundled JSON and simultaneous refreshes share a request',async()=>{
  let calls=0,seen;const {c}=app(async url=>{calls++;seen=url;return {ok:true,json:async()=>fixture}});await Promise.all([c.loadDaily(),c.loadDaily()]);assert.equal(calls,1);assert.equal(seen,'daily.json');
});

test('loading state stays active until the response completes',async()=>{
  let finish;const {c,get}=app(()=>new Promise(resolve=>{finish=resolve}));
  const pending=c.loadDaily();assert.equal(get().dailyLoading,true);
  finish({ok:true,json:async()=>fixture});await pending;
  assert.equal(get().dailyLoading,false);assert.equal(get().dailyFailed,false);
});
