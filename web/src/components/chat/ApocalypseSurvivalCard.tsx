"use client";

import React, { useState } from 'react';
import { Turn } from '@/lib/types';
import { generateContextualBranches } from '@/lib/modelParser';
import { CardTurnActionBar } from './CardTurnActionBar';
import { RichStoryRenderer } from './RichStoryRenderer';
import { useAppStore } from '@/lib/store';
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
  const { setIsModCenterOpen, enabledMods } = useAppStore();
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

  const isDeadOrFatal = React.useMemo(() => {
    const hStr = String(healthVal);
    const textToCheck = `${hStr} ${threatLevel} ${storyText}`.toLowerCase();
    return (
      hStr.startsWith('0') ||
      hStr.includes('阵亡') ||
      hStr.includes('死亡') ||
      hStr.includes('已死') ||
      hStr.includes('撕裂') ||
      textToCheck.includes('壮烈战死') ||
      textToCheck.includes('壮烈阵亡') ||
      textToCheck.includes('角色阵亡') ||
      textToCheck.includes('已被尸群撕裂')
    );
  }, [healthVal, threatLevel, storyText]);

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border shadow-2xl space-y-4 text-gray-200 select-text relative overflow-hidden transition-all duration-300 ${
      isDeadOrFatal
        ? 'bg-[#150a0d] border-red-600/70 shadow-[0_0_35px_rgba(220,38,38,0.25)]'
        : 'bg-[#13151b] border-orange-500/30'
    }`}>
      {/* 废土科技背景警戒条纹微装饰 */}
      <div className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none -z-0 ${
        isDeadOrFatal ? 'bg-red-600/15' : 'bg-orange-600/5'
      }`} />

      {/* 顶栏：位置与时间标记 */}
      <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5 text-xs text-orange-400 font-mono">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModCenterOpen(true)}
            className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs group ${
              isDeadOrFatal
                ? 'bg-red-950 border-red-500/50 text-red-300 hover:bg-red-900'
                : 'bg-orange-950/80 hover:bg-orange-900 border-orange-600/40 text-orange-300'
            }`}
            title="点击打开模组中心 (MOD 插件与机制管理)"
          >
            <Radio className="w-3 h-3 animate-pulse text-orange-400 group-hover:scale-110 transition-transform" />
            <span>废土求生 MOD · {isDeadOrFatal ? '绝境结算中' : '运行中'}</span>
            <span className="text-[9px] text-orange-400/80 underline ml-0.5">配置</span>
          </button>
          {turn.location && (
            <span className="flex items-center gap-1 text-gray-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{turn.location}</span>
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-500 font-mono">第 {index + 1} 幕</span>
      </div>

      {/* 💀 致命悬殊战力/阵亡警报横幅 */}
      {isDeadOrFatal && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/90 via-[#2a0b12] to-red-950/90 border border-red-500/70 text-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">💀</span>
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-wider text-red-200 flex items-center gap-2">
                <span>【悬殊战力绝杀 · 角色阵亡 / 濒死重创结算】</span>
                <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[10px] font-mono tracking-normal">FATAL CHECK</span>
              </div>
              <p className="text-[11px] text-red-300/85 mt-0.5 leading-relaxed">
                主角在极端悬殊的对抗中肉身凡胎被狂暴尸潮撕裂！严酷物理规律生效，严禁锁血无双。请选择下方分支应对后续或直接【读档上一幕】。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer transition hover:scale-105 active:scale-95"
            title="撤销本轮冲动指令，回到安全节点"
          >
            <span>↺</span>
            <span>回溯读档上一幕</span>
          </button>
        </div>
      )}

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
        <div className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-[11px] font-mono ${
          isDeadOrFatal
            ? 'bg-red-950/60 border-red-500/40 text-red-200'
            : 'bg-orange-950/40 border-orange-500/20 text-orange-200/90'
        }`}>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300">环境威胁：</span>
            <span className="truncate max-w-[240px] sm:max-w-md">{threatLevel}</span>
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            isDeadOrFatal ? 'bg-red-600/50 text-red-200 border border-red-500' : 'bg-red-950/80 text-red-300 border border-red-500/30'
          }`}>
            {isDeadOrFatal ? '致命极危' : '战术警戒'}
          </span>
        </div>

        {/* 核心体征 6 联排 (展开状态) */}
        {isHudExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141720] border border-red-500/20">
              <Activity className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">生命值 (HP)</div>
                <div className={`font-bold ${isDeadOrFatal ? 'text-red-400 animate-pulse' : 'text-red-300'}`}>{healthVal}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141720] border border-amber-500/20">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">体力 (SP)</div>
                <div className="font-bold text-amber-300">{staminaVal}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141720] border border-cyan-500/20">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-gray-400">水分代谢</div>
                <div className="font-bold text-cyan-300 truncate" title={String(hydrationVal)}>{hydrationVal}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141720] border border-orange-500/20">
              <Utensils className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-gray-400">饱腹度</div>
                <div className="font-bold text-orange-300 truncate">{satietyVal}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141720] border border-emerald-500/20">
              <BatteryMedium className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">战术手电电量</div>
                <div className="font-bold text-emerald-300">{batteryVal}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#141720] border border-purple-500/20">
              <Radiation className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-[10px] text-gray-400">病毒/感染度</div>
                <div className="font-bold text-purple-300">{infectionVal}</div>
              </div>
            </div>
          </div>
        )}

        {/* 随身背包物资网格 (展开状态) */}
        {isHudExpanded && (
          <div className="pt-2 border-t border-orange-500/15 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5 font-bold text-orange-300 font-mono">
                <Package className="w-3.5 h-3.5 text-orange-400" />
                <span>背包物资 ({inventoryList.length}):</span>
              </span>
              <span className="text-[10px] text-gray-500">负重额度: 4.2kg / 15kg</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {inventoryList.map((item, itemIdx) => (
                <span
                  key={itemIdx}
                  className="px-2 py-0.5 rounded-md bg-[#161a24] border border-orange-500/20 text-[11px] text-orange-200/90 font-mono flex items-center gap-1 shadow-2xs"
                >
                  <span className="text-orange-400 text-xs">◆</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 💭 NPC内心动摇 / 绝望心声 (受模组开关控制) */}
      {enabledMods.innerVoice !== false && turn.npcThought && (
        <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed font-serif">
          <span className="font-bold text-purple-300 mr-1.5">💭 苏晓染的绝望心防与动机：</span>
          <span>{turn.npcThought}</span>
        </div>
      )}

      {/* 📖 正文区域 */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            className="w-full h-64 p-3 rounded-xl bg-[#0e1017] border border-orange-500/40 text-gray-200 text-sm leading-relaxed font-serif focus:outline-none focus:border-orange-500 resize-y"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditedStory(storyText);
                setIsEditing(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (onEdit) onEdit(index, editedStory);
                setIsEditing(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <RichStoryRenderer rawStory={storyText} deckId="deck_apocalypse_survival" />
      )}

      {/* 📟 随屏生存体征快照（方便阅读长剧情与探索分支时随时掌握状态） */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-mono shadow-sm ${
        isDeadOrFatal
          ? 'bg-[#180c10] border-red-500/40 text-red-200'
          : 'bg-[#0d0f14] border-orange-500/30 text-orange-200'
      }`}>
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          <span className={`font-bold flex items-center gap-1 shrink-0 ${isDeadOrFatal ? 'text-red-400' : 'text-orange-400'}`}>
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>生存快照:</span>
          </span>
          <span className={`font-semibold shrink-0 ${isDeadOrFatal ? 'text-red-400 animate-pulse' : 'text-red-300'}`}>生命 {healthVal}</span>
          <span className="text-gray-600">|</span>
          <span className="text-amber-300 font-semibold shrink-0">体力 {staminaVal}</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-cyan-300 truncate hidden sm:inline max-w-[130px]" title={String(hydrationVal)}>水分 {hydrationVal}</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-emerald-300 shrink-0 hidden sm:inline">手电 {batteryVal}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsHudExpanded(!isHudExpanded)}
          className="text-orange-400 hover:text-orange-300 text-[11px] underline shrink-0 ml-2 cursor-pointer font-sans"
        >
          {isHudExpanded ? '▲ 顶部HUD已展开' : '▼ 展开完整HUD与背包'}
        </button>
      </div>

      {/* 🎲 4 个高风险高回报冒险探索分支 (受模组开关控制) */}
      {enabledMods.explorationBranches !== false && activeBranches && activeBranches.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-orange-500/20">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className={`flex items-center gap-1.5 font-bold ${isDeadOrFatal ? 'text-red-300' : 'text-orange-300'}`}>
              <Compass className={`w-3.5 h-3.5 ${isDeadOrFatal ? 'text-red-400' : 'text-orange-400'}`} />
              <span>{isDeadOrFatal ? '【💀 绝境决断与重整分支】' : '下一步废土生存博弈行动分支：'}</span>
            </div>
            {isDeadOrFatal && (
              <span className="text-[10px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                可选择【读档上一幕】
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeBranches.map((b, bi) => {
              const isDeathBranch = b.title.includes('读档') || b.title.includes('阵亡') || b.title.includes('战死');
              return (
                <button
                  key={bi}
                  onClick={() => {
                    if (isDeathBranch && b.title.includes('读档')) {
                      onDelete(index);
                    } else {
                      onSendAction(b.desc ? `【${b.title}】：${b.desc}` : b.title);
                    }
                  }}
                  className={`text-left p-2.5 sm:p-3 rounded-xl border transition cursor-pointer group shadow-xs ${
                    isDeathBranch
                      ? 'bg-[#220d13] hover:bg-[#2d121b] border-red-500/50 hover:border-red-400'
                      : 'bg-[#161922] hover:bg-[#1f2330] border-orange-500/20 hover:border-orange-500/50'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between gap-1">
                    <span className={`truncate ${isDeathBranch ? 'text-red-300 group-hover:text-red-200' : 'text-orange-200 group-hover:text-orange-300'}`}>
                      {b.title}
                    </span>
                    <span className={`text-[10px] font-mono shrink-0 ${isDeathBranch ? 'text-red-400 font-bold' : 'text-orange-500'}`}>
                      {isDeathBranch ? '回溯' : `分支 ${bi + 1}`}
                    </span>
                  </div>
                  {b.desc && b.desc !== b.title && (
                    <p className={`text-[11px] mt-1 leading-normal line-clamp-2 ${isDeathBranch ? 'text-red-300/80' : 'text-gray-400'}`}>
                      {b.desc}
                    </p>
                  )}
                </button>
              );
            })}
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