import test from 'node:test';import assert from 'node:assert/strict';
import {withoutBackgrounds,withRandomBackgrounds} from '../public/preference-storage.js';import {normalizePreferences} from '../public/skins.js';
test('背景2項目だけを保存から外し、音/駒/サイズ/難易度などを維持する',()=>{
 const p=normalizePreferences({skin:'F2',stone:'glass',placeSound:'soft',volume:23,cpu:7,boardSize:'smart',gomoku:{skin:'P7',placeSound:'group-random-cute'}}),before=structuredClone(p),saved=withoutBackgrounds(p);
 assert(!Object.hasOwn(saved,'skin'));assert(!Object.hasOwn(saved.gomoku,'skin'));assert.deepEqual(p,before);
 assert.deepEqual({...saved,gomoku:{...saved.gomoku,skin:p.gomoku.skin},skin:p.skin},p);
 const loaded=normalizePreferences(JSON.parse(JSON.stringify(saved)));assert.equal(loaded.skin,'random');assert.equal(loaded.gomoku.skin,'random');assert.equal(loaded.volume,23);assert.equal(loaded.stone,'glass');assert.equal(loaded.cpu,7);
});
test('旧保存値と退出時の背景をランダムへ戻し、そのほかは変更しない',()=>{
 const p=normalizePreferences({skin:'F2',gomoku:{skin:'P7',placeSound:'go'},volume:18,stone:'glass'}),reset=withRandomBackgrounds(p);
 assert.equal(reset.skin,'random');assert.equal(reset.gomoku.skin,'random');assert.equal(reset.gomoku.placeSound,'go');assert.equal(reset.volume,18);assert.equal(reset.stone,'glass');assert.equal(p.skin,'F2');
});
