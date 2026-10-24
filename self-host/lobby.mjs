import {randomBytes,randomInt} from 'node:crypto';
import {createGame,move,conclude,checkTime,normalizeTime} from './public/games.js';
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
export class Lobby{
  constructor(){this.players=new Map();this.queue=[];this.match=null;this.result=null;this.number=0;}
  defaultName(){for(let n=1;n<=5;n++)if(![...this.players.values()].some(p=>p.name===`名無しさん${n}`))return `名無しさん${n}`;return '名無しさん';}
  join(name,automatic=false){if(this.players.size>=5)fail('満杯です。5人まで入室できます。',409);name=automatic?this.defaultName():String(name??'').trim().normalize('NFC');if(!name||Array.from(name).length>7||/[\p{C}<>]/u.test(name))fail('名前は1〜7文字で入力してください。');if([...this.players.values()].some(p=>p.name===name))fail('同じ名前の方がいます。',409);
    const p={id:randomBytes(24).toString('hex'),name,wins:0,streak:0,best:0,ready:false,mode:'lobby',seconds:60,game:'othello',lastMoveHighlight:true,lastSeen:Date.now(),retained:false};this.players.set(p.id,p);this.queue.push(p.id);if(this.match)this.match.rematchVotes=[];return p;}
  settings(id,data){const p=this.players.get(id);if(!p||p.mode==='match')return;if(data.game&&!['othello','gomoku'].includes(data.game))fail('ゲームが見つかりません。');if(data.game)p.game=data.game;if(data.seconds!==undefined)p.seconds=normalizeTime(data.seconds);p.ready=false;}
  highlight(id,enabled){const p=this.players.get(id);if(p)p.lastMoveHighlight=enabled===true;}
  mode(id,mode){const p=this.players.get(id);if(!p||p.mode==='match')return;p.mode=['cpu','watch'].includes(mode)?mode:'lobby';this.tryMatch();}
  ready(id,value){const p=this.players.get(id);if(!p||!['lobby','cpu','watch'].includes(p.mode))return;p.ready=value===true;this.tryMatch();}
  tryMatch(now=Date.now()){
    if(this.match)return;const pair=this.queue.filter(id=>{const p=this.players.get(id);return p?.ready&&['lobby','cpu','watch'].includes(p.mode);}).slice(0,2);if(pair.length<2)return;
    for(const id of this.queue.slice()){const p=this.players.get(id);if(p?.retained&&!pair.includes(id)){p.retained=false;this.queue=this.queue.filter(x=>x!==id);this.queue.push(id);}}
    const owner=this.players.get(pair[0]),black=randomInt(2),ids=black?[pair[1],pair[0]]:pair;
    this.queue=this.queue.filter(id=>!pair.includes(id));for(const id of pair){const p=this.players.get(id);p.mode='match';p.ready=false;p.retained=false;}
    this.match={id:++this.number,ids,names:ids.map(id=>this.players.get(id).name),owner:owner.name,game:createGame(owner.seconds,now,owner.game),recorded:false,rematchVotes:[]};
  }
  canRematch(){const m=this.match;return !!m&&m.game.status==='finished'&&this.players.size===2&&m.ids.every(id=>this.players.has(id));}
  rematch(id,matchId,accept,now=Date.now()){
    const m=this.match;if(!m||m.id!==matchId)fail('対局が更新されました。',409);
    if(!m.ids.includes(id))fail('対戦者ではありません。',403);
    if(!this.canRematch())fail('再戦は対戦者2人だけのときにできます。',409);
    const votes=new Set(m.rematchVotes);if(accept===true)votes.add(id);else votes.delete(id);m.rematchVotes=[...votes];
    if(votes.size===2){const ids=randomInt(2)?m.ids.slice().reverse():m.ids.slice();this.match={id:++this.number,ids,names:ids.map(i=>this.players.get(i).name),owner:m.owner,game:createGame(m.game.seconds,now,m.game.kind),recorded:false,rematchVotes:[]};}
  }
  backToLobby(id,matchId){const m=this.match;if(!m||m.id!==matchId)fail('対局が更新されました。',409);if(!m.ids.includes(id))fail('対戦者ではありません。',403);if(m.game.status!=='finished')fail('対局中です。',409);this.release();}
  play(id,index,revision,now=Date.now()){const m=this.match,color=m?m.ids.indexOf(id)+1:0;if(!color||!m)fail('対戦者ではありません。',403);if(revision!==m.game.revision)fail('盤面が更新されました。',409);if(!move(m.game,index,color,now))fail(m.game.status==='finished'?'対局は終了しました。':'ここには置けません。',409);this.record();}
  resign(id,reason='降参',now=Date.now()){const m=this.match,color=m?m.ids.indexOf(id)+1:0;if(color&&conclude(m.game,3-color,reason,now))this.record();}
  record(){const m=this.match;if(!m||m.recorded||m.game.status!=='finished')return;m.recorded=true;for(let c=1;c<=2;c++){const p=this.players.get(m.ids[c-1]);if(p){if(m.game.winner===c){p.wins++;p.streak++;p.best=Math.max(p.best,p.streak);}else p.streak=0;}}
    this.result={id:m.id,names:m.names,winner:m.game.winner,score:m.game.result,reason:m.game.reason};
  }
  release(){const m=this.match;if(!m)return;const winner=m.game.winner?m.ids[m.game.winner-1]:null;for(const id of m.ids){const p=this.players.get(id);if(p){p.mode='lobby';p.ready=false;p.retained=id===winner;}}
    this.queue=this.queue.filter(id=>!m.ids.includes(id));if(winner&&this.players.has(winner))this.queue.unshift(winner);for(const id of m.ids)if(id!==winner&&this.players.has(id))this.queue.push(id);this.match=null;this.tryMatch();
  }
  advance(now=Date.now()){const m=this.match;if(!m)return false;if(checkTime(m.game,now)){this.record();return true;}if(m.game.status==='finished'&&!this.canRematch()&&now-m.game.finishedAt>14000){this.release();return true;}return false;}
  leave(id){if(!this.players.has(id))return;this.resign(id,'切断・退出');this.players.delete(id);this.queue=this.queue.filter(x=>x!==id);}
  snapshot(id){const me=this.players.get(id);const roster=[...(this.match?.ids||[]),...this.queue].map(i=>this.players.get(i)).filter(Boolean).map(p=>({id:p.id.slice(0,12),name:p.name,wins:p.wins,streak:p.streak,best:p.best,ready:p.ready,mode:p.mode,game:p.game,seconds:p.seconds,retained:p.retained}));return {now:Date.now(),players:roster,me:me?{...roster.find(p=>p.id===id.slice(0,12))}:null,queue:this.queue.map(x=>x.slice(0,12)),result:this.result,match:this.match?{id:this.match.id,names:this.match.names,owner:this.match.owner,side:this.match.ids.indexOf(id)+1,lastMoveHighlight:this.match.ids.every(i=>this.players.get(i)?.lastMoveHighlight===true),rematch:{eligible:this.canRematch(),requested:this.match.rematchVotes.includes(id),count:this.match.rematchVotes.length},game:this.match.game}:null};}
}
