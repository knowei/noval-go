export interface CharacterRole {
  name: string;
  role: string;
  desc: string;
  appearance?: string;
  traits?: string;
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

export interface CardGeneratorOptions {
  title: string;
  badge: string;
  summary: string;
  theme?: 'purple' | 'pink' | 'rose' | 'cyan' | 'amber' | 'dark';
  roles: CharacterRole[];
  mechanisms: ScenarioMechanism[];
  openings: OpeningChoice[];
}

export function generateCustomHtmlCard(options: CardGeneratorOptions): string {
  const {
    title = '作品设定与角色卡',
    badge = '独家原创 · 沉浸推演',
    summary = '在这里探索不可预测的动人剧情与深度互动。',
    theme = 'purple',
    roles = [],
    mechanisms = [],
    openings = []
  } = options;

  // Theme palettes
  let primaryColor = '#9d8ec7';
  let secondaryColor = '#d4a373';
  let bgGradient = 'linear-gradient(180deg,#fdfcf8 0%,#f7f2ff 45%,#fdfcf8 100%)';
  let heroBg = 'linear-gradient(135deg,#fff7f0 0%,#f6ecff 55%,#fdfcf8 100%)';
  let tagColor = '#7c6bb0';

  if (theme === 'pink') {
    primaryColor = '#ec4899';
    secondaryColor = '#f43f5e';
    bgGradient = 'linear-gradient(180deg,#fffbfa 0%,#fdf2f8 45%,#fffbfa 100%)';
    heroBg = 'linear-gradient(135deg,#fff1f2 0%,#fce7f3 55%,#fffbfa 100%)';
    tagColor = '#db2777';
  } else if (theme === 'rose') {
    primaryColor = '#e11d48';
    secondaryColor = '#d97706';
    bgGradient = 'linear-gradient(180deg,#fffcf9 0%,#fff1f2 45%,#fffcf9 100%)';
    heroBg = 'linear-gradient(135deg,#fff7ed 0%,#ffe4e6 55%,#fffcf9 100%)';
    tagColor = '#be123c';
  } else if (theme === 'cyan') {
    primaryColor = '#0891b2';
    secondaryColor = '#6366f1';
    bgGradient = 'linear-gradient(180deg,#f0fdfa 0%,#f0f9ff 45%,#fdfcff 100%)';
    heroBg = 'linear-gradient(135deg,#e0f2fe 0%,#cffafe 55%,#fdfcff 100%)';
    tagColor = '#0284c7';
  } else if (theme === 'amber') {
    primaryColor = '#d97706';
    secondaryColor = '#b45309';
    bgGradient = 'linear-gradient(180deg,#fffbeb 0%,#fff7ed 45%,#fdfcf8 100%)';
    heroBg = 'linear-gradient(135deg,#fef3c7 0%,#ffedd5 55%,#fdfcf8 100%)';
    tagColor = '#b45309';
  }

  let profileCardsHtml = '';
  if (roles && roles.length > 0) {
    for (const r of roles) {
      const rName = r.name || '登场人物';
      const rRole = r.role || '角色身份';
      const rDesc = r.desc || '';
      const rLook = r.appearance ? `<div style="margin-top:6px;font-size:12px;color:#7c7689;"><b>外貌形体：</b>${escapeHtml(r.appearance)}</div>` : '';
      const rTraits = r.traits ? `<div style="margin-top:4px;font-size:12px;color:#7c7689;"><b>特征细节：</b>${escapeHtml(r.traits)}</div>` : '';

      profileCardsHtml += `
        <div class="p-item">
            <h4><span class="dot"></span>${escapeHtml(rName)} · <small style="font-weight:normal;color:#7e778f;">${escapeHtml(rRole)}</small></h4>
            <p>${escapeHtml(rDesc)}</p>
            ${rLook}
            ${rTraits}
        </div>
      `;
    }
  } else {
    profileCardsHtml = `
      <div class="p-item">
          <h4><span class="dot"></span>核心人物</h4>
          <p>性格鲜明，情感充沛，在与玩家的互动中展现出细腻的心绪波澜与真实神态。</p>
      </div>
    `;
  }

  let mechItemsHtml = '';
  if (mechanisms && mechanisms.length > 0) {
    for (const m of mechanisms) {
      mechItemsHtml += `
        <li>
            <span class="badge">${escapeHtml(m.tag || '机制')}</span>
            <div><b>${escapeHtml(m.title)}</b>：${escapeHtml(m.desc)}</div>
        </li>
      `;
    }
  } else {
    mechItemsHtml = `
      <li><span class="badge">沉浸规则</span><div>推演过程中将细致呈现心理反应、微表情与环境交互。</div></li>
      <li><span class="badge">剧情推进</span><div>基于玩家每一个决断自然演化，多重分歧均具备独立叙事逻辑。</div></li>
    `;
  }

  const safeOpenings = (openings && openings.length > 0) ? openings : [
    { tag: '主线 · 第一幕开局', text: summary }
  ];
  const openingsJson = JSON.stringify(safeOpenings.map(o => ({
    tag: o.tag || '开局节点',
    text: o.text || ''
  })));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
    :root {
        --soft-white: #ffffff;
        --cream-bg: #fdfcf8;
        --accent-gold: ${secondaryColor};
        --accent-purple: ${primaryColor};
        --text-dark: #2d2d2d;
        --text-gray: #6d6d6d;
        --border-color: #efe6ff;
        --shadow: 0 12px 42px rgba(120,90,160,0.10);
        --shadow-soft: 0 6px 20px rgba(120,90,160,0.07);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
        font-family: 'Noto Serif SC', "PingFang SC", "Microsoft YaHei", serif;
        background: ${bgGradient};
        color: var(--text-dark);
        line-height: 1.85;
        padding: 18px 14px 60px;
        -webkit-font-smoothing: antialiased;
    }
    .page { max-width: 880px; margin: 0 auto; }
    .hero {
        position: relative;
        text-align: center;
        padding: 42px 24px 36px;
        background: ${heroBg};
        border-radius: 28px;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow);
        margin-bottom: 22px;
        overflow: hidden;
    }
    .hero-tag {
        display: inline-block;
        background: linear-gradient(135deg, #f3e8ff, #faedcd);
        color: ${tagColor};
        padding: 6px 18px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 2px;
        margin-bottom: 14px;
    }
    .hero h1 {
        margin: 0 0 10px;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #2b2638;
        line-height: 1.35;
    }
    .hero-sub {
        margin: 0;
        font-size: 13.5px;
        color: var(--text-gray);
        letter-spacing: 3px;
    }
    .hero-line {
        width: 72px;
        height: 2px;
        margin: 18px auto 0;
        background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
    }
    .card {
        background: var(--soft-white);
        border: 1px solid var(--border-color);
        border-radius: 24px;
        padding: 28px 24px;
        margin-bottom: 22px;
        box-shadow: var(--shadow-soft);
    }
    .section-title {
        font-size: 17px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #352f44;
        margin: 0 0 14px;
        padding-left: 12px;
        border-left: 4px solid var(--accent-purple);
        display: flex;
        align-items: center;
    }
    .section-sub {
        margin: -8px 0 18px;
        font-size: 13px;
        color: var(--text-gray);
    }
    .story-text {
        font-size: 14.5px;
        color: #4a4458;
        white-space: pre-wrap;
        line-height: 1.95;
    }
    .profile-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
    }
    .p-item {
        background: #faf8ff;
        border: 1px solid #efe8fb;
        border-radius: 18px;
        padding: 16px 18px;
    }
    .p-item h4 {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 700;
        color: #342e42;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .p-item h4 .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--accent-purple);
    }
    .p-item p {
        margin: 0;
        font-size: 13.5px;
        color: #5a5468;
        line-height: 1.75;
    }
    .mech-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    .mech-list li {
        display: flex;
        gap: 14px;
        padding: 12px 16px;
        border-radius: 16px;
        background: #fbf9ff;
        border: 1px solid #f1ebfc;
        margin-bottom: 10px;
        font-size: 13.5px;
        color: #544e64;
        align-items: flex-start;
    }
    .mech-list li .badge {
        flex: 0 0 auto;
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        background: linear-gradient(135deg, #f3e8ff, #faedcd);
        color: var(--accent-purple);
        letter-spacing: 1px;
    }
    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
    }
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field label { font-size: 13.5px; font-weight: 600; color: #5f5873; }
    .field input, .field textarea {
        font-family: inherit;
        font-size: 14px;
        color: #3d374d;
        background: #fdfcff;
        border: 1.5px solid #ece5fa;
        border-radius: 14px;
        padding: 12px 14px;
        outline: none;
        transition: .2s;
    }
    .field input:focus, .field textarea:focus {
        border-color: #c9b6ec;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(157,142,199,0.12);
    }
    .full { grid-column: 1 / -1; }
    .opening-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 18px;
    }
    .opening-card {
        position: relative;
        border: 1.5px solid #efe9fb;
        border-radius: 18px;
        padding: 16px 18px 16px 54px;
        background: #fdfcff;
        cursor: pointer;
        transition: .22s;
        font-size: 13.5px;
        color: #4f4960;
        line-height: 1.78;
    }
    .opening-card:hover { border-color: #d6c6f2; background: #fbf8ff; }
    .opening-card .idx {
        position: absolute;
        left: 16px;
        top: 16px;
        width: 26px;
        height: 26px;
        border-radius: 9px;
        background: linear-gradient(135deg, #f3e8ff, #faedcd);
        color: var(--accent-purple);
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .opening-card .tag {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #b07a86;
        background: #fdeef1;
        border-radius: 6px;
        padding: 2px 9px;
        margin-bottom: 7px;
    }
    .opening-card.selected {
        border-color: var(--accent-purple);
        background: linear-gradient(160deg, #faf6ff, #fff9f3);
        box-shadow: 0 8px 24px rgba(157,142,199,0.16);
    }
    .opening-card.selected .idx {
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-gold));
        color: #fff;
    }
    .custom-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .custom-box label { font-size: 13.5px; font-weight: 600; color: #5f5873; }
    .custom-box textarea {
        font-family: inherit;
        font-size: 14px;
        color: #3d374d;
        background: #fdfcff;
        border: 1.5px solid #ece5fa;
        border-radius: 14px;
        padding: 12px 14px;
        outline: none;
        resize: vertical;
        min-height: 84px;
        line-height: 1.7;
    }
    .gen-wrap { text-align: center; margin-top: 6px; }
    .gen-btn {
        font-family: inherit;
        cursor: pointer;
        border: none;
        padding: 14px 50px;
        border-radius: 999px;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #fff;
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-gold));
        box-shadow: 0 12px 28px rgba(157,142,199,0.35);
        transition: .25s;
    }
    .gen-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 34px rgba(157,142,199,0.45); }
    .summary-card {
        background: linear-gradient(160deg, #fffcfa, #f8f3ff);
        border: 1px solid #f0e8fd;
    }
    .summary-inner {
        background: #fffdfb;
        border: 1px dashed #e3d9f5;
        border-radius: 18px;
        padding: 18px;
        min-height: 100px;
        font-size: 13.8px;
        color: #514b62;
        line-height: 1.9;
        white-space: pre-wrap;
        word-break: break-word;
    }
    .copy-wrap { text-align: center; margin-top: -6px; margin-bottom: 20px; }
    .copy-btn {
        font-family: inherit;
        cursor: pointer;
        width: 100%;
        max-width: 880px;
        border: none;
        padding: 15px 20px;
        border-radius: 18px;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #fff;
        background: linear-gradient(135deg, var(--accent-purple), var(--accent-gold));
        box-shadow: 0 14px 34px rgba(143,126,201,0.38);
        transition: .25s;
    }
    .copy-btn:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(143,126,201,0.48); }
    @media (max-width: 600px) {
        body { padding: 12px 10px 46px; }
        .hero { padding: 32px 16px 26px; border-radius: 22px; }
        .hero h1 { font-size: 21px; }
        .card { padding: 20px 16px; border-radius: 20px; }
        .profile-grid, .form-grid { grid-template-columns: 1fr; }
        .opening-card { padding: 14px 15px 14px 48px; font-size: 13px; }
        .gen-btn { width: 100%; padding: 14px; }
    }
</style>
</head>
<body>
<div class="page">
    <div class="hero">
        <span class="hero-tag">${escapeHtml(badge)}</span>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero-sub">沉 浸 式 角 色 扮 演 · 独 家 设 定</p>
        <div class="hero-line"></div>
    </div>

    <div class="card">
        <h2 class="section-title">背景故事</h2>
        <div class="story-text">${escapeHtml(summary)}</div>
    </div>

    <div class="card">
        <h2 class="section-title">人物介绍</h2>
        <p class="section-sub">核心出场人物与心理侧写</p>
        <div class="profile-grid">
            ${profileCardsHtml}
        </div>
    </div>

    <div class="card">
        <h2 class="section-title">核心机制与场景</h2>
        <ul class="mech-list">
            ${mechItemsHtml}
        </ul>
    </div>

    <div class="card">
        <h2 class="section-title">玩家设定</h2>
        <p class="section-sub">填写你的个性化专属属性，将随选定的开场白一起生效。</p>
        <div class="form-grid">
            <div class="field">
                <label>玩家姓名</label>
                <input id="p-name" type="text" placeholder="例如：林铭宇 / 顾言">
            </div>
            <div class="field">
                <label>玩家年龄</label>
                <input id="p-age" type="text" placeholder="例如：20 / 24">
            </div>
            <div class="field full">
                <label>外貌与体态</label>
                <input id="p-look" type="text" placeholder="例如：身材修长匀称，眼神干净深邃，气质沉稳">
            </div>
            <div class="field full">
                <label>核心特征 / 专属能力</label>
                <textarea id="p-cock" rows="2" placeholder="例如：体能极佳，掌控欲强，或拥有特殊专属权限"></textarea>
            </div>
            <div class="field full">
                <label>补充设定 / 关系羁绊</label>
                <textarea id="p-other" rows="2" placeholder="例如：与主要角色相识已久，表面克制但内心独占欲深厚"></textarea>
            </div>
        </div>
    </div>

    <div class="card">
        <h2 class="section-title">开场白选择</h2>
        <p class="section-sub">点击卡片选择想要切入的剧情节点，或在下方自定义。</p>
        <div class="opening-list" id="openingList"></div>

        <div class="custom-box">
            <label>自定义开场白（可选，若填写则优先使用）</label>
            <textarea id="customOpening" placeholder="在这里写下你构想的开场剧情……"></textarea>
        </div>

        <div class="gen-wrap">
            <button class="gen-btn" id="genBtn">生 成 设 定</button>
        </div>
    </div>

    <div class="card summary-card">
        <h2 class="section-title">总结区</h2>
        <div class="summary-inner" id="summaryBox">
            <span style="color:#b0a9c2;font-style:italic;">点击上方【生成设定】按钮，玩家设定与所选开场白将自动汇总到这里。</span>
        </div>
    </div>

    <div class="copy-wrap">
        <button class="copy-btn" id="copyBtn">一 键 复 制</button>
    </div>
</div>

<script>
    const OPENINGS = ${openingsJson};
    let selectedIndex = 0;
    const listEl = document.getElementById('openingList');
    OPENINGS.forEach(function (op, i) {
        const card = document.createElement('div');
        card.className = 'opening-card' + (i === 0 ? ' selected' : '');
        card.dataset.index = i;
        card.innerHTML = '<span class="idx">' + (i + 1) + '</span>' +
                         '<span class="tag">' + op.tag + '</span><br>' +
                         op.text;
        card.addEventListener('click', function () {
            document.querySelectorAll('.opening-card').forEach(function (c) {
                c.classList.remove('selected');
            });
            card.classList.add('selected');
            selectedIndex = i;
        });
        listEl.appendChild(card);
    });

    const summaryBox = document.getElementById('summaryBox');
    const copyBtn = document.getElementById('copyBtn');
    let lastSummaryText = '';

    function val(id) {
        const el = document.getElementById(id);
        const v = el ? el.value.trim() : '';
        return v ? v : '（未填写）';
    }

    document.getElementById('genBtn').addEventListener('click', function () {
        const name = val('p-name');
        const age = val('p-age');
        const look = val('p-look');
        const cock = val('p-cock');
        const other = val('p-other');

        const custom = document.getElementById('customOpening').value.trim();
        const chosen = custom ? custom : OPENINGS[selectedIndex].text;
        const chosenTag = custom ? '自定义开场白' : OPENINGS[selectedIndex].tag;

        let out = '';
        out += '【玩家设定】\\n';
        out += '姓名：' + name + '\\n';
        out += '年龄：' + age + '\\n';
        out += '外貌：' + look + '\\n';
        out += '特质设定：' + cock + '\\n';
        out += '其他设定：' + other + '\\n\\n';
        out += '【开场白 · ' + chosenTag + '】\\n';
        out += chosen;

        lastSummaryText = out;
        summaryBox.textContent = out;
        summaryBox.scrollIntoView({behavior: 'smooth', block: 'start'});
    });

    copyBtn.addEventListener('click', function () {
        if (!lastSummaryText) { lastSummaryText = summaryBox.textContent; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(lastSummaryText).then(function() {
                copyBtn.textContent = '已 复 制 ✓';
                setTimeout(function() { copyBtn.textContent = '一 键 复 制'; }, 1800);
            });
        }
    });
</script>
</body>
</html>`;
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
