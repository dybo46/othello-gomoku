import {normalizeGomoku} from './gomoku-skins.js';
import {EFFECT_IDS,normalizeEffects} from './effect-catalog.js';
export const SKINS=[
 {id:'F1',name:'チタン・クラブ',accent:'#70edff',image:'./assets/frame-F1.png'},
 {id:'F2',name:'エメラルド・リージェント',accent:'#ffcf67',image:'./assets/frame-F2.png'},
 {id:'F4',name:'パール・ストリーム',accent:'#d7a8ff',image:'./assets/frame-F4.png'},
 {id:'F5',name:'クロノ・グリーン',accent:'#86eece',image:'./assets/frame-F5.png'},
 {id:'F6',name:'ベルベット・サーキット',accent:'#f5c77a',image:'./assets/frame-F6.png'},
 {id:'F7',name:'プラチナ・レール',accent:'#bc9bff',image:'./assets/frame-F7.png'},
 {id:'G1',name:'クラシック・ブラック',accent:'#d7e3dd',rim:'#667c73',image:'./assets/frame-G1.png'},
 {id:'G2',name:'エボニー・ブラス',accent:'#e5c67a',rim:'#c4a55e',image:'./assets/frame-G2.png'},
 {id:'G3',name:'ハニー・オーク',accent:'#f3c787',rim:'#b68a50',image:'./assets/frame-G3.png'},
 {id:'G4',name:'ウォルナット',accent:'#e4b384',rim:'#a97951',image:'./assets/frame-G4.png'},
 {id:'G5',name:'ヒノキ',accent:'#f4dfb7',rim:'#c6ab7a',image:'./assets/frame-G5.png'},
 {id:'G8',name:'ホワイト・マーブル',accent:'#badcdd',rim:'#8cb6af',image:'./assets/frame-G8.png'},
 {id:'W1',name:'ロイヤル・クラウン',accent:'#e9dfbd',rim:'#cdbf9e',surface:'velvet-red',board:{left:23,top:23,size:54},velvetImage:'./assets/frame-W1.png',image:'./assets/frame-W1-soft.png'},
 {id:'W4',name:'アール・ヌーヴォー',accent:'#ece2c6',rim:'#d1c3a6',surface:'velvet-red',board:{left:25,top:21,size:58},velvetImage:'./assets/frame-W4.png',image:'./assets/frame-W4-soft.png'},
 {id:'W5',name:'ダイヤモンド・スター',accent:'#e3e6e8',rim:'#c5c6c4',surface:'velvet-red',board:{left:23,top:23,size:54},velvetImage:'./assets/frame-W5.png',image:'./assets/frame-W5-soft.png'},
 {id:'W2B',name:'ブラック・ダイヤ',accent:'#d7e1ee',rim:'#80919e',surface:'velvet-red',board:{left:23,top:23,size:54},image:'./assets/frame-W2B.png'},
 {id:'N1',name:'サファイア・リボン',accent:'#c5e1ff',rim:'#b8d0e8',surface:'velvet-blue',board:{left:23,top:23,size:54},image:'./assets/frame-N1.png'},
 {id:'N2',name:'ミッドナイト・ダイヤ',accent:'#b7c8e0',rim:'#aebdcb',surface:'velvet-navy',board:{left:23,top:23,size:54},image:'./assets/frame-N2.png'},
 {id:'N4',name:'ノワール・デコ',accent:'#e6d6b2',rim:'#bdc7d0',surface:'velvet-charcoal',board:{left:23,top:23,size:54},image:'./assets/frame-N4.png'},
 {id:'D1',name:'ブラック・カットクリスタル',accent:'#d7e3f0',rim:'#bac8d6',surface:'gem-black',board:{left:23,top:23,size:54},image:'./assets/frame-D1.png'},
];
export const SKIN_CHOICES=[{id:'random',name:'ランダム',image:'./assets/frame-random.png'},...SKINS];
export function chooseSkin(preference,previous,random=Math.random){if(SKINS.some(s=>s.id===preference))return preference;const pool=SKINS.filter(s=>s.id!==previous);return (pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))]||SKINS[0]).id;}
export const DEFAULTS={game:'othello',gomoku:normalizeGomoku(),boardSize:'standard',layoutDefaultsVersion:2,layout:'wide',skin:'random',stone:'classic',effect:'random',enabledEffects:EFFECT_IDS.slice(),effectCatalog:EFFECT_IDS.slice(),placeSound:'wood',changeSound:'auto',volume:40,cpu:5,watchBlack:5,watchWhite:5,seconds:60,hints:false,lastMoveHighlight:true};
export function normalizePreferences(p={}){const known=Array.isArray(p.effectCatalog)?p.effectCatalog:['laser','shove','blast','scan','flip','rings'];const enabled=Array.isArray(p.enabledEffects)&&p.enabledEffects.length?[...p.enabledEffects,...EFFECT_IDS.filter(id=>!known.includes(id))]:EFFECT_IDS;return {game:p.game==='gomoku'?'gomoku':'othello',gomoku:normalizeGomoku(p.gomoku),boardSize:['smart','standard','large'].includes(p.boardSize)?p.boardSize:'standard',layoutDefaultsVersion:2,layout:p.layoutDefaultsVersion===2&&p.layout==='compact'?'compact':'wide',lastMoveHighlight:p.lastMoveHighlight!==false,effectCatalog:EFFECT_IDS.slice(),enabledEffects:normalizeEffects(enabled),skin:SKIN_CHOICES.some(s=>s.id===p.skin)?p.skin:DEFAULTS.skin,stone:['classic','glass','neon'].includes(p.stone)?p.stone:'classic',effect:['random',...EFFECT_IDS].includes(p.effect)?p.effect:'random',placeSound:['wood','glass','soft','off'].includes(p.placeSound)?p.placeSound:'wood',changeSound:['auto','laser','chime','burst','off'].includes(p.changeSound)?p.changeSound:'auto',volume:Math.max(0,Math.min(100,Number.isFinite(Number(p.volume))?Number(p.volume):40)),cpu:Math.max(1,Math.min(10,Math.round(Number(p.cpu)||5))),watchBlack:Math.max(1,Math.min(10,Math.round(Number(p.watchBlack)||5))),watchWhite:Math.max(1,Math.min(10,Math.round(Number(p.watchWhite)||5))),seconds:[15,30,60,90,120,180,300].includes(Number(p.seconds))?Number(p.seconds):60,hints:p.hints===true};}
