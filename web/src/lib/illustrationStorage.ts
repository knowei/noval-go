import type { Illustration, IllustrationMeta } from './illustrations';
import { safeRandomUUID } from './uuid';

interface StoredIllustration extends Illustration { blob: Blob }
function reference(item: StoredIllustration): Illustration {
  return {id:item.id,owner:item.owner,storage:item.storage,mime:item.mime,metadata:item.metadata,createdAt:item.createdAt};
}
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open('noval-illustrations-v1',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('images',{keyPath:'id'});
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(new Error('浏览器图片存储不可用'));
  });
}
async function localOperation<T>(mode: IDBTransactionMode, run:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T> {
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('images',mode); const req=run(tx.objectStore('images'));
    tx.oncomplete=()=>{db.close();resolve(req.result);};
    tx.onerror=()=>{db.close();reject(new Error('本机图片保存失败，可能已达到空间上限'));};
    tx.onabort=()=>{db.close();reject(new Error('本机图片事务已取消'));};
  });
}
export async function saveLocalIllustration(owner:string, blob:Blob, metadata:IllustrationMeta):Promise<Illustration> {
  const item:StoredIllustration={id:safeRandomUUID(),owner,storage:'local',mime:blob.type,metadata,createdAt:new Date().toISOString(),blob};
  await localOperation('readwrite',store=>store.put(item));
  return reference(item);
}
export async function listLocalIllustrations(owner:string):Promise<Illustration[]> {
  const rows=await localOperation<StoredIllustration[]>('readonly',store=>store.getAll());
  return rows.filter(r=>r.owner===owner).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,100).map(reference);
}
export async function loadIllustration(image:Illustration, owner:string, token:string|null):Promise<Blob> {
  if(image.owner!==owner) throw new Error('这张图片属于另一个账号或设备身份');
  if(image.storage==='local') {
    const row=await localOperation<StoredIllustration|undefined>('readonly',store=>store.get(image.id));
    if(!row || row.owner!==owner) throw new Error('本机图片不存在，可能已清理浏览器数据或来自其他设备');
    return row.blob;
  }
  if(!token) throw new Error('登录原账号后才能查看云端插图');
  const response=await fetch(`/api/illustrations/${encodeURIComponent(image.id)}`,{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok) throw new Error('云端图片暂不可用或无访问权限');
  return response.blob();
}
export async function listCloudIllustrations(owner:string,token:string):Promise<Illustration[]> {
  const response=await fetch('/api/illustrations',{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok) throw new Error('云端画廊读取失败');
  return (await response.json()).map((r:Omit<Illustration,'owner'|'storage'>)=>({...r,owner,storage:'cloud'}));
}
export async function saveCloudIllustration(owner:string,token:string,blob:Blob,metadata:IllustrationMeta):Promise<Illustration> {
  const base64=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
  const response=await fetch('/api/illustrations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({base64,metadata})});
  if(!response.ok) throw new Error('云端图片保存失败');
  return {...await response.json(),owner,storage:'cloud'};
}
