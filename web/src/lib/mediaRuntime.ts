export interface SceneAsset { id: string; label: string; kind: 'portrait' | 'background' | 'music'; url: string; field: string; value: string }
export interface SceneMedia { enabled: boolean; speech: boolean; volume: number; assets: SceneAsset[] }
export function safeMediaUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  if (/^\/(?!\/)[\w./%-]+$/.test(value)) return value;
  if (/^data:(image\/(png|jpeg|webp|gif)|audio\/(mpeg|ogg|wav));base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= 5_000_000) return value;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function normalizeMedia(value?: Partial<SceneMedia>): SceneMedia {
  return { enabled: value?.enabled === true, speech: value?.speech === true, volume: typeof value?.volume === 'number' && Number.isFinite(value.volume) ? Math.max(0, Math.min(1, value.volume)) : 0.3,
    assets: Array.isArray(value?.assets) ? value.assets.filter(a => a && typeof a.id === 'string' && typeof a.label === 'string' && ['portrait','background','music'].includes(a.kind) && typeof a.field === 'string' && typeof a.value === 'string' && safeMediaUrl(a.url)).slice(0, 60) : [] };
}
export function activeSceneAssets(media: SceneMedia, state: Record<string, unknown>) {
  const result: Partial<Record<SceneAsset['kind'], SceneAsset>> = {};
  if (!media.enabled) return result;
  for (const asset of media.assets) if (safeMediaUrl(asset.url) && (!asset.field || String(state[asset.field] ?? '') === asset.value)) result[asset.kind] = asset;
  return result;
}
