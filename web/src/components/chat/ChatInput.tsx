"use client";

import React, { useState } from 'react';
import { Dices, ArrowDown, RotateCcw, Sliders, MessageSquare, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';

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

export const TONE_MODIFIERS = [
  { id: 'dominate', label: '👑 强势掌控', activeClass: 'border-amber-500 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)]', inactiveClass: 'border-amber-500/30 bg-[#161720] text-amber-300/80 hover:border-amber-500/60', tag: '【行动基调：强势掌控，居高临下，打破侥幸心理】' },
  { id: 'gentle', label: '🌸 温柔克制', activeClass: 'border-pink-500 bg-pink-500/20 text-pink-200 shadow-[0_0_10px_rgba(244,114,182,0.25)]', inactiveClass: 'border-pink-500/30 bg-[#161720] text-pink-300/80 hover:border-pink-500/60', tag: '【行动基调：温柔体贴，极度克制，抚平戒备心】' },
  { id: 'tease', label: '😏 玩味戏谑', activeClass: 'border-purple-500 bg-purple-500/20 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]', inactiveClass: 'border-purple-500/30 bg-[#161720] text-purple-300/80 hover:border-purple-500/60', tag: '【行动基调：玩味调侃，坏笑挑逗，直击羞耻软肋】' },
  { id: 'cold', label: '❄️ 冷淡试探', activeClass: 'border-sky-500 bg-sky-500/20 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.25)]', inactiveClass: 'border-sky-500/30 bg-[#161720] text-sky-300/80 hover:border-sky-500/60', tag: '【行动基调：冷静疏离，言简意赅，以静制动观察反应】' },
  { id: 'comfort', label: '🕊️ 真诚安抚', activeClass: 'border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.25)]', inactiveClass: 'border-emerald-500/30 bg-[#161720] text-emerald-300/80 hover:border-emerald-500/60', tag: '【行动基调：真诚坦荡，深情体贴，给予十足安全感】' },
  { id: 'breakthrough', label: '⚡ 极限越界', activeClass: 'border-rose-500 bg-rose-500/20 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.25)]', inactiveClass: 'border-rose-500/30 bg-[#161720] text-rose-300/80 hover:border-rose-500/60', tag: '【行动基调：果断打破界限，强势推进，撕破所有伪装】' },
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
  const [activeTone, setActiveTone] = useState<string | null>(null);

  const inputVal = inputText !== undefined ? inputText : internalInput;
  const setVal = setInputText || setInternalInput;

  const handleSend = () => {
    if (!inputVal.trim() || isLoading) return;
    let finalMsg = inputVal.trim();
    if (activeTone) {
      const toneObj = TONE_MODIFIERS.find((t) => t.id === activeTone);
      if (toneObj && !finalMsg.includes('【行动基调')) {
        finalMsg = `${toneObj.tag} ${finalMsg}`;
      }
    }
    onSend(finalMsg);
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

  const { setIsModCenterOpen, enabledMods } = useAppStore();
  const activeModCount = Object.values(enabledMods).filter(Boolean).length;

  return (
    <div className="sticky bottom-0 z-30 w-full p-2.5 sm:p-4 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/95 to-transparent">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* 1. 顶部悬浮工具条 (1:1 像素级对齐 media_1789310839949.png & media_1789310859945.png) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar justify-start select-none">
          <button
            type="button"
            onClick={() => setIsModCenterOpen(true)}
            className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 hover:border-amber-400 text-[11px] text-amber-200 font-mono flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.25)] group active:scale-95"
            title="点击打开玩法模组中心 (MOD 插件与机制管理)"
          >
            <span className="text-xs group-hover:scale-110 transition-transform">🗂️</span>
            <span className="font-bold">Mod</span>
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-amber-400/30 text-amber-200 font-bold border border-amber-400/40">
              {activeModCount}
            </span>
          </button>

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
            className={`px-2 py-0.5 rounded-lg border text-[11px] cursor-pointer flex items-center gap-1 shrink-0 transition ${
              showCapsules
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50'
                : 'bg-[#1a1b24] border-gray-700/60 text-gray-400 hover:text-gray-200 hover:bg-[#252838]'
            }`}
            title="展开或折叠快捷动作与语气基调工具条"
          >
            <span>{showCapsules ? '▾' : '▸'}</span>
            <span>{showCapsules ? '收起快捷条' : '展开快捷条'}</span>
          </button>
        </div>

        {/* 2. 快捷行动胶囊与语气修饰器 (可通过收起快捷条折叠) */}
        {showCapsules && (
          <div className="space-y-1.5 animate-in fade-in duration-150">
            {/* 快捷行动胶囊 */}
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

            {/* 🎭 行动语气与情绪修饰器 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
              <span className="text-[10px] text-gray-500 font-mono shrink-0 select-none pl-1">
                🎭 语气基调:
              </span>
              {TONE_MODIFIERS.map((tone) => {
                const isSelected = activeTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setActiveTone(isSelected ? null : tone.id)}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition shrink-0 cursor-pointer flex items-center gap-1 ${
                      isSelected ? tone.activeClass : tone.inactiveClass
                    }`}
                    title={tone.tag}
                  >
                    <span>{tone.label}</span>
                    {isSelected && <span className="text-[9px] opacity-70">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. 输入框 (1:1 对齐截图: 电脑端Shift+回车可换行 + 字符数 + 金黄色圆形发送按钮) */}
        <div className="relative flex flex-col rounded-2xl bg-[#14151e] border border-[#272938] focus-within:border-amber-500/70 transition shadow-2xl p-2 sm:px-3 sm:py-2">
          {activeTone && (
            <div className="flex items-center gap-1.5 mb-1 text-[11px]">
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-medium flex items-center gap-1">
                <span>{TONE_MODIFIERS.find((t) => t.id === activeTone)?.label}</span>
                <span onClick={() => setActiveTone(null)} className="cursor-pointer hover:text-white ml-0.5">×</span>
              </span>
              <span className="text-[10px] text-gray-500">发送时将附带此情绪引导 AI 回应</span>
            </div>
          )}
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
  </div>
  );
}
