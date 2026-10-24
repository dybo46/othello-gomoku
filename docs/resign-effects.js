import {RESIGN_EFFECTS,RESIGN_DURATION,resignWindow} from './resign-catalog.js';
export class ResignEffects{
 constructor(frame){this.frame=frame;this.key='';this.layer=null;this.animations=[];}
 clear(){for(const animation of this.animations)animation.cancel();this.animations=[];this.layer?.remove();this.layer=null;this.frame.classList.remove('resigned-board');this.key='';}
 sync(game,key,time){
  const eventKey=`${key}:${game.finishedAt}`;
  if(game.status!=='finished'||game.reason!=='降参'){if(this.key)this.clear();return false;}
  if(this.key!==eventKey){this.clear();this.key=eventKey;if(resignWindow(game,time))this.play(game,time);}
  if(!resignWindow(game,time)){this.layer?.remove();this.layer=null;return false;}return true;
 }
 play(game,time){
  const effect=RESIGN_EFFECTS.find(e=>e.id===game.resignEffect)||RESIGN_EFFECTS[0],id=effect.id,frame=this.frame,rect=frame.getBoundingClientRect(),size=rect.width;
  const layer=document.createElement('div');layer.className=`resign-layer ${id}`;layer.setAttribute('aria-hidden','true');frame.append(layer);this.layer=layer;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate=(node,frames,options)=>{const animation=node.animate(frames,{...options,fill:'forwards'});animation.currentTime=Math.max(0,time-game.finishedAt);this.animations.push(animation);};
  for(const [i,stone]of [...frame.querySelectorAll('.board .stone:not(.old-stone)')].entries()){
   const r=stone.getBoundingClientRect(),x=r.left-rect.left,y=r.top-rect.top,cx=x+r.width/2-size/2,cy=y+r.height/2-size/2;
   const clone=stone.cloneNode(true);clone.className=`stone resign-stone ${stone.classList.contains('black')?'black':'white'}`;
   Object.assign(clone.style,{left:x+'px',top:y+'px',width:r.width+'px',height:r.height+'px'});layer.append(clone);
   const angle=Math.atan2(cy,cx)+(i%5-.5)*.12,travel=size*(.7+(i%4)*.16),dx=Math.cos(angle)*travel,dy=Math.sin(angle)*travel;
   let frames;
   if(reduced)frames=[{opacity:1},{opacity:0,transform:'scale(.5)'}];
   else if(id==='cyclone')frames=[{transform:'translate(0,0) rotate(0deg)',opacity:1},{offset:.35,transform:`translate(${-cy*.8-cx*.35}px,${cx*.8-cy*.35}px) rotate(180deg) scale(1.25)`,opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(900deg) scale(.3)`,opacity:0}];
   else if(id==='storm')frames=[{transform:'translate(0,0)',opacity:1},{offset:.22,transform:`translate(-12px,${-8-i%4}px) rotate(-15deg)`,opacity:1},{transform:`translate(${size*1.3}px,${-size*.6+(i%7)*12}px) rotate(${420+i*13}deg)`,opacity:0}];
   else if(id==='skyrocket')frames=[{transform:'translate(0,0)',opacity:1},{offset:.25,transform:'translate(0,15px) scale(1.2,.7)',opacity:1},{transform:`translate(${cx*.5}px,${-size*1.3}px) rotate(${480+i*29}deg) scale(.45)`,opacity:0}];
   else frames=[{transform:'translate(0,0)',opacity:1},{offset:.18,transform:`translate(${cx*.08}px,${cy*.08-16}px) scale(1.15)`,opacity:1},{transform:`translate(${dx}px,${dy+(id==='table-quake'?size*.35:0)}px) rotate(${(i%2?1:-1)*(540+i*31)}deg) scale(.55)`,opacity:0}];
   animate(clone,frames,{duration:reduced?700:1350,delay:reduced?0:150+(i%9)*25,easing:'cubic-bezier(.22,.65,.4,1)'});
  }
  frame.classList.add('resigned-board');
  if(!reduced){
   animate(frame,[{transform:'translate(0,0) rotate(0)'},{transform:'translate(-8px,3px) rotate(-1deg)'},{transform:'translate(9px,-5px) rotate(1deg)'},{transform:'translate(-6px,5px) rotate(-.7deg)'},{transform:'translate(4px,-3px) rotate(.4deg)'},{transform:'translate(0,0) rotate(0)'}],{duration:id==='table-quake'?850:400});
   const wave=document.createElement('div');wave.className='resign-wave';layer.append(wave);animate(wave,[{transform:'scale(.05)',opacity:0},{offset:.15,opacity:.9},{transform:'scale(1.65)',opacity:0}],{duration:1150,easing:'ease-out'});
   const banner=document.createElement('strong');banner.className='resign-banner';banner.textContent=effect.name;layer.append(banner);animate(banner,[{opacity:0,transform:'scale(1.8) rotate(-6deg)'},{offset:.2,opacity:1,transform:'scale(1) rotate(-6deg)'},{offset:.7,opacity:1},{opacity:0,transform:'scale(1.1) rotate(-6deg)'}],{duration:1550});
  }
 }
}
