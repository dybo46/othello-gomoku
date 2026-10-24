import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
import{GOMOKU_PLACE_SOUNDS,MATCH_PLACE_SOUND_IDS,choosePlaceSound}from'../public/gomoku-sounds.js';
import{normalizeGomoku}from'../public/gomoku-skins.js';import{normalizePreferences}from'../public/skins.js';import{AudioBank}from'../public/audio.js';
test('追加20着手音は実体の異なる短いWAV、全てCC0と作者・出典・ハッシュを持つ',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/assets/gomoku-audio/manifest.json',import.meta.url),'utf8'));
 assert.equal(GOMOKU_PLACE_SOUNDS.length,20);assert.equal(manifest.sounds.length,20);assert.equal(new Set(GOMOKU_PLACE_SOUNDS.map(s=>s.id)).size,20);assert.equal(GOMOKU_PLACE_SOUNDS.filter(s=>s.group==='囲碁の実録').length,5);
 const hashes=[];for(const sound of GOMOKU_PLACE_SOUNDS){const data=readFileSync(new URL(sound.url.replace(/^\//,''),new URL('../public/',import.meta.url)));assert.equal(data.subarray(0,4).toString(),'RIFF');assert.equal(data.subarray(8,12).toString(),'WAVE');assert.equal(data.readUInt16LE(22),1);assert.equal(data.readUInt32LE(24),44100);assert.equal(data.readUInt16LE(34),16);assert(sound.duration>.05&&sound.duration<.7);let peak=0;for(let i=44;i<data.length;i+=2)peak=Math.max(peak,Math.abs(data.readInt16LE(i)));assert(peak>3000&&peak<17000);const item=manifest.sounds.find(s=>s.id===sound.id),sha=createHash('sha256').update(data).digest('hex');assert.equal(item.sha256,sha);hashes.push(sha);assert.equal(item.license,'CC0-1.0');assert(item.author&&item.page.startsWith('https://'));assert(!item.source.includes(':\\'));}
 assert.equal(new Set(hashes).size,20);
});
test('デフォルトの合成goを維持し、新音・試合ランダムを独立保存、抽選はoffと直前を除外',()=>{
 assert.equal(normalizeGomoku().placeSound,'go');assert.equal(normalizeGomoku({placeSound:'bad'}).placeSound,'go');assert.equal(normalizeGomoku({placeSound:'match-random'}).placeSound,'match-random');
 for(const sound of GOMOKU_PLACE_SOUNDS){const p=normalizePreferences({placeSound:'glass',gomoku:{placeSound:sound.id}});assert.equal(p.placeSound,'glass');assert.equal(p.gomoku.placeSound,sound.id);assert.equal(choosePlaceSound(sound.id,'go'),sound.id);}
 for(const prev of MATCH_PLACE_SOUND_IDS){const found=new Set();for(let n=0;n<1000;n++){const id=choosePlaceSound('match-random',prev,()=>n/1000);assert.notEqual(id,prev);assert.notEqual(id,'off');found.add(id);}assert.equal(found.size,MATCH_PLACE_SOUND_IDS.length-1);}
});
test('実音を一度だけ取得・デコードして再利用、音量と失敗時の従来音を維持',async()=>{
 const oldFetch=globalThis.fetch;let fetches=0,decodes=0,starts=0,failed=false,fallback=0,lastGain;
 const bank=new AudioBank();bank.volume=.35;bank.ctx={currentTime:0,destination:{},resume:async()=>{},decodeAudioData:async()=>{decodes++;return{duration:.4};},createBufferSource:()=>({connect(g){return g;},start(){starts++;}}),createGain:()=>{const g={gain:{value:0},connect(){lastGain=g.gain.value;}};return g;}};
 globalThis.fetch=async()=>{fetches++;return{ok:!failed,arrayBuffer:async()=>new ArrayBuffer(8)}};
 try{await Promise.all([bank.prepare('go-real-01'),bank.prepare('go-real-01')]);assert.equal(fetches,1);assert.equal(decodes,1);await bank.playSample('go-real-01');await bank.playSample('go-real-01');assert.equal(starts,2);assert.equal(lastGain,.35);assert.equal(fetches,1);failed=true;bank.noise=()=>{fallback++};bank.tone=()=>{};assert.equal(await bank.place('glass-tap-01'),false);assert(fallback>0);assert.equal(bank.pending.size,0);bank.volume=0;assert.equal(await bank.playSample('go-real-02'),false);assert.equal(fetches,2);}finally{globalThis.fetch=oldFetch;}
});
