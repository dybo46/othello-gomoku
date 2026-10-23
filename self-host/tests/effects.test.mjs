import test from 'node:test';import assert from 'node:assert/strict';
import {EFFECTS,normalizeEffects,describeMove} from '../public/effect-catalog.js';
import {selectEffect} from '../public/effects.js';
import {normalizePreferences} from '../public/skins.js';
test('OFFの演出はランダムにも固定選択にも出ない',()=>{for(let n=0;n<=100;n++){assert.equal(selectEffect('random',['laser'],()=>n/100),'laser');assert.equal(selectEffect('blast',['laser'],()=>n/100),'laser');}assert.deepEqual(normalizeEffects(['laser','invalid','laser']),['laser']);});
test('旧設定・不正な全OFFの設定を開いても演出が消えない',()=>{assert.equal(normalizePreferences({}).enabledEffects.length,21);assert.equal(normalizePreferences({enabledEffects:[]}).enabledEffects.length,21);assert.deepEqual(normalizePreferences({enabledEffects:['shove'],effectCatalog:EFFECTS.map(e=>e.id)}).enabledEffects,['shove']);assert.equal(normalizePreferences({enabledEffects:['shove']}).enabledEffects.length,16);});
test('着手欄は座標・色・演出名・その手で変えた石数を示す',()=>{const text=describeMove({index:0,color:2,captured:[1,2,3,4,5]},'laser');assert.match(text,/白がA-1に着手/);assert.match(text,/高圧レーザー/);assert.match(text,/黒5石/);assert.ok(!text.includes('総数'));assert.equal(new Set(EFFECTS.map(e=>e.id)).size,21);});

test('レーザー6種は3石未満で出ない・条件付き固定と全OFF相当も安全',()=>{const ids=EFFECTS.filter(e=>e.minCaptured===3).map(e=>e.id);assert.equal(ids.length,6);for(const id of ids){for(const count of [1,2]){assert.equal(selectEffect(id,[id],()=>0,count),null);assert.equal(selectEffect(id,[id,'flip'],()=>0,count),'flip');}for(const count of [3,5,20])assert.equal(selectEffect(id,[id],()=>0,count),id);}for(let n=0;n<100;n++)assert.ok(!ids.includes(selectEffect('random',EFFECTS.map(e=>e.id),()=>n/100,2)));});
