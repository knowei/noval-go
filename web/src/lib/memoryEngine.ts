import type { MemoryFact } from './sessionEngine';

export interface MemorySegment { from: number; to: number; facts: MemoryFact[]; text: string }
const factLine = (fact: MemoryFact) => `[第${fact.turn}条消息]${fact.key ? ` [事项：${fact.key}]` : ''} ${fact.text}`;

// Extractive summaries keep fact provenance. Rebuilding from the selected history
// makes abandoned branches impossible to retrieve, without an extra model call.
export function summarizeMemory(facts: MemoryFact[], segmentSize = 12): MemorySegment[] {
  const groups = new Map<number, MemoryFact[]>();
  for (const fact of facts) {
    const key = Math.floor((fact.turn - 1) / segmentSize);
    groups.set(key, [...(groups.get(key) || []), fact]);
  }
  return [...groups.values()].map(items => ({ from: items[0].turn, to: items.at(-1)!.turn, facts: items, text: items.map(f => f.text).join('；') }));
}

function terms(text: string) {
  const lower = text.toLowerCase();
  const result = new Set(lower.match(/[a-z0-9_]{2,}/g) || []);
  for (const phrase of lower.match(/[\p{Script=Han}]+/gu) || []) {
    for (let i = 0; i + 1 < phrase.length; i++) result.add(phrase.slice(i, i + 2));
  }
  return result;
}

export function retrieveMemory(facts: MemoryFact[], query: string, budget: number, estimate: (text: string) => number, strategy: 'relevant' | 'recent' = 'relevant') {
  const queryTerms = terms(query);
  const ranked = facts.map(fact => {
    const words = terms([fact.key, fact.text].filter(Boolean).join(' '));
    const overlap = [...queryTerms].filter(t => words.has(t)).length;
    return { ...fact, score: overlap / Math.sqrt(Math.max(1, words.size)) };
  }).sort((a, b) => (strategy === 'relevant' ? b.score - a.score : 0) || b.turn - a.turn);
  const selected: MemoryFact[] = [];
  let used = 0;
  for (const fact of ranked) {
    const cost = estimate(factLine(fact) + '\n');
    if (used + cost > budget) continue;
    selected.push({ text: fact.text, turn: fact.turn, ...(fact.key ? { key: fact.key } : {}), ...(fact.source ? { source: fact.source } : {}) }); used += cost;
  }
  selected.sort((a, b) => a.turn - b.turn);
  return { selected, omitted: facts.length - selected.length, text: selected.map(factLine).join('\n') };
}
