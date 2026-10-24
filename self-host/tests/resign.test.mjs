import test from 'node:test';import assert from 'node:assert/strict';
import {RESIGN_EFFECTS,RESIGN_DURATION,chooseResignEffect,resignWindow} from '../public/resign-catalog.js';
import {createGame,conclude} from '../public/rules.js';
import {createGame as gomoku} from '../public/gomoku-rules.js';
import {Lobby} from '../lobby.mjs';
test('降参だけ5演出を抽選、石の状態と勝敗を変えず時間窓を終了する',()=>{
 assert.equal(new Set(RESIGN_EFFECTS.map(e=>e.id)).size,5);
 for(let n=0;n<5;n++)assert.equal(chooseResignEffect(()=>(n+.1)/5),RESIGN_EFFECTS[n].id);
 for(const make of [createGame,gomoku]){const g=make(60,0);g.board[0]=1;g.board[1]=2;const before=g.board.slice();conclude(g,2,'降参',5000);assert(RESIGN_EFFECTS.some(e=>e.id===g.resignEffect));assert.deepEqual(g.board,before);assert.equal(g.winner,2);assert.equal(resignWindow(g,4999),false);assert.equal(resignWindow(g,5000),true);assert.equal(resignWindow(g,5000+RESIGN_DURATION),false);const chosen=g.resignEffect;assert.equal(conclude(g,1,'降参',6000),false);assert.equal(g.resignEffect,chosen);}
 const timed=createGame();conclude(timed,2,'時間切れ');assert.equal(timed.resignEffect,undefined);assert.equal(resignWindow(timed,Date.now()),false);
});
test('対人降参は観戦者も同じ演出ID、winと連勝は一度だけ、再戦には演出を持ち越さない',()=>{
 const l=new Lobby(),a=l.join('一人'),b=l.join('二人');l.settings(a.id,{game:'gomoku'});l.ready(a.id,true);l.ready(b.id,true);const m=l.match;l.resign(m.ids[1]);const sa=l.snapshot(a.id),sb=l.snapshot(b.id);assert.equal(sa.match.game.resignEffect,sb.match.game.resignEffect);assert.equal(l.players.get(m.ids[0]).wins,1);l.resign(m.ids[1]);assert.equal(l.players.get(m.ids[0]).wins,1);l.rematch(a.id,m.id,true);l.rematch(b.id,m.id,true);assert.equal(l.match.game.resignEffect,undefined);assert.equal(l.match.game.status,'playing');
});
