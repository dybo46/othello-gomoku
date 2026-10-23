// Screenshot-approved maximum, including the decorative frame.
export const MAX_BOARD_SIZE=566;
export function boardSize(width,height){return Math.floor(Math.max(0,Math.min(MAX_BOARD_SIZE,width,height)));}
// Outer-window bounds, constrained to the current monitor's work area.
export function popupBounds(screen,wide,restore=null){
  const aw=Math.max(1,Number(screen.availWidth)||1280),ah=Math.max(1,Number(screen.availHeight)||720);
  const x=Number(screen.availLeft)||0,y=Number(screen.availTop)||0;
  const width=Math.min(aw,wide?1040:restore?.width||520),height=Math.min(ah,wide?900:restore?.height||760);
  const left=wide?x+(aw-width)/2:Math.max(x,Math.min(x+aw-width,restore?.left??x+(aw-width)/2));
  const top=wide?y+(ah-height)/2:Math.max(y,Math.min(y+ah-height,restore?.top??y+(ah-height)/2));
  return {width:Math.round(width),height:Math.round(height),left:Math.round(left),top:Math.round(top)};
}
