import {normalizeTime,conclude,checkTime} from './rules.js';
export const SIZE=15;
export function coordinate(index){return `${'ABCDEFGHIJKLMNO'[index%SIZE]}${Math.floor(index/SIZE)+1}`;}
export function initialBoard(){return Array(SIZE*SIZE).fill(0);}
export function legal(board){return board.flatMap((v,i)=>v?[]:[i]);}
export function winningLine(board,index,color){
  const y=Math.floor(index/SIZE),x=index%SIZE;
  for(const [dy,dx] of [[0,1],[1,0],[1,1],[1,-1]]){
    const line=[index];
    for(const sign of [-1,1])for(let n=1;n<SIZE;n++){
      const r=y+dy*n*sign,c=x+dx*n*sign;
      if(r<0||r>=SIZE||c<0||c>=SIZE||board[r*SIZE+c]!==color)break;
      line.push(r*SIZE+c);
    }
    if(line.length>=5)return line;
  }
  return [];
}
export function createGame(seconds=60,now=Date.now()){
 const start=now+2600;
 return {kind:'gomoku',board:initialBoard(),turn:1,seconds:normalizeTime(seconds),status:'playing',winner:null,reason:'',revision:0,last:null,pass:null,startAt:start,turnAt:start,deadline:start+normalizeTime(seconds)*1000,result:null,winningLine:[]};
}
export function move(game,index,color,now=Date.now()){
 if(game.status!=='playing'||now<game.turnAt||game.turn!==color)return false;
 if(checkTime(game,now))return false;
 if(!Number.isInteger(index)||index<0||index>=225||game.board[index])return false;
 game.board[index]=color;game.revision++;game.last={index,color,captured:[],at:now,revision:game.revision};
 game.winningLine=winningLine(game.board,index,color);
 if(game.winningLine.length){conclude(game,color,'五目完成',now);return true;}
 if(!game.board.includes(0)){conclude(game,0,'満局',now);return true;}
 game.turn=3-color;game.turnAt=now+280;game.deadline=game.turnAt+game.seconds*1000;return true;
}
