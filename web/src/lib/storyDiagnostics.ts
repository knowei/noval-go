import type { StoryDeck, Turn } from './types';
import { buildSessionPrompt, normalizeSession, SessionSettings } from './sessionEngine';
import { applyStateRules, validateStateFields, validateStateEvents } from './stateRules';

export interface Diagnostic { level: 'error' | 'warning' | 'info'; title: string; detail: string }
export function diagnoseStory(deck: StoryDeck, input: SessionSettings, history: Turn[] = []): Diagnostic[] {
  const items: Diagnostic[] = [];
  const add = (level: Diagnostic['level'], title: string, detail: string) => items.push({ level, title, detail });
  if (!(deck.systemPrompt || deck.handbook?.desc || deck.desc)?.trim()) add('warning', '缺少人物与场景设定', '补充角色身份、说话习惯、已知信息和开场目标。');
  if (!deck.firstTurnDemo?.story && !deck.firstTurnDemo?.text && !deck.alternateGreetings?.length) add('info', '尚未设置开场', '建议给出地点、眼前事件和一个可回应的问题。');
  if (!input.stateFields.length && input.mode === 'adventure') add('warning', '冒险玩法尚未声明状态规则', '为实际使用的资源设置初始值、类型和上下限；不要凭空添加剧本没有的资源。');
  try { validateStateEvents(input.stateEvents, validateStateFields(input.stateFields)); } catch (e) { add('error', '状态规则无效', e instanceof Error ? e.message : '请检查状态规则'); }
  const lore = [...new Map([...(deck.lorebook || []), ...input.lore].map(e => [e.id, e])).values()];
  for (const entry of lore.filter(e => e.enabled !== false)) {
    if (!entry.content.trim()) add('warning', `世界书「${entry.title}」没有内容`, '补充有效背景或停用此词条。');
    if (!entry.constant && !entry.keys.some(k => k.trim())) add('warning', `世界书「${entry.title}」无法触发`, '设置主关键词，或将确实需要一直发送的内容设为常驻。');
  }
  const macros = (deck.systemPrompt || '').match(/\{\{[^{}]+\}\}/g) || [];
  if (macros.some(m => !/^\{\{(char|user)\}\}$/i.test(m))) add('warning', '设定含未支持的宏', '目前只替换 char / user；请检查导入卡片中的变量和脚本依赖。');
  try {
    const probe = history.length ? history : [{ isUser: true, text: '观察当前场景，等待对方回应。' }];
    const report = buildSessionPrompt(deck, probe, input, deck.lorebook);
    report.warnings.forEach(w => add('warning', '请求检查', w));
    add('info', '当前提示词预算', `输入约 ${report.estimatedTokens} Token，保留 ${report.historyIncluded} 条历史，省略 ${report.historyOmitted} 条。此处尚未应用发送正则。`);
  } catch (e) { add('error', '无法构建请求', e instanceof Error ? e.message : '设定超出预算'); }
  return items;
}

export const LIGHTHOUSE_DECK: StoryDeck = {
  id: 'lighthouse_sample', title: '灯塔来信 · 连贯性样例', characterName: '守塔人',
  desc: '海岸灯塔中的一封旧信。用于检验线索、物品归属和人物知识边界。',
  systemPrompt: '守塔人沈舟，四十二岁，耐心谨慎，回答简洁。他只知道自己亲历或旅人明确告知的事情。旅人是来调查航海日志的成年人。场景始于灯塔入口。铜钥匙起初由沈舟保管，能打开二楼书房。书房里的航海日志不能凭空出现在入口。旅人的选择与对白由玩家决定。收下或归还物品时更新完整 inventory；用稳定的 key 铜钥匙归属 记录其当前持有者。不得把尚未执行的计划记成事实。',
  firstTurnDemo: { story: '海雾笼住灯塔。沈舟放下油灯，桌边是一封未拆的旧信。“你来查那本航海日志？它在二楼书房。”铜钥匙仍挂在他的腰间。', status: { location: '灯塔入口', inventory: [], stamina: 80 }, memory: ['铜钥匙由守塔人沈舟保管'], memoryEntries: [{ key: '铜钥匙归属', text: '铜钥匙由守塔人沈舟保管' }] },
  lorebook: [{ id: 'lighthouse-study', title: '二楼书房', keys: ['书房', '日志', '钥匙'], content: '二楼书房上锁，需要沈舟保管的铜钥匙。航海日志记载三十年前的航线，不含旅人的私人经历。', enabled: true }],
  sessionDefaults: {
    mode: 'adventure', pace: 'slow', length: 'short', options: 2,
    stateFields: [
      { key: 'location', label: '位置', type: 'string', initial: '灯塔入口' },
      { key: 'inventory', label: '随身物品', type: 'list', initial: [] },
      { key: 'stamina', label: '体力', type: 'number', initial: 80, min: 0, max: 100 },
    ],
    instructions: '未移动时不换场景，未行动时不扣体力。普通问答不必增加事件。',
  },
};

export const LIGHTHOUSE_ACTIONS = [
  '我想借铜钥匙去查日志，先询问沈舟是否愿意借给我。我还没有拿走钥匙。',
  '如果他同意，我接过铜钥匙，留在入口确认它能打开哪扇门；若尚未同意就继续等待。',
  '如果钥匙在我手里，我把它还给沈舟，不去书房；否则我不接钥匙。',
  '现在铜钥匙由谁保管？我有哪些随身物品？我是否已经去过书房？沈舟知道我的家乡吗？',
];

export function startPlaytest(deck: StoryDeck, settings: SessionSettings): Turn[] {
  return [storyOpenings(deck, settings)[0] || { story: `故事开始：${deck.title}`, session: normalizeSession(settings), isUser: false }];
}

export function storyOpenings(deck: StoryDeck, input: SessionSettings): Turn[] {
  const settings = normalizeSession(input);
  const demo = deck.firstTurnDemo;
  const initial: Turn[] = demo?.story || demo?.text ? [demo] : [];
  const seen = new Set(initial.map(t => t.story || t.text));
  for (const story of deck.alternateGreetings || []) if (story.trim() && !seen.has(story)) { initial.push({ story }); seen.add(story); }
  return initial.map(turn => ({
    story: (turn.story || turn.text || '').replace(/\{\{char\}\}/gi, () => deck.characterName || deck.title).replace(/\{\{user\}\}/gi, () => settings.playerName),
    status: settings.stateFields.length ? applyStateRules({}, turn.status || {}, settings.stateFields, []).state : turn.status,
    memory: turn.memory, memoryEntries: turn.memoryEntries, branches: turn.branches,
    session: settings, runtimeVersion: 1, isUser: false,
  }));
}

export function inspectReply(history: Turn[], reply: Turn): string[] {
  const issues = [...(reply.runtimeWarnings || [])];
  const text = (reply.story || '').replace(/\s/g, '');
  const previous = [...history].reverse().find(t => !t.isUser && !t.isError && !t.incomplete);
  if (!text) issues.push('正文为空');
  if (text && text === (previous?.story || '').replace(/\s/g, '')) issues.push('正文与上次回复完全相同');
  return issues;
}
