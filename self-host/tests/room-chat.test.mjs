import test from 'node:test';import assert from 'node:assert/strict';import {Lobby} from '../lobby.mjs';

test('チャットは入室者全員で共有し、未入室者には公開せず名前はサーバー確定',()=>{
 const l=new Lobby(),a=l.join('話す人'),b=l.join('見る人');
 assert.throws(()=>l.chat('unknown','test'),e=>e.status===401);
 l.chat(a.id,'こんにちは <b>テスト</b>',1000);
 for(const p of [a,b])assert.deepEqual(l.snapshot(p.id).chat,[{id:1,name:'話す人',text:'こんにちは <b>テスト</b>',at:1000}]);
 assert.deepEqual(l.snapshot('unknown').chat,[]);
 const s=l.snapshot(a.id);s.chat[0].name='別名';assert.equal(l.snapshot(b.id).chat[0].name,'話す人');
});

test('200文字・空白・制御文字・連投を検証し、直近60件だけ保持',()=>{
 const l=new Lobby(),a=l.join('話す人');
 for(const text of ['', '  ', 'x'.repeat(201), '\nabc\nxyz', '\u0000', null])assert.throws(()=>l.chat(a.id,text,1000));
 l.chat(a.id,'😀'.repeat(200),1000);assert.throws(()=>l.chat(a.id,'連投',1799),e=>e.status===429);l.chat(a.id,'次',1800);
 for(let n=0;n<65;n++)l.chat(a.id,String(n),3000+n*800);
 assert.equal(l.snapshot(a.id).chat.length,60);assert.equal(l.snapshot(a.id).chat.at(-1).text,'64');
});

test('対局/CPU/再戦でも履歴を保ち、全員退出で消す。勝者記録に影響しない',()=>{
 const l=new Lobby(),a=l.join('対戦者'),b=l.join('相手'),c=l.join('観戦者');l.chat(a.id,'対戦前',1000);l.ready(a.id,true);l.ready(b.id,true);l.mode(c.id,'cpu');l.chat(c.id,'CPU中',2000);
 l.resign(b.id);assert.equal(a.wins,1);assert.equal(l.snapshot(c.id).chat.length,2);l.release();assert.equal(l.snapshot(a.id).chat.length,2);assert.equal(a.ready,true);assert.equal(b.ready,false);
 for(const p of [a,b,c])l.leave(p.id);const d=l.join('新入室');assert.deepEqual(l.snapshot(d.id).chat,[]);
});
