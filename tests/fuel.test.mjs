import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFuel} from '../scripts/update-fuel.mjs';
const fixture=()=>[{OilDateNow:'14/10/2026',OilList:JSON.stringify(['a','b','c','d'].map(name=>({OilName:name,PriceToday:35.5})))}];
test('fuel unwraps official list without trusting contradictory difference fields',()=>{const r=fixture();const parsed=parseFuel(r);assert.equal(parsed.items.length,4);assert.equal(parsed.items[0].price,35.5)});
test('fuel rejects incomplete, invalid, and duplicate data',()=>{assert.throws(()=>parseFuel([]));const r=fixture();r[0].OilList='[]';assert.throws(()=>parseFuel(r));r[0].OilList=JSON.stringify(Array(4).fill({OilName:'a',PriceToday:0}));assert.throws(()=>parseFuel(r));r[0].OilList=JSON.stringify(Array(4).fill({OilName:'a',PriceToday:30}));assert.throws(()=>parseFuel(r))});

test('fuel preserves tomorrow prices and does not invent missing values',()=>{const r=fixture();const rows=JSON.parse(r[0].OilList);rows[0].PriceTomorrow=36.25;r[0].OilList=JSON.stringify(rows);assert.equal(parseFuel(r).items[0].tomorrow,36.25);assert.equal(parseFuel(r).items[1].tomorrow,null);rows[0].PriceTomorrow=-1;r[0].OilList=JSON.stringify(rows);assert.throws(()=>parseFuel(r))});
