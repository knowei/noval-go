import type { ModelSettings, StoryDeck, Turn } from './types';
import { allRules, buildSessionPrompt, estimateTokens, parseSessionOutput, resolveSnapshot, SessionSettings, PromptReport } from './sessionEngine';
import { applyTextRules } from './textRules';
import { applyStateRules } from './stateRules';
import { processReplyExtensions } from './extensionRuntime';
import { streamCompletion } from './streamCompletion';
import { inspectReply } from './storyDiagnostics';

const CONTINUATION_INSTRUCTION='这是同一条回复的断点补全，不是下一轮剧情。上一条助手消息是已收到的原始前缀。仅输出它后面缺失的部分，不重复已有正文，不另起开场，不代替玩家新增行动。若断在词句、引号或 JSON 内，直接从断点续接并正确闭合；补齐必要的状态、记忆和行动选项后，以 <reply_end/> 结束。不要重新执行一次回合事件。';

export async function prepareSessionRequest(deck: StoryDeck, history: Turn[], settings: SessionSettings, lore = deck.lorebook, continuationPrefix?: string) {
  const reserve=continuationPrefix === undefined ? 0 : estimateTokens(continuationPrefix)+estimateTokens(CONTINUATION_INSTRUCTION)+16;
  const report = buildSessionPrompt(deck, history, settings, lore, reserve);
  for (const message of report.messages) {
    const result = await applyTextRules(message.content, allRules(settings), 'prompt');
    message.content = result.text; report.warnings.push(...result.warnings);
  }
  report.estimatedTokens = report.messages.reduce((sum, m) => sum + estimateTokens(m.content) + 8, 0);
  if (report.estimatedTokens + settings.responseTokens + 512 > settings.contextTokens) throw new Error('正则处理后的提示词超出上下文预算，请调整规则或容量。');
  return continuationPrefix === undefined ? report : prepareReplyContinuation(report,continuationPrefix);
}

export async function completeSessionReply(raw: string, history: Turn[], settings: SessionSettings, requireEndMarker = false): Promise<Turn> {
  const parsed = parseSessionOutput(raw, settings.options, requireEndMarker);
  if (settings.stateFields.length && !parsed.incomplete) {
    const result = applyStateRules(resolveSnapshot(history).state, parsed.status || {}, settings.stateFields, settings.stateEvents);
    parsed.status = result.state;
    parsed.runtimeWarnings = [...(parsed.runtimeWarnings || []), ...result.warnings, ...result.triggered.map(n => `事件已执行：${n}`)];
  }
  const display = await applyTextRules(processReplyExtensions(parsed.story || '', settings.extensions), allRules(settings), 'display');
  return { ...parsed, isUser: false, incomplete: Boolean(parsed.incomplete), displayText: display.text, runtimeWarnings: [...(parsed.runtimeWarnings || []), ...display.warnings] };
}

export function prepareReplyContinuation(report: PromptReport, prefix: string): PromptReport {
  if (!prefix.trim()) throw new Error('原回复没有可补全的内容，请重新生成。');
  const messages = [...report.messages,
    {role:'assistant' as const,content:prefix},
    {role:'user' as const,content:CONTINUATION_INSTRUCTION},
  ];
  const estimatedTokens=messages.reduce((sum,m)=>sum+estimateTokens(m.content)+8,0);
  if(estimatedTokens+report.settings.responseTokens+512>report.settings.contextTokens) throw new Error('补全所需的原文超出上下文容量。请增加上下文容量、降低回复上限，或重新生成本幕。');
  return {...report,messages,estimatedTokens};
}

export async function runPlaytestTurn(args: { deck: StoryDeck; history: Turn[]; settings: SessionSettings; model: ModelSettings; input: string; siteToken?: string | null; signal: AbortSignal }) {
  const { deck, settings, model, signal } = args;
  signal.throwIfAborted();
  const base = (model.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const url = new URL(base);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('模型地址格式无效，请检查模型设置');
  if (!model.model.trim() || !model.apiKey?.trim() && url.hostname === 'api.openai.com') throw new Error('尚未配置可用模型，请先在设置中填写模型地址与密钥。');
  if (!args.input.trim()) throw new Error('请输入试玩行动');
  const history = [...args.history, { isUser: true, text: args.input }];
  const report = await prepareSessionRequest(deck, history, settings);
  signal.throwIfAborted();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey || ''}` };
  if (args.siteToken) headers['x-site-token'] = args.siteToken;
  const apiModel = url.hostname === 'api.deepseek.com' && ['deepseek-flash', 'deepseek-v4-pro'].includes(model.model) ? 'deepseek-chat' : model.model;
  const sampling = { temperature: settings.sampling.temperature ?? model.temperature ?? 0.7, topP: settings.sampling.topP ?? model.topP ?? 0.95, maxTokens: settings.responseTokens };
  const start = Date.now();
  const response = await fetch(`/proxy?target=${encodeURIComponent(base + '/chat/completions')}`, {
    method: 'POST', credentials: 'include', headers, signal,
    body: JSON.stringify({ model: apiModel, messages: report.messages, temperature: sampling.temperature, top_p: sampling.topP, max_tokens: sampling.maxTokens, stream: true }),
  });
  // Upstream bodies can contain echoed credentials; do not put them in exported reports.
  if (!response.ok) throw new Error(`模型请求失败（HTTP ${response.status}），请检查连接、权限或模型名称。`);
  if (!response.body) throw new Error('模型没有返回可读回复');
  let raw = '';
  for await (const delta of streamCompletion(response.body)) { signal.throwIfAborted(); raw += delta; }
  signal.throwIfAborted();
  if (!raw.trim()) throw new Error('模型返回了空回复');
  const reply = await completeSessionReply(raw, history, settings, true);
  signal.throwIfAborted();
  return { reply, report, elapsedMs: Date.now() - start, issues: inspectReply(history, reply), model: apiModel, sampling };
}
