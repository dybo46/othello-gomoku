import test from 'node:test';
import assert from 'node:assert/strict';
import {turnLabel,resultLabel} from '../public/match-labels.js';
test('手番は自分だけ「あなた」を付け、クリック案内を混ぜない',()=>{assert.equal(turnLabel(1,'名無しさん１',1),'黒・名無しさん１（あなた）のターン。');assert.equal(turnLabel(2,'相手',1),'白・相手のターン。');});
test('結果は対戦者の勝敗、観戦者の勝者名、引き分けを区別する',()=>{assert.equal(resultLabel(1,'相手',1),'あなたの勝利です！');assert.equal(resultLabel(2,'相手',1),'あなたの負けです。');assert.equal(resultLabel(2,'六文字の名前',0),'白・六文字の名前が勝利しました');assert.equal(resultLabel(0,'',1),'引き分けです。');});
