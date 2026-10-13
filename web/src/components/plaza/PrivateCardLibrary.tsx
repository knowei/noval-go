'use client';
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { importCard, ImportResult, readCharacterFile, readPrivateCards, savePrivateCard, readPrivateCardTrash, movePrivateCardToTrash, restorePrivateCard } from '@/lib/cardImport';
import { fetchPrivateCards, PrivateCardRecord, updatePrivateCard } from '@/lib/api';
import { StoryDeck } from '@/lib/types';
import { downloadJson } from '@/components/chat/SessionWorkbench';
import { LIGHTHOUSE_DECK } from '@/lib/storyDiagnostics';
import { safeRandomUUID } from '@/lib/uuid';

const subscribeToMount = () => () => {};
export function PrivateCardLibrary() {
  const user = useAppStore(s => s.currentUserId);
  const mounted = useSyncExternalStore(subscribeToMount, () => true, () => false);
  return mounted ? <LibraryPanel key={user} user={user} /> : null;
}

function LibraryPanel({ user }: { user: string }) {
  const [cards, setCards] = useState<StoryDeck[]>(() => readPrivateCards(user));
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const token = useAppStore(s => s.authToken);
  const [cloudRecords, setCloud] = useState<PrivateCardRecord[]>([]);
  const cloud = token ? cloudRecords : [];
  const [trash, setTrash] = useState(() => readPrivateCardTrash(user));
  const refreshLocal = () => { setCards(readPrivateCards(user)); setTrash(readPrivateCardTrash(user)); };
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void fetchPrivateCards().then(data => { if (!cancelled) setCloud(data); }).catch(error => { if (!cancelled) setMessage(error.message); });
    return () => { cancelled = true; };
  }, [token]);
  const perform = async (action: () => Promise<void> | void) => {
    setBusy(true); setMessage('');
    try { await action(); refreshLocal(); } catch (error) { setMessage(error instanceof Error ? error.message : '操作失败'); } finally { setBusy(false); }
  };
  const updateCloud = (record: PrivateCardRecord) => setCloud(old => [...old.filter(c => c.id !== record.id), record]);
  const visible = [...cards, ...cloud.filter(c => !c.deleted && !cards.some(local => local.id === c.id)).map(c => c.deck)];
  return <section aria-label="我的角色卡" className="private-card-panel space-y-3.5 rounded-2xl border border-[var(--app-card-border,#282a3c)] bg-[var(--app-card-bg,#151722)] p-4 sm:p-5 text-[var(--app-text-main,#f1f5f9)] shadow-xl">
    <div className="flex items-center justify-between border-b border-[var(--app-card-border,#232536)] pb-2.5">
      <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
        <span>🎴</span>
        <span>我的私密角色卡与导入</span>
      </h2>
      <span className="text-[11px] text-[var(--app-text-dim,#64748b)]">支持酒馆/云端同步</span>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button disabled={busy} className="rounded-xl border border-[var(--app-card-border,#3b3f54)] bg-[var(--app-card-bg-subtle,#1a1c28)] hover:bg-blue-500/10 hover:border-blue-500/50 px-3 py-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-40" onClick={()=>void perform(()=>{savePrivateCard(user,{...LIGHTHOUSE_DECK,id:'local_'+safeRandomUUID()});setMessage('已添加灯塔来信样例，可开始试玩并在会话工作台调整规则。');})}>+ 添加灯塔冒险样例</button>
      {token ? <button disabled={busy} className="text-xs text-blue-400 hover:text-blue-300 transition underline cursor-pointer" onClick={() => void perform(async () => { setCloud(await fetchPrivateCards()); setMessage('云端列表已刷新。本机内容保持不变。'); })}>刷新云端角色卡</button> : <span className="text-xs text-amber-400/90 font-medium">当前使用本机卡库，登录后可同步到云端。</span>}
    </div>
    <p className="text-xs text-[var(--app-text-muted,#94a3b8)] leading-relaxed">支持酒馆 V2 / V3、普通角色卡 JSON、PNG 和本站备份。导入先保存在本机；登录后可上传到私人云端，在其他设备登录同一账号使用。</p>
    <label className="block text-xs font-medium text-[var(--app-text-sub,#cbd5e1)]">选择角色卡或备份文件<input disabled={busy} className="mt-1.5 block max-w-full text-xs text-[var(--app-text-muted,#94a3b8)] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer" type="file" accept=".json,.png" onChange={async e => {
      const file = e.target.files?.[0]; if (!file) return;
      setBusy(true); setPreview(null);
      try { setPreview(importCard(await readCharacterFile(file))); setMessage('请查看导入结果。'); } catch (error) { setMessage(String(error)); } finally { setBusy(false); }
      e.target.value = '';
    }} /></label>
    {preview && <div className="space-y-2 rounded-xl bg-[var(--app-card-bg-subtle,#101118)] border border-[var(--app-card-border,#282a3c)] p-3 text-xs"><p className="font-bold">{preview.deck.title} · {preview.deck.lorebook?.length || 0} 条世界书 · {preview.deck.alternateGreetings?.length || 0} 个开场</p>{preview.warnings.map((w, i) => <p className="text-amber-400" key={i}>{w}</p>)}<button disabled={busy} className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 transition cursor-pointer disabled:opacity-40" onClick={async () => {
      setBusy(true);
      try {
        savePrivateCard(user, preview.deck);
        setCards(readPrivateCards(user));
        if (preview.history?.length) {
          const store = useAppStore.getState(); store.startNewStory(preview.deck); store.setConversationHistory(preview.history); await store.autoSave();
          if (useAppStore.getState().saveError) throw new Error('角色卡已导入，但会话保存失败。可重试导入备份。');
        }
        setPreview(null); setMessage('已加入我的角色卡，点击下方名称进入。');
      } catch (error) { setMessage(String(error)); } finally { setBusy(false); }
    }}>加入我的角色卡{preview.history?.length ? '并恢复存档' : ''}</button></div>}
    {message && <p role="status" className="text-xs text-blue-400 font-medium">{message}</p>}
    <div className="grid gap-3 sm:grid-cols-2">{visible.map(card => {
      const remote = cloud.find(c => c.id === card.id);
      const local = cards.some(c => c.id === card.id);
      const differs = remote && JSON.stringify(remote.deck) !== JSON.stringify(card);
      return <div className="private-card-item space-y-2 rounded-xl border border-[var(--app-card-border,#282a3c)] bg-[var(--app-card-bg-subtle,#191b28)] p-3.5 transition" key={card.id}>
        <Link className="text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 transition underline line-clamp-1" href={`/chat/${encodeURIComponent(card.id)}`}>{card.title}</Link>
        <p className="text-[11px] text-[var(--app-text-dim,#64748b)]">{remote ? `云端版本 ${remote.revision}${remote.deleted ? ' · 云端在回收站' : ''}${differs ? ' · 本机与云端内容不同' : ''}` : '仅本机'}</p>
        <div className="flex flex-wrap gap-2 text-xs pt-1">
          <button className="px-2 py-0.5 rounded-md border border-[var(--app-card-border,#333748)] hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => downloadJson({ format: 'noval-deck-v1', deck: card }, '角色卡备份.json')}>导出备份</button>
          {card.sourceCard !== undefined && <button className="px-2 py-0.5 rounded-md border border-[var(--app-card-border,#333748)] hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => downloadJson(card.sourceCard, '原始酒馆角色卡.json')}>导出原卡</button>}
          {token && local && <button className="px-2 py-0.5 rounded-md border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition" disabled={busy} onClick={() => void perform(async () => { updateCloud(await updatePrivateCard(card.id, remote?.revision || 0, 'save', card)); setMessage('本机版本已保存到私人云端。'); })}>上传云端</button>}
          {remote && !remote.deleted && <button className="px-2 py-0.5 rounded-md border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition" disabled={busy} onClick={() => void perform(() => {
            if (differs && local) savePrivateCard(user, { ...card, id: 'local_' + safeRandomUUID(), title: card.title + ' · 同步前备份' });
            savePrivateCard(user, remote.deck); setMessage('云端版本已保存到本机；原本机差异内容已另存备份。');
          })}>下载云端</button>}
          <button className="px-2 py-0.5 rounded-md border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition" disabled={busy} onClick={() => void perform(async () => {
            if (remote && !remote.deleted) updateCloud(await updatePrivateCard(card.id, remote.revision, 'trash'));
            movePrivateCardToTrash(user, card.id); setMessage('已移入回收站，可在下方恢复。');
          })}>移入回收站</button>
        </div>
      </div>;
    })}</div>
    <details className="text-xs pt-1"><summary className="cursor-pointer text-xs font-semibold text-[var(--app-text-dim,#64748b)] hover:text-[var(--app-text-sub,#cbd5e1)]">角色卡回收站</summary><div className="space-y-2 pt-2">{[...new Set([...trash.map(c => c.id), ...cloud.filter(c => c.deleted).map(c => c.id)])].map(id => {
      const remote = cloud.find(c => c.id === id), local = trash.find(c => c.id === id);
      return <div key={id} className="flex justify-between items-center gap-3 text-xs p-2 rounded-lg bg-[var(--app-card-bg-subtle,#101118)] border border-[var(--app-card-border,#282a3c)]"><span>{local?.title || remote?.deck.title}</span><button className="text-blue-400 hover:underline" disabled={busy} onClick={() => void perform(async () => { if (remote?.deleted) updateCloud(await updatePrivateCard(id, remote.revision, 'restore')); if (local) restorePrivateCard(user, id); setMessage('角色卡已恢复。'); })}>恢复</button></div>;
    })}</div></details>
  </section>;
}
