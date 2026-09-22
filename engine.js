/* Shared rules and device-local campaign; no DOM or platform APIs. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SalonEngine=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const names=['初次恶作剧','电话响了','偷偷加一剪','店长有点警觉','分秒必争','午后小风波','眼疾手快','剪刀协奏曲','危险的发梢','极限收手','恶魔实习考','首席恶魔理发师'];
const levels=names.map((name,i)=>Object.freeze({name,time:72-i*2,speed:10-i*.2,warning:Number((1.3-i*.065).toFixed(3)),away:[4.4-i*.25,5.8-i*.295],watch:[1.3+i*.037,2+i*.068],chapter:i<4?'实习日记':i<8?'进阶挑战':'恶魔试炼',hint:i<4?'先学会等待，再抓住机会':i<8?'她分心的时间越来越短':'预警更短，看见就要收手'}));
function cleanRecords(value){const rows=Array.isArray(value)?value:[];let gap=false;return levels.map((_,i)=>{const r=rows[i];const stars=r&&Number.isInteger(r.stars)&&r.stars>=1&&r.stars<=3?r.stars:0;if(!stars)gap=true;return !gap?{stars,bestRemaining:Number.isFinite(r.bestRemaining)?Math.max(0,Math.min(levels[i].time,r.bestRemaining)):0}:null;});}
class Campaign{
 constructor(saved){this.records=cleanRecords(saved&&saved.version===2?saved.records:null);}
 get unlocked(){const first=this.records.findIndex(r=>!r);return first<0?levels.length:Math.min(levels.length,first+1);}
 canPlay(index){return Number.isInteger(index)&&index>=0&&index<this.unlocked;}
 complete(index,stars,remaining){if(!this.canPlay(index))throw new Error('请先通关前一关');const prev=this.records[index];this.records[index]={stars:Math.max(prev?prev.stars:0,stars),bestRemaining:Math.max(prev?prev.bestRemaining:0,remaining)};}
 serialize(){return {version:2,records:this.records.map(r=>r?{...r}:null)};}
 cards(){return levels.map((l,i)=>({index:i,number:String(i+1).padStart(2,'0'),name:l.name,chapter:l.chapter,locked:!this.canPlay(i),stars:this.records[i]?this.records[i].stars:0,starText:this.records[i]?'★'.repeat(this.records[i].stars)+'☆'.repeat(3-this.records[i].stars):'',current:i===this.unlocked-1&&!this.records[i]}));}
}
class Game{
 constructor(random=Math.random,campaign=new Campaign()){this.random=random;this.campaign=campaign;this.events=[];this.level=0;this.state='ready';this.clearRound();}
 clearRound(){const c=levels[this.level];this.progress=0;this.remaining=c.time;this.holding=false;this.holdTime=0;this.phase='watch';this.phaseTime=1.6;this.phaseAge=0;this.distraction='phone';this.reason='';this.elapsed=0;this.countdown=3;this.hair=0;this.events=[];}
 reset(index=0){if(!this.campaign.canPlay(index))return false;this.level=index;this.clearRound();this.state='countdown';this.emit('countdown',{value:3});return true;}
 emit(type,extra={}){this.events.push({type,...extra});}
 takeEvents(){const out=this.events;this.events=[];return out;}
 press(){if(this.state!=='playing'||this.holding)return;this.holding=true;this.holdTime=0;if(this.phase==='watch')this.fail('caught');else this.emit('cut');}
 release(){if(this.holding&&this.state==='playing'&&this.phase==='warning'&&this.phaseTime<.3)this.emit('dodge');this.holding=false;this.holdTime=0;}
 fail(reason){this.state='lost';this.reason=reason;this.release();this.emit('lost',{reason});}
 pause(){if(this.state==='playing'||this.state==='countdown'){this.resumeState=this.state;this.state='paused';this.release();this.emit('pause');}}
 resume(){if(this.state==='paused'){this.state=this.resumeState||'playing';this.release();}}
 pick(range){return range[0]+Math.max(0,Math.min(1,this.random()))*(range[1]-range[0]);}
 nextPhase(){const c=levels[this.level];if(this.phase==='watch'){this.phase='away';this.phaseTime=this.pick(c.away);this.distraction=['phone','drink','book'][Math.min(2,Math.floor(Math.max(0,this.random())*3))];}else if(this.phase==='away'){this.phase='warning';this.phaseTime=c.warning;}else{this.phase='watch';this.phaseTime=this.pick(c.watch);}this.phaseAge=0;this.emit('phase',{phase:this.phase,distraction:this.distraction});if(this.phase==='watch'&&this.holding)this.fail('caught');}
 tick(dt){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.25);if(this.state==='countdown'){const before=Math.ceil(this.countdown);this.countdown=Math.max(0,this.countdown-dt);const after=Math.ceil(this.countdown);if(after!==before)this.emit('countdown',{value:after});if(this.countdown<=0){this.state='playing';this.emit('go');}return;}if(this.state!=='playing')return;
 while(dt>1e-9&&this.state==='playing'){const step=Math.min(dt,this.phaseTime,this.remaining);const oldSecond=Math.ceil(this.remaining);this.phaseTime-=step;this.phaseAge+=step;this.remaining-=step;this.elapsed+=step;if(this.holding&&this.phase!=='watch'){this.holdTime+=step;this.progress=Math.min(100,this.progress+step*levels[this.level].speed*(1+Math.min(.3,this.holdTime*.1)));const h=Math.min(3,Math.floor(this.progress/26));if(h>this.hair){this.hair=h;this.emit('hair',{hair:h});}}dt-=step;
 if(this.progress>=100){this.state='won';this.holding=false;this.campaign.complete(this.level,this.stars(),this.remaining);this.emit('won');break;}
 if(this.remaining<=.000001){this.fail('timeout');break;}
 if(Math.ceil(this.remaining)!==oldSecond&&this.remaining<=10)this.emit('heartbeat');
 if(this.phaseTime<=.000001)this.nextPhase();}}
 stars(){const ratio=this.remaining/levels[this.level].time;return ratio>=.5?3:ratio>=.25?2:1;}
 snapshot(){const c=levels[this.level];return {state:this.state,phase:this.phase,level:this.level,name:c.name,chapter:c.chapter,progress:this.progress,percent:Math.floor(this.progress),remaining:Math.ceil(this.remaining),holding:this.holding,holdTime:this.holdTime,phaseAge:this.phaseAge,distraction:this.distraction,title:this.phase==='away'?'她分心了，快动手！':this.phase==='warning'?'要回头了！快松手':'她在看着，先等一等',reason:this.reason,stars:this.stars(),hair:this.hair,countdown:Math.ceil(this.countdown),warningFraction:Math.max(0,this.phaseTime/c.warning),combo:Math.floor(this.holdTime*3),boost:Math.round(Math.min(.3,this.holdTime*.1)*100),unlocked:this.campaign.unlocked,total:levels.length};}
}
return {Game,Campaign,levels};
});
