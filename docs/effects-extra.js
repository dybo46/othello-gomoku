import {drawLaserEffect} from './effects-lasers.js';
// Canvas-only embellishments: all positions and outcomes stay in the shared rules engine.
const TAU=Math.PI*2;
function line(x,a,b){x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}
function ellipse(x,p,rx,ry,rotation=0){x.beginPath();x.ellipse(p.x,p.y,Math.max(.1,rx),Math.max(.1,ry),rotation,0,TAU);x.stroke();}
export function drawExtraEffect(x,type,origin,points,t,size,accent,reduced){
  drawLaserEffect(x,type,origin,points,t,size,reduced);
  const unit=size/396,phase=t*TAU;x.save();x.lineWidth=1.6*unit;
  if(type==='lightning'&&t<.7){for(const [i,p]of points.entries()){x.beginPath();x.moveTo(origin.x,origin.y);for(let k=1;k<=7;k++){const f=k/7,w=k===7?0:Math.sin(k*8+i+Math.floor(t*18))*8*unit;x.lineTo(origin.x+(p.x-origin.x)*f+w,origin.y+(p.y-origin.y)*f-w);}x.strokeStyle='#a8caff';x.lineWidth=3*unit;x.stroke();x.strokeStyle='#fff';x.lineWidth=.8*unit;x.stroke();}}
  for(const [i,p]of points.entries()){
    x.strokeStyle=accent;x.fillStyle=accent;x.lineWidth=1.6*unit;
    if(type==='meteor'){const offset=(1-Math.min(1,t*2.5))*size*.3;line(x,{x:p.x-offset-15*unit,y:p.y-offset-35*unit},{x:p.x-offset,y:p.y-offset});x.fillStyle='#fff4bd';x.beginPath();x.arc(p.x-offset,p.y-offset,3*unit,0,TAU);x.fill();if(t>.35)ellipse(x,p,(t-.35)*55*unit,(t-.35)*24*unit);}
    if(type==='vortex'){x.beginPath();for(let k=0;k<=55;k++){const a=k/55*TAU*2.5+phase,r=(1-t)*k/55*25*unit,px=p.x+Math.cos(a)*r,py=p.y+Math.sin(a)*r;k?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();}
    if(type==='frost'){x.strokeStyle='#c1faff';for(let k=0;k<6;k++){const a=k*TAU/6,r=(10+18*t)*unit,tip={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};line(x,p,tip);for(const sign of [-1,1])line(x,{x:p.x+Math.cos(a)*r*.6,y:p.y+Math.sin(a)*r*.6},{x:p.x+Math.cos(a)*r*.6+Math.cos(a+sign*.8)*r*.3,y:p.y+Math.sin(a)*r*.6+Math.sin(a+sign*.8)*r*.3});}}
    if(type==='flame'){for(let k=0;k<(reduced?2:6);k++){const u=(t+k/6)%1,xx=p.x+Math.sin(phase*2+k)*8*unit,yy=p.y-u*38*unit;x.fillStyle=k%2?'#ffe59e':'#ff653a';x.beginPath();x.moveTo(xx-5*unit*(1-u),yy);x.quadraticCurveTo(xx+6*unit,yy-9*unit,xx+Math.sin(k)*3*unit,yy-17*unit*(1-u));x.quadraticCurveTo(xx-8*unit,yy-5*unit,xx-5*unit*(1-u),yy);x.fill();}}
    if(type==='sonic'){for(let k=0;k<3;k++){x.save();x.translate(p.x,p.y);x.rotate(k*TAU/3+.4);x.beginPath();x.ellipse(t*25*unit,0,(12+t*18)*unit,(5+t*5)*unit,0,-1.2,1.2);x.strokeStyle=k===1?'#fff':accent;x.lineWidth=(3-k*.6)*unit;x.stroke();x.restore();}}
    if(type==='portal'){for(let k=0;k<2;k++){x.strokeStyle=k?'#d990ff':'#74fff2';ellipse(x,{x:p.x,y:p.y+(k?1:-1)*t*18*unit},(15-t*5)*unit,(4+t*3)*unit,Math.sin(phase)*.25);}for(let k=0;k<4;k++){const a=phase+k*TAU/4;x.fillRect(p.x+Math.cos(a)*15*unit,p.y+Math.sin(a)*6*unit,2*unit,2*unit);}}
    if(type==='prism'){for(let k=0;k<6;k++){x.strokeStyle=`hsl(${k*60+t*100} 100% 75%)`;const a=k*TAU/6+phase*.2,r=(8+t*29)*unit;line(x,{x:p.x+Math.cos(a)*r*.45,y:p.y+Math.sin(a)*r*.45},{x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r});line(x,{x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r},{x:p.x+Math.cos(a+TAU/6)*r,y:p.y+Math.sin(a+TAU/6)*r});}}
    if(type==='pixel'){for(let k=0;k<(reduced?4:16);k++){const a=k*2.4+i,r=t*(12+k%5*5)*unit,xx=p.x+Math.cos(a)*r,yy=p.y+Math.sin(a)*r;const w=(1-t)*4*unit;x.fillStyle=k%3?'#b0ffde':'#fff';x.fillRect(Math.round(xx/unit)*unit,Math.round(yy/unit)*unit,w,w);}}
    if(type==='petals'){for(let k=0;k<(reduced?2:8);k++){const a=k*TAU/8+phase*.65,r=(8+t*23)*unit;x.save();x.translate(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.65-t*8*unit);x.rotate(a+phase);x.fillStyle=k%2?'#ffc2e5':'#fff2f8';x.beginPath();x.ellipse(0,0,4*unit,1.8*unit,0,0,TAU);x.fill();x.restore();}}
  }x.restore();
}
