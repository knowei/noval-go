"use client";

import React, { useState } from 'react';
import { Turn } from '@/lib/types';
import { generateContextualBranches } from '@/lib/modelParser';
import { CardTurnActionBar } from './CardTurnActionBar';
import { RichStoryRenderer } from './RichStoryRenderer';
import {
  Activity,
  Droplets,
  Utensils,
  BatteryMedium,
  Radiation,
  Package,
  MapPin,
  AlertTriangle,
  Radio,
  ChevronDown,
  ChevronUp,
  Shield,
  Compass
} from 'lucide-react';

interface ApocalypseSurvivalCardProps {
  turn: Turn;
  index: number;
  onSendAction: (action: string) => void;
  onDelete: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
  onSwipeChange?: (index: number, newSwipeIndex: number) => void;
}

export const ApocalypseSurvivalCard = React.memo(function ApocalypseSurvivalCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
  onSwipeChange,
}: ApocalypseSurvivalCardProps) {
  const [isHudExpanded, setIsHudExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');

  const storyText = turn.story || turn.text || '';
  const status = turn.status || {};

  // 生存指标数据（自带废土氛围兜底）
  const healthVal = status.health || '90%';
  const staminaVal = status.stamina || '65%';
  const hydrationVal = status.hydration || '中度缺水 (剩余200ml)';
  const satietyVal = status.satiety || '饥肠辘辘';
  const batteryVal = status.battery || '40%';
  const infectionVal = status.infection || '安全 (0%)';
  const threatLevel = status.threatLevel || '【三级警戒】地下安全屋门外游荡回响 · 外部断水断电';
  const inventoryList = status.inventory && status.inventory.length > 0
    ? status.inventory
    : ['未开封纯净水 (200ml)', '生锈战术高碳钢军刀', '半块军用压缩饼干', '强光战术手电筒(微光)'];

  const activeBranches = React.useMemo(() => {
    return turn.branches && turn.branches.length > 0
      ? turn.branches
      : generateContextualBranches('deck_apocalypse_survival', storyText, index);
  }, [turn.branches, storyText, index]);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-[#13151b] border border-orange-500/30 shadow-2xl space-y-4 text-gray-200 select-text relative overflow-hidden">
      {/* 废土科技背景警戒条纹微装饰 */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-orange-600/5 rounded-full blur-2xl pointer-events-none -z-0" />

      {/* 顶栏：位置与时间标记 */}
      <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5 text-xs text-orange-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-orange-950/80 border border-orange-600/40 text-[10px] text-orange-300 font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse text-orange-400" />
            <span>废土求生 MOD 运行中</span>
          </span>
          {turn.location && (
            <span className="flex items-center gap-1 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{turn.location}</span>
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-500 font-mono">第 {index + 1} 幕</span>
      </div>

      {/* 📟 废土战术生存 HUD 仪表盘 */}
      <div className="rounded-xl bg-[#0d0f14] border border-orange-500/25 p-3.5 space-y-3 shadow-inner">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-orange-300 font-bold font-mono tracking-wider">
            <Activity className="w-4 h-4 text-orange-400" />
            <span>TACTICAL SURVIVAL HUD · 实时生存体征</span>
          </div>
          <button
            type="button"
            onClick={() => setIsHudExpanded(!isHudExpanded)}
            className="text-[11px] text-gray-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition"
          >
            <span>{isHudExpanded ? '收起状态' : '展开状态'}</span>
            {isHudExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 威胁等级横幅 */}
        <div className="px-2.5 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/20 flex items-center justify-between text-[11px] font-mono text-orange-200/90">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">环境威胁：{threatLevel}</span>
          </span>
          <span className="text-orange-400/80 font-bold shrink-0 ml-2">[GM 裁决生效]</span>
        </div>

        {isHudExpanded && (
          <div className="space-y-3 pt-1 animate-in fade-in-50 duration-150">
            {/* 6格生存核心数据网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {/* 生命/健康 */}
              <div className="p-2 rounded-lg bg-[#141720] border border-red-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-300">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px]">生命</span>
                </div>
                <span className="font-bold text-red-200">{healthVal}</span>
              </div>

              {/* 体力值 */}
              <div className="p-2 rounded-lg bg-[#141720] border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">体力</span>
                </div>
                <span className="font-bold text-amber-200">{staminaVal}</span>
              </div>

              {/* 水分 */}
              <div className="p-2 rounded-lg bg-[#141720] border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px]">水分</span>
                </div>
                <span className="font-bold text-cyan-200 truncate max-w-[70px]" title={String(hydrationVal)}>{hydrationVal}</span>
              </div>

              {/* 饱腹感 */}
              <div className="p-2 rounded-lg bg-[#141720] border border-yellow-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-yellow-300">
                  <Utensils className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-[11px]">饱腹</span>
                </div>
                <span className="font-bold text-yellow-200 truncate max-w-[70px]" title={String(satietyVal)}>{satietyVal}</span>
              </div>

              {/* 手电电量 */}
              <div className="p-2 rounded-lg bg-[#141720] border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">手电</span>
                </div>
                <span className="font-bold text-emerald-200">{batteryVal}</span>
              </div>

              {/* 辐射/感染 */}
              <div className="p-2 rounded-lg bg-[#141720] border border-lime-500/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-lime-300">
                  <Radiation className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-[11px]">感染</span>
                </div>
                <span className="font-bold text-lime-200 truncate max-w-[70px]" title={String(infectionVal)}>{infectionVal}</span>
              </div>
            </div>

            {/* 🎒 随身战术背包物品栏 */}
            <div className="p-2.5 rounded-lg bg-[#141720] border border-gray-700/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold font-mono">
                <Package className="w-3.5 h-3.5 text-orange-400" />
                <span>随身战术背包物品 (负重与物资清单)：</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inventoryList.map((item, ii) => (
                  <span
                    key={ii}
                    className="px-2 py-0.5 rounded-md bg-[#1f2330] border border-gray-600 text-[11px] text-gray-200 font-mono shadow-xs flex items-center gap-1"
                  >
                    <span className="text-orange-400 font-bold">•</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 💭 NPC内心动摇 / 绝望心声 */}
      {turn.npcThought && (
        <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed font-serif">
          <span className="font-bold text-purple-300 mr-1.5">💭 苏晓染的绝望心防与动机：</span>
          <span>{turn.npcThought}</span>
        </div>
      )}

      {/* 正文渲染 */}
      {isEditing ? (
        <div className="space-y-2 p-3 rounded-xl bg-[#0e1017] border border-orange-500/40">
          <div className="text-xs text-orange-300 font-bold flex items-center justify-between">
            <span>✏️ 编辑第 {index + 1} 幕末世求生记录</span>
            <span className="text-[11px] text-gray-400">编辑后保存即时生效</span>
          </div>
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            rows={8}
            className="w-full p-2.5 rounded-lg bg-[#161822] border border-gray-700 text-gray-100 text-xs sm:text-sm font-serif leading-relaxed outline-none focus:border-orange-400"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setEditedStory(storyText);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (onEdit) onEdit(index, editedStory);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded-md bg-orange-600 text-white text-xs font-medium hover:bg-orange-500"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <RichStoryRenderer rawStory={storyText} deckId="deck_apocalypse_survival" />
      )}

      {/* 🎲 4 个高风险高回报冒险探索分支 */}
      {activeBranches && activeBranches.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-orange-500/20">
          <div className="flex items-center gap-1.5 text-xs text-orange-300 font-bold font-mono">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>下一步废土生存博弈行动分支：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeBranches.map((b, bi) => (
              <button
                key={bi}
                onClick={() => onSendAction(b.desc ? `【${b.title}】：${b.desc}` : b.title)}
                className="text-left p-2.5 sm:p-3 rounded-xl bg-[#161922] hover:bg-[#1f2330] border border-orange-500/20 hover:border-orange-500/50 transition cursor-pointer group shadow-xs"
              >
                <div className="text-xs font-bold text-orange-200 group-hover:text-orange-300 flex items-center justify-between gap-1">
                  <span className="truncate">{b.title}</span>
                  <span className="text-[10px] text-orange-500 font-mono shrink-0">分支 {bi + 1}</span>
                </div>
                {b.desc && b.desc !== b.title && (
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal line-clamp-2">
                    {b.desc}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 底部功能条 */}
      <CardTurnActionBar
        index={index}
        model={turn.model}
        storyContent={storyText}
        onRegenerate={onRegenerate}
        onContinueWriting={onContinueWriting}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDelete={onDelete}
        isEditing={isEditing}
        swipes={turn.swipes}
        swipeIndex={turn.swipeIndex}
        onSwipeChange={onSwipeChange}
      />
    </div>
  );
});