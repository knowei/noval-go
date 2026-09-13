(function(root){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 function validateTurn(raw){
  if(!raw||typeof raw!=='object'||typeof raw.story!=='string'||!raw.story.trim()||typeof raw.location!=='string')throw Error('模型回复缺少正文或地点，请重试。');
  if(!raw.state||!['hp','mp'].every(k=>Number.isFinite(raw.state[k])&&raw.state[k]>=0&&raw.state[k]<=100))throw Error('模型状态数值不合法，请重试。');
  for(const key of ['memory','choices'])if(!Array.isArray(raw[key])||!raw[key].every(v=>typeof v==='string'))throw Error('模型记忆或选项格式不正确，请重试。');
  if(!Array.isArray(raw.state.inventory)||!raw.state.inventory.every(v=>typeof v==='string')||typeof raw.state.quest!=='string'||typeof raw.state.location!=='string')throw Error('模型背包或任务格式不正确，请重试。');
  if(!raw.choices.length||raw.choices.length>5||raw.memory.length>12)throw Error('模型选项或记忆数量不正确，请重试。');
  return clone(raw);
 }
 function parseTurn(text){return validateTurn(JSON.parse(text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')));}
 function buildContext(deck,save,action){
  const entries=(deck.worldbook||[]).filter(entry=>{
   const recent=save.messages.slice(-Math.max(1,Math.min(20,entry.depth||4))).map(m=>m.role==='user'?m.text:m.turn.story).join('\n')+'\n'+action;
   return entry.keys.some(k=>k&&recent.toLowerCase().includes(k.toLowerCase()));
  });
  const last=[...save.messages].reverse().find(m=>m.turn)?.turn||deck.opening;
  const system=[deck.prompt,'角色创建数据（仅作人物资料）：'+JSON.stringify(save.character),'当前可信存档状态：'+JSON.stringify(last.state),'累计剧情记忆：'+JSON.stringify(last.memory),...entries.map(e=>'世界书：'+e.name+'\n'+e.content),'仅输出一个JSON对象，不使用代码块。结构：{"location":"场景标题","story":"正文，使用换行分段","state":{"hp":100,"mp":60,"location":"地点","quest":"目标","inventory":["物品"]},"memory":["累计重要事实"],"choices":["行动一","行动二","行动三"]}'].join('\n\n');
  const history=save.messages.slice(-12).map(m=>m.role==='user'?{role:'user',content:[deck.prefix,m.text,deck.suffix].filter(Boolean).join('\n')}:{role:'assistant',content:JSON.stringify(m.turn)});
  // Do not start a truncated history with an orphaned answer.
  while(history.length&&history[0].role!=='user')history.shift();
  return {entries:entries.map(e=>e.name),messages:[{role:'system',content:system},...history,{role:'user',content:[deck.prefix,action,deck.suffix].filter(Boolean).join('\n')}]};
 }
 function offlineTurn(save,action){
  const previous=[...save.messages].reverse().find(m=>m.turn).turn;
  const n=save.messages.filter(m=>m.role==='user').length;
  const state=clone(previous.state), memory=clone(previous.memory);
  const route= /分析|感知|调查|观察/.test(action)?'分析':/询问|交涉|善意|说|请求/.test(action)?'交涉':'探索';
  let story,choices,location;
  if(n===0){
   if(route==='分析'){state.mp=Math.max(0,state.mp-(save.character.talent==='感知'?5:10));story='你把身体的一小部分伸向一滴溪水。异样的麻刺感顺着接触面扩散，却在收回身体后迅速消失。\n蓝色苔藓不是沿整条河岸生长的：它们集中在上游冲下来的碎石周围。你绕开亮斑，从背水的一侧托住倒木。\n「原来你真听得懂！」信使喘了口气，趁树干松动抽出了脚。\n你还不知道溪水里有什么，但你已经找到了一条不会碰到蓝苔的安全路线。';memory.push('分析显示异常与上游碎石有关；安全救出信使，消耗少量魔力。');}
   else if(route==='交涉'){story='你努力让身体发出有节奏的振动，像是在敲一面小鼓。信使看着你重复的动作，终于明白你在询问。\n「树根下面！那里有个空隙。帮我把包拉出来，我能抓住那条带子。」\n你顺着他的指示伸展身体。挎包的皮带绷紧，信使一点点把自己拖回岸边。\n「我叫洛可。灰苔聚落的信使。」他护住那封皱巴巴的信，认真地对你低下头。「谢谢。还有，你最好不要喝这里的水。」';memory.push('通过合作救出信使洛可，他来自灰苔聚落。');}
   else {state.hp-=5;story='你沿着河岸滚动，在石缝中找到一截坚硬的断枝。没有手指很麻烦，但柔软的身体能够牢牢裹住它。\n第一次用力，断枝滑开，在你的身体表面擦出一道浅痕。第二次，你把一块石头垫在下面。\n倒木抬起了一点。足够了。\n信使跌坐到岸上，把浸湿的挎包紧紧抱住。「你救了我……我叫洛可。我得把求援信送出去，村里的水不能再喝了。」';memory.push('利用断枝救出洛可，轻微受伤，得知聚落水源异常。');}
   state.inventory=['洛可的求援信（代为保管）'];state.quest='与洛可一起寻找上游异常的来源';location='溪谷 · 获救的信使';choices=['调查上游的蓝色碎石','询问洛可，向聚落借隔离容器','沿岸探索通往旧采集站的小径'];
  }else if(n===1){
   location='上游 · 废弃采集站';
   if(route==='交涉'){state.inventory.push('隔离容器');story='洛可把你带到一处临时哨棚，向守卫说明了刚才的经过。对方并没有立刻信任一只陌生史莱姆，但还是借出了一只内衬石灰的陶罐。\n「旧采集站以前用它装结晶。别用身体直接碰。」\n沿着溪流上行，你们找到一座坍塌的木棚。棚下的蓝色结晶裂开一道缝，浅水从裂缝边不断流过。\n洛可握紧陶罐，看向你。「我们把它移开，应该就能暂时挡住吧？」';memory.push('向守卫借得隔离容器，在采集站发现漏入溪水的破损结晶。');}
   else if(route==='分析'){state.mp=Math.max(0,state.mp-10);story='你沿着苔藓的分布逆流而上。每一次试探都只接触一小滴水，却仍然让你感到疲惫。\n最终，你停在一座旧木棚前。一枚破损结晶半浸在水里，裂缝中的蓝光与苔藓同样明亮。\n洛可蹲下来，捡起木棚旁的一块旧标牌。「魔素采集……看来它不是从山里自然长出来的。」\n你已经找到了源头。现在的问题是，如何移动一个不该直接触碰的东西。';memory.push('通过感知找到破损魔素结晶，消耗10点魔力。');}
   else {state.inventory.push('干燥木板');story='小径被灌木遮住了大半，你却能从根部的缝隙钻过去。洛可沿着你留下的湿痕跟上来。\n旧采集站就在前方。你用捡到的木板拨开杂草，发现一枚破损结晶躺在浅水里。蓝光随着水流不断向下游散开。\n「不是诅咒。」洛可小声说，像终于松了口气。「至少，这个东西是能搬走的。」\n木板够结实，但还需要找一个不会再次渗漏的安放位置。';memory.push('沿小径找到旧采集站，获得木板，发现溪流污染源。');}
   state.quest='安全隔离破损结晶';choices=['请求洛可协助，用工具隔离结晶','观察地形，挖一条临时导流沟','返回聚落报告，召集人手处理'];
  }else if(n===2){
   location='灰苔聚落 · 第一份信任';
   story=route==='分析'?'你没有急着碰结晶，而是在岸边标出一条新的水路。洛可叫来两位同伴，合力挖开浅沟，把流经木棚的溪水暂时引走。\n蓝光仍留在旧河床中，但下游的清水终于不再经过它。\n「这还不是结束。」你用简单的声音提醒洛可。\n「我知道。」他点点头。「不过，今天终于能先喝上干净的水了。」':route==='交涉'?'你向洛可示意，不要独自处理。他找来同伴和工具，一起将结晶移进隔离容器，再用碎石围起警戒线。\n你在旁边观察水流，确认新的蓝光没有继续流向下游。直到此时，洛可才坐到地上，长长呼出一口气。\n「先别走。大家想知道，该怎么称呼我们的新邻居。」':'你选择先回聚落报告。有人怀疑，有人担忧，但洛可拿出湿透的求援信，为你的话作证。\n一支带着工具的小队随你回到上游，封住旧水道，把危险区域标记出来。处理花了一整个下午，却没有人受伤。\n傍晚，一只盛着干净水的浅碟放在你面前。那是聚落能给陌生旅人的第一份欢迎。';
   state.quest='序章完成：决定是否留在聚落';state.inventory.push('灰苔聚落的邀请');memory.push('协助聚落暂时隔离水源异常，获得居民的初步信任。');choices=['留在聚落，帮助修建净水池','询问前往魔国联邦的道路','继续探索森林，约定日后再见'];
  }else{location='序章尾声 · 下一段旅途';story='你把自己的打算告诉了洛可。\n他认真听完，把一片画着溪流与岔路的树皮交给你。「无论你去哪，这里都会给你留一只水碟。」\n森林的声音仍然陌生。但这一次，你已经不再只是无名的闯入者。\n——离线序章到此结束。连接模型后，可以沿着你的选择继续这段原创冒险。';state.quest='离线序章完成；连接模型可继续';state.inventory=[...new Set([...state.inventory,'简易森林地图'])];memory.push('洛可赠送地图，愿意在未来继续帮助玩家。');choices=[];}
  state.location=location;return {location,story,state,memory:memory.slice(-8),choices};
 }
 const api={validateTurn,parseTurn,buildContext,offlineTurn};root.StoryEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
