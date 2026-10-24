import test from 'node:test';import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';import {once} from 'node:events';
test('HTTPで2人と観戦者が同じ五目盤を共有し、勝利・再戦・双方マーカーを同期する',async()=>{
 const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'18997',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
 const controllers=[];const base='http://127.0.0.1:18997';
 try{
  await Promise.race([once(server.stdout,'data'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('起動待ちタイムアウト')),5000).unref())]);
  const join=async name=>{const r=await fetch(base+'/api/join',{method:'POST',body:JSON.stringify({name})});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];};
  const post=async(cookie,route,data={})=>{const r=await fetch(base+'/api/'+route,{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,body:await r.json()};};
  const snapshot=async cookie=>{const ctl=new AbortController();controllers.push(ctl);const r=await fetch(base+'/api/events',{headers:{cookie},signal:ctl.signal});const {value}=await r.body.getReader().read();return JSON.parse(new TextDecoder().decode(value).split('\n')[0].slice(6));};
  const a=await join('黒白'),b=await join('対戦'),watch=await join('観戦');
  await post(a,'settings',{game:'gomoku',seconds:30});await post(b,'settings',{game:'othello',seconds:90});await post(a,'ready',{ready:true});await post(b,'ready',{ready:true});
  const lateMode=await post(a,'mode',{mode:'cpu'});assert.equal(lateMode.status,200);assert(lateMode.body.snapshot.match.side>0);assert.equal(lateMode.body.snapshot.me.mode,'match');
  const sa=await snapshot(a),sb=await snapshot(b),sw=await snapshot(watch);assert.equal(sa.match.game.kind,'gomoku');assert.equal(sa.match.game.seconds,30);assert.deepEqual(sa.match.game.board,sw.match.game.board);assert.equal(sw.match.side,0);
  const black=sa.match.side===1?a:b,white=black===a?b:a;assert.equal((await post(watch,'move',{index:0,revision:0})).status,403);
  await post(a,'highlight',{enabled:false});assert.equal((await snapshot(watch)).match.lastMoveHighlight,false);
  let g=sa.match.game;
  for(const [i,index]of [105,0,106,2,107,4,108,6,109].entries()){
   await new Promise(r=>setTimeout(r,Math.max(0,g.turnAt-Date.now()+30)));
   const result=await post(i%2?white:black,'move',{index,revision:g.revision});assert.equal(result.status,200,JSON.stringify(result.body));
   g=(await snapshot(watch)).match.game;
  }
  assert.equal(g.winner,1);assert.equal(g.reason,'五目完成');const final=await snapshot(black);assert.equal(final.me.wins,1);assert.equal(final.me.best,1);
  await post(watch,'leave');await post(a,'rematch',{matchId:final.match.id,accept:true});await post(b,'rematch',{matchId:final.match.id,accept:true});
  const next=await snapshot(black);assert.equal(next.match.game.kind,'gomoku');assert.equal(next.match.game.revision,0);assert.equal(next.me.wins,1);
 }finally{for(const c of controllers)c.abort();server.kill();await once(server,'exit');}
});
