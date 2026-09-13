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

      {/* Prose Text */}
      <div className="text-gray-200 text-sm sm:text-[14.5px] leading-relaxed whitespace-pre-wrap font-normal">
        {turn.story || turn.text}
      </div>

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
