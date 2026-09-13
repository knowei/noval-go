"use client";

import React, { useState } from 'react';
import { Send, Dices } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

const ACTION_CAPSULES = [
  '主动上前打破沉默',
  '静观其变，捕捉细微线索',
  '轻声安抚对方的情绪',
  '直接表明真实意图'
];

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRandomDice = () => {
    const randomAction = ACTION_CAPSULES[Math.floor(Math.random() * ACTION_CAPSULES.length)];
    onSend(randomAction);
  };

  return (
    <div className="sticky bottom-0 z-30 w-full p-3 sm:p-4 bg-gradient-to-t from-[#0e0f14] via-[#0e0f14]/95 to-transparent">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Quick action capsules */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={handleRandomDice}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-[#1b1c26] hover:bg-[#242634] border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition shrink-0 cursor-pointer shadow-sm"
            title="掷骰子随机行动"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>随机掷骰</span>
          </button>

          {ACTION_CAPSULES.map((cap) => (
            <button
              key={cap}
              onClick={() => onSend(cap)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-[#171822] hover:bg-[#212330] border border-[#2c2f3e] hover:border-gray-500 text-[11px] text-gray-300 transition shrink-0 cursor-pointer"
            >
              {cap}
            </button>
          ))}
        </div>

        {/* Input Bar with Textarea */}
        <div className="relative flex items-center rounded-2xl bg-[#161720] border border-[#2b2e3c] focus-within:border-pink-500/80 transition shadow-2xl p-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder={isLoading ? 'AI 正在沉浸推演剧情中...' : '输入你的动作或对话 (电脑端Shift+回车可换行)'}
            className="w-full pl-3 pr-12 py-2 bg-transparent text-gray-100 placeholder-gray-500 text-xs sm:text-sm outline-none resize-none leading-relaxed font-sans"
            style={{ maxHeight: '120px' }}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-30 text-white transition shadow-md cursor-pointer flex items-center justify-center shrink-0"
            title="发送 (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
