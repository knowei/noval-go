'use client';

import { useEffect, useState } from 'react';
import { fetchConversation } from '@/lib/api';
import { isCheckpointId, useAppStore } from '@/lib/store';
import { resolveSnapshot } from '@/lib/sessionEngine';
import { ConversationSave } from '@/lib/types';
import { branchInfo, branchTree } from '@/lib/branchTree';

const button = 'rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-40';

export function BranchTimelinePanel({ busy, onRestored }: { busy: boolean; onRestored: () => void }) {
  const { currentDeckKey, currentUserId, currentConversationId, currentLineage, savedConversations, refreshSaves, restoreCheckpoint, updateCheckpoint } = useAppStore();
  const [selected, setSelected] = useState('');
  const [previewRequest, setPreviewRequest] = useState(0);
  const [preview, setPreview] = useState<ConversationSave | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [onlyCurrent, setOnlyCurrent] = useState(false);
  useEffect(() => { void refreshSaves(); }, [refreshSaves]);
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    void fetchConversation(selected).then(saved => {
      if (cancelled) return;
      if (saved?.user_id === currentUserId && saved.deck_id === currentDeckKey && saved.history?.length) { setPreview(saved); setName(branchInfo(saved)?.name || saved.title || ''); }
      else setError('分支读取失败，请重试。');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [selected, previewRequest, currentUserId, currentDeckKey]);
  const branches = branchTree(savedConversations.filter(s => {
    const info=branchInfo(s);
    return isCheckpointId(s.id) && s.deck_id === currentDeckKey && s.user_id === currentUserId
      && Boolean(info?.trashed) === showTrash && (!onlyCurrent || (info?.rootId || info?.sourceId) === (currentLineage?.rootId || currentConversationId))
      && (!query.trim() || `${info?.name || ''} ${s.title || ''} ${info?.reason || ''}`.includes(query.trim()));
  }));
  const snapshot = resolveSnapshot(preview?.history || []);
  return <div className="space-y-4">
    <p className="text-sm text-slate-300">重新生成、编辑、切换回复或回退前，旧剧情会自动保存在这里。恢复时会一并恢复当时的会话设置、记忆与状态，也会保留你现在的进度。</p>
    <p className="text-xs text-slate-400">显示此剧本的已保存分支；分支原件保留，恢复后在当前会话继续。</p>
    <button className={button} disabled={busy} onClick={() => void refreshSaves()}>刷新分支列表</button>
    <div className="flex flex-wrap gap-4 text-sm"><label><input type="checkbox" checked={onlyCurrent} onChange={e=>setOnlyCurrent(e.target.checked)}/> 只看当前会话来源</label><label><input type="checkbox" checked={showTrash} onChange={e=>{setShowTrash(e.target.checked);setSelected('');setPreview(null);}}/> 查看回收站</label></div>
    <label className="block text-sm">查找分支<input className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-2" value={query} onChange={e=>setQuery(e.target.value)} placeholder="输入名称或保存原因"/></label>
    {!branches.length && <p className="rounded-lg border border-dashed border-slate-600 p-4 text-slate-400">没有符合条件的分支。改写或回退剧情后，会自动保存旧进度。</p>}
    <ul className="space-y-2">{branches.map(({save:branch,depth}) => {
      const date = branch.created_at || branch.history?.[0]?.branchInfo?.createdAt;
      return <li key={branch.id} style={{marginLeft:depth*12}} className={`rounded-lg border p-3 ${selected === branch.id ? 'border-sky-500 bg-sky-950/30' : 'border-slate-700'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p>{depth ? '↳ ' : ''}{branchInfo(branch)?.name || branch.title || '已保存分支'}</p><p className="text-xs text-slate-400">{date ? new Date(date).toLocaleString() : '保存时间未知'}{depth ? ' · 从上级分支继续' : ''}</p></div><button className={button} disabled={busy} onClick={() => { setLoading(true); setPreview(null); setError(''); setSelected(branch.id); setPreviewRequest(n => n + 1); }}>查看此分支</button></div>
      </li>;
    })}</ul>
    {loading && <p role="status">正在读取分支…</p>}
    {error && <p role="alert" className="text-amber-200">{error}</p>}
    {preview && <section aria-label="分支预览" className="space-y-3 rounded-lg border border-sky-700 p-4">
      <h3>{preview.title || `已保存分支 · ${preview.history!.length} 条消息`}</h3>
      <label className="block text-sm">分支名称<input className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-2" maxLength={100} value={name} disabled={busy} onChange={e=>setName(e.target.value)}/></label>
      <div className="flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={async()=>{if(await updateCheckpoint(preview.id,{name}))setPreviewRequest(n=>n+1);}}>保存名称</button><button className={button} disabled={busy} onClick={async()=>{if(await updateCheckpoint(preview.id,{trashed:!showTrash})){setSelected('');setPreview(null);}}}>{showTrash?'移出回收站':'移入回收站'}</button></div>
      <p className="whitespace-pre-wrap break-words text-sm">{(preview.history!.at(-1)?.story || preview.history!.at(-1)?.text || '此消息没有正文').slice(0, 1200)}</p>
      <p className="text-xs text-slate-400">自动记忆 {snapshot.memories.length} 条 · 固定记忆：{preview.history![0]?.session?.pinnedMemory || '无'}</p>
      <details><summary className="cursor-pointer text-sm">查看当时状态</summary><pre className="overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(snapshot.state, null, 2)}</pre></details>
      <button className={`${button} bg-sky-800`} disabled={busy} onClick={async () => { if (await restoreCheckpoint(preview.id)) onRestored(); }}>恢复此分支并继续</button>
    </section>}
  </div>;
}
