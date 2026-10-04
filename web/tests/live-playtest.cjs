// Explicit opt-in live model check. No credentials are written to the report.
// NOVAL_API_KEY, NOVAL_BASE_URL, NOVAL_MODEL are required environment variables.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const { normalizeSession, resolveSnapshot } = require('../src/lib/sessionEngine.ts');
const { LIGHTHOUSE_DECK, LIGHTHOUSE_ACTIONS, startPlaytest } = require('../src/lib/storyDiagnostics.ts');
const { runPlaytestTurn } = require('../src/lib/playtestRuntime.ts');

async function main() {
  const base = (process.env.NOVAL_BASE_URL || '').replace(/\/+$/, '');
  const key = process.env.NOVAL_API_KEY;
  const model = process.env.NOVAL_MODEL;
  if (!base || !key || !model) throw new Error('需要 NOVAL_BASE_URL、NOVAL_API_KEY、NOVAL_MODEL');
  const output = path.resolve(process.env.NOVAL_REPORT || '../.run/live-playtest.json');
  const nativeFetch = global.fetch;
  // The engine normally uses the browser proxy. This CLI connects only to the
  // explicitly configured endpoint and preserves the exact production payload.
  global.fetch = (url, init) => {
    const target = new URL(url, 'http://playtest.invalid').searchParams.get('target');
    if (target !== base + '/chat/completions') throw new Error('非预期模型目标');
    return nativeFetch(target, { ...init, redirect: 'error' });
  };
  const scenario = ['handoff', 'recall'].includes(process.env.NOVAL_CASE) ? process.env.NOVAL_CASE : 'conditional';
  const settings = normalizeSession({ ...LIGHTHOUSE_DECK.sessionDefaults, sampling: { temperature: 0.3, topP: 0.95 }, ...(scenario === 'recall' ? { contextTokens: 4096, responseTokens: 768, memoryTokens: 300, loreTokens: 300 } : {}) });
  const actions = scenario === 'recall' ? ['铜钥匙现在具体放在哪里？我有没有接过？我来查哪段航线、为了什么？不要猜测缺失的信息。'] : scenario === 'handoff' ? [
    '我向沈舟解释：我来查三十年前经过白礁的航线，是为了核对旧海图。请允许我借用钥匙；如果愿意，请把钥匙递到我面前，我暂时还没有接过。',
    '如果沈舟已经允许并递出了钥匙，我现在接过铜钥匙放进背包。我留在灯塔入口，没有打开书房。',
    '我把背包里的铜钥匙拿出，交还给沈舟。我仍留在灯塔入口，没有去书房。',
    LIGHTHOUSE_ACTIONS[3],
  ] : LIGHTHOUSE_ACTIONS;
  const report = { format: 'noval-live-playtest-v1', transport: 'direct-configured-endpoint', scenario, startedAt: new Date().toISOString(), model, settings, complete: false, results: [] };
  let history = startPlaytest(LIGHTHOUSE_DECK, settings);
  if (scenario === 'recall') {
    const source = JSON.parse(fs.readFileSync(path.resolve(process.env.NOVAL_SOURCE_REPORT || '../.run/live-lighthouse-handoff.json'), 'utf8'));
    if (source.scenario !== 'handoff' || !source.results?.[0]?.reply) throw new Error('需要已完成第一轮的 handoff 报告');
    const first = source.results[0];
    history.push({ isUser: true, text: first.input }, first.reply);
    for (let i = 0; i < 16; i++) history.push({ isUser: true, text: `第${i + 1}段等待：我留在入口安静观察，没有拿取或交还物品。` }, { story: '灯塔入口仍然安静。' + '窗外的海雾缓缓漂移，油灯稳定地亮着，没有人移动物品，也没有发生新的事件。'.repeat(8) });
    report.fixture = '真实 handoff 第一轮后添加 16 对中性等待消息，强制省略旧正文；不是自然生成的长聊。';
  }
  const save = () => {
    const json = JSON.stringify(report, null, 2);
    if (json.includes(key)) throw new Error('报告含敏感连接信息，已拒绝写入');
    fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, json);
  };
  try {
    for (const [i, input] of actions.entries()) {
      console.log(`Starting round ${i + 1}/${actions.length}`);
      const result = await runPlaytestTurn({ deck: LIGHTHOUSE_DECK, history, settings, model: { model, baseUrl: base, apiKey: key }, input, signal: AbortSignal.timeout(120000) });
      history = [...history, { isUser: true, text: input }, result.reply];
      report.results.push({ input, ...result, snapshot: resolveSnapshot(history) }); save();
      console.log(JSON.stringify({ round: i + 1, seconds: +(result.elapsedMs / 1000).toFixed(1), story: result.reply.story, state: result.reply.status, memory: result.reply.memoryEntries, issues: result.issues }));
    }
    report.complete = true; save();
  } catch (error) {
    report.failure = error.name === 'TimeoutError' ? '模型请求超时' : String(error.message).replaceAll(key, '[redacted]');
    save(); console.error(report.failure); process.exitCode = 1;
  } finally { global.fetch = nativeFetch; delete process.env.NOVAL_API_KEY; }
}
main().catch(() => { console.error('无法运行，请检查环境变量和报告路径。'); process.exitCode = 1; });
