import { TextRule, validateRule } from './sessionEngine';

// Run user regular expressions in a disposable worker so pathological patterns cannot freeze the UI.
export async function applyTextRules(text: string, rules: TextRule[], scope: TextRule['scope']): Promise<{ text: string; warnings: string[] }> {
  const selected = rules.filter(r => r.enabled && r.scope === scope);
  if (!selected.length) return { text, warnings: [] };
  selected.forEach(validateRule);
  if (text.length > 500000) return { text, warnings: ['文本过长，已跳过正则处理。'] };
  const source = `onmessage = ({data}) => {
    let text = data.text; const warnings = [];
    for (const r of data.rules) {
      try { const next = text.replace(new RegExp(r.pattern, r.flags), r.replacement);
        if (next.length > 500000) throw Error('替换结果过长'); text = next;
      } catch(e) { warnings.push(r.name + ': ' + e.message); }
    }
    postMessage({text, warnings});
  }`;
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  return new Promise(resolve => {
    let worker: Worker;
    try { worker = new Worker(url); } catch { URL.revokeObjectURL(url); resolve({ text, warnings: ['浏览器不支持隔离执行，正则未应用。'] }); return; }
    const finish = (result: { text: string; warnings: string[] }) => {
      clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); resolve(result);
    };
    const timer = setTimeout(() => finish({ text, warnings: ['正则运行超时，已恢复原文。'] }), 500);
    worker.onmessage = event => finish(event.data);
    worker.onerror = () => finish({ text, warnings: ['正则执行失败，已恢复原文。'] });
    worker.postMessage({ text, rules: selected });
  });
}
