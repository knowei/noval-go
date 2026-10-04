import type { MemoryFact, SessionSettings } from './sessionEngine';

export type MemoryEntry = string | { key: string; text: string };
export interface MemoryCorrection { source: string; original: string; replacement: string }

export function normalizeMemoryEntries(value: unknown): MemoryEntry[] {
  const list = typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
  return list.slice(0, 100).flatMap((item): MemoryEntry[] => {
    if (typeof item === 'string' && item.trim()) return [item.trim().slice(0, 2000)];
    if (item && typeof item === 'object' && typeof item.key === 'string' && typeof item.text === 'string' && item.key.trim() && item.text.trim()) {
      return [{ key: item.key.trim().slice(0, 100), text: item.text.trim().slice(0, 2000) }];
    }
    return [];
  });
}

// Identity is tied to selected reply content, never to a mutable message number alone.
export function memorySource(index: number, content: string): string {
  let a = 2166136261, b = 5381;
  for (let i = 0; i < content.length; i++) { a = Math.imul(a ^ content.charCodeAt(i), 16777619); b = Math.imul(b, 33) ^ content.charCodeAt(i); }
  return `${index + 1}:${content.length}:${a >>> 0}:${b >>> 0}`;
}

export function normalizeCorrections(value: unknown): MemoryCorrection[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 1000).flatMap(c => c && typeof c.source === 'string' && c.source.length < 100 && typeof c.original === 'string' && typeof c.replacement === 'string'
    ? [{ source: c.source, original: c.original.slice(0, 2000), replacement: c.replacement.trim().slice(0, 2000) }] : []);
}

export function resolveMemory(facts: MemoryFact[], settings: Pick<SessionSettings, 'excludedMemories' | 'memoryCorrections'>) {
  const edited = facts.filter(f => !settings.excludedMemories.includes(f.text)).flatMap(f => {
    const correction = settings.memoryCorrections.find(c => c.source === f.source && c.original === f.text);
    return correction ? correction.replacement ? [{ ...f, text: correction.replacement }] : [] : [f];
  });
  const latest = new Map<string, MemoryFact>();
  for (const fact of edited) if (fact.key) latest.set(fact.key, fact);
  const active = edited.filter(f => !f.key || latest.get(f.key) === f);
  const superseded = edited.filter(f => f.key && latest.get(f.key) !== f);
  return { active, superseded };
}
