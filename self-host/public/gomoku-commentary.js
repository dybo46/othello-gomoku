import {coordinate} from './gomoku-rules.js';
const axes=[[0,1,'横'],[1,0,'縦'],[1,1,'斜め'],[1,-1,'斜め']];
function at(board,y,x){return y>=0&&y<15&&x>=0&&x<15?board[y*15+x]:-1;}
function line(board,y,x,color,dy,dx){
 let count=1,open=0;
 for(const sign of [-1,1]){let n=1;while(at(board,y+dy*n*sign,x+dx*n*sign)===color){count++;n++;}if(at(board,y+dy*n*sign,x+dx*n*sign)===0)open++;}
 return {count,open};
}
// Theatrical commentary, not a reliable evaluation. Position selects the rhetoric.
// Describes the move already made. Never recommends a future intersection or
// exposes a four/five threat, completion, open four, or compulsory reply.
export function describeGomokuMove(board,last,previous=null){
 if(!last||!Number.isInteger(last.index)||last.index<0||last.index>=225)return '';
 const {index,color}=last,y=Math.floor(index/15),x=index%15,edge=Math.min(y,x,14-y,14-x);
 const lines=axes.map(([dy,dx,direction])=>({...line(board,y,x,color,dy,dx),direction}));
 // Also suppress tactical language when the move intersects an opponent's
 // four-stone formation. Do not accidentally reveal it as a defensive comment.
 const sensitive=lines.some(l=>l.count>=4)||axes.some(([dy,dx])=>line(board,y,x,3-color,dy,dx).count>=5);
 let comment=sensitive?(edge<=2?'外周の位を張り、盤の幅に含みを残します。':'中央に軸足を移し、局面の呼吸を測ります。'):null;
 if(!sensitive){
  const triple=lines.find(l=>l.count===3);
  const pairs=lines.filter(l=>l.count===2);
  if(triple)comment=triple.open===2?`${triple.direction}の三連。両翼の含みで主導権を問います。`:`${triple.direction}の三連。形の厚みを手順の綾に託します。`;
  else if(pairs.length>=2)comment='二方向の二連。遠近の呼応を織り込みます。';
  else if(pairs.length)comment=`${pairs[0].direction}の二連。厚みの収支を先に預ける一着です。`;
 }
 if(!comment){
  let allies=0,enemies=0,near=0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(!dy&&!dx)continue;const v=at(board,y+dy,x+dx);if(v===color)allies++;if(v===3-color)enemies++;if(v>0)near++;}
  const placed=board.filter(Boolean).length;
  const distance=previous?Math.max(Math.abs(y-Math.floor(previous.index/15)),Math.abs(x-previous.index%15)):99;
  if(placed===1)comment=edge>=5?'中央に位を取り、盤の呼吸を先取りします。':'外側に足場を求める、遠心的な布石です。';
  else if(edge===0)comment='端の利きを借り、外勢の収支を預けます。';
  else if(edge<=2)comment='外周の位を張り、中央との呼応を測ります。';
  else if(near===0)comment='遠い大場へ転じ、局面の重心を問い直します。';
  else if(previous&&previous.color!==color&&distance<=1)comment='直前の一着に応じ、接点の虚実を問います。';
  else if(allies>=3&&enemies===0)comment='自陣の厚みを資本に、手割りの勘定を整えます。';
  else if(enemies>=2&&allies>=1)comment='双方の勢力の狭間で、形の弾力を試します。';
  else if(allies>0)comment='味方と呼応し、連絡の含みを宙に預けます。';
  else if(enemies>0)comment='相手の勢力に身を寄せ、間合いの虚実を測ります。';
  else comment='中央の位を軸に、大局の余白を留保します。';
 }
 return `${color===1?'黒':'白'}が${coordinate(index)}に置きました。\n${comment}`;
}
