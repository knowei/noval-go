'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, Maximize2, Sparkles, BookOpen, X, Check } from 'lucide-react';
import { copyText } from '@/lib/clipboard';

interface InteractiveHandbookCardProps {
  html: string;
  customCss?: string;
  deckTitle?: string;
  onStartStory?: (customPromptOrOpening: string) => void;
  defaultExpanded?: boolean;
}

export function InteractiveHandbookCard({
  html,
  customCss,
  deckTitle = '作品设定与角色卡',
  onStartStory,
  defaultExpanded = false
}: InteractiveHandbookCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeHeight, setIframeHeight] = useState<number>(720);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<any>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 注入增强脚本与样式：
  // 1. 自动注入专属 customCss
  // 2. 自动高度监听通知父容器
  // 3. 点击角色卡时，拦截并发送 postMessage 给宿主，弹出视口正中高保真弹窗（与 AI 风月一致）
  // 4. 彻底禁用 iframe 内部的 modal-overlay，防止其撑满 3500px 高度遮挡并阻断后续卡片点击
  // 5. 在总结区底部追加【🚀 直接以此设定开启推演】按钮
  const enhancedHtml = useMemo(() => {
    if (!html) return '';

    const headShim = `
<style>
/* 优雅滚动条 */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
::-webkit-scrollbar-thumb { background: rgba(244,63,94,0.3); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(244,63,94,0.6); }

/* 页面背景透明，确保父级全景渐变无缝贯通舞台 */
body {
  background: transparent !important;
}

/* 彻底隐藏 iframe 内部的 modal-overlay，杜绝遮挡 iframe 导致后续无法点击其他角色卡 */
.modal-overlay {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>
<script>
(function() {
  // 1. AudioContext 安全防护垫片：杜绝 iframe 沙箱限制引发的异常阻断点击
  try {
    var OrigAudioCtx = window.AudioContext || window.webkitAudioContext;
    if (OrigAudioCtx) {
      window.AudioContext = function() {
        try {
          return new OrigAudioCtx();
        } catch(e) {
          return {
            state: 'suspended',
            currentTime: 0,
            destination: {},
            createOscillator: function() {
              return {
                connect: function(){},
                start: function(){},
                stop: function(){},
                frequency: { setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){} },
                type: ''
              };
            },
            createGain: function() {
              return {
                connect: function(){},
                gain: { setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){} }
              };
            },
            resume: function() { return Promise.resolve(); }
          };
        }
      };
      window.webkitAudioContext = window.AudioContext;
    }
  } catch(e) {}

  // 2. 提前在 head 中注入万能同步剪贴板垫片，使卡片后续所有原生脚本无论是同步还是异步检测 navigator.clipboard 均正常运行
  var isInternalCopying = false;
  var origWriteText = (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText.bind(navigator.clipboard) : null;
  var origExecCommand = (document.execCommand) ? document.execCommand.bind(document) : null;

  window.__novalMobileSafeCopy = function(text) {
    if (!text) return false;
    var success = false;
    var prevFlag = isInternalCopying;
    isInternalCopying = true;
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.readOnly = false;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '2em';
      ta.style.height = '2em';
      ta.style.padding = '0';
      ta.style.border = 'none';
      ta.style.outline = 'none';
      ta.style.boxShadow = 'none';
      ta.style.background = 'transparent';
      ta.style.color = 'transparent';
      ta.style.opacity = '0.01';
      ta.style.zIndex = '2147483647';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = origExecCommand ? origExecCommand('copy') : false;
      if (ok) success = true;
      document.body.removeChild(ta);
    } catch(e) {}

    try {
      if (origWriteText) {
        origWriteText(text).catch(function() {});
        success = true;
      }
    } catch(e) {}

    isInternalCopying = prevFlag;
    return success;
  };

  var lastTriggeredText = '';
  var lastTriggerTime = 0;
  window.__novalTriggerCopyAndStart = function(text, autoStart) {
    if (!text || text.trim().length < 5) return;
    var cleanText = text.trim();
    var now = Date.now();
    if (cleanText === lastTriggeredText && (now - lastTriggerTime < 800)) {
      return;
    }
    lastTriggeredText = cleanText;
    lastTriggerTime = now;

    var copyOk = window.__novalMobileSafeCopy(cleanText);
    try {
      window.parent.postMessage({
        type: 'NOVAL_START_CUSTOM_SETUP',
        payload: cleanText,
        autoStart: autoStart !== false,
        copyOk: copyOk
      }, '*');
      window.parent.postMessage({
        type: 'NOVAL_SUMMARY_COPIED',
        payload: cleanText,
        copyOk: copyOk
      }, '*');
    } catch(e) {}
  };

  window.__novalSafeCopyPromise = function(text) {
    return new Promise(function(resolve) {
      try {
        window.__novalTriggerCopyAndStart(text, true);
      } catch(e) {}
      resolve();
    });
  };

  try {
    var clip = null;
    try { clip = navigator.clipboard; } catch(e) { clip = null; }
    if (!clip) {
      clip = {};
      try {
        Object.defineProperty(navigator, 'clipboard', { value: clip, configurable: true, writable: true });
      } catch(e) {
        try { navigator.clipboard = clip; } catch(e2) {}
      }
    }
    if (clip && !clip.__novalPatched) {
      clip.writeText = function(text) {
        try {
          if (!isInternalCopying) {
            window.__novalTriggerCopyAndStart(text, true);
          } else {
            window.__novalMobileSafeCopy(text);
          }
        } catch(e) {}
        try {
          return Promise.resolve();
        } catch(e) {
          return {
            then: function(res) { try { res && res(); } catch(e2) {} return this; },
            catch: function() { return this; },
            'finally': function(fn) { try { fn && fn(); } catch(e2) {} return this; }
          };
        }
      };

      clip.write = function(items) {
        try {
          var text = '';
          if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
              var it = items[i];
              if (typeof it === 'string') { text = it; break; }
              if (it && typeof it.__novalText === 'string' && it.__novalText) { text = it.__novalText; break; }
            }
          }
          if (text) {
            window.__novalTriggerCopyAndStart(text, true);
          }
        } catch(e) {}
        return Promise.resolve();
      };

      clip.readText = function() { return Promise.resolve(''); };

      try {
        if (typeof window.ClipboardItem === 'undefined') {
          window.ClipboardItem = function(data) {
            this.__novalText = '';
            try {
              for (var k in (data || {})) {
                var v = data[k];
                if (typeof v === 'string') { this.__novalText = v; break; }
              }
            } catch(e) {}
            this.types = Object.keys(data || {});
            this.getType = function() { return null; };
          };
        }
      } catch(e) {}

      clip.__novalPatched = true;
    }
  } catch(e) {}

  // 劫持 document.execCommand('copy')
  try {
    if (document.execCommand) {
      document.execCommand = function(cmd) {
        var res = false;
        try {
          res = origExecCommand ? origExecCommand(cmd) : false;
        } catch(err) {
          res = false;
        }
        if (cmd === 'copy' && !isInternalCopying) {
          var text = '';
          try {
            var activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
              var sStart = activeEl.selectionStart, sEnd = activeEl.selectionEnd;
              if (typeof sStart === 'number' && typeof sEnd === 'number' && sEnd > sStart) {
                text = activeEl.value.substring(sStart, sEnd);
              }
            }
          } catch(e) {}
          if (!text || text.length < 5) {
            try {
              var sel = window.getSelection();
              if (sel) text = sel.toString();
            } catch(e) {}
          }
          if (!text || text.length < 5) {
            if (window.__novalFindGeneratedOutput) {
              text = window.__novalFindGeneratedOutput();
            }
          }
          if (text && text.length > 5) {
            var copyOk = window.__novalMobileSafeCopy(text);
            if (copyOk) res = true;
            window.__novalTriggerCopyAndStart(text, true);
          }
        }
        return res;
      };
    }
  } catch(e) {}
})();
</script>
`;

    const cssInject = customCss ? `<style>\n${customCss}\n</style>\n` : '';

    const bridgeScript = `
<script>
(function() {
  function notifyHeight() {
    try {
      var h = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight
      );
      if (h > 200) {
        window.parent.postMessage({ type: 'NOVAL_HANDBOOK_RESIZE', height: h }, '*');
      }
    } catch(e) {}
  }

  // 2. 拦截 404 立绘图片，安全降级为精致矢量立绘，杜绝裂图
  window.addEventListener('error', function(e) {
    try {
      var img = e.target;
      if (img && img.tagName === 'IMG' && !img.dataset.hasHandledFallback) {
        img.dataset.hasHandledFallback = 'true';
        var card = img.closest ? (img.closest('.character-card') || img.closest('.roommate-card')) : null;
        var charKey = card ? (card.dataset.character || '') : '';
        var charName = charKey === 'suxiaoke' ? '可' : (charKey === 'lingyue' ? '玥' : (charKey === 'yezhirou' ? '柔' : (charKey === 'xiaqiange' ? '歌' : (img.alt ? img.alt[0] : '★'))));
        var palettes = {
          suxiaoke: ['#f43f5e', '#fb7185', '#fda4af'],
          lingyue: ['#7c3aed', '#6366f1', '#a5b4fc'],
          yezhirou: ['#9333ea', '#c084fc', '#e9d5ff'],
          xiaqiange: ['#db2777', '#f472b6', '#fbcfe8']
        };
        var p = palettes[charKey] || ['#6366f1', '#a855f7', '#d8b4fe'];
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g_' + charName + '" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="' + p[0] + '"/><stop offset="100%" stop-color="' + p[1] + '"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="url(#g_' + charName + ')" stroke="' + p[2] + '" stroke-width="3"/><text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">' + charName + '</text></svg>';
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      }
    } catch(err) {}
  }, true);

  // 3. 内置知名剧本看板角色保底信息库（杜绝任何形式的空数据与空头像）
  var KNOWN_CHARS = {
    suxiaoke: {
      name: '苏小可',
      tag: '元气腹黑少女',
      avatar: '/assets/cards/girls_dormitory/suxiaoke.png',
      description: '<p>🌸 留着双丸子头的娇小元气美少女，可爱调皮，有点小腹黑，喜欢恶作剧。</p><p>🌸 身材娇小，胸部只有b罩杯，遇到同样平胸的女生会天生带有好感。</p><p>🌸 性格外向自来熟，喜欢和人贴贴，经常邀请女生一起洗澡、上厕所、睡觉。</p>',
      reaction: '<p>❤️ 在高好感度(61%-100%)时被她发现你的性别，她会感觉有趣，会帮你隐瞒甚至出谋划策。</p><p>🖤 在低好感度(0%-60%)时被她发现你的性别，她会将你的秘密作为把柄，以此威胁你陪她进行各种危险或刺激的游戏，让你对她言听计从。</p>'
    },
    lingyue: {
      name: '凌玥',
      tag: '高冷御姐',
      avatar: '/assets/cards/girls_dormitory/lingyue.jpg',
      description: '<p>🌸 肤白貌美大长腿，前凸后翘小蛮腰，身材火辣，D罩杯，御姐气质。有时会穿性感黑丝包臀裙。</p><p>🌸 表情变化少，微笑时仅嘴角微勾。性格高冷，话少有主见。下意识带有社会人气质（如双手插兜），极其聪明，能敏锐观察细节。</p><p>🌸 在高中时是叛逆的大姐大，跆拳道黑带，抽烟喝酒鬼混，曾经将调戏过她的教练打成骨折。随后改过自新发奋读书，考上心仪的大学，但仍然带有社会人气质。</p><p>🌸 有过一个混混前男友，但仍然是处女，混混前男友经常打电话和发短信骚扰她。</p>',
      reaction: '<p>❤️ 在高好感度(61%-100%)时被她发现你的性别，会懒得多管闲事，不会主动透露出去，但会警告你懂得分寸。</p><p>🖤 在低好感度(0%-60%)时被她发现你的性别，会以威胁姿态逼问你原因，甚至可能把你揍进ICU病房。</p>'
    },
    yezhirou: {
      name: '叶芷柔',
      tag: '温柔校花',
      avatar: '/assets/cards/girls_dormitory/yezhirou.jpg',
      description: '<p>🌸 出身书香门第，父母都是教师，从小被教导知书达理、举止端庄。黑长直发，容貌清丽绝俗，气质恬静温婉，是高中时代公认的校花。</p><p>🌸 言行温柔体贴，性格善良，不太会拒绝别人——即便自己并不富裕，也依然会对需要帮助的人伸出援手。</p><p>🌸 有一位青梅竹马的男友陈子诚，在另一座城市的大学就读，两人保持着甜蜜的异地恋情。</p>',
      reaction: '<p>❤️ 好感度高时 (61%-100%)：会非常认真地与你谈心，尝试理解你的难处并真诚地提供帮助，主动安慰你、为你出主意。</p><p>🖤 好感度低时 (0%-60%)：会陷入内心的纠结与矛盾，犹豫是否应该告发。私底下大概率会将这件事告诉男友陈子诚商量。</p>'
    },
    xiaqiange: {
      name: '夏仟歌',
      tag: '女扮男装的同学',
      avatar: '/assets/cards/girls_dormitory/xiaqiange.jpg',
      description: '<p>🌸 来自另一部作品的女主角，应粉丝要求友情客串，只要聊天不涉及她的名字就不会触发相关剧情。</p><p>🌸 与你经历相似，从小因家庭原因被父母当作男孩抚养，现在就读于同一所大学，但被分到了男生宿舍。</p><p>🌸 长相极其漂亮，但故意扮成男生模样，言行举止都刻意模仿男性，为了不暴露身份，甚至会主动和男生勾肩搭背融入群体。</p>',
      reaction: '<p>❤️ 无论好感度高低，当她得知你也和她一样是在伪装性别生活时，会感到深深的共鸣与欣慰，百分百与你站在同一阵营，成为你最可靠的盟友。</p>'
    }
  };

  // 4. 点击角色卡时，向宿主发送 NOVAL_SHOW_CHARACTER_MODAL 消息唤出视口居中弹窗
  document.addEventListener('click', function(e) {
    try {
      var target = e.target;
      var card = target && target.closest ? target.closest('.character-card') : null;
      if (card) {
        var charKey = card.dataset.character || card.getAttribute('data-character') || '';
        var charObj = (window.characterData && window.characterData[charKey]) || KNOWN_CHARS[charKey] || null;
        
        if (charObj) {
          window.parent.postMessage({
            type: 'NOVAL_SHOW_CHARACTER_MODAL',
            character: {
              id: charKey,
              name: charObj.name || card.querySelector('h3')?.textContent?.trim() || '角色',
              tag: charObj.tag || '',
              avatar: charObj.avatar || (KNOWN_CHARS[charKey] ? KNOWN_CHARS[charKey].avatar : ''),
              description: charObj.description || '',
              reaction: charObj.reaction || ''
            }
          }, '*');
        } else {
          // 延迟从卡片原有原生脚本填充的 DOM 读取
          setTimeout(function() {
            var nameEl = document.getElementById('modalName') || card.querySelector('h3') || card.querySelector('.character-name');
            var tagEl = document.getElementById('modalTag') || card.querySelector('.character-tag') || card.querySelector('.tag');
            var descEl = document.getElementById('modalDescription');
            var reactEl = document.getElementById('modalReaction');
            var imgEl = (document.getElementById('modalAvatar') ? document.getElementById('modalAvatar').querySelector('img') : null) || card.querySelector('img');
            
            var name = nameEl ? nameEl.textContent.trim() : '角色设定';
            var fallbackObj = KNOWN_CHARS[charKey];

            window.parent.postMessage({
              type: 'NOVAL_SHOW_CHARACTER_MODAL',
              character: {
                id: charKey,
                name: name,
                tag: tagEl ? tagEl.textContent.trim() : (fallbackObj ? fallbackObj.tag : ''),
                avatar: (imgEl && imgEl.src) ? imgEl.src : (fallbackObj ? fallbackObj.avatar : ''),
                description: (descEl && descEl.innerHTML) ? descEl.innerHTML : (fallbackObj ? fallbackObj.description : ''),
                reaction: (reactEl && reactEl.innerHTML) ? reactEl.innerHTML : (fallbackObj ? fallbackObj.reaction : '')
              }
            }, '*');
          }, 35);
        }
      }
    } catch(err) {}
  }, true);

  // 5. 跨移动端万能剪贴板提取与剧情启动通信桥梁
  function findGeneratedOutput() {
    var ids = [
      'output-area', 'out-text', 'outText', 'output-text',
      'summaryBox', 'realtimeOutput', 'copyOutput', 'p-out',
      'openerText', 'outputArea', 'output', 'p_out'
    ];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) {
        var val = (el.value !== undefined ? el.value : el.textContent) || '';
        if (val.trim().length > 5) return val.trim();
      }
    }
    var tas = document.querySelectorAll('textarea');
    for (var j = 0; j < tas.length; j++) {
      var ta = tas[j];
      var isReadOnly = ta.readOnly || ta.hasAttribute('readonly');
      var isOutClass = ta.classList.contains('output-area') || ta.classList.contains('copy-box') || ta.classList.contains('out-text') || ta.classList.contains('out');
      if ((isReadOnly || isOutClass) && ta.value && ta.value.trim().length > 5) {
        return ta.value.trim();
      }
    }
    for (var k = 0; k < tas.length; k++) {
      var tVal = tas[k].value || '';
      if (tVal.length > 20 && (/【玩家|【开局|【角色|周一|周二|周三|周四|周五|周六|周日|开场|设定|剧情/.test(tVal))) {
        return tVal.trim();
      }
    }
    return '';
  }
  window.__novalFindGeneratedOutput = findGeneratedOutput;

  function mobileSafeCopy(text) {
    return window.__novalMobileSafeCopy ? window.__novalMobileSafeCopy(text) : false;
  }

  function triggerStartStory(text, autoStart) {
    if (window.__novalTriggerCopyAndStart) {
      window.__novalTriggerCopyAndStart(text, autoStart);
    }
  }

  // 6. 全局拦截用户点击“生成 / 复制 / 确认 / 开始故事 / 一键开局”等动作按钮
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (!target) return;
    var btn = target.closest ? target.closest('button, input[type="submit"], input[type="button"], .btn, .act-btn, .gen-btn, .copy-btn, .btn-submit, .btn-gen, .btn-copy, .btn-start') : null;
    if (!btn) return;

    var btnText = (btn.textContent || btn.value || '').trim();
    var btnId = btn.id || '';
    var btnClass = btn.className || '';

    var isActionBtn = (
      /生\s*成|复\s*制|拷\s*贝|确\s*认|填\s*入|应\s*用|开\s*始|开\s*局|管\s*教|推\s*演|一\s*键|发\s*送|进入剧情|立即体验/.test(btnText) ||
      /^\s*(copy|generate|confirm|apply|start)\s*$/i.test(btnText) ||
      /btn-gen|gen-btn|btn-copy|btnCopy|copyBtn|copy-btn|copy_btn|copyButton|btn-confirm|btn-apply|genBtn|btnStart|btn-start|submit/i.test(btnId) ||
      /btn-gen|gen-btn|copy-btn|copy_btn|copyButton|btn-submit|btn-start|btn-apply/i.test(btnClass)
    );

    if (isActionBtn) {
      var immediate = findGeneratedOutput();
      if (immediate && immediate.length > 5) {
        mobileSafeCopy(immediate);
      }
      setTimeout(function() {
        var output = findGeneratedOutput();
        if (output && output.length > 5) {
          triggerStartStory(output, true);
        }
      }, 40);
      setTimeout(function() {
        var output = findGeneratedOutput();
        if (output && output.length > 5) {
          triggerStartStory(output, true);
        }
      }, 180);
    }
  }, true);

  // 7. 全局表单 submit 拦截
  document.addEventListener('submit', function(e) {
    setTimeout(function() {
      var output = findGeneratedOutput();
      if (output && output.length > 5) {
        triggerStartStory(output, true);
      }
    }, 40);
    setTimeout(function() {
      var output = findGeneratedOutput();
      if (output && output.length > 5) {
        triggerStartStory(output, true);
      }
    }, 180);
  }, true);

  // 8. 动态注入通用的【🚀 填入并以此设定开局】高亮操作按钮
  function injectUniversalStartButtons() {
    try {
      if (document.getElementById('novalUniversalStartBtn')) return;
      var candidates = [
        document.querySelector('.copy-wrap'),
        document.querySelector('.btn-row'),
        document.getElementById('sec-output'),
        document.querySelector('#out-box'),
        document.querySelector('#output-area')?.parentElement,
        document.querySelector('#outText')?.parentElement,
        document.querySelector('#out-text')?.parentElement,
        document.querySelector('#p-out')?.parentElement,
        document.querySelector('#copyOutput')?.parentElement,
        document.querySelector('#summaryBox')?.parentElement,
        document.querySelector('form#generator-form'),
        document.querySelector('.wrap')
      ];

      var container = null;
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i]) {
          container = candidates[i];
          break;
        }
      }

      if (container) {
        var startBtn = document.createElement('button');
        startBtn.id = 'novalUniversalStartBtn';
        startBtn.type = 'button';
        startBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;width:100%;max-width:440px;margin:16px auto;padding:12px 20px;background:linear-gradient(135deg,#f43f5e,#a855f7);color:#ffffff;border:none;border-radius:14px;font-size:14.5px;font-weight:bold;cursor:pointer;box-shadow:0 8px 24px rgba(244,63,94,0.38);transition:all 0.2s ease;font-family:inherit;';
        startBtn.innerHTML = '<span>🚀 填入并以此设定开局</span>';

        startBtn.addEventListener('click', function(ev) {
          ev.preventDefault();
          var text = findGeneratedOutput();
          if (!text) {
            var genBtn = document.querySelector('#btn-confirm, #btn-gen, .gen-btn, #genBtn, #btnCopy, #copyBtn, button[type="submit"]');
            if (genBtn && genBtn !== startBtn) {
              genBtn.click();
            }
            setTimeout(function() {
              text = findGeneratedOutput();
              if (text) {
                triggerStartStory(text, true);
              }
            }, 60);
          } else {
            triggerStartStory(text, true);
          }
        });

        container.appendChild(startBtn);
      }
    } catch(err) {}
  }

  function initBridge() {
    notifyHeight();
    setTimeout(notifyHeight, 300);
    setTimeout(notifyHeight, 1000);
    injectUniversalStartButtons();
    setTimeout(injectUniversalStartButtons, 300);
    setTimeout(injectUniversalStartButtons, 800);
    setTimeout(injectUniversalStartButtons, 1500);

    if (window.ResizeObserver) {
      new ResizeObserver(notifyHeight).observe(document.body);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initBridge();
  } else {
    document.addEventListener('DOMContentLoaded', initBridge);
    window.addEventListener('load', initBridge);
  }
})();
</script>
`;

    let result = html;

    // 自动将 const characterData / let characterData 提升至全局 window.characterData，确保无论外部还是内部均能即时读取
    result = result.replace(/(?:const|let|var)\s+characterData\s*=/g, 'var characterData = window.characterData = window.characterData ||');

    // 修复部分卡片作者写死的错误复制逻辑（-1000px / readonly 导致现代浏览器在 iframe 或移动端拒绝复制并弹出失败提示）
    result = result
      .replace(/ta\.style\.top\s*=\s*["']-1000px["'];?/g, 'ta.style.top="0";ta.style.left="0";ta.style.width="2em";ta.style.height="2em";ta.style.opacity="0.01";')
      .replace(/ta\.setAttribute\(\s*["']readonly["']\s*,\s*["']["']\s*\);?/g, 'ta.readOnly=false;')
      .replace(/copyPromise\s*=\s*\(function\s*\(\s*t\s*\)\s*\{[\s\S]*?\}\)\s*\(\s*output\s*\);/g, 'copyPromise = (window.__novalSafeCopyPromise ? window.__novalSafeCopyPromise(output) : (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(output) : Promise.resolve()));');

    // 自动替换女生宿舍已知易失效外链为高画质本地资源
    result = result
      .replace(/https:\/\/img\.wjwj\.top\/2025\/07\/14\/3a8a6d2710b486a1ea986202bee479d8\.jpg/g, '/assets/cards/girls_dormitory/suxiaoke.png')
      .replace(/https:\/\/img\.wjwj\.top\/2025\/07\/14\/f1e655aebb6f919229b74859a046b79a\.jpg/g, '/assets/cards/girls_dormitory/lingyue.jpg')
      .replace(/https:\/\/img\.wjwj\.top\/2025\/07\/14\/60679ef8bb14d3e6d3c5a0c9db40384c\.jpg/g, '/assets/cards/girls_dormitory/yezhirou.jpg')
      .replace(/https:\/\/img\.wjwj\.top\/2025\/05\/10\/c4d80544818478d71c128c85b702b873\.jpg/g, '/assets/cards/girls_dormitory/xiaqiange.jpg');

    if (result.includes('<head>')) {
      result = result.replace('<head>', '<head>\n' + headShim + '\n' + cssInject);
    } else if (result.includes('</head>')) {
      result = result.replace('</head>', headShim + '\n' + cssInject + '\n</head>');
    } else {
      result = headShim + '\n' + cssInject + '\n' + result;
    }

    // 插入到 </body> 之前，如果无 body 则追加到末尾
    if (result.includes('</body>')) {
      return result.replace('</body>', bridgeScript + '</body>');
    }
    return result + bridgeScript;
  }, [html, customCss]);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // 监听来自 iframe 内部的 postMessage 消息
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'NOVAL_HANDBOOK_RESIZE' && typeof event.data.height === 'number') {
        const h = Math.min(Math.max(event.data.height + 30, 450), 3800);
        setIframeHeight(h);
      } else if (event.data.type === 'NOVAL_SHOW_CHARACTER_MODAL' && event.data.character) {
        setActiveCharacter(event.data.character);
      } else if (event.data.type === 'NOVAL_START_CUSTOM_SETUP' && event.data.payload) {
        const text = String(event.data.payload).trim();
        if (text) {
          copyText(text);
          setAppliedNotice('已自动载入开局设定并开启推演！');
          setTimeout(() => setAppliedNotice(null), 3500);
          setIsExpanded(false);
          if (onStartStory) {
            onStartStory(text);
          }
        }
      } else if (event.data.type === 'NOVAL_COPY_FAILED') {
        setAppliedNotice('浏览器拒绝了自动复制，请长按文本选择复制。');
        setTimeout(() => setAppliedNotice(null), 4000);
      } else if (event.data.type === 'NOVAL_SUMMARY_COPIED') {
        const hasText = String(event.data.payload || '').trim().length > 0;
        if (!hasText) return;
        if (event.data.copyOk === false) {
          setAppliedNotice('内容已生成。手机浏览器禁止自动复制，请再点一次按钮即可复制。');
        } else {
          setAppliedNotice('开局设定已复制并就绪！');
        }
        setTimeout(() => setAppliedNotice(null), 4000);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStartStory]);

  // 监听 ESC 键关闭弹窗
  useEffect(() => {
    if (!activeCharacter && !isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCharacter(null);
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCharacter, isFullscreen]);

  if (!html) return null;

  return (
    <div className={`w-full transition-all duration-300 ${
      defaultExpanded
        ? 'w-full bg-transparent border-0 shadow-none'
        : 'my-4 rounded-2xl border border-rose-500/30 bg-[#12111a]/95 shadow-[0_12px_44px_rgba(0,0,0,0.7)] overflow-hidden'
    }`}>
      {/* 顶部标题栏 / 折叠控制栏（仅在非默认沉浸展开时展示标准外框，默认沉浸模式下保持极简通透） */}
      {!defaultExpanded ? (
        <div className="px-4 py-2.5 sm:py-3 border-b flex items-center justify-between gap-3 bg-gradient-to-r from-rose-950/70 via-[#1a1325]/85 to-purple-950/60 border-rose-500/25">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-purple-100 truncate">
                  {deckTitle} · 作品设定与角色卡
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  可交互设定卡
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70 truncate hidden sm:block">
                包含完整人物小传、生理机制、开场白选择与自定义玩家档案
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {appliedNotice && (
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3" />
                {appliedNotice}
              </span>
            )}

            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg bg-[#201726]/80 hover:bg-rose-900/40 text-purple-300 hover:text-white border border-purple-500/30 text-xs transition cursor-pointer"
              title="全屏阅读设定卡"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>收起</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>展开设定卡</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* 沉浸首屏模式：仅在右上角保留浮动全屏微控按钮，不破坏整体通透感 */
        appliedNotice && (
          <div className="mb-2 flex justify-end">
            <span className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-lg">
              <Check className="w-3.5 h-3.5" />
              {appliedNotice}
            </span>
          </div>
        )
      )}

      {/* 设定卡 iframe：完全透明背景无缝融入全屏背景 */}
      {isExpanded && (
        <div className="relative w-full bg-transparent transition-all duration-300">
          <iframe
            ref={iframeRef}
            srcDoc={enhancedHtml}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            allow="autoplay; clipboard-write"
            className="w-full border-0 block"
            style={{
              height: `${iframeHeight}px`,
              background: 'transparent',
              transition: 'height 0.25s ease'
            }}
            title="作品设定与人物卡"
          />
        </div>
      )}

      {/* 全屏弹窗浏览模式 (Portal 挂载在 body 上) */}
      {mounted && isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative w-full max-w-5xl h-[92vh] bg-[#0c0b14] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-purple-500/40">
            {/* 弹窗顶部栏 */}
            <div className="px-4 py-3 bg-[#1e192c] text-white flex items-center justify-between border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm text-purple-200">
                  {deckTitle} · 全屏作品设定卡
                </span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* 弹窗内部 iframe */}
            <div className="flex-1 w-full overflow-hidden bg-transparent">
              <iframe
                srcDoc={enhancedHtml}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                allow="autoplay; clipboard-write"
                className="w-full h-full border-0"
                style={{ background: 'transparent' }}
                title="作品设定与人物卡全屏"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 核心高保真角色详情弹窗（Portal 挂载在 body 上，无论滚动到哪里，永远在视口绝对正中心，与 AI 风月 100% 一致） */}
      {mounted && activeCharacter && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveCharacter(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            className="relative w-full max-w-[500px] max-h-[85vh] rounded-3xl p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.92)] text-gray-100 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-purple-500/40"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #231647 0%, #171033 100%)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.92), 0 0 35px rgba(168, 85, 247, 0.2)'
            }}
          >
            {/* 右上角圆形关闭按钮 */}
            <button
              onClick={() => setActiveCharacter(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer z-10"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 头部：真实圆形立绘 + 姓名 + 身份徽章 */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-purple-500/25 shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-purple-400/50 shadow-lg shrink-0 bg-purple-950/60 flex items-center justify-center">
                {activeCharacter.avatar && activeCharacter.avatar.trim() !== '' ? (
                  <img
                    src={activeCharacter.avatar}
                    alt={activeCharacter.name || '角色立绘'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-600 to-purple-600 text-white text-2xl font-bold">
                    {activeCharacter.name ? activeCharacter.name.slice(0, 1) : '★'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate">
                  {activeCharacter.name || '角色设定'}
                </h2>
                {activeCharacter.tag && (
                  <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/35">
                    {activeCharacter.tag}
                  </span>
                )}
              </div>
            </div>

            {/* 弹窗内容主体：角色设定与发现秘密后的反应 */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm leading-relaxed text-gray-200 custom-scrollbar">
              {activeCharacter.description ? (
                <div className="space-y-2 bg-black/25 p-4 rounded-2xl border border-white/5">
                  <h3 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm mb-2">
                    <span className="text-sm">👤</span>
                    <span className="text-purple-200 tracking-wide">角色设定</span>
                  </h3>
                  <div
                    className="text-purple-100/90 space-y-2 leading-relaxed text-[13px] [&>p]:mb-1.5"
                    dangerouslySetInnerHTML={{ __html: activeCharacter.description }}
                  />
                </div>
              ) : (
                <div className="space-y-2 bg-black/25 p-4 rounded-2xl border border-white/5">
                  <h3 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm mb-2">
                    <span className="text-sm">👤</span>
                    <span className="text-purple-200 tracking-wide">角色设定</span>
                  </h3>
                  <p className="text-purple-100/90 leading-relaxed text-[13px]">
                    {activeCharacter.name}（{activeCharacter.tag || '重点角色'}）- 宿舍重要室友。
                  </p>
                </div>
              )}

              {activeCharacter.reaction && (
                <div className="space-y-2 bg-black/25 p-4 rounded-2xl border border-white/5">
                  <h3 className="font-bold text-white flex items-center gap-2 text-xs sm:text-sm mb-2">
                    <span className="text-sm">👁️</span>
                    <span className="text-purple-200 tracking-wide">发现秘密后的反应</span>
                  </h3>
                  <div
                    className="text-purple-100/90 space-y-2 leading-relaxed text-[13px] [&>p]:mb-1.5"
                    dangerouslySetInnerHTML={{ __html: activeCharacter.reaction }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
