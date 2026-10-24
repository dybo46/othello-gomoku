// Artwork, coordinates and the two stone appearances form one independent theme.
// The atlas has two equal square cells: black on the left, white on the right.
const definitions=[
 ['P1','ポーセリン・オービット',25,20.5,50,'#345a508c','#173a30','P1','50%'],
 ['P7','リキッド・アクア',23,19,52,'#24556d9c','#102d43','P7','50%'],
 ['P8','ネイビー＆ローズ・ツイード',23,20,54,'#534337a6','#30251c','P8','50%'],
 ['R1','シアン・オブシディアン',12,12,76,'#4ce4f0a8','#d2fcff','R1','18%'],
 ['R2','サファイア・クロノグラフ',16,15,68,'#ddc28aa8','#fff0cf','R2','50%'],
 ['R3','チタン・マシナリー',14,13,72,'#27313c99','#f0f5ff','R3','18%'],
 ['R4','ブラックダイヤ・パレス',14,13,72,'#d9bb81a6','#fff0ce','R4','18%'],
 ['R5','イリデセント・グラス',15,14,70,'#7165b88c','#292448','R5','50%'],
 ['R7','エメラルド・プライベート',15,14,70,'#dfcc99a6','#ffefca','R7','18%'],
 ['R8','クォンタム・グラス',13,13,74,'#6ab8f3a6','#e5f3ff','R5','50%']
];
export const EXTRA_GOMOKU_SKINS=definitions.map(([id,name,left,top,size,grid,coordinate,pair,stoneRadius])=>({id,name,image:`./assets/gomoku/${id}.png`,board:{left,top,size},grid,coordinate,coordinates:false,stone:'sprite',stonePair:`./assets/gomoku/stones-${pair}.png`,stoneRadius,surface:'extra-gomoku',sound:'go'}));
