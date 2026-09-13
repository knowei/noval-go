'use strict';
const $=id=>document.getElementById(id);
const copy=x=>JSON.parse(JSON.stringify(x));
let decks=[],deck=null,save=null,saves=[],busy=false,controller=null;
let config={mode:'offline',base:'',model:'',key:''};
let channel=crypto.randomUUID();
let noticeTimer;
let saveQueue=Promise.resolve();
function notify(message){$('notice').textContent=message;$('notice').style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').style.display='none',6500);}
async function api(path,body){const response=await fetch('/api/studio/'+path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});let result;try{result=await response.json();}catch{throw Error('本地服务尚未更新，请重新运行启动脚本。');}if(!response.ok)throw Error(result.error||'本地服务请求失败');return result;}
function element(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function showView(name){for(const id of ['play','editor'])$(id).hidden=id!==name;document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===name));}
document.querySelectorAll('[data-view]').forEach(el=>el.onclick=()=>showView(el.dataset.view));
function configureIntro(){if(!deck)return;$('intro').contentWindow.postMessage({type:'configure',channel,title:deck.title,description:deck.description},'*');}
$('intro').onload=configureIntro;
window.addEventListener('message',event=>{
 if(event.source!==$('intro').contentWindow||event.origin!=='null')return;
 const data=event.data;
 if(data?.type==='intro-ready'){configureIntro();return;}
 if(data?.type!=='start-adventure'||data.channel!==channel||busy||!deck)return;
 if(typeof data.name!=='string'||!data.name.trim()||data.name.length>24||!['感知','交涉','探索'].includes(data.talent))return;
 if(save&&!confirm('开始新的冒险？已有冒险会保留在存档列表中。'))return;
 save={id:crypto.randomUUID(),deck_id:deck.id,title:data.name+'的冒险',character:{name:data.name.trim(),talent:data.talent},deck:copy(deck),messages:[{role:'assistant',turn:copy(deck.opening)}],created_at:new Date().toISOString(),theme:$('themeSelect').value};
 render();persist();
});
function fillEditor(){for(const [id,key] of [['editTitle','title'],['editDescription','description'],['editPrompt','prompt'],['editPrefix','prefix'],['editSuffix','suffix']])$(id).value=deck[key]||'';$('editOpening').value=deck.opening.story;$('editWorldbook').value=JSON.stringify(deck.worldbook||[],null,2);}
function chooseDeck(id){deck=decks.find(d=>d.id===id);if(!deck)return;save=null;channel=crypto.randomUUID();$('deckDescription').textContent=deck.description;$('deckSelect').value=id;fillEditor();configureIntro();render();renderSaves();}
function renderDecks(){ $('deckSelect').replaceChildren(...decks.map(d=>{const option=element('option',d.title);option.value=d.id;return option;}));}
$('deckSelect').onchange=()=>chooseDeck($('deckSelect').value);
$('newGame').onclick=()=>{if(busy)return;if(save&&!confirm('回到角色创建页？当前冒险仍保留在存档中。'))return;save=null;channel=crypto.randomUUID();configureIntro();render();showView('play');};
function renderSaves(){const list=saves.filter(s=>s.deck_id===deck?.id);$('saves').replaceChildren();if(!list.length)$('saves').append(element('p','还没有存档。创建角色后会自动保存。'));for(const item of list){const button=element('button',item.title,'saveitem');button.append(element('small',`${item.messages.filter(m=>m.role==='user').length} 次行动 · ${new Date(item.updated_at||item.created_at).toLocaleString('zh-CN')}`));button.disabled=busy;button.onclick=()=>{save=copy(item);$('themeSelect').value=save.theme||'forest';document.body.dataset.theme=$('themeSelect').value;render();showView('play');notify('已恢复存档，使用当时保存的剧本设定。');};$('saves').append(button);}}
function persist(){if(!save)return Promise.resolve();const snapshot=copy(save);snapshot.updated_at=new Date().toISOString();$('saveStatus').textContent='正在保存…';saveQueue=saveQueue.then(async()=>{try{await api('saves',snapshot);const index=saves.findIndex(s=>s.id===snapshot.id);if(index<0)saves.unshift(snapshot);else saves[index]=snapshot;if(save?.id===snapshot.id){$('saveStatus').textContent='已保存到本地数据库';$('retrySave').hidden=true;}renderSaves();}catch(error){if(save?.id===snapshot.id){$('saveStatus').textContent='保存失败：'+error.message;$('retrySave').hidden=false;}notify('保存失败，请重试或导出存档保留进度。');}});return saveQueue;}
$('retrySave').onclick=persist;
function render(){
 $('welcome').hidden=!!save;$('adventure').hidden=!save;if(!save){$('chapterLabel').textContent='序章 / 尚未命名的你';return;}
 $('chapterLabel').textContent=`${save.character.name} / ${save.character.talent} · ${save.messages.filter(m=>m.role==='user').length} 次行动`;
 $('messages').replaceChildren();for(const message of save.messages){if(message.role==='user'){$('messages').append(element('div',message.text,'userturn'));continue;}const card=element('article',undefined,'turn');card.append(element('div','FOREST LETTER / '+(message.mode==='ai'?'AI 叙事':'序章记录'),'meta'),element('h2',message.turn.location),element('div',message.turn.story,'narrative'));$('messages').append(card);}
 const turn=[...save.messages].reverse().find(m=>m.turn).turn;
 $('state').replaceChildren();for(const [key,label] of [['hp','生命'],['mp','魔力']]){const p=element('p',label+' ');p.append(element('strong',String(turn.state[key])));const meter=element('meter');meter.min=0;meter.max=100;meter.value=turn.state[key];meter.setAttribute('aria-label',label);p.append(meter);$('state').append(p);}$('state').append(element('p','目标 · '+turn.state.quest),element('p','背包 · '+(turn.state.inventory.join('、')||'空')));$('memory').replaceChildren(...turn.memory.map(text=>element('li',text)));
 $('choices').replaceChildren();for(const choice of turn.choices){const button=element('button',choice);button.disabled=busy;button.onclick=()=>{if(!busy){$('action').value=choice;advance();}};$('choices').append(button);}
 const ended=config.mode==='offline'&&save.messages.filter(m=>m.role==='user').length>=4;
 $('action').disabled=busy||ended;$('sendButton').disabled=busy||ended;$('action').placeholder=ended?'离线序章已结束。连接模型继续，或开启新冒险探索其他路线。':'写下你的行动，故事由你决定……';
}
function setBusy(value){busy=value;for(const id of ['newGame','deckSelect','settingsButton'])$(id).disabled=value;$('cancelButton').hidden=!value;$('sendButton').textContent=value?'生成中…':'行动 ↗';render();renderSaves();}
async function advance(){
 if(busy||!save)return;const action=$('action').value.trim();if(!action)return;
 if(config.mode==='offline'&&save.deck.id!=='slime-forest'&&!save.deck.offlineCompatible){notify('此自定义剧本请连接模型游玩；离线分支仅供森林来信示例使用。');return;}
 const activeSave=save,activeDeck=save.deck;setBusy(true);
 try{
  const context=StoryEngine.buildContext(activeDeck,activeSave,action);$('debug').textContent=context.entries.length?context.entries.join('\n'):'本轮没有触发世界书条目。';
  let turn;
  if(config.mode==='ai'){
   if(!config.key||!config.model||!config.base)throw Error('请先完整填写模型连接。');
   controller=new AbortController();const timer=setTimeout(()=>controller?.abort(),120000);
   try{const response=await fetch('/proxy?target='+encodeURIComponent(config.base.replace(/\/+$/,'')+'/chat/completions'),{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+config.key},body:JSON.stringify({model:config.model,messages:context.messages,temperature:0.8})});
    let data;try{data=await response.json();}catch{throw Error('模型服务未返回 JSON 响应。');}if(!response.ok||data.error)throw Error('模型请求失败（HTTP '+response.status+'），请检查连接配置。');const text=data.choices?.[0]?.message?.content;if(typeof text!=='string')throw Error('模型没有返回正文。');turn=StoryEngine.parseTurn(text);
   }finally{clearTimeout(timer);controller=null;}
  }else turn=StoryEngine.offlineTurn(activeSave,action);
  activeSave.messages.push({role:'user',text:action},{role:'assistant',turn,mode:config.mode});$('action').value='';render();await persist();$('choices').scrollIntoView({behavior:'smooth',block:'nearest'});
 }catch(error){notify(error.name==='AbortError'?'生成已停止或超时，行动尚未写入存档。':error.message);}finally{setBusy(false);}
}
$('sendForm').onsubmit=event=>{event.preventDefault();advance();};$('cancelButton').onclick=()=>controller?.abort();
$('themeSelect').onchange=()=>{document.body.dataset.theme=$('themeSelect').value;if(save){save.theme=$('themeSelect').value;persist();}};
$('settingsButton').onclick=()=>{$('runMode').value=config.mode;$('apiBase').value=config.base;$('apiModel').value=config.model;$('apiKey').value=config.key;$('settings').showModal();};$('closeSettings').onclick=()=>$('settings').close();
$('settingsForm').onsubmit=event=>{event.preventDefault();try{const next={mode:$('runMode').value,base:$('apiBase').value.trim(),model:$('apiModel').value.trim(),key:$('apiKey').value.trim()};if(next.mode==='ai'){const url=new URL(next.base);if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw Error('基础地址请使用不含账号或参数的 HTTP(S) 地址。');if(!next.key||!next.model)throw Error('请填写密钥与模型名称。');}config=next;$('modeLabel').textContent=config.mode==='ai'?'AI 冒险 · '+config.model:'离线试玩';$('settings').close();render();notify('设置已应用');}catch(error){notify(error.message);}};
function readEditor(newId=false){const next=copy(deck);next.title=$('editTitle').value.trim();next.description=$('editDescription').value;next.prompt=$('editPrompt').value.trim();next.prefix=$('editPrefix').value;next.suffix=$('editSuffix').value;next.opening.story=$('editOpening').value;next.worldbook=JSON.parse($('editWorldbook').value);if(!next.title||!next.prompt||!next.opening.story.trim())throw Error('名称、提示词和开场白不能为空。');if(!Array.isArray(next.worldbook))throw Error('世界书必须是 JSON 数组。');if(newId)next.id=crypto.randomUUID();next.version=(next.version||1)+1;return next;}
async function saveDeck(newId){try{const next=readEditor(newId);await api('decks',next);const index=decks.findIndex(d=>d.id===next.id);if(index<0)decks.push(next);else decks[index]=next;deck=next;renderDecks();$('deckSelect').value=next.id;$('deckDescription').textContent=next.description;configureIntro();renderSaves();notify('剧本已保存。开启新冒险后使用新设定。');}catch(error){notify(error.message);}}
$('editorForm').onsubmit=event=>{event.preventDefault();saveDeck(false);};$('copyDeck').onclick=()=>saveDeck(true);
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=element('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('exportDeck').onclick=()=>{try{download(readEditor(), 'story.json');}catch(error){notify(error.message);}};$('exportSave').onclick=()=>save&&download(save,'adventure-save.json');
$('importDeck').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>2_000_000)throw Error('文件不能超过 2 MB');const data=JSON.parse(await file.text());StoryEngine.validateTurn(data.opening);data.id=crypto.randomUUID();await api('decks',data);decks.push(data);renderDecks();chooseDeck(data.id);notify('剧本已导入为新副本');}catch(error){notify('导入失败：'+error.message);}finally{event.target.value='';}};
async function init(){try{[decks,saves]=await Promise.all([api('decks'),api('saves')]);if(!decks.length)throw Error('未找到示例剧本');renderDecks();chooseDeck(decks.find(d=>d.id==='slime-forest')?.id||decks[0].id);}catch(error){notify(error.message);$('deckDescription').textContent='请使用项目启动脚本启动服务后打开本页。'+error.message;}}
init();
