import { normalizeSession, SessionSettings, TextRule, validateRule } from './sessionEngine';
const record = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};

export function importPreset(value: unknown): { settings: Partial<SessionSettings>; warnings: string[] } {
  const root = record(value), warnings: string[] = [];
  if (root.format === 'noval-preset-v1') return { settings: normalizeSession(record(root.session)), warnings };
  if (!Array.isArray(root.prompts) && typeof root.system_prompt !== 'string') throw new Error('需要本站预设或酒馆 Chat Completion 提示词预设');
  const prompts = Array.isArray(root.prompts) ? root.prompts.map(record) : [];
  const orders = Array.isArray(root.prompt_order) ? root.prompt_order.map(record).filter(x => Array.isArray(x.order)) : [];
  // Prefer the normal one-to-one character order, then the supplied final order.
  const order = (orders.find(x => x.character_id === 100001) || orders.at(-1))?.order as unknown[] | undefined;
  const selected = order ? order.map(record).filter(x => x.enabled !== false).flatMap(item => prompts.filter(p => p.identifier === item.identifier)) : prompts.filter(p => p.enabled !== false);
  const texts: string[] = typeof root.system_prompt === 'string' ? [root.system_prompt] : [];
  for (const prompt of selected) {
    if (prompt.marker) { warnings.push(`动态位置「${String(prompt.name || prompt.identifier)}」由本站会话引擎处理。`); continue; }
    if (prompt.role && prompt.role !== 'system' || prompt.injection_position || prompt.injection_depth) { warnings.push(`「${String(prompt.name || prompt.identifier)}」的角色/深度位置不能直接转换，已跳过。`); continue; }
    if (typeof prompt.content === 'string') texts.push(prompt.content);
  }
  const settings: Partial<SessionSettings> = { instructions: texts.join('\n\n') };
  if (typeof root.openai_max_context === 'number') settings.contextTokens = root.openai_max_context;
  if (typeof root.openai_max_tokens === 'number') settings.responseTokens = root.openai_max_tokens;
  settings.sampling = {};
  if (typeof root.temperature === 'number') settings.sampling.temperature = root.temperature;
  if (typeof root.top_p === 'number') settings.sampling.topP = root.top_p;
  warnings.push('仅转换启用的静态系统提示词、上下文/回复预算、温度与 Top P；模型地址、密钥和其他采样器不导入。请检查宏与顺序。');
  const normalized = normalizeSession(settings);
  return { settings: { ...settings, sampling: normalized.sampling, contextTokens: normalized.contextTokens, responseTokens: normalized.responseTokens }, warnings };
}

export function importRegexScripts(value: unknown): { rules: TextRule[]; warnings: string[] } {
  const root = record(value);
  const list = Array.isArray(value) ? value : Array.isArray(root.regex_scripts) ? root.regex_scripts : [root];
  const rules: TextRule[] = [], warnings: string[] = [];
  for (const item of list) {
    const r = record(item), name = typeof r.scriptName === 'string' ? r.scriptName : '导入规则';
    if (!Array.isArray(r.placement) || r.placement.length !== 1 || r.placement[0] !== 2 || !r.markdownOnly || r.promptOnly || r.runOnEdit || r.minDepth != null || r.maxDepth != null || r.substituteRegex || Array.isArray(r.trimStrings) && r.trimStrings.length) { warnings.push(`「${name}」含未支持的作用范围或修剪设置，已跳过。`); continue; }
    const literal = typeof r.findRegex === 'string' ? r.findRegex.match(/^\/([\s\S]*)\/([a-z]*)$/) : null;
    const rule: TextRule = { id: 'regex_' + crypto.randomUUID(), name, pattern: literal?.[1] || String(r.findRegex || ''), flags: literal?.[2] || 'g', replacement: String(r.replaceString || '').replaceAll('{{match}}', () => '$&'), scope: 'display', enabled: false };
    try { validateRule(rule); rules.push(rule); } catch { warnings.push(`「${name}」正则无效，已跳过。`); }
  }
  if (!rules.length && !warnings.length) throw new Error('没有可导入的正则规则');
  return { rules, warnings };
}

export function exportPreset(settings: SessionSettings) {
  // Personal memories and connected account secrets are not reusable presets.
  return { format: 'noval-preset-v1', session: { ...settings, pinnedMemory: '', excludedMemories: [], memoryCorrections: [], extensionBackups: [] } };
}
