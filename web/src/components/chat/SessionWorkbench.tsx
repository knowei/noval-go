'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { allRules, normalizeSession, PromptReport, resolveSnapshot, SessionSettings, validateExtension, validateRule } from '@/lib/sessionEngine';
import { applyTextRules } from '@/lib/textRules';
import { LoreEntry } from '@/lib/types';
import { BranchTimelinePanel } from './BranchTimelinePanel';
import { ExtensionManager, MediaSettings, MemoryReview, PresetTools, RegexImporter, StateRulesEditor } from './SessionTools';
import { validateStateFields, validateStateEvents } from '@/lib/stateRules';
import { safeMediaUrl } from '@/lib/mediaRuntime';
import { savePrivateCard } from '@/lib/cardImport';
import { PlaytestPanel } from './PlaytestPanel';
import { MemoryFactEditor } from './MemoryFactEditor';
import { ImageSettingsPanel } from './IllustrationPanel';

export function downloadJson(value: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const field = 'w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-sm text-slate-100';
const button = 'rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-40';
const tabs = ['玩法', '试玩与诊断', '剧情分支', '记忆与状态', '状态规则', '世界书', '正则', '扩展', '视听', '生图', '提示词'] as const;
type Tab = typeof tabs[number];

export function SessionWorkbench(props: { open: boolean; onClose: () => void; report: PromptReport | null; busy: boolean }) {
  const conversation = useAppStore(s => s.currentConversationId);
  return props.open ? <WorkbenchPanel key={conversation} {...props} /> : null;
}

function WorkbenchPanel({ onClose, report, busy }: { onClose: () => void; report: PromptReport | null; busy: boolean }) {
  const { sessionSettings, setSessionSettings, conversationHistory, currentDeck, currentConversationId, saveError } = useAppStore();
  const [draft, setDraft] = useState(() => normalizeSession(sessionSettings));
  const [tab, setTab] = useState<Tab>('玩法');
  const [message, setMessage] = useState('');
  const [testText, setTestText] = useState('在此输入测试文本');
  const [testResult, setTestResult] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const snapshot = resolveSnapshot(conversationHistory);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const patch = (value: Partial<SessionSettings>) => { setDraft(d => ({ ...d, ...value })); setMessage('有未保存的更改'); };
  const validatedDraft = () => {
      draft.rules.forEach(validateRule);
      draft.extensions.forEach(validateExtension);
      validateStateFields(draft.stateFields);
      validateStateEvents(draft.stateEvents, draft.stateFields);
      if (draft.media.assets.some(a => !safeMediaUrl(a.url))) throw new Error('视听素材地址为空或格式不支持，请填写有效地址或移除素材。');
      if (draft.responseTokens + 1024 >= draft.contextTokens) throw new Error('上下文容量需要大于回复预算，并留出设定空间。');
      return normalizeSession(draft);
  };
  const save = () => {
    try {
      setSessionSettings(validatedDraft());
      setMessage(conversationHistory.length ? '设置已应用；正在自动保存，可在聊天页查看失败提示。' : '设置已应用，发送第一条消息后随会话保存。');
    } catch (e) { setMessage(e instanceof Error ? e.message : '设置无效'); }
  };
  const updateLore = (index: number, update: Partial<LoreEntry>) => patch({ lore: draft.lore.map((e, i) => i === index ? { ...e, ...update } : e) });
  return <dialog ref={dialog} onCancel={e => { e.preventDefault(); onClose(); }} aria-labelledby="workbench-title" className="m-auto w-[min(94vw,900px)] max-h-[90dvh] rounded-2xl border border-slate-600 bg-slate-900 p-0 text-slate-100 backdrop:bg-black/70">
    <div className="flex items-center justify-between border-b border-slate-700 p-4">
      <div><h2 id="workbench-title" className="font-semibold">会话工作台</h2><p className="text-xs text-slate-400">{currentDeck?.title} · {tab === '生图' ? '生图连接设置保存在本机' : '设置随当前存档保存'}</p></div>
      <button className={button} onClick={onClose} aria-label="关闭会话工作台">关闭</button>
    </div>
    <nav aria-label="工作台分类" className="flex gap-2 overflow-x-auto border-b border-slate-700 p-3">{tabs.map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)} className={`${button} whitespace-nowrap ${tab === t ? 'bg-sky-900' : ''}`}>{t}</button>)}</nav>
    <div className="max-h-[60dvh] overflow-y-auto p-4 space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
      {tab === '玩法' && <>
        <PresetTools draft={draft} patch={patch} />
        <div className="grid gap-4 sm:grid-cols-3">
          <label>玩法<select className={field} value={draft.mode} onChange={e => patch({ mode: e.target.value as SessionSettings['mode'] })}><option value="chat">自由聊天</option><option value="narrative">小说叙事</option><option value="adventure">规则冒险</option></select></label>
          <label>推进节奏<select className={field} value={draft.pace} onChange={e => patch({ pace: e.target.value as SessionSettings['pace'] })}><option value="slow">慢慢展开</option><option value="natural">自然推进</option><option value="fast">快速推进</option></select></label>
          <label>回复篇幅<select className={field} value={draft.length} onChange={e => patch({ length: e.target.value as SessionSettings['length'] })}><option value="short">简短</option><option value="medium">适中</option><option value="long">详细</option></select></label>
        </div>
        <label className="block">行动选项数量（0 表示关闭）<input type="number" className={field} min={0} max={4} value={draft.options} onChange={e => patch({ options: Number(e.target.value) })} /></label>
        <label className="block">玩家称呼<input className={field} value={draft.playerName} onChange={e => patch({ playerName: e.target.value })} /></label>
        <label className="block">玩家设定<textarea className={field} rows={3} value={draft.persona} onChange={e => patch({ persona: e.target.value })} placeholder="称呼、身份和已知背景" /></label>
        <label className="block">本次叙事要求<textarea className={field} rows={3} value={draft.instructions} onChange={e => patch({ instructions: e.target.value })} placeholder="例如：对白简洁，给玩家留出回应空间" /></label>
        <details><summary className="cursor-pointer">上下文与回复预算</summary><p className="my-2 text-xs text-slate-400">回复上限由正文、状态、记忆和选项共同使用，不是中文字数。若经常在末尾中断，可在模型支持时尝试 4096，或把回复篇幅改为简短。提高上限可能增加耗时和消耗，也会减少可保留的历史。</p><p className="my-2 text-xs text-slate-400">容量需符合所选模型的限制。估算会为中文留出余量，不是精确 Token 计数。</p><div className="grid gap-3 sm:grid-cols-2">{([['contextTokens', '上下文容量'], ['responseTokens', '回复上限'], ['loreTokens', '世界书预算'], ['memoryTokens', '自动记忆预算']] as const).map(([key, label]) => <label key={key}>{label}<input className={field} type="number" value={draft[key]} onChange={e => patch({ [key]: Number(e.target.value) })} /></label>)}</div>{draft.responseTokens < 4096 && draft.contextTokens > 5120 && <button className={`${button} mt-2`} onClick={() => patch({responseTokens:4096})}>将回复上限设为 4096（应用后生效）</button>}</details>
        <button className={button} onClick={() => downloadJson({ format: 'noval-session-v1', deck: currentDeck, history: conversationHistory.map((t, i) => i ? t : { ...t, session: draft }), session: draft, id: currentConversationId }, '会话备份.json')}>导出会话备份</button>
        <button className={`${button} ml-2`} onClick={() => { try { if (!currentDeck) return; const settings = validatedDraft(); savePrivateCard(useAppStore.getState().currentUserId, { ...currentDeck, id: 'local_' + crypto.randomUUID(), title: currentDeck.title + ' · 我的设定', sessionDefaults: { ...settings, pinnedMemory: '', excludedMemories: [], memoryCorrections: [] } }); setMessage('已另存为私人剧本。返回首页“我的角色卡”可使用或上传；新对话会沿用这些规则。'); } catch (error) { setMessage(String(error)); } }}>将规则另存为我的剧本</button>
      </>}
      {tab === '记忆与状态' && <>
        <MemoryReview draft={draft} patch={patch} facts={snapshot.memories} />
        <p className="text-xs text-slate-400">更正和忽略会影响后续事实检索，绑定当前回复来源；不会自动改写原始正文或状态快照。若纠正物品归属等状态事实，也请检查当前状态是否一致。</p>
        <label className="block">固定记忆与事实纠正<textarea className={field} rows={5} value={draft.pinnedMemory} onChange={e => patch({ pinnedMemory: e.target.value })} placeholder="例如：我们已经在港口见过面。固定记忆优先于自动记忆。" /></label>
        <p className="text-xs text-slate-400">自动记忆来自已完成的回复，保留来源消息。切换旧回复版本后，后续剧情及其记忆会移到“剧情分支”，可随时恢复；固定记忆由你管理。</p>
        {snapshot.memories.map((m, i) => <MemoryFactEditor key={m.source + ":" + i} fact={m} draft={draft} patch={patch} />)}
        {!snapshot.memories.length && <p className="text-slate-400">还没有自动记忆。</p>}
        <h3>当前状态</h3><pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs">{JSON.stringify(snapshot.state, null, 2)}</pre>
        <p className="text-xs text-slate-400">状态由所选剧情重新计算。可在“状态规则”设置字段范围及完成回复后执行的事件。</p>
      </>}
      {tab === '世界书' && <>
        <p className="text-xs text-slate-400">这里的词条随会话保存，与剧本自带世界书合并。同 ID 的会话词条覆盖原词条。</p>
        <button className={button} onClick={() => patch({ lore: [...draft.lore, { id: crypto.randomUUID(), title: '新词条', keys: [], content: '', priority: 0, scanDepth: 6, enabled: true, position: 'early' }] })}>添加词条</button>
        {draft.lore.map((entry, i) => <div key={entry.id} className="space-y-2 rounded-lg border border-slate-700 p-3">
          <label className="block">标题<input className={field} value={entry.title} onChange={e => updateLore(i, { title: e.target.value })} /></label>
          <label className="block">关键词（逗号分隔，任意命中）<input className={field} value={entry.keys.join(',')} onChange={e => updateLore(i, { keys: e.target.value.split(/[,，]/).map(x => x.trim()) })} /></label>
          <label className="block">背景内容<textarea className={field} value={entry.content} onChange={e => updateLore(i, { content: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-2"><label>优先级<input type="number" className={field} value={entry.priority || 0} onChange={e => updateLore(i, { priority: Number(e.target.value) })} /></label><label>回看消息数<input type="number" min={1} max={100} className={field} value={entry.scanDepth ?? 6} onChange={e => updateLore(i, { scanDepth: Number(e.target.value) })} /></label></div>
          <label className="mr-4"><input type="checkbox" checked={!!entry.constant} onChange={e => updateLore(i, { constant: e.target.checked })} /> 常驻</label><label><input type="checkbox" checked={entry.enabled !== false} onChange={e => updateLore(i, { enabled: e.target.checked })} /> 启用</label>
          <label className="block">插入位置<select className={field} value={entry.position || 'early'} onChange={e => updateLore(i, { position: e.target.value as 'early' | 'late' })}><option value="early">背景设定区</option><option value="late">最近消息之后</option></select></label>
          <details className="space-y-2"><summary className="cursor-pointer text-sm">高级触发与分组</summary>
            <label className="block">次要关键词（逗号分隔）<input className={field} value={(entry.secondaryKeys || []).join(',')} onChange={e=>updateLore(i,{secondaryKeys:e.target.value.split(/[,，]/).map(s=>s.trim()).filter(Boolean)})}/></label>
            <label className="block">次要关键词条件<select className={field} value={entry.secondaryMode || 'andAny'} onChange={e=>updateLore(i,{secondaryMode:e.target.value as LoreEntry['secondaryMode']})}><option value="andAny">至少命中一个</option><option value="andAll">全部命中</option><option value="notAny">全部未命中</option><option value="notAll">至少一个未命中</option></select></label>
            <div className="grid grid-cols-2 gap-2"><label>触发概率（%）<input type="number" min="0" max="100" className={field} value={entry.probability ?? 100} onChange={e=>updateLore(i,{probability:Number(e.target.value)})}/></label><label>互斥组名称<input className={field} value={entry.group || ''} onChange={e=>updateLore(i,{group:e.target.value})}/></label><label>组内抽取权重<input type="number" min="1" className={field} value={entry.groupWeight ?? 100} onChange={e=>updateLore(i,{groupWeight:Number(e.target.value)})}/></label></div>
            <label className="block"><input type="checkbox" checked={!!entry.groupPriority} onChange={e=>updateLore(i,{groupPriority:e.target.checked})}/> 组内优先使用本词条（多个优先项按优先级选择）</label>
            <label className="block"><input type="checkbox" checked={entry.recursive !== false} onChange={e=>updateLore(i,{recursive:e.target.checked})}/> 内容可触发其他词条（最多 4 层）</label>
            <label className="block"><input type="checkbox" checked={!!entry.excludeRecursion} onChange={e=>updateLore(i,{excludeRecursion:e.target.checked})}/> 仅由聊天消息触发本词条</label>
          </details>
          <button className={button} onClick={() => patch({ lore: draft.lore.filter((_, j) => i !== j) })}>移除此词条</button>
        </div>)}
        <p className="text-sm">上次命中：{report?.activeLore.map(e => e.title).join('、') || '尚无记录'}</p>
      </>}
      {tab === '正则' && <>
        <RegexImporter draft={draft} patch={patch} />
        <p className="text-xs text-slate-400">规则按列表顺序执行。显示规则只处理新回复的展示文本；发送规则处理本次请求。原始回复保留在“提示词”页。关闭规则后可点下方按钮恢复显示。</p>
        <button className={button} onClick={() => patch({ rules: [...draft.rules, { id: crypto.randomUUID(), name: '新规则', pattern: '待替换文本', replacement: '', flags: 'g', enabled: false, scope: 'display' }] })}>添加规则</button>
        {draft.rules.map((r, i) => <div key={r.id} className="space-y-2 rounded-lg border border-slate-700 p-3">{(['name', 'pattern', 'replacement', 'flags'] as const).map((key, n) => <label className="block" key={key}>{['名称', '正则表达式', '替换内容', '标志（如 g、i）'][n]}<input className={field} value={r[key]} onChange={e => patch({ rules: draft.rules.map((v, j) => i === j ? { ...v, [key]: e.target.value } : v) })} /></label>)}<select aria-label="规则作用范围" className={field} value={r.scope} onChange={e => patch({ rules: draft.rules.map((v, j) => i === j ? { ...v, scope: e.target.value as 'display' | 'prompt' } : v) })}><option value="display">只改变显示</option><option value="prompt">只改变发给模型的内容</option></select><label><input type="checkbox" checked={r.enabled} onChange={e => patch({ rules: draft.rules.map((v, j) => i === j ? { ...v, enabled: e.target.checked } : v) })} /> 启用</label><button className={`${button} ml-3`} onClick={() => patch({ rules: draft.rules.filter((_, j) => i !== j) })}>移除</button></div>)}
        <label className="block">规则测试<textarea className={field} value={testText} onChange={e => setTestText(e.target.value)} /></label>
        {(['display', 'prompt'] as const).map(scope => <button key={scope} className={`${button} mr-2`} onClick={async () => { try { const result = await applyTextRules(testText, allRules(draft), scope); setTestResult(result.text + '\n' + result.warnings.join('\n')); } catch (e) { setTestResult(String(e)); } }}>测试{scope === 'display' ? '显示' : '发送'}规则</button>)}
        <pre className="whitespace-pre-wrap break-words text-sm">{testResult}</pre>
        <button className={button} onClick={() => { const store = useAppStore.getState(); store.setConversationHistory(store.conversationHistory.map(t => ({ ...t, displayText: undefined }))); void store.autoSave(); setMessage('显示已恢复为未经过正则处理的正文。'); }}>恢复本会话原始正文显示</button>
      </>}
      {tab === '扩展' && <ExtensionManager draft={draft} patch={patch} />}
      {tab === '状态规则' && <StateRulesEditor draft={draft} patch={patch} />}
      {tab === '视听' && <MediaSettings draft={draft} patch={patch} />}
      {tab === '生图' && <ImageSettingsPanel />}
      {currentDeck && <div hidden={tab !== '试玩与诊断'}><PlaytestPanel key={useAppStore.getState().currentUserId} deck={currentDeck} draft={draft} history={conversationHistory} /></div>}
      </fieldset>
      {tab === '剧情分支' && <BranchTimelinePanel busy={busy} onRestored={onClose} />}
      {tab === '提示词' && <>
        {!!report?.recalledMemory?.length && <details><summary>本次找回的旧事（{report.recalledMemory.length} 条）</summary>{report.recalledMemory.map((m,i)=><p className="text-sm" key={i}>第 {m.turn} 条消息：{m.text}</p>)}</details>}
        <p className="text-xs text-slate-400">记录本页最近一次生成的请求正文，不包含请求头或 API 密钥。刷新后清空。</p>
        {report ? <><p>保留 {report.historyIncluded} 条历史，省略 {report.historyOmitted} 条；输入约 {report.estimatedTokens} Token，回复预留 {report.settings.responseTokens}。</p>{report.warnings.map((w, i) => <p key={i} className="text-amber-200">{w}</p>)}<button className={button} onClick={() => downloadJson(report, '提示词检查.json')}>导出请求正文</button>{report.messages.map((m, i) => <details key={i}><summary>{i + 1}. {m.role} · {m.content.length} 字符</summary><pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 text-xs">{m.content}</pre></details>)}</> : <p>发送一条消息后，这里会显示实际请求。</p>}
        <details><summary>最近回复原文</summary><pre className="whitespace-pre-wrap break-words text-xs">{[...conversationHistory].reverse().find(t => !t.isUser)?.rawText || '暂无原始回复'}</pre></details>
      </>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 p-4"><p role="status" className="text-xs text-slate-300">{busy ? '正在处理，请稍候…' : saveError || message}</p>{tab !== '剧情分支' && tab !== '生图' && <button className={`${button} bg-sky-800`} disabled={busy} onClick={save}>应用并保存</button>}</div>
  </dialog>;
}
