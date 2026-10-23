// Shared visual marker for grid games (Reversi now; Gomoku will use the same helper).
export function lastMoveEnabled(local,personal,shared){return personal===true&&(local||shared===true);}
export function markLastMove(cells,index,enabled){for(let i=0;i<cells.length;i++){const on=enabled&&i===index;cells[i].classList.toggle('last-move',on);const label=cells[i].getAttribute('aria-label')?.replace('・最後の着手','')||'';if(cells[i].getAttribute('aria-label')!==label+(on?'・最後の着手':''))cells[i].setAttribute('aria-label',label+(on?'・最後の着手':''));}}
