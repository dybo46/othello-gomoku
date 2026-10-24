import {chooseMove} from './ai.js';
import {chooseMove as gomokuMove} from './gomoku-ai.js';
self.onmessage=({data})=>{try{self.postMessage({job:data.job,index:(data.kind==='gomoku'?gomokuMove:chooseMove)(data.board,data.color,data.level,Math.random,data.context),context:data.context});}catch{self.postMessage({job:data.job,index:null});}};
