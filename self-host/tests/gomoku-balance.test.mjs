import test from 'node:test';import assert from 'node:assert/strict';
import {chooseMove,effectiveLevel} from '../public/gomoku-ai.js';
import {initialBoard,createGame,move} from '../public/gomoku-rules.js';
test('CPUは即勝ちを逃さず、全レベルで甘い受けもある。甘い手は短く連続して回復する',()=>{
 for(let level=1;level<=10;level++){
  const b=initialBoard();for(let n=0;n<4;n++)b[105+n]=2;b[104]=1;
  assert.equal(chooseMove(b,2,level,()=>.999),109);
  assert.equal(chooseMove(b,1,level,()=>0),109);
  assert.notEqual(chooseMove(b,1,level,()=>.999),109);
 }
 const context={};const b=initialBoard();chooseMove(b,1,8,()=>0,context);assert.equal(context.softTurns,1);b[112]=1;chooseMove(b,2,8,()=>.999,context);assert.equal(context.softTurns,0);assert.equal(context.softCooldown,6);chooseMove(b,2,8,()=>0,context);assert.equal(context.softTurns,0);assert.equal(context.softCooldown,5);assert.equal(context.form,undefined);
});
test('意外な着手も石の近くへ置く。低レベルは2〜3路、中高レベルは1〜2路',()=>{
 for(let level=1;level<=10;level++){
  const b=initialBoard();b[112]=1;b[113]=2;const i=chooseMove(b,1,level,()=>0);const distance=Math.min(...[112,113].map(j=>Math.max(Math.abs(Math.floor(i/15)-Math.floor(j/15)),Math.abs(i%15-j%15))));assert(distance>=(level<=3?2:1)&&distance<=(level<=3?3:2));assert.equal(b[i],0);
 }
});
test('異なる難易度の全組合せを先後交代で試し、引き分けが2%以下になる',()=>{
 let total=0,draws=0;
 for(let a=1;a<=10;a++)for(let b=a+1;b<=10;b++)for(let seedIndex=0;seedIndex<3;seedIndex++)for(const reverse of [false,true]){
  let seed=12345+a*701+b*103+seedIndex*7919;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);const levels=reverse?[b,a]:[a,b],g=createGame(60,0),contexts=[{},{}];
  while(g.status==='playing')assert(move(g,chooseMove(g.board,g.turn,levels[g.turn-1],rng,contexts[g.turn-1]),g.turn,g.turnAt));
  total++;if(!g.winner)draws++;
 }
 assert.equal(total,270);assert(draws/total<=.02,`${draws}/${total} draws`);
});
test('後半の低下計画はCPUごと・試合ごと。低下なしから3段階まで、序盤は同じ強さ',()=>{
 for(const [roll,drop]of [[.1,0],[.4,1],[.7,2],[.95,3]]){
  const context={};assert.equal(effectiveLevel(10,0,context,()=>roll),10);assert.equal(context.latePlan.drop,drop);
  const start=context.latePlan.startPly;assert(start>=64&&start<=87);
  assert.equal(effectiveLevel(10,start-1,context,()=>0),10);
  assert.equal(effectiveLevel(10,start,context,()=>0),10-Math.min(drop,1));
  assert.equal(effectiveLevel(10,start+16,context,()=>0),10-Math.min(drop,2));
  assert.equal(effectiveLevel(10,224,context,()=>0),10-drop);
  assert.equal(effectiveLevel(1,224,context,()=>0),1);
 }
 const a={},b={};effectiveLevel(10,0,a,()=>.1);effectiveLevel(10,0,b,()=>.95);assert.equal(a.latePlan.drop,0);assert.equal(b.latePlan.drop,3);
});
