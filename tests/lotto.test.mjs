import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseLotto,validateLotto} from '../docs/lotto-schema.mjs';
const result={date:'2026-10-01',first:['402701'],last2:['70'],last3f:['791','912'],last3b:['058','396'],near1:['402700','402702'],pdf_url:'https://api.glo.or.th/utility/file/download/example'};
function raw(){return {status:true,response:{status:1,date:result.date,pdf_url:result.pdf_url,data:Object.fromEntries(['first','last2','last3f','last3b','near1'].map(k=>[k,{number:result[k].map(value=>({value}))}]))}}}
test('compact parsing retains leading zeros and only display fields',()=>{assert.deepEqual(parseLotto(raw()),result)});
test('partial draw and failed status are rejected',()=>{const r=raw();r.response.data.last3b.number=[];assert.throws(()=>parseLotto(r));assert.throws(()=>parseLotto({status:false}));});
test('invalid dates, unsafe links and numeric values are rejected',()=>{assert.throws(()=>validateLotto({...result,date:'2026-02-30'}));assert.throws(()=>validateLotto({...result,pdf_url:'https://evil.example/a.pdf'}));assert.throws(()=>validateLotto({...result,last2:[70]}));});
test('same-date correction produces different compact content',()=>{const r=raw();r.response.data.last2.number[0].value='71';assert.notEqual(JSON.stringify(parseLotto(r)),JSON.stringify(result));});
