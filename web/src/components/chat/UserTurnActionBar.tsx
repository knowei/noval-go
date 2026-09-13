"use client";

import React, { useState } from 'react';
import { Edit3, RotateCcw, Trash2, Copy, Check } from 'lucide-react';

interface UserTurnActionBarProps {
  index: number;
  text: string;
  onEditAndResend: (index: number, text: string) => void;
  onResendFromTurn: (index: number) => void;
  onRetract: (index: number) => void;
}

export function UserTurnActionBar({
  index,
  text,
  onEditAndResend,
  onResendFromTurn,
  onRetract,
}: UserTurnActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 select-none mb-1">
      {/* ✏️ 编辑重发 */}
      <button
        type="button"
        onClick={() => onEditAndResend(index, text)}
        className="px-2 py-0.5 rounded-md bg-[#1a1c27] hover:bg-[#252838] border border-gray-700/50 hover:border-gray-500 text-gray-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
        title="编辑这句内容并重新发送"
      >
        <Edit3 className="w-3 h-3 text-gray-400" />
        <span>编辑重发</span>
      </button>

      {/* 🔄 从此轮重新回复 */}
      <button
        type="button"
        onClick={() => onResendFromTurn(index)}
        className="px-2 py-0.5 rounded-md bg-[#1a1c27] hover:bg-[#252838] border border-gray-700/50 hover:border-sky-500/50 text-gray-300 hover:text-sky-300 transition flex items-center gap-1 cursor-pointer"
        title="保留这句内容，重新推演后续剧情"
      >
        <RotateCcw className="w-3 h-3 text-sky-400" />
        <span>从此轮重新回复</span>
      </button>

      {/* 🗑️ 撤回 */}
      <button
        type="button"
        onClick={() => onRetract(index)}
        className="px-2 py-0.5 rounded-md bg-[#1a1c27] hover:bg-rose-950/40 border border-gray-700/50 hover:border-rose-500/50 text-gray-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
        title="撤回这句发言及后续全部对话"
      >
        <Trash2 className="w-3 h-3 text-rose-400" />
        <span>撤回</span>
      </button>

      {/* 📋 复制 */}
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded-md bg-[#1a1c27] hover:bg-[#252838] border border-gray-700/50 hover:border-gray-500 text-gray-400 hover:text-white transition cursor-pointer"
        title="复制文本"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
      </button>
    </div>
  );
}
