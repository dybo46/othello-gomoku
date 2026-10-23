const colorName=color=>color===1?'黒':'白';
export function turnLabel(color,name,mine){return `${colorName(color)}・${name}${mine===color?'（あなた）':''}のターン。`;}
export function resultLabel(winner,name,mine){if(!winner)return '引き分けです。';if(mine)return winner===mine?'あなたの勝利です！':'あなたの負けです。';return `${colorName(winner)}・${name}が勝利しました`;}
