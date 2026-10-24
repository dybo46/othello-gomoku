import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';
import {GOMOKU_SKINS,chooseGomokuSkin,normalizeGomoku}from'../public/gomoku-skins.js';
const ids=['P1','P7','P8','R1','R2','R3','R4','R5','R7','R8'];
test('採用10盤は背景と透過黒白ペアが読み込め、固定選択と抽選・既存設定が共存する',()=>{
 assert.equal(new Set(GOMOKU_SKINS.map(s=>s.id)).size,18);
 for(const id of ids){const s=GOMOKU_SKINS.find(s=>s.id===id);assert.equal(chooseGomokuSkin(id,'K2'),id);assert.equal(normalizeGomoku({skin:id}).skin,id);assert.equal(s.coordinates,false);
  for(const [asset,pair]of [[s.image,false],[s.stonePair,true]]){const buf=readFileSync(new URL(asset.replace(/^\//,''), new URL('../public/',import.meta.url)));assert.equal(buf.subarray(1,4).toString(),'PNG');const w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);assert.equal(w,pair?h*2:h);if(pair)assert.equal(buf[25],6,'RGBA sprite');}
  for(const before of GOMOKU_SKINS)if(before.id!==id){const pool=GOMOKU_SKINS.filter(s=>s.id!==before.id);assert.equal(chooseGomokuSkin('random',before.id,()=>pool.findIndex(s=>s.id===id)/pool.length),id);}
  const b=s.board,halfStone=b.size/14*.55;assert(b.left-halfStone>0&&b.top-halfStone>0&&b.left+b.size+halfStone<100&&b.top+b.size+halfStone<100);
 }
 assert.equal(GOMOKU_SKINS.find(s=>s.id==='R8').stonePair,GOMOKU_SKINS.find(s=>s.id==='R5').stonePair);
 assert.equal(GOMOKU_SKINS.find(s=>s.id==='R8').stoneRadius,'50%');
 assert.equal(normalizeGomoku({skin:'K7',placeSound:'wood'}).skin,'K7');assert(!GOMOKU_SKINS.some(s=>s.id==='R6'||s.id==='R9'));
});
