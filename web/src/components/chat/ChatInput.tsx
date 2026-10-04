"use client";

import React, { useState, useEffect } from 'react';
import { ArrowDown, RotateCcw, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface ChatInputProps {
  onSend: (text: string) => void;
  onOpenWorkbench?: () => void;
  isLoading: boolean;
  onRegenerateLast?: () => void;
  inputText?: string;
  setInputText?: (val: string) => void;
  onScrollToBottom?: () => void;
}

export function ChatInput({
  onSend,
  onOpenWorkbench,
  isLoading,
  onRegenerateLast,
  inputText,
  setInputText,
  onScrollToBottom,
}: ChatInputProps) {
  const [internalInput, setInternalInput] = useState('');

  const inputVal = inputText !== undefined ? inputText : internalInput;
  const setVal = setInputText || setInternalInput;

  const handleSend = () => {
    if (!inputVal.trim() || isLoading) return;
    onSend(inputVal.trim());
    setVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    if (onScrollToBottom) {
      onScrollToBottom();
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const { setIsModCenterOpen, enabledMods } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const activeModCount = Object.values(enabledMods).filter(Boolean).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div id="chat-input-container" className="sticky bottom-0 z-30 w-full p-2.5 sm:p-4 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/95 to-transparent">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* 精简操作工具栏：仅保留真正具备功能的核心按钮 */}
        <div className="flex items-center justify-between gap-2 text-xs select-none px-1">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => onOpenWorkbench ? onOpenWorkbench() : setIsModCenterOpen(true)}
            className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-[11px] text-amber-200 font-mono flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs group active:scale-95"
            title={onOpenWorkbench ? "打开会话工作台" : "打开旧版模组设置"}
          >
            <span className="text-xs group-hover:scale-110 transition-transform">🗂️</span>
            <span className="font-bold">{onOpenWorkbench ? "会话设置" : "Mod"}</span>
            <span
              suppressHydrationWarning
              className="px-1 py-0.2 rounded-full text-[9px] bg-amber-400/30 text-amber-200 font-bold border border-amber-400/40"
            >
              {onOpenWorkbench ? "⋯" : isMounted ? activeModCount : 4}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {onRegenerateLast && (
              <button
                type="button"
                onClick={onRegenerateLast}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-[#1a1b24] hover:bg-[#252838] border border-gray-700/60 text-[11px] text-gray-300 hover:text-amber-300 transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
                title="重新生成最后一幕回复"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>重新回复</span>
              </button>
            )}

            <button
              type="button"
              onClick={scrollToBottom}
              className="px-2.5 py-1 rounded-lg bg-[#1a1b24] hover:bg-[#252838] border border-gray-700/60 text-[11px] text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shrink-0"
              title="平滑滚动至最下方"
            >
              <ArrowDown className="w-3 h-3 text-sky-400" />
              <span>回到底部</span>
            </button>
          </div>
        </div>

        {/* 输入框 */}
        <div className="relative flex flex-col rounded-2xl bg-[#14151e] border border-[#272938] focus-within:border-amber-500/70 transition shadow-2xl p-2 sm:px-3 sm:py-2">
          <div className="flex items-center w-full">
            <textarea
              value={inputVal}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder={isLoading ? 'AI 正在沉浸推演剧情中...' : '电脑端Shift+回车可换行'}
              className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-xs sm:text-sm outline-none resize-none leading-relaxed font-sans pr-2"
              style={{ maxHeight: '120px' }}
            />

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-gray-500 select-none">
                {inputVal.length}
              </span>

              <button
                type="button"
                onClick={handleSend}
                disabled={!inputVal.trim() || isLoading}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition shadow-md cursor-pointer shrink-0 ${
                  inputVal.trim() && !isLoading
                    ? 'bg-amber-400 hover:bg-amber-300 text-stone-900 shadow-amber-400/25 active:scale-95'
                    : 'bg-gray-800 text-gray-600 opacity-60 cursor-not-allowed'
                }`}
                title="发送消息 (Enter)"
              >
                <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
