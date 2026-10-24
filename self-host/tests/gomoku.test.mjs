import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,move,winningLine,coordinate,initialBoard} from '../public/gomoku-rules.js';
import {chooseMove} from '../public/gomoku-ai.js';
import {Lobby} from '../lobby.mjs';
import {normalizePreferences} from '../public/skins.js';
import {GOMOKU_SKINS,chooseGomokuSkin} from '../public/gomoku-skins.js';
test('五目は15路・四方向5個以上・端をまたがない・双方同じルール',()=>{
 assert.equal(initialBoard().length,225);assert.equal(coordinate(224),'O15');
 for(const color of [1,2])for(const step of [1,15,16,14]){const b=initialBoard(),origin=step===14?14:0;for(let n=0;n<6;n++)b[origin+n*step]=color;assert.equal(winningLine(b,origin+2*step,color).length,6);}
 const b=initialBoard();for(const i of [13,14,15,16,17])b[i]=1;assert.equal(winningLine(b,15,1).length,0);
});
test('開始前・手番違い・重複・不正交点・時間切れは着手拒否、五目で終局',()=>{
 const g=createGame(60,1000);assert.equal(move(g,112,1,1100),false);assert.equal(move(g,112,2,g.turnAt),false);
 for(const i of [-1,225,1.1])assert.equal(move(g,i,1,g.turnAt),false);
 for(let n=0;n<4;n++){assert(move(g,105+n,1,g.turnAt));assert.equal(move(g,105+n,2,g.turnAt),false);assert(move(g,n*2,2,g.turnAt));}
 assert(move(g,109,1,g.turnAt));assert.equal(g.status,'finished');assert.equal(g.winner,1);assert.equal(g.reason,'五目完成');assert.equal(move(g,110,2,g.turnAt+999),false);
 const timed=createGame(15,1000);assert.equal(move(timed,0,1,timed.deadline),false);assert.equal(timed.winner,2);
});
test('最後の空き交点で五目を作らなければ満局引き分け',()=>{
 const g=createGame(60,0);g.board=Array.from({length:225},(_,i)=>(Math.floor(i/15)+Math.floor(i%15/2))%2+1);g.board[0]=0;g.turn=2;
 assert(move(g,0,2,g.turnAt));assert.equal(g.winner,0);assert.equal(g.reason,'満局');
});
test('全CPU難易度が勝ちと即負け回避を優先し、静かな時のみ意外な手を選ぶ',()=>{
 for(let level=1;level<=10;level++){
  const b=initialBoard();for(let n=0;n<4;n++)b[105+n]=2;b[104]=1;
  assert.equal(chooseMove(b,1,level,()=>0),109);assert.equal(chooseMove(b,2,level,()=>0),109);
 }
 const b=initialBoard();b[112]=1;b[113]=2;const context={};const i=chooseMove(b,1,1,()=>0,context);assert.equal(b[i],0);const distance=Math.min(...[112,113].map(j=>Math.max(Math.abs(Math.floor(i/15)-Math.floor(j/15)),Math.abs(i%15-j%15))));assert(distance>=2&&distance<=3);assert.equal(context.lastSurprisePly,2);
 chooseMove(b,1,1,()=>0,context);assert.equal(context.lastSurprisePly,2);
});
test('CPU全10段階が合法手、CPU同士が勝負を終える・元盤面を破壊しない',()=>{
 for(let level=1;level<=10;level++){const b=initialBoard();b[112]=1;const before=b.slice();const i=chooseMove(b,2,level);assert.equal(b[i],0);assert.deepEqual(b,before);}
 for(const levels of [[1,2],[5,6],[9,10]]){const g=createGame(60,0),contexts=[{},{}];let seed=1234;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let n=0;n<225&&g.status==='playing';n++){const i=chooseMove(g.board,g.turn,levels[g.turn-1],random,contexts[g.turn-1]);assert(move(g,i,g.turn,g.turnAt));}assert.equal(g.status,'finished');}
});
test('先頭の希望ゲームでオンライン対局・五目勝利と再戦がwin/連勝を保持',()=>{
 const l=new Lobby(),a=l.join('先頭'),b=l.join('次');l.settings(a.id,{game:'gomoku',seconds:30});l.settings(b.id,{game:'othello'});l.ready(b.id,true);l.ready(a.id,true);
 assert.equal(l.match.game.kind,'gomoku');assert.equal(l.match.game.board.length,225);assert.equal(l.match.game.seconds,30);
 const m=l.match;for(let n=0;n<4;n++){l.play(m.ids[0],105+n,m.game.revision,m.game.turnAt);l.play(m.ids[1],n*2,m.game.revision,m.game.turnAt);}l.play(m.ids[0],109,m.game.revision,m.game.turnAt);
 assert.equal(l.players.get(m.ids[0]).wins,1);assert.equal(l.players.get(m.ids[0]).best,1);l.rematch(a.id,m.id,true);l.rematch(b.id,m.id,true);assert.equal(l.match.game.kind,'gomoku');assert.equal(l.match.game.seconds,30);assert.equal(l.players.get(m.ids[0]).wins,1);
});
test('五目の見た目は独立保存、既存八背景と新規十背景、毎試合の抽選は直前と別',()=>{
 const p=normalizePreferences({skin:'F2',stone:'glass',game:'gomoku',gomoku:{skin:'K7'}});assert.equal(p.skin,'F2');assert.equal(p.stone,'glass');assert.equal(p.gomoku.skin,'K7');assert.equal(p.gomoku.placeSound,'go');
 assert.deepEqual(GOMOKU_SKINS.map(s=>s.id),['K2','K5','K6','K7','K8','K9','C1','M1','P1','P7','P8','R1','R2','R3','R4','R5','R7','R8']);for(let n=0;n<100;n++)assert.notEqual(chooseGomokuSkin('random','K2'),'K2');
});
