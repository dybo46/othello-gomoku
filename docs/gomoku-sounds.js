import {EXTRA_GOMOKU_PLACE_SOUNDS} from './gomoku-sounds-extra.js';
const BASE_GOMOKU_PLACE_SOUNDS=[
  {
    "id": "go-real-01",
    "name": "囲碁1・卓上碁盤A",
    "group": "囲碁の実録",
    "url": "./assets/gomoku-audio/go-real-01.wav",
    "duration": 0.43,
    "author": "billhails2",
    "page": "https://freesound.org/people/billhails2/sounds/588317/",
    "license": "CC0-1.0"
  },
  {
    "id": "go-real-02",
    "name": "囲碁2・卓上碁盤B",
    "group": "囲碁の実録",
    "url": "./assets/gomoku-audio/go-real-02.wav",
    "duration": 0.49,
    "author": "billhails2",
    "page": "https://freesound.org/people/billhails2/sounds/588317/",
    "license": "CC0-1.0"
  },
  {
    "id": "go-real-03",
    "name": "囲碁3・卓上碁盤C",
    "group": "囲碁の実録",
    "url": "./assets/gomoku-audio/go-real-03.wav",
    "duration": 0.53,
    "author": "billhails2",
    "page": "https://freesound.org/people/billhails2/sounds/588317/",
    "license": "CC0-1.0"
  },
  {
    "id": "go-real-04",
    "name": "囲碁4・新カヤ碁盤A",
    "group": "囲碁の実録",
    "url": "./assets/gomoku-audio/go-real-04.wav",
    "duration": 0.53,
    "author": "billhails2",
    "page": "https://freesound.org/people/billhails2/sounds/588317/",
    "license": "CC0-1.0"
  },
  {
    "id": "go-real-05",
    "name": "囲碁5・新カヤ碁盤B",
    "group": "囲碁の実録",
    "url": "./assets/gomoku-audio/go-real-05.wav",
    "duration": 0.55,
    "author": "billhails2",
    "page": "https://freesound.org/people/billhails2/sounds/588317/",
    "license": "CC0-1.0"
  },
  {
    "id": "marble-bowl",
    "name": "ビー玉・陶器にコツン",
    "group": "ビー玉の実録",
    "url": "./assets/gomoku-audio/marble-bowl.wav",
    "duration": 0.65,
    "author": "Anthousai",
    "page": "https://freesound.org/people/Anthousai/sounds/448235/",
    "license": "CC0-1.0"
  },
  {
    "id": "marble-bounce",
    "name": "ビー玉・小さな跳ね",
    "group": "ビー玉の実録",
    "url": "./assets/gomoku-audio/marble-bounce.wav",
    "duration": 0.2944,
    "author": "Anthousai",
    "page": "https://freesound.org/people/Anthousai/sounds/448237/",
    "license": "CC0-1.0"
  },
  {
    "id": "marble-clink",
    "name": "ビー玉・粒同士の触れ合い",
    "group": "ビー玉の実録",
    "url": "./assets/gomoku-audio/marble-clink.wav",
    "duration": 0.1797,
    "author": "Anthousai",
    "page": "https://freesound.org/people/Anthousai/sounds/448318/",
    "license": "CC0-1.0"
  },
  {
    "id": "marble-impact",
    "name": "ビー玉・澄んだ響き",
    "group": "ビー玉の実録",
    "url": "./assets/gomoku-audio/marble-impact.wav",
    "duration": 0.65,
    "author": "Ryanz-Official",
    "page": "https://freesound.org/people/Ryanz-Official/sounds/639754/",
    "license": "CC0-1.0"
  },
  {
    "id": "glass-tap-01",
    "name": "ガラス1・軽いコツン",
    "group": "ガラス・木・金属",
    "url": "./assets/gomoku-audio/glass-tap-01.wav",
    "duration": 0.1149,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/impact-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "glass-tap-02",
    "name": "ガラス2・短いチン",
    "group": "ガラス・木・金属",
    "url": "./assets/gomoku-audio/glass-tap-02.wav",
    "duration": 0.1199,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/impact-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "glass-tap-03",
    "name": "ガラス3・硬いカチッ",
    "group": "ガラス・木・金属",
    "url": "./assets/gomoku-audio/glass-tap-03.wav",
    "duration": 0.1099,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/impact-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "wood-tap",
    "name": "木・軽いコトッ",
    "group": "ガラス・木・金属",
    "url": "./assets/gomoku-audio/wood-tap.wav",
    "duration": 0.0999,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/impact-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "metal-tap",
    "name": "金属・小さなチッ",
    "group": "ガラス・木・金属",
    "url": "./assets/gomoku-audio/metal-tap.wav",
    "duration": 0.1548,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/impact-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "digital-pon",
    "name": "デジタル・ぽん",
    "group": "かわいいデジタル",
    "url": "./assets/gomoku-audio/digital-pon.wav",
    "duration": 0.0949,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/interface-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "digital-purun",
    "name": "デジタル・ぷるん",
    "group": "かわいいデジタル",
    "url": "./assets/gomoku-audio/digital-purun.wav",
    "duration": 0.0995,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/interface-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "digital-pin",
    "name": "デジタル・ぴん",
    "group": "かわいいデジタル",
    "url": "./assets/gomoku-audio/digital-pin.wav",
    "duration": 0.1099,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/interface-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "digital-poko",
    "name": "デジタル・ぽこっ",
    "group": "かわいいデジタル",
    "url": "./assets/gomoku-audio/digital-poko.wav",
    "duration": 0.0999,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/interface-sounds",
    "license": "CC0-1.0"
  },
  {
    "id": "digital-piko",
    "name": "デジタル・ぴこっ",
    "group": "かわいいデジタル",
    "url": "./assets/gomoku-audio/digital-piko.wav",
    "duration": 0.1364,
    "author": "Kenney",
    "page": "https://kenney.nl./assets/interface-sounds",
    "license": "CC0-1.0"
  }
];
export const GOMOKU_PLACE_SOUNDS=[...BASE_GOMOKU_PLACE_SOUNDS.map(s=>({...s,group:s.id.startsWith('glass-tap')?'ガラス':s.id==='wood-tap'?'木':s.id==='metal-tap'?'金属':s.group})),...EXTRA_GOMOKU_PLACE_SOUNDS];
const groupKeys={'囲碁の実録':'go','ビー玉の実録':'marble','ガラス':'glass','木':'wood','金属':'metal','かわいいデジタル':'cute','鉱石・石':'mineral','クリスタル・きらめき':'crystal','水滴・リキッド':'liquid','透明デジタル':'clear-digital','サイバー・電子':'cyber','陶器・磁器':'ceramic','やわらかいポップ':'soft-pop'};
export const GOMOKU_SOUND_GROUPS=Object.entries(groupKeys).map(([name,key])=>({id:'group-random-'+key,name,label:name+'ランダム',members:GOMOKU_PLACE_SOUNDS.filter(s=>s.group===name).map(s=>s.id)}));
export const GOMOKU_RANDOM_IDS=GOMOKU_SOUND_GROUPS.map(g=>g.id);
export const DEFAULT_PLACE_SOUND_MODE_POOL=['wood','go',...GOMOKU_RANDOM_IDS,'go','group-random-cute','group-random-soft-pop'];
export function chooseDefaultPlaceMode(random=Math.random){return DEFAULT_PLACE_SOUND_MODE_POOL[Math.min(DEFAULT_PLACE_SOUND_MODE_POOL.length-1,Math.max(0,Math.floor(random()*DEFAULT_PLACE_SOUND_MODE_POOL.length)))];}
export function resolvePlaceMode(preference,key,session,savedMode,random=Math.random){
 if(preference!=='default')return preference;
 if(session.defaultKey!==key){session.defaultKey=key;session.defaultMode=DEFAULT_PLACE_SOUND_MODE_POOL.includes(savedMode)?savedMode:chooseDefaultPlaceMode(random);}
 return session.defaultMode;
}
export const categorySoundGroup=id=>GOMOKU_SOUND_GROUPS.find(g=>g.id===id);
export const GOMOKU_SOUND_IDS=GOMOKU_PLACE_SOUNDS.map(s=>s.id);
export function recordedPlaceSound(id){return GOMOKU_PLACE_SOUNDS.find(s=>s.id===id);}

export const MATCH_PLACE_SOUND_IDS=['go','wood','soft',...GOMOKU_SOUND_IDS];
export function choosePlaceSound(preference,previous,random=Math.random){
 const group=categorySoundGroup(preference);
 if(group){const pool=group.members.filter(id=>id!==previous);return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];}
 if(preference!=='match-random')return ['off',...MATCH_PLACE_SOUND_IDS].includes(preference)?preference:'go';
 const pool=MATCH_PLACE_SOUND_IDS.filter(id=>id!==previous);
 return pool[Math.min(pool.length-1,Math.max(0,Math.floor(random()*pool.length)))];
}
export function placeSoundName(id){return recordedPlaceSound(id)?.name||categorySoundGroup(id)?.label||({default:'デフォルト',go:'碁石・パチッ（今までの音）',wood:'コトッ',soft:'控えめ',off:'なし'})[id]||id;}
