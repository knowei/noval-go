"use client";

import React, { useState } from 'react';
import { resolveCgUrl, extractCgItemsFromStory, getCgDefaultTitle } from '@/lib/cgManager';
import { CgImageViewerModal } from './CgImageViewerModal';
import { Sparkles, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { extractStatusBlock } from '@/lib/characterStatusParser';

interface RichStoryRendererProps {
  rawStory: string;
  className?: string;
  deckId?: string;
}

/**
 * 流式输出期间的轻量正文渲染。
 *
 * 正文在流式阶段每 100~120ms 就增长一次，此时若仍走 RichStoryRenderer
 * （十余轮全文正则 + 逐 token 生成 React 组件），主线程会被持续占满，
 * 表现就是页面卡死、CPU 狂转，手机上尤其明显。
 * 这里只做一次去标签与思考区切分，输出单个文本节点，成本比富文本低一个数量级；
 * 回复完成后会自动切换回 RichStoryRenderer。
 */
export const StreamingStoryText = React.memo(function StreamingStoryText({ text }: { text: string }) {
  const parsed = React.useMemo(() => {
    const closeTag = '</details>';
    // 仅在文本确实以思考折叠块开头时才做切分，普通回复不受影响
    const hasThink = /^\s*<details/i.test(text);
    const closeIdx = hasThink ? text.indexOf(closeTag) : -1;
    const strip = (s: string) =>
      s
        .replace(/<summary[^>]*>[\s\S]*?<\/summary>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/^\s+/, '');
    const thinkRaw = hasThink ? text.slice(0, closeIdx >= 0 ? closeIdx : text.length) : '';
    const bodyRaw = hasThink ? (closeIdx >= 0 ? text.slice(closeIdx + closeTag.length) : '') : text;
    return { think: strip(thinkRaw), body: strip(bodyRaw), thinking: hasThink && closeIdx < 0 };
  }, [text]);

  return (
    <div className="space-y-3">
      {parsed.think ? (
        <div className="rounded-xl border border-[#2d303a] bg-[#16171d] px-3 py-2 max-h-40 overflow-y-auto">
          <div className="text-[10.5px] font-mono text-gray-500 mb-1 select-none">
            {parsed.thinking ? '💭 思考中…' : '💭 思考过程'}
          </div>
          <div className="text-[11.5px] leading-relaxed text-gray-400 whitespace-pre-wrap break-words">
            {parsed.think}
          </div>
        </div>
      ) : null}
      <div className="novel-text whitespace-pre-wrap break-words font-serif text-[14px] sm:text-[14.5px] leading-relaxed text-gray-200">
        {parsed.body}
      </div>
    </div>
  );
});

export const RichStoryRenderer = React.memo(function RichStoryRenderer({ rawStory, className = '', deckId = '' }: RichStoryRendererProps) {
  const [activeCgModal, setActiveCgModal] = useState<{ url: string; title: string; subtitle?: string; code?: string } | null>(null);

  if (!rawStory) return null;

  const isModifier = deckId === 'deck_reality_modifier';
  const isSister = deckId === 'deck_sister_truth_or_dare' || deckId.includes('445');
  const isFatherDaughter = deckId === 'deck_father_daughter_jealousy' || deckId.includes('65c');

  // 专属气泡样式
  const wStyle = isModifier
    ? "bg-purple-500/15 border-purple-500/35 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
    : isSister
    ? "bg-rose-500/15 border-rose-500/35 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
    : isFatherDaughter
    ? "bg-amber-500/15 border-amber-500/35 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
    : "bg-pink-500/15 border-pink-500/35 text-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.2)]";

  const fxStyle = isModifier
    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
    : isSister
    ? "bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
    : isFatherDaughter
    ? "bg-orange-500/15 border-orange-500/40 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
    : "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]";

  // 1. 抽取思维链 (CoT) - 安全线性解析（杜绝流式阶段灾难性回溯 ReDoS）
  let text = rawStory;
  let cotContent: string | null = null;
  const summaryIdx = text.search(/<summary[^>]*>\s*(?:思维链|思考过程)/i);
  if (summaryIdx !== -1) {
    const afterSummary = text.slice(summaryIdx);
    const summaryEndMatch = afterSummary.match(/<\/summary>/i);
    if (summaryEndMatch && summaryEndMatch.index !== undefined) {
      const cotStart = summaryIdx + summaryEndMatch.index + summaryEndMatch[0].length;
      const remaining = text.slice(cotStart);
      const detailsEndIdx = remaining.search(/<\/\s*details\s*>/i);
      let cotRaw = '';
      let removeEnd = text.length;
      if (detailsEndIdx !== -1) {
        cotRaw = remaining.slice(0, detailsEndIdx);
        removeEnd = cotStart + detailsEndIdx + (remaining.match(/<\/\s*details\s*>/i)?.[0].length || 0);
      } else {
        const nextTagIdx = remaining.search(/<tl>|<article>|<scene_phase>|【/i);
        if (nextTagIdx !== -1) {
          cotRaw = remaining.slice(0, nextTagIdx);
          removeEnd = cotStart + nextTagIdx;
        } else {
          cotRaw = remaining;
          removeEnd = text.length;
        }
      }
      cotContent = cotRaw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/<!--|-->/g, '')).replace(/<!--|-->/g, '').trim();
      const detailsStartIdx = text.slice(0, summaryIdx).search(/<details[^>]*>\s*$/i);
      const cutStart = detailsStartIdx !== -1 ? detailsStartIdx : summaryIdx;
      text = (text.slice(0, cutStart) + text.slice(removeEnd)).trim();
      text = text.replace(/^\s*<\/\s*details\s*>?/i, '').trim();
    }
  } else {
    const commentCotMatch = text.match(/<!--\s*思考过程:?([\s\S]*?)-->/i);
    if (commentCotMatch) {
      cotContent = commentCotMatch[1].trim();
      text = text.replace(commentCotMatch[0], '');
      text = text.replace(/^\s*<\/\s*details\s*>?/i, '').trim();
    }
  }

  // 2. 抽取顶部时间场景栏 (<tl>)
  let tlContent: string | null = null;
  const tlMatch = text.match(/<tl>([\s\S]*?)<\/tl>/i);
  if (tlMatch) {
    tlContent = tlMatch[1].trim();
    text = text.replace(tlMatch[0], '').trim();
  }

  // 3. 通用剥除外部干扰与状态面板 (包括各种 <*_status> 标签及 【...状态面板/监控/属性】 等方括号块)
  const extracted = extractStatusBlock(text);
  text = extracted.cleanText;
  text = text.replace(/<[a-zA-Z0-9_-]*status[a-zA-Z0-9_-]*>[\s\S]*?(?:<\/[a-zA-Z0-9_-]*status[a-zA-Z0-9_-]*>|$)/gi, '').trim();
// 状态面板已由 extractStatusBlock 安全剥离
  text = text.replace(/<scene_phase>[\s\S]*?(?:<\/scene_phase>|$)/gi, '').trim();
  text = text.replace(/<opt>[\s\S]*?(?:<\/opt>|$)/gi, '').trim();
  text = text.replace(/<suggested_questions>[\s\S]*?(?:<\/suggested_questions>|$)/gi, '').trim();

  // 4. 清理空标签残体（如模型在缺少 article 时输出的 <>、</>、< >）
  text = text.replace(/<(?:\/)?(?:\s*)?>/g, '').trim();

  // 5. 抽取 <article> 正文（支持截断或属性，若无 article 则自动保留正文并清洗 article 标签残体）
  const articleMatch = text.match(/<article[^>]*>([\s\S]*?)(?:<\/article>|$)/i);
  if (articleMatch && articleMatch[1].trim()) {
    text = articleMatch[1].trim();
  } else {
    text = text.replace(/<\/?article[^>]*>/gi, '').trim();
  }

  // 5. 强力标签修复与归一化 (解决模型漏写尖括号或截断造成的漏标如 </p<p>, <p扁担..., <w“...)
  let sanitized = text
    // 修复模型漏写右尖括号导致的连体: </p<p> -> </p>\n<p>
    .replace(/<\/p\s*<p/gi, '</p>\n<p>')
    // 修复漏写开标签闭合: <p(?=[\u4e00-\u9fa5“"「A-Za-z0-9])
    .replace(/<p(?=[\u4e00-\u9fa5“"「A-Za-z0-9])/gi, '<p>')
    // 修复女性台词漏闭合: <w(?=[“"「\u4e00-\u9fa5])
    .replace(/<w(?=[“"「\u4e00-\u9fa5])/gi, '<w>')
    // 修复主角台词漏闭合: <m(?=[“"「\u4e00-\u9fa5])
    .replace(/<m(?=[“"「\u4e00-\u9fa5])/gi, '<m>')
    // 修复心声漏闭合: <thk(?=[“"「\u4e00-\u9fa5])
    .replace(/<thk(?=[“"「\u4e00-\u9fa5])/gi, '<thk>')
    // 修复特效漏闭合: <fx(?=[“"「\u4e00-\u9fa5【])
    .replace(/<fx(?=[“"「\u4e00-\u9fa5【])/gi, '<fx>')
    // 修复危机警报漏闭合: <alert(?=[“"「\u4e00-\u9fa5【])
    .replace(/<alert(?=[“"「\u4e00-\u9fa5【])/gi, '<alert>')
    // 修复名场面漏闭合: <climax(?=[“"「\u4e00-\u9fa5【])
    .replace(/<climax(?=[“"「\u4e00-\u9fa5【])/gi, '<climax>');

  // 6. 统一段落划分 (<p> 标签拆分或换行拆分)
  let rawParas: string[] = [];
  const normalizedText = sanitized.replace(/<br\s*\/?>/gi, '\n');
  if (/<p[\s>]/i.test(normalizedText) || /<\/p>/i.test(normalizedText)) {
    // 将 </p> 转换为换行符，将 <p> 清除以准确切割段落
    const byP = normalizedText
      .split(/<\/p>|\r?\n+/gi)
      .map((p) => p.replace(/<\/?p[^>]*>/gi, '').trim())
      .filter(Boolean);
    rawParas = byP;
  } else {
    rawParas = normalizedText
      .split(/\r?\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // 二次清理段落首尾的残损或断裂标签符号（如单独的 </p、p>、<p）
  const paragraphs: string[] = rawParas
    .map((p) => {
      let cleaned = p
        .replace(/^<\/?p[^>]*>/i, '')
        .replace(/<\/?p[^>]*>$/i, '')
        .replace(/^<\/p/i, '')
        .replace(/^p>/i, '')
        .replace(/<\/p$/i, '')
        .replace(/<p$/i, '')
        .trim();
      return cleaned;
    })
    .filter(Boolean);

  // 渲染段落内部的高亮标签 (<w>, <m>, <thk>, <fx> 及常规引号对白)
  const renderParagraphContent = (para: string) => {
    // 识别各高亮语法块（支持含有属性或轻微格式异化的闭合标签）
    const tokenRegex = /(<cg[^>]*>[\s\S]*?<\/cg>|<cg\s+[^>]*\/?>|<div[^>]*class=["'][^"']*\b(?:story-image|rs-avatar)\b[^"']*["'][^>]*>[\s\S]*?<\/div>|<div[^>]*class=["'][^"']*\b(?:story-image|rs-avatar)\b[^"']*["'][^>]*\/>|<w[^>]*>[\s\S]*?<\/w>|<m[^>]*>[\s\S]*?<\/m>|<thk[^>]*>[\s\S]*?<\/thk>|<fx[^>]*>[\s\S]*?<\/fx>|<alert[^>]*>[\s\S]*?<\/alert>|<climax[^>]*>[\s\S]*?<\/climax>|<game_over[^>]*>[\s\S]*?<\/game_over>|<end[^>]*>[\s\S]*?<\/end>|[“「][^”」]+[”」])/gi;
    const parts = para.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // 0. CG 原画与立绘插画 (<cg> 或 <div class="story-image ...">)
      if (/^<cg[^>]*>[\s\S]*?<\/cg>$|^<cg\s+[^>]*\/?>$/i.test(part) || /^<div[^>]*class=["'][^"']*\b(?:story-image|rs-avatar)\b/i.test(part)) {
        const idMatch = part.match(/\bid=["']([^"']+)["']/i) || part.match(/<cg>([^<]+)<\/cg>/i) || part.match(/\b(img-[A-Za-z0-9_-]+)\b/i);
        const titleMatch = part.match(/\btitle=["']([^"']*)["']/i);
        const cgId = idMatch ? (idMatch[1] || idMatch[0]).trim() : '';
        const cgTitle = titleMatch ? titleMatch[1] : (cgId ? getCgDefaultTitle(cgId) : '剧情CG插画');
        const cgUrl = cgId ? resolveCgUrl(cgId, deckId) : null;

        if (cgUrl) {
          return (
            <div 
              key={idx} 
              onClick={() => setActiveCgModal({ url: cgUrl, title: cgTitle, subtitle: `CG编号：${cgId}`, code: cgId })}
              className="novel-cg-card my-3.5 rounded-2xl overflow-hidden border border-pink-500/35 bg-gradient-to-b from-[#181528] to-[#100d1c] shadow-2xl group cursor-pointer transition-all duration-300 hover:border-pink-500/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.25)] select-none"
            >
              <div className="px-3.5 py-2 bg-[#161426]/90 border-b border-gray-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span className="font-bold text-pink-200 flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>{cgTitle}</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {cgId}
                  </span>
                </div>
                <span className="text-[11px] text-pink-400/90 flex items-center gap-1 group-hover:underline">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>点击放大原画</span>
                </span>
              </div>
              <div className="relative flex items-center justify-center p-2 sm:p-4 bg-black/40 overflow-hidden">
                <img
                  src={cgUrl}
                  alt={cgTitle}
                  className="max-h-[380px] sm:max-h-[480px] w-auto max-w-full object-contain rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </div>
          );
        }
        return null;
      }

      // 1. 女性 NPC 专属对白 (<w>)
      if (/^<w[^>]*>([\s\S]*?)<\/w>$/i.test(part)) {
        const inner = part.replace(/<\/?w[^>]*>/gi, '').trim();
        return (
          <span key={idx} className={`novel-w-dialogue inline-block mx-0.5 px-2 py-0.5 rounded-lg border font-medium ${wStyle}`}>
            <span className="opacity-80 mr-1 text-xs">“</span>
            {inner.replace(/^[“"「]/, '').replace(/[”"」]$/, '')}
            <span className="opacity-80 ml-1 text-xs">”</span>
          </span>
        );
      }

      // 2. 主角玩家专属对白 (<m>)
      if (/^<m[^>]*>([\s\S]*?)<\/m>$/i.test(part)) {
        const inner = part.replace(/<\/?m[^>]*>/gi, '').trim();
        return (
          <span key={idx} className="novel-m-dialogue inline-block mx-0.5 px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/35 text-sky-300 font-medium shadow-[0_0_12px_rgba(56,189,248,0.15)]">
            <span className="text-sky-400/80 mr-1 text-xs">“</span>
            {inner.replace(/^[“"「]/, '').replace(/[”"」]$/, '')}
            <span className="text-sky-400/80 ml-1 text-xs">”</span>
          </span>
        );
      }

      // 3. 潜意识心声与微观生理反应 (<thk>)
      if (/^<thk[^>]*>([\s\S]*?)<\/thk>$/i.test(part)) {
        const inner = part.replace(/<\/?thk[^>]*>/gi, '').trim();
        return (
          <div key={idx} className="novel-thk-card my-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-purple-950/50 via-[#19172c] to-purple-950/30 border border-purple-500/35 text-purple-200/95 text-[12.5px] sm:text-[13px] font-sans shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300/90 mb-1 select-none">
              <span className="text-purple-400">💭</span>
              <span>潜意识心声 · 隐秘动摇与微观生理应激:</span>
            </div>
            <div className="leading-relaxed pl-3 border-l-2 border-purple-400/60 italic font-serif text-purple-100/95">
              {inner}
            </div>
          </div>
        );
      }

      // 4. 环境突发危机与即时事件 (<alert>)
      if (/^<alert[^>]*>([\s\S]*?)<\/alert>$/i.test(part)) {
        const inner = part.replace(/<\/?alert[^>]*>/gi, '').trim();
        return (
          <div key={idx} className="novel-alert-card my-2.5 p-3 rounded-xl bg-gradient-to-r from-red-950/60 via-amber-950/40 to-red-950/30 border border-red-500/40 text-red-200 text-xs sm:text-[13px] font-sans shadow-lg shadow-red-950/30 flex items-start gap-2.5 animate-in fade-in">
            <span className="text-base leading-none p-1 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5 animate-pulse">🚨</span>
            <div className="space-y-0.5 flex-1">
              <div className="text-[11px] font-bold text-red-400 tracking-wider flex items-center gap-1.5">
                <span>环境突发事件 / 窒息危机</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="font-serif leading-relaxed text-red-100 font-medium">
                {inner}
              </div>
            </div>
          </div>
        );
      }

      // 4.5 番剧高能名场面定格特写 (<climax>)
      if (/^<climax[^>]*>([\s\S]*?)<\/climax>$/i.test(part)) {
        const inner = part.replace(/<\/?climax[^>]*>/gi, '').trim();
        const matchedCgs = extractCgItemsFromStory(inner, deckId);
        const climaxCg = matchedCgs[0] || (
          (deckId?.includes('7a68d42a') || deckId?.includes('sister_debt'))
            ? {
                id: 'img-FZ-01',
                url: resolveCgUrl('img-FZ-01', deckId) || 'https://miha.wiki/bvqXru.png',
                title: '名场面定格原画 · 妹妹居家睡裙',
                category: '名场面CG'
              }
            : null
        );

        return (
          <div key={idx} className="novel-climax-card my-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 via-[#1f142a] to-rose-950/70 border border-amber-400/40 text-amber-100 text-xs sm:text-[13.5px] font-serif shadow-2xl shadow-amber-950/50 relative overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2 border-b border-amber-500/25 pb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-amber-300">
                <span className="text-sm">🎬</span>
                <span>番剧高能名场面 · 定格特写</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono font-bold tracking-wider">CLIMAX CG</span>
            </div>
            <div className="leading-relaxed italic pl-3 border-l-2 border-amber-400/80 font-serif text-amber-100 font-medium text-[13px] sm:text-[14px]">
              {inner}
            </div>

            {/* 如果名场面命中了 CG 插画，内联呈现高清原画展台 */}
            {climaxCg && (
              <div 
                onClick={() => setActiveCgModal({ url: climaxCg.url, title: climaxCg.title, subtitle: `名场面CG编号：${climaxCg.id}`, code: climaxCg.id })}
                className="mt-3 rounded-xl overflow-hidden border border-amber-400/30 bg-black/40 hover:border-amber-400/60 transition group cursor-pointer"
              >
                <div className="relative max-h-[320px] sm:max-h-[400px] flex items-center justify-center p-2">
                  <img
                    src={climaxCg.url}
                    alt={climaxCg.title}
                    className="max-h-[300px] sm:max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-md group-hover:scale-[1.01] transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                    <span className="text-[11px] font-mono text-amber-300 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{climaxCg.title}</span>
                    </span>
                    <span className="text-[10px] text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 group-hover:bg-amber-900/80">
                      <ZoomIn className="w-2.5 h-2.5" /> 点击放大原画
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      // 4.8 游戏失败与死局结局 (<game_over> 或 <end>)
      if (/^<game_over[^>]*>([\s\S]*?)<\/game_over>$/i.test(part) || /^<end[^>]*>([\s\S]*?)<\/end>$/i.test(part)) {
        const inner = part.replace(/<\/?(?:game_over|end)[^>]*>/gi, '').trim();
        return (
          <div key={idx} className="novel-gameover-card my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-black to-red-950/80 border-2 border-red-600/80 text-red-100 shadow-[0_0_35px_rgba(239,68,68,0.35)] animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-400 font-black tracking-widest text-sm sm:text-base border-b border-red-500/30 pb-2 mb-2.5">
              <span className="text-xl">☠️</span>
              <span>【GAME OVER · 结局终章】</span>
            </div>
            <div className="text-xs sm:text-sm font-serif leading-relaxed text-red-200">
              {inner}
            </div>
          </div>
        );
      }

      // 5. 拟声词与动作冲击特效 (<fx>)
      if (/^<fx[^>]*>([\s\S]*?)<\/fx>$/i.test(part)) {
        const inner = part.replace(/<\/?fx[^>]*>/gi, '').trim();
        return (
          <span key={idx} className={`novel-fx-tag inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full border text-[12px] font-mono font-bold tracking-wider ${fxStyle}`}>
            <span>⚡</span>
            {inner}
          </span>
        );
      }

      // 6. 常规中文对话引号高光 (“...” 或 「...」)
      if (/^[“「].*[”」]$/.test(part)) {
        return (
          <span key={idx} className="font-semibold text-sky-300/95 tracking-wide">
            {part}
          </span>
        );
      }

      // 7. 清理其他误漏的尖括号残片（如单独的 </p、<article>、</summary>、<> 等）
      const cleanPart = part
        .replace(/<\/?(?:p|article|opt|suggested_questions|d|status|thk|fx|alert|climax|scene_phase|w|m|details|summary|tl|love_status|rpg_status)[^>]*>/gi, '')
        .replace(/<(?:\/)?(?:\s*)?>/g, '')
        .replace(/^<\/?[a-z]+/gi, '');

      return <span key={idx}>{cleanPart}</span>;
    });
  };

  return (
    <div className={`novel-rich-container space-y-3.5 ${className}`}>
      {/* ① 思维链推演折叠面板 (CoT) */}
      {cotContent && (
        <details className="system-details group rounded-xl border border-purple-500/25 bg-[#120e1a] overflow-hidden text-xs transition-all duration-200">
          <summary className="system-summary cursor-pointer select-none px-3.5 py-2 text-purple-300/90 font-medium flex items-center justify-between hover:bg-purple-950/30">
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
      <div className="novel-text space-y-3.5 select-text font-serif leading-[1.95] text-[14.5px] sm:text-[15px] text-gray-200">
        {paragraphs.map((p, pi) => (
          <div key={pi} className="tracking-[0.015em] mb-3 whitespace-pre-wrap break-words">
            {renderParagraphContent(p)}
          </div>
        ))}
      </div>

      {/* 原画与立绘高清全屏鉴赏模态框 */}
      {activeCgModal && (
        <CgImageViewerModal
          isOpen={Boolean(activeCgModal)}
          onClose={() => setActiveCgModal(null)}
          imageUrl={activeCgModal.url}
          title={activeCgModal.title}
          subtitle={activeCgModal.subtitle}
          code={activeCgModal.code}
        />
      )}
    </div>
  );
});
