'use client';
import { useState } from 'react';
import type { MemoryFact, SessionSettings } from '@/lib/sessionEngine';
export function MemoryFactEditor({ fact, draft, patch }: { fact: MemoryFact; draft: SessionSettings; patch: (v: Partial<SessionSettings>) => void }) {
  const saved = draft.memoryCorrections.find(c=>c.source===fact.source && c.original===fact.text);
  const [editing,setEditing]=useState(false);
  const [replacement,setReplacement]=useState('');
  const button='rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700';
  const update = (text: string | null) => {
    const rest=draft.memoryCorrections.filter(c=>c.source!==fact.source || c.original!==fact.text);
    patch({memoryCorrections:text===null?rest:[...rest,{source:fact.source!,original:fact.text,replacement:text.trim()}]});setEditing(false);
  };
  return <div className="space-y-2 rounded-lg border border-slate-700 p-3">
    <p className="text-xs text-slate-400">第 {fact.turn} 条消息{fact.key?` · 事项：${fact.key}`:''}</p>
    <p className={saved || draft.excludedMemories.includes(fact.text)?'line-through opacity-50':''}>{fact.text}</p>
    {saved && <p className="text-sm text-sky-200">{saved.replacement?`更正为：${saved.replacement}`:'已忽略这条来源中的事实'}</p>}
    {editing && <label className="block text-sm">更正后的事实<textarea className="w-full rounded-lg bg-slate-950 p-2" value={replacement} onChange={e=>setReplacement(e.target.value)} maxLength={2000}/></label>}
    <div className="flex flex-wrap gap-2">
      <button className={button} onClick={()=>{if(editing)update(replacement);else{setReplacement(saved?.replacement ?? fact.text);setEditing(true);}}}>{editing?'采用更正':'更正此事实'}</button>
      {editing && <button className={button} onClick={()=>setEditing(false)}>取消编辑</button>}
      <button className={button} onClick={()=>update(saved?.replacement===''?null:'')}>{saved?.replacement===''?'恢复此事实':'忽略此来源'}</button>
      {saved && <button className={button} onClick={()=>update(null)}>撤销更正</button>}
      {draft.excludedMemories.includes(fact.text) && <button className={button} onClick={()=>patch({excludedMemories:draft.excludedMemories.filter(t=>t!==fact.text)})}>解除旧版全局忽略</button>}
    </div>
  </div>;
}
