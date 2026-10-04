const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Compile the actual TS modules in memory. No test copy of the implementation.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, filename);
};
const engine = require('../src/lib/sessionEngine.ts');
const { importCard, readCharacterFile, savePrivateCard, readPrivateCards } = require('../src/lib/cardImport.ts');
const { streamCompletion } = require('../src/lib/streamCompletion.ts');
const deck = { id: 'test', title: '灯塔', systemPrompt: '角色是守塔人。' };
const settings = () => engine.normalizeSession();

const illustrations = require('../src/lib/illustrations.ts');
const imageErrors = require('../src/lib/imageErrors.ts');
const replyEnvelope = require('../src/lib/replyEnvelope.ts');
test('normal stop cannot certify a new reply without the explicit end marker', () => {
  const partial=engine.parseSessionOutput('守塔人走到门前，正准备',3,true);
  assert.equal(partial.incomplete,true);
  assert.ok(partial.runtimeWarnings.some(w=>w.includes('结束标记')));
  const done=engine.parseSessionOutput('守塔人打开了门。<options>["走入大厅"]</options><reply_end/>',3,true);
  assert.equal(done.incomplete,false);
  assert.equal(done.story,'守塔人打开了门。');
  assert.equal(engine.parseSessionOutput('完毕。<options>["观察"]</options><reply_end/>后面又多了内容',3,true).incomplete,true);
  assert.equal(engine.parseSessionOutput('完毕。<state>{broken}</state><reply_end/>',0,true).incomplete,true);
  assert.equal(engine.parseSessionOutput('完毕。<reply_end/>',3,true).incomplete,true);
});
test('old prose can be marked suspicious without declaring short unpunctuated replies incomplete', () => {
  assert.equal(replyEnvelope.inspectReplyEnvelope('灯塔'.repeat(65)+'正在').suspected,true);
  assert.equal(replyEnvelope.inspectReplyEnvelope('灯塔'.repeat(65)+'正在。').suspected,false);
  assert.equal(replyEnvelope.inspectReplyEnvelope('好的').suspected,false);
  assert.equal(replyEnvelope.inspectReplyEnvelope('正文<reply_en').story,'正文');
});
test('repair joins split JSON and only removes substantial exact overlap', async () => {
  const prefix='灯塔入口很安静。<state>{"stamina":70}</state><options>["';
  const suffix='观察海面"]</options><reply_end/>';
  const raw=replyEnvelope.mergeReplyContinuation(prefix,suffix);
  const {completeSessionReply}=require('../src/lib/playtestRuntime.ts');
  const config=engine.normalizeSession({stateFields:[{key:'stamina',label:'体力',type:'number',initial:80}],stateEvents:[{id:'tick',name:'消耗',field:'stamina',operator:'gte',value:0,target:'stamina',operation:'add',result:-1,enabled:true}]});
  const result=await completeSessionReply(raw,[],config,true);
  assert.equal(result.incomplete,false);
  assert.equal(result.status.stamina,69);
  assert.equal(result.branches[0].title,'观察海面');
  assert.equal(replyEnvelope.mergeReplyContinuation(prefix,prefix+suffix),raw);
  const long='完整保留的先前正文。'+'日志记载了过去三十年灯塔周围的风向潮汐与船只航线。';
  assert.equal(replyEnvelope.mergeReplyContinuation(long,long.slice(-25)+'继续。'),long+'继续。');
  assert.equal(replyEnvelope.mergeReplyContinuation('人人','人都到了。'),'人人人都到了。');
});
test('repair reserves input room before trimming history and never mutates the original report', async () => {
  const {prepareSessionRequest}=require('../src/lib/playtestRuntime.ts');
  const history=Array.from({length:30},(_,i)=>({isUser:i%2===1,text:'海岸日志'.repeat(100)+i}));
  const config=engine.normalizeSession({contextTokens:8192,responseTokens:2048});
  const prefix='灯塔入口的海雾逐渐散去。'.repeat(30);
  const result=await prepareSessionRequest(deck,history,config,[],prefix);
  assert.equal(result.messages.at(-2).content,prefix);
  assert.match(result.messages.at(-1).content,/同一条回复的断点补全/);
  assert.ok(result.messages.some(m=>m.content===history.at(-1).text));
  assert.ok(result.historyOmitted>0);
  assert.ok(result.estimatedTokens+config.responseTokens+512<=config.contextTokens);
  assert.equal(history.length,30);
});
test('stream diagnostics retain reported usage without recording reasoning text', async () => {
  let usage,reason;
  const events=[{choices:[{delta:{content:'完成。',reasoning_content:'must not expose'},finish_reason:'stop'}]},{choices:[],usage:{prompt_tokens:200,completion_tokens:80,completion_tokens_details:{reasoning_tokens:50}}}];
  const body=new Response(events.map(e=>'data: '+JSON.stringify(e)+'\n\n').join('')+'data: [DONE]\n\n').body;
  let raw='';for await(const text of streamCompletion(body,r=>reason=r,u=>usage=u))raw+=text;
  assert.equal(raw,'完成。');assert.equal(reason,'stop');
  assert.deepEqual(usage,{promptTokens:200,completionTokens:80,reasoningTokens:50});
});
test('image failures distinguish gateway errors from authentication and policy rejections', () => {
  assert.equal(imageErrors.imageFailure(502,'upstream error').code,'unavailable');
  assert.equal(imageErrors.imageFailure(502,'No image returned').code,'no_image');
  assert.equal(imageErrors.imageFailure(502,'content_filter').code,'rejected');
  assert.equal(imageErrors.imageFailure(502,'fetch failed','proxy').code,'connection');
  assert.equal(imageErrors.imageFailure(401,'').code,'auth');
  assert.equal(imageErrors.imageFailure(429,'').code,'rate_limit');
  assert.equal(imageErrors.imageFailure(504,'').code,'timeout');
  assert.equal(imageErrors.imageFailure(502,'insufficient_quota').code,'quota');
  assert.ok(!imageErrors.imageFailure(502,'echoed secret-token-private-story').message.includes('secret-token'));
});
test('image error decoding handles proxy classifications without reflecting arbitrary messages', async () => {
  const data={imageError:{code:'no_image',stage:'upstream',message:'secret-token-private-story'}};
  const error=await imageErrors.imageResponseError(new Response(JSON.stringify(data),{status:502}));
  assert.match(error.message,/没有收到可用图片/);
  assert.doesNotMatch(error.message,/secret-token/);
  const invalid=await imageErrors.imageResponseError(new Response('<html>bad gateway secret-token</html>',{status:502}));
  assert.match(invalid.message,/HTTP 502/);
  assert.doesNotMatch(invalid.message,/secret-token/);
});
test('image error response reads are bounded even when a provider sends a large body', async () => {
  const text=await imageErrors.readImageErrorBody(new Response('x'.repeat(70000)));
  assert.equal(text.length,32768);
});
test('illustrations use the selected reply snapshot, excluding future state and facts', () => {
  const history = [
    {story:'站在灯塔入口',status:{location:'入口',weather:'海雾'},memoryEntries:[{key:'钥匙',text:'钥匙在木桌上'}]},
    {story:'已经到达书房',status:{location:'书房',weather:'暴雨'},memoryEntries:[{key:'钥匙',text:'钥匙放进抽屉'}]},
  ];
  const prompt = illustrations.illustrationPrompt(deck, history, 0, '水彩', 'background');
  assert.match(prompt, /入口/);
  assert.match(prompt, /木桌/);
  assert.match(prompt, /海雾/);
  assert.doesNotMatch(prompt, /书房|抽屉|暴雨/);
  assert.match(prompt, /不画人物/);
});
test('late illustration attaches only to its original swipe and deduplicates', () => {
  const old={story:'旧场景',imageOriginId:'old'};
  const history=[{story:'新场景',imageOriginId:'new',swipes:[old]}];
  const image={id:'image1',metadata:{source:'old'}};
  const result=illustrations.attachIllustration(illustrations.attachIllustration(history,'old',image),'old',image);
  assert.equal(result[0].illustrations,undefined);
  assert.equal(result[0].swipes[0].illustrations.length,1);
  assert.equal(history[0].swipes[0].illustrations,undefined);
  assert.equal(illustrations.attachIllustration(history,'removed',image)[0].illustrations,undefined);
});
test('image request and decoding reject unsupported links, credentials in URL and invalid media', () => {
  const config=illustrations.normalizeImageSettings({baseUrl:'http://127.0.0.1:8045/v1/',model:'image-test',apiKey:'secret'});
  const request=illustrations.imageRequest(config,'An empty lighthouse');
  assert.equal(request.target,'http://127.0.0.1:8045/v1/images/generations');
  assert.equal(request.body.response_format,'b64_json');
  assert.ok(!JSON.stringify(request).includes('secret'));
  assert.throws(()=>illustrations.imageRequest({...config,baseUrl:'https://user:secret@example.org'},'scene'));
  assert.throws(()=>illustrations.decodeGeneratedImage({data:[{url:'https://example.org/a.png'}]}),/b64_json/);
  assert.throws(()=>illustrations.decodeGeneratedImage({data:[{b64_json:btoa('<svg/>')}]}));
  assert.equal(illustrations.decodeGeneratedImage({data:[{b64_json:Buffer.from([255,216,255,0]).toString('base64')}]}).type,'image/jpeg');
});

test('more than six messages fit and latest user input remains unchanged', () => {
  const history = Array.from({ length: 20 }, (_, i) => ({ isUser: i % 2 === 1, story: i % 2 === 0 ? `回复${i}` : undefined, text: i % 2 === 1 ? `行动${i}` : undefined }));
  const result = engine.buildSessionPrompt(deck, history, settings());
  assert.equal(result.historyIncluded, 20);
  assert.equal(result.messages.at(-1).content, '行动19');
});

test('budget trims old history without losing latest input or exceeding allowance', () => {
  const history = Array.from({ length: 40 }, (_, i) => ({ isUser: i % 2 === 1, text: `${i}:` + '灯塔'.repeat(150) }));
  const config = engine.normalizeSession({ contextTokens: 4096, responseTokens: 512 });
  const result = engine.buildSessionPrompt(deck, history, config);
  assert.ok(result.historyOmitted > 0);
  assert.equal(result.messages.at(-1).content, history.at(-1).text);
  assert.ok(result.estimatedTokens + config.responseTokens + 512 <= config.contextTokens);
  assert.equal(result.messages[1].role, 'user');
});

test('oversized settings/latest input fail clearly instead of dropping user action', () => {
  assert.throws(() => engine.buildSessionPrompt(deck, [{ isUser: true, text: '字'.repeat(30000) }], settings()), /预算/);
});

test('lore respects enabled, depth, priority, budget and late placement', () => {
  const lore = [
    { id: 'old', title: '过去', keys: ['森林'], content: 'A', scanDepth: 1 },
    { id: 'off', title: '关闭', keys: [], content: 'B', constant: true, enabled: false },
    { id: 'low', title: '低', keys: ['灯塔'], content: 'C'.repeat(100), priority: 1 },
    { id: 'high', title: '高', keys: ['灯塔'], content: 'D'.repeat(100), priority: 10, position: 'late' },
  ];
  const history = [{ isUser: true, text: '森林' }, { isUser: true, text: '灯塔' }];
  const picked = engine.selectLore(lore, history, 45);
  assert.deepEqual(picked.active.map(e => e.id), ['high']);
  const report = engine.buildSessionPrompt(deck, history, settings(), lore);
  assert.equal(report.messages.at(-1).role, 'system');
  assert.match(report.messages.at(-1).content, /高/);
});

test('card macros and post-history instructions use correct position', () => {
  const report = engine.buildSessionPrompt({ ...deck, systemPrompt: '{{char}}对{{user}}说话', postHistoryInstructions: '后置{{user}}' }, [{ isUser: true, text: '{{user}}原话' }], engine.normalizeSession({ playerName: '旅人' }));
  assert.match(report.messages[0].content, /灯塔对旅人说话/);
  assert.equal(report.messages[1].content, '{{user}}原话');
  assert.match(report.messages.at(-1).content, /后置旅人/);
});

test('snapshot replaces inventory, ignores failed/partial turns and keeps fact provenance', () => {
  const history = [{ status: { inventory: ['钥匙'] }, memory: ['遇见守塔人'] }, { status: { inventory: [] }, memory: ['归还钥匙'] }, { incomplete: true, status: { inventory: ['宝石'] }, memory: ['不完整'] }];
  const snapshot = engine.resolveSnapshot(history);
  assert.deepEqual(snapshot.state.inventory, []);
  assert.deepEqual(snapshot.memories.map(m => m.turn), [1, 2]);
});

test('switching a prior reply removes descendant states and memories', () => {
  const first = { story: '取得钥匙', status: { inventory: ['钥匙'] }, memory: ['取得钥匙'] };
  const alternate = { story: '没有拿钥匙', status: { inventory: [] }, memory: ['留在门口'] };
  const history = [{ isUser: true, text: '开门' }, { ...first, swipes: [first, alternate] }, { story: '取得宝箱', status: { inventory: ['钥匙', '宝箱'] }, memory: ['取得宝箱'] }];
  const next = engine.selectReplyVersion(history, 1, 1);
  assert.equal(next.length, 2);
  assert.deepEqual(engine.resolveSnapshot(next).state.inventory, []);
  assert.deepEqual(engine.resolveSnapshot(next).memories.map(m => m.text), ['留在门口']);
  assert.equal(history.length, 3);
});

test('invalid state values and prototype fields cannot enter state', () => {
  const state = engine.validateState(JSON.parse('{"health":50,"inventory":["钥匙"],"nested":{"x":1},"__proto__":{"polluted":true}}'));
  assert.deepEqual(state, { health: 50, inventory: ['钥匙'] });
  assert.equal({}.polluted, undefined);
});

test('output metadata preserved raw, choices disabled, malformed JSON surfaced', () => {
  const raw = '正文<state>{"health":10}</state><memory>["发现灯塔"]</memory><options>["探索"]</options>';
  const turn = engine.parseSessionOutput(raw, 0);
  assert.equal(turn.story, '正文'); assert.equal(turn.rawText, raw);
  assert.deepEqual(turn.branches, []); assert.equal(turn.status.health, 10);
  assert.equal(engine.parseSessionOutput('正文<state>坏JSON</state>', 3).runtimeWarnings.length, 1);
});

test('suppressed memories excluded while manually pinned facts remain', () => {
  const report = engine.buildSessionPrompt(deck, [{ story: '回合', memory: ['错误事实'] }, { isUser: true, text: '继续' }], engine.normalizeSession({ excludedMemories: ['错误事实'], pinnedMemory: '正确事实' }));
  assert.ok(!report.messages[0].content.includes('错误事实'));
  assert.ok(report.messages[0].content.includes('正确事实'));
});

test('extension validation, disabled-by-default import and ordered scoped rules', () => {
  const ext = engine.validateExtension({ apiVersion: 1, id: 'test', name: '测试', version: '1', enabled: true, prompt: '简洁' });
  assert.equal(ext.enabled, false);
  assert.throws(() => engine.validateExtension({ apiVersion: 2 }), /apiVersion/);
  assert.throws(() => engine.validateRule({ pattern: '(', replacement: '', flags: 'g', scope: 'display' }));
});

test('V2 card imports fields, greetings, lore; preserves unknown extensions without executing', () => {
  const card = { spec: 'chara_card_v2', spec_version: '2.0', data: { name: '守塔人', description: '灯塔管理员', first_mes: '欢迎', alternate_greetings: ['你好'], mes_example: '示例', character_book: { entries: [{ id: 1, keys: ['钥匙'], content: '铜钥匙', enabled: false }] }, extensions: { javascript: 'throw Error()' } } };
  const result = importCard(card, 'local_test');
  assert.equal(result.deck.lorebook[0].enabled, false);
  assert.deepEqual(result.deck.alternateGreetings, ['欢迎', '你好']);
  assert.equal(result.deck.exampleDialogue, '示例');
  assert.deepEqual(result.deck.sourceCard, card);
  assert.ok(result.warnings.length);
});

test('backup roundtrip preserves session settings and history', () => {
  const session = engine.normalizeSession({ pace: 'slow', pinnedMemory: '见过守塔人' });
  const result = importCard(JSON.parse(JSON.stringify({ format: 'noval-session-v1', deck, session, history: [{ isUser: true, text: '你好', session }] })), 'local_copy');
  assert.equal(result.history[0].session.pace, 'slow');
  assert.equal(result.deck.id, 'local_copy');
});

test('PNG metadata decodes unicode and rejects truncated chunks', async () => {
  const data = Buffer.from('chara\0' + Buffer.from(JSON.stringify({ name: '守塔人', description: '角色' })).toString('base64'));
  const chunk = Buffer.alloc(data.length + 12); chunk.writeUInt32BE(data.length); chunk.write('tEXt', 4); data.copy(chunk, 8);
  const bytes = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk]);
  const value = await readCharacterFile(new File([bytes], 'card.png'));
  assert.equal(value.name, '守塔人');
  await assert.rejects(() => readCharacterFile(new File([bytes.subarray(0, 15)], 'bad.png')), /PNG/);
});

test('private libraries are separated by user', () => {
  const data = new Map();
  global.localStorage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) };
  savePrivateCard('a', deck); assert.equal(readPrivateCards('a').length, 1); assert.equal(readPrivateCards('b').length, 0);
});

test('SSE survives every byte boundary, including Chinese and CRLF', async () => {
  const event = 'data: '+JSON.stringify({ choices: [{ delta: { content: '你好，灯塔' } }] })+'\r\n\r\ndata: [DONE]\r\n\r\n';
  const bytes = new TextEncoder().encode(event);
  const body = new ReadableStream({ start(controller) { for (const b of bytes) controller.enqueue(new Uint8Array([b])); controller.close(); } });
  let result = ''; for await (const delta of streamCompletion(body)) result += delta;
  assert.equal(result, '你好，灯塔');
});

test('SSE provider errors are surfaced rather than silently swallowed', async () => {
  const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {"error":{"message":"quota"}}\n\n')); c.close(); } });
  await assert.rejects(async () => { for await (const delta of streamCompletion(body)) void delta; }, /quota/);
});

test('truncated stream is never accepted as a complete reply', async () => {
  const body = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"半句"}}]}\n\n')); c.close(); } });
  await assert.rejects(async () => { for await (const delta of streamCompletion(body)) void delta; }, /提前结束/);
});

test('finish_reason without DONE is accepted, length cutoff is not', async () => {
  const make = reason => new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: '+JSON.stringify({choices:[{delta:{content:''},finish_reason:reason}]})+'\n\n')); c.close(); } });
  for await (const delta of streamCompletion(make('stop'))) void delta;
  await assert.rejects(async () => { for await (const delta of streamCompletion(make('length'))) void delta; }, /长度上限/);
});

test('normalization recovers old and malformed settings without breaking the editor', () => {
  const v = engine.normalizeSession({ mode: 'bad', lore: [null, {id:'x',content:'text'}], rules:[null], extensions:[null] });
  assert.equal(v.mode, 'narrative'); assert.deepEqual(v.lore[0].keys, []); assert.equal(v.rules.length,0);
});

test('store persists session settings and serializes saves without saving streaming fragments', async () => {
  const data = new Map();
  global.localStorage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) };
  const originalFetch = global.fetch;
  const saved = [];
  let release;
  let posts = 0;
  const gate = new Promise(resolve => { release = resolve; });
  global.fetch = async (url, options) => {
    if (url === '/api/conversations' && options?.method === 'POST') {
      posts++;
      if (posts === 1) await gate;
      saved.push(JSON.parse(options.body));
      return new Response('{"success":true}');
    }
    return new Response('[]');
  };
  try {
    const { useAppStore: store } = require('../src/lib/store.ts');
    store.getState().startNewStory(deck);
    store.getState().setSessionSettings({ options: 0, pinnedMemory: '记住灯塔' });
    store.getState().addTurn({ isUser: true, text: '你好' });
    await new Promise(setImmediate);
    assert.equal(posts, 1);
    store.getState().addTurn({ story: '部分', incomplete: true });
    store.getState().updateTurn(1, { story: '仍在生成', incomplete: true });
    await new Promise(setImmediate);
    assert.equal(posts, 1);
    store.getState().updateTurn(1, { story: '完成', incomplete: false });
    await new Promise(setImmediate);
    assert.equal(posts, 1, 'completed save waits for previous save');
    release();
    await store.getState().autoSave();
    assert.equal(saved.at(-1).history[1].story, '完成');
    assert.equal(saved.at(-1).history[0].session.options, 0);
    assert.ok(!saved.some(s => s.history.some(t => t.incomplete)));
    store.getState().setCurrentConversationId('restored');
    store.getState().setConversationHistory(saved.at(-1).history);
    assert.equal(store.getState().sessionSettings.pinnedMemory, '记住灯塔');
  } finally { release(); global.fetch = originalFetch; }
});

async function withBranchStore(run) {
  const originalFetch = global.fetch;
  const { useAppStore: store } = require('../src/lib/store.ts');
  const records = new Map();
  const calls = [];
  const controls = { failArchive: false, archiveGate: null };
  global.fetch = async (url, options) => {
    const parsed = new URL(url, 'http://fixture');
    if (options?.method === 'POST') {
      const payload = JSON.parse(options.body);
      calls.push(payload);
      if (parsed.pathname.endsWith('/delete')) records.delete(payload.id);
      else {
        if (payload.id.startsWith('branch_')) {
          if (controls.archiveGate) await controls.archiveGate;
          if (controls.failArchive) return new Response('{}', { status: 503 });
        }
        records.set(payload.id, structuredClone(payload));
      }
      return new Response('{}');
    }
    return new Response(JSON.stringify(parsed.searchParams.has('id') ? records.get(parsed.searchParams.get('id')) || null : [...records.values()]));
  };
  store.setState({ currentUserId: 'branch_test_user', isBranching: false });
  store.getState().startNewStory(deck);
  const settings = engine.normalizeSession({ pinnedMemory: '灯塔在北岸', pace: 'slow', extensions: [{ apiVersion: 1, id: 'tone', name: '语气', version: '1', enabled: true, prompt: '简洁', rules: [] }] });
  const history = [{ isUser: true, text: '查看灯塔', session: settings }, { story: '获得铜钥匙', memory: ['拿到钥匙'], status: { inventory: ['铜钥匙'] } }, { isUser: true, text: '开门' }, { story: '钥匙留在门上', memory: ['书房已打开'], status: { inventory: [] } }];
  store.getState().setConversationHistory(history);
  await store.getState().autoSave();
  try { await run({ store, records, calls, controls, history }); }
  finally { await store.getState().autoSave(); global.fetch = originalFetch; }
}

test('checkpoint restores complete descendants, settings, memories and state; restore also preserves current progress', () => withBranchStore(async ({ store, records, history }) => {
  const activeId = store.getState().currentConversationId;
  assert.equal(await store.getState().replaceHistoryWithCheckpoint(history.slice(0, 2), '切换回复前'), true);
  await store.getState().autoSave();
  const checkpoint = [...records.values()].find(s => s.id.startsWith('branch_'));
  assert.equal(checkpoint.history.length, 4);
  assert.equal(checkpoint.history[0].branchInfo.sourceId, activeId);
  assert.deepEqual(engine.resolveSnapshot(store.getState().conversationHistory).state.inventory, ['铜钥匙']);
  store.getState().setSessionSettings({ pinnedMemory: '临时更改', pace: 'fast' });
  await store.getState().autoSave();
  assert.equal(await store.getState().restoreCheckpoint(checkpoint.id), true);
  await store.getState().autoSave();
  assert.equal(store.getState().currentConversationId, activeId);
  assert.equal(store.getState().conversationHistory.length, 4);
  assert.equal(store.getState().sessionSettings.pinnedMemory, '灯塔在北岸');
  assert.equal(store.getState().sessionSettings.extensions[0].enabled, true);
  assert.deepEqual(engine.resolveSnapshot(store.getState().conversationHistory).state.inventory, []);
  assert.equal(engine.resolveSnapshot(store.getState().conversationHistory).memories.length, 2);
  assert.equal(store.getState().conversationHistory[0].branchInfo, undefined);
  assert.equal([...records.keys()].filter(id => id.startsWith('branch_')).length, 2);
  assert.equal(records.get(checkpoint.id).history.length, 4, 'archive remains immutable');
}));

test('failed checkpoint aborts destructive edit, successful retry is recoverable even after clearing all history', () => withBranchStore(async ({ store, controls, records, history }) => {
  const before = store.getState().conversationHistory;
  controls.failArchive = true;
  assert.equal(await store.getState().truncateHistory(0), false);
  assert.equal(store.getState().conversationHistory, before);
  assert.match(store.getState().saveError, /当前内容未改动/);
  assert.equal(store.getState().isBranching, false);
  controls.failArchive = false;
  assert.equal(await store.getState().truncateHistory(0), true);
  await store.getState().autoSave();
  assert.equal(store.getState().conversationHistory.length, 0);
  const checkpoint = [...records.values()].find(s => s.id.startsWith('branch_'));
  assert.equal(await store.getState().restoreCheckpoint(checkpoint.id), true);
  assert.equal(store.getState().conversationHistory.length, history.length);
}));

test('pending checkpoint rejects repeated actions and cannot overwrite a newly selected conversation', () => withBranchStore(async ({ store, controls, history }) => {
  let release;
  controls.archiveGate = new Promise(resolve => { release = resolve; });
  const pending = store.getState().truncateHistory(1);
  await new Promise(setImmediate);
  assert.equal(store.getState().isBranching, true);
  assert.equal(await store.getState().truncateHistory(0), false);
  store.getState().setCurrentConversationId('another_chat');
  store.getState().setConversationHistory([{ isUser: true, text: '另一段故事' }]);
  release();
  assert.equal(await pending, false);
  assert.equal(store.getState().conversationHistory[0].text, '另一段故事');
  assert.equal(store.getState().isBranching, false);
}));

test('restore refuses missing or unrelated checkpoints without changing current progress', () => withBranchStore(async ({ store, records, history }) => {
  const before = store.getState().conversationHistory;
  records.set('branch_other', { id: 'branch_other', user_id: 'someone_else', deck_id: deck.id, history });
  assert.equal(await store.getState().restoreCheckpoint('branch_other'), false);
  assert.equal(await store.getState().restoreCheckpoint('branch_missing'), false);
  assert.equal(store.getState().conversationHistory, before);
  assert.equal(records.size, 2);
}));

const memoryEngine = require('../src/lib/memoryEngine.ts');
const stateRules = require('../src/lib/stateRules.ts');
const extensions = require('../src/lib/extensionRuntime.ts');
const presets = require('../src/lib/presetImport.ts');
const media = require('../src/lib/mediaRuntime.ts');
const trees = require('../src/lib/branchTree.ts');

test('relevant old facts outrank recent unrelated facts within budget; summaries keep source ranges', () => {
  const facts = [{text:'铜钥匙藏在北岸灯塔',turn:2}, ...Array.from({length:20},(_,i)=>({text:`今天沿街散步观察云朵${i}`,turn:i+14}))];
  const result = memoryEngine.retrieveMemory(facts,'铜钥匙在哪里',40,engine.estimateTokens);
  assert.equal(result.selected[0].turn,2);
  const recent=memoryEngine.retrieveMemory(facts,'铜钥匙在哪里',40,engine.estimateTokens,'recent');
  assert.ok(!recent.selected.some(f=>f.turn===2));
  assert.ok(engine.estimateTokens(result.text)<=40);
  assert.deepEqual(memoryEngine.summarizeMemory(facts).map(s=>s.from),[2,14,25]);
});

test('restoring a branch removes abandoned facts from retrieval and segment summaries', () => {
  const history=[{isUser:true,text:'你好'},{story:'旧路',memory:['铜钥匙在海边']},{isUser:true,text:'前进'},{story:'新路',memory:['城堡有一条龙']}];
  const shortened=history.slice(0,2);
  const report=engine.buildSessionPrompt(deck,shortened,engine.normalizeSession());
  assert.ok(!report.messages.some(m=>m.content.includes('城堡有一条龙')));
  assert.deepEqual(report.recalledMemory.map(({text,turn})=>({text,turn})),[{text:'铜钥匙在海边',turn:2}]);
});

test('state rules clamp types and values, trigger once without cascading, and replace empty inventory', () => {
  const fields=stateRules.validateStateFields([{key:'stamina',label:'体力',type:'number',initial:100,min:0,max:100},{key:'mood',label:'状态',type:'string',initial:'正常'},{key:'inventory',label:'背包',type:'list',initial:[]}]);
  const events=stateRules.validateStateEvents([{id:'tired',name:'疲惫',enabled:true,field:'stamina',operator:'lte',value:0,target:'mood',operation:'set',result:'疲惫'},{id:'cascade',name:'不连锁',enabled:true,field:'mood',operator:'eq',value:'疲惫',target:'stamina',operation:'add',result:50}],fields);
  const result=stateRules.applyStateRules({stamina:50,mood:'正常',inventory:['钥匙']},{stamina:-20,inventory:[],unknown:100},fields,events);
  assert.equal(result.state.stamina,0);assert.equal(result.state.mood,'疲惫');assert.deepEqual(result.state.inventory,[]);assert.deepEqual(result.triggered,['疲惫']);assert.equal(result.state.unknown,undefined);
  assert.equal(stateRules.applyStateRules({stamina:50},{stamina:'满'},fields,[]).state.stamina,50);
  assert.throws(()=>stateRules.validateStateFields([{key:'__proto__',label:'bad',type:'number',initial:1}]));
  assert.throws(()=>stateRules.validateStateEvents([{...events[0],target:'missing'}],fields));
});

test('extensions enforce dependency versions, order, cycles and scoped lifecycle content', () => {
  const base={apiVersion:1,id:'base',name:'基础',version:'1.2.0',enabled:true,defaults:{style:'简洁'},config:{style:'自然'},hooks:{beforePrompt:'风格{{config.style}}',afterHistory:'保持场景',replyPrefix:'[开始]',replySuffix:'[结束]'}};
  const child={apiVersion:1,id:'child',name:'依赖项',version:'1',enabled:true,dependencies:[{id:'base',minVersion:'1.1'}]};
  assert.deepEqual(extensions.resolveExtensions([child,base]).active.map(e=>e.id),['base','child']);
  assert.equal(extensions.resolveExtensions([child]).active.length,0);
  assert.equal(extensions.resolveExtensions([child,{...base,version:'1.0'}]).active.length,1);
  assert.equal(extensions.resolveExtensions([{...base,dependencies:[{id:'child'}]},child]).active.length,0);
  const report=engine.buildSessionPrompt(deck,[{isUser:true,text:'继续'}],engine.normalizeSession({extensions:[child,base]}));
  assert.ok(report.messages[0].content.includes('风格自然'));
  assert.ok(report.messages.at(-1).content.includes('保持场景'));
  assert.equal(extensions.processReplyExtensions('正文',[base]),'[开始]正文[结束]');
});

test('extension upgrade migrates declared config only and remains disabled until inspected', () => {
  const previous={apiVersion:1,id:'tone',name:'语气',version:'1',enabled:true,config:{old:'慢速',secret:'not-a-declared-setting'}};
  const next=engine.validateExtension({apiVersion:1,id:'tone',name:'语气',version:'2',defaults:{pace:'自然'},migrations:[{from:'1',rename:{old:'pace'}}]});
  const result=extensions.upgradeExtension(previous,next);
  assert.deepEqual(result.config,{pace:'慢速'});assert.equal(result.enabled,false);
  assert.throws(()=>engine.validateExtension({...next,dependencies:[{id:'x',minVersion:'bad'}]}));
  const builtin=extensions.upgradeExtension(undefined,engine.validateExtension(extensions.BUILTIN_EXTENSIONS[0]));
  const once=engine.normalizeSession({extensions:[{...builtin,enabled:true}]});
  assert.equal(engine.normalizeSession(once).extensions.length,1,'normalization must preserve optional hooks across repeated saves');
});

test('world info supports secondary keys, chance, recursive depth and group priority', () => {
  const history=[{isUser:true,text:'灯塔 铜钥匙'}];
  const entries=[{id:'a',title:'A',keys:['灯塔'],content:'书房',secondaryKeys:['铜钥匙'],secondaryMode:'andAll',recursive:true},{id:'b',title:'B',keys:['书房'],content:'航海日志'},{id:'c',title:'C',keys:['灯塔'],content:'不出现',probability:0},{id:'d',title:'D',keys:['灯塔'],content:'优先',group:'one',groupPriority:true,priority:2},{id:'e',title:'E',keys:['灯塔'],content:'互斥',group:'one'},{id:'f',title:'F',keys:['书房'],content:'禁止递归',excludeRecursion:true}];
  assert.deepEqual(new Set(engine.selectLore(entries,history,1000,()=>0.5).active.map(e=>e.id)),new Set(['a','b','d']));
  assert.ok(!engine.selectLore([{...entries[0],secondaryMode:'notAny'}],history,1000).active.length);
  const chain=Array.from({length:8},(_,i)=>({id:String(i),title:String(i),keys:[String(i)],content:String(i+1)}));
  assert.equal(engine.selectLore(chain,[{isUser:true,text:'0'}],1000,()=>0).active.length,4);
});

test('V3 card maps nickname, greetings and media but never automatically enables external assets', () => {
  const raw={spec:'chara_card_v3',spec_version:'3.0',data:{name:'灯塔管理员',nickname:'守塔人',description:'看守灯塔',first_mes:'欢迎',assets:[{type:'emotion',name:'calm',uri:'https://example.com/calm.png'},{type:'icon',uri:'embeded://asset.png'}],group_only_greetings:['群聊开场']}};
  const result=importCard(raw,'local_v3');
  assert.equal(result.deck.characterName,'守塔人');assert.equal(result.deck.sessionDefaults.media.enabled,false);assert.equal(result.deck.sessionDefaults.media.assets[0].field,'emotion');assert.deepEqual(result.deck.sourceCard,raw);assert.equal(result.deck.alternateGreetings.length,1);assert.ok(result.warnings.some(w=>w.includes('单独配置')));
});

test('PNG prefers V3 over V2 and reads compressed zTXt and iTXt metadata', async () => {
  const zlib=require('node:zlib');
  const card3={spec:'chara_card_v3',data:{name:'新版'}};
  const chunk=(type,data)=>{const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);b.write(type,4);data.copy(b,8);return b;};
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  const legacy=chunk('tEXt',Buffer.from('chara\0'+Buffer.from('{"name":"old"}').toString('base64')));
  const encoded=Buffer.from(JSON.stringify(card3)).toString('base64');
  for(const [type,header] of [['zTXt',Buffer.from('ccv3\0\0')],['iTXt',Buffer.from([99,99,118,51,0,1,0,0,0])]]) {
    const bytes=Buffer.concat([sig,legacy,chunk(type,Buffer.concat([header,zlib.deflateSync(encoded)]))]);
    assert.deepEqual(await readCharacterFile(new File([bytes],'v3.png')),card3);
  }
});

test('preset import respects enabled order, sampler bounds, and excludes connection secrets', () => {
  const result=presets.importPreset({temperature:9,top_p:0.8,api_key:'never-copy',prompts:[{identifier:'b',role:'system',content:'后'},{identifier:'a',role:'system',content:'前'},{identifier:'off',content:'禁用'}],prompt_order:[{character_id:100001,order:[{identifier:'a',enabled:true},{identifier:'off',enabled:false},{identifier:'b',enabled:true}]}]});
  assert.equal(result.settings.instructions,'前\n\n后');assert.equal(result.settings.sampling.temperature,2);assert.equal(result.settings.api_key,undefined);
  const own=presets.importPreset({format:'noval-preset-v1',session:{apiKey:'secret',baseUrl:'private',pinnedMemory:'事实'}});
  assert.equal(own.settings.apiKey,undefined);assert.equal(own.settings.baseUrl,undefined);
  assert.equal(presets.exportPreset(engine.normalizeSession({pinnedMemory:'私有记忆'})).session.pinnedMemory,'');
});

test('ST display regex maps match substitution and rejects unsupported placement', () => {
  const good={scriptName:'强调',findRegex:'/灯塔/g',replaceString:'【{{match}}】',markdownOnly:true,placement:[2]};
  const result=presets.importRegexScripts([good,{...good,placement:[1]}]);
  assert.equal(result.rules.length,1);assert.equal(result.rules[0].enabled,false);assert.equal('灯塔'.replace(new RegExp(result.rules[0].pattern,result.rules[0].flags),result.rules[0].replacement),'【灯塔】');assert.equal(result.warnings.length,1);
});

test('media activation follows restored state, rejects executable URLs and stays off by default', () => {
  const config={enabled:true,speech:false,volume:0.3,assets:[{id:'x',label:'平静',kind:'portrait',url:'/portrait.png',field:'emotion',value:'calm'}]};
  assert.equal(media.activeSceneAssets(config,{emotion:'calm'}).portrait.id,'x');assert.deepEqual(media.activeSceneAssets(config,{emotion:'angry'}),{});assert.equal(media.safeMediaUrl('javascript:alert(1)'), '');assert.equal(media.safeMediaUrl('//other.example/image'), '');assert.equal(media.normalizeMedia().enabled,false);
});

test('checkpoint lineage branches after restore; rename and recycle preserve archived contents', () => withBranchStore(async ({store,records,history})=>{
  await store.getState().truncateHistory(2);await store.getState().autoSave();
  const first=[...records.values()].find(s=>s.id.startsWith('branch_'));
  await store.getState().truncateHistory(1);await store.getState().autoSave();
  const second=[...records.values()].filter(s=>s.id.startsWith('branch_')).at(-1);
  assert.equal(second.history[0].branchInfo.parentId,first.id);
  assert.equal(await store.getState().updateCheckpoint(first.id,{name:'北岸路线',trashed:true}),true);
  const renamed=records.get(first.id);assert.equal(renamed.title,'北岸路线');assert.equal(renamed.history.length,history.length);assert.equal(renamed.history[0].branchInfo.trashed,true);
  assert.equal(await store.getState().updateCheckpoint(first.id,{trashed:false}),true);
  await store.getState().restoreCheckpoint(first.id);await store.getState().autoSave();
  assert.equal(store.getState().currentLineage.parentId,first.id);
  const tree=trees.branchTree([...records.values()].filter(s=>s.id.startsWith('branch_')));
  assert.equal(tree.find(n=>n.save.id===second.id).depth,1);
}));

test('malformed cyclic branch trees stay finite and keep every checkpoint visible',()=>{
  const tree=trees.branchTree([{id:'a',branch_info:{parentId:'b'}},{id:'b',branch_info:{parentId:'a'}}]);
  assert.equal(tree.length,2);
});

test('legacy string memories remain readable while malformed memory objects are ignored',()=>{
  assert.deepEqual(engine.resolveSnapshot([{story:'旧消息',memory:'灯塔已点亮'},{story:'无效记录',memory:{bad:true}}]).memories.map(({text,turn})=>({text,turn})),[{text:'灯塔已点亮',turn:1}]);
});

const resolution = require('../src/lib/memoryResolution.ts');
const diagnostics = require('../src/lib/storyDiagnostics.ts');
const playtest = require('../src/lib/playtestRuntime.ts');

test('keyed memory keeps a changing fact current even when it returns to an old value', () => {
  const history = ['守塔人','旅人','守塔人'].map(owner => ({ story: owner + '保管钥匙', memoryEntries: [{key:'钥匙归属',text:owner+'持有铜钥匙'}] }));
  const facts=engine.resolveSnapshot(history).memories;
  assert.equal(facts.length,3);
  const resolved=resolution.resolveMemory(facts,settings());
  assert.deepEqual(resolved.active.map(f=>[f.text,f.turn]),[['守塔人持有铜钥匙',3]]);
  assert.equal(resolved.superseded.length,2);
  assert.equal(resolution.resolveMemory(engine.resolveSnapshot(history.slice(0,2)).memories,settings()).active[0].text,'旅人持有铜钥匙');
});

test('terminal length delta is preserved before reporting the cutoff with a reason', async () => {
  const body=new Response('data: '+JSON.stringify({choices:[{delta:{content:'灯塔的门缓缓打开。'},finish_reason:'length'}]})+'\n\n').body;
  let raw='',reason='';
  await assert.rejects(async()=>{for await(const text of streamCompletion(body,r=>reason=r))raw+=text;},error=>error.reason==='length');
  assert.equal(raw,'灯塔的门缓缓打开。');
  assert.equal(reason,'length');
});

test('bare DONE at EOF is accepted; content filtering is not presented as a length cutoff', async () => {
  for await(const text of streamCompletion(new Response('data: [DONE]').body))void text;
  await assert.rejects(async()=>{for await(const text of streamCompletion(new Response('data: '+JSON.stringify({choices:[{delta:{},finish_reason:'content_filter'}]})+'\n\n').body))void text;},error=>error.reason==='content_filter');
});

test('incomplete protocol tails are hidden without deleting ordinary brackets or the source', () => {
  const raw='守塔人说：“请进。”<state>{"location":"书房"}</state><memory>["进入书房"]</memory><OPTIONS>["';
  const parsed=engine.parseSessionOutput(raw,3);
  assert.equal(parsed.story,'守塔人说：“请进。”');
  assert.equal(parsed.rawText,raw);
  assert.equal(parsed.incomplete,true);
  assert.deepEqual(parsed.status,{});
  assert.deepEqual(parsed.memory,[]);
  assert.deepEqual(parsed.branches,[]);
  assert.equal(engine.parseSessionOutput('正文<opt',3).story,'正文');
  assert.equal(engine.parseSessionOutput('查看 [北岸] 与 ["旧日志"]。',3).story,'查看 [北岸] 与 ["旧日志"]。');
  const valid=engine.parseSessionOutput('正文<STATE>{"location":"入口"}</STATE><OPTIONS>["观察"]</OPTIONS>',3);
  assert.equal(valid.incomplete,false);
  assert.equal(valid.status.location,'入口');
  assert.equal(valid.branches[0].title,'观察');
});

test('old malformed replies cannot contribute state, memory or prompt history', () => {
  const old={runtimeVersion:1,rawText:'旧回复<options>["',story:'不应进入提示词的标记',status:{location:'错误地点'},memory:['错误事实']};
  const snapshot=engine.resolveSnapshot([{story:'开场',status:{location:'入口'}},old]);
  assert.equal(snapshot.state.location,'入口');
  assert.deepEqual(snapshot.memories,[]);
  const report=engine.buildSessionPrompt(deck,[old,{isUser:true,text:'查看灯塔'}],settings());
  assert.ok(!report.messages.some(m=>m.content.includes('不应进入提示词的标记')));
});

test('partial structured output does not execute state events and remains incomplete', async () => {
  const {completeSessionReply}=require('../src/lib/playtestRuntime.ts');
  const config=engine.normalizeSession({stateFields:[{key:'stamina',label:'体力',type:'number',initial:80,min:0,max:100}],stateEvents:[{id:'tick',name:'每轮消耗',field:'stamina',operator:'gte',value:0,target:'stamina',operation:'add',result:-1,enabled:true}]});
  assert.equal(config.stateEvents.length,1);
  const result=await completeSessionReply('灯塔一片安静。<state>{"stamina":70}</state><options>["',[],config);
  assert.equal(result.incomplete,true);
  assert.deepEqual(result.status,{});
  assert.equal(result.displayText,'灯塔一片安静。');
  assert.ok(!result.runtimeWarnings.some(w=>w.includes('事件已执行')));
});

test('correction replaces recalled text and is bound to selected reply content', () => {
  const original={story:'守卫交出钥匙',memory:['铜钥匙是银色的']};
  const fact=engine.resolveSnapshot([original]).memories[0];
  const config=engine.normalizeSession({memoryCorrections:[{source:fact.source,original:fact.text,replacement:'铜钥匙是铜色的'}]});
  const prompt=engine.buildSessionPrompt(deck,[original,{isUser:true,text:'钥匙颜色'}],config);
  assert.deepEqual(prompt.recalledMemory.map(f=>f.text),['铜钥匙是铜色的']);
  assert.ok(!prompt.messages[0].content.includes('铜钥匙是银色的'));
  const alternate={story:'守卫没有交出钥匙',memory:['铜钥匙是银色的']};
  assert.equal(resolution.resolveMemory(engine.resolveSnapshot([alternate]).memories,config).active[0].text,'铜钥匙是银色的');
  assert.deepEqual(resolution.resolveMemory([],config).active,[]);
});

test('corrections can suppress one source and reusable presets omit personal corrections', () => {
  const facts=engine.resolveSnapshot([{story:'灯塔',memory:['错误线索']}]).memories;
  const config=engine.normalizeSession({memoryCorrections:[{source:facts[0].source,original:facts[0].text,replacement:''},null,{source:3}]});
  assert.equal(config.memoryCorrections.length,1);
  assert.deepEqual(resolution.resolveMemory(facts,config).active,[]);
  assert.deepEqual(require('../src/lib/presetImport.ts').exportPreset(config).session.memoryCorrections,[]);
});

test('structured memory parses with a legacy string projection and skips invalid entries', () => {
  const parsed=engine.parseSessionOutput('回到入口<memory>["曾进入书房",{"key":"钥匙归属","text":"钥匙已归还"},{"key":1,"text":"无效"},null]</memory>',0);
  assert.deepEqual(parsed.memory,['曾进入书房','钥匙已归还']);
  assert.equal(parsed.memoryEntries[1].key,'钥匙归属');
  const snap=engine.resolveSnapshot([parsed,{incomplete:true,memoryEntries:[{key:'钥匙归属',text:'未完成'}]}]);
  assert.deepEqual(resolution.resolveMemory(snap.memories,settings()).active.map(f=>f.text),['曾进入书房','钥匙已归还']);
});

test('diagnostics identifies untriggerable lore, bad state constraints, and oversized prompts', () => {
  const bad={...deck,systemPrompt:'{{unsupported}}',lorebook:[{id:'x',title:'不可达',keys:[],content:'门后是海'}]};
  const issues=diagnostics.diagnoseStory(bad,{...settings(),mode:'adventure',stateFields:[{key:'health',label:'健康',type:'number',initial:'错误'}]});
  assert.ok(issues.some(i=>i.title.includes('无法触发')));
  assert.ok(issues.some(i=>i.level==='error'));
  assert.ok(issues.some(i=>i.title.includes('未支持的宏')));
  assert.ok(diagnostics.diagnoseStory({...deck,systemPrompt:'字'.repeat(30000)},settings()).some(i=>i.title==='无法构建请求'));
});

test('lighthouse sample has valid bounded rules and an isolated opening', () => {
  const sample=diagnostics.LIGHTHOUSE_DECK;
  const config=engine.normalizeSession(sample.sessionDefaults);
  assert.equal(diagnostics.diagnoseStory(sample,config).filter(i=>i.level!=='info').length,0);
  const history=diagnostics.startPlaytest(sample,config);
  assert.deepEqual(engine.resolveSnapshot(history).state,{location:'灯塔入口',inventory:[],stamina:80});
  assert.equal(history[0].session.mode,'adventure');
});

test('playtest and chat share constrained reply processing', async () => {
  const config=engine.normalizeSession(diagnostics.LIGHTHOUSE_DECK.sessionDefaults);
  const history=diagnostics.startPlaytest(diagnostics.LIGHTHOUSE_DECK,config);
  const result=await playtest.completeSessionReply('我留在原地<state>{"stamina":999,"inventory":[],"fake":"x"}</state><memory>[{"key":"钥匙归属","text":"沈舟保管钥匙"}]</memory>',history,config);
  assert.equal(result.status.stamina,100);
  assert.equal(result.status.fake,undefined);
  assert.equal(result.memoryEntries[0].key,'钥匙归属');
  assert.equal(history.length,1);
  assert.ok(result.runtimeWarnings.length>=2);
});

test('playtest sends the real prompt with sampling settings without returning credentials', async () => {
  const originalFetch=global.fetch;
  let calls=0;
  global.fetch=async (url,init)=>{
    calls++;
    const body=JSON.parse(init.body);
    assert.ok(body.messages[0].content.includes('灯塔'));
    assert.equal(body.temperature,0.2);
    assert.equal(init.headers.Authorization,'Bearer test-secret');
    assert.equal(init.headers['x-site-token'],'site-secret');
    assert.ok(url.includes('chat%2Fcompletions'));
    return new Response('data: '+JSON.stringify({choices:[{delta:{content:'沈舟还保管着钥匙。<memory>[{"key":"钥匙归属","text":"沈舟保管钥匙"}]</memory><options>["询问日志"]</options><reply_end/>'}}]})+'\n\ndata: [DONE]\n\n');
  };
  try {
    const config=engine.normalizeSession({...diagnostics.LIGHTHOUSE_DECK.sessionDefaults,sampling:{temperature:0.2}});
    const result=await playtest.runPlaytestTurn({deck:diagnostics.LIGHTHOUSE_DECK,history:diagnostics.startPlaytest(diagnostics.LIGHTHOUSE_DECK,config),settings:config,model:{model:'test-model',baseUrl:'http://localhost:5188/',apiKey:'test-secret'},input:'钥匙在哪里？',siteToken:'site-secret',signal:new AbortController().signal});
    assert.equal(calls,1);
    assert.ok(!JSON.stringify(result).includes('test-secret'));
    assert.ok(!JSON.stringify(result).includes('site-secret'));
    assert.equal(result.model,'test-model');
    assert.equal(result.reply.incomplete,false);
    assert.deepEqual(result.sampling,{temperature:0.2,topP:0.95,maxTokens:2048});
  } finally { global.fetch=originalFetch; }
});

test('playtest cancellation prevents a request and upstream failures never leak response bodies', async () => {
  const abort=new AbortController();abort.abort();
  const args={deck,history:[],settings:settings(),model:{model:'test',baseUrl:'http://localhost'},input:'继续',signal:abort.signal};
  await assert.rejects(playtest.runPlaytestTurn(args),{name:'AbortError'});
  const originalFetch=global.fetch;
  global.fetch=async()=>new Response('secret token echoed by upstream',{status:401});
  try { await assert.rejects(playtest.runPlaytestTurn({...args,signal:new AbortController().signal}),e=>e.message.includes('401')&&!e.message.includes('secret')); }
  finally { global.fetch=originalFetch; }
});

test('chat and playtest share authored openings including state and memory without firing events', () => {
  const config=engine.normalizeSession({...diagnostics.LIGHTHOUSE_DECK.sessionDefaults,playerName:'旅人甲',stateEvents:[{id:'drain',name:'消耗',field:'stamina',operator:'gte',value:0,target:'stamina',operation:'add',result:-5,enabled:true}]});
  const sample={...diagnostics.LIGHTHOUSE_DECK,characterName:'沈舟',firstTurnDemo:{...diagnostics.LIGHTHOUSE_DECK.firstTurnDemo,story:'{{char}}向{{user}}点头'},alternateGreetings:['{{char}}向{{user}}点头','晨雾散去']};
  const openings=diagnostics.storyOpenings(sample,config);
  assert.equal(openings.length,2);
  assert.equal(openings[0].story,'沈舟向旅人甲点头');
  assert.equal(openings[0].status.stamina,80);
  assert.equal(openings[1].status.stamina,80);
  assert.equal(openings[0].memoryEntries[0].key,'铜钥匙归属');
  assert.deepEqual(diagnostics.startPlaytest(sample,config)[0],openings[0]);
  assert.equal(sample.firstTurnDemo.story,'{{char}}向{{user}}点头');
});

test('memory retrieval retains stable keys and budgets the complete rendered fact', () => {
  const fact={text:'物品在桌沿上',turn:3,key:'铜钥匙归属'};
  const full=memoryEngine.retrieveMemory([fact],'铜钥匙',1000,engine.estimateTokens);
  assert.equal(full.selected[0].key,'铜钥匙归属');
  assert.match(full.text,/事项：铜钥匙归属/);
  const cost=engine.estimateTokens(full.text+'\n');
  assert.equal(memoryEngine.retrieveMemory([fact],'铜钥匙',cost-1,engine.estimateTokens).selected.length,0);
  assert.equal(memoryEngine.retrieveMemory([fact],'铜钥匙',cost,engine.estimateTokens).selected.length,1);
});
