(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SalonPresentation=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const guests=[['小蓝','蓝色短发'],['阿卷','棕色卷发'],['林奶奶','银色丸子头'],['橘子','铜色双马尾'],['小棠','黑色波浪卷'],['阳阳','金色蓬松短发'],['小紫','紫色短发'],['陈爷爷','灰发与小胡子'],['可可','蓬松自然卷'],['桃桃','粉色长发'],['阿青','青色短发'],['栗小姐','栗色优雅卷发']];
 function frame(s){const clock=s.phaseAge||0,hold=s.holdTime||0;let devil=0,angel=4;
 if(s.holding)devil=hold<.22?1:2+(Math.floor((hold-.22)*(5+s.boost/6))%2);
 else if((s.phase==='away'||s.phase==='watch')&&clock<.45&&s.state==='playing')devil=1;
 if(s.state==='lost')devil=1;
 if(s.state==='won')devil=2;
 if(s.phase==='warning')angel=5;
 else if(s.phase==='away'){const base={drink:6,book:8,phone:10}[s.distraction]||10;const beat=s.distraction==='book'?.8:s.distraction==='drink'?.65:.7;angel=base+(s.distraction==='phone'?(clock<.3?0:1):(clock<.3?0:Math.floor((clock-.3)/beat)%2));}
 const row=Math.floor(s.level/2),col=s.level%2*2;return {devil,angel,devilX:(devil%4)*100/3,devilY:Math.floor(devil/4)*50,angelX:(angel%4)*100/3,angelY:Math.floor(angel/4)*50,guestX:col*100/3,afterX:(col+1)*100/3,guestY:row*20,guestRow:row,guestCol:col,guestName:guests[s.level][0],guestDescription:guests[s.level][1],makeover:s.progress<20?0:Math.min(1,(s.progress-20)/65),bubble:s.phase==='warning'?'嗯？谁在动剪刀？':s.phase==='watch'?'今天也要乖乖的哦':s.distraction==='book'?'这本书真有意思～':s.distraction==='drink'?'喝口茶，休息一下～':'喂？我在听呢～'};
 }
 return {frame,guests};
});
