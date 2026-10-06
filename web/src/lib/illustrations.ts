import type { StoryDeck, Turn } from './types';
import { resolveSnapshot, normalizeSession } from './sessionEngine';
import { resolveMemory } from './memoryResolution';
import { extractStatusBlock } from './characterStatusParser';

export interface ImageSettings { baseUrl: string; model: string; apiKey: string; size: '1024x1024' | '1536x1024' | '1024x1536'; style: string }
export interface IllustrationMeta { source: string; conversationId: string; deckId: string; prompt: string; model: string; size: string; style: string; mode: string }
export interface Illustration { id: string; owner: string; storage: 'local' | 'cloud'; mime: string; metadata: IllustrationMeta; createdAt: string }

export const ANIME_STYLE_PRESETS = [
  {
    id: 'anime_cg',
    name: '🌸 日系二次元动漫CG（推荐）',
    prompt: '日系二次元动漫CG画风，精致动漫角色立绘，赛璐珞上色，轻小说插画品质，细腻唯美光影，动漫大师杰作，Japanese anime style, visual novel CG, anime masterpiece, vibrant cel shading, highly detailed anime characters, clean lineart, no text, no watermark',
  },
  {
    id: 'light_novel',
    name: '📖 恋爱轻小说唯美风',
    prompt: '日系恋爱轻小说彩色插画，唯美梦幻马卡龙色调，精致柔和光影，细腻笔触，浪漫氛围，Japanese light novel color illustration, romance anime aesthetic, soft pastel colors, delicate linework, highly detailed anime characters',
  },
  {
    id: 'shinkai',
    name: '🌅 新海诚光影风',
    prompt: '新海诚美学风格，极具通透感的云层与逆光，电影级超广角透视，细腻日系动画唯美场景，Makoto Shinkai style, cinematic anime lighting, beautiful sky and clouds, dramatic backlighting',
  },
  {
    id: 'cyber_anime',
    name: '🔮 赛博霓虹二次元',
    prompt: '赛博朋克二次元动漫CG，霓虹雨夜，全息光影与暗调对比，科幻机能美少女，Cyberpunk anime style, neon lighting, dark sci-fi aesthetic, detailed anime characters',
  },
  {
    id: 'manga_cover',
    name: '✒️ 经典黑白漫画扉页',
    prompt: '日系漫画典藏扉页插画，黑白网点与高对比度光影，极富张力的分镜线条，Japanese manga cover art, expressive line art, screen tone aesthetic, masterpiece',
  },
];

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = { 
  baseUrl: '', 
  model: '', 
  apiKey: '', 
  size: '1024x1024', 
  style: ANIME_STYLE_PRESETS[0].prompt 
};
export const MAX_IMAGE_BYTES = 16 * 1024 * 1024;

export function normalizeImageSettings(value: Partial<ImageSettings>): ImageSettings {
  let style = typeof value.style === 'string' ? value.style.slice(0, 1000) : DEFAULT_IMAGE_SETTINGS.style;
  // 自动将老旧的“水彩插画”或空配置平滑升级为高质量日系二次元风格
  if (!style || style.includes('水彩插画')) {
    style = DEFAULT_IMAGE_SETTINGS.style;
  }
  return { 
    baseUrl: typeof value.baseUrl === 'string' ? value.baseUrl.trim().replace(/\/+$/, '') : '', 
    model: typeof value.model === 'string' ? value.model.trim() : '', 
    apiKey: typeof value.apiKey === 'string' ? value.apiKey.trim() : '', 
    size: ['1024x1024','1536x1024','1024x1536'].includes(value.size || '') ? value.size! : '1024x1024', 
    style 
  };
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
  const rawStory = turn?.story || turn?.text || '';
  // 剥离状态栏与数值面板干扰，避免生图模型把面板数据/数字误绘进画面
  const cleanStory = extractStatusBlock(rawStory).cleanText;

  const visualGuidelines = mode === 'background'
    ? '【画面类型】纯日系动漫/Galgame场景背景CG，光影唯美通透，空间感与氛围感强烈，画面中严禁出现任何人物。'
    : '【画面类型】日系二次元轻小说/Galgame插画CG，精美动漫美少女/美少年角色，生动细致的面部表情与眼神微动作，动作姿态自然具有故事感与戏剧张力，构图考究，日系二次元动漫美学。';

  return [
    visualGuidelines,
    `【艺术画风】${style || DEFAULT_IMAGE_SETTINGS.style}`,
    `【作品剧本】《${deck.title}》`,
    `【当前场景与人物动态】${cleanStory.slice(0, 4000)}`,
    facts.length ? `【前情背景】${facts.slice(-6).map(f => f.text).join('；').slice(0, 1000)}` : '',
    '【画面纯净度与负面约束】绝对不要写实真人摄影风格，不要欧美粗粝漫画，不要粗糙涂鸦；画面中严禁出现任何中英文字体、对话框、水印、UI元素、面板图标。',
  ].filter(Boolean).join('\n\n').slice(0, 12000);
}

export function attachIllustration(history: Turn[], source: string, image: Illustration): Turn[] {
  // A discarded reply may still exist as a swipe. Never attach to a newer reply.
  const visit = (turn: Turn): Turn => {
    const swipes = turn.swipes?.map(s => s.imageOriginId === source ? { ...s, illustrations: [...(s.illustrations || []).filter(i=>i.id!==image.id), image] } : s);
    return { ...turn, ...(swipes ? { swipes } : {}), ...(turn.imageOriginId === source ? { illustrations: [...(turn.illustrations || []).filter(i=>i.id!==image.id), image] } : {}) };
  };
  return history.map(visit);
}
