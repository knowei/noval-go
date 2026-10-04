// Local-only integration fixture; no real database or model requests.
const http = require('node:http');
const saves = new Map();
const privateCards = new Map();
const illustrations = new Map();
const fixtureUser = { id: 'fixture_user', username: 'fixture', nickname: '验收账号', role: 'user', avatar: '🧭', points: 9999 };
const story = { id: 'test_lighthouse', title: '灯塔来信 · 验收剧本', systemPrompt: '你是灯塔守卫，陪同旅人寻找失落的航海日志。', desc: '用于验证会话工作台。', lorebook: [{ id: 'key', title: '铜钥匙', keys: ['钥匙'], content: '铜钥匙能打开灯塔的书房。' }] };
let round = 0;
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  let body = ''; for await (const chunk of req) body += chunk;
  let input = {}; try { input = JSON.parse(body || '{}'); } catch {}
  if (url.pathname === '/images/generations') {
    if (input.model === 'fail-image') { res.statusCode=503;return res.end('{"error":"fixture failure"}'); }
    const file=process.env.NOVAL_IMAGE_FIXTURE;
    if(!file){res.statusCode=503;return res.end('{"error":"No image fixture configured"}');}
    return setTimeout(()=>res.end(require('node:fs').readFileSync(file)),500);
  }
  if (url.pathname === '/api/illustrations' || url.pathname.startsWith('/api/illustrations/')) {
    if(req.headers.authorization!=='Bearer fixture_token'){res.statusCode=401;return res.end('{}');}
    if(req.method==='POST'){
      const id=require('node:crypto').randomUUID().replaceAll('-','');
      const item={id,mime:'image/jpeg',metadata:input.metadata,createdAt:new Date().toISOString(),base64:input.base64};
      illustrations.set(id,item);const {base64,...ref}=item;return res.end(JSON.stringify(ref));
    }
    if(url.pathname==='/api/illustrations')return res.end(JSON.stringify([...illustrations.values()].map(({base64,...ref})=>ref)));
    const item=illustrations.get(url.pathname.split('/').at(-1));
    if(!item){res.statusCode=404;return res.end('{}');}
    res.setHeader('Content-Type',item.mime);return res.end(Buffer.from(item.base64,'base64'));
  }
  if (url.pathname === '/api/auth/login') return res.end(JSON.stringify({ success: true, token: 'fixture_token', user: fixtureUser }));
  if (url.pathname === '/api/user/profile') return res.end(JSON.stringify(req.headers.authorization === 'Bearer fixture_token' ? fixtureUser : { id: url.searchParams.get('user_id'), nickname: '设备访客', is_guest: true }));
  if (url.pathname === '/api/private-cards') {
    if (req.headers.authorization !== 'Bearer fixture_token') { res.statusCode = 401; return res.end('{"error":"请登录测试账号"}'); }
    if (req.method === 'POST') {
      const previous=privateCards.get(input.id);
      if ((previous?.revision || 0) !== input.revision) { res.statusCode=409; return res.end('{"error":"版本冲突，请刷新"}'); }
      const next={id:input.id,deck:input.deck || previous.deck,revision:input.revision+1,deleted:input.action==='trash',updated_at:new Date().toISOString()};
      privateCards.set(input.id,next);return res.end(JSON.stringify(next));
    }
    return res.end(JSON.stringify([...privateCards.values()].filter(c=>!url.searchParams.has('id') || c.id===url.searchParams.get('id'))));
  }
  if (url.pathname === '/chat/completions') {
    round++;
    res.setHeader('Content-Type', 'text/event-stream');
    if (input.messages?.at(-1)?.content?.startsWith('这是同一条回复的断点补全')) {
      const prefix=input.messages.at(-2)?.content || '';
      const content=prefix.endsWith('<options>["') ? '检查日志"]</options><reply_end/>' : '推开灯塔的门。<state>{"location":"灯塔入口"}</state><memory>["守塔人打开灯塔的门"]</memory><options>["检查日志","观察天气"]</options><reply_end/>';
      return res.end('data: '+JSON.stringify({choices:[{delta:{content},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n');
    }
    if (process.env.NOVAL_STREAM_FIXTURE === 'plain') {
      const content='海风拂过石阶，守塔人拿着旧日志走到门前。他仔细核对了日期，又望了一眼窗外的海面，正准备';
      return res.end('data: '+JSON.stringify({choices:[{delta:{content},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n');
    }
    if (process.env.NOVAL_STREAM_FIXTURE && input.max_tokens < 4096) {
      const content='守塔人说：“请先检查桌上的航海日志。”<state>{"location":"书房"}</state><memory>["看见航海日志"]</memory><options>["';
      const finish_reason=process.env.NOVAL_STREAM_FIXTURE==='length'?'length':'stop';
      return res.end('data: '+JSON.stringify({choices:[{delta:{content},finish_reason}]})+'\n\ndata: [DONE]\n\n');
    }
    const content = `守卫递来一封信：“书房就在楼上。”你可以先询问信件的来源。第${round}次回复。<state>{"inventory":["信件"],"location":"灯塔入口"}</state><memory>["守卫交给旅人一封信"]</memory><options>["询问信件来源","查看铜钥匙","前往书房"]</options><reply_end/>`;
    res.end('data: ' + JSON.stringify({ choices: [{ delta: { content } }] }) + '\n\ndata: [DONE]\n\n'); return;
  }
  if (url.pathname === '/api/auth/site-status') return res.end(JSON.stringify({ isProtected: false, authenticated: true }));
  if (url.pathname === '/api/stories') return res.end(JSON.stringify(url.searchParams.has('id') ? story : { stories: { test_lighthouse: story } }));
  if (url.pathname === '/api/conversations' && req.method === 'POST') { saves.set(input.id, input); return res.end('{"success":true}'); }
  if (url.pathname === '/api/conversations/delete') { saves.delete(input.id); return res.end('{"success":true}'); }
  if (url.pathname === '/api/conversations') return res.end(JSON.stringify(url.searchParams.has('id') ? saves.get(url.searchParams.get('id')) || null : [...saves.values()].filter(s => s.user_id === url.searchParams.get('user_id'))));
  if (url.pathname === '/api/plaza/featured') return res.end(JSON.stringify([{ id: 'fixture', deckKey: story.id, title: story.title, desc: story.desc }]));
  if (url.pathname === '/api/auth/me') return res.end(JSON.stringify(req.headers.authorization === 'Bearer fixture_token' ? { user: fixtureUser } : {error:'guest'}));
  res.end('[]');
}).listen(5188, '127.0.0.1', () => console.log('Fixture listening on 127.0.0.1:5188'));
