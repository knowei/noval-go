"use client";

import React from 'react';

interface RichStoryRendererProps {
  rawStory: string;
  className?: string;
}

export function RichStoryRenderer({ rawStory, className = '' }: RichStoryRendererProps) {
  if (!rawStory) return null;

  // 1. 抽取思维链 (CoT)
  let text = rawStory;
  let cotContent: string | null = null;
  const cotMatch = text.match(/<details>\s*<summary>\s*思维链\s*<\/summary>([\s\S]*?)<\/details>/i);
  if (cotMatch) {
    cotContent = cotMatch[1].replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/<!--|-->/g, '')).trim();
    text = text.replace(cotMatch[0], '').trim();
  }

  // 2. 抽取顶部时间场景栏 (<tl>)
  let tlContent: string | null = null;
  const tlMatch = text.match(/<tl>([\s\S]*?)<\/tl>/i);
  if (tlMatch) {
    tlContent = tlMatch[1].trim();
    text = text.replace(tlMatch[0], '').trim();
  }

  // 3. 抽取 <article> 正文
  const articleMatch = text.match(/<article>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    text = articleMatch[1].trim();
  }

  // 4. 按段落划分 (<p> 或 \n)
  let paragraphs: string[] = [];
  if (text.includes('<p>')) {
    const pMatches = text.match(/<p>([\s\S]*?)<\/p>/gi);
    if (pMatches && pMatches.length > 0) {
      paragraphs = pMatches.map((p) => p.replace(/<\/?p>/gi, '').trim());
    } else {
      paragraphs = text.split('\n').map((l) => l.trim()).filter(Boolean);
    }
  } else {
    paragraphs = text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  // 渲染段落内部的高亮标签 (<w>, <m>, <thk>, <fx> 及常规引号对白)
  const renderParagraphContent = (para: string) => {
    const tokenRegex = /(<w>[\s\S]*?<\/w>|<m>[\s\S]*?<\/m>|<thk>[\s\S]*?<\/thk>|<fx>[\s\S]*?<\/fx>|[“「][^”」]+[”」])/gi;
    const parts = para.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // 1. 女性 NPC 专属对白 (<w>)
      if (/^<w>([\s\S]*?)<\/w>$/i.test(part)) {
        const inner = part.replace(/<\/?w>/gi, '').trim();
        return (
          <span key={idx} className="novel-w-dialogue inline-block mx-0.5 px-2 py-0.5 rounded-lg bg-pink-500/15 border border-pink-500/35 text-pink-300 font-medium shadow-[0_0_12px_rgba(244,114,182,0.15)]">
            <span className="text-pink-400/80 mr-1 text-xs">“</span>
            {inner.replace(/^[“"「]/, '').replace(/[”"」]$/, '')}
            <span className="text-pink-400/80 ml-1 text-xs">”</span>
          </span>
        );
      }

      // 2. 主角玩家专属对白 (<m>)
      if (/^<m>([\s\S]*?)<\/m>$/i.test(part)) {
        const inner = part.replace(/<\/?m>/gi, '').trim();
        return (
          <span key={idx} className="novel-m-dialogue inline-block mx-0.5 px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/35 text-sky-300 font-medium shadow-[0_0_12px_rgba(56,189,248,0.15)]">
            <span className="text-sky-400/80 mr-1 text-xs">“</span>
            {inner.replace(/^[“"「]/, '').replace(/[”"」]$/, '')}
            <span className="text-sky-400/80 ml-1 text-xs">”</span>
          </span>
        );
      }

      // 3. 内心真实独白与心理活动 (<thk>)
      if (/^<thk>([\s\S]*?)<\/thk>$/i.test(part)) {
        const inner = part.replace(/<\/?thk>/gi, '').trim();
        return (
          <span key={idx} className="novel-thk-box inline-block my-1 px-2.5 py-1 rounded-lg bg-purple-950/40 border-l-2 border-purple-400 text-purple-200/90 text-[13px] font-sans italic tracking-wide">
            <span className="text-purple-400 mr-1.5 not-italic">💭</span>
            {inner}
          </span>
        );
      }

      // 4. 拟声词与动作冲击特效 (<fx>)
      if (/^<fx>([\s\S]*?)<\/fx>$/i.test(part)) {
        const inner = part.replace(/<\/?fx>/gi, '').trim();
        return (
          <span key={idx} className="novel-fx-tag inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[12px] font-mono font-bold tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="text-amber-400">⚡</span>
            {inner}
          </span>
        );
      }

      // 5. 常规中文对话引号高光 (“...” 或 「...」)
      if (/^[“「].*[”」]$/.test(part)) {
        return (
          <span key={idx} className="font-semibold text-sky-300/95 tracking-wide">
            {part}
          </span>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className={`novel-rich-container space-y-3.5 ${className}`}>
      {/* ① 思维链推演折叠面板 (CoT) */}
      {cotContent && (
        <details className="group rounded-xl border border-purple-500/25 bg-[#120e1a] overflow-hidden text-xs transition-all duration-200">
          <summary className="cursor-pointer select-none px-3.5 py-2 text-purple-300/90 font-medium flex items-center justify-between hover:bg-purple-950/30">
            <span className="flex items-center gap-2">
              <span className="text-sm">🧠</span>
              <span className="font-bold tracking-wide">思维链推演 (CoT 决策过程)</span>
            </span>
            <span className="text-[10px] text-purple-400/70 font-mono transition-transform group-open:rotate-90">▶</span>
          </summary>
          <div className="p-3 bg-[#0d0914] border-t border-purple-500/20 text-purple-200/80 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap">
            {cotContent}
          </div>
        </details>
      )}

      {/* ② 顶部时间与场景横幅 (<tl>) */}
      {tlContent && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-[#1b1c28] via-[#161822] to-[#12131b] border border-[#2e3244] shadow-md flex items-center flex-wrap gap-2 sm:gap-4 text-xs text-amber-300/90 font-medium">
          {tlContent.split(/<br\s*\/?>|\n/gi).map((item, i) => {
            const trimmed = item.trim();
            if (!trimmed) return null;
            return (
              <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/30 border border-white/5">
                {trimmed}
              </span>
            );
          })}
        </div>
      )}

      {/* ③ 正文段落渲染 */}
      <div className="novel-text space-y-3 select-text font-serif leading-[1.95] text-[14.5px] sm:text-[15px] text-gray-200">
        {paragraphs.map((p, pi) => (
          <p key={pi} className="tracking-[0.015em] mb-2.5">
            {renderParagraphContent(p)}
          </p>
        ))}
      </div>
    </div>
  );
}
