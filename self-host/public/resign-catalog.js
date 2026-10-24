export const RESIGN_EFFECTS=[
 {id:'table-quake',name:'テーブル・クラッシュ'},
 {id:'cyclone',name:'盤上サイクロン'},
 {id:'shockwave',name:'ビッグバン・ブロー'},
 {id:'storm',name:'ストーム・スイープ'},
 {id:'skyrocket',name:'スカイロケット'}
];
export const RESIGN_DURATION=1900;
export function chooseResignEffect(random=Math.random){return RESIGN_EFFECTS[Math.min(4,Math.max(0,Math.floor(random()*5)))].id;}
export function resignWindow(game,time){return game?.status==='finished'&&game.reason==='降参'&&time>=game.finishedAt&&time<game.finishedAt+RESIGN_DURATION;}
