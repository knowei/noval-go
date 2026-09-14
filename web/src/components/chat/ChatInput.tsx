"use client";

import React, { useState } from 'react';
import { Dices, ArrowDown, RotateCcw, Sliders, MessageSquare, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onRegenerateLast?: () => void;
  inputText?: string;
  setInputText?: (val: string) => void;
  onScrollToBottom?: () => void;
}

const ACTION_CAPSULES = [
  '主动上前打破沉默',
  '静观其变，捕捉细微线索',
  '试探对方真实心理防线',
  '轻声安抚对方的情绪',
  '直接表明真实意图'
];

const SURPRISE_EVENTS = [
  '🎲【突发心跳】：房间光线突然微晃，彼此距离骤然拉近，连呼吸声都清晰可辨',
  '🎲【因果律微调】：视线不经意扫过对方被水汽与汗珠微微浸润的衣角',
  '🎲【测谎真心话】：直接直视对方微颤的双眼：“看着我，回答我一个问题”',
  '🎲【突发失衡】：脚下不经意轻微踉跄，下意识扶住对方温热纤细的腰肢',
  '🎲【微表情解构】：捕捉到对方耳根深处那一抹无法掩饰的潮红与局促',
  '🎲【越界试探】：抬手轻轻挑开散落在对方额前的凌乱发丝，试探反应'
];

export function ChatInput({
  onSend,
  isLoading,
  onRegenerateLast,
  inputText,
  setInputText,
  onScrollToBottom,
}: ChatInputProps) {
  const [internalInput, setInternalInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [showCapsules, setShowCapsules] = useState(true);

  const inputVal = inputText !== undefined ? inputText : internalInput;
  const setVal = setInputText || setInternalInput;

  const handleSend = () => {
    if (!inputVal.trim() || isLoading) return;
    onSend(inputVal.trim());
    setVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRandomDice = () => {
    const randomEvent = SURPRISE_EVENTS[Math.floor(Math.random() * SURPRISE_EVENTS.length)];
    onSend(randomEvent);
  };

  const scrollToBottom = () => {
    if (onScrollToBottom) {
      onScrollToBottom();
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky bottom-0 z-30 w-full p-2.5 sm:p-4 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/95 to-transparent">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* 1. 顶部悬浮工具条 (1:1 像素级对齐 media_1789310839949.png & media_1789310859945.png) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar justify-start select-none">
          <span className="px-2 py-0.5 rounded-lg bg-[#1a1b24] border border-gray-700/60 text-[11px] text-gray-300 font-mono flex items-center gap-1 shrink-0">
            <span>🗂️</span>
            <span>Mod</span>
          </span>

          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono flex items-center gap-1 shrink-0 transition cursor-pointer ${
              isStreaming
                ? 'bg-[#1a1b24] border-sky-500/50 text-sky-300'
                : 'bg-[#161720] border-gray-700 text-gray-400'
            }`}
          >
            <span>≈</span>
            <span>流式</span>
          </button>

          <span className="px-2 py-0.5 rounded-lg bg-[#1a1b24] border border-gray-700/60 text-[11px] text-gray-300 flex items-center gap-1 shrink-0">
            <MessageSquare className="w-3 h-3 text-gray-400" />
            <span>评论 (244)</span>
          </span>

          <button
            type="button"
            onClick={scrollToBottom}
            className="px-2 py-0.5 rounded-lg bg-[#1a1b24] hover:bg-[#252838] border border-gray-700/60 text-[11px] text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1 shrink-0"
            title="平滑滚动至最下方"
          >
            <ArrowDown className="w-3 h-3" />
            <span>回到底部</span>
          </button>

          {onRegenerateLast && (
            <button
              type="button"
              onClick={onRegenerateLast}
              disabled={isLoading}
              className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-[11px] text-amber-300 font-bold transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              title="重新生成最后一幕剧情回复"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重新回复</span>
            </button>
          )}

          <span className="px-2 py-0.5 rounded-lg bg-[#1a1b24] border border-gray-700/60 text-[11px] text-gray-400 shrink-0 cursor-pointer">
            更多
          </span>

          <button
            type="button"
            onClick={() => setShowCapsules(!showCapsules)}
            className="px-2 py-0.5 rounded-lg bg-[#1a1b24] hover:bg-[#252838] border border-gray-700/60 text-[11px] text-gray-400 hover:text-gray-200 cursor-pointer flex items-center gap-1 shrink-0 transition"
          >
            <span>⊞</span>
            <span>{showCapsules ? '隐藏按钮' : '显示按钮'}</span>
          </button>

          <span className="px-2 py-0.5 rounded-lg bg-sky-950/40 border border-sky-600/40 text-[11px] text-sky-300 shrink-0">
            [暂停时间推进]
          </span>

          <span className="px-2 py-0.5 rounded-lg bg-red-950/40 border border-red-600/40 text-[11px] text-red-300 shrink-0 font-bold">
            【紧急】
          </span>
        </div>

        {/* 2. 快捷行动胶囊 (可通过隐藏按钮折叠) */}
        {showCapsules && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            <button
              onClick={handleRandomDice}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-[#1b1c26] hover:bg-[#242634] border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition shrink-0 cursor-pointer shadow-xs"
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
        )}

        {/* 3. 输入框 (1:1 对齐截图: 电脑端Shift+回车可换行 + 字符数 + 金黄色圆形发送按钮) */}
        <div className="relative flex items-center rounded-2xl bg-[#14151e] border border-[#272938] focus-within:border-amber-500/70 transition shadow-2xl px-3 py-1.5">
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
            {/* 字符统计 */}
            <span className="text-[11px] font-mono text-gray-500 select-none">
              {inputVal.length}
            </span>

            {/* 金黄色圆形发送按钮 */}
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
  );
}
