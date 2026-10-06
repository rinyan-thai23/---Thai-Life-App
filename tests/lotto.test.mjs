import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseLotto,validateLotto,checkTicket} from '../docs/lotto-schema.mjs';
const result={date:'2026-10-01',first:['402701'],last2:['70'],last3f:['791','912'],last3b:['058','396'],near1:['402700','402702'],pdf_url:'https://api.glo.or.th/utility/file/download/example'};
for(const [key,count] of Object.entries({second:5,third:10,fourth:50,fifth:100}))result[key]=Array.from({length:count},(_,i)=>String(i).padStart(6,'0'));
function raw(){return {status:true,response:{status:1,date:result.date,pdf_url:result.pdf_url,data:Object.fromEntries(['first','last2','last3f','last3b','near1','second','third','fourth','fifth'].map(k=>[k,{number:result[k].map(value=>({value}))}]))}}}
test('compact parsing retains leading zeros and only display fields',()=>{assert.deepEqual(parseLotto(raw()),result)});
test('partial draw and failed status are rejected',()=>{const r=raw();r.response.data.last3b.number=[];assert.throws(()=>parseLotto(r));assert.throws(()=>parseLotto({status:false}));});
test('invalid dates, unsafe links and numeric values are rejected',()=>{assert.throws(()=>validateLotto({...result,date:'2026-02-30'}));assert.throws(()=>validateLotto({...result,pdf_url:'https://evil.example/a.pdf'}));assert.throws(()=>validateLotto({...result,last2:[70]}));});
test('same-date correction produces different compact content',()=>{const r=raw();r.response.data.last2.number[0].value='71';assert.notEqual(JSON.stringify(parseLotto(r)),JSON.stringify(result));});

test('ticket check supports full-width digits and multiple prizes',()=>{assert.ok(checkTicket(result,'４０２７０１').includes('first'));assert.ok(checkTicket(result,'791070').includes('last3f'));assert.ok(checkTicket(result,'791070').includes('last2'));assert.ok(checkTicket(result,'999058').includes('last3b'));assert.ok(checkTicket(result,'000000').includes('fifth'));assert.throws(()=>checkTicket(result,'12345'));assert.deepEqual(checkTicket(result,'888888'),[])});
