import test from 'node:test';import assert from 'node:assert/strict';
import {continuousWatchState,WATCH_REPLAY_DELAY} from '../public/continuous-watch.js';
import {chooseGomokuSkin} from '../public/gomoku-skins.js';
import {chooseSkin} from '../public/skins.js';

test('連続観戦は有効なCPU観戦のみ、終了6秒後に次戦が可能',()=>{
 const game={status:'finished',finishedAt:1000},local={mode:'watch',continuousWatch:true,game};
 assert.equal(WATCH_REPLAY_DELAY,6000);
 assert.deepEqual(continuousWatchState(local,1000),{enabled:true,remaining:6,ready:false});
 assert.equal(continuousWatchState(local,6999).ready,false);
 assert.deepEqual(continuousWatchState(local,7000),{enabled:true,remaining:0,ready:true});
 for(const l of [null,{...local,mode:'cpu'},{...local,continuousWatch:false}])assert.equal(continuousWatchState(l,99999).ready,false);
 assert.equal(continuousWatchState({...local,game:{status:'playing'}},99999).ready,false);
});

test('次戦・待受・通信切断は前の終了時刻を引き継がず、別枠には観戦状態を移せる',()=>{
 const local={mode:'watch',continuousWatch:true,game:{status:'finished',finishedAt:1000}};
 assert.equal(continuousWatchState(JSON.parse(JSON.stringify(local)),6999).remaining,1);
 const next={...local,game:{status:'playing',finishedAt:null}};
 assert.equal(continuousWatchState(next,99999).ready,false);
 next.game={status:'finished',finishedAt:10000};
 assert.equal(continuousWatchState(next,15999).ready,false);
 assert.equal(continuousWatchState(next,16000).ready,true);
 assert.equal(continuousWatchState(null,99999).ready,false);
});

test('連続するランダム背景はオセロ/五目とも直前と異なり、固定指定は維持',()=>{
 for(const choose of [chooseSkin,chooseGomokuSkin]){
  let previous;
  for(let n=0;n<40;n++){const next=choose('random',previous);assert.notEqual(next,previous);previous=next;}
  assert.equal(choose(previous,previous),previous);
 }
});
