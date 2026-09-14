export interface CustomField {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea';
  defaultValue?: string;
}

export interface StatusGauge {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}

export interface CharacterRole {
  name: string;
  role: string;
  desc: string;
  appearance?: string;
  traits?: string;
  avatarUrl?: string;
}

export interface ScenarioMechanism {
  tag: string;
  title: string;
  desc: string;
}

export interface OpeningChoice {
  tag: string;
  text: string;
}

export type ThemePreset = 'cyber' | 'contract' | 'notebook' | 'classic_purple' | 'custom';

export interface EnabledBlocks {
  hero?: boolean;
  story?: boolean;
  roles?: boolean;
  status?: boolean;
  rules?: boolean;
  playerForm?: boolean;
  openings?: boolean;
  summary?: boolean;
}

export interface CardGeneratorOptions {
  title: string;
  badge: string;
  summary: string;
  themePreset?: ThemePreset;
  themeColor?: string; // Hex for custom
  roles: CharacterRole[];
  statusGauges?: StatusGauge[];
  mechanisms: ScenarioMechanism[];
  customFields?: CustomField[];
  openings: OpeningChoice[];
  enabledBlocks?: EnabledBlocks;
}

export function generateCustomHtmlCard(options: CardGeneratorOptions): string {
  const {
    title = '作品设定与角色卡',
    badge = '独家原创 · 沉浸推演',
    summary = '在这里探索不可预测的动人剧情与深度互动。',
    themePreset = 'classic_purple',
    themeColor = '#9d8ec7',
    roles = [],
    statusGauges = [
      { label: '好感信任度', value: 85, max: 100, unit: '%' },
      { label: '心房防线', value: 35, max: 100, unit: '%' }
    ],
    mechanisms = [],
    customFields = [
      { id: 'p_name', label: '玩家姓名', placeholder: '例如：林铭宇 / 顾言', type: 'text' },
      { id: 'p_age', label: '玩家年龄', placeholder: '例如：20 / 24', type: 'text' },
      { id: 'p_look', label: '外貌与身段', placeholder: '例如：身材修长，眼神干净深邃', type: 'text' },
      { id: 'p_trait', label: '核心特质 / 专属能力', placeholder: '例如：掌控欲强，或拥有特殊专属权限', type: 'textarea' },
      { id: 'p_other', label: '补充设定 / 关系羁绊', placeholder: '例如：相识已久，表面克制但内心独占欲深厚', type: 'textarea' }
    ],
    openings = [],
    enabledBlocks = {
      hero: true,
      story: true,
      roles: true,
      status: true,
      rules: true,
      playerForm: true,
      openings: true,
      summary: true
    }
  } = options;

  if (themePreset === 'cyber') {
    return generateCyberHtml({ title, badge, summary, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks });
  } else if (themePreset === 'contract') {
    return generateContractHtml({ title, badge, summary, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks });
  } else if (themePreset === 'notebook') {
    return generateNotebookHtml({ title, badge, summary, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks });
  } else {
    return generateClassicHtml({ title, badge, summary, themeColor, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks, isCustom: themePreset === 'custom' });
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =========================================================================
   1. CYBER OS SKELETON (赛博终端 / 现实修改器)
========================================================================= */
function generateCyberHtml(opts: any): string {
  const { title, badge, summary, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks } = opts;
  const openingsJson = JSON.stringify(openings.map((o: any) => ({ tag: o.tag || 'EXECUTE', text: o.text || '' })));
  const customFieldsJson = JSON.stringify(customFields);

  let gaugesHtml = '';
  if (enabledBlocks.status && statusGauges && statusGauges.length > 0) {
    gaugesHtml = `
      <div class="cyber-section">
        <div class="sec-hdr"><span class="prompt-sym">&gt;</span> SYSTEM_DIAGNOSTICS // 实时状态监控仪</div>
        <div class="gauges-grid">
          ${statusGauges.map((g: any) => {
            const pct = Math.min(Math.max((g.value / (g.max || 100)) * 100, 0), 100);
            return `
              <div class="gauge-item">
                <div class="gauge-meta">
                  <span class="gauge-name">${escapeHtml(g.label)}</span>
                  <span class="gauge-val font-mono">${g.value}${escapeHtml(g.unit || '%')}</span>
                </div>
                <div class="gauge-track">
                  <div class="gauge-bar" style="width:${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  let rolesHtml = '';
  if (enabledBlocks.roles && roles && roles.length > 0) {
    rolesHtml = `
      <div class="cyber-section">
        <div class="sec-hdr"><span class="prompt-sym">&gt;</span> TARGET_ANALYSIS // 目标人物神经档案</div>
        <div class="cyber-grid">
          ${roles.map((r: any) => `
            <div class="cyber-card">
              <div class="card-bar">
                <span class="status-dot"></span>
                <span class="card-title font-mono">${escapeHtml(r.name)} [${escapeHtml(r.role)}]</span>
              </div>
              <p class="card-desc">${escapeHtml(r.desc)}</p>
              ${r.appearance ? `<div class="sub-line"><span class="cyan-tag">外观体态:</span> ${escapeHtml(r.appearance)}</div>` : ''}
              ${r.traits ? `<div class="sub-line"><span class="purple-tag">弱点参数:</span> ${escapeHtml(r.traits)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rulesHtml = '';
  if (enabledBlocks.rules && mechanisms && mechanisms.length > 0) {
    rulesHtml = `
      <div class="cyber-section">
        <div class="sec-hdr"><span class="prompt-sym">&gt;</span> PROTOCOL_DIRECTIVES // 核心因果律与场景规则</div>
        <ul class="proto-list">
          ${mechanisms.map((m: any) => `
            <li>
              <span class="proto-badge">[${escapeHtml(m.tag || 'DIRECTIVE')}]</span>
              <div><b>${escapeHtml(m.title)}</b>: <span>${escapeHtml(m.desc)}</span></div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  let fieldsHtml = '';
  if (enabledBlocks.playerForm && customFields && customFields.length > 0) {
    fieldsHtml = `
      <div class="cyber-section">
        <div class="sec-hdr"><span class="prompt-sym">&gt;</span> INJECTOR_CONFIG // 玩家身份参数注入</div>
        <div class="form-grid">
          ${customFields.map((f: any) => `
            <div class="field ${f.type === 'textarea' ? 'full' : ''}">
              <label><span class="cyan-sym">$</span> ${escapeHtml(f.label)}</label>
              ${f.type === 'textarea'
                ? `<textarea id="${f.id}" rows="2" placeholder="${escapeHtml(f.placeholder)}">${escapeHtml(f.defaultValue || '')}</textarea>`
                : `<input id="${f.id}" type="text" placeholder="${escapeHtml(f.placeholder)}" value="${escapeHtml(f.defaultValue || '')}">`
              }
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg-dark: #090b10;
    --card-bg: #0f131a;
    --border-cyan: #00f2fe;
    --neon-green: #10b981;
    --neon-purple: #8b5cf6;
    --text-main: #e2e8f0;
    --text-dim: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg-dark);
    color: var(--text-main);
    font-family: 'Consolas', 'Courier New', monospace, -apple-system, sans-serif;
    line-height: 1.7;
    padding: 20px 14px 60px;
    background-image: linear-gradient(rgba(0,242,254,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .wrap { max-width: 860px; margin: 0 auto; }
  .font-mono { font-family: monospace; }
  
  .terminal-bar {
    background: #141923;
    border: 1px solid #242d3d;
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-dim);
  }
  .term-dots { display: flex; gap: 6px; }
  .term-dots span { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .dot-red { background: #ef4444; } .dot-yellow { background: #eab308; } .dot-green { background: #10b981; }

  .hero-box {
    background: linear-gradient(180deg, #111622 0%, #0c0f16 100%);
    border: 1px solid #222d42;
    border-radius: 0 0 16px 16px;
    padding: 30px 24px 26px;
    margin-bottom: 22px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,242,254,0.2);
  }
  .badge-tag {
    display: inline-block;
    background: rgba(0,242,254,0.12);
    border: 1px solid var(--border-cyan);
    color: var(--border-cyan);
    padding: 3px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .hero-title {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 14px rgba(0,242,254,0.4);
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  .hero-desc { font-size: 13.5px; color: var(--text-dim); line-height: 1.8; }

  .cyber-section {
    background: var(--card-bg);
    border: 1px solid #1e2638;
    border-radius: 14px;
    padding: 22px 20px;
    margin-bottom: 20px;
    position: relative;
  }
  .sec-hdr {
    font-size: 13px;
    font-weight: 700;
    color: var(--border-cyan);
    letter-spacing: 1px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
  }
  .prompt-sym { color: var(--neon-green); font-weight: bold; }

  .gauges-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
  .gauge-item { background: #131822; padding: 12px 14px; border-radius: 8px; border: 1px solid #1c2436; }
  .gauge-meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
  .gauge-track { height: 8px; background: #1a2233; border-radius: 4px; overflow: hidden; }
  .gauge-bar { height: 100%; background: linear-gradient(90deg, #00f2fe, #10b981); border-radius: 4px; }

  .cyber-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
  .cyber-card { background: #131822; border: 1px solid #202b3e; border-radius: 10px; padding: 14px 16px; }
  .card-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: bold; font-size: 13.5px; color: #fff; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--neon-green); box-shadow: 0 0 6px var(--neon-green); }
  .card-desc { font-size: 12.5px; color: var(--text-dim); margin-bottom: 8px; }
  .sub-line { font-size: 11.5px; color: #cbd5e1; margin-top: 4px; }
  .cyan-tag { color: var(--border-cyan); font-weight: 600; }
  .purple-tag { color: #c084fc; font-weight: 600; }

  .proto-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .proto-list li { display: flex; gap: 10px; font-size: 13px; background: #131822; padding: 10px 14px; border-radius: 8px; border: 1px solid #1e2638; align-items: flex-start; }
  .proto-badge { color: var(--border-cyan); font-size: 11px; font-weight: bold; flex-shrink: 0; }

  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.full { grid-column: 1 / -1; }
  .field label { font-size: 12px; color: #94a3b8; font-weight: 600; }
  .cyan-sym { color: var(--border-cyan); }
  .field input, .field textarea {
    font-family: inherit; font-size: 13px; color: #fff; background: #131822;
    border: 1px solid #243048; border-radius: 8px; padding: 10px 12px; outline: none; transition: .2s;
  }
  .field input:focus, .field textarea:focus { border-color: var(--border-cyan); box-shadow: 0 0 10px rgba(0,242,254,0.25); }

  .open-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .open-card {
    border: 1px solid #202b3e; border-radius: 10px; padding: 12px 14px; background: #131822;
    cursor: pointer; transition: .2s; font-size: 13px; color: #94a3b8;
  }
  .open-card:hover { border-color: var(--border-cyan); background: #161e2c; }
  .open-card.selected { border-color: var(--border-cyan); background: #152233; color: #fff; box-shadow: 0 0 14px rgba(0,242,254,0.2); }
  .open-tag { color: var(--neon-green); font-size: 11px; font-weight: 700; margin-bottom: 4px; }

  .btn-wrap { text-align: center; margin-top: 14px; }
  .cyber-btn {
    font-family: inherit; font-size: 14px; font-weight: 700; letter-spacing: 2px;
    padding: 13px 40px; border-radius: 8px; border: 1px solid var(--border-cyan);
    background: linear-gradient(135deg, rgba(0,242,254,0.2), rgba(16,185,129,0.2));
    color: #fff; cursor: pointer; transition: .2s; box-shadow: 0 0 18px rgba(0,242,254,0.25);
  }
  .cyber-btn:hover { background: linear-gradient(135deg, #00f2fe, #10b981); color: #000; box-shadow: 0 0 25px rgba(0,242,254,0.6); }

  .summary-box {
    background: #0b0e14; border: 1px dashed #2a374f; border-radius: 10px; padding: 16px;
    font-size: 13px; color: #94a3b8; min-height: 80px; white-space: pre-wrap; line-height: 1.8;
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="terminal-bar">
    <div class="term-dots"><span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span></div>
    <span>OVERRIDE_TERMINAL // STATUS: ONLINE</span>
    <span class="font-mono">LATENCY: 14ms</span>
  </div>

  ${enabledBlocks.hero ? `
    <div class="hero-box">
      <span class="badge-tag">${escapeHtml(badge)}</span>
      <h1 class="hero-title">${escapeHtml(title)}</h1>
      <p class="hero-desc">${escapeHtml(summary)}</p>
    </div>
  ` : ''}

  ${gaugesHtml}
  ${rolesHtml}
  ${rulesHtml}
  ${fieldsHtml}

  ${enabledBlocks.openings ? `
    <div class="cyber-section">
      <div class="sec-hdr"><span class="prompt-sym">&gt;</span> EXECUTE_NODE // 开场切入协议</div>
      <div class="open-list" id="openingList"></div>
      <div class="field" style="margin-top:12px;">
        <label><span class="cyan-sym">$</span> 自定义切入指令 (可选)</label>
        <textarea id="customOpening" rows="2" placeholder="在此输入你的自定义剧情分支..."></textarea>
      </div>
      <div class="btn-wrap">
        <button class="cyber-btn" id="genBtn">&gt; 编译注入设定</button>
      </div>
    </div>
  ` : ''}

  ${enabledBlocks.summary ? `
    <div class="cyber-section">
      <div class="sec-hdr"><span class="prompt-sym">&gt;</span> PAYLOAD_OUTPUT // 总结数据缓冲区</div>
      <div class="summary-box" id="summaryBox">点击【编译注入设定】生成注入脚本...</div>
      <div class="btn-wrap">
        <button class="cyber-btn" id="copyBtn" style="width:100%;margin-top:12px;">一 键 复 制 设 定</button>
      </div>
    </div>
  ` : ''}
</div>

<script>
  const OPENINGS = ${openingsJson};
  const CUSTOM_FIELDS = ${customFieldsJson};
  let selectedIndex = 0;
  const listEl = document.getElementById('openingList');
  if (listEl) {
    OPENINGS.forEach((op, i) => {
      const card = document.createElement('div');
      card.className = 'open-card' + (i === 0 ? ' selected' : '');
      card.innerHTML = '<div class="open-tag">&gt; NODE_' + (i + 1) + ' [' + op.tag + ']</div>' + op.text;
      card.addEventListener('click', () => {
        document.querySelectorAll('.open-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedIndex = i;
      });
      listEl.appendChild(card);
    });
  }

  const summaryBox = document.getElementById('summaryBox');
  const genBtn = document.getElementById('genBtn');
  const copyBtn = document.getElementById('copyBtn');
  let lastSummary = '';

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      let out = '【赛博修改器 / 现实注入设定】\\n';
      CUSTOM_FIELDS.forEach(f => {
        const el = document.getElementById(f.id);
        const val = el ? el.value.trim() : '';
        out += f.label + ': ' + (val ? val : '(未填)') + '\\n';
      });

      const customOp = document.getElementById('customOpening');
      const customVal = customOp ? customOp.value.trim() : '';
      const chosenText = customVal ? customVal : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].text : '');
      const chosenTag = customVal ? '自定义指令' : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].tag : '默认');

      out += '\\n【执行切入点 · ' + chosenTag + '】\\n' + chosenText;
      lastSummary = out;
      if (summaryBox) {
        summaryBox.textContent = out;
        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!lastSummary && summaryBox) lastSummary = summaryBox.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(lastSummary).then(() => {
          copyBtn.textContent = 'INJECTION_COPIED ✓';
          setTimeout(() => { copyBtn.textContent = '一 键 复 制 设 定'; }, 1600);
        });
      }
    });
  }
</script>
</body>
</html>`;
}

/* =========================================================================
   2. CONTRACT DOCUMENT SKELETON (手撕契约 / 绝密公文纸)
========================================================================= */
function generateContractHtml(opts: any): string {
  const { title, badge, summary, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks } = opts;
  const openingsJson = JSON.stringify(openings.map((o: any) => ({ tag: o.tag || '履约条款', text: o.text || '' })));
  const customFieldsJson = JSON.stringify(customFields);

  let gaugesHtml = '';
  if (enabledBlocks.status && statusGauges && statusGauges.length > 0) {
    gaugesHtml = `
      <div class="contract-box">
        <div class="clause-hdr">第二条：担保物负荷与履约风险评级</div>
        <div class="contract-gauges">
          ${statusGauges.map((g: any) => `
            <div class="c-gauge">
              <span class="c-gauge-title">${escapeHtml(g.label)}:</span>
              <span class="c-gauge-num font-serif">${g.value}${escapeHtml(g.unit || '%')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rolesHtml = '';
  if (enabledBlocks.roles && roles && roles.length > 0) {
    rolesHtml = `
      <div class="contract-box">
        <div class="clause-hdr">第三条：涉事当事人（甲方 / 乙方）身份查验</div>
        <div class="roles-contract">
          ${roles.map((r: any, idx: number) => `
            <div class="role-clause">
              <div class="role-party">【当事人 ${idx === 0 ? '甲' : '乙'}方】${escapeHtml(r.name)} <small>(${escapeHtml(r.role)})</small></div>
              <p class="role-statement">${escapeHtml(r.desc)}</p>
              ${r.appearance ? `<div class="clause-sub"><b>外貌特质：</b>${escapeHtml(r.appearance)}</div>` : ''}
              ${r.traits ? `<div class="clause-sub"><b>生理要害与违约弱点：</b>${escapeHtml(r.traits)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rulesHtml = '';
  if (enabledBlocks.rules && mechanisms && mechanisms.length > 0) {
    rulesHtml = `
      <div class="contract-box">
        <div class="clause-hdr">第四条：强制执行细则与违约处罚条款</div>
        <ol class="clause-list">
          ${mechanisms.map((m: any, idx: number) => `
            <li>
              <b>4.${idx + 1} 【${escapeHtml(m.title)}】</b>：${escapeHtml(m.desc)}
            </li>
          `).join('')}
        </ol>
      </div>
    `;
  }

  let fieldsHtml = '';
  if (enabledBlocks.playerForm && customFields && customFields.length > 0) {
    fieldsHtml = `
      <div class="contract-box">
        <div class="clause-hdr">第五条：立约人签署登记与身份特质附注</div>
        <div class="contract-form">
          ${customFields.map((f: any) => `
            <div class="c-field ${f.type === 'textarea' ? 'full' : ''}">
              <label>承约人 ${escapeHtml(f.label)}：</label>
              ${f.type === 'textarea'
                ? `<textarea id="${f.id}" rows="2" placeholder="${escapeHtml(f.placeholder)}">${escapeHtml(f.defaultValue || '')}</textarea>`
                : `<input id="${f.id}" type="text" placeholder="${escapeHtml(f.placeholder)}" value="${escapeHtml(f.defaultValue || '')}">`
              }
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - 契约公文</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  :root {
    --paper-bg: #f9f5ea;
    --paper-card: #fffdf7;
    --ink-dark: #2c1b14;
    --ink-light: #523c32;
    --seal-red: #ba1c1c;
    --gold-border: #d4b996;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #eadeca;
    color: var(--ink-dark);
    font-family: 'Noto Serif SC', 'Songti SC', SimSun, serif;
    line-height: 1.85;
    padding: 24px 14px 60px;
  }
  .wrap {
    max-width: 840px; margin: 0 auto;
    background: var(--paper-bg);
    border: 3px double var(--gold-border);
    border-radius: 12px;
    padding: 36px 30px;
    box-shadow: 0 12px 36px rgba(60,35,20,0.18);
    position: relative;
  }
  .seal-stamp {
    position: absolute; right: 30px; top: 26px;
    width: 82px; height: 82px; border: 3px solid var(--seal-red);
    border-radius: 50%; color: var(--seal-red); font-size: 14px; font-weight: 900;
    display: flex; align-items: center; justify-content: center; text-align: center;
    transform: rotate(-15deg); opacity: 0.85; pointer-events: none;
    line-height: 1.2; box-shadow: inset 0 0 8px rgba(186,28,28,0.2);
  }
  .header { text-align: center; margin-bottom: 26px; border-bottom: 2px solid var(--gold-border); padding-bottom: 20px; }
  .badge-tag { font-size: 12px; color: var(--seal-red); letter-spacing: 2px; font-weight: 700; }
  .doc-title { font-size: 26px; font-weight: 900; color: var(--seal-red); margin: 6px 0; letter-spacing: 3px; }
  .doc-sub { font-size: 13px; color: var(--ink-light); letter-spacing: 2px; }

  .contract-box {
    background: var(--paper-card);
    border: 1px solid var(--gold-border);
    border-radius: 8px;
    padding: 20px 22px;
    margin-bottom: 20px;
  }
  .clause-hdr {
    font-size: 15px; font-weight: 700; color: var(--seal-red);
    border-left: 4px solid var(--seal-red); padding-left: 10px; margin-bottom: 12px; letter-spacing: 1px;
  }
  .story-preamble { font-size: 14px; color: var(--ink-light); line-height: 2; text-indent: 2em; }

  .contract-gauges { display: flex; flex-wrap: wrap; gap: 16px; }
  .c-gauge { background: #f2ebd9; border: 1px dashed #cbb79a; padding: 8px 16px; border-radius: 6px; font-size: 13.5px; }
  .c-gauge-title { font-weight: 600; margin-right: 6px; }
  .c-gauge-num { color: var(--seal-red); font-weight: 700; }

  .role-clause { padding: 12px 0; border-bottom: 1px dashed var(--gold-border); }
  .role-clause:last-child { border-bottom: none; }
  .role-party { font-size: 15px; font-weight: 700; color: #1f140e; margin-bottom: 4px; }
  .role-statement { font-size: 13.5px; color: var(--ink-light); }
  .clause-sub { font-size: 12.5px; color: #6b5346; margin-top: 4px; }

  .clause-list { padding-left: 20px; font-size: 13.5px; color: var(--ink-light); }
  .clause-list li { margin-bottom: 8px; }

  .contract-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
  .c-field { display: flex; flex-direction: column; gap: 4px; }
  .c-field.full { grid-column: 1 / -1; }
  .c-field label { font-size: 13px; font-weight: 700; color: var(--ink-dark); }
  .c-field input, .c-field textarea {
    font-family: inherit; font-size: 13.5px; color: #1a0f0a; background: #fffcf4;
    border: 1px solid #cbba9f; border-radius: 4px; padding: 8px 12px; outline: none;
  }
  .c-field input:focus, .c-field textarea:focus { border-color: var(--seal-red); background: #fff; }

  .open-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .open-item {
    border: 1px solid #dcd0ba; border-radius: 6px; padding: 12px 14px; background: #fffcf7;
    cursor: pointer; font-size: 13.5px; color: var(--ink-light); transition: .2s;
  }
  .open-item:hover { border-color: var(--seal-red); background: #fdf8ed; }
  .open-item.selected { border-color: var(--seal-red); background: #fbeee8; font-weight: 600; color: var(--seal-red); }

  .btn-center { text-align: center; margin-top: 10px; }
  .seal-btn {
    font-family: inherit; font-size: 15px; font-weight: 700; letter-spacing: 3px;
    padding: 13px 44px; border-radius: 6px; border: 2px solid var(--seal-red);
    background: var(--seal-red); color: #fff; cursor: pointer; transition: .2s;
    box-shadow: 0 6px 18px rgba(186,28,28,0.25);
  }
  .seal-btn:hover { background: #961212; border-color: #961212; }

  .summary-text {
    background: #fffdf7; border: 1px dashed var(--seal-red); border-radius: 6px; padding: 16px;
    font-size: 13.5px; color: var(--ink-dark); min-height: 80px; white-space: pre-wrap; line-height: 1.8;
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="seal-stamp">即 刻<br>生 效</div>
  
  <div class="header">
    <div class="badge-tag">${escapeHtml(badge)}</div>
    <h1 class="doc-title">${escapeHtml(title)}</h1>
    <div class="doc-sub">特 定 约 束 · 强 制 履 约 协 议 书</div>
  </div>

  ${enabledBlocks.story ? `
    <div class="contract-box">
      <div class="clause-hdr">第一条：立约前情与背景事由</div>
      <p class="story-preamble">${escapeHtml(summary)}</p>
    </div>
  ` : ''}

  ${gaugesHtml}
  ${rolesHtml}
  ${rulesHtml}
  ${fieldsHtml}

  ${enabledBlocks.openings ? `
    <div class="contract-box">
      <div class="clause-hdr">第六条：生效切入条款（选择剧情走向）</div>
      <div class="open-list" id="openingList"></div>
      <div class="c-field" style="margin-top:10px;">
        <label>特别补充协定（自定义开局）：</label>
        <textarea id="customOpening" rows="2" placeholder="在此填入特别设立的补充条款..."></textarea>
      </div>
      <div class="btn-center">
        <button class="seal-btn" id="genBtn">签 署 并 订 立 设 定</button>
      </div>
    </div>
  ` : ''}

  ${enabledBlocks.summary ? `
    <div class="contract-box">
      <div class="clause-hdr">第七条：终审凭证公示栏</div>
      <div class="summary-text" id="summaryBox">点击【签署并订立设定】生成正式履约书...</div>
      <div class="btn-center">
        <button class="seal-btn" id="copyBtn" style="width:100%;margin-top:12px;">一 键 复 制 契 约</button>
      </div>
    </div>
  ` : ''}
</div>

<script>
  const OPENINGS = ${openingsJson};
  const CUSTOM_FIELDS = ${customFieldsJson};
  let selectedIndex = 0;
  const listEl = document.getElementById('openingList');
  if (listEl) {
    OPENINGS.forEach((op, i) => {
      const card = document.createElement('div');
      card.className = 'open-item' + (i === 0 ? ' selected' : '');
      card.innerHTML = '<b>【条款 6.' + (i + 1) + ' · ' + op.tag + '】</b><br>' + op.text;
      card.addEventListener('click', () => {
        document.querySelectorAll('.open-item').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedIndex = i;
      });
      listEl.appendChild(card);
    });
  }

  const summaryBox = document.getElementById('summaryBox');
  const genBtn = document.getElementById('genBtn');
  const copyBtn = document.getElementById('copyBtn');
  let lastSummary = '';

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      let out = '【不可撤销强制履约文书】\\n';
      CUSTOM_FIELDS.forEach(f => {
        const el = document.getElementById(f.id);
        const val = el ? el.value.trim() : '';
        out += '承约人 ' + f.label + ': ' + (val ? val : '(未填)') + '\\n';
      });

      const customOp = document.getElementById('customOpening');
      const customVal = customOp ? customOp.value.trim() : '';
      const chosenText = customVal ? customVal : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].text : '');
      const chosenTag = customVal ? '特别补充条款' : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].tag : '默认');

      out += '\\n【生效条款 · ' + chosenTag + '】\\n' + chosenText;
      lastSummary = out;
      if (summaryBox) {
        summaryBox.textContent = out;
        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!lastSummary && summaryBox) lastSummary = summaryBox.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(lastSummary).then(() => {
          copyBtn.textContent = '已 盖 印 复 制 ✓';
          setTimeout(() => { copyBtn.textContent = '一 键 复 制 契 约'; }, 1600);
        });
      }
    });
  }
</script>
</body>
</html>`;
}

/* =========================================================================
   3. NOTEBOOK / POLAROID SKELETON (拍立得手帐 / 少女私密手记)
========================================================================= */
function generateNotebookHtml(opts: any): string {
  const { title, badge, summary, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks } = opts;
  const openingsJson = JSON.stringify(openings.map((o: any) => ({ tag: o.tag || '心动瞬间', text: o.text || '' })));
  const customFieldsJson = JSON.stringify(customFields);

  let gaugesHtml = '';
  if (enabledBlocks.status && statusGauges && statusGauges.length > 0) {
    gaugesHtml = `
      <div class="note-box">
        <div class="washi-tape yellow-tape"></div>
        <div class="note-hdr">❤ 心率与害羞体温手记</div>
        <div class="note-gauges">
          ${statusGauges.map((g: any) => `
            <div class="heart-gauge">
              <span class="heart-icon">💖</span>
              <div class="heart-meta">
                <b>${escapeHtml(g.label)}</b>: <span class="heart-val">${g.value}${escapeHtml(g.unit || '%')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rolesHtml = '';
  if (enabledBlocks.roles && roles && roles.length > 0) {
    rolesHtml = `
      <div class="note-box">
        <div class="washi-tape pink-tape"></div>
        <div class="note-hdr">🌸 私藏拍立得档案</div>
        <div class="polaroid-grid">
          ${roles.map((r: any) => `
            <div class="polaroid-card">
              <div class="tape-sticker"></div>
              <div class="polaroid-name">${escapeHtml(r.name)} · <small>${escapeHtml(r.role)}</small></div>
              <p class="polaroid-desc">${escapeHtml(r.desc)}</p>
              ${r.appearance ? `<div class="p-meta">✨ ${escapeHtml(r.appearance)}</div>` : ''}
              ${r.traits ? `<div class="p-meta">🤫 ${escapeHtml(r.traits)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rulesHtml = '';
  if (enabledBlocks.rules && mechanisms && mechanisms.length > 0) {
    rulesHtml = `
      <div class="note-box">
        <div class="washi-tape blue-tape"></div>
        <div class="note-hdr">🎀 属于我们的默契小秘密</div>
        <div class="sticky-notes">
          ${mechanisms.map((m: any) => `
            <div class="post-it">
              <span class="post-pin">📌</span>
              <b>${escapeHtml(m.title)}</b>: ${escapeHtml(m.desc)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let fieldsHtml = '';
  if (enabledBlocks.playerForm && customFields && customFields.length > 0) {
    fieldsHtml = `
      <div class="note-box">
        <div class="washi-tape yellow-tape"></div>
        <div class="note-hdr">✏️ 你的专属私密便签（写给我看）</div>
        <div class="note-form">
          ${customFields.map((f: any) => `
            <div class="n-field ${f.type === 'textarea' ? 'full' : ''}">
              <label>💌 ${escapeHtml(f.label)}：</label>
              ${f.type === 'textarea'
                ? `<textarea id="${f.id}" rows="2" placeholder="${escapeHtml(f.placeholder)}">${escapeHtml(f.defaultValue || '')}</textarea>`
                : `<input id="${f.id}" type="text" placeholder="${escapeHtml(f.placeholder)}" value="${escapeHtml(f.defaultValue || '')}">`
              }
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg-cream: #fff7f9;
    --paper-white: #ffffff;
    --heart-pink: #ec4899;
    --soft-purple: #a855f7;
    --text-dark: #4a3843;
    --text-muted: #83677b;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg-cream);
    color: var(--text-dark);
    font-family: 'Noto Serif SC', -apple-system, sans-serif;
    line-height: 1.85;
    padding: 24px 14px 60px;
    background-image: radial-gradient(#fbcfe8 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .wrap { max-width: 820px; margin: 0 auto; }

  .hero-card {
    background: #fff;
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    position: relative;
    border: 2px solid #fce7f3;
    box-shadow: 0 10px 30px rgba(236,72,153,0.12);
    margin-bottom: 24px;
  }
  .badge-ribbon {
    display: inline-block; background: linear-gradient(135deg, #f472b6, #ec4899);
    color: #fff; font-size: 11.5px; font-weight: 700; padding: 4px 16px; border-radius: 999px;
    letter-spacing: 1px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(236,72,153,0.3);
  }
  .hero-title { font-size: 24px; font-weight: 700; color: #831843; margin-bottom: 10px; }
  .hero-desc { font-size: 13.5px; color: var(--text-muted); }

  .note-box {
    background: #fff; border: 1.5px solid #fbcfe8; border-radius: 18px;
    padding: 24px 22px; margin-bottom: 22px; position: relative;
    box-shadow: 0 8px 24px rgba(236,72,153,0.06);
  }
  .washi-tape {
    position: absolute; top: -10px; left: 30px; width: 80px; height: 20px;
    border-radius: 2px; opacity: 0.85; transform: rotate(-2deg);
  }
  .yellow-tape { background: rgba(253,224,71,0.7); box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .pink-tape { background: rgba(244,114,182,0.6); box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
  .blue-tape { background: rgba(147,197,253,0.6); box-shadow: 0 2px 6px rgba(0,0,0,0.05); }

  .note-hdr {
    font-size: 16px; font-weight: 700; color: #be185d; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .story-text { font-size: 14px; color: #644a5b; line-height: 1.9; }

  .note-gauges { display: flex; flex-wrap: wrap; gap: 14px; }
  .heart-gauge {
    display: flex; align-items: center; gap: 10px; background: #fdf2f8;
    border: 1px solid #fbcfe8; border-radius: 12px; padding: 10px 16px; font-size: 13px;
  }
  .heart-val { color: var(--heart-pink); font-weight: 700; }

  .polaroid-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
  .polaroid-card {
    background: #fffdfd; border: 1px solid #f9a8d4; border-radius: 14px; padding: 16px;
    box-shadow: 0 6px 16px rgba(236,72,153,0.08); transform: rotate(-0.5deg); transition: .2s;
  }
  .polaroid-card:hover { transform: rotate(0deg) translateY(-2px); }
  .polaroid-name { font-size: 15px; font-weight: 700; color: #9d174d; margin-bottom: 6px; }
  .polaroid-desc { font-size: 13px; color: #6b5062; margin-bottom: 8px; }
  .p-meta { font-size: 12px; color: #86198f; margin-top: 4px; }

  .sticky-notes { display: flex; flex-direction: column; gap: 10px; }
  .post-it {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 16px;
    font-size: 13px; color: #78350f; position: relative;
  }
  .post-pin { position: absolute; right: 10px; top: 8px; }

  .note-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
  .n-field { display: flex; flex-direction: column; gap: 6px; }
  .n-field.full { grid-column: 1 / -1; }
  .n-field label { font-size: 13px; font-weight: 600; color: #831843; }
  .n-field input, .n-field textarea {
    font-family: inherit; font-size: 13.5px; color: #4c0519; background: #fffdfd;
    border: 1.5px solid #fbcfe8; border-radius: 10px; padding: 10px 12px; outline: none; transition: .2s;
  }
  .n-field input:focus, .n-field textarea:focus { border-color: var(--heart-pink); box-shadow: 0 0 10px rgba(236,72,153,0.2); }

  .open-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .open-note {
    border: 1.5px solid #fbcfe8; border-radius: 12px; padding: 14px 16px; background: #fff;
    cursor: pointer; font-size: 13px; color: #704b63; transition: .2s;
  }
  .open-note:hover { border-color: var(--heart-pink); background: #fdf2f8; }
  .open-note.selected { border-color: var(--heart-pink); background: linear-gradient(135deg, #fff1f2, #fdf2f8); font-weight: 600; }
  .open-tag { color: var(--heart-pink); font-size: 11.5px; font-weight: 700; margin-bottom: 4px; }

  .btn-center { text-align: center; margin-top: 10px; }
  .heart-btn {
    font-family: inherit; font-size: 15px; font-weight: 700; letter-spacing: 2px;
    padding: 13px 44px; border-radius: 999px; border: none;
    background: linear-gradient(135deg, #ec4899, #a855f7); color: #fff; cursor: pointer;
    box-shadow: 0 8px 24px rgba(236,72,153,0.35); transition: .2s;
  }
  .heart-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(236,72,153,0.45); }

  .summary-box {
    background: #fdf2f8; border: 1.5px dashed #f472b6; border-radius: 12px; padding: 16px;
    font-size: 13px; color: #831843; min-height: 80px; white-space: pre-wrap; line-height: 1.8;
  }
</style>
</head>
<body>
<div class="wrap">
  ${enabledBlocks.hero ? `
    <div class="hero-card">
      <span class="badge-ribbon">${escapeHtml(badge)}</span>
      <h1 class="hero-title">${escapeHtml(title)}</h1>
      <p class="hero-desc">${escapeHtml(summary)}</p>
    </div>
  ` : ''}

  ${enabledBlocks.story ? `
    <div class="note-box">
      <div class="washi-tape yellow-tape"></div>
      <div class="note-hdr">📖 我们的故事开端</div>
      <p class="story-text">${escapeHtml(summary)}</p>
    </div>
  ` : ''}

  ${gaugesHtml}
  ${rolesHtml}
  ${rulesHtml}
  ${fieldsHtml}

  ${enabledBlocks.openings ? `
    <div class="note-box">
      <div class="washi-tape pink-tape"></div>
      <div class="note-hdr">🎬 选一个你喜欢的浪漫切入点</div>
      <div class="open-list" id="openingList"></div>
      <div class="n-field" style="margin-top:10px;">
        <label>自定义我们今晚的开局：</label>
        <textarea id="customOpening" rows="2" placeholder="写下你脑海里构思的动人桥段..."></textarea>
      </div>
      <div class="btn-center">
        <button class="heart-btn" id="genBtn">生 成 专 属 甜 蜜 设 定</button>
      </div>
    </div>
  ` : ''}

  ${enabledBlocks.summary ? `
    <div class="note-box">
      <div class="washi-tape blue-tape"></div>
      <div class="note-hdr">💌 汇 总 便 签</div>
      <div class="summary-box" id="summaryBox">点击【生成专属甜蜜设定】将设定汇总到这里...</div>
      <div class="btn-center">
        <button class="heart-btn" id="copyBtn" style="width:100%;margin-top:12px;">一 键 复 制 甜 蜜 设 定</button>
      </div>
    </div>
  ` : ''}
</div>

<script>
  const OPENINGS = ${openingsJson};
  const CUSTOM_FIELDS = ${customFieldsJson};
  let selectedIndex = 0;
  const listEl = document.getElementById('openingList');
  if (listEl) {
    OPENINGS.forEach((op, i) => {
      const card = document.createElement('div');
      card.className = 'open-note' + (i === 0 ? ' selected' : '');
      card.innerHTML = '<div class="open-tag">❤ 分支 ' + (i + 1) + ' [' + op.tag + ']</div>' + op.text;
      card.addEventListener('click', () => {
        document.querySelectorAll('.open-note').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedIndex = i;
      });
      listEl.appendChild(card);
    });
  }

  const summaryBox = document.getElementById('summaryBox');
  const genBtn = document.getElementById('genBtn');
  const copyBtn = document.getElementById('copyBtn');
  let lastSummary = '';

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      let out = '【浪漫手帐 · 玩家专属设定】\\n';
      CUSTOM_FIELDS.forEach(f => {
        const el = document.getElementById(f.id);
        const val = el ? el.value.trim() : '';
        out += f.label + ': ' + (val ? val : '(未填)') + '\\n';
      });

      const customOp = document.getElementById('customOpening');
      const customVal = customOp ? customOp.value.trim() : '';
      const chosenText = customVal ? customVal : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].text : '');
      const chosenTag = customVal ? '自定义甜蜜开场' : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].tag : '默认');

      out += '\\n【心动走向 · ' + chosenTag + '】\\n' + chosenText;
      lastSummary = out;
      if (summaryBox) {
        summaryBox.textContent = out;
        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!lastSummary && summaryBox) lastSummary = summaryBox.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(lastSummary).then(() => {
          copyBtn.textContent = '已 甜 蜜 复 制 ✓';
          setTimeout(() => { copyBtn.textContent = '一 键 复 制 甜 蜜 设 定'; }, 1600);
        });
      }
    });
  }
</script>
</body>
</html>`;
}

/* =========================================================================
   4. CLASSIC ELEGANCE / CUSTOM PALETTE SKELETON (典雅紫金 / 自由调色)
========================================================================= */
function generateClassicHtml(opts: any): string {
  const { title, badge, summary, themeColor, roles, statusGauges, mechanisms, customFields, openings, enabledBlocks, isCustom } = opts;
  const openingsJson = JSON.stringify(openings.map((o: any) => ({ tag: o.tag || '开局节点', text: o.text || '' })));
  const customFieldsJson = JSON.stringify(customFields);

  const primary = isCustom && themeColor ? themeColor : '#9d8ec7';
  const secondary = '#d4a373';

  let gaugesHtml = '';
  if (enabledBlocks.status && statusGauges && statusGauges.length > 0) {
    gaugesHtml = `
      <div class="card">
        <h2 class="section-title">核心状态监控</h2>
        <div class="gauges-flex">
          ${statusGauges.map((g: any) => `
            <div class="c-gauge">
              <span class="g-name">${escapeHtml(g.label)}:</span>
              <span class="g-val">${g.value}${escapeHtml(g.unit || '%')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rolesHtml = '';
  if (enabledBlocks.roles && roles && roles.length > 0) {
    rolesHtml = `
      <div class="card">
        <h2 class="section-title">人物介绍</h2>
        <div class="profile-grid">
          ${roles.map((r: any) => `
            <div class="p-item">
              <h4><span class="dot"></span>${escapeHtml(r.name)} · <small>${escapeHtml(r.role)}</small></h4>
              <p>${escapeHtml(r.desc)}</p>
              ${r.appearance ? `<div class="sub-line"><b>外貌神韵：</b>${escapeHtml(r.appearance)}</div>` : ''}
              ${r.traits ? `<div class="sub-line"><b>特征细节：</b>${escapeHtml(r.traits)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let rulesHtml = '';
  if (enabledBlocks.rules && mechanisms && mechanisms.length > 0) {
    rulesHtml = `
      <div class="card">
        <h2 class="section-title">核心机制与场景</h2>
        <ul class="mech-list">
          ${mechanisms.map((m: any) => `
            <li>
              <span class="badge">${escapeHtml(m.tag || '机制')}</span>
              <div><b>${escapeHtml(m.title)}</b>：${escapeHtml(m.desc)}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  let fieldsHtml = '';
  if (enabledBlocks.playerForm && customFields && customFields.length > 0) {
    fieldsHtml = `
      <div class="card">
        <h2 class="section-title">玩家专属设定</h2>
        <div class="form-grid">
          ${customFields.map((f: any) => `
            <div class="field ${f.type === 'textarea' ? 'full' : ''}">
              <label>${escapeHtml(f.label)}</label>
              ${f.type === 'textarea'
                ? `<textarea id="${f.id}" rows="2" placeholder="${escapeHtml(f.placeholder)}">${escapeHtml(f.defaultValue || '')}</textarea>`
                : `<input id="${f.id}" type="text" placeholder="${escapeHtml(f.placeholder)}" value="${escapeHtml(f.defaultValue || '')}">`
              }
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --primary: ${primary};
    --secondary: ${secondary};
    --text-dark: #2d2d2d;
    --text-muted: #666;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: linear-gradient(180deg,#fdfcf8 0%,#f7f2ff 45%,#fdfcf8 100%);
    color: var(--text-dark);
    font-family: 'Noto Serif SC', serif;
    line-height: 1.85;
    padding: 18px 14px 60px;
  }
  .wrap { max-width: 860px; margin: 0 auto; }
  .hero {
    text-align: center; padding: 42px 24px; background: linear-gradient(135deg,#fff7f0,#f6ecff);
    border-radius: 28px; border: 1px solid #efe6ff; box-shadow: 0 12px 40px rgba(120,90,160,0.1); margin-bottom: 22px;
  }
  .tag { display: inline-block; background: #f3e8ff; color: var(--primary); padding: 6px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 12px; }
  .title { font-size: 26px; font-weight: 700; color: #2b2638; margin-bottom: 8px; }
  .sub { font-size: 13.5px; color: var(--text-muted); }

  .card { background: #fff; border: 1px solid #efe6ff; border-radius: 24px; padding: 26px 22px; margin-bottom: 22px; box-shadow: 0 6px 20px rgba(120,90,160,0.06); }
  .section-title { font-size: 17px; font-weight: 700; color: #352f44; border-left: 4px solid var(--primary); padding-left: 12px; margin-bottom: 14px; }
  .story-text { font-size: 14.5px; color: #4a4458; line-height: 1.95; }

  .gauges-flex { display: flex; flex-wrap: wrap; gap: 14px; }
  .c-gauge { background: #faf8ff; border: 1px solid #efe8fb; padding: 8px 16px; border-radius: 12px; font-size: 13px; }
  .g-name { color: #5f5873; font-weight: 600; }
  .g-val { color: var(--primary); font-weight: 700; margin-left: 6px; }

  .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
  .p-item { background: #faf8ff; border: 1px solid #efe8fb; border-radius: 18px; padding: 16px; }
  .p-item h4 { font-size: 15px; font-weight: 700; color: #342e42; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .p-item .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); }
  .p-item p { font-size: 13.5px; color: #5a5468; }
  .sub-line { font-size: 12px; color: #7c7689; margin-top: 4px; }

  .mech-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .mech-list li { display: flex; gap: 12px; padding: 12px 14px; border-radius: 14px; background: #fbf9ff; border: 1px solid #f1ebfc; font-size: 13.5px; }
  .mech-list .badge { flex-shrink: 0; background: #f3e8ff; color: var(--primary); font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 999px; }

  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.full { grid-column: 1 / -1; }
  .field label { font-size: 13px; font-weight: 600; color: #5f5873; }
  .field input, .field textarea {
    font-family: inherit; font-size: 14px; color: #3d374d; background: #fdfcff;
    border: 1.5px solid #ece5fa; border-radius: 12px; padding: 10px 14px; outline: none;
  }
  .field input:focus, .field textarea:focus { border-color: var(--primary); }

  .open-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .open-card {
    border: 1.5px solid #efe9fb; border-radius: 16px; padding: 14px 16px; background: #fdfcff;
    cursor: pointer; font-size: 13.5px; color: #4f4960; transition: .2s;
  }
  .open-card:hover { border-color: var(--primary); background: #fbf8ff; }
  .open-card.selected { border-color: var(--primary); background: #f9f5ff; font-weight: 600; }
  .open-tag { color: var(--primary); font-size: 11.5px; font-weight: 700; margin-bottom: 4px; }

  .btn-center { text-align: center; margin-top: 10px; }
  .main-btn {
    font-family: inherit; font-size: 15px; font-weight: 700; letter-spacing: 3px;
    padding: 14px 48px; border-radius: 999px; border: none;
    background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #fff;
    cursor: pointer; box-shadow: 0 10px 26px rgba(157,142,199,0.3); transition: .2s;
  }
  .main-btn:hover { transform: translateY(-2px); }

  .summary-inner {
    background: #fffdfb; border: 1px dashed #e3d9f5; border-radius: 16px; padding: 18px;
    font-size: 13.5px; color: #514b62; min-height: 80px; white-space: pre-wrap; line-height: 1.8;
  }
</style>
</head>
<body>
<div class="wrap">
  ${enabledBlocks.hero ? `
    <div class="hero">
      <span class="tag">${escapeHtml(badge)}</span>
      <h1 class="title">${escapeHtml(title)}</h1>
      <p class="sub">沉 浸 式 角 色 扮 演 · 独 家 设 定</p>
    </div>
  ` : ''}

  ${enabledBlocks.story ? `
    <div class="card">
      <h2 class="section-title">背景故事</h2>
      <p class="story-text">${escapeHtml(summary)}</p>
    </div>
  ` : ''}

  ${gaugesHtml}
  ${rolesHtml}
  ${rulesHtml}
  ${fieldsHtml}

  ${enabledBlocks.openings ? `
    <div class="card">
      <h2 class="section-title">开场白选择</h2>
      <div class="open-list" id="openingList"></div>
      <div class="field" style="margin-top:10px;">
        <label>自定义开场白 (可选)</label>
        <textarea id="customOpening" rows="2" placeholder="在此输入自定义切入剧情..."></textarea>
      </div>
      <div class="btn-center">
        <button class="main-btn" id="genBtn">生 成 设 定</button>
      </div>
    </div>
  ` : ''}

  ${enabledBlocks.summary ? `
    <div class="card">
      <h2 class="section-title">总结区</h2>
      <div class="summary-inner" id="summaryBox">点击【生成设定】按钮生成设定数据...</div>
      <div class="btn-center">
        <button class="main-btn" id="copyBtn" style="width:100%;margin-top:12px;">一 键 复 制</button>
      </div>
    </div>
  ` : ''}
</div>

<script>
  const OPENINGS = ${openingsJson};
  const CUSTOM_FIELDS = ${customFieldsJson};
  let selectedIndex = 0;
  const listEl = document.getElementById('openingList');
  if (listEl) {
    OPENINGS.forEach((op, i) => {
      const card = document.createElement('div');
      card.className = 'open-card' + (i === 0 ? ' selected' : '');
      card.innerHTML = '<div class="open-tag">' + op.tag + '</div>' + op.text;
      card.addEventListener('click', () => {
        document.querySelectorAll('.open-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedIndex = i;
      });
      listEl.appendChild(card);
    });
  }

  const summaryBox = document.getElementById('summaryBox');
  const genBtn = document.getElementById('genBtn');
  const copyBtn = document.getElementById('copyBtn');
  let lastSummary = '';

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      let out = '【玩家设定】\\n';
      CUSTOM_FIELDS.forEach(f => {
        const el = document.getElementById(f.id);
        const val = el ? el.value.trim() : '';
        out += f.label + ': ' + (val ? val : '(未填)') + '\\n';
      });

      const customOp = document.getElementById('customOpening');
      const customVal = customOp ? customOp.value.trim() : '';
      const chosenText = customVal ? customVal : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].text : '');
      const chosenTag = customVal ? '自定义开场白' : (OPENINGS[selectedIndex] ? OPENINGS[selectedIndex].tag : '默认');

      out += '\\n【开场白 · ' + chosenTag + '】\\n' + chosenText;
      lastSummary = out;
      if (summaryBox) {
        summaryBox.textContent = out;
        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!lastSummary && summaryBox) lastSummary = summaryBox.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(lastSummary).then(() => {
          copyBtn.textContent = '已 复 制 ✓';
          setTimeout(() => { copyBtn.textContent = '一 键 复 制'; }, 1600);
        });
      }
    });
  }
</script>
</body>
</html>`;
}
