import {boardPoint} from './board-geometry.js';
import {drawExtraEffect} from './effects-extra.js';
import {EFFECTS,EFFECT_IDS,normalizeEffects} from './effect-catalog.js';
export function selectEffect(preference,enabled,random=Math.random,captured=Infinity){const pool=normalizeEffects(enabled).filter(id=>captured>=(EFFECTS.find(e=>e.id===id)?.minCaptured||1));if(!pool.length)return null;return EFFECT_IDS.includes(preference)&&pool.includes(preference)?preference:pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];}
export class Effects{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.events=[];this.raf=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
  play(event,type,accent){this.events.push({event,type,accent,at:performance.now()});if(!this.raf)this.draw();}
  clear(){this.events=[];cancelAnimationFrame(this.raf);this.raf=0;this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}
  draw=()=>{const c=this.canvas,x=this.ctx,size=c.clientWidth,dpr=Math.min(devicePixelRatio||1,2);if(c.width!==Math.round(size*dpr)){c.width=Math.round(size*dpr);c.height=c.width;}x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,size,size);const now=performance.now();this.events=this.events.filter(e=>now-e.at<1000);for(const e of this.events){const t=(now-e.at)/1000,alpha=Math.max(0,1-t);x.globalAlpha=alpha;x.strokeStyle=e.accent;x.fillStyle=e.accent;const board=c.parentElement.querySelector('.board'),br=board.getBoundingClientRect(),cr=c.getBoundingClientRect(),rect={left:br.left-cr.left+board.clientLeft,top:br.top-cr.top+board.clientTop,width:br.width-board.clientLeft*2,height:br.height-board.clientTop*2};const points=e.event.captured.map(i=>boardPoint(i,rect)),origin=boardPoint(e.event.index,rect);
    x.save();x.shadowColor=e.accent;x.shadowBlur=this.reduced?0:10;
    drawExtraEffect(x,e.type,origin,points,t,size,e.accent,this.reduced);
    if(e.type==='laser'&&t<.65){for(const p of points){x.lineWidth=6*(1-t);x.beginPath();x.moveTo(origin.x,origin.y);x.lineTo(p.x,p.y);x.stroke();x.strokeStyle='#fff';x.lineWidth=1.4;x.stroke();x.strokeStyle=e.accent;}const all=[origin,...points],sameY=points.every(p=>Math.abs(p.y-origin.y)<1),sameX=points.every(p=>Math.abs(p.x-origin.x)<1);if(sameY||sameX){x.strokeStyle=e.accent;x.lineWidth=3;x.beginPath();x.moveTo(sameY?rect.left:origin.x,sameX?rect.top:origin.y);x.lineTo(sameY?rect.left+rect.width:origin.x,sameX?rect.top+rect.height:origin.y);x.stroke();}}
    for(const [pi,p]of points.entries()){
      if(['rings','flip','laser'].includes(e.type)){x.lineWidth=1.5;x.beginPath();x.ellipse(p.x,p.y,7+t*24,4+t*16,0,0,Math.PI*2);x.stroke();}
      if(e.type==='scan'){for(let k=0;k<6;k++){const yy=p.y+12-k*4-t*13;x.lineWidth=1.8;x.beginPath();x.ellipse(p.x,yy,11*(1-t*.5),2,0,0,Math.PI*2);x.stroke();}}
      if(e.type==='shove'){x.lineWidth=2;for(let k=0;k<3;k++){x.beginPath();x.moveTo(p.x+5+t*55,p.y-5-t*35+k*4);x.lineTo(p.x+t*30,p.y-t*20+k*4);x.stroke();}}
      const limit=e.type.startsWith('laser-')?0:this.reduced?2:e.type==='blast'?18:7;for(let k=0;k<limit;k++){const angle=(k/limit)*Math.PI*2+pi*.7,speed=e.type==='blast'?30+(k%4)*8:15+(k%3)*8,px=p.x+Math.cos(angle)*speed*t,py=p.y+Math.sin(angle)*speed*t+t*t*12,r=(e.type==='blast'?2.8:1.5)*(1-t);x.globalAlpha=alpha*(k%2?.8:1);if(e.type==='blast'){x.save();x.translate(px,py);x.rotate(t*5+k);x.fillRect(-r,-r,r*2,r*2);x.restore();}else{x.beginPath();x.arc(px,py,Math.max(.1,r),0,Math.PI*2);x.fill();}}
    }x.restore();x.globalAlpha=1;}
    if(this.events.length)this.raf=requestAnimationFrame(this.draw);else this.raf=0;
  }
}
