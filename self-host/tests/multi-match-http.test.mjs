import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';

test('HTTP: 5人で2対局、誰でも双方同意・観戦先・着手と勝敗を別々に同期',async()=>{
 const server=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'18998',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});const base='http://127.0.0.1:18998';
 try{
  await Promise.race([once(server.stdout,'data'),new Promise((_,reject)=>setTimeout(()=>reject(Error('起動待ち')),5000).unref())]);
  const post=async(cookie,route,data={})=>{const r=await fetch(base+'/api/'+route,{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,body:await r.json()};};
  const clients=[];
  for(let n=1;n<=5;n++){const r=await fetch(base+'/api/join',{method:'POST',body:JSON.stringify({name:'人'+n})});assert.equal(r.status,200);clients.push(r.headers.get('set-cookie').split(';')[0]);}
  const state=async c=>(await post(c,'mode',{mode:'lobby'})).body.snapshot;
  await post(clients[2],'settings',{game:'gomoku',seconds:90});
  for(const c of clients.slice(0,4))await post(c,'ready',{ready:true});
  let s=await state(clients[4]);assert.equal(s.matches.length,1);const first=s.match.id;
  await post(clients[2],'anyone',{enabled:true});assert.equal((await state(clients[4])).matches.length,1);
  await post(clients[3],'anyone',{enabled:true});s=await state(clients[4]);assert.equal(s.matches.length,2);const second=s.matches.find(m=>m.id!==first).id;
  assert.equal(s.match.id,first);assert.equal(s.players[3].anyone,true);
  assert.equal((await post(clients[4],'spectate',{matchId:second})).status,200);s=await state(clients[4]);assert.equal(s.match.id,second);assert.equal(s.match.game.kind,'gomoku');assert.equal(s.match.game.seconds,90);
  assert.equal((await post(clients[2],'spectate',{matchId:first})).status,409);
  const a=await state(clients[0]),b=await state(clients[2]);assert.equal(a.match.id,first);assert.equal(b.match.id,second);
  const blackMain=a.match.side===1?clients[0]:clients[1],blackSide=b.match.side===1?clients[2]:clients[3],whiteSide=blackSide===clients[2]?clients[3]:clients[2];
  await new Promise(r=>setTimeout(r,Math.max(0,Math.max(a.match.game.turnAt,b.match.game.turnAt)-Date.now()+20)));
  assert.equal((await post(blackMain,'move',{index:19,revision:0,matchId:first})).status,200);
  assert.equal((await post(blackSide,'move',{index:105,revision:0,matchId:first})).status,409);
  assert.equal((await post(blackSide,'move',{index:105,revision:0,matchId:second})).status,200);
  assert.equal((await state(clients[0])).match.game.revision,1);assert.equal((await state(clients[4])).match.game.revision,1);
  assert.equal((await post(clients[4],'move',{index:0,revision:1,matchId:second})).status,403);
  await post(clients[4],'chat',{text:'二つの対局に同じ会話'});assert.equal((await state(clients[0])).chat.at(-1).text,(await state(clients[2])).chat.at(-1).text);
  await post(whiteSide,'resign',{matchId:second});s=await state(blackSide);assert.equal(s.me.wins,1);assert.equal(s.me.ready,true);assert.equal((await state(clients[0])).match.game.status,'playing');
  await post(whiteSide,'result-back',{matchId:second});assert.equal((await state(clients[4])).match.id,first);assert.equal((await state(blackSide)).me.wins,1);
 }finally{server.kill();await once(server,'exit');}
});
