"use client";

import React, { useState } from 'react';
import { Copy, Check, Play, RotateCcw, Edit2, Trash2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface CardTurnActionBarProps {
  index: number;
  model?: string;
  storyContent?: string;
  onContinueWriting?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onEditToggle?: (index: number) => void;
  onDelete?: (index: number) => void;
  isEditing?: boolean;
}

export function CardTurnActionBar({
  index,
  model,
  storyContent = '',
  onContinueWriting,
  onRegenerate,
  onEditToggle,
  onDelete,
  isEditing = false,
}: CardTurnActionBarProps) {
  const { modelSettings } = useAppStore();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!storyContent) return;
    try {
      await navigator.clipboard.writeText(storyContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const displayModel = model || modelSettings.model || 'deepseek-flash';

  return (
    <div className="pt-2.5 border-t border-[#232535] flex items-center justify-between gap-2 text-xs select-none flex-wrap">
      {/* Left: 第 N 幕 + 模型标识 Pill */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 font-mono text-[11px]">第 {index + 1} 幕</span>
        <span className="px-2 py-0.5 rounded-full bg-[#181a24] border border-gray-700/60 text-[10px] text-sky-300 font-mono flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="max-w-[110px] truncate">{displayModel}</span>
        </span>
      </div>

      {/* Right: 1:1 对齐截图操作组 [复制] [接着写/补全剧情] [重新回复] [编辑] [删除] */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
        {/* 📋 复制 */}
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-1 rounded-lg bg-[#191a24] hover:bg-[#222434] border border-gray-700/50 text-gray-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          title="复制文本"
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
          <span>{isCopied ? '已复制' : '复制'}</span>
        </button>

        {/* ▶ 接着写/补全剧情 */}
        {onContinueWriting && (
          <button
            type="button"
            onClick={() => onContinueWriting(index)}
            className="px-2 py-1 rounded-lg bg-[#2a1c18] hover:bg-[#38241d] border border-amber-500/40 text-amber-300 hover:text-amber-200 transition flex items-center gap-1 cursor-pointer font-medium"
            title="让 AI 顺应当前剧情继续往后补全推演"
          >
            <Play className="w-3 h-3 fill-current text-amber-400" />
            <span>接着写/补全剧情</span>
          </button>
        )}

        {/* 🔄 重新回复 */}
        {onRegenerate && (
          <button
            type="button"
            onClick={() => onRegenerate(index)}
            className="px-2 py-1 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/40 text-sky-300 hover:text-white transition flex items-center gap-1 cursor-pointer font-medium"
            title="重新生成当前轮次回复"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>重新回复</span>
          </button>
        )}

        {/* ✏️ 编辑 */}
        {onEditToggle && (
          <button
            type="button"
            onClick={() => onEditToggle(index)}
            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
              isEditing
                ? 'bg-purple-950/50 border-purple-500 text-purple-300'
                : 'bg-[#191a24] hover:bg-[#222434] border-gray-700/50 text-gray-300 hover:text-white'
            }`}
            title="手动修改此幕台词或剧情"
          >
            <Edit2 className="w-3 h-3 text-gray-400" />
            <span>{isEditing ? '收起编辑' : '编辑'}</span>
          </button>
        )}

        {/* 🗑️ 删除 */}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="px-2 py-1 rounded-lg bg-[#191a24] hover:bg-rose-950/40 border border-gray-700/50 text-gray-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
            title="删除此幕"
          >
            <Trash2 className="w-3 h-3" />
            <span>删除</span>
          </button>
        )}
      </div>
    </div>
  );
}
