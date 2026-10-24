import {GOMOKU_SOUND_IDS} from './gomoku-sounds.js';
import {EXTRA_GOMOKU_SKINS} from './gomoku-skins-extra.js';
export const GOMOKU_SKINS=[
 {id:'K2',name:'白木・ヒノキ'}, {id:'K5',name:'竹のぬくもり'},
 {id:'K6',name:'マホガニー'}, {id:'K7',name:'黄金の榧'},
 {id:'K8',name:'アッシュ・墨縁'}, {id:'K9',name:'古栗の木'}
].map(s=>({...s,image:`./assets/gomoku/${s.id}.png`,board:{left:11,top:11,size:78},grid:'#392413b3',coordinate:'#352314',stone:'classic',sound:'go'})).concat([
 {id:'C1',name:'サイバー・ワイヤー',image:'./assets/gomoku/C1.png',board:{left:11,top:11,size:78},grid:'#79dceb8c',coordinate:'#cdf6ff',stone:'cyber',surface:'cyber-wire',sound:'go'},
 {id:'M1',name:'ホワイト・マーブル',image:'./assets/gomoku/M1.png',board:{left:15,top:15,size:70},grid:'#3f4859a6',coordinate:'#303844',stone:'pearl',surface:'white-marble',sound:'go'}
],EXTRA_GOMOKU_SKINS);
export const GOMOKU_CHOICES=[{id:'random',name:'ランダム',image:'./assets/gomoku/random.png'},...GOMOKU_SKINS];
export function chooseGomokuSkin(preference,previous,random=Math.random){if(GOMOKU_SKINS.some(s=>s.id===preference))return preference;const pool=GOMOKU_SKINS.filter(s=>s.id!==previous);return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))].id;}
export function normalizeGomoku(p={}){return {skin:GOMOKU_CHOICES.some(s=>s.id===p.skin)?p.skin:'random',stone:'classic',placeSound:['go','wood','soft','off','match-random',...GOMOKU_SOUND_IDS].includes(p.placeSound)?p.placeSound:'go'};}
