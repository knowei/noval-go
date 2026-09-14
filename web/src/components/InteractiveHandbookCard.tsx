'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Sparkles, BookOpen, X, Check } from 'lucide-react';

interface InteractiveHandbookCardProps {
  html: string;
  deckTitle?: string;
  onStartStory?: (customPromptOrOpening: string) => void;
  defaultExpanded?: boolean;
}

export function InteractiveHandbookCard({
  html,
  deckTitle = '作品设定与角色卡',
  onStartStory,
  defaultExpanded = true
}: InteractiveHandbookCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeHeight, setIframeHeight] = useState<number>(720);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // 注入增强脚本：
  // 1. 自动高度监听通知父容器
  // 2. 在总结区底部追加【🚀 直接以此设定开启推演】按钮
  // 3. 点击一键复制或开始推演时，将玩家设定的总结内容通过 postMessage 发送给 React
  const enhancedHtml = useMemo(() => {
    if (!html) return '';

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

  window.addEventListener('load', function() {
    notifyHeight();
    setTimeout(notifyHeight, 300);
    setTimeout(notifyHeight, 1000);

    // 观察 DOM 变化（用户点击开场白或生成时高度变动）
    if (window.ResizeObserver) {
      new ResizeObserver(notifyHeight).observe(document.body);
    }

    // 注入【直接以此设定开启推演】专属快捷按钮
    try {
      var copyWrap = document.querySelector('.copy-wrap');
      if (copyWrap) {
        var startBtn = document.createElement('button');
        startBtn.className = 'copy-btn';
        startBtn.style.background = 'linear-gradient(135deg, #ec4899, #8b5cf6)';
        startBtn.style.boxShadow = '0 14px 34px rgba(236, 72, 153, 0.4)';
        startBtn.style.marginTop = '12px';
        startBtn.textContent = '🚀 填入并以此设定开局';
        startBtn.addEventListener('click', function(e) {
          e.preventDefault();
          var summaryBox = document.getElementById('summaryBox');
          var text = summaryBox ? (summaryBox.textContent || '') : '';
          window.parent.postMessage({ type: 'NOVAL_START_CUSTOM_SETUP', payload: text }, '*');
        });
        copyWrap.appendChild(startBtn);
      }
    } catch(e) {}
  });

  // 拦截一键复制，同步给宿主通知
  window.addEventListener('click', function(e) {
    var target = e.target;
    if (target && (target.id === 'copyBtn' || target.classList.contains('copy-btn'))) {
      var summaryBox = document.getElementById('summaryBox');
      if (summaryBox && summaryBox.textContent) {
        window.parent.postMessage({ type: 'NOVAL_SUMMARY_COPIED', payload: summaryBox.textContent }, '*');
      }
    }
  }, true);
})();
</script>
`;

    // 插入到 </body> 之前，如果无 body 则追加到末尾
    if (html.includes('</body>')) {
      return html.replace('</body>', bridgeScript + '</body>');
    }
    return html + bridgeScript;
  }, [html]);

  // 监听来自 iframe 内部的 postMessage 消息
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'NOVAL_HANDBOOK_RESIZE' && typeof event.data.height === 'number') {
        const h = Math.min(Math.max(event.data.height + 30, 450), 3800);
        setIframeHeight(h);
      } else if (event.data.type === 'NOVAL_START_CUSTOM_SETUP' && event.data.payload) {
        const text = String(event.data.payload).trim();
        if (text) {
          setAppliedNotice('已应用并填入开局设定！');
          setTimeout(() => setAppliedNotice(null), 3000);
          if (onStartStory) {
            onStartStory(text);
          }
        }
      } else if (event.data.type === 'NOVAL_SUMMARY_COPIED') {
        setAppliedNotice('设定内容已复制并就绪！');
        setTimeout(() => setAppliedNotice(null), 2500);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStartStory]);

  if (!html) return null;

  return (
    <div className="w-full my-4 rounded-2xl border border-purple-500/30 bg-[#12111a]/95 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300">
      {/* 顶部标题栏 / 折叠控制栏 */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-950/60 via-[#1a1528]/80 to-pink-950/40 border-b border-purple-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-purple-100 truncate">
                {deckTitle} · 作品设定与角色卡
              </span>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                可交互设定卡
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70 truncate hidden sm:block">
              包含完整人物小传、生理机制、开场白选择与自定义玩家档案
            </p>
          </div>
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {appliedNotice && (
            <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" />
              {appliedNotice}
            </span>
          )}

          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-[#201c30] hover:bg-purple-900/40 text-purple-300 hover:text-white border border-purple-500/30 text-xs transition cursor-pointer"
            title="全屏阅读设定卡"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
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

      {/* 折叠区：嵌入式 iframe 渲染作者专属排版与交互逻辑 */}
      {isExpanded && (
        <div className="relative w-full bg-[#fdfcf8] transition-all duration-300">
          <iframe
            ref={iframeRef}
            srcDoc={enhancedHtml}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="w-full border-0 block"
            style={{
              height: `${iframeHeight}px`,
              transition: 'height 0.25s ease'
            }}
            title="作品设定与人物卡"
          />
        </div>
      )}

      {/* 全屏弹窗浏览模式 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[92vh] bg-[#fdfcf8] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-purple-500/40">
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
            <div className="flex-1 w-full overflow-hidden">
              <iframe
                srcDoc={enhancedHtml}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="w-full h-full border-0"
                title="作品设定与人物卡全屏"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
