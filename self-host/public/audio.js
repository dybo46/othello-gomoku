import {recordedPlaceSound} from './gomoku-sounds.js';
export class AudioBank{
  constructor(){this.ctx=null;this.volume=.4;this.buffers=new Map();this.pending=new Map();}
  unlock(){try{this.ctx??=new AudioContext();this.ctx.resume().catch(()=>{});}catch{}}
  tone(frequency,end,duration,type='sine',gain=.2,delay=0){if(!this.ctx||!this.volume)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(Math.max(.0001,gain*this.volume),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+duration+.01);}
  noise(duration=.12,gain=.1){if(!this.ctx||!this.volume)return;const n=Math.ceil(this.ctx.sampleRate*duration),buffer=this.ctx.createBuffer(1,n,this.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n)**3;const s=this.ctx.createBufferSource(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();s.buffer=buffer;f.type='lowpass';f.frequency.value=1600;g.gain.value=gain*this.volume;s.connect(f).connect(g).connect(this.ctx.destination);s.start();}

  prepare(style){
    const sound=recordedPlaceSound(style);if(!sound)return Promise.resolve(null);
    if(this.buffers.has(style))return Promise.resolve(this.buffers.get(style));
    if(this.pending.has(style))return this.pending.get(style);
    if(!this.ctx)return Promise.reject(new Error('音声を有効にしてください'));
    const task=(async()=>{const response=await fetch(sound.url);if(!response.ok)throw new Error('音源を読み込めません');const buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(style,buffer);return buffer;})().finally(()=>this.pending.delete(style));
    this.pending.set(style,task);return task;
  }
  async playSample(style){this.unlock();if(!this.ctx||!this.volume)return false;const buffer=await this.prepare(style);if(!buffer)return false;await this.ctx.resume();const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;gain.gain.value=this.volume;source.connect(gain).connect(this.ctx.destination);source.start();return true;}
  async previewPlace(style){this.unlock();if(!this.ctx||!this.volume||style==='off')return false;if(recordedPlaceSound(style))return this.playSample(style);this.place(style);return true;}
  place(style){if(recordedPlaceSound(style))return this.playSample(style).catch(()=>{this.place('go');return false;});if(style==='off')return;if(style==='go'){this.noise(.026,.32);this.tone(1050,380,.035,'triangle',.19);this.tone(290,130,.055,'sine',.12);}else if(style==='glass'){this.tone(1600,900,.18,'sine',.12);this.tone(2400,2100,.12,'sine',.06);}else if(style==='soft')this.tone(210,90,.07,'sine',.14);else{this.noise(.065,.26);this.tone(480,160,.065,'triangle',.14);}}
  change(style,effect,count=1){if(style==='off')return;if(style==='auto')style=(effect.startsWith('laser-')||['laser','lightning','sonic'].includes(effect))?'laser':['blast','shove','meteor','flame','frost'].includes(effect)?'burst':'chime';if(style==='laser'){this.tone(1400,100,.28,'sawtooth',.06);this.tone(2200,200,.24,'sine',.1);}else if(style==='burst'){this.noise(.2,.2);this.tone(180,50,.18,'triangle',.13);}else{const max=Math.min(count,5);for(let i=0;i<max;i++)this.tone(700+i*180,500+i*200,.17,'sine',.12,i*.035);}}
  result(){[523,659,784].forEach((f,i)=>this.tone(f,f,.35,'sine',.1,i*.13));}
}
