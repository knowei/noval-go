export type StateValue = string | number | boolean | string[] | null;
export interface StateField { key: string; label: string; type: 'number' | 'string' | 'boolean' | 'list'; initial: StateValue; min?: number; max?: number }
export interface StateEvent { id: string; name: string; field: string; operator: 'eq' | 'lte' | 'gte' | 'contains'; value: StateValue; target: string; operation: 'set' | 'add'; result: StateValue; enabled: boolean }
const safeKey = (key: unknown): key is string => typeof key === 'string' && /^[\p{L}_][\p{L}\p{N}_-]{0,63}$/u.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key);

export function validateStateFields(fields: StateField[]): StateField[] {
  if (!Array.isArray(fields) || fields.length > 60) throw new Error('状态字段最多 60 个');
  const keys = new Set<string>();
  return fields.map(f => {
    if (!f || !safeKey(f.key) || keys.has(f.key) || typeof f.label !== 'string' || !['number', 'string', 'boolean', 'list'].includes(f.type)) throw new Error('状态字段名称重复或格式无效');
    keys.add(f.key);
    if (f.min !== undefined && (typeof f.min !== 'number' || !Number.isFinite(f.min))) throw new Error('最小值必须为有限数值');
    if (f.max !== undefined && (typeof f.max !== 'number' || !Number.isFinite(f.max))) throw new Error('最大值必须为有限数值');
    if (f.min !== undefined && f.max !== undefined && f.min > f.max) throw new Error('最小值不能大于最大值');
    if (coerceField(f.initial, f) === undefined) throw new Error(`状态「${f.label}」的初始值类型错误`);
    return { ...f, initial: coerceField(f.initial, f)! };
  });
}

function coerceField(value: unknown, field: StateField): StateValue | undefined {
  if (field.type === 'number' && typeof value === 'number' && Number.isFinite(value)) return Math.min(field.max ?? Infinity, Math.max(field.min ?? -Infinity, value));
  if (field.type === 'string' && typeof value === 'string') return value.slice(0, 10000);
  if (field.type === 'boolean' && typeof value === 'boolean') return value;
  if (field.type === 'list' && Array.isArray(value) && value.every(x => typeof x === 'string')) return [...new Set(value)].slice(0, 200);
}

export function validateStateEvents(events: StateEvent[], fields: StateField[]): StateEvent[] {
  if (!Array.isArray(events) || events.length > 60) throw new Error('事件最多 60 个');
  const ids = new Set<string>();
  return events.map(e => {
    const target = fields.find(f => f.key === e?.target);
    const source = fields.find(f => f.key === e?.field);
    if (!e || !safeKey(e.id) || ids.has(e.id) || typeof e.name !== 'string' || !source || !target || !['eq','lte','gte','contains'].includes(e.operator) || !['set','add'].includes(e.operation)) throw new Error('事件字段、条件或 ID 无效');
    ids.add(e.id);
    if (['lte','gte'].includes(e.operator) && (source.type !== 'number' || typeof e.value !== 'number' || !Number.isFinite(e.value))) throw new Error('数值条件需要数值字段');
    if (e.operator === 'eq' && (source.type === 'list' || coerceField(e.value, source) === undefined)) throw new Error('等于条件需要匹配字段类型');
    if (e.operator === 'contains' && (!['list','string'].includes(source.type) || typeof e.value !== 'string')) throw new Error('包含条件需要文本或列表');
    if (e.operation === 'add' ? target.type !== 'number' || typeof e.result !== 'number' || !Number.isFinite(e.result) : coerceField(e.result, target) === undefined) throw new Error('事件结果类型与目标字段不匹配');
    return { ...e, enabled: e.enabled !== false };
  });
}

export function initialState(fields: StateField[]) { return Object.fromEntries((Array.isArray(fields) ? fields : []).filter(f => f && safeKey(f.key) && coerceField(f.initial, f) !== undefined).map(f => [f.key, coerceField(f.initial, f)!])); }

export function applyStateRules(previous: Record<string, unknown>, proposed: Record<string, unknown>, fields: StateField[], events: StateEvent[]) {
  const warnings: string[] = [];
  const state: Record<string, StateValue> = { ...initialState(fields) };
  for (const field of fields) {
    const old = coerceField(previous[field.key], field);
    if (old !== undefined) state[field.key] = old;
    if (!Object.hasOwn(proposed, field.key)) continue;
    const next = coerceField(proposed[field.key], field);
    if (next === undefined) warnings.push(`状态「${field.label}」类型不符，保留原值。`);
    else { state[field.key] = next; if (next !== proposed[field.key] && typeof next === 'number') warnings.push(`状态「${field.label}」已限制在设定范围内。`); }
  }
  const triggered: string[] = [];
  // Conditions read the pre-event state: no recursive event cascades.
  const basis = { ...state };
  for (const event of events.filter(e => e.enabled)) {
    const value = basis[event.field];
    const matches = event.operator === 'eq' ? value === event.value : event.operator === 'lte' ? typeof value === 'number' && value <= (event.value as number) : event.operator === 'gte' ? typeof value === 'number' && value >= (event.value as number) : (typeof value === 'string' || Array.isArray(value)) && value.includes(event.value as string);
    if (!matches) continue;
    const target = fields.find(f => f.key === event.target);
    if (!target) continue;
    const result = event.operation === 'add' ? Number(state[event.target]) + Number(event.result) : event.result;
    const next = coerceField(result, target);
    if (next !== undefined) { state[event.target] = next; triggered.push(event.name); }
  }
  for (const key of Object.keys(proposed)) if (!fields.some(f => f.key === key)) warnings.push(`未定义的状态字段「${key}」未应用。`);
  return { state, warnings, triggered };
}
