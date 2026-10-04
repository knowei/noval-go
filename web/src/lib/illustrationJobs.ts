'use client';
import { create } from 'zustand';
import { useAppStore } from './store';
import { getSiteToken } from './api';
import { attachIllustration, decodeGeneratedImage, imageRequest, normalizeImageSettings, ImageSettings, IllustrationMeta, Illustration } from './illustrations';
import { saveCloudIllustration, saveLocalIllustration } from './illustrationStorage';
import { imageResponseError } from './imageErrors';

export interface ImageJob { id:string; owner:string; source:string; status:'running'|'complete'|'failed'|'cancelled'; message:string; image?:Illustration }
export const useIllustrationJobs=create<{jobs:ImageJob[];settings:Record<string,ImageSettings>}>(()=>({jobs:[],settings:{}}));
const controllers=new Map<string,AbortController>();
const key=(owner:string)=>`noval_image_settings:${owner}`;
export function readImageSettings(owner:string):ImageSettings {
  const loaded=useIllustrationJobs.getState().settings[owner]; if(loaded)return loaded;
  try { return normalizeImageSettings(JSON.parse(localStorage.getItem(key(owner)) || '{}')); } catch { return normalizeImageSettings({}); }
}
export function saveImageSettings(owner:string,value:ImageSettings) {
  const settings=normalizeImageSettings(value);
  // Connection secrets remain in memory for this tab only, outside story exports.
  localStorage.setItem(key(owner),JSON.stringify({baseUrl:settings.baseUrl,model:settings.model,size:settings.size,style:settings.style}));
  useIllustrationJobs.setState(s=>({settings:{...s.settings,[owner]:settings}}));
}
const update=(id:string,value:Partial<ImageJob>)=>useIllustrationJobs.setState(s=>({jobs:s.jobs.map(j=>j.id===id?{...j,...value}:j)}));
export const cancelImageJob=(id:string)=>controllers.get(id)?.abort();
useAppStore.subscribe((state,previous)=>{
  if(state.currentUserId!==previous.currentUserId || state.authToken!==previous.authToken) {
    for(const job of useIllustrationJobs.getState().jobs) if(job.status==='running') cancelImageJob(job.id);
    useIllustrationJobs.setState({settings:{}});
  }
});

export async function generateIllustration(metadata:IllustrationMeta) {
  const start=useAppStore.getState(), owner=start.currentUserId, token=start.authToken;
  if(useIllustrationJobs.getState().jobs.some(j=>j.owner===owner && j.status==='running')) throw new Error('已有图片正在生成，请等待或先取消');
  const settings=readImageSettings(owner), request=imageRequest(settings,metadata.prompt);
  const meta={...metadata,model:settings.model,size:settings.size,style:settings.style};
  const id=crypto.randomUUID(), controller=new AbortController();controllers.set(id,controller);
  useIllustrationJobs.setState(s=>({jobs:[...s.jobs.slice(-29),{id,owner,source:meta.source,status:'running',message:'正在生成，可继续聊天…'}]}));
  const timer=setTimeout(()=>controller.abort(),180000);
  try {
    const headers:Record<string,string>={'Content-Type':'application/json',Authorization:`Bearer ${settings.apiKey}`};
    const siteToken=getSiteToken();if(siteToken)headers['x-site-token']=siteToken;
    const response=await fetch(`/proxy?target=${encodeURIComponent(request.target)}`,{method:'POST',headers,credentials:'include',body:JSON.stringify(request.body),signal:controller.signal});
    if(!response.ok) throw await imageResponseError(response);
    // Bound the JSON response before parsing potentially large Base64 payloads.
    const reader=response.body?.getReader();if(!reader)throw new Error('没有收到图片响应');
    const decoder=new TextDecoder();let json='',bytes=0;
    try { while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>23*1024*1024)throw new Error('图片响应超过 23 MB');json+=decoder.decode(chunk.value,{stream:true});}json+=decoder.decode(); } finally { await reader.cancel().catch(()=>{});reader.releaseLock(); }
    const blob=decodeGeneratedImage(JSON.parse(json));controller.signal.throwIfAborted();
    // Save locally first: network/account failures must not discard a paid result.
    let image=await saveLocalIllustration(owner,blob,meta);
    let message='图片已保存到本机';
    if(token && !controller.signal.aborted) {
      try {image=await saveCloudIllustration(owner,token,blob,meta);message='图片已保存到私人云端，本机保留备份';}
      catch {message='云端保存失败，图片已保存在本机，可在生图画廊重试上传';}
    }
    const current=useAppStore.getState();
    if(current.currentUserId===owner && current.currentConversationId===meta.conversationId) {
      current.setConversationHistory(attachIllustration(current.conversationHistory,meta.source,image));
      void useAppStore.getState().autoSave();
    }
    update(id,{status:'complete',image,message});
  } catch(error) {
    update(id,{status:controller.signal.aborted?'cancelled':'failed',message:controller.signal.aborted?'已取消或超时；上游服务可能仍有计算消耗':error instanceof Error && error.name!=='SyntaxError'?error.message:'生图响应格式无效'});
  } finally {clearTimeout(timer);controllers.delete(id);}
}
