import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LIQUID_GOMOKU_SKINS} from '../public/gomoku-skins-liquid.js';
import {GOMOKU_SKINS,normalizeGomoku,chooseGomokuSkin} from '../public/gomoku-skins.js';
const requested=["LA2","LB4","LA3","LC6","LF4","LF1","LA4","LC4","LB1","LA6","LB2","LA8","LA9","LB3","LB5","LB6","LB7","LB8","LD2","LC3","LC7","LC9","LD5","LD1","LD3","LD4","LD7","LD8","LD9","LE1","LE2","LE3","LE4","LE5","LE6","LE7","LE8","LE9","LF5","LF6","LF2","LF7","LG1","LG2","LG4","LG5","LG6","LG7","LG8","LH1","LH2","LH4","LH5","LH8","LH7","LH6","LH3","LH9","LI1","LI2","LI3","LI5","LI6","LI7","LI8","LI9","LI4","LJ1","LJ2","LJ3","LJ4","LJ5","LJ6","LJ7","LJ8","LJ9"];

test('削除した2種類を選択・抽選から外し、残る74種類と旧18種類を維持する',()=>{
 assert.deepEqual(LIQUID_GOMOKU_SKINS.map(s=>s.id),requested.filter(id=>!['LH8','LJ8'].includes(id)));
 assert.equal(GOMOKU_SKINS.length,92);
 assert.equal(new Set(GOMOKU_SKINS.map(s=>s.id)).size,92);
 for(const id of ['LH8','LJ8'])assert.equal(normalizeGomoku({skin:id}).skin,'random');
 for(let i=0;i<92;i++)assert(!['LH8','LJ8'].includes(chooseGomokuSkin('random',null,()=> (i+.5)/92)));
 assert.equal(LIQUID_GOMOKU_SKINS.find(s=>s.id==='LJ7').name,'アメジスト・シルク');
 assert.equal(LIQUID_GOMOKU_SKINS.find(s=>s.id==='LJ7').stonePair,'./assets/gomoku/liquid/stones-LJ7.png');
 const files=new Set();
 for(const skin of LIQUID_GOMOKU_SKINS){
  assert.equal(normalizeGomoku({skin:skin.id}).skin,skin.id);
  assert.equal(chooseGomokuSkin(skin.id,'K2'),skin.id);
  assert.equal(skin.coordinates,false);
  assert(!skin.name.includes(skin.id));
  const b=skin.board,margin=b.size/14*.55;
  assert(b.left-margin>0&&b.top-margin>0&&b.left+b.size+margin<100&&b.top+b.size+margin<100);
  for(const [file,isPair]of [[skin.image,false],[skin.stonePair,true]]){
   assert(!files.has(file),'Each theme owns its artwork');files.add(file);
   const png=readFileSync(new URL(file,new URL('../public/',import.meta.url)));
   assert.equal(png.subarray(1,4).toString(),'PNG');
   assert.equal(png.readUInt32BE(16),isPair?1024:1254);
   assert.equal(png.readUInt32BE(20),isPair?512:1254);
   if(isPair)assert.equal(png[25],6,'Transparent RGBA atlas');
  }
  const thumb=readFileSync(new URL(skin.thumbnail,new URL('../public/',import.meta.url)));
  assert.equal(thumb.subarray(0,4).toString(),'RIFF');assert.equal(thumb.subarray(8,12).toString(),'WEBP');
 }
 assert.equal(normalizeGomoku({skin:'P7',placeSound:'go'}).skin,'P7');
});
