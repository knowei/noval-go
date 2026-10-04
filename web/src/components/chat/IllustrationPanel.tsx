'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Illustration, ImageSettings, illustrationPrompt, attachIllustration } from '@/lib/illustrations';
import { readImageSettings, saveImageSettings, generateIllustration, useIllustrationJobs, cancelImageJob } from '@/lib/illustrationJobs';
import { listLocalIllustrations, listCloudIllustrations, loadIllustration, saveCloudIllustration } from '@/lib/illustrationStorage';
import type { Turn } from '@/lib/types';

const button='rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-40';
const field='w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-sm text-slate-100';

export function IllustrationPreview({image}:{image:Illustration}) {
  const owner=useAppStore(s=>s.currentUserId),token=useAppStore(s=>s.authToken);
  const [url,setUrl]=useState(''),[error,setError]=useState(''),[large,setLarge]=useState(false);
  useEffect(()=>{
    let active=true, objectUrl='';
    void loadIllustration(image,owner,token).then(blob=>{if(active){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}}).catch(e=>{if(active)setError(e.message);});
    return ()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[image,owner,token]);
  return <figure className="space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-3">
    {error ? <p className="text-xs text-amber-200">{error}</p> : url ? <button className="block w-full" onClick={()=>setLarge(!large)} aria-label={large?'收起插图大图':'查看插图大图'}><img src={url} alt="本幕剧情插图" className={`mx-auto w-full rounded-lg object-contain ${large?'max-h-[80vh]':'max-h-80'}`}/></button> : <p className="text-xs">正在载入插图…</p>}
    <figcaption className="flex flex-wrap items-center gap-3 text-xs text-slate-400"><span>{image.metadata.model} · {image.storage==='cloud'?'私人云端':'本机保存'}</span>{url && <a className="text-sky-300 underline" href={url} download={`剧情插图-${image.id}.${image.mime==='image/jpeg'?'jpg':image.mime==='image/webp'?'webp':'png'}`}>下载图片</a>}</figcaption>
    <details><summary className="cursor-pointer text-xs">绘图描述与参数</summary><p className="whitespace-pre-wrap text-xs text-slate-300">{image.metadata.prompt}</p><p className="text-xs">{image.metadata.size} · {image.createdAt}</p></details>
  </figure>;
}

export function TurnIllustrations({turn,index}:{turn:Turn;index:number}) {
  const owner=useAppStore(s=>s.currentUserId), jobs=useIllustrationJobs(s=>s.jobs);
  const [open,setOpen]=useState(false),[prompt,setPrompt]=useState(''),[mode,setMode]=useState<'scene'|'background'>('scene'),[message,setMessage]=useState('');
  const [versions,setVersions]=useState(false);
  const job=jobs.filter(j=>j.owner===owner && j.source===turn.imageOriginId).at(-1);
  const prepare=(nextMode:'scene'|'background')=>{
    const state=useAppStore.getState();if(!state.currentDeck)return;
    setMode(nextMode);setPrompt(illustrationPrompt(state.currentDeck,state.conversationHistory,index,readImageSettings(owner).style,nextMode));setOpen(true);setMessage('');
  };
  const generate=async()=>{
    try {
      const state=useAppStore.getState(), current=state.conversationHistory[index];
      if(!current || current!==turn)throw new Error('回复已变化，请重新打开绘图描述');
      const source=current.imageOriginId || crypto.randomUUID();
      if(!current.imageOriginId)state.updateTurn(index,{imageOriginId:source});
      await generateIllustration({source,conversationId:state.currentConversationId,deckId:state.currentDeckKey,prompt,model:'',size:'',style:'',mode});
    } catch(e){setMessage(e instanceof Error?e.message:'无法生成插图');}
  };
  if(turn.incomplete || turn.isError || turn.isUser)return null;
  const images=(turn.illustrations || []).filter(i=>i.owner===owner);
  return <section aria-label="本幕插图" className="mt-3 space-y-3">
    <div className="flex flex-wrap gap-2"><button className={button} disabled={job?.status==='running'} onClick={()=>prepare(mode)}>生成本幕插图</button>{job?.status==='running' && <button className={button} onClick={()=>cancelImageJob(job.id)}>取消生图</button>}</div>
    {open && <div className="space-y-2 rounded-lg border border-slate-700 p-3"><p className="text-xs text-slate-400">根据这一条回复的状态和记忆绘图。先在“会话工作台 → 生图”配置服务；每次生成会请求生图接口。</p><label className="block text-sm">画面类型<select className={field} value={mode} disabled={job?.status==='running'} onChange={e=>prepare(e.target.value as 'scene'|'background')}><option value="scene">剧情插画</option><option value="background">环境背景（不画人物）</option></select></label><label className="block text-sm">绘图描述<textarea className={field} rows={6} maxLength={12000} value={prompt} onChange={e=>setPrompt(e.target.value)} disabled={job?.status==='running'}/></label><button className={button} disabled={job?.status==='running'} onClick={()=>void generate()}>按此描述生成</button><button className={`${button} ml-2`} onClick={()=>setOpen(false)}>收起描述</button></div>}
    {(job?.message || message) && <p role="status" className="text-xs text-sky-200">{message || job?.message}</p>}
    {images.length>0 && <IllustrationPreview key={images.at(-1)!.id} image={images.at(-1)!}/>}
    {images.length>1 && <><button className={button} onClick={()=>setVersions(!versions)}>{versions?'收起':'查看'}此前 {images.length-1} 张插图</button>{versions && images.slice(0,-1).map(image=><IllustrationPreview key={image.id} image={image}/>)}</>}
  </section>;
}

export function ImageSettingsPanel() {
  const owner=useAppStore(s=>s.currentUserId);
  return <Settings key={owner} owner={owner}/>;
}
function Settings({owner}:{owner:string}) {
  const [draft,setDraft]=useState<ImageSettings>(()=>readImageSettings(owner));
  const [message,setMessage]=useState(''),[gallery,setGallery]=useState<Illustration[]>([]),[busy,setBusy]=useState(false),[selected,setSelected]=useState<Illustration|null>(null);
  const jobs=useIllustrationJobs(s=>s.jobs).filter(j=>j.owner===owner);
  const refresh=async()=>{
    setBusy(true);setMessage('');const token=useAppStore.getState().authToken;
    try {const local=await listLocalIllustrations(owner);let cloud:Illustration[]=[];if(token){try{cloud=await listCloudIllustrations(owner,token);}catch{setMessage('云端画廊读取失败，仍显示本机图片');}}setGallery([...cloud,...local]);}catch(e){setMessage(String(e));}finally{setBusy(false);}
  };
  const upload=async(image:Illustration)=>{
    setBusy(true);const state=useAppStore.getState();
    try{
      if(!state.authToken || state.currentUserId!==owner)throw new Error('请先登录原账号');
      const blob=await loadIllustration(image,owner,state.authToken);
      const cloud=await saveCloudIllustration(owner,state.authToken,blob,image.metadata);
      const current=useAppStore.getState();
      if(current.currentUserId!==owner || current.authToken!==state.authToken)return;
      setGallery(g=>[cloud,...g]);setSelected(cloud);
      if(current.currentConversationId===image.metadata.conversationId){current.setConversationHistory(attachIllustration(current.conversationHistory,image.metadata.source,cloud));void useAppStore.getState().autoSave();}
      setMessage('已上传私人云端');
    }catch(e){setMessage(String(e));}finally{setBusy(false);}
  };
  return <section className="space-y-4">
    <p className="text-sm">配置生图服务后，即可为聊天回复绘制插图。访客图片保存在本机浏览器；登录后生成会同步私人云端，也可下载备份。</p>
    <p className="text-xs text-slate-400">密钥只在当前标签页内存中使用，刷新后需要重新填写。地址、模型、画风和尺寸保存在本机，不随剧本导出。</p>
    {(['baseUrl','model','apiKey','style'] as const).map((key,i)=><label key={key} className="block text-sm">{['生图服务地址','生图模型','生图密钥（仅本次标签页）','统一画风'][i]}<input className={field} type={key==='apiKey'?'password':'text'} autoComplete="off" value={draft[key]} placeholder={key==='baseUrl'?'http://127.0.0.1:8045/v1':key==='model'?'gemini-3.1-flash-image':''} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}
    <label className="block text-sm">图片尺寸<select className={field} value={draft.size} onChange={e=>setDraft({...draft,size:e.target.value as ImageSettings['size']})}><option>1024x1024</option><option>1536x1024</option><option>1024x1536</option></select></label>
    <button className={button} onClick={()=>{try{saveImageSettings(owner,draft);setMessage('生图设置已应用，密钥仅在本次标签页有效');}catch{setMessage('设置保存失败，请检查浏览器存储权限');}}}>应用生图设置</button>
    <p role="status" className="text-sm text-sky-200">{message}</p>
    <h3 className="font-semibold">本次生图任务</h3>
    {jobs.length?jobs.map(job=><div key={job.id} className="flex items-center justify-between gap-2 text-xs"><span>{job.message}</span>{job.status==='running' && <button className={button} onClick={()=>cancelImageJob(job.id)}>取消任务</button>}</div>):<p className="text-xs text-slate-400">从聊天回复下方的“生成本幕插图”开始。</p>}
    <h3 className="font-semibold">我的插图画廊</h3><button disabled={busy} className={button} onClick={()=>void refresh()}>读取我的插图</button>
    <p className="text-xs text-slate-400">离开原会话后完成的图片仍保存在这里。本机与云端版本分别列出；会话备份仅含图片引用，跨设备需登录原账号读取云端图片。</p>
    {gallery.map(image=><div className="flex flex-wrap items-center gap-2 border-b border-slate-700 pb-2 text-xs" key={image.storage+image.id}><button className="text-sky-200 underline" onClick={()=>setSelected(image)}>{image.metadata.mode==='background'?'场景背景':'剧情插图'} · {new Date(image.createdAt).toLocaleString()} · {image.storage==='cloud'?'云端':'本机'}</button>{image.storage==='local' && <button disabled={busy || !useAppStore.getState().authToken} className={button} onClick={()=>void upload(image)}>上传私人云端</button>}<button className={button} onClick={()=>{const state=useAppStore.getState();if(!state.conversationHistory.some(t=>t.imageOriginId===image.metadata.source || t.swipes?.some(s=>s.imageOriginId===image.metadata.source))){setMessage('当前会话没有原回复，请先恢复对应剧情分支');return;}state.setConversationHistory(attachIllustration(state.conversationHistory,image.metadata.source,image));void useAppStore.getState().autoSave();setMessage('已挂回原回复');}}>挂回原回复</button></div>)}
    {selected && <IllustrationPreview key={selected.id} image={selected}/>}
  </section>;
}
