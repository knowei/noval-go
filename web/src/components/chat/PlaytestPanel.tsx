'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getSiteToken } from '@/lib/api';
import { normalizeSession, SessionSettings } from '@/lib/sessionEngine';
import { diagnoseStory, LIGHTHOUSE_ACTIONS, LIGHTHOUSE_DECK, startPlaytest } from '@/lib/storyDiagnostics';
import { runPlaytestTurn } from '@/lib/playtestRuntime';
import type { StoryDeck, Turn } from '@/lib/types';
import { downloadJson } from './SessionWorkbench';

const button = 'rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-40';
const field = 'w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-sm text-slate-100';
type Result = Awaited<ReturnType<typeof runPlaytestTurn>> & { input: string };
interface Run { title: string; model: string; startedAt: string; settings: SessionSettings; actions: string[]; results: Result[]; complete: boolean; note: string }

export function PlaytestPanel({ deck, draft, history }: { deck: StoryDeck; draft: SessionSettings; history: Turn[] }) {
  const user = useAppStore(s => s.currentUserId);
  const [sample, setSample] = useState(true);
  const [actions, setActions] = useState(LIGHTHOUSE_ACTIONS.join('\n'));
  const [run, setRun] = useState<Run | null>(null);
  const [baseline, setBaseline] = useState<Run | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, [user]);
  const diagnostics = useMemo(() => diagnoseStory(deck, draft, history), [deck, draft, history]);
  const start = async () => {
    if (controller.current) return;
    const inputs = actions.split('\n').map(s => s.trim()).filter(Boolean);
    if (!inputs.length || inputs.length > 8 || inputs.some(s => s.length > 2000)) { setMessage('每行一轮行动，最多 8 轮，每轮最多 2000 字。'); return; }
    const chosen = sample ? LIGHTHOUSE_DECK : deck;
    const settings = normalizeSession(sample ? LIGHTHOUSE_DECK.sessionDefaults : draft);
    const model = { ...useAppStore.getState().modelSettings };
    const abort = new AbortController(); controller.current = abort;
    setRunning(true); setMessage('正在试玩；每轮完成后显示结果。');
    let current: Run = { title: chosen.title, model: model.model, startedAt: new Date().toISOString(), settings, actions: inputs, results: [], complete: false, note: '' };
    setRun(current);
    let testHistory = startPlaytest(chosen, settings);
    try {
      for (const input of inputs) {
        const timeout = setTimeout(() => abort.abort(), 120000);
        try {
          const result = await runPlaytestTurn({ deck: chosen, history: testHistory, settings, model, input, siteToken: getSiteToken(), signal: abort.signal });
          if (controller.current !== abort) return;
          current = { ...current, results: [...current.results, { ...result, input }] };
          testHistory = [...testHistory, { isUser: true, text: input }, result.reply];
          setRun(current);
        } finally { clearTimeout(timeout); }
      }
      current = { ...current, complete: true }; setRun(current);
      setMessage('试玩完成。请按下方标准检查正文；格式检查通过不代表剧情质量合格。');
    } catch (error) {
      if (controller.current === abort) setMessage(abort.signal.aborted ? '试玩已停止或超时；已完成的轮次仍可查看。' : error instanceof Error ? error.message : '试玩失败');
    } finally {
      if (controller.current === abort) { controller.current = null; setRunning(false); }
    }
  };
  const show = (value: Run, label: string) => <section className="space-y-2 rounded-lg border border-slate-700 p-3">
    <h4 className="font-medium">{label} · {value.title}</h4><p className="text-xs text-slate-400">{value.model} · {value.results.length}/{value.actions.length} 轮 · {value.complete ? '完整' : '未完成'}</p>
    {value.results.map((r, i) => <details key={i} open={i === value.results.length - 1}><summary className="cursor-pointer">第 {i + 1} 轮 · {(r.elapsedMs / 1000).toFixed(1)} 秒 · {r.issues.length ? `${r.issues.length} 条提示` : '无格式或整段重复提示'}</summary><p className="my-2 text-sm text-sky-200">{r.input}</p><p className="whitespace-pre-wrap text-sm">{r.reply.displayText || r.reply.story}</p>{r.issues.map((issue,j)=><p key={j} className="text-xs text-amber-200">{issue}</p>)}<pre className="my-2 overflow-auto text-xs">{JSON.stringify(r.reply.status, null, 2)}</pre><p className="text-xs">找回 {r.report.recalledMemory.length} 条事实；省略 {r.report.historyOmitted} 条历史</p><details><summary className="text-xs">本轮请求与原始回复</summary><pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{JSON.stringify({messages:r.report.messages,raw:r.reply.rawText},null,2)}</pre></details></details>)}
    {value.note && <p className="whitespace-pre-wrap text-sm">评语：{value.note}</p>}
  </section>;
  return <section className="space-y-4">
    <h3 className="font-semibold">当前剧本诊断</h3>
    {diagnostics.map((d,i)=><div key={i} className={`rounded-lg border border-slate-700 p-3 ${d.level==='error'?'text-red-200':d.level==='warning'?'text-amber-200':'text-slate-300'}`}><p className="text-sm">{d.title}</p><p className="text-xs">{d.detail}</p></div>)}
    <h3 className="font-semibold">独立试玩</h3>
    <p className="text-xs text-slate-400">使用当前模型连接，每行发送一次请求，会消耗模型额度。试玩从剧本开场开始，结果仅保留在这个工作台，可导出。切换页签可调整草稿并保留对照；关闭工作台会停止请求并清空结果。</p>
    <fieldset disabled={running} className="space-y-3">
      <label className="block">试玩剧本<select className={field} value={sample?'sample':'current'} onChange={e=>{const next=e.target.value==='sample';setSample(next);setActions(next?LIGHTHOUSE_ACTIONS.join('\n'):'观察当前场景，先询问眼前人物的目的。\n回顾我们刚才确认的事情，哪些仍未确定？');}}><option value="sample">灯塔来信（已校准的固定样例）</option><option value="current">当前剧本（使用工作台草稿）</option></select></label>
      <label className="block">试玩行动（每行一轮，最多 8 轮）<textarea className={field} rows={6} value={actions} onChange={e=>setActions(e.target.value)}/></label>
      <button className={button} onClick={()=>void start()}>开始独立试玩</button>
      <button className={`${button} ml-2`} disabled={!run?.results.length} onClick={()=>{setBaseline(run ? structuredClone(run) : null);setMessage('已保留为对照 A；调整设置后重新试玩，再比较两次正文。');}}>保留本次为对照 A</button>
    </fieldset>
    {running && <button className={button} onClick={()=>controller.current?.abort()}>停止试玩</button>}
    <p role="status" className="text-sm text-sky-200">{message}</p>
    <p className="text-xs text-slate-400">人工检查：人物是否越过知识边界、是否替玩家行动、物品归属是否正确、是否重复段落、是否把计划记成事实。比较时保持模型、行动序列和采样参数一致，单次结果不能证明稳定性提升。</p>
    {baseline && run && (baseline.model!==run.model || JSON.stringify(baseline.actions)!==JSON.stringify(run.actions) || baseline.title!==run.title) && <p className="text-amber-200 text-xs">两次试玩的模型、剧本或行动序列不同，请勿直接归因于规则改动。</p>}
    {baseline?.results[0] && run?.results[0] && JSON.stringify(baseline.results[0].sampling)!==JSON.stringify(run.results[0].sampling) && <p className="text-amber-200 text-xs">两次试玩的实际采样参数不同，结果不能只归因于规则改动。</p>}
    <div className={baseline?'grid gap-3 md:grid-cols-2':'space-y-3'}>{baseline && show(baseline,'对照 A')}{run && show(run,'本次')}</div>
    {run && <><label className="block">本次试玩评语<textarea disabled={running} className={field} rows={3} value={run.note} onChange={e=>setRun({...run,note:e.target.value})}/></label><button className={button} onClick={()=>downloadJson({format:'noval-playtest-v1',baseline,run},'试玩对照.json')}>导出试玩记录</button></>}
  </section>;
}
