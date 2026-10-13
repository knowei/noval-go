"use client";

import React, { useState } from 'react';
import { StoryDeck } from '@/lib/types';
import {
  X,
  BookOpen,
  Star,
  Flame,
  User,
  Tag,
  Sparkles,
  FileText,
  Play,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface DeckDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: StoryDeck | null;
  onStartStory?: () => void;
}

export function DeckDetailModal({
  isOpen,
  onClose,
  deck,
  onStartStory
}: DeckDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'opening' | 'cast'>('overview');

  if (!isOpen || !deck) return null;

  const tags = Array.isArray(deck.tags) ? deck.tags : [];
  const ratingText = deck.rating || '9.8';
  const heatText = deck.heat || '热门推演';
  const firstTurnText = deck.firstTurnDemo?.text || deck.firstTurnDemo?.story || '';
  const hasCustomHtml = Boolean(deck.customHtml);
  const handbookTips = deck.handbook?.tips || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 bg-[var(--app-card-bg,#13141f)] border-[var(--app-card-border,#282a3c)] text-[var(--app-text-main,#f1f5f9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与封面 Banner */}
        <div className="relative p-5 sm:p-6 border-b border-[var(--app-card-border,#262838)] bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/20 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {deck.cover_image ? (
                <img
                  src={deck.cover_image}
                  alt={deck.title}
                  className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl object-cover shrink-0 border border-purple-500/30 shadow-md"
                />
              ) : (
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-3xl shrink-0 shadow-md">
                  📖
                </div>
              )}

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>{deck.category || '沉浸剧本'}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{ratingText} 分</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>{heatText}</span>
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-bold tracking-tight text-[var(--app-text-main,#f8fafc)] leading-tight line-clamp-2">
                  {deck.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted,#94a3b8)]">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>作者：{deck.author || 'AI风月'}</span>
                  </span>
                  {deck.badge && (
                    <span className="text-amber-400 font-mono text-[11px]">
                      · {deck.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f8fafc)] hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer shrink-0"
              title="关闭详情"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 标签列表 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3">
              {tags.map((tag: any, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-purple-500/10 text-purple-300 dark:text-purple-200 border border-purple-500/20 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>#{typeof tag === 'string' ? tag : tag.name || String(tag)}</span>
                </span>
              ))}
            </div>
          )}

          {/* 导航选项卡 */}
          <div className="flex items-center gap-2 pt-4 border-t border-[var(--app-card-border,#262838)]/60 mt-3 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f8fafc)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>剧情简介与世界观</span>
            </button>

            {firstTurnText && (
              <button
                onClick={() => setActiveTab('opening')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'opening'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f8fafc)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>开局第一幕预览</span>
              </button>
            )}

            {hasCustomHtml && (
              <button
                onClick={() => setActiveTab('cast')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'cast'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f8fafc)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>作者专属人物手记</span>
              </button>
            )}
          </div>
        </div>

        {/* 详情主体内容区 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm leading-relaxed no-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 故事梗概 */}
              <div className="p-4 rounded-xl border bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>故事背景与设定简介</span>
                </div>
                <p className="text-[var(--app-text-sub,#cbd5e1)] leading-relaxed whitespace-pre-line">
                  {deck.desc || '扣人心弦的情绪拉扯与高自由度叙事，探索专属沉浸剧场的每一个未知分支与抉择……'}
                </p>
              </div>

              {/* 玩法特色与建议 */}
              {handbookTips.length > 0 && (
                <div className="p-4 rounded-xl border bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>剧本指引与推演小贴士</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-xs text-[var(--app-text-sub,#cbd5e1)]">
                    {handbookTips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 剧本内置场景 */}
              {deck.scenes && deck.scenes.length > 0 && (
                <div className="p-4 rounded-xl border bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>核心剧情篇章 ({deck.scenes.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {deck.scenes.map((scene, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-[var(--app-card-border,#303348)] bg-black/5 dark:bg-white/5 space-y-1"
                      >
                        <div className="font-bold text-xs text-[var(--app-text-main,#f1f5f9)]">
                          {idx + 1}. {scene.title}
                        </div>
                        <div className="text-[11px] text-[var(--app-text-muted,#94a3b8)] line-clamp-2">
                          {scene.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'opening' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" />
                    <span>第一幕独白与开局情境</span>
                  </span>
                  <span className="text-[10px] text-[var(--app-text-dim,#64748b)] font-mono">
                    PROLOGUE
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-[var(--app-text-sub,#cbd5e1)] leading-relaxed whitespace-pre-line novel-text border-t border-[var(--app-card-border,#282a3c)] pt-3">
                  {firstTurnText}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && hasCustomHtml && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] overflow-x-auto">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: deck.customHtml || '' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 sm:px-6 border-t border-[var(--app-card-border,#262838)] bg-[var(--app-card-bg-subtle,#10111a)] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--app-card-border,#33374a)] hover:bg-black/5 dark:hover:bg-white/5 text-xs text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f8fafc)] transition cursor-pointer"
          >
            返回推演
          </button>

          {onStartStory && (
            <button
              onClick={() => {
                onClose();
                onStartStory();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>开启新推演</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
