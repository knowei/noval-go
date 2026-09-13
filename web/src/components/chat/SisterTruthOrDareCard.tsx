"use client";

import React, { useState } from 'react';
import { CardTurnActionBar } from './CardTurnActionBar';
import { Turn } from '@/lib/types';
import { Sparkles, Gamepad2, ChevronDown, ChevronUp, Trash2, Send } from 'lucide-react';

interface SisterTruthOrDareCardProps {
  turn: Turn;
  index: number;
  onSendAction?: (actionText: string) => void;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
}

export function SisterTruthOrDareCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
}: SisterTruthOrDareCardProps) {
  const [showMemory, setShowMemory] = useState(false);
  const [userName, setUserName] = useState('阿浩');
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');

  

  // 如果是第 0 轮（开局设定卡），按照媒体截图 media_1789310257883.png 渲染 1:1 专属高保真开场卡
  if (index === 0) {
    return (
      <div className="rounded-3xl border border-[#2e3146] bg-[#12131c] shadow-2xl p-5 sm:p-8 space-y-6 max-w-2xl mx-auto text-gray-200 animate-in fade-in duration-300">
        {/* 顶部斜体旁白 */}
        <div className="text-center text-xs sm:text-sm text-gray-400 italic font-mono tracking-wide px-2">
          你在卧室打游戏，听见喝了一点小酒的姐姐和她两个闺蜜，回家在客厅……
        </div>

        <div className="w-20 h-0.5 bg-gray-700/40 mx-auto rounded-full" />

        {/* 四段多色高亮对话框 (1:1 还原截图对话内容与角色) */}
        <div className="space-y-3 font-sans">
          {/* 1. 宋晚 (姐姐) - 红框 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-950/15 border border-rose-500/40 text-xs sm:text-sm text-rose-100/90 leading-relaxed shadow-sm">
            <span className="font-bold text-rose-400 mr-2 text-sm">宋晚:</span>
            <span>“这么早睡多没意思，不如我们三个来玩真心话大冒险吧？谁输了，惩罚就由赢家来定。”</span>
          </div>

          {/* 2. 夏绮 (闺蜜A) - 黄/橙框 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-950/15 border border-amber-500/40 text-xs sm:text-sm text-amber-100/90 leading-relaxed shadow-sm">
            <span className="font-bold text-amber-400 mr-2 text-sm">夏绮:</span>
            <span>“好啊！不过光我们三个玩有什么劲？要是抽到大冒险，惩罚目标必须是卧室里那个正在打游戏的小子，怎么样？敢不敢玩点刺激的？”</span>
          </div>

          {/* 3. 林初 (闺蜜B) - 蓝框 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-950/15 border border-sky-500/40 text-xs sm:text-sm text-sky-100/90 leading-relaxed shadow-sm">
            <span className="font-bold text-sky-400 mr-2 text-sm">林初:</span>
            <span>“啊……这不太好吧？万一抽到的惩罚太过火，他要是拒绝怎么办……”</span>
          </div>

          {/* 4. 宋晚 (姐姐) - 红框 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-950/15 border border-rose-500/40 text-xs sm:text-sm text-rose-100/90 leading-relaxed shadow-sm">
            <span className="font-bold text-rose-400 mr-2 text-sm">宋晚:</span>
            <span>“拒绝，那只能说明你魅力不够，你不是挺喜欢那小子吗。”</span>
          </div>
        </div>

        {/* 底部醒目红字提示 (1:1 还原) */}
        <div className="pt-2 text-center text-xs sm:text-sm font-bold text-rose-500 tracking-wide leading-relaxed">
          开场方式：直接输入框写上 我叫*** 就可以开始了，记忆区直接用官方的记忆加强，或MOD就行如果撞甲严重，可以用北极星的破甲MOD
        </div>

        {/* 便捷开局互动按钮 */}
        <div className="pt-2 border-t border-[#222434] space-y-2">
          <div className="text-[11px] text-gray-400 font-semibold flex items-center justify-between">
            <span>⚡ 快捷开局分支选择:</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">主角姓名:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-16 px-1.5 py-0.5 rounded bg-[#1c1e2a] border border-gray-700 text-amber-300 text-[11px] text-center"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onSendAction?.(`我叫${userName}。我推开卧室房门：“你们三个喝了酒在客厅吵什么呢？”`)}
              className="p-2.5 rounded-xl bg-[#1b1c28] hover:bg-rose-950/40 border border-[#2c2f42] hover:border-rose-500/50 text-left text-gray-200 transition cursor-pointer"
            >
              <span className="font-bold text-rose-400 mr-1.5">[主动走入]</span>
              <span>推开门走向客厅：“你们喝多了在吵什么？”</span>
            </button>

            <button
              onClick={() => onSendAction?.(`我叫${userName}。我坐在卧室里戴着耳机，故意把声音调大装作听不见她们说话。`)}
              className="p-2.5 rounded-xl bg-[#1b1c28] hover:bg-amber-950/40 border border-[#2c2f42] hover:border-amber-500/50 text-left text-gray-200 transition cursor-pointer"
            >
              <span className="font-bold text-amber-400 mr-1.5">[装聋作哑]</span>
              <span>戴上耳机装没听见，看她们谁敢进房拽人</span>
            </button>

            <button
              onClick={() => onSendAction?.(`我叫${userName}。靠在门框上坏笑：“大冒险惩罚？既然要拿我当道具，那赢的人给什么奖励？”`)}
              className="p-2.5 rounded-xl bg-[#1b1c28] hover:bg-sky-950/40 border border-[#2c2f42] hover:border-sky-500/50 text-left text-gray-200 transition cursor-pointer"
            >
              <span className="font-bold text-sky-400 mr-1.5">[反向谈条件]</span>
              <span>靠在门框坏笑反问赢家给什么奖励</span>
            </button>

            <button
              onClick={() => onSendAction?.(`我叫${userName}。坐到沙发单人座拍拍大腿：“姐姐愿赌服输，那就坐上来吧。”`)}
              className="p-2.5 rounded-xl bg-[#1b1c28] hover:bg-purple-950/40 border border-[#2c2f42] hover:border-purple-500/50 text-left text-gray-200 transition cursor-pointer"
            >
              <span className="font-bold text-purple-400 mr-1.5">[直奔主题]</span>
              <span>坐进沙发拍拍大腿：“姐姐愿赌服输，坐吧”</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 随后的剧情回合渲染
  const formatDialogue = (content: string) => {
    return content.split(/([“「].*?[”」])/g).map((part, i) => {
      if (/^[“「].*?[”」]$/.test(part)) {
        return (
          <span key={i} className="dialogue-quote font-semibold text-rose-300">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="rounded-2xl border border-[#292b3a] bg-[#14151f] shadow-xl p-5 sm:p-6 space-y-4 text-gray-200 text-xs sm:text-sm animate-in fade-in duration-200">
      {/* 剧情文本 */}
      <div className="leading-relaxed whitespace-pre-wrap font-sans space-y-2 select-text">
        {formatDialogue(turn.story || turn.text || '')}
      </div>

      {/* 记忆折叠 */}
      {turn.memory && turn.memory.length > 0 && (
        <div className="rounded-xl border border-[#242634] bg-[#101118] overflow-hidden text-xs">
          <button
            onClick={() => setShowMemory(!showMemory)}
            className="w-full px-3.5 py-2 flex items-center justify-between text-gray-400 hover:text-gray-200 transition cursor-pointer font-mono"
          >
            <span className="flex items-center gap-1.5">
              <span>📄 本幕记忆沉淀 ({turn.memory.length} 条事实)</span>
            </span>
            {showMemory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showMemory && (
            <div className="p-3 border-t border-[#1c1d28] space-y-1.5 text-gray-300 bg-[#0e0f14]">
              {turn.memory.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 shrink-0">•</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 状态栏 */}
      {turn.status && (
        <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/10 text-xs text-rose-200/90 space-y-1">
          <div className="font-bold text-rose-300 flex items-center gap-1.5">
            <span>👭 客厅局势与三人状态:</span>
          </div>
          {Object.entries(turn.status).map(([k, v]) => (
            <div key={k} className="text-[11px] text-gray-300">
              <span className="text-gray-400">• {k}: </span>
              <span>{typeof v === 'string' ? v : JSON.stringify(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 分支选项 */}
      {turn.branches && turn.branches.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-gray-400">🎯 下一步行动抉择:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {turn.branches.map((b, bIdx) => (
              <button
                key={bIdx}
                onClick={() => onSendAction?.(b.desc ? `${b.title}：${b.desc}` : b.title)}
                className="p-3 rounded-xl border border-[#272938] bg-[#191a24] hover:border-rose-500/60 hover:bg-rose-950/20 text-left transition cursor-pointer group"
              >
                <div className="font-bold text-xs text-gray-200 group-hover:text-rose-300 flex items-center gap-1.5">
                  <span className="text-rose-400 font-mono">[{b.tag || String.fromCharCode(65 + bIdx)}]</span>
                  <span>{b.title}</span>
                </div>
                {b.desc && <div className="text-[11px] text-gray-400 mt-1 leading-snug">{b.desc}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

            {/* 底部功能条 */}
      <CardTurnActionBar
        index={index}
        model={turn.model}
        storyContent={turn.story || turn.text || ''}
        onContinueWriting={onContinueWriting}
        onRegenerate={onRegenerate}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDelete={onDelete}
        isEditing={isEditing}
      />
    </div>
  );
}
