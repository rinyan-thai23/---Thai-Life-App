import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFuel} from '../scripts/update-fuel.mjs';
const fixture=()=>[{OilDateNow:'14/10/2026',OilList:JSON.stringify(['a','b','c','d'].map(name=>({OilName:name,PriceToday:35.5})))}];
test('fuel unwraps official list without trusting contradictory difference fields',()=>{const r=fixture();const parsed=parseFuel(r);assert.equal(parsed.items.length,4);assert.equal(parsed.items[0].price,35.5)});
test('fuel rejects incomplete, invalid, and duplicate data',()=>{assert.throws(()=>parseFuel([]));const r=fixture();r[0].OilList='[]';assert.throws(()=>parseFuel(r));r[0].OilList=JSON.stringify(Array(4).fill({OilName:'a',PriceToday:0}));assert.throws(()=>parseFuel(r));r[0].OilList=JSON.stringify(Array(4).fill({OilName:'a',PriceToday:30}));assert.throws(()=>parseFuel(r))});
