import test from 'node:test';import assert from 'node:assert/strict';
import {describeGomokuMove} from '../public/gomoku-commentary.js';
const board=()=>Array(225).fill(0),event=(index,color=1)=>({index,color});
test('解説は位置・直前の着手・二連/三連に応じて決まり、局面を変更しない',()=>{
 const b=board();b[112]=1;assert.match(describeGomokuMove(b,event(112)),/中央に位/);
 const edge=board();edge[0]=2;assert.match(describeGomokuMove(edge,event(0,2)),/外側/);
 b[113]=1;assert.match(describeGomokuMove(b,event(113)),/横の二連/);
 b[114]=1;const before=b.slice();const text=describeGomokuMove(b,event(114));assert.match(text,/横の三連/);assert.deepEqual(b,before);assert.equal(text,describeGomokuMove(b,event(114)));assert.equal(text.split('\n').length,2);
 const reply=board();reply[112]=1;reply[128]=2;assert.match(describeGomokuMove(reply,event(128,2),event(112)),/直前の一着/);
 reply[30]=2;assert.match(describeGomokuMove(reply,event(30,2),event(112)),/外周|端/);
});
test('四連以上は個数・勝ち筋・防御・完成に触れず、他方向の三連も語らない',()=>{
 for(const color of [1,2])for(const step of [1,15,16,14])for(const length of [4,5,6]){
  const b=board(),origin=step===14?14:0;for(let n=0;n<length;n++)b[origin+step*n]=color;
  const text=describeGomokuMove(b,event(origin+step*(length-1),color));assert.doesNotMatch(text.split('\n')[1],/連|四|五|4|5|リーチ|勝ち|完成|防|阻止|脅威|詰め/);
 }
 const b=board();for(const i of [110,111,112,113,82,97])b[i]=1;assert.doesNotMatch(describeGomokuMove(b,event(112)),/三連|二連/);
 const block=board();for(const i of [108,109,110,111])block[i]=2;block[112]=1;assert.doesNotMatch(describeGomokuMove(block,event(112)),/連|防|阻止|勝ち|脅威/);
});
test('盤の端で連を誤結合せず、解説は二行、次の座標や推奨を出さない',()=>{
 const b=board();b[14]=b[15]=1;const text=describeGomokuMove(b,event(15));assert.doesNotMatch(text,/二連/);
 for(let index=0;index<225;index++){const b=board();b[index]=1;const t=describeGomokuMove(b,event(index));assert.equal(t.split('\n').length,2);assert.doesNotMatch(t.split('\n')[1],/[A-O]\d|おすすめ|次は|打つべき/);assert(t.split('\n')[1].length<=28);}
});
