import * as othello from './rules.js';
import * as gomoku from './gomoku-rules.js';
export {VERSION,conclude,checkTime,normalizeTime} from './rules.js';
export const gameName=kind=>kind==='gomoku'?'五目':'オセロ';
export const rules=kind=>kind==='gomoku'?gomoku:othello;
export const createGame=(seconds,now,kind='othello')=>({...rules(kind).createGame(seconds,now),kind});
export const move=(g,index,color,now)=>rules(g.kind).move(g,index,color,now);
