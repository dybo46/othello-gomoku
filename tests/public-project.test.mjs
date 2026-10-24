import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
async function files(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(['.git','.local','test-output'].includes(entry.name))continue;const name=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(name));else result.push(name);}return result;}
test('公開用の全テキストに作者の接続先・個人ワークスペースを含めない',async()=>{
  const forbidden=[/myqnapcloud\./i,/192\.168\./,/C:[\\/]Users[\\/]/i,/D:[\\/]desktop/i];
  for(const name of await files(root)){if(!/\.(?:md|mjs|js|html|css|json|yaml|example)$/.test(name)||name.endsWith('public-project.test.mjs'))continue;const text=await readFile(name,'utf8');for(const pattern of forbidden)assert.equal(pattern.test(text),false,path.relative(root,name));}
});
test('CPUデモはゲーム用ネットワークAPIを呼ばず、公開サブパスから起動できる',async()=>{
  const app=await readFile(path.join(root,'docs/app.js'),'utf8');
  assert.doesNotMatch(app,/\bfetch\s*\(|\bEventSource\s*\(|\bWebSocket\s*\(|\bsendBeacon\s*\(/);
  assert.doesNotMatch(app,/game-links|gameEntrance|1878\d|1879\d/);
  assert.match(app,/new Worker\('\.\/ai-worker\.js'/);assert.match(app,/window\.open\('\.\/\?popup=1'/);
  const html=await readFile(path.join(root,'docs/index.html'),'utf8');assert.doesNotMatch(html,/(?:src|href)="\/(?!\/)/);assert.match(html,/CPU専用/);
  for(const name of await files(path.join(root,'docs'))){if(!/\.(?:html|js|css)$/.test(name))continue;const text=await readFile(name,'utf8');assert.doesNotMatch(text,/['"`]\/assets\//,name);}
});
test('自分で設置する版とPagesデモで共通ルール・AI・20画像を維持する',async()=>{
  for(const name of ['rules.js','ai.js','ai-worker.js','effects.js','effects-extra.js','effects-lasers.js','board-geometry.js','match-labels.js'])assert.equal(await readFile(path.join(root,'docs',name),'utf8'),await readFile(path.join(root,'self-host/public',name),'utf8'),name);
  const {SKINS}=await import('../docs/skins.js');assert.equal(SKINS.length,20);
  for(const skin of SKINS){const relative=skin.image.replace(/^\.\//,'');assert.deepEqual(await readFile(path.join(root,'docs',relative)),await readFile(path.join(root,'self-host/public',relative)),skin.id);}
});


test('五目も共通CPU・18盤面・20CC0音・相対URLで収録する',async()=>{
 for(const name of ['games.js','gomoku-rules.js','gomoku-ai.js','gomoku-sounds.js','gomoku-skins.js','gomoku-skins-extra.js','gomoku-commentary.js','resign-effects.js'])
  assert.equal(await readFile(path.join(root,'docs',name),'utf8'),await readFile(path.join(root,'self-host/public',name),'utf8'),name);
 const {GOMOKU_SKINS}=await import('../docs/gomoku-skins.js');assert.equal(GOMOKU_SKINS.length,18);
 const {GOMOKU_PLACE_SOUNDS}=await import('../docs/gomoku-sounds.js');assert.equal(GOMOKU_PLACE_SOUNDS.length,20);
 for(const skin of GOMOKU_SKINS)for(const asset of [skin.image,skin.stonePair].filter(Boolean))assert.deepEqual(await readFile(path.join(root,'docs',asset)),await readFile(path.join(root,'self-host/public',asset)),asset);
 for(const sound of GOMOKU_PLACE_SOUNDS){assert.equal(sound.license,'CC0-1.0');assert.ok(sound.url.startsWith('./assets/'));assert.deepEqual(await readFile(path.join(root,'docs',sound.url)),await readFile(path.join(root,'self-host/public',sound.url)));}
 const app=await readFile(path.join(root,'docs/app.js'),'utf8');assert.doesNotMatch(app,/slice\(0,6\)/);assert.match(app,/othello-demo-preferences/);
});
