import {randomBytes,randomInt} from 'node:crypto';
import {createGame,move,conclude,checkTime,normalizeTime} from './public/games.js';
function fail(message,status=400){throw Object.assign(new Error(message),{status});}
export class Lobby{
  constructor(){this.players=new Map();this.order=[];this.matches=[];this.result=null;this.number=0;this.messages=[];this.chatSerial=0;}
  get queue(){return this.order.filter(id=>!this.matchFor(id));}
  get match(){return this.sortedMatches()[0]||null;}
  matchFor(id){return this.matches.find(m=>m.ids.includes(id))||null;}
  sortedMatches(){return this.matches.slice().sort((a,b)=>Math.min(...a.ids.map(id=>this.order.indexOf(id)).filter(n=>n>=0))-Math.min(...b.ids.map(id=>this.order.indexOf(id)).filter(n=>n>=0))||a.id-b.id);}
  defaultName(){for(let n=1;n<=5;n++)if(![...this.players.values()].some(p=>p.name===`名無しさん${n}`))return `名無しさん${n}`;return '名無しさん';}
  join(name,automatic=false){if(this.players.size>=5)fail('満杯です。5人まで入室できます。',409);name=automatic?this.defaultName():String(name??'').trim().normalize('NFC');if(!name||Array.from(name).length>7||/[\p{C}<>]/u.test(name))fail('名前は1〜7文字で入力してください。');if([...this.players.values()].some(p=>p.name===name))fail('同じ名前の方がいます。',409);
    const p={id:randomBytes(24).toString('hex'),name,wins:0,streak:0,best:0,ready:false,anyone:false,mode:'lobby',seconds:60,game:'othello',lastMoveHighlight:true,lastSeen:Date.now(),retained:false,watching:null};this.players.set(p.id,p);this.order.push(p.id);for(const m of this.matches)m.rematchVotes=[];return p;}
  settings(id,data){const p=this.players.get(id);if(!p||p.mode==='match')return;if(data.game&&!['othello','gomoku'].includes(data.game))fail('ゲームが見つかりません。');if(data.game)p.game=data.game;if(data.seconds!==undefined)p.seconds=normalizeTime(data.seconds);this.tryMatch();}
  chat(id,text,now=Date.now()){
    const p=this.players.get(id);if(!p)fail('入室してください。',401);
    if(typeof text!=='string')fail('メッセージを入力してください。');
    text=text.trim();if(!text||Array.from(text).length>200||/[\p{Cc}\p{Cs}]/u.test(text))fail('メッセージは1〜200文字で入力してください。');
    if(p.chatAt!==undefined&&now-p.chatAt<800)fail('少し待ってから送信してください。',429);
    p.chatAt=now;this.messages.push({id:++this.chatSerial,name:p.name,text,at:now});if(this.messages.length>60)this.messages.shift();
  }
  highlight(id,enabled){const p=this.players.get(id);if(p)p.lastMoveHighlight=enabled===true;}
  mode(id,mode){const p=this.players.get(id);if(!p||p.mode==='match')return;p.mode=['cpu','watch'].includes(mode)?mode:'lobby';this.tryMatch();}
  ready(id,value){const p=this.players.get(id);if(!p||!['lobby','cpu','watch'].includes(p.mode))return;p.ready=value===true;this.tryMatch();}
  anyone(id,value){const p=this.players.get(id);if(!p)return;p.anyone=value===true;this.tryMatch();}
  startPair(pair,lane,now){
    const owner=this.players.get(pair[0]),ids=randomInt(2)?pair.slice().reverse():pair.slice();
    for(const id of pair){const p=this.players.get(id);p.mode='match';p.ready=false;p.retained=false;}
    const m={id:++this.number,lane,ids,ownerId:owner.id,names:ids.map(id=>this.players.get(id).name),owner:owner.name,game:createGame(owner.seconds,now,owner.game),recorded:false,rematchVotes:[]};this.matches.push(m);return m;
  }
  tryMatch(now=Date.now()){
    const waiting=()=>this.queue.filter(id=>{const p=this.players.get(id);return p?.ready&&['lobby','cpu','watch'].includes(p.mode);});
    // The main table keeps the existing serial queue. Extra tables require mutual opt-in.
    if(!this.matches.some(m=>m.lane===0)){
      const pair=waiting().slice(0,2);
      if(pair.length===2){
        for(const id of this.queue){const p=this.players.get(id);if(p.retained&&!pair.includes(id)){p.retained=false;this.order=this.order.filter(x=>x!==id);this.order.push(id);}}
        this.startPair(pair,0,now);
      }
    }
    if(!this.matches.some(m=>m.lane===1)){
      const pair=waiting().filter(id=>this.players.get(id).anyone).slice(0,2);
      if(pair.length===2)this.startPair(pair,1,now);
    }
  }
  spectate(id,matchId){const p=this.players.get(id);if(!p)return;if(this.matchFor(id))fail('自分の対局が終わってから観戦先を変更できます。',409);const m=this.matches.find(m=>m.id===matchId);if(!m)fail('その対局は終了しました。',409);p.watching=m.id;p.mode='lobby';}
  canRematch(m=this.match){return !!m&&m.game.status==='finished'&&this.players.size===2&&m.ids.every(id=>this.players.has(id));}
  rematch(id,matchId,accept,now=Date.now()){
    const m=this.matches.find(m=>m.id===matchId);if(!m)fail('対局が更新されました。',409);
    if(!m.ids.includes(id))fail('対戦者ではありません。',403);if(!this.canRematch(m))fail('再戦は対戦者2人だけのときにできます。',409);
    const votes=new Set(m.rematchVotes);if(accept===true)votes.add(id);else votes.delete(id);m.rematchVotes=[...votes];
    if(votes.size===2){for(const id of m.ids)this.players.get(id).ready=false;const ids=randomInt(2)?m.ids.slice().reverse():m.ids.slice();const next={...m,id:++this.number,ids,names:ids.map(i=>this.players.get(i).name),game:createGame(m.game.seconds,now,m.game.kind),recorded:false,rematchVotes:[]};this.matches.splice(this.matches.indexOf(m),1,next);}
  }
  backToLobby(id,matchId){const m=this.matches.find(m=>m.id===matchId);if(!m)fail('対局が更新されました。',409);if(!m.ids.includes(id))fail('対戦者ではありません。',403);if(m.game.status!=='finished')fail('対局中です。',409);this.release(m);}
  play(id,index,revision,now=Date.now(),matchId){const m=this.matchFor(id),color=m?m.ids.indexOf(id)+1:0;if(!color||!m)fail('対戦者ではありません。',403);if(matchId!==undefined&&matchId!==m.id)fail('対局が更新されました。',409);if(revision!==m.game.revision)fail('盤面が更新されました。',409);if(!move(m.game,index,color,now))fail(m.game.status==='finished'?'対局は終了しました。':'ここには置けません。',409);this.record(m);}
  resign(id,reason='降参',now=Date.now(),matchId){const m=this.matchFor(id),color=m?m.ids.indexOf(id)+1:0;if(matchId!==undefined&&m&&matchId!==m.id)fail('対局が更新されました。',409);if(color&&conclude(m.game,3-color,reason,now))this.record(m);}
  record(m=this.match){if(!m||m.recorded||m.game.status!=='finished')return;m.recorded=true;for(let c=1;c<=2;c++){const p=this.players.get(m.ids[c-1]);if(p){p.ready=m.game.winner===c;if(m.game.winner===c){p.wins++;p.streak++;p.best=Math.max(p.best,p.streak);}else p.streak=0;}}
    this.result={id:m.id,names:m.names,winner:m.game.winner,score:m.game.result,reason:m.game.reason};
  }
  release(m=this.match,now=Date.now()){
    if(!m||!this.matches.includes(m)||m.game.status!=='finished')return;const winner=m.game.winner?m.ids[m.game.winner-1]:null;
    for(const id of m.ids){const p=this.players.get(id);if(p){p.mode='lobby';p.ready=id===winner;p.retained=id===winner;}}
    // Keep a winner's current place; only the loser(s) move to the end.
    for(const id of m.ids)if(id!==winner&&this.players.has(id)){this.order=this.order.filter(x=>x!==id);this.order.push(id);}
    this.matches=this.matches.filter(x=>x!==m);this.tryMatch(now);
  }
  advance(now=Date.now()){let changed=false;for(const m of this.matches.slice()){
    if(checkTime(m.game,now)){this.record(m);changed=true;}
    else if(m.game.status==='finished'&&now-m.game.finishedAt>14000){this.release(m,now);changed=true;}
  }return changed;}
  leave(id){if(!this.players.has(id))return;this.resign(id,'切断・退出');this.players.delete(id);this.order=this.order.filter(x=>x!==id);if(!this.players.size){this.messages=[];this.matches=[];}}
  nextInfo(id){
    const me=this.players.get(id),own=this.matchFor(id),primary=this.matches.find(m=>m.lane===0);let owner;
    if(own)owner=this.players.get(own.ownerId);
    else if(me?.anyone&&primary){const free=this.queue.map(i=>this.players.get(i));owner=free.find(p=>p.anyone&&(p.ready||p.id===id))||free.find(p=>p.anyone)||me;}
    else owner=primary?this.players.get(primary.ownerId):this.queue.map(i=>this.players.get(i)).find(p=>p.ready)||this.players.get(this.queue[0]);
    const match=own||(!me?.anyone?primary:null);
    return owner?{position:this.order.indexOf(owner.id)+1,game:match?.game.kind||owner.game,seconds:match?.game.seconds||owner.seconds,anyone:me?.anyone===true}:null;
  }
  snapshot(id){
    const me=this.players.get(id),own=this.matchFor(id),sorted=this.sortedMatches(),view=own||this.matches.find(m=>m.id===me?.watching)||sorted[0]||null;
    const roster=this.order.map(i=>this.players.get(i)).filter(Boolean).map((p,index)=>{const m=this.matchFor(p.id);return {id:p.id.slice(0,12),position:index+1,name:p.name,wins:p.wins,streak:p.streak,best:p.best,ready:p.ready,anyone:p.anyone,mode:p.mode,game:p.game,seconds:p.seconds,retained:p.retained,matchId:m?.id||null,matchStatus:m?.game.status||null};});
    const serialize=m=>({id:m.id,names:m.names,owner:m.owner,side:m.ids.indexOf(id)+1,lastMoveHighlight:m.ids.every(i=>this.players.get(i)?.lastMoveHighlight===true),rematch:{eligible:this.canRematch(m),requested:m.rematchVotes.includes(id),count:m.rematchVotes.length},game:m.game});
    return {now:Date.now(),players:roster,me:me?{...roster.find(p=>p.id===id.slice(0,12))}:null,queue:this.queue.map(x=>x.slice(0,12)),chat:me?this.messages.map(m=>({...m})):[],result:this.result,next:this.nextInfo(id),matches:sorted.map(m=>({id:m.id,names:m.names,owner:m.owner,game:m.game.kind,status:m.game.status})),match:view?serialize(view):null};
  }
}
