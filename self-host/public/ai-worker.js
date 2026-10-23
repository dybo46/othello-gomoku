import {chooseMove} from './ai.js';
self.onmessage=({data})=>{try{self.postMessage({job:data.job,index:chooseMove(data.board,data.color,data.level)});}catch{self.postMessage({job:data.job,index:null});}};
