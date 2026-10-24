import test from 'node:test';import assert from 'node:assert/strict';import {Lobby} from '../lobby.mjs';
for(const game of ['othello','gomoku'])for(const mode of ['cpu','watch']){
 test(`${game}: ネット準備を保って${mode}へ入り、相手が準備するとネット対戦へ移る`,()=>{
  const l=new Lobby(),a=l.join('先頭'),b=l.join('相手');l.settings(a.id,{game,seconds:90});l.ready(a.id,true);l.mode(a.id,mode);assert.equal(a.ready,true);assert.equal(a.mode,mode);assert.equal(l.match,null);
  l.settings(b.id,{game:game==='othello'?'gomoku':'othello',seconds:30});l.ready(b.id,true);assert(l.match);assert.equal(l.match.game.kind,game);assert.equal(l.match.game.seconds,90);assert.equal(l.match.owner,a.name);assert.equal(a.mode,'match');assert.equal(a.ready,false);assert(l.snapshot(a.id).match.side>0);
  // A late mode response must not demote a newly matched player.
  l.mode(a.id,mode);assert.equal(a.mode,'match');assert.equal(l.players.get(a.id).wins,0);
 });
 test(`${game}: ${mode}中でもネット準備のON/OFF、通常待受へ戻っても準備状態を維持`,()=>{
  const l=new Lobby(),a=l.join('自分'),b=l.join('相手');l.settings(a.id,{game});l.mode(a.id,mode);l.ready(a.id,true);assert.equal(a.ready,true);l.ready(a.id,false);l.ready(b.id,true);assert.equal(l.match,null);
  l.mode(a.id,'lobby');assert.equal(a.ready,false);l.mode(a.id,mode);l.ready(a.id,true);assert(l.match);
 });
}
test('前の試合を観戦しながらCPUとネット準備、先頭の待機者から次の2人を選ぶ',()=>{
 const l=new Lobby(),p=Array.from({length:5},(_,i)=>l.join('人'+i));l.ready(p[0].id,true);l.ready(p[1].id,true);l.mode(p[2].id,'cpu');l.mode(p[3].id,'watch');l.ready(p[2].id,true);l.ready(p[3].id,true);l.ready(p[4].id,true);
 const first=l.match;l.resign(first.ids[1]);l.release();assert.deepEqual(new Set(l.match.ids),new Set([p[2].id,p[3].id]));assert.equal(p[4].ready,true);assert.equal(l.players.get(first.ids[0]).wins,1);assert.equal(l.players.get(p[2].id).wins,0);
});
