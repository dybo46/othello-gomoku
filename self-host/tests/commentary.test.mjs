import test from 'node:test';import assert from 'node:assert/strict';
import {describeGomokuMove} from '../public/gomoku-commentary.js';
const board=()=>Array(225).fill(0),event=(index,color=1)=>({index,color});

test('実況は位置と短い褒め言葉を二行で表示し、盤面を変えない',()=>{
 const b=board();b[112]=1;const before=b.slice();
 const text=describeGomokuMove(b,event(112));
 assert.match(text,/^黒がH8に置きました。\n/);
 assert.deepEqual(b,before);assert.equal(text,describeGomokuMove(b,event(112)));
 const replies=new Set();
 for(let index=0;index<225;index++){
  const b=board();b[index]=2;const t=describeGomokuMove(b,event(index,2));
  assert.equal(t.split('\n').length,2);const comment=t.split('\n')[1];replies.add(comment);
  assert.doesNotMatch(comment,/[A-O]\d|おすすめ|次は|打つべき|二連|三連|四連|五連|布石|厚み|外勢|虚実|主導権|手割り/);
  assert(comment.length<=30);
 }
 assert(replies.size>=10);
});

test('自分の四連以上や別方向の三連は実況で知らせない',()=>{
 for(const color of [1,2])for(const step of [1,15,16,14])for(const length of [4,5,6]){
  const b=board(),origin=step===14?14:0;for(let n=0;n<length;n++)b[origin+step*n]=color;
  const comment=describeGomokuMove(b,event(origin+step*(length-1),color)).split('\n')[1];
  assert.doesNotMatch(comment,/連|四|五|4|5|リーチ|勝ち|完成|阻止|止め|脅威|詰め/);
 }
});

test('黒白・縦横斜めの四つ並びを止めた着手と間への割込みを褒める',()=>{
 for(const color of [1,2])for(const [dy,dx] of [[0,1],[1,0],[1,1],[1,-1]]){
  const cy=7,cx=7,index=cy*15+cx;
  for(const offsets of [[1,2,3,4],[-4,-3,-2,-1],[-2,-1,1,2]]){
   const b=board();b[index]=color;
   for(const n of offsets)b[(cy+dy*n)*15+cx+dx*n]=3-color;
   const before=b.slice(),text=describeGomokuMove(b,event(index,color));
   assert.match(text,/止め|受け止め/);assert.deepEqual(b,before);
   assert.doesNotMatch(text.split('\n')[1],/次|[A-O]\d|勝て|リーチ/);
  }
 }
});

test('三つ以下・離れた四つ・盤端の折返しでは止めたと誤解説しない',()=>{
 const cases=[];
 const three=board();for(const i of [108,109,110])three[i]=2;three[111]=1;cases.push([three,111]);
 const far=board();for(const i of [108,109,110,111])far[i]=2;far[113]=1;cases.push([far,113]);
 const edge=board();for(const i of [11,12,13,14])edge[i]=2;edge[15]=1;cases.push([edge,15]);
 for(const [b,index] of cases)assert.doesNotMatch(describeGomokuMove(b,event(index)),/止め|受け止め/);
 assert.equal(describeGomokuMove(board(),null),'');
});
