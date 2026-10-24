import {chooseResignEffect} from './resign-catalog.js';
export const VERSION='2.6';
export const DELAY=850;
export function normalizeTime(value){return [15,30,60,90,120,180,300].includes(Number(value))?Number(value):60;}
const dirs=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
export function flips(board,index,color){
  if(!Number.isInteger(index)||index<0||index>=64||board[index])return [];
  const row=index>>3,col=index%8,result=[];
  for(const [dy,dx]of dirs){let y=row+dy,x=col+dx,line=[];while(y>=0&&y<8&&x>=0&&x<8&&board[y*8+x]===3-color){line.push(y*8+x);y+=dy;x+=dx;}if(line.length&&y>=0&&y<8&&x>=0&&x<8&&board[y*8+x]===color)result.push(...line);}
  return result;
}
export function legal(board,color){const out=[];for(let i=0;i<64;i++)if(!board[i]&&flips(board,i,color).length)out.push(i);return out;}
export function counts(board){return [board.filter(c=>c===1).length,board.filter(c=>c===2).length];}
export function initialBoard(){const b=Array(64).fill(0);b[27]=b[36]=2;b[28]=b[35]=1;return b;}
export function createGame(seconds=60,now=Date.now()){
  return {board:initialBoard(),turn:1,seconds:normalizeTime(seconds),status:'playing',winner:null,reason:'',revision:0,last:null,pass:null,startAt:now+2600,turnAt:now+2600,deadline:now+2600+normalizeTime(seconds)*1000,result:null};
}
export function conclude(game,winner,reason,now=Date.now()){
  if(game.status!=='playing')return false;game.status='finished';game.winner=winner;game.reason=reason;if(reason==='降参')game.resignEffect=chooseResignEffect();game.result=counts(game.board);game.finishedAt=now;game.deadline=null;return true;
}
export function checkTime(game,now=Date.now()){if(game.status==='playing'&&now>=game.deadline)return conclude(game,3-game.turn,'時間切れ',now);return false;}
export function move(game,index,color,now=Date.now()){
  if(game.status!=='playing'||now<game.turnAt||game.turn!==color)return false;
  if(checkTime(game,now))return false;
  const captured=flips(game.board,index,color);if(!captured.length)return false;
  game.board[index]=color;for(const i of captured)game.board[i]=color;
  game.revision++;game.last={index,color,captured,at:now,revision:game.revision};game.pass=null;
  const next=3-color;
  if(legal(game.board,next).length)game.turn=next;
  else if(legal(game.board,color).length){game.turn=color;game.pass={color:next,at:now+DELAY};}
  else{const score=counts(game.board);conclude(game,score[0]===score[1]?0:score[0]>score[1]?1:2,'終局',now);return true;}
  game.turnAt=now+DELAY+(game.pass?1100:0);game.deadline=game.turnAt+game.seconds*1000;return true;
}
export function coordinate(index){return `${'ABCDEFGH'[index%8]}${(index>>3)+1}`;}
