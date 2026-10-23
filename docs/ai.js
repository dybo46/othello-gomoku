import {legal,flips,counts} from './rules.js';
const weights=[100,-24,12,6,6,12,-24,100,-24,-45,-4,-3,-3,-4,-45,-24,12,-4,5,2,2,5,-4,12,6,-3,2,1,1,2,-3,6,6,-3,2,1,1,2,-3,6,12,-4,5,2,2,5,-4,12,-24,-45,-4,-3,-3,-4,-45,-24,100,-24,12,6,6,12,-24,100];
const depths=[1,1,2,2,3,3,4,4,5,6],budgets=[35,45,60,80,110,150,230,350,600,900];
function apply(b,i,c){const next=b.slice();next[i]=c;for(const x of flips(b,i,c))next[x]=c;return next;}
function evaluate(b,c){let value=0,front=0;const empty=b.filter(x=>!x).length;
  for(let i=0;i<64;i++)if(b[i]){let w=weights[i];if([1,8,9].includes(i)&&b[0])w=4;if([6,14,15].includes(i)&&b[7])w=4;if([48,49,57].includes(i)&&b[56])w=4;if([54,55,62].includes(i)&&b[63])w=4;value+=(b[i]===c?1:-1)*w;
    const y=i>>3,x=i%8;for(const d of [-8,8,-1,1]){const n=i+d;if(n>=0&&n<64&&Math.abs((n%8)-x)<=1&&!b[n]){front+=b[i]===c?-1:1;break;}}
  }
  const score=counts(b);return value+5*(legal(b,c).length-legal(b,3-c).length)+front*2+(score[c-1]-score[2-c])*(empty<14?5:empty<30?0.3:-0.6);
}
export function chooseMove(board,color,level=5,options={}){
  level=Math.min(10,Math.max(1,Math.round(Number(level)||5)));const rng=options.random||Math.random,moves=legal(board,color);if(!moves.length)return null;
  if(level===1&&rng()<.65)return moves[Math.floor(rng()*moves.length)];
  const end=performance.now()+(options.budgetMs??budgets[level-1]);let nodes=0;
  function search(b,c,depth,alpha,beta,passed=false){
    if((++nodes&31)===0&&performance.now()>end)throw new Error('time');
    const list=legal(b,c);if(!list.length){if(passed){const sc=counts(b),diff=sc[c-1]-sc[2-c];return diff===0?0:Math.sign(diff)*100000+diff;}return -search(b,3-c,depth,-beta,-alpha,true);}
    if(depth<=0)return evaluate(b,c);
    list.sort((a,z)=>weights[z]-weights[a]);let best=-Infinity;
    for(const i of list){const value=-search(apply(b,i,c),3-c,depth-1,-beta,-alpha);best=Math.max(best,value);alpha=Math.max(alpha,value);if(alpha>=beta)break;}return best;
  }
  let ranked=moves.map(i=>({i,v:evaluate(apply(board,i,color),color)}));
  const empties=board.filter(x=>!x).length,target=level>=9&&empties<=9?empties:depths[level-1];
  for(let depth=1;depth<=target;depth++){
    try{const iteration=[];for(const {i}of ranked){if(performance.now()>end)throw new Error('time');iteration.push({i,v:-search(apply(board,i,color),3-color,depth-1,-Infinity,Infinity)});}ranked=iteration.sort((a,b)=>b.v-a.v);}catch{break;}
  }
  ranked.sort((a,b)=>b.v-a.v);
  // Nearby alternatives create fallibility without replacing every difficult turn with random play.
  const mistake=[.7,.6,.48,.4,.32,.27,.22,.17,.07,.03][level-1];
  if(ranked.length>1&&rng()<mistake){const pool=ranked.slice(1,Math.min(ranked.length,level<=4?5:3));return pool[Math.floor(rng()*pool.length)].i;}
  return ranked[0].i;
}
