import type { StoryDeck, Turn } from './types';
import { resolveSnapshot, normalizeSession } from './sessionEngine';
import { resolveMemory } from './memoryResolution';

export interface ImageSettings { baseUrl: string; model: string; apiKey: string; size: '1024x1024' | '1536x1024' | '1024x1536'; style: string }
export interface IllustrationMeta { source: string; conversationId: string; deckId: string; prompt: string; model: string; size: string; style: string; mode: string }
export interface Illustration { id: string; owner: string; storage: 'local' | 'cloud'; mime: string; metadata: IllustrationMeta; createdAt: string }
export const DEFAULT_IMAGE_SETTINGS: ImageSettings = { baseUrl: '', model: '', apiKey: '', size: '1024x1024', style: '水彩插画，柔和光线，统一色调，无文字、无水印' };
export const MAX_IMAGE_BYTES = 16 * 1024 * 1024;

export function normalizeImageSettings(value: Partial<ImageSettings>): ImageSettings {
  return { baseUrl: typeof value.baseUrl === 'string' ? value.baseUrl.trim().replace(/\/+$/, '') : '', model: typeof value.model === 'string' ? value.model.trim() : '', apiKey: typeof value.apiKey === 'string' ? value.apiKey.trim() : '', size: ['1024x1024','1536x1024','1024x1536'].includes(value.size || '') ? value.size! : '1024x1024', style: typeof value.style === 'string' ? value.style.slice(0, 1000) : DEFAULT_IMAGE_SETTINGS.style };
}

export function imageRequest(settings: ImageSettings, prompt: string) {
  let url: URL;
  try { url = new URL(settings.baseUrl); } catch { throw new Error('请先填写有效的生图服务地址'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('生图地址应为不含密钥、查询参数的 HTTP(S) 地址');
  if (!settings.model) throw new Error('请先填写生图模型名称');
  if (!prompt.trim() || prompt.length > 12000) throw new Error('绘图描述需在 1–12000 字以内');
  return { target: settings.baseUrl.replace(/\/+$/, '') + '/images/generations', body: { model: settings.model, prompt, size: settings.size, n: 1, response_format: 'b64_json' } };
}

export function decodeGeneratedImage(value: unknown): Blob {
  const data = value as { data?: { b64_json?: unknown; url?: unknown }[] };
  const item = Array.isArray(data?.data) ? data.data[0] : undefined;
  if (typeof item?.b64_json !== 'string') {
    if (item?.url) throw new Error('服务只返回图片链接；第一版需要 b64_json 图片响应，请调整服务设置。');
    throw new Error('接口没有返回图片数据，请确认模型支持 Images API');
  }
  if (item.b64_json.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) throw new Error('单张图片超过 16 MB');
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(item.b64_json), c => c.charCodeAt(0)); } catch { throw new Error('返回的图片编码无效'); }
  const mime = bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71 && bytes[4]===13 && bytes[5]===10 && bytes[6]===26 && bytes[7]===10 ? 'image/png' : bytes[0]===255 && bytes[1]===216 && bytes[2]===255 ? 'image/jpeg' : String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP' ? 'image/webp' : '';
  if (!mime || !bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('只支持 16 MB 以内的 PNG、JPEG、WebP 图片');
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: mime });
}

export function illustrationPrompt(deck: StoryDeck, history: Turn[], index: number, style: string, mode: 'scene' | 'background') {
  const selected = history.slice(0, index + 1);
  const snapshot = resolveSnapshot(selected);
  const facts = resolveMemory(snapshot.memories, normalizeSession(selected[0]?.session)).active;
  const turn = selected.at(-1);
  return [
    mode === 'background' ? '为以下故事时刻绘制环境背景，不画人物。' : '为以下故事时刻绘制一幅剧情插画。',
    '只表现画面中能够看到的内容；不要把对白、记忆说明、界面文字绘制在图片里。不添加尚未发生的事件。',
    `作品：${deck.title}`,
    `画风：${style || DEFAULT_IMAGE_SETTINGS.style}`,
    `这一刻的状态：${JSON.stringify(snapshot.state)}`,
    `相关已确认事实：${facts.slice(-8).map(f=>f.text).join('；').slice(0,2000)}`,
    `所选回复：${(turn?.story || turn?.text || '').slice(0,6000)}`,
  ].join('\n\n').slice(0,12000);
}

export function attachIllustration(history: Turn[], source: string, image: Illustration): Turn[] {
  // A discarded reply may still exist as a swipe. Never attach to a newer reply.
  const visit = (turn: Turn): Turn => {
    const swipes = turn.swipes?.map(s => s.imageOriginId === source ? { ...s, illustrations: [...(s.illustrations || []).filter(i=>i.id!==image.id), image] } : s);
    return { ...turn, ...(swipes ? { swipes } : {}), ...(turn.imageOriginId === source ? { illustrations: [...(turn.illustrations || []).filter(i=>i.id!==image.id), image] } : {}) };
  };
  return history.map(visit);
}
