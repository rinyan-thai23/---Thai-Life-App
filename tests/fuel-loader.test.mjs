import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../docs/fuel.js',import.meta.url),'utf8');
test('fuel loads on start, throttles resume, refreshes on new day and allows manual retry',async()=>{
 let now=Date.parse('2026-10-14T08:00:00Z'),calls=0;
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
 const elements=new Map();const node=()=>({textContent:'',handlers:{},addEventListener(k,f){this.handlers[k]=f}});
 const doc={visibilityState:'visible',handlers:{},getElementById(id){if(!elements.has(id))elements.set(id,node());return elements.get(id)},addEventListener(k,f){this.handlers[k]=f}};
 vm.runInNewContext(source,{document:doc,Date:Clock,Intl,AbortSignal,fetch:async()=>{calls++;return {ok:false}}});
 const settle=()=>new Promise(r=>setImmediate(r));await settle();assert.equal(calls,1);
 doc.handlers.visibilitychange();await settle();assert.equal(calls,1);
 now+=30*60*1000;doc.visibilityState='hidden';doc.handlers.visibilitychange();assert.equal(calls,1);
 doc.visibilityState='visible';doc.handlers.visibilitychange();await settle();assert.equal(calls,2);
 await elements.get('fuel-refresh').handlers.click();assert.equal(calls,3);assert.equal(elements.get('fuel-refresh').disabled,false);
 now=Date.parse('2026-10-14T16:59:00Z');await elements.get('fuel-refresh').handlers.click();assert.equal(calls,4);
 now+=2*60*1000;doc.handlers.visibilitychange();await settle();assert.equal(calls,5);
});
