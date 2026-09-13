"use client";

import React, { useState } from 'react';
import { CardTurnActionBar } from './CardTurnActionBar';
import { Turn } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface GenericCardProps {
  turn: Turn;
  index: number;
  onSendAction: (action: string) => void;
  onDelete: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
}

export function GenericCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
}: GenericCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');
  const storyText = turn.story || turn.text || '';

  const renderStoryParagraphs = (text: string) => {
    return text.split('\n').map((line, li) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={li} className="h-2" />;

      const parts = trimmed.split(/([“「][^”」]+[”」])/g);
      return (
        <p key={li} className="leading-relaxed mb-3 font-serif text-[14px] sm:text-[14.5px] text-gray-200">
          {parts.map((part, pi) => {
            if (/^[“「].*[”」]$/.test(part)) {
              return (
                <span key={pi} className="dialogue-quote font-semibold text-sky-400">
                  {part}
                </span>
              );
            }
            return <span key={pi}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const hasStatus = turn.status && Object.keys(turn.status).length > 0;
  const hasMemory = turn.memory && turn.memory.length > 0;
  const hasBranches = turn.branches && turn.branches.length > 0;
  const hasAnyPanel = hasStatus || hasMemory || hasBranches;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#171822] border border-[#272a38] shadow-xl space-y-4 text-gray-200 select-text">
      {/* Location Header */}
      {turn.location && (
        <div className="flex items-center justify-between border-b border-[#252836] pb-2.5 text-xs text-amber-300/90 font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{turn.location}</span>
          </span>
          <span className="text-[10px] text-gray-500 font-mono">第 {index + 1} 幕</span>
        </div>
      )}

      {/* Prose Text with Quotes / Editing */}
      {isEditing ? (
        <div className="space-y-2 p-3 rounded-xl bg-[#12131a] border border-purple-500/40">
          <div className="text-xs text-purple-300 font-bold flex items-center justify-between">
            <span>✏️ 编辑第 {index + 1} 幕台词与剧情</span>
            <span className="text-[11px] text-gray-400">修改后将即时更新</span>
          </div>
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            rows={8}
            className="w-full p-2.5 rounded-lg bg-[#0e0f14] border border-gray-700 text-gray-100 text-xs sm:text-sm font-serif leading-relaxed outline-none focus:border-purple-400"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setEditedStory(storyText);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (onEdit) onEdit(index, editedStory);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <div className="novel-text space-y-1">
          {renderStoryParagraphs(storyText)}
        </div>
      )}

      {/* 统一折叠面板群 (1:1 风格对齐第一版) */}
      {hasAnyPanel && (
        <div className="reality-panels-container space-y-2 mt-4">
          {/* ① 📊 状态面板 */}
          {hasStatus && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>📊</span>
                  <span>当前局势与状态栏</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-1 text-xs text-gray-300">
                {Object.entries(turn.status!).map(([k, v]) => (
                  <div key={k} className="leading-relaxed">
                    • <strong className="text-gray-400">{k}: </strong>
                    <span className="text-sky-300">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ② 📝 记忆区折叠 */}
          {hasMemory && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>📝</span>
                  <span>本幕记忆沉淀 ({turn.memory!.length} 条事实)</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-1 text-xs text-gray-300">
                {turn.memory!.map((m, mi) => (
                  <div key={mi} className="leading-relaxed flex items-start gap-1.5">
                    <span className="text-amber-400 shrink-0">•</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ③ 🎲 行动分支折叠 */}
          {hasBranches && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>🎮</span>
                  <span>当前局势 · 下一步行动抉择 ({turn.branches!.length} 项可选)</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-2">
                <div className="text-[11px] text-gray-400 mb-1">
                  💡 点击直接执行行动，推进剧情发展：
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {turn.branches!.map((b, bi) => (
                    <button
                      key={bi}
                      onClick={() => onSendAction(`【${b.title}】：${b.desc || b.title}`)}
                      className="p-2.5 rounded-xl bg-[#1d1f2b] hover:bg-[#252838] border border-[#2d3142] hover:border-amber-500/60 text-left text-xs text-gray-200 hover:text-amber-200 transition group flex items-center justify-between cursor-pointer"
                    >
                      <span><strong>【{b.tag || '◆'}】</strong> {b.title}</span>
                      <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition">➔</span>
                    </button>
                  ))}
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Footer Turn Action Bar */}
      <CardTurnActionBar
        index={index}
        model={turn.model}
        storyContent={storyText}
        onContinueWriting={onContinueWriting}
        onRegenerate={onRegenerate}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDelete={onDelete}
        isEditing={isEditing}
      />
    </div>
  );
}
