import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Lobby} from './lobby.mjs';
import {VERSION} from './public/rules.js';
const root=path.dirname(fileURLToPath(import.meta.url)),lobby=new Lobby(),streams=new Map(),rates=new Map(),disconnects=new Map();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml'};
function send(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function publish(){for(const [id,res]of streams){if(res.writableLength>262144){res.destroy();continue;}res.write(`data: ${JSON.stringify(lobby.snapshot(id))}\n\n`);}}
function token(req){return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('boardroom='))?.slice(10)||'';}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  try{
    const url=new URL(req.url,'http://localhost'),id=token(req),p=lobby.players.get(id);
    if(url.pathname==='/health'){send(res,200,{ok:true,version:VERSION});return;}
    if(url.pathname==='/api/info'){send(res,200,{version:VERSION,count:lobby.players.size,max:5,defaultName:lobby.defaultName(),session:p?{name:p.name}:null,names:['こはく','しろくま','黒まめ','翡翠','ぽんず','ミント','ねこ丸','銀の月','こむぎ','夜ふかし','たぬき','抹茶ラテ']});return;}
    if(url.pathname==='/api/events'&&req.method==='GET'){
      if(!p){send(res,401,{error:'入室してください。'});return;}clearTimeout(disconnects.get(id));disconnects.delete(id);streams.get(id)?.end();res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});streams.set(id,res);p.lastSeen=Date.now();res.write(`data: ${JSON.stringify(lobby.snapshot(id))}\n\n`);
      req.on('close',()=>{if(streams.get(id)!==res)return;streams.delete(id);const timer=setTimeout(()=>{disconnects.delete(id);if(!streams.has(id)){lobby.leave(id);publish();}},1800);disconnects.set(id,timer);});return;
    }
    if(url.pathname.startsWith('/api/')&&req.method==='POST'){
      if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){send(res,403,{error:'接続元を確認できません。'});return;}
      const key=id||req.socket.remoteAddress,now=Date.now(),rate=rates.get(key)||{at:now,count:0};if(now-rate.at>1000){rate.at=now;rate.count=0;}rate.count++;rates.set(key,rate);if(rate.count>40){send(res,429,{error:'少し待って操作してください。'});return;}
      let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>4096)throw Object.assign(new Error('データが大きすぎます。'),{status:413});}let data;try{data=JSON.parse(raw||'{}');}catch{throw Object.assign(new Error('データ形式が違います。'),{status:400});}
      if(url.pathname==='/api/join'){const player=p||lobby.join(data.name,data.automatic===true);res.setHeader('Set-Cookie',`boardroom=${player.id}; HttpOnly; SameSite=Strict; Path=/`);send(res,200,{name:player.name});publish();return;}
      if(!p){send(res,401,{error:'退室しました。もう一度入室してください。'});return;}p.lastSeen=now;
      switch(url.pathname){
        case '/api/heartbeat':break;
        case '/api/settings':lobby.settings(id,data);break;
        case '/api/ready':lobby.ready(id,data.ready);break;
        case '/api/mode':lobby.mode(id,data.mode);break;
        case '/api/move':lobby.play(id,data.index,data.revision);break;
        case '/api/highlight':lobby.highlight(id,data.enabled);break;
        case '/api/rematch':lobby.rematch(id,data.matchId,data.accept);break;
        case '/api/result-back':lobby.backToLobby(id,data.matchId);break;
        case '/api/resign':lobby.resign(id);break;
        case '/api/leave':clearTimeout(disconnects.get(id));disconnects.delete(id);lobby.leave(id);streams.get(id)?.end();streams.delete(id);res.setHeader('Set-Cookie','boardroom=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/');break;
        default:send(res,404,{error:'操作が見つかりません。'});return;
      }send(res,200,{ok:true});publish();return;
    }
    if(!['GET','HEAD'].includes(req.method)){send(res,405,{error:'対応していない操作です。'});return;}
    const file=path.resolve(root,'public',decodeURIComponent(url.pathname==='/'?'index.html':url.pathname.slice(1))),base=path.resolve(root,'public')+path.sep;if(!file.startsWith(base)){send(res,403,{error:'アクセスできません。'});return;}
    try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);}catch{send(res,404,{error:'見つかりません。'});}
  }catch(e){if(!res.headersSent)send(res,e.status||500,{error:e.status?e.message:'サーバーでエラーが発生しました。'});else res.end();}
});
const clock=setInterval(()=>{if(lobby.advance())publish();},200);
const cleanup=setInterval(()=>{for(const [id,p]of lobby.players)if(Date.now()-p.lastSeen>18000){lobby.leave(id);streams.get(id)?.end();streams.delete(id);publish();}for(const res of streams.values())res.write(': keepalive\n\n');for(const [k,r]of rates)if(Date.now()-r.at>60000)rates.delete(k);},5000);
server.listen(Number(process.env.PORT||8788),process.env.HOST||'127.0.0.1',()=>console.log(`オセロ・五目 v${VERSION} http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||8788}/`));
function stop(){clearInterval(clock);clearInterval(cleanup);for(const t of disconnects.values())clearTimeout(t);for(const r of streams.values())r.end();server.close(()=>process.exit(0));}process.on('SIGINT',stop);process.on('SIGTERM',stop);
