// Stable IDs keep saved preferences and future additions independent of display names.
export const EFFECTS=[
 {id:'laser',minCaptured:3,name:'高圧レーザー',description:'3石以上：一直線の光線で撃ち抜く',verb:'撃ち抜き'},
 {id:'shove',name:'インパクト・シュート',description:'相手のコマを弾き飛ばして交換',verb:'弾き飛ばし'},
 {id:'blast',name:'クリスタル・ブレイク',description:'破片と火花に砕いて交換',verb:'砕き'},
 {id:'scan',name:'ホログラム再構成',description:'光の層へ分解して組み直す',verb:'光へ分解し'},
 {id:'flip',name:'クラシック・フリップ',description:'立体的にコマを裏返す',verb:'裏返し'},
 {id:'rings',name:'リング・ウェーブ',description:'光の輪が広がって色を変える',verb:'光の輪で包み'},
 {id:'lightning',name:'チェイン・ライトニング',description:'枝分かれする稲妻で連鎖交換',verb:'稲妻で貫き'},
 {id:'meteor',name:'メテオ・ストライク',description:'斜めに降る流星が着弾',verb:'流星で吹き飛ばし'},
 {id:'vortex',name:'スパイラル・ボルテックス',description:'渦巻きがコマを吸い込む',verb:'渦へ吸い込み'},
 {id:'frost',name:'フロスト・ノヴァ',description:'六角形の氷結晶が広がる',verb:'凍結させて砕き'},
 {id:'flame',name:'フェニックス・フレア',description:'揺らめく炎が立ち上がる',verb:'炎で包み'},
 {id:'sonic',name:'ソニック・スラッシュ',description:'交差する三日月の斬撃',verb:'光の刃で切り裂き'},
 {id:'portal',name:'ゲート・ジャンプ',description:'二重の転送ゲートで入れ替える',verb:'転送ゲートへ送り'},
 {id:'prism',name:'プリズム・バースト',description:'虹色の多角形と光線が弾ける',verb:'虹色の光へ分解し'},
 {id:'pixel',name:'ピクセル・リブート',description:'四角い画素が散って再構成',verb:'画素へ分解し'},
 {id:'petals',name:'サクラ・テンペスト',description:'桜色の花びらが旋回する',verb:'花びらの嵐でさらい'},
 {id:'laser-needle',name:'ニードル・レーザー',description:'3石以上：極細の白い芯とシアンの光',verb:'極細光線で貫き',minCaptured:3},
 {id:'laser-twin',name:'ツイン・レーザー',description:'3石以上：紫とピンクの平行な二重光線',verb:'二重光線で撃ち抜き',minCaptured:3},
 {id:'laser-gold',name:'ゴールド・ランス',description:'3石以上：金の光柱と十字の閃光',verb:'黄金の光線で焼き切り',minCaptured:3},
 {id:'laser-pulse',name:'パルス・レーザー',description:'3石以上：緑の細い線を光の弾が走る',verb:'光のパルスで撃ち抜き',minCaptured:3},
 {id:'laser-spectrum',name:'スペクトル・レーザー',description:'3石以上：虹色が流れる一本の直線',verb:'虹色の光線で貫き',minCaptured:3},
];
export const EFFECT_IDS=EFFECTS.map(e=>e.id);
export function normalizeEffects(enabled){const selected=Array.isArray(enabled)?EFFECT_IDS.filter(id=>enabled.includes(id)):EFFECT_IDS.slice();return selected.length?selected:EFFECT_IDS.slice();}
export function describeMove(event,effect){const item=EFFECTS.find(e=>e.id===effect),c=event.color===1?'黒':'白',opposite=event.color===1?'白':'黒',coord=`${'ABCDEFGH'[event.index%8]}-${(event.index>>3)+1}`,n=event.captured.length;if(!effect)return `${c}が${coord}に着手。${opposite}${n}石を${c}へ交換。`;return `${c}が${coord}に着手。${item?.name||'コマの変化'}で${opposite}${n}石を${item?.verb||'変化させ'}、${c}へ${effect==='flip'?'反転':'交換'}。`;}
