import {winningLine,legal,SIZE} from './gomoku-rules.js';
const directions=[[0,1],[1,0],[1,1],[1,-1]];
export function effectiveLevel(level,ply,context,random=Math.random){
 level=Math.max(1,Math.min(10,Math.round(level)));
 if(!context.latePlan){const roll=random();context.latePlan={drop:roll<.30?0:roll<.60?1:roll<.85?2:3,startPly:64+Math.min(23,Math.floor(random()*24))};}
 const {drop,startPly}=context.latePlan;
 const reduction=ply<startPly?0:Math.min(drop,1+Math.floor((ply-startPly)/16));
 return Math.max(1,level-reduction);
}
// Scores open lines and broken lines without changing the actual win rules.
export function strength(board,index,color){
 const row=Math.floor(index/SIZE),col=index%SIZE;let total=0;
 for(const [dy,dx]of directions){
  let run=1,open=0;
  for(const sign of [-1,1]){let n=1;for(;n<5;n++){const y=row+dy*n*sign,x=col+dx*n*sign;if(y<0||y>=15||x<0||x>=15||board[y*15+x]!==color)break;run++;}const y=row+dy*n*sign,x=col+dx*n*sign;if(y>=0&&y<15&&x>=0&&x<15&&!board[y*15+x])open++;}
  total+=run>=5?1e8:run===4?(open===2?2e6:open?140000:0):run===3?(open===2?18000:open?1600:0):run===2?(open===2?700:open?80:0):open*10;
  for(let start=-4;start<=0;start++){let count=0,blocked=false;for(let k=0;k<5;k++){const y=row+(start+k)*dy,x=col+(start+k)*dx;if(y<0||y>=15||x<0||x>=15){blocked=true;break;}const value=(start+k===0)?color:board[y*15+x];if(value===3-color){blocked=true;break;}if(value===color)count++;}if(!blocked)total+=[0,1,12,350,22000,1e8][count];}
 }
 return total;
}
export function chooseMove(board,color,level=5,random=Math.random,context={}){
 const available=legal(board);if(!available.length)return null;
 level=Math.max(1,Math.min(10,Math.round(level)));
 const ply=225-available.length;
 level=effectiveLevel(level,ply,context,random);
 // A short lapse lasts 2–3 own moves, then recovers. Never weaken a whole match
 // or inspect the human's record to force an outcome.
 context.softTurns??=0;context.softCooldown??=0;
 if(context.softTurns===0&&context.softCooldown===0&&random()<.10){context.softTurns=2+Math.floor(random()*2);context.softCooldown=6;}
 const lapse=context.softTurns>0?.10:0;
 if(context.softTurns>0)context.softTurns--;else if(context.softCooldown>0)context.softCooldown--;
 const pick=pool=>pool[Math.min(pool.length-1,Math.floor(Math.max(0,Math.min(.999999,random()))*pool.length))];
 if(available.length===225)return level<=3?pick([112,96,97,98,111,113,126,127,128]):112;
 const immediate=c=>available.filter(i=>{board[i]=c;const wins=winningLine(board,i,c).length>0;board[i]=0;return wins;});
 const wins=immediate(color);if(wins.length)return pick(wins);
 const blocks=immediate(3-color);
 // Attacking remains reliable; defensive concentration is imperfect. Any late
 // reduction comes only from the per-game plan, including a real no-drop case.
 const reliability=[0,.70,.74,.78,.81,.84,.87,.90,.92,.96,.98][level]-lapse;
 const missedDefense=blocks.length>0&&random()>reliability;
 if(blocks.length&&!missedDefense)return pick(blocks);
 const candidates=missedDefense?available.filter(i=>!blocks.includes(i)):available;
 if(!candidates.length)return pick(blocks);
 const ranked=candidates.map(i=>({i,attack:strength(board,i,color),defense:strength(board,i,3-color)}));
 const danger=Math.max(...ranked.map(m=>m.defense)),opportunity=Math.max(...ranked.map(m=>m.attack));
 // Surprise is allowed only in quiet positions; each side has a per-game cooldown.
 const last=context.lastSurprisePly??-100,interval=level<=3?4:level<=6?8:12;
 if(danger<18000&&opportunity<18000&&ply-last>=interval&&random()<(level<=3?.55:level<=6?.25:level<=8?.10:.025)){
  const occupied=board.flatMap((v,i)=>v?[i]:[]);
  const quiet=ranked.filter(m=>{const y=Math.floor(m.i/15),x=m.i%15;const distance=Math.min(...occupied.map(j=>Math.max(Math.abs(y-Math.floor(j/15)),Math.abs(x-j%15))));return distance>=(level<=3?2:1)&&distance<=(level<=3?3:2);});
  if(quiet.length){context.lastSurprisePly=ply;return pick(quiet).i;}
 }
 const attackTurn=missedDefense||random()<(level<=4?.30:level<=8?.22:.14)+lapse;
 const defenseWeight=attackTurn?.02:[0,.16,.20,.24,.28,.34,.40,.46,.52,.64,.72][level];
 for(const m of ranked){m.score=m.attack+m.defense*defenseWeight;const y=Math.floor(m.i/15),x=m.i%15;m.score+=14-Math.abs(y-7)-Math.abs(x-7);}
 ranked.sort((a,b)=>b.score-a.score);
 // Levels 9/10 additionally search for forcing forks. Smaller levels read lines only.
 if(level>=9&&danger<140000){
  const candidates=ranked.slice(0,10);
  for(const m of candidates){board[m.i]=color;let threats=0;for(const n of ranked.slice(0,32)){if(board[n.i])continue;board[n.i]=color;if(winningLine(board,n.i,color).length)threats++;board[n.i]=0;}board[m.i]=0;if(threats>=2)return m.i;}
 }
 const top=ranked[0].score,band=level>=9?.98:level>=7?.84:level>=4?.64:.4;
 return pick(ranked.filter(m=>m.score>=top*band).slice(0,level>=9?2:level>=6?3:6)).i;
}
