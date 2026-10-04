import type { SessionExtension } from './sessionEngine';

export interface ExtensionFeatures {
  dependencies?: { id: string; minVersion?: string }[];
  defaults?: Record<string, string | number | boolean>;
  config?: Record<string, string | number | boolean>;
  migrations?: { from: string; rename: Record<string, string> }[];
  hooks?: { beforePrompt?: string; afterHistory?: string; replyPrefix?: string; replySuffix?: string };
}
const validKey = (key: string) => /^[a-zA-Z0-9_-]{1,64}$/.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key);
function config(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([k, v]) => validKey(k) && (typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v))));
}
export function extensionFeatures(v: ExtensionFeatures): ExtensionFeatures {
  if (v.dependencies !== undefined && (!Array.isArray(v.dependencies) || v.dependencies.some(d => !d || typeof d.id !== 'string' || !validKey(d.id) || d.minVersion !== undefined && !/^\d+(\.\d+){0,2}$/.test(d.minVersion)))) throw new Error('扩展依赖需包含 ID 和可选的最低版本号');
  if (v.hooks && (typeof v.hooks !== 'object' || Object.values(v.hooks).some(x => x !== undefined && typeof x !== 'string'))) throw new Error('扩展阶段内容必须为文本');
  if (v.migrations !== undefined && (!Array.isArray(v.migrations) || v.migrations.some(m => !m || typeof m.from !== 'string' || !m.rename || typeof m.rename !== 'object' || Array.isArray(m.rename) || Object.entries(m.rename).some(([a,b]) => !validKey(a) || typeof b !== 'string' || !validKey(b))))) throw new Error('配置迁移格式无效');
  const defaults = config(v.defaults);
  const supplied = config(v.config);
  return { dependencies: v.dependencies || [], defaults, config: Object.fromEntries(Object.entries(defaults).map(([k, value]) => [k, typeof supplied[k] === typeof value ? supplied[k] : value])), migrations: v.migrations || [], hooks: v.hooks ? { beforePrompt: v.hooks.beforePrompt, afterHistory: v.hooks.afterHistory, replyPrefix: v.hooks.replyPrefix, replySuffix: v.hooks.replySuffix } : {} };
}

function meets(actual: string, minimum: string) {
  if (!/^\d+(\.\d+){0,2}$/.test(actual)) return false;
  const a = actual.split('.').map(Number), b = minimum.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); }
  return true;
}

export function resolveExtensions(extensions: SessionExtension[]) {
  const active: SessionExtension[] = [];
  const warnings: string[] = [];
  const states = new Map<string, boolean>();
  const byId = new Map(extensions.map(e => [e.id, e]));
  const visit = (extension: SessionExtension, path: string[]): boolean => {
    if (states.has(extension.id)) return states.get(extension.id)!;
    if (path.includes(extension.id)) { warnings.push(`扩展依赖形成循环：${[...path, extension.id].join(' → ')}`); return false; }
    for (const dep of extension.dependencies || []) {
      const found = byId.get(dep.id);
      if (!found?.enabled || dep.minVersion && !meets(found.version, dep.minVersion) || !visit(found!, [...path, extension.id])) {
        warnings.push(`「${extension.name}」未执行：依赖 ${dep.id}${dep.minVersion ? ' ≥ ' + dep.minVersion : ''} 未满足。`);
        states.set(extension.id, false); return false;
      }
    }
    states.set(extension.id, true); active.push(extension); return true;
  };
  extensions.filter(e => e.enabled).forEach(e => visit(e, []));
  return { active, warnings: [...new Set(warnings)] };
}

export function extensionText(extension: SessionExtension, text = '') {
  return text.replace(/\{\{config\.([a-zA-Z0-9_-]+)\}\}/g, (_, key) => String(extension.config?.[key] ?? extension.defaults?.[key] ?? ''));
}

export function upgradeExtension(previous: SessionExtension | undefined, next: SessionExtension): SessionExtension {
  const migrated = { ...(previous?.config || {}) };
  for (const migration of next.migrations || []) if (previous?.version === migration.from) {
    for (const [from, to] of Object.entries(migration.rename)) if (Object.hasOwn(migrated, from)) { migrated[to] = migrated[from]; delete migrated[from]; }
  }
  return { ...next, ...extensionFeatures({ ...next, config: migrated }), enabled: false };
}

export function processReplyExtensions(text: string, extensions: SessionExtension[]) {
  return resolveExtensions(extensions).active.reduce((body, e) => extensionText(e, e.hooks?.replyPrefix) + body + extensionText(e, e.hooks?.replySuffix), text);
}

export const BUILTIN_EXTENSIONS: SessionExtension[] = [
  { apiVersion: 1, id: 'dialogue-style', name: '对白风格', version: '1.0.0', enabled: false, defaults: { style: '简洁自然，保留人物各自的说话习惯' }, config: { style: '简洁自然，保留人物各自的说话习惯' }, hooks: { beforePrompt: '对白风格：{{config.style}}。' } },
  { apiVersion: 1, id: 'scene-continuity', name: '场景连贯检查', version: '1.0.0', enabled: false, hooks: { afterHistory: '回复前核对当前地点、在场人物、背包与未完成目标；不能凭空换场，不输出核对过程。' } },
  { apiVersion: 1, id: 'player-agency', name: '玩家自主行动', version: '1.0.0', enabled: false, prompt: '只描写环境和非玩家角色的行为，不替玩家选择、发言或作出决定。遇到需要玩家决定的节点停下来。' },
];
