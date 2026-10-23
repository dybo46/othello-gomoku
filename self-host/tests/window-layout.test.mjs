import test from 'node:test';
import assert from 'node:assert/strict';
import {popupBounds,boardSize} from '../public/window-layout.js';
test('別枠の横長表示は適度な外寸で開き、縦長と往復できる',()=>{
  const screen={availWidth:1920,availHeight:1040,availLeft:0,availTop:0};
  assert.deepEqual(popupBounds(screen,false),{width:520,height:760,left:700,top:140});
  assert.deepEqual(popupBounds(screen,true),{width:1040,height:900,left:440,top:70});
  const saved={width:540,height:800,left:100,top:50};
  assert.deepEqual(popupBounds(screen,false,saved),saved);
});
test('別モニターや小さい画面でも別枠は作業領域からはみ出さない',()=>{
  const screen={availWidth:480,availHeight:640,availLeft:-480,availTop:100};
  assert.deepEqual(popupBounds(screen,false),{width:480,height:640,left:-480,top:100});
  assert.deepEqual(popupBounds(screen,false,{width:900,height:900,left:3000,top:-500}),{width:480,height:640,left:-480,top:100});
});

test('盤枠は添付基準の566pxを上限に、狭い画面では縮小する',()=>{assert.equal(boardSize(1800,1400),566);assert.equal(boardSize(700,566),566);assert.equal(boardSize(500,600),500);assert.equal(boardSize(700,420),420);});

import {DEFAULTS,normalizePreferences} from '../public/skins.js';
test('通常ページは横長を初期値に移行し、以後の縦長選択は保存できる',()=>{assert.equal(DEFAULTS.layout,'wide');assert.equal(normalizePreferences({}).layout,'wide');assert.equal(normalizePreferences({layout:'compact'}).layout,'wide');assert.equal(normalizePreferences({layout:'compact',layoutDefaultsVersion:2}).layout,'compact');});
