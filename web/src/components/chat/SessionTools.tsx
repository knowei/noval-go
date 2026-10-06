'use client';
import { useState } from 'react';
import { estimateTokens, SessionSettings, validateExtension } from '@/lib/sessionEngine';
import type { MemoryFact } from '@/lib/sessionEngine';
import { summarizeMemory, retrieveMemory } from '@/lib/memoryEngine';
import { resolveMemory } from '@/lib/memoryResolution';
import { BUILTIN_EXTENSIONS, resolveExtensions, upgradeExtension } from '@/lib/extensionRuntime';
import { exportPreset, importPreset, importRegexScripts } from '@/lib/presetImport';
import type { StateField, StateValue } from '@/lib/stateRules';
import { downloadJson } from './SessionWorkbench';
import { safeRandomUUID } from '@/lib/uuid';

const field = 'w-full rounded-xl border border-[#272b3c] bg-[#090b12] p-2.5 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition shadow-inner';
const button = 'rounded-xl border border-[#2b2f44] bg-[#161826] hover:bg-[#202338] px-3.5 py-2 text-xs font-medium text-gray-200 hover:text-white transition cursor-pointer disabled:opacity-40 shadow-xs active:scale-95';
type Props = { draft: SessionSettings; patch: (value: Partial<SessionSettings>) => void };

export function PresetTools({ draft, patch }: Props) {
  const [preview, setPreview] = useState<ReturnType<typeof importPreset> | null>(null);
  const [message, setMessage] = useState('');
  return <details className="space-y-3 rounded-lg border border-[#24283c] bg-[#141624] p-3"><summary className="cursor-pointer">导入 / 导出玩法预设</summary>
    <label className="block text-sm">本站或酒馆提示词预设（JSON）<input className={field} type="file" accept=".json" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; setPreview(null); try { if (file.size > 1_000_000) throw new Error('预设文件超过 1 MB'); setPreview(importPreset(JSON.parse(await file.text()))); setMessage(''); } catch (error) { setMessage(String(error)); } }} /></label>
    {preview && <div className="space-y-2"><p className="text-sm">导入后替换预设中的对应设置，可在应用前检查。</p><pre className="max-h-36 overflow-auto whitespace-pre-wrap text-xs">{preview.settings.instructions || '本站会话设置'}</pre>{preview.warnings.map((w,i) => <p key={i} className="text-xs text-amber-200">{w}</p>)}<button className={button} onClick={() => { patch(preview.settings); setPreview(null); setMessage('已载入草稿，检查后点击“应用并保存”。'); }}>载入预设草稿</button></div>}
    <button className={button} onClick={() => downloadJson(exportPreset(draft), '会话预设.json')}>导出当前预设</button><p role="status" className="text-xs">{message}</p>
    <div className="grid grid-cols-2 gap-3"><label>本会话温度<input className={field} type="number" min="0" max="2" step="0.05" value={draft.sampling.temperature ?? ''} placeholder="使用模型设置" onChange={e => patch({ sampling: { ...draft.sampling, temperature: e.target.value === '' ? undefined : Number(e.target.value) } })} /></label><label>本会话 Top P<input className={field} type="number" min="0" max="1" step="0.05" value={draft.sampling.topP ?? ''} placeholder="使用模型设置" onChange={e => patch({ sampling: { ...draft.sampling, topP: e.target.value === '' ? undefined : Number(e.target.value) } })} /></label></div>
  </details>;
}

export function MemoryReview({ facts, draft, patch }: Props & { facts: MemoryFact[] }) {
  const [query, setQuery] = useState('');
  const { active: available, superseded } = resolveMemory(facts, draft);
  const recall = retrieveMemory(available, query, draft.memoryTokens, estimateTokens, draft.memoryStrategy);
  return <section className="space-y-3 rounded-lg border border-[#24283c] bg-[#141624] p-3">
    <label className="block">旧事检索方式<select className={field} value={draft.memoryStrategy} onChange={e => patch({ memoryStrategy: e.target.value as SessionSettings['memoryStrategy'] })}><option value="relevant">优先找回与当前话题有关的事实</option><option value="recent">优先最近发生的事实</option></select></label>
    <label className="block">试查旧事<input className={field} value={query} onChange={e => setQuery(e.target.value)} placeholder="例如：铜钥匙、书房、守塔人" /></label>
    <p className="text-xs text-slate-400">按当前记忆预算选中 {recall.selected.length} 条，省略 {recall.omitted} 条。正式生成会使用你最新的输入检索。</p>
    {!!superseded.length && <details><summary className="cursor-pointer text-xs">已有新值的旧记录（{superseded.length} 条，不参与当前事实检索）</summary>{superseded.map((f,i)=><p key={i} className="text-xs">第 {f.turn} 条 · {f.key}：{f.text}</p>)}</details>}
    {query && <ul className="space-y-1 text-sm">{recall.selected.map((f,i) => <li key={i}>第 {f.turn} 条：{f.text}</li>)}</ul>}
    <details><summary className="cursor-pointer">分段摘要（事实摘录）</summary><p className="my-2 text-xs text-slate-400">每 12 条消息整理一段，保留事实来源，不额外调用模型。切换剧情后自动按当前分支重建。</p>{summarizeMemory(available).map(segment => <div className="mb-2 border-l-2 border-sky-700 pl-3" key={segment.from}><p className="text-xs text-slate-400">消息 {segment.from}–{segment.to}</p><p className="text-sm">{segment.text}</p></div>)}{!available.length && <p className="text-sm">完成剧情回复后，会在这里积累摘要。</p>}</details>
  </section>;
}

export function RegexImporter({ draft, patch }: Props) {
  const [message, setMessage] = useState('');
  return <div><label className="block">导入酒馆显示正则（JSON）<input className={field} type="file" accept=".json" onChange={async e => { const file=e.target.files?.[0]; e.target.value=''; if (!file) return; try { if (file.size > 1000000) throw new Error('正则文件超过 1 MB'); const result = importRegexScripts(JSON.parse(await file.text())); patch({ rules: [...draft.rules, ...result.rules] }); setMessage(`已加入 ${result.rules.length} 条规则，默认关闭。${result.warnings.join(' ')}`); } catch (error) { setMessage(String(error)); } }} /></label><p role="status" className="text-xs text-amber-200">{message}</p></div>;
}

export function ExtensionManager({ draft, patch }: Props) {
  const [message, setMessage] = useState('');
  const install = (value: unknown) => {
    const next = validateExtension(value), previous = draft.extensions.find(e => e.id === next.id);
    patch({ extensions: [...draft.extensions.filter(e => e.id !== next.id), upgradeExtension(previous, next)], extensionBackups: previous ? [...draft.extensionBackups.filter(e => e.id !== previous.id), previous] : draft.extensionBackups });
    setMessage(previous ? '已更新并迁移配置，旧版本已保留。检查后重新启用。' : '已加入扩展，启用后点击“应用并保存”。');
  };
  const resolved = resolveExtensions(draft.extensions);
  return <div className="space-y-3">
    <p className="text-sm">扩展可以在请求前、历史之后补充指令，或在回复显示前添加文本与执行正则。支持依赖检查、可调参数、版本迁移及回退。</p>
    <div className="flex flex-wrap gap-2">{BUILTIN_EXTENSIONS.map(e => <button key={e.id} className={button} disabled={draft.extensions.some(x => x.id === e.id)} onClick={() => install(e)}>添加「{e.name}」</button>)}</div>
    <label className="block">导入 / 更新扩展清单<input className={field} type="file" accept=".json" onChange={async e => { const f=e.target.files?.[0]; e.target.value=''; if (!f) return; try { if (f.size>100000) throw new Error('文件超过 100 KB'); install(JSON.parse(await f.text())); } catch (error) { setMessage(String(error)); } }} /></label>
    <button className={button} onClick={() => downloadJson(BUILTIN_EXTENSIONS[0], '扩展示例.json')}>下载扩展示例</button>
    <p role="status" className="text-xs text-sky-200">{message}</p>{resolved.warnings.map(w => <p key={w} className="text-sm text-amber-200">{w}</p>)}
    {draft.extensions.map((extension, i) => <div key={extension.id} className="space-y-2 rounded-lg border border-[#24283c] bg-[#141624] p-3">
      <label><input type="checkbox" checked={extension.enabled} onChange={e => patch({ extensions: draft.extensions.map((x,j) => i===j ? { ...x, enabled: e.target.checked } : x) })} /> {extension.name} · {extension.version}</label>
      <p className="text-xs text-slate-400">{resolved.active.some(e => e.id===extension.id) ? '已就绪（保存后执行）' : extension.enabled ? '依赖未满足，暂不执行' : '未启用'}{extension.dependencies?.length ? ' · 依赖：'+extension.dependencies.map(e=>`${e.id} ${e.minVersion || ''}`).join('、') : ''}</p>
      {Object.entries(extension.defaults || {}).map(([key, fallback]) => <label className="block text-sm" key={key}>{key}{typeof fallback === 'boolean' ? <input className="ml-2" type="checkbox" checked={Boolean(extension.config?.[key] ?? fallback)} onChange={e => patch({ extensions: draft.extensions.map((x,j) => i===j ? { ...x, config: { ...x.config, [key]: e.target.checked } } : x) })} /> : <input className={field} type={typeof fallback === 'number' ? 'number' : 'text'} value={String(extension.config?.[key] ?? fallback)} onChange={e => patch({ extensions: draft.extensions.map((x,j) => i===j ? { ...x, config: { ...x.config, [key]: typeof fallback === 'number' ? Number(e.target.value) : e.target.value } } : x) })} />}</label>)}
      <details><summary>查看内容与执行阶段</summary><pre className="overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(extension,null,2)}</pre></details>
      <div className="flex gap-2"><button className={button} onClick={() => patch({ extensions: draft.extensions.filter((_,j)=>i!==j) })}>移除</button>{draft.extensionBackups.some(e=>e.id===extension.id) && <button className={button} onClick={() => { const backup=draft.extensionBackups.find(e=>e.id===extension.id)!; patch({ extensions:draft.extensions.map(e=>e.id===extension.id ? {...backup,enabled:false}:e), extensionBackups:draft.extensionBackups.map(e=>e.id===extension.id?extension:e) }); setMessage('已恢复上一个版本，检查后重新启用。'); }}>回退上个版本</button>}</div>
    </div>)}
  </div>;
}

function parseValue(text: string, type: StateField['type']): StateValue { return type === 'number' ? Number(text) : type === 'boolean' ? text === 'true' : type === 'list' ? text.split(/[,，]/).map(s=>s.trim()).filter(Boolean) : text; }
function formatValue(value: StateValue) { return Array.isArray(value) ? value.join('，') : String(value ?? ''); }

export function StateRulesEditor({ draft, patch }: Props) {
  const fields=draft.stateFields, events=draft.stateEvents;
  const updateField = (i: number, value: Partial<StateField>) => patch({ stateFields: fields.map((f,j)=>i===j?{...f,...value}:f) });
  return <div className="space-y-3">
    <p className="text-sm">定义字段后，模型只能更新这些状态，数值会限制在范围内。事件在每条完成回复后执行一次，条件读取执行前的状态，不递归触发。</p>
    <button className={button} onClick={() => patch({ stateFields: [...fields, { key:'field_'+safeRandomUUID().slice(0,8),label:'新状态',type:'number',initial:100,min:0,max:100 }] })}>添加状态字段</button>
    {!fields.length && <button className={`${button} ml-2`} onClick={() => patch({ stateFields:[{key:'stamina',label:'体力',type:'number',initial:100,min:0,max:100},{key:'mood',label:'身体状况',type:'string',initial:'正常'},{key:'inventory',label:'背包',type:'list',initial:[]}],stateEvents:[{id:'exhausted',name:'体力耗尽',enabled:true,field:'stamina',operator:'lte',value:0,target:'mood',operation:'set',result:'疲惫'}] })}>载入冒险示例</button>}
    {fields.map((f,i)=><div key={i} className="space-y-2 rounded-lg border border-[#24283c] bg-[#141624] p-3"><div className="grid gap-2 sm:grid-cols-2"><label>名称<input className={field} value={f.label} onChange={e=>updateField(i,{label:e.target.value})}/></label><label>字段标识<input className={field} value={f.key} onChange={e=>updateField(i,{key:e.target.value})}/></label><label>类型<select className={field} value={f.type} onChange={e=>{const type=e.target.value as StateField['type'];updateField(i,{type,initial:type==='number'?0:type==='boolean'?false:type==='list'?[]:''});}}><option value="number">数值</option><option value="string">文本</option><option value="boolean">是 / 否</option><option value="list">物品列表</option></select></label><label>初始值{f.type==='boolean'?<select className={field} value={String(f.initial)} onChange={e=>updateField(i,{initial:e.target.value==='true'})}><option value="false">否</option><option value="true">是</option></select>:<input className={field} type={f.type==='number'?'number':'text'} value={formatValue(f.initial)} onChange={e=>updateField(i,{initial:parseValue(e.target.value,f.type)})}/>}</label>{f.type==='number'&&(['min','max']as const).map(key=><label key={key}>{key==='min'?'最小值':'最大值'}<input className={field} type="number" value={f[key]??''} onChange={e=>updateField(i,{[key]:e.target.value===''?undefined:Number(e.target.value)})}/></label>)}</div><button className={button} onClick={()=>patch({stateFields:fields.filter((_,j)=>j!==i),stateEvents:events.filter(e=>e.field!==f.key&&e.target!==f.key)})}>删除字段及关联事件</button></div>)}
    <button className={button} disabled={!fields.length} onClick={()=>patch({stateEvents:[...events,{id:'event_'+safeRandomUUID().slice(0,8),name:'新事件',enabled:false,field:fields[0].key,operator:fields[0].type==='list'?'contains':'eq',value:fields[0].type==='list'?'':fields[0].initial,target:fields[0].key,operation:'set',result:fields[0].initial}]})}>添加事件规则</button>
    {events.map((event,i)=>{const update=(v:Partial<typeof event>)=>patch({stateEvents:events.map((e,j)=>j===i?{...e,...v}:e)});const source=fields.find(f=>f.key===event.field),target=fields.find(f=>f.key===event.target);return <div className="space-y-2 rounded-lg border border-[#24283c] bg-[#141624] p-3" key={event.id}><label><input type="checkbox" checked={event.enabled} onChange={e=>update({enabled:e.target.checked})}/> 启用事件</label><label className="block">事件名称<input className={field} value={event.name} onChange={e=>update({name:e.target.value})}/></label><div className="grid gap-2 sm:grid-cols-3"><label>当字段<select className={field} value={event.field} onChange={e=>{const f=fields.find(f=>f.key===e.target.value)!;update({field:f.key,operator:f.type==='list'?'contains':'eq',value:f.type==='list'?'':f.initial});}}>{fields.map(f=><option value={f.key} key={f.key}>{f.label}</option>)}</select></label><label>条件<select className={field} value={event.operator} onChange={e=>update({operator:e.target.value as typeof event.operator})}><option value="eq">等于</option><option value="lte">小于等于</option><option value="gte">大于等于</option><option value="contains">包含</option></select></label><label>条件值<input className={field} value={formatValue(event.value)} onChange={e=>update({value:parseValue(e.target.value,event.operator==='contains'?'string':source?.type||'string')})}/></label><label>更新字段<select className={field} value={event.target} onChange={e=>{const f=fields.find(f=>f.key===e.target.value)!;update({target:f.key,operation:'set',result:f.initial});}}>{fields.map(f=><option value={f.key} key={f.key}>{f.label}</option>)}</select></label><label>操作<select className={field} value={event.operation} onChange={e=>update({operation:e.target.value as 'set'|'add'})}><option value="set">设置为</option>{target?.type==='number'&&<option value="add">增加（负数为扣除）</option>}</select></label><label>结果值<input className={field} value={formatValue(event.result)} onChange={e=>update({result:parseValue(e.target.value,target?.type||'string')})}/></label></div><button className={button} onClick={()=>patch({stateEvents:events.filter((_,j)=>i!==j)})}>移除事件</button></div>;})}
  </div>;
}

export function MediaSettings({ draft, patch }: Props) {
  const media=draft.media;
  const update=(value:Partial<typeof media>)=>patch({media:{...media,...value}});
  return <div className="space-y-3"><label className="block"><input type="checkbox" checked={media.enabled} onChange={e=>update({enabled:e.target.checked})}/> 启用立绘、背景与音乐联动</label><label className="block"><input type="checkbox" checked={media.speech} onChange={e=>update({speech:e.target.checked})}/> 显示本机语音朗读按钮</label><p className="text-xs text-slate-400">按状态字段匹配素材；条件留空则常驻。同类多个命中时使用最后一项。音乐需手动开始播放，语音仅使用浏览器可用的本机声音。</p><label className="block">音乐音量<input className="block w-full" type="range" min="0" max="1" step="0.05" value={media.volume} onChange={e=>update({volume:Number(e.target.value)})}/></label><button className={button} onClick={()=>update({assets:[...media.assets,{id:safeRandomUUID(),label:'新素材',kind:'portrait',url:'',field:'emotion',value:'calm'}]})}>添加素材</button>{media.assets.map((asset,i)=><div key={asset.id} className="space-y-2 rounded-lg border border-[#24283c] bg-[#141624] p-3">{(['label','url','field','value']as const).map((key,index)=><label className="block" key={key}>{['素材名称','素材地址（HTTPS、本地路径或图片数据）','匹配状态字段（空则常驻）','匹配值'][index]}<input className={field} value={asset[key]} onChange={e=>update({assets:media.assets.map((a,j)=>i===j?{...a,[key]:e.target.value}:a)})}/></label>)}<label className="block">类型<select className={field} value={asset.kind} onChange={e=>update({assets:media.assets.map((a,j)=>i===j?{...a,kind:e.target.value as typeof a.kind}:a)})}><option value="portrait">立绘 / 表情</option><option value="background">场景背景</option><option value="music">背景音乐</option></select></label><button className={button} onClick={()=>update({assets:media.assets.filter((_,j)=>i!==j)})}>移除素材</button></div>)}</div>;
}
