import { fetchConversation, fetchStory } from './api';
import type { StoryDeck, Turn } from './types';

/**
 * 对话存档导入 / 导出。
 *
 * 用途：把本地实例上聊过的会话连剧本一起搬到另一台服务器接着聊。
 * 一个 .json 文件同时携带会话历史与它依赖的剧本设定，导入端按需补齐剧本，
 * 因此不会出现「会话有了但剧本不存在」的断链。
 */

export const BUNDLE_FORMAT = 'noval-go.conversation';
export const BUNDLE_VERSION = 1;

export interface ConversationBundle {
  format: typeof BUNDLE_FORMAT;
  version: number;
  exportedAt: string;
  conversation: {
    id: string;
    deck_id: string;
    deck_title: string;
    title: string;
    history: Turn[];
    turn_count?: number;
    created_at?: string;
    updated_at?: string;
  };
  /** 会话依赖的剧本设定；导出时取不到则为 null（导入端会提示剧本缺失） */
  deck: StoryDeck | Record<string, unknown> | null;
}

export type ImportResult =
  | { ok: true; conversationId: string; deckId: string; turns: number; deckAction: 'kept' | 'created' | 'missing' }
  | { ok: false; error: string };

function safeFileName(text: string) {
  return (text || 'conversation').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40);
}

/** 导出指定会话为可下载的 JSON 文件。 */
export async function exportConversationBundle(convId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const conversation = await fetchConversation(convId);
    if (!conversation) return { ok: false, error: '读取会话失败，可能已被删除。' };

    let deck: StoryDeck | Record<string, unknown> | null = null;
    if (conversation.deck_id) {
      deck = (await fetchStory(conversation.deck_id)) as unknown as StoryDeck | null;
    }

    const bundle: ConversationBundle = {
      format: BUNDLE_FORMAT,
      version: BUNDLE_VERSION,
      exportedAt: new Date().toISOString(),
      conversation: {
        id: conversation.id,
        deck_id: conversation.deck_id,
        deck_title: conversation.deck_title || '',
        title: conversation.title || '',
        history: Array.isArray(conversation.history) ? conversation.history : [],
        turn_count: conversation.turn_count,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      },
      deck: deck || null,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noval-${safeFileName(bundle.conversation.title || bundle.conversation.deck_title)}-${bundle.conversation.history.length}幕.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** 解析并校验一个导入文件的内容。 */
export function parseBundle(rawText: string): { ok: true; bundle: ConversationBundle } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: '文件不是合法的 JSON。' };
  }
  if (!parsed || typeof parsed !== 'object') return { ok: false, error: '文件内容不是一个对象。' };

  const data = parsed as Partial<ConversationBundle>;
  if (data.format !== BUNDLE_FORMAT) {
    return { ok: false, error: `不是本项目的对话存档文件（format 应为 ${BUNDLE_FORMAT}）。` };
  }
  if (typeof data.version === 'number' && data.version > BUNDLE_VERSION) {
    return { ok: false, error: `存档版本 ${data.version} 高于当前支持的 ${BUNDLE_VERSION}，请升级后再导入。` };
  }
  const conv = data.conversation;
  if (!conv || typeof conv !== 'object') return { ok: false, error: '存档缺少 conversation 字段。' };
  if (typeof conv.deck_id !== 'string' || !conv.deck_id) return { ok: false, error: '存档缺少 deck_id，无法定位剧本。' };
  if (!Array.isArray(conv.history)) return { ok: false, error: '存档缺少 history 数组。' };

  return {
    ok: true,
    bundle: {
      format: BUNDLE_FORMAT,
      version: data.version ?? BUNDLE_VERSION,
      exportedAt: data.exportedAt || new Date().toISOString(),
      conversation: {
        id: typeof conv.id === 'string' && conv.id ? conv.id : '',
        deck_id: conv.deck_id,
        deck_title: conv.deck_title || '',
        title: conv.title || '',
        history: conv.history.filter((t): t is Turn => Boolean(t && typeof t === 'object')),
        turn_count: conv.turn_count,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      },
      deck: (data.deck as StoryDeck | null) ?? null,
    },
  };
}

async function deckExists(deckId: string): Promise<boolean> {
  try {
    const resp = await fetch(`/api/stories?id=${encodeURIComponent(deckId)}`);
    return resp.ok;
  } catch {
    return false;
  }
}

async function conversationExists(convId: string): Promise<boolean> {
  if (!convId) return false;
  try {
    const resp = await fetch(`/api/conversations?id=${encodeURIComponent(convId)}`);
    return resp.ok;
  } catch {
    return false;
  }
}

function newId(prefix: string) {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/**
 * 导入存档：按需补齐剧本，然后写入会话。
 *
 * 安全约定：
 * - 剧本已存在则原样保留，绝不覆盖服务器上已有的剧本；
 * - 会话 id 已存在时改用新 id，避免覆盖服务器上的同名存档。
 */
export async function importConversationBundle(
  bundle: ConversationBundle,
  targetUserId: string,
): Promise<ImportResult> {
  const deckId = bundle.conversation.deck_id;
  let deckAction: 'kept' | 'created' | 'missing' = 'kept';

  if (await deckExists(deckId)) {
    deckAction = 'kept';
  } else if (bundle.deck) {
    try {
      const resp = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // skipPlaza：导入的私人测试剧本不应出现在广场卡片列表中
        body: JSON.stringify({ id: deckId, skipPlaza: true, story: { ...bundle.deck, id: deckId } }),
      });
      if (!resp.ok) return { ok: false, error: `创建剧本失败（HTTP ${resp.status}）。` };
      deckAction = 'created';
    } catch (e) {
      return { ok: false, error: `创建剧本时出错：${String(e)}` };
    }
  } else {
    deckAction = 'missing';
  }

  const originalId = bundle.conversation.id;
  const keepId = originalId && !(await conversationExists(originalId));
  const convId = keepId ? originalId : newId('conv');

  try {
    const resp = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: convId,
        user_id: targetUserId,
        deck_id: deckId,
        deck_title: bundle.conversation.deck_title || '',
        title: bundle.conversation.title || '导入的存档',
        history: bundle.conversation.history,
      }),
    });
    if (!resp.ok) return { ok: false, error: `写入会话失败（HTTP ${resp.status}）。` };
  } catch (e) {
    return { ok: false, error: `写入会话时出错：${String(e)}` };
  }

  return { ok: true, conversationId: convId, deckId, turns: bundle.conversation.history.length, deckAction };
}

/** 从 <input type="file"> 选中的文件里读取并导入。 */
export async function importConversationFile(file: File, targetUserId: string): Promise<ImportResult> {
  let text: string;
  try {
    text = await file.text();
  } catch (e) {
    return { ok: false, error: `读取文件失败：${String(e)}` };
  }
  const parsed = parseBundle(text);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  return importConversationBundle(parsed.bundle, targetUserId);
}
