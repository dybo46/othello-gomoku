function element(doc,tag,cls,text){const e=doc.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
export function tallyRows(score){return Math.max(1,Math.ceil(Math.max(...score)/8));}
export function buildResult(box,{normal,score,reason,buttonLabel,onClose,replayLabel,onReplay}){
  const doc=box.ownerDocument;box.replaceChildren();box.dataset.counting=String(normal);
  const rowCounts=score.map(n=>Math.max(1,Math.ceil(n/8)));
  box.style.setProperty('--black-rows',String(rowCounts[0]));box.style.setProperty('--white-rows',String(rowCounts[1]));
  box.style.setProperty('--black-space',rowCounts[0]+'fr');box.style.setProperty('--white-space',rowCounts[1]+'fr');box.style.setProperty('--tally-total-rows',String(rowCounts[0]+rowCounts[1]));
  box.append(element(doc,'h2','',normal?'COUNT UP':'MATCH END'));
  if(normal)box.append(element(doc,'div','count-tray top'),element(doc,'div','result-numbers','集計中…'),element(doc,'div','count-tray bottom'));
  else box.append(element(doc,'p','result-reason',reason),element(doc,'div','result-numbers',''));
  box.append(element(doc,'p','winner-text',''));
  const button=element(doc,'button','',buttonLabel);button.addEventListener('click',onClose);const group=element(doc,'div','result-buttons');group.append(button);if(replayLabel){const replay=element(doc,'button','result-replay',replayLabel);replay.addEventListener('click',onReplay);group.append(replay);}box.append(group);
}
export function updateTally(box,score,step){const rows=Math.max(1,Math.ceil(score[1]/8));
  for(let c=1;c<=2;c++){
    const tray=box.querySelector(c===1?'.top':'.bottom'),n=Math.min(step,score[c-1]);
    while(tray.children.length<n){const i=tray.children.length,stone=element(box.ownerDocument,'i',`tally ${c===1?'black':'white'}`);stone.style.gridColumn=String(i%8+1);stone.style.gridRow=String(c===1?Math.floor(i/8)+1:rows-Math.floor(i/8));stone.setAttribute('aria-hidden','true');tray.append(stone);}
  }
  box.querySelector('.result-numbers').textContent=step>=Math.max(...score)?`● ${score[0]} — ${score[1]} ○`:'集計中…';
}
