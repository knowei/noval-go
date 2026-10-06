import type { Turn } from '@/lib/types';
import { inspectReplyEnvelope } from '@/lib/replyEnvelope';

export function ReplyCompletionNotice({ turn, busy, onRepair, onRetry, onBudget }: { turn: Turn; busy: boolean; onRepair: () => void; onRetry: () => void; onBudget: () => void }) {
  // 流式期间本组件一律不显示：提前返回，避免对每 100ms 都在增长的全文再跑一遍正则
  if (busy) return null;
  const health = inspectReplyEnvelope(turn.rawText || turn.story || '', turn.completion?.protocolVersion === 2);
  const incomplete = turn.incomplete || health.incomplete;
  const needsReview = incomplete || health.suspected;
  if (!needsReview && !turn.runtimeWarnings?.length) return null;
  return <aside role="status" className="mb-3 space-y-2 rounded-xl border border-amber-700 bg-amber-950 p-3 text-sm text-amber-100">
    {incomplete ? <p className="font-medium">本幕回复尚未通过完整性检查。已保留正文，状态和记忆暂不更新。</p> : health.suspected && <p className="font-medium">这条旧回复可能在正文中间结束，请检查。此提示依据文本结尾，不代表已确认后台截断。</p>}
    {turn.runtimeWarnings?.map((warning, index) => <p key={index} className="text-xs">{warning}</p>)}
    {health.malformed && !turn.incomplete && <p className="text-xs">检测到旧存档中的附加数据未完整结束，已隐藏正文里的数据残片。</p>}
    {needsReview && <>
      <div className="flex flex-wrap gap-2">
        {turn.completion?.reason !== 'content_filter' && <button className="rounded-lg border border-amber-700 px-3 py-1" onClick={onRepair}>补全这条回复</button>}
        <button className="rounded-lg border border-amber-700 px-3 py-1" onClick={onRetry}>重新生成本幕</button>
        <button className="rounded-lg border border-amber-700 px-3 py-1" onClick={onBudget}>调整回复预算</button>
      </div>
      <p className="text-xs">补全会从原文断点接收缺失内容，合并到同一条回复；重新生成会重写本幕。两者均会请求模型，并保留原版本和后续剧情分支。</p>
      <details><summary className="cursor-pointer text-xs">查看收到的原文与结束信息</summary>
        <p className="text-xs">网关结束原因：{turn.completion?.reason || '旧存档未记录'}；本次请求上限：{turn.completion?.responseTokens ?? '未记录'} Token</p>
        <p className="text-xs">完整结束校验：{turn.completion?.protocolVersion === 2 ? health.hasEndMarker ? '收到结束标记' : '未收到结束标记' : '旧回复未要求'}；本次新接收：{turn.completion?.receivedChars ?? (turn.rawText || turn.story || '').length} 字符；耗时：{turn.completion?.elapsedMs === undefined ? '未记录' : `${(turn.completion.elapsedMs/1000).toFixed(1)} 秒`}</p>
        <p className="text-xs">服务报告输出用量：{turn.completion?.usage?.completionTokens ?? '未提供'} Token；其中思考用量：{turn.completion?.usage?.reasoningTokens ?? '未提供'} Token。请求上限不等于实际用量。</p>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">{turn.rawText || turn.story}</pre>
      </details>
    </>}
  </aside>;
}
