"use client";

import React from 'react';
import { Turn } from '@/lib/types';
import { MapPin, RotateCcw, Trash2, Edit3, Copy } from 'lucide-react';

interface GenericCardProps {
  turn: Turn;
  index: number;
  onSendAction: (action: string) => void;
  onDelete: (index: number) => void;
  onRegenerate?: (index: number) => void;
}

export function GenericCard({ turn, index, onSendAction, onDelete, onRegenerate }: GenericCardProps) {
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

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#171822] border border-[#272a38] shadow-xl space-y-4 text-gray-200">
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

      {/* Prose Text with Quotes */}
      <div className="novel-text space-y-1">
        {renderStoryParagraphs(storyText)}
      </div>

      {/* Memory Accordion if available */}
      {turn.memory && turn.memory.length > 0 && (
        <details className="reality-panel" open={false}>
          <summary className="reality-summary cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <span>📄</span>
              <span>本幕记忆沉淀 ({turn.memory.length} 条事实)</span>
            </span>
            <span className="reality-arrow"></span>
          </summary>
          <div className="reality-body space-y-1 text-xs text-gray-300">
            {turn.memory.map((m, mi) => (
              <div key={mi} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-amber-400 shrink-0">•</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Status Box if available */}
      {turn.status && Object.keys(turn.status).length > 0 && (
        <div className="p-3 rounded-xl bg-[#1e202c] border border-[#2d3144] space-y-1.5 text-xs text-gray-300">
          <div className="font-bold text-amber-300 flex items-center gap-1">
            <span>📊</span>
            <span>当前局势与状态</span>
          </div>
          {Object.entries(turn.status).map(([k, v]) => (
            <div key={k} className="text-[11.5px]">
              • <strong className="text-gray-400">{k}: </strong>
              <span>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Branches */}
      {turn.branches && turn.branches.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="text-[11px] text-amber-300/90 font-semibold flex items-center gap-1">
            <span>🎲</span>
            <span>下一步行动抉择：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {turn.branches.map((b, bi) => (
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
      )}

      {/* Footer Toolbar */}
      <div className="pt-2 border-t border-[#222430] flex items-center justify-between text-[11px] text-gray-500">
        <span className="font-mono">{turn.model || 'AI模型推演'}</span>
        <div className="flex items-center gap-1">
          {onRegenerate && (
            <button
              onClick={() => onRegenerate(index)}
              className="p-1 rounded hover:bg-[#20222e] hover:text-amber-300 transition"
              title="重新推演此幕"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(index)}
            className="p-1 rounded hover:bg-[#20222e] hover:text-red-400 transition"
            title="删除此幕及后续"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
