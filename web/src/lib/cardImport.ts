import type { LoreEntry, StoryDeck, Turn } from './types';
import { normalizeSession, TextRule, validateRule } from './sessionEngine';
import { safeMediaUrl, SceneAsset } from './mediaRuntime';
import { safeRandomUUID } from './uuid';

type RecordValue = Record<string, unknown>;
function record(v: unknown): RecordValue { return v && typeof v === 'object' && !Array.isArray(v) ? v as RecordValue : {}; }
function text(v: unknown) { return typeof v === 'string' ? v : ''; }
function strings(v: unknown): string[] { return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; }
export interface ImportResult { deck: StoryDeck; warnings: string[]; history?: Turn[] }

export function importCard(value: unknown, id: string = `local_${safeRandomUUID()}`): ImportResult {
  const root = record(value);
  const warnings: string[] = [];
  if (root.format === 'noval-session-v1' || root.format === 'noval-deck-v1') {
    const deck = record(root.deck);
    if (!text(deck.title)) throw new Error('备份缺少剧本名称');
    const restored = { ...deck, id, sessionDefaults: normalizeSession(record(root.session || deck.sessionDefaults)) } as unknown as StoryDeck;
    const history = Array.isArray(root.history) ? root.history.filter(t => t && typeof t === 'object').map(t => ({ ...t })) as Turn[] : undefined;
    if (history?.[0]) history[0] = { ...history[0], session: normalizeSession(record(root.session || history[0].session)) };
    return { deck: restored, warnings, history };
  }
  if (root.spec && !['chara_card_v2', 'chara_card_v3'].includes(String(root.spec))) throw new Error(`暂不支持 ${String(root.spec)}，请导出为 V2 / V3 或普通角色卡 JSON。`);
  const card = root.spec ? record(root.data) : root;
  const name = text(card.name);
  if (!name.trim()) throw new Error('不是有效的角色卡：缺少 name 字段');
  const book = record(card.character_book);
  const entries = Array.isArray(book.entries) ? book.entries : [];
  const lore: LoreEntry[] = entries.map((value, i) => {
    const entry = record(value);
    const ext = record(entry.extensions);
    if (entry.use_regex || ext.delay || ext.sticky || ext.cooldown || ext.delay_until_recursion) warnings.push(`世界书「${text(entry.name) || i + 1}」的正则关键词或延迟/持续触发需手动适配。`);
    return {
      id: `card_lore_${String(entry.id ?? i)}`, title: text(entry.name) || text(entry.comment) || `词条 ${i + 1}`,
      keys: strings(entry.keys), content: text(entry.content), enabled: entry.enabled !== false,
      constant: entry.constant === true, priority: typeof entry.insertion_order === 'number' ? -entry.insertion_order : 0,
      scanDepth: typeof book.scan_depth === 'number' ? book.scan_depth : 6,
      position: entry.position === 'after_char' ? 'late' : 'early',
      secondaryKeys: entry.selective ? strings(entry.secondary_keys) : [],
      secondaryMode: (['andAny', 'notAll', 'notAny', 'andAll'] as const)[Number(ext.selectiveLogic) || 0] || 'andAny',
      probability: ext.useProbability === false ? 100 : typeof ext.probability === 'number' ? ext.probability : 100,
      group: text(ext.group), groupWeight: typeof ext.groupWeight === 'number' ? ext.groupWeight : 100, groupPriority: ext.groupOverride === true,
      recursive: book.recursive_scanning === true && ext.prevent_recursion !== true,
      excludeRecursion: ext.exclude_recursion === true,
    };
  });
  const extensions = record(card.extensions);
  const rules: TextRule[] = [];
  if (Array.isArray(extensions.regex_scripts)) {
    for (const [i, value] of extensions.regex_scripts.entries()) {
      const r = record(value);
      // Map only isolated display rules; other placements have different ST semantics.
      if (!r.markdownOnly || r.promptOnly || !Array.isArray(r.placement) || r.placement.length !== 1 || r.placement[0] !== 2 || r.runOnEdit || r.minDepth != null || r.maxDepth != null || r.substituteRegex || Array.isArray(r.trimStrings) && r.trimStrings.length) {
        warnings.push(`正则「${text(r.scriptName) || i + 1}」作用范围需要适配，未启用。`); continue;
      }
      const pattern = text(r.findRegex);
      const literal = pattern.match(/^\/([\s\S]*)\/([a-z]*)$/);
      const rule: TextRule = { id: `card_rule_${i}`, name: text(r.scriptName) || `规则 ${i + 1}`, pattern: literal?.[1] || pattern, flags: literal?.[2] || 'g', replacement: text(r.replaceString).replaceAll('{{match}}', () => '$&'), scope: 'display', enabled: false };
      try { validateRule(rule); rules.push(rule); } catch { warnings.push(`正则「${rule.name}」无效，已跳过。`); }
    }
    if (rules.length) warnings.push('已转换的显示正则默认关闭，请在会话工作台测试后启用。');
  }
  if (Object.keys(extensions).some(k => k !== 'regex_scripts')) warnings.push('扩展原始数据已保留；酒馆脚本、助手及自定义扩展未执行。');
  if (Object.keys(book).length) warnings.push('世界书位置映射为背景区/最近消息后，递归扫描最多 4 层；酒馆的精确消息深度位置、正则关键词和持续触发尚未兼容。');
  const assets: SceneAsset[] = [];
  for (const [i, value] of (Array.isArray(card.assets) ? card.assets : []).entries()) {
    const asset = record(value), url = safeMediaUrl(asset.uri);
    if (!url) { warnings.push(`资源「${text(asset.name) || i + 1}」需要单独配置文件地址，源数据已保留。`); continue; }
    if (['icon','emotion','background','music'].includes(text(asset.type))) assets.push({ id: `asset_${i}`, label: text(asset.name) || '资源', kind: asset.type === 'background' ? 'background' : asset.type === 'music' ? 'music' : 'portrait', url, field: asset.type === 'emotion' ? 'emotion' : '', value: asset.type === 'emotion' ? text(asset.name) : '' });
  }
  if (assets.length) warnings.push('立绘与背景资源已加入“视听”，默认关闭。');
  if (strings(card.group_only_greetings).length) warnings.push('群聊专属开场保留在原卡中，单人会话不使用。');
  const prompt = [text(card.system_prompt), text(card.description), text(card.personality), text(card.scenario)].filter(Boolean).join('\n\n');
  const greeting = text(card.first_mes);
  return {
    deck: {
      id, title: name, characterName: text(card.nickname) || name, coverIcon: '📚', desc: text(card.creator_notes),
      systemPrompt: prompt, exampleDialogue: text(card.mes_example), postHistoryInstructions: text(card.post_history_instructions),
      alternateGreetings: [greeting, ...strings(card.alternate_greetings)].filter(Boolean),
      firstTurnDemo: greeting ? { story: greeting, runtimeVersion: 1, branches: [] } : undefined,
      lorebook: lore, sessionDefaults: normalizeSession({ rules, media: { enabled: false, speech: false, volume: 0.3, assets } }), sourceCard: value,
      handbook: { title: name, desc: text(card.creator_notes) || '导入的角色卡。可选择开场后自由输入。' },
    }, warnings,
  };
}

export async function readCharacterFile(file: File): Promise<unknown> {
  if (file.size > 10 * 1024 * 1024) throw new Error('文件超过 10 MB');
  if (!file.name.toLowerCase().endsWith('.png')) return JSON.parse(await file.text());
  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (signature.some((v, i) => bytes[i] !== v)) throw new Error('PNG 文件签名无效');
  const view = new DataView(bytes.buffer);
  let offset = 8;
  let legacy: unknown, modern: unknown;
  while (offset + 12 <= bytes.length) {
    const size = view.getUint32(offset);
    if (size > bytes.length - offset - 12) throw new Error('PNG 数据不完整');
    const type = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8));
    if (['tEXt', 'zTXt', 'iTXt'].includes(type)) {
      const chunk = bytes.slice(offset + 8, offset + 8 + size);
      const split = chunk.indexOf(0);
      const key = new TextDecoder().decode(chunk.slice(0, split));
      if (split >= 0 && ['chara', 'ccv3'].includes(key)) {
        let payload = chunk.slice(split + 1), compressed = false;
        if (type === 'zTXt') {
          if (payload[0] !== 0) throw new Error('PNG 压缩方式不支持');
          payload = payload.slice(1); compressed = true;
        }
        if (type === 'iTXt') {
          if (![0, 1].includes(payload[0]) || payload[1] !== 0) throw new Error('PNG 国际文本头无效');
          compressed = payload[0] === 1; payload = payload.slice(2);
          for (let i = 0; i < 2; i++) { const end = payload.indexOf(0); if (end < 0) throw new Error('PNG 国际文本头不完整'); payload = payload.slice(end + 1); }
        }
        if (compressed) {
          const reader = new Blob([payload]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
          const parts: Uint8Array[] = []; let length = 0;
          try {
            while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > 8 * 1024 * 1024) throw new Error('PNG 元数据解压后过大'); parts.push(part.value); }
          } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
          payload = new Uint8Array(length); let at = 0; for (const part of parts) { payload.set(part, at); at += part.length; }
        }
        const encoded = new TextDecoder().decode(payload);
        const decoded = encoded.trim().startsWith('{') ? encoded : new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0)));
        const card = JSON.parse(decoded);
        if (key === 'ccv3') modern = card; else legacy = card;
      }
    }
    offset += size + 12;
  }
  if (modern !== undefined || legacy !== undefined) return modern ?? legacy;
  throw new Error('PNG 中未找到 chara / ccv3 元数据。请使用原始角色卡 PNG 或导出 JSON。');
}

function libraryKey(user: string) { return `noval_private_cards_v1:${user}`; }
export function readPrivateCards(user: string): StoryDeck[] {
  if (typeof localStorage === 'undefined') return [];
  try { const data = JSON.parse(localStorage.getItem(libraryKey(user)) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; }
}
export function savePrivateCard(user: string, deck: StoryDeck) {
  const cards = readPrivateCards(user);
  localStorage.setItem(libraryKey(user), JSON.stringify([...cards.filter(d => d.id !== deck.id), deck]));
}

export function readPrivateCardTrash(user: string): StoryDeck[] { return readPrivateCards(user + ':trash'); }
export function movePrivateCardToTrash(user: string, id: string) {
  const deck = readPrivateCards(user).find(c => c.id === id);
  if (!deck) return;
  savePrivateCard(user + ':trash', deck);
  localStorage.setItem(libraryKey(user), JSON.stringify(readPrivateCards(user).filter(c => c.id !== id)));
}
export function restorePrivateCard(user: string, id: string) {
  const deck = readPrivateCardTrash(user).find(c => c.id === id);
  if (!deck) return;
  savePrivateCard(user, deck);
  localStorage.setItem(libraryKey(user + ':trash'), JSON.stringify(readPrivateCardTrash(user).filter(c => c.id !== id)));
}
