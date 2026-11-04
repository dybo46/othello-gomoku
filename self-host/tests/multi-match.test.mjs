import test from 'node:test';import assert from 'node:assert/strict';import {Lobby} from '../lobby.mjs';import {legal} from '../public/rules.js';
const room=()=>{const l=new Lobby(),p=['一番','二番','三番','四番','五番'].map(n=>l.join(n));return {l,p};};
const primary=(l,p)=>{l.ready(p[0].id,true);l.ready(p[1].id,true);return l.matchFor(p[0].id);};
const secondary=(l,p)=>{l.settings(p[2].id,{game:'gomoku',seconds:90});for(const n of [2,3]){l.anyone(p[n].id,true);l.ready(p[n].id,true);}return l.matchFor(p[2].id);};

test('初期は誰でもOFF。上の対局中は双方ONかつ待受ONの2人だけ別対局',()=>{
 const {l,p}=room();const a=primary(l,p);assert(p.every(x=>x.anyone===false));l.ready(p[2].id,true);l.ready(p[3].id,true);assert.equal(l.matches.length,1);
 l.anyone(p[2].id,true);assert.equal(l.matches.length,1);l.ready(p[3].id,false);l.anyone(p[3].id,true);assert.equal(l.matches.length,1);
 l.ready(p[3].id,true);const b=l.matchFor(p[2].id);assert.equal(l.matches.length,2);assert.notEqual(a.id,b.id);assert.deepEqual(new Set(b.ids),new Set([p[2].id,p[3].id]));
 assert.deepEqual(l.snapshot(p[4].id).players.map(p=>p.name),p.map(p=>p.name));
});

test('3番・4番は先の3番の五目/90秒。5番が誰でもでも二重所属しない',()=>{
 const {l,p}=room();primary(l,p);const b=secondary(l,p);l.anyone(p[4].id,true);l.ready(p[4].id,true);
 assert.equal(b.owner,p[2].name);assert.equal(b.game.kind,'gomoku');assert.equal(b.game.seconds,90);assert.equal(l.matches.length,2);
 const ids=l.matches.flatMap(m=>m.ids);assert.equal(new Set(ids).size,4);assert.equal(p[4].mode,'lobby');
});

test('両対局の着手・勝敗・winは独立し、別対局IDでの操作と観戦者の操作は拒否',()=>{
 const {l,p}=room();const a=primary(l,p),b=secondary(l,p);const ab=a.ids[0],bb=b.ids[0];
 l.play(ab,legal(a.game.board,1)[0],0,a.game.turnAt+1,a.id);l.play(bb,105,0,b.game.turnAt+1,b.id);
 assert.equal(a.game.revision,1);assert.equal(b.game.revision,1);assert.throws(()=>l.play(ab,0,1,a.game.turnAt+1,b.id),/更新/);assert.throws(()=>l.play(p[4].id,0,0),/対戦者/);
 l.resign(b.ids[1]);l.resign(b.ids[1]);assert.equal(l.players.get(bb).wins,1);assert.equal(a.game.status,'playing');assert.equal(l.players.get(ab).wins,0);
});

test('上の対局を標準観戦し、参加者の対局へ切替。自分の対局が常に最優先',()=>{
 const {l,p}=room();const a=primary(l,p),b=secondary(l,p);assert.equal(l.snapshot(p[4].id).match.id,a.id);
 l.spectate(p[4].id,b.id);assert.equal(l.snapshot(p[4].id).match.id,b.id);assert.equal(l.snapshot(p[4].id).match.side,0);
 assert.equal(l.snapshot(p[2].id).match.id,b.id);assert(l.snapshot(p[2].id).match.side>0);assert.throws(()=>l.spectate(p[2].id,a.id),/自分の対局/);
 l.resign(b.ids[1]);l.release(b);assert.equal(l.snapshot(p[4].id).match.id,a.id);assert.throws(()=>l.spectate(p[4].id,b.id),/終了/);
});

test('二つの対局それぞれの黄色表示条件。共有チャットはどちらの参加者にも届く',()=>{
 const {l,p}=room();const a=primary(l,p),b=secondary(l,p);l.highlight(a.ids[0],false);
 assert.equal(l.snapshot(p[0].id).match.lastMoveHighlight,false);assert.equal(l.snapshot(p[2].id).match.lastMoveHighlight,true);
 l.chat(p[2].id,'どちらの対局にも見える',1000);assert.equal(l.snapshot(p[0].id).chat[0].text,l.snapshot(p[4].id).chat[0].text);
 l.spectate(p[4].id,b.id);assert.equal(l.snapshot(p[4].id).match.lastMoveHighlight,true);
});

test('副対局の勝者は元の位置と待受を保ち、敗者だけ最後尾。次の誰でも待機者と対戦',()=>{
 const {l,p}=room();primary(l,p);const b=secondary(l,p);const winner=p[2],loser=p[3];l.resign(loser.id);l.release(b);
 assert.equal(winner.ready,true);assert.equal(loser.ready,false);assert.equal(l.order.indexOf(winner.id),2);assert.equal(l.order.at(-1),loser.id);
 l.anyone(p[4].id,true);l.ready(p[4].id,true);const next=l.matchFor(winner.id);assert(next);assert(next.ids.includes(p[4].id));assert.equal(next.game.kind,'gomoku');assert.equal(winner.wins,1);
});

test('主対局が空けば通常待受を再開し、進行中の副対局を壊さない',()=>{
 const {l,p}=room();const a=primary(l,p),b=secondary(l,p);l.ready(p[4].id,true);l.resign(a.ids[1]);l.release(a);
 assert.equal(l.matches.length,2);assert(l.matches.includes(b));assert.equal(b.game.status,'playing');assert(l.matchFor(p[4].id));assert.equal(p[4].anyone,false);
});

test('各対局の時間切れ・14秒解放を個別処理し、一方の退出で他方に勝敗がつかない',()=>{
 const {l,p}=room();const a=primary(l,p),b=secondary(l,p);b.game.deadline=a.game.deadline+30000;
 assert.equal(l.advance(a.game.deadline),true);assert.equal(a.game.status,'finished');assert.equal(b.game.status,'playing');
 const resultAt=a.game.finishedAt;l.advance(resultAt+14001);assert(!l.matches.includes(a));assert(l.matches.includes(b));
 l.leave(b.ids[0]);assert.equal(b.game.reason,'切断・退出');assert.equal(l.players.get(b.ids[1]).wins,1);
});

test('案内は誰でもの実候補の位置・希望を返し、観戦先だけでは待受希望が変わらない',()=>{
 const {l,p}=room();primary(l,p);l.settings(p[2].id,{game:'gomoku',seconds:90});l.anyone(p[2].id,true);l.ready(p[2].id,true);l.anyone(p[3].id,true);
 const n=l.snapshot(p[3].id).next;assert.equal(n.position,3);assert.equal(n.game,'gomoku');assert.equal(n.seconds,90);assert.equal(n.anyone,true);
 assert.equal(l.snapshot(p[3].id).match.game.kind,'othello');assert.equal(l.snapshot(p[4].id).next.position,1);
});

test('誰でもの変更は対局を中断しない。退出・再入室でOFFに戻る',()=>{
 const {l,p}=room();const a=primary(l,p);l.anyone(p[0].id,true);l.anyone(p[0].id,false);assert.equal(l.matchFor(p[0].id),a);l.leave(p[4].id);assert.equal(l.join('再入室').anyone,false);
});


test('誰でもONの3番と5番は、OFFの4番を飛ばして上から組む',()=>{
 const {l,p}=room();primary(l,p);l.settings(p[2].id,{game:'gomoku'});l.anyone(p[2].id,true);l.ready(p[2].id,true);l.ready(p[3].id,true);l.anyone(p[4].id,true);l.ready(p[4].id,true);
 const side=l.matchFor(p[2].id);assert(side.ids.includes(p[4].id));assert(!side.ids.includes(p[3].id));assert.equal(side.owner,p[2].name);assert.equal(p[3].mode,'lobby');
});

test('主対局が空いている場合の誰でも案内も通常列の先頭希望を示す',()=>{
 const {l,p}=room();l.settings(p[0].id,{game:'gomoku',seconds:90});l.ready(p[0].id,true);l.anyone(p[2].id,true);
 const info=l.snapshot(p[2].id).next;assert.equal(info.position,1);assert.equal(info.game,'gomoku');l.ready(p[2].id,true);assert.equal(l.matchFor(p[2].id).owner,p[0].name);
});
