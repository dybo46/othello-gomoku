// All laser variants are cosmetic. The catalogue limits them to captures of 3+ stones.
const TAU=Math.PI*2;
function beam(x,a,b,color,width){x.strokeStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}
export function drawLaserEffect(x,type,origin,points,t,size,reduced){
  if(!type.startsWith('laser-')||t>.85)return;
  const u=size/396,progress=Math.min(1,t*7);x.save();x.lineCap='round';
  // Only the furthest captured cell on each ray needs a beam; this keeps thin lines thin.
  const rays=new Map();for(const p of points){const key=`${Math.sign(p.x-origin.x)},${Math.sign(p.y-origin.y)}`,d=Math.hypot(p.x-origin.x,p.y-origin.y),old=rays.get(key);if(!old||d>old.d)rays.set(key,{p,d});}
  for(const {p,d}of rays.values()){
    const dx=(p.x-origin.x)/d,dy=(p.y-origin.y)/d,end={x:origin.x+(p.x-origin.x)*progress,y:origin.y+(p.y-origin.y)*progress};
    if(type==='laser-needle'){x.shadowColor='#68efff';x.shadowBlur=reduced?0:7;beam(x,origin,end,'#63ddff',1.2*u);beam(x,origin,end,'#ffffff',.5*u);}
    if(type==='laser-twin'){for(const [k,color]of [[-1,'#ae79ff'],[1,'#ff73e6']]){const off=k*2.3*u,a={x:origin.x-dy*off,y:origin.y+dx*off},b={x:end.x-dy*off,y:end.y+dx*off};x.shadowColor=color;x.shadowBlur=reduced?0:8;beam(x,a,b,color,1.6*u);}beam(x,origin,end,'#fff0ff',.5*u);}
    if(type==='laser-gold'){x.shadowColor='#ffbd36';x.shadowBlur=reduced?0:12;beam(x,origin,end,'#e6a52c',7*u*(1-t));beam(x,origin,end,'#ffe49b',3*u);beam(x,origin,end,'#ffffff',.8*u);}
    if(type==='laser-pulse'){x.shadowColor='#8affd1';x.shadowBlur=reduced?0:7;beam(x,origin,end,'#46e6a2',.8*u);for(let k=0;k<(reduced?1:4);k++){const f=(t*2.5+k/4)%1,tail=Math.max(0,f-.12);beam(x,{x:origin.x+dx*d*tail,y:origin.y+dy*d*tail},{x:origin.x+dx*d*f,y:origin.y+dy*d*f},'#e8fff8',2.6*u);}}
    if(type==='laser-spectrum'){const grad=x.createLinearGradient(origin.x,origin.y,end.x+.01,end.y+.01);for(let k=0;k<=6;k++)grad.addColorStop(k/6,`hsl(${(k*60+t*220)%360} 100% 70%)`);x.shadowColor='#f8a4ff';x.shadowBlur=reduced?0:8;beam(x,origin,end,grad,3.6*u);beam(x,origin,end,'#ffffff',.55*u);}
  }
  for(const [i,p]of points.entries()){
    const color=type==='laser-gold'?'#ffe29b':type==='laser-twin'?'#efb2ff':type==='laser-pulse'?'#a1ffe3':type==='laser-spectrum'?`hsl(${i*55+t*240} 100% 80%)`:'#d0fbff';x.shadowColor=color;x.shadowBlur=reduced?0:7;const r=(type==='laser-gold'?9:4)*u*(1-t);beam(x,{x:p.x-r,y:p.y},{x:p.x+r,y:p.y},color,.8*u);beam(x,{x:p.x,y:p.y-r},{x:p.x,y:p.y+r},color,.8*u);if(type==='laser-gold'){x.strokeStyle=color;x.lineWidth=.8*u;x.beginPath();x.arc(p.x,p.y,(3+t*10)*u,0,TAU);x.stroke();}}
  x.restore();
}
