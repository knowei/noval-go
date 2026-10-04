import type { Branch, LoreEntry, StoryDeck, Turn, TurnStatus } from './types';
import { retrieveMemory } from './memoryEngine';
import { applyStateRules, initialState, StateField, StateEvent, validateStateFields, validateStateEvents } from './stateRules';
import { ExtensionFeatures, extensionFeatures, extensionText, resolveExtensions } from './extensionRuntime';
import { normalizeMedia, SceneMedia } from './mediaRuntime';
import { memorySource, normalizeMemoryEntries, normalizeCorrections, resolveMemory, MemoryCorrection } from './memoryResolution';
import { inspectReplyEnvelope } from './replyEnvelope';

export interface TextRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  flags: string;
  scope: 'display' | 'prompt';
  enabled: boolean;
}

// Declarative extensions intentionally cannot run arbitrary browser scripts.
export interface SessionExtension extends ExtensionFeatures {
  id: string;
  name: string;
  version: string;
  apiVersion: 1;
  enabled: boolean;
  prompt?: string;
  rules?: TextRule[];
}

export interface SessionSettings {
  version: 1;
  mode: 'chat' | 'narrative' | 'adventure';
  pace: 'slow' | 'natural' | 'fast';
  length: 'short' | 'medium' | 'long';
  options: number;
  contextTokens: number;
  responseTokens: number;
  loreTokens: number;
  memoryTokens: number;
  persona: string;
  playerName: string;
  instructions: string;
  pinnedMemory: string;
  excludedMemories: string[];
  memoryCorrections: MemoryCorrection[];
  lore: LoreEntry[];
  rules: TextRule[];
  extensions: SessionExtension[];
  extensionBackups: SessionExtension[];
  memoryStrategy: 'relevant' | 'recent';
  stateFields: StateField[];
  stateEvents: StateEvent[];
  media: SceneMedia;
  sampling: { temperature?: number; topP?: number };
}

export interface MemoryFact { text: string; turn: number; key?: string; source?: string }
export interface SessionSnapshot { state: TurnStatus; memories: MemoryFact[] }
export interface PromptMessage { role: 'system' | 'user' | 'assistant'; content: string }
export interface PromptReport {
  messages: PromptMessage[];
  estimatedTokens: number;
  historyIncluded: number;
  historyOmitted: number;
  activeLore: LoreEntry[];
  warnings: string[];
  settings: SessionSettings;
  recalledMemory: MemoryFact[];
}

export const DEFAULT_SESSION: SessionSettings = {
  version: 1, mode: 'narrative', pace: 'natural', length: 'medium', options: 3,
  contextTokens: 16384, responseTokens: 2048, loreTokens: 1800, memoryTokens: 1600,
  persona: '', playerName: '玩家', instructions: '', pinnedMemory: '', excludedMemories: [], memoryCorrections: [], lore: [], rules: [], extensions: [],
  extensionBackups: [], memoryStrategy: 'relevant', stateFields: [], stateEvents: [],
  media: normalizeMedia(),
  sampling: {},
};

function bounded(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
}

export function normalizeSession(value?: Partial<SessionSettings>): SessionSettings {
  const v = value || {};
  let stateFields: StateField[] = [], stateEvents: StateEvent[] = [];
  try { stateFields = validateStateFields(v.stateFields || []); stateEvents = validateStateEvents(v.stateEvents || [], stateFields); } catch { /* Imported invalid rules remain inactive. */ }
  return {
    ...DEFAULT_SESSION, version: 1,
    mode: ['chat', 'narrative', 'adventure'].includes(v.mode || '') ? v.mode! : DEFAULT_SESSION.mode,
    pace: ['slow', 'natural', 'fast'].includes(v.pace || '') ? v.pace! : DEFAULT_SESSION.pace,
    length: ['short', 'medium', 'long'].includes(v.length || '') ? v.length! : DEFAULT_SESSION.length,
    options: bounded(v.options, 3, 0, 4),
    contextTokens: bounded(v.contextTokens, 16384, 4096, 262144),
    responseTokens: bounded(v.responseTokens, 2048, 256, 16384),
    loreTokens: bounded(v.loreTokens, 1800, 0, 16384),
    memoryTokens: bounded(v.memoryTokens, 1600, 0, 16384),
    persona: typeof v.persona === 'string' ? v.persona : '',
    playerName: typeof v.playerName === 'string' && v.playerName.trim() ? v.playerName.trim() : '玩家',
    instructions: typeof v.instructions === 'string' ? v.instructions : '',
    pinnedMemory: typeof v.pinnedMemory === 'string' ? v.pinnedMemory : '',
    excludedMemories: Array.isArray(v.excludedMemories) ? v.excludedMemories.filter(x => typeof x === 'string') : [],
    memoryCorrections: normalizeCorrections(v.memoryCorrections),
    lore: Array.isArray(v.lore) ? v.lore.filter(e => e && typeof e.id === 'string' && typeof e.content === 'string').map(e => ({ ...e, title: typeof e.title === 'string' ? e.title : e.id, keys: Array.isArray(e.keys) ? e.keys.filter(k => typeof k === 'string') : [], secondaryKeys: Array.isArray(e.secondaryKeys) ? e.secondaryKeys.filter(k=>typeof k==='string') : [], group: typeof e.group==='string'?e.group:'' })) : [],
    rules: Array.isArray(v.rules) ? v.rules.filter(r => { try { validateRule(r); return true; } catch { return false; } }) : [],
    extensions: Array.isArray(v.extensions) ? v.extensions.flatMap(e => { try { return [{ ...validateExtension(e), enabled: e.enabled === true }]; } catch { return []; } }) : [],
    extensionBackups: Array.isArray(v.extensionBackups) ? v.extensionBackups.flatMap(e => { try { return [validateExtension(e)]; } catch { return []; } }) : [],
    memoryStrategy: v.memoryStrategy === 'recent' ? 'recent' : 'relevant', stateFields, stateEvents,
    media: normalizeMedia(v.media),
    sampling: { temperature: typeof v.sampling?.temperature === 'number' && Number.isFinite(v.sampling.temperature) ? Math.max(0, Math.min(2, v.sampling.temperature)) : undefined, topP: typeof v.sampling?.topP === 'number' && Number.isFinite(v.sampling.topP) ? Math.max(0, Math.min(1, v.sampling.topP)) : undefined },
  };
}

// Conservative estimate, not a model-specific tokenizer. Reserve extra headroom below.
export function estimateTokens(text: string): number {
  let units = 0;
  for (const char of text) units += char.codePointAt(0)! > 127 ? 2 : 1 / 3;
  return Math.ceil(units);
}

export function resolveSnapshot(history: Turn[]): SessionSnapshot {
  let state: TurnStatus = initialState(history[0]?.session?.stateFields || []);
  const memories: MemoryFact[] = [];
  history.forEach((turn, index) => {
    if (!turn || turn.isError || turn.incomplete || turn.isUser || (turn.runtimeVersion === 1 && inspectReplyEnvelope(turn.rawText || turn.story || '', turn.completion?.protocolVersion === 2).incomplete)) return;
    if (turn.status) state = { ...state, ...validateState(turn.status) };
    const source = memorySource(index, JSON.stringify([turn.rawText || turn.story || turn.text || '', turn.memoryEntries || turn.memory]));
    normalizeMemoryEntries(turn.memoryEntries || turn.memory).forEach(entry => {
      const text = typeof entry === 'string' ? entry : entry.text;
      const key = typeof entry === 'string' ? undefined : entry.key;
      // Keyed updates may repeat an old value after an intervening change.
      if (key || !memories.some(m => !m.key && m.text === text)) memories.push({ text, turn: index + 1, key, source });
    });
  });
  const fields = normalizeSession(history[0]?.session).stateFields;
  return { state: fields.length ? applyStateRules({}, state, fields, []).state : state, memories };
}

export function validateState(value: unknown): TurnStatus {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: TurnStatus = {};
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
    if (typeof item === 'string' || typeof item === 'boolean' || item === null) result[key] = item;
    else if (typeof item === 'number' && Number.isFinite(item)) result[key] = item;
    else if (Array.isArray(item) && item.every(x => typeof x === 'string')) result[key] = [...item];
  }
  return result;
}

export function selectLore(entries: LoreEntry[], history: Turn[], budget: number, random = Math.random) {
  const active: LoreEntry[] = [];
  const considered = new Set<string>(), groups = new Set<string>();
  let used = 0, omitted = 0;
  for (let depth = 0; depth < 4; depth++) {
    const recursion = active.filter(e => e.recursive !== false).map(e => e.content).join('\n').toLowerCase();
    const candidates = entries.filter(e => {
      if (!e || considered.has(e.id) || e.enabled === false || typeof e.content !== 'string' || depth && e.excludeRecursion) return false;
      if (e.group && groups.has(e.group)) return false;
      const recent = history.filter(t => !t.isError && !t.incomplete).slice(-bounded(e.scanDepth, 6, 1, 100));
      const haystack = recent.map(t => t.text || t.story || '').join('\n').toLowerCase() + (depth ? '\n' + recursion : '');
      const matches = (keys: string[]) => keys.filter(k => k.trim()).map(k => haystack.includes(k.toLowerCase().trim()));
      if (!e.constant && !matches(e.keys || []).some(Boolean)) return false;
      const secondary = matches(e.secondaryKeys || []);
      if (!e.constant && secondary.length) {
        const mode = e.secondaryMode || 'andAny';
        if (!(mode === 'andAll' ? secondary.every(Boolean) : mode === 'notAny' ? !secondary.some(Boolean) : mode === 'notAll' ? !secondary.every(Boolean) : secondary.some(Boolean))) return false;
      }
      considered.add(e.id);
      return random() * 100 < bounded(e.probability, 100, 0, 100);
    }).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    let added = false;
    for (const entry of candidates) {
      if (entry.group && groups.has(entry.group)) continue;
      let chosen = entry;
      if (entry.group) {
        const peers = candidates.filter(e => e.group === entry.group);
        const priority = peers.filter(e => e.groupPriority);
        if (priority.length) chosen = priority[0];
        else {
          let roll = random() * peers.reduce((sum, e) => sum + bounded(e.groupWeight, 100, 1, 10000), 0);
          chosen = peers.find(e => (roll -= bounded(e.groupWeight, 100, 1, 10000)) < 0) || peers[0];
        }
        groups.add(entry.group);
      }
      const cost = estimateTokens(`[${chosen.title}] ${chosen.content}`);
      if (used + cost <= budget) { used += cost; active.push(chosen); added = true; } else omitted++;
    }
    if (!added) break;
  }
  return { active, omitted };
}

export function validateRule(rule: TextRule) {
  if (!rule || typeof rule.pattern !== 'string' || rule.pattern.length > 2000 || !rule.pattern) throw new Error('正则表达式为空或过长');
  if (!['display', 'prompt'].includes(rule.scope)) throw new Error('规则作用范围无效');
  if (typeof rule.replacement !== 'string' || typeof rule.flags !== 'string') throw new Error('规则字段无效');
  new RegExp(rule.pattern, rule.flags);
}

export function allRules(settings: SessionSettings) {
  return [...settings.rules, ...resolveExtensions(settings.extensions).active.flatMap(e => e.rules || [])];
}

export function validateExtension(value: unknown): SessionExtension {
  const v = value as SessionExtension;
  if (!v || v.apiVersion !== 1 || typeof v.id !== 'string' || !v.id || typeof v.name !== 'string' || typeof v.version !== 'string') {
    throw new Error('需要 Noval 扩展清单（apiVersion: 1、id、name、version）');
  }
  if (v.prompt !== undefined && typeof v.prompt !== 'string') throw new Error('扩展提示词必须是文本');
  if (v.rules !== undefined && !Array.isArray(v.rules)) throw new Error('扩展规则必须为数组');
  (v.rules || []).forEach(validateRule);
  if (JSON.stringify(v).length > 100000) throw new Error('扩展清单过大');
  return { id: v.id, name: v.name, version: v.version, apiVersion: 1, enabled: false, prompt: v.prompt, rules: v.rules || [], ...extensionFeatures(v) };
}

export function buildSessionPrompt(deck: StoryDeck, history: Turn[], input: SessionSettings, lore: LoreEntry[] = [], reservedInputTokens = 0): PromptReport {
  const settings = normalizeSession(input);
  const snapshot = resolveSnapshot(history);
  const loreMap = new Map([...lore, ...settings.lore].map(e => [e.id, e]));
  const { active, omitted } = selectLore([...loreMap.values()], history, settings.loreTokens);
  const mode = {
    chat: '以自然对话为主，保持角色说话习惯，允许闲聊和停顿。',
    narrative: '以互动小说叙事为主，兼顾对话、动作与环境，人物保持各自的目标和知识边界。',
    adventure: '以规则冒险为主，遵守已设定的资源和行动条件。资源不足时说明结果，不能凭空获得物品。',
  }[settings.mode];
  const pace = { slow: '细致停留在当前场景，等待玩家决定推进。', natural: '根据玩家行动自然推进，不强制每轮转场或制造冲突。', fast: '减少重复描写，优先回应行动结果并推进明确目标。' }[settings.pace];
  const length = { short: '简短回复，通常约100–250字。', medium: '适中回复，通常约300–600字。', long: '详细回复，通常约600–1000字；避免为了凑字数重复。' }[settings.length];
  const facts = resolveMemory(snapshot.memories, settings).active;
  const recalled = retrieveMemory(facts, [...history].reverse().find(t => t.isUser)?.text || '', settings.memoryTokens, estimateTokens, settings.memoryStrategy);
  const extensions = resolveExtensions(settings.extensions);
  const sections = [
    '你负责互动故事中的环境与非玩家角色。保持设定一致，不替玩家决定、说话或行动。',
    `故事：${deck.title}\n${deck.systemPrompt || deck.handbook?.desc || deck.desc || ''}`,
    deck.roles?.length ? `人物设定：\n${JSON.stringify(deck.roles)}` : '',
    deck.scenes?.length ? `场景设定：\n${JSON.stringify(deck.scenes)}` : '',
    deck.exampleDialogue ? `角色对话示例：\n${deck.exampleDialogue}` : '',
    `本次玩法：${mode}\n节奏：${pace}\n篇幅：${length}`,
    settings.persona ? `玩家设定：\n${settings.persona}` : '',
    settings.instructions ? `作者补充要求：\n${settings.instructions}` : '',
    active.filter(e => e.position !== 'late').map(e => `[${e.title}] ${e.content}`).join('\n'),
    settings.pinnedMemory ? `玩家确认的重要事实（优先于有冲突的自动记忆）：\n${settings.pinnedMemory}` : '',
    `当前状态：\n${JSON.stringify({ ...initialState(settings.stateFields), ...snapshot.state })}`,
    settings.stateFields.length ? `状态字段约束：\n${JSON.stringify(settings.stateFields)}\n只更新这些字段，遵守类型和范围。` : '',
    `相关历史事实：\n${recalled.text}`,
    '记忆仅记录已发生且可确认的事实，不把建议、猜测或尚未执行的行动记成已完成。玩家明确告知的身份、来意和目标，可记录为“玩家表示……”；物品放置、借出、接过、归还，以及许可条件的变化都属于重要事实，即使状态字段未变化也必须记录。变化中的同一事项写为 {"key":"稳定的事项名称","text":"最新事实"}，沿用已有事项名称，不为同一事项另起 key；同 key 的旧记录保留来源但不再作为当前事实发送。一次性事件继续使用字符串。当前状态代表现在，历史正文中的旧状态不代表现在。',
    ...extensions.active.map(e => `扩展「${e.name}」：\n${extensionText(e, [e.prompt, e.hooks?.beforePrompt].filter(Boolean).join('\n'))}`),
    '输出正文后，用 <state>JSON对象</state> 表示变化的状态字段（数值、文本、文本数组或null）。本轮有新重要事实或已有事项变化时，必须同时输出 <memory>JSON数组</memory>（字符串或包含 key 与 text 的对象）；没有新事实时才省略。记忆不能只留在正文里，否则旧正文超出上下文后会遗忘。无需输出思考过程。状态未改变时可省略 state；物品数组为完整当前列表。',
    settings.options ? `最后输出 <options>JSON字符串数组</options>，建议${settings.options}项可选行动，紧扣当前场景；玩家也可以自由输入。` : '无需输出行动选项。',
    `整条回复的输出预算为 ${settings.responseTokens} Token，正文和附加数据共用这一上限。请为状态、记忆、选项及闭合标签预留空间；预算紧张时缩短正文和选项描述，完整结束句子及所有数据标签。`,
    '输出协议：确认正文和所有附加数据完整闭合后，在整条回复最后单独输出 <reply_end/>。该标记用于验证传输完整性，不属于正文；未完成时不要提前输出它。',
  ];
  const macros = (s: string) => s.replace(/\{\{char\}\}/gi, () => deck.characterName || deck.title).replace(/\{\{user\}\}/gi, () => settings.playerName);
  const late = macros([...active.filter(e => e.position === 'late').map(e => `[${e.title}] ${e.content}`), deck.postHistoryInstructions || '', ...extensions.active.map(e => extensionText(e, e.hooks?.afterHistory))].filter(Boolean).join('\n'));
  const system: PromptMessage = { role: 'system', content: macros(sections.filter(Boolean).join('\n\n')) };
  const lateMessage: PromptMessage[] = late ? [{ role: 'system', content: `当前场景补充：\n${late}` }] : [];
  const usable = history.filter(t => t && !t.isError && !t.incomplete && (t.text || t.story) && !(t.runtimeVersion === 1 && inspectReplyEnvelope(t.rawText || t.story || '', t.completion?.protocolVersion === 2).incomplete));
  const allowance = settings.contextTokens - settings.responseTokens - 512 - Math.max(0, reservedInputTokens);
  let used = estimateTokens(system.content) + 8 + (late ? estimateTokens(late) + 24 : 0);
  const chosen: PromptMessage[] = [];
  for (let i = usable.length - 1; i >= 0; i--) {
    const t = usable[i];
    const content = t.isUser ? t.text || '' : t.story || t.text || '';
    const cost = estimateTokens(content) + 8;
    if (used + cost > allowance) {
      if (i === usable.length - 1) throw new Error('设定和最新消息超过上下文预算。请提高上下文容量，或缩短设定与输入。');
      break;
    }
    chosen.unshift({ role: t.isUser ? 'user' : 'assistant', content }); used += cost;
  }
  // Trim an orphan assistant response only when older history was omitted.
  if (chosen.length < usable.length && chosen.length > 1 && chosen[0].role === 'assistant') chosen.shift();
  if (used > allowance) throw new Error('设定超过上下文预算，请提高容量或缩短设定。');
  const messages = [system, ...chosen, ...lateMessage];
  return {
    messages, estimatedTokens: messages.reduce((n, m) => n + estimateTokens(m.content) + 8, 0),
    historyIncluded: chosen.length, historyOmitted: usable.length - chosen.length, activeLore: active,
    warnings: [...(omitted ? [`${omitted} 条命中的世界书超出预算，未发送。`] : []), ...extensions.warnings], settings, recalledMemory: recalled.selected,
  };
}

export function parseSessionOutput(rawText: string, options: number, requireEndMarker = false): Partial<Turn> {
  const warnings: string[] = [];
  const envelope = inspectReplyEnvelope(rawText, requireEndMarker);
  const read = (tag: string): unknown => {
    const block = envelope.blocks.find(b => b.tag === tag);
    if (!block) return undefined;
    try { return JSON.parse(block.content); } catch { warnings.push(`${tag} 格式无效，已保留原始回复。`); return undefined; }
  };
  const state = read('state');
  const memory = read('memory');
  const memoryEntries = normalizeMemoryEntries(memory);
  const choices = read('options');
  if (envelope.malformed) warnings.push('附加数据未完整结束，已隐藏残片并保留原文。');
  if (requireEndMarker && !envelope.hasEndMarker) warnings.push('未收到完整结束标记；即使网关报告正常结束，也暂不能确认这条回复完整。');
  if (requireEndMarker && options > 0 && (!Array.isArray(choices) || !choices.length)) warnings.push('没有收到约定的完整行动选项。');
  const incomplete = envelope.incomplete || requireEndMarker && warnings.length > 0;
  const branches: Branch[] = Array.isArray(choices) ? choices.filter(x => typeof x === 'string').slice(0, options).map(title => ({ title })) : [];
  return {
    rawText, story: envelope.story, incomplete,
    status: incomplete ? {} : validateState(state), memory: incomplete ? [] : memoryEntries.map(e => typeof e === 'string' ? e : e.text), memoryEntries: incomplete ? [] : memoryEntries,
    branches: incomplete ? [] : branches, runtimeVersion: 1, runtimeWarnings: warnings,
  };
}

export function selectReplyVersion(history: Turn[], index: number, version: number): Turn[] {
  const turn = history[index];
  const target = turn?.swipes?.[version];
  if (!target) return history;
  // Subsequent messages belong to the abandoned branch and must not leak into memory.
  return [...history.slice(0, index), { ...target, session: turn.session, swipes: turn.swipes, swipeIndex: version }];
}
