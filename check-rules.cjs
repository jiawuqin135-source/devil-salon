const assert=require('node:assert/strict');const {Game,Campaign,levels}=require('./engine.js');
function finishCountdown(g){for(let i=0;i<13;i++)g.tick(.25);}
function bot(g){let waited=0;for(let n=0;n<20000&&['countdown','playing'].includes(g.state);n++){if(g.state==='playing'){if(g.phase==='away'){waited+=.02;if(waited>=.16)g.press();}else{waited=0;g.release();}}g.tick(.02);}return g.state;}
let g=new Game(()=>.5);assert.equal(levels.length,12);assert.equal(g.reset(1),false);assert.equal(g.state,'ready');assert.equal(g.reset(-1),false);assert.equal(g.reset(12),false);assert.equal(g.reset(NaN),false);g.reset(0);g.press();assert.equal(g.holding,false);assert.equal(g.remaining,72);finishCountdown(g);g.press();assert.equal(g.reason,'caught');assert.equal(g.campaign.unlocked,1);
g.reset(0);finishCountdown(g);g.phase='away';g.phaseTime=.2;g.press();g.tick(.2);assert.equal(g.phase,'warning');g.release();for(let i=0;i<6;i++)g.tick(.25);assert.equal(g.state,'playing');
g.reset(0);finishCountdown(g);g.phase='warning';g.phaseTime=.1;g.press();g.tick(.2);assert.equal(g.reason,'caught');
g.reset(0);finishCountdown(g);g.phase='away';g.phaseTime=2;g.press();g.pause();const p=g.progress,t=g.remaining;g.tick(.2);assert.equal(g.progress,p);assert.equal(g.remaining,t);g.resume();assert.equal(g.holding,false);
g.reset(0);g.tick(.2);const c=g.countdown;g.pause();g.tick(.2);assert.equal(g.countdown,c);g.resume();assert.equal(g.state,'countdown');
g.reset(0);finishCountdown(g);g.remaining=.1;g.tick(.2);assert.equal(g.reason,'timeout');assert.equal(g.campaign.unlocked,1);
let summary=[];for(let seed=0;seed<40;seed++){let z=seed+1;const random=()=>{z=(1664525*z+1013904223)>>>0;return z/4294967296;};g=new Game(random);for(let level=0;level<12;level++){assert.equal(g.reset(level),true);assert.equal(bot(g),'won',`seed ${seed}, stage ${level+1}`);assert.equal(g.campaign.unlocked,Math.min(12,level+2));if(seed===0)summary.push({level:level+1,remaining:+g.remaining.toFixed(1),warning:levels[level].warning});}}
// Worst attention pattern: shortest away windows and longest watching windows.
class WorstGame extends Game{pick(range){return this.phase==='away'?range[0]:range[1];}}
g=new WorstGame();for(let i=0;i<12;i++){g.reset(i);assert.equal(bot(g),'won','worst pattern '+(i+1));}
const data=g.campaign.serialize(),restored=new Campaign(JSON.parse(JSON.stringify(data)));assert.equal(restored.unlocked,12);const previous=restored.records[0].stars;restored.complete(0,1,0);assert.equal(restored.records[0].stars,previous);assert.equal(new Campaign({version:2,records:[null,{stars:3}]}).unlocked,1);assert.equal(new Campaign({version:2,records:[{stars:3},{stars:99},{stars:3}]}).unlocked,2);assert.equal(new Campaign({version:999,records:data.records}).unlocked,1);
for(let i=1;i<12;i++){assert(levels[i].time<levels[i-1].time);assert(levels[i].warning<levels[i-1].warning);assert(levels[i].away[0]<levels[i-1].away[0]);assert(levels[i].speed<levels[i-1].speed);}
console.log(JSON.stringify({passed:true,simulatedWins:492,summary},null,2));
