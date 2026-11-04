import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
import{GOMOKU_PLACE_SOUNDS,MATCH_PLACE_SOUND_IDS,choosePlaceSound,GOMOKU_SOUND_GROUPS,categorySoundGroup,DEFAULT_PLACE_SOUND_MODE_POOL,chooseDefaultPlaceMode,resolvePlaceMode}from'../public/gomoku-sounds.js';
import{normalizeGomoku}from'../public/gomoku-skins.js';import{normalizePreferences}from'../public/skins.js';import{AudioBank}from'../public/audio.js';
test('全63着手音は実体の異なる短いWAV、全てCC0と作者・出典・ハッシュを持つ',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/assets/gomoku-audio/manifest.json',import.meta.url),'utf8'));
 assert.equal(GOMOKU_PLACE_SOUNDS.length,63);assert.equal(manifest.sounds.length,63);assert.equal(new Set(GOMOKU_PLACE_SOUNDS.map(s=>s.id)).size,63);assert.equal(GOMOKU_PLACE_SOUNDS.filter(s=>s.group==='囲碁の実録').length,5);
 const hashes=[];for(const sound of GOMOKU_PLACE_SOUNDS){const data=readFileSync(new URL(sound.url,new URL('../public/',import.meta.url)));assert.equal(data.subarray(0,4).toString(),'RIFF');assert.equal(data.subarray(8,12).toString(),'WAVE');assert.equal(data.readUInt16LE(22),1);assert.equal(data.readUInt32LE(24),44100);assert.equal(data.readUInt16LE(34),16);assert(sound.duration>.05&&sound.duration<1);let peak=0;for(let i=44;i<data.length;i+=2)peak=Math.max(peak,Math.abs(data.readInt16LE(i)));assert(peak>3000&&peak<17000);const item=manifest.sounds.find(s=>s.id===sound.id),sha=createHash('sha256').update(data).digest('hex');assert.equal(item.sha256,sha);hashes.push(sha);assert.equal(item.license,'CC0-1.0');assert(item.author&&item.page.startsWith('https://'));assert(!item.source.includes(':\\'));}
 assert.equal(new Set(hashes).size,63);
 const originals=JSON.parse(readFileSync(new URL('./fixtures/original-place-sound-hashes.json',import.meta.url),'utf8'));
 for(const [id,sha]of Object.entries(originals).filter(([id])=>id!=='digital-kirari'))assert.equal(manifest.sounds.find(s=>s.id===id).sha256,sha);
});
test('デフォルトの合成goを維持し、新音・試合ランダムを独立保存、抽選はoffと直前を除外',()=>{
 assert.equal(normalizeGomoku().placeSound,'default');assert.equal(normalizeGomoku({placeSound:'bad'}).placeSound,'default');assert.equal(normalizeGomoku({placeSound:'match-random'}).placeSound,'match-random');
 for(const sound of GOMOKU_PLACE_SOUNDS){const p=normalizePreferences({placeSound:'glass',gomoku:{placeSound:sound.id}});assert.equal(p.placeSound,'glass');assert.equal(p.gomoku.placeSound,sound.id);assert.equal(choosePlaceSound(sound.id,'go'),sound.id);}
 for(const prev of MATCH_PLACE_SOUND_IDS){const found=new Set();for(let n=0;n<1000;n++){const id=choosePlaceSound('match-random',prev,()=>n/1000);assert.notEqual(id,prev);assert.notEqual(id,'off');found.add(id);}assert.equal(found.size,MATCH_PLACE_SOUND_IDS.length-1);}
});
test('実音を一度だけ取得・デコードして再利用、音量と失敗時の従来音を維持',async()=>{
 const oldFetch=globalThis.fetch;let fetches=0,decodes=0,starts=0,failed=false,fallback=0,lastGain;
 const bank=new AudioBank();bank.volume=.35;bank.ctx={currentTime:0,destination:{},resume:async()=>{},decodeAudioData:async()=>{decodes++;return{duration:.4};},createBufferSource:()=>({connect(g){return g;},start(){starts++;}}),createGain:()=>{const g={gain:{value:0},connect(){lastGain=g.gain.value;}};return g;}};
 globalThis.fetch=async()=>{fetches++;return{ok:!failed,arrayBuffer:async()=>new ArrayBuffer(8)}};
 try{await Promise.all([bank.prepare('go-real-01'),bank.prepare('go-real-01')]);assert.equal(fetches,1);assert.equal(decodes,1);await bank.playSample('go-real-01');await bank.playSample('go-real-01');assert.equal(starts,2);assert.equal(lastGain,.35);assert.equal(fetches,1);failed=true;bank.noise=()=>{fallback++};bank.tone=()=>{};assert.equal(await bank.place('glass-tap-01'),false);assert(fallback>0);assert.equal(bank.pending.size,0);bank.volume=0;assert.equal(await bank.playSample('go-real-02'),false);assert.equal(fetches,2);}finally{globalThis.fetch=oldFetch;}
});

test('13カテゴリーの置くたびランダムは範囲を守り、直前を避け、各個別音を抽選できる',()=>{
 assert.equal(GOMOKU_SOUND_GROUPS.length,13);
 for(const group of GOMOKU_SOUND_GROUPS){
  assert.equal(normalizeGomoku({placeSound:group.id}).placeSound,group.id);
  assert(!MATCH_PLACE_SOUND_IDS.includes(group.id));
  assert.equal(group.members.length,({'囲碁の実録':5,'ビー玉の実録':4,'ガラス':6,'木':5,'金属':4,'かわいいデジタル':5,'鉱石・石':6,'クリスタル・きらめき':6,'水滴・リキッド':5,'透明デジタル':4,'サイバー・電子':3,'陶器・磁器':5,'やわらかいポップ':5})[group.name]);
  for(const previous of group.members){const found=new Set();for(let n=0;n<100;n++){const id=choosePlaceSound(group.id,previous,()=>n/100);assert(group.members.includes(id));assert.notEqual(id,previous);found.add(id);}assert.equal(found.size,group.members.length-1);}
 }
 assert.equal(GOMOKU_SOUND_GROUPS.find(g=>g.name==='ガラス').members.length,6);
});

test('カテゴリーは選択した音だけを先読みし、同時要求でも各音を一度だけ取得する',async()=>{
 const old=globalThis.fetch;const fetched=[];const bank=new AudioBank();bank.ctx={decodeAudioData:async()=>({duration:.2})};
 globalThis.fetch=async url=>{fetched.push(url);return{ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}};
 try{await Promise.all([bank.prepareSelection('group-random-glass'),bank.prepareSelection('group-random-glass')]);const group=categorySoundGroup('group-random-glass');assert.equal(fetched.length,6);assert.equal(bank.buffers.size,6);for(const id of group.members)assert(bank.buffers.has(id));assert.equal(bank.pending.size,0);}finally{globalThis.fetch=old;}
});

test('削除7音は個別・全抽選・配信ファイルから消え、旧保存値はdefaultになる',()=>{
 const retired=['cyber-03','cyber-04','metal-extra-01','metal-extra-04','wood-extra-05','clear-digital-05','digital-kirari'];
 for(const id of retired){assert(!GOMOKU_PLACE_SOUNDS.some(s=>s.id===id));assert(!MATCH_PLACE_SOUND_IDS.includes(id));assert(GOMOKU_SOUND_GROUPS.every(g=>!g.members.includes(id)));assert.equal(normalizeGomoku({placeSound:id}).placeSound,'default');assert.throws(()=>readFileSync(new URL('../public/assets/gomoku-audio/'+id+'.wav',import.meta.url)));}
});
test('デフォルトは18枠で希望3方式を2枠ずつ、その他は1枠ずつにする',()=>{
 assert.equal(DEFAULT_PLACE_SOUND_MODE_POOL.length,18);const counts={};
 for(let n=0;n<18;n++){const mode=chooseDefaultPlaceMode(()=>(n+.5)/18);counts[mode]=(counts[mode]||0)+1;}
 for(const mode of ['go','group-random-cute','group-random-soft-pop'])assert.equal(counts[mode],2);
 for(const [mode,count]of Object.entries(counts))if(!['go','group-random-cute','group-random-soft-pop'].includes(mode))assert.equal(count,1);
 assert(!DEFAULT_PLACE_SOUND_MODE_POOL.includes('off'));assert(!DEFAULT_PLACE_SOUND_MODE_POOL.includes('match-random'));
});
test('デフォルト方式は同じ試合中に抽選し直さず、次の試合で抽選、引継ぎにも対応',()=>{
 const session={};let draws=0;const random=()=>{draws++;return .5;};
 const first=resolvePlaceMode('default','match1',session,null,random);for(let i=0;i<30;i++)assert.equal(resolvePlaceMode('default','match1',session,null,random),first);assert.equal(draws,1);
 resolvePlaceMode('default','match2',session,null,random);assert.equal(draws,2);
 assert.equal(resolvePlaceMode('default','match3',session,'group-random-cute',random),'group-random-cute');assert.equal(draws,2);assert.equal(resolvePlaceMode('go','match3',session,null,random),'go');
});
