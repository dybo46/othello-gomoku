import {coordinate} from './gomoku-rules.js';
const axes=[[0,1],[1,0],[1,1],[1,-1]];
function at(board,y,x){return y>=0&&y<15&&x>=0&&x<15?board[y*15+x]:-1;}
function lineLength(board,y,x,color,dy,dx){
 let count=1;
 for(const sign of [-1,1]){
  let n=1;
  while(at(board,y+dy*n*sign,x+dx*n*sign)===color){count++;n++;}
 }
 return count;
}
const praise=[
 'これは良いところに置きました。',
 'これはいい手ですね。',
 'お見事です。いいところを選びましたね。',
 '落ち着いて置きました。いい感じですね。',
 'ここに置きましたか。なかなかやりますね。',
 'いいですね。思わずうなずいてしまいます。',
 '迷いのない一手です。見ていて気持ちがいいですね。',
 'これはなかなかの一手。堂々としていますね。',
 'さりげない一手ですが、いい雰囲気があります。',
 'おっと、そこを選びましたか。お見事ですね。',
 'いいところに手が伸びました。さすがですね。',
 'じっくり選んだような一手。いいですね。'
];
const blockPraise=[
 'よく止めました！これは見事な一手です。',
 '相手の狙いをしっかり止めました。お見事です！',
 'ここで止めましたね。よく気づきました！',
 'しっかり受け止めました。いい手ですね！'
];
// Friendly theatrical praise, never a strategic evaluation or a future hint.
// The only tactical exception is praise for a four already blocked by this move.
export function describeGomokuMove(board,last,previous=null){
 if(!last||!Number.isInteger(last.index)||last.index<0||last.index>=225||![1,2].includes(last.color))return '';
 const {index,color}=last,y=Math.floor(index/15),x=index%15;
 const blocked=axes.some(([dy,dx])=>lineLength(board,y,x,3-color,dy,dx)>=5);
 const placed=board.filter(Boolean).length;
 const pool=blocked?blockPraise:praise;
 const seed=index*17+color*11+placed*7+(previous?.index??0)*3;
 return `${color===1?'黒':'白'}が${coordinate(index)}に置きました。\n${pool[seed%pool.length]}`;
}
