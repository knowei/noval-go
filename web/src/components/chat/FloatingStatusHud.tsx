"use client";

import React, { useState, useMemo } from 'react';
import { Turn, EnabledMods } from '@/lib/types';
import { 
  Heart, 
  ShieldAlert, 
  ShieldCheck, 
  Swords, 
  Zap, 
  Package, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Activity
} from 'lucide-react';

interface FloatingStatusHudProps {
  turns: Turn[];
  enabledMods: EnabledMods;
}

export function FloatingStatusHud({ turns, enabledMods }: FloatingStatusHudProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);

  // 从最新的 AI 轮次中逆向解析状态
  const hudData = useMemo(() => {
    let loveData: {
      character: string;
      affection: number;
      stage: string;
      defense: number;
      permission: string;
    } | null = null;

    let rpgData: {
      realm: string;
      progress: number;
      hp: number;
      mp: number;
      inventory: string[];
      loot: string;
    } | null = null;

    // 从后往前找最新包含状态标签的 AI 轮次
    for (let i = turns.length - 1; i >= 0; i--) {
      const turn = turns[i];
      if (turn.isUser) continue;
      const text = turn.story || turn.text || '';

      // 1. 尝试解析 <love_status>
      if (!loveData && enabledMods.affectionGauge) {
        const loveMatch = text.match(/<love_status>([\s\S]*?)<\/love_status>/i);
        if (loveMatch) {
          const content = loveMatch[1];
          const charMatch = content.match(/\[(?:目标角色|角色)\]:\s*([^|]+)/i);
          const affMatch = content.match(/\[心动值\]:\s*(\d+)(?:\/100)?(?:\s*\(([^)]+)\))?/i);
          const defMatch = content.match(/\[(?:心防防御|心防|防御)\]:\s*(\d+)%/i);
          const permMatch = content.match(/\[(?:亲密许可|许可|动作权限)\]:\s*([^|]+)/i);

          const affection = affMatch ? parseInt(affMatch[1], 10) : 30;
          let stage = affMatch && affMatch[2] ? affMatch[2].trim() : '';
          if (!stage) {
            if (affection < 25) stage = '陌生戒备';
            else if (affection < 50) stage = '试探动摇';
            else if (affection < 75) stage = '暧昧悸动';
            else stage = '深层沦陷';
          }

          loveData = {
            character: charMatch ? charMatch[1].trim() : '女主角',
            affection: Math.min(100, Math.max(0, affection)),
            stage,
            defense: defMatch ? parseInt(defMatch[1], 10) : Math.max(0, 100 - affection),
            permission: permMatch ? permMatch[1].trim() : '社交距离'
          };
        }
      }

      // 2. 尝试解析 <rpg_status>
      if (!rpgData && enabledMods.rpgAdventureHud) {
        const rpgMatch = text.match(/<rpg_status>([\s\S]*?)<\/rpg_status>/i);
        if (rpgMatch) {
          const content = rpgMatch[1];
          const realmMatch = content.match(/\[(?:境界\/等级|境界|等级)\]:\s*([^|(]+)(?:\((?:进度:)?\s*(\d+)\/100\))?/i);
          const hpMatch = content.match(/\[(?:生命\/气血|生命|气血|HP)\]:\s*(\d+)%/i);
          const mpMatch = content.match(/\[(?:法力\/真元|法力|真元|MP|体力)\]:\s*(\d+)%/i);
          const bagMatch = content.match(/\[(?:储物背包|背包|储物袋)\]:\s*([^|]+)/i);
          const lootMatch = content.match(/\[(?:本轮收获|收获|掉落)\]:\s*([^|]+)/i);

          const rawBag = bagMatch ? bagMatch[1].trim() : '';
          const inventory = rawBag && rawBag !== '无' && rawBag !== '空' 
            ? rawBag.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
            : [];

          rpgData = {
            realm: realmMatch ? realmMatch[1].trim() : '凡人初始',
            progress: realmMatch && realmMatch[2] ? parseInt(realmMatch[2], 10) : 20,
            hp: hpMatch ? parseInt(hpMatch[1], 10) : 100,
            mp: mpMatch ? parseInt(mpMatch[1], 10) : 100,
            inventory,
            loot: lootMatch ? lootMatch[1].trim() : ''
          };
        }
      }

      if (loveData && rpgData) break;
    }

    return { loveData, rpgData };
  }, [turns, enabledMods.affectionGauge, enabledMods.rpgAdventureHud]);

  const { loveData, rpgData } = hudData;

  // 如果两个状态都没有解析出来，或者都没开启，不显示
  if (!loveData && !rpgData) {
    return null;
  }

  return (
    <div className="w-full mb-3 px-1 sm:px-2 select-none animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-[#11131a]/90 backdrop-blur-md border border-gray-800/80 hover:border-gray-700/80 rounded-xl p-2.5 sm:p-3 shadow-xl transition-all">
        {/* HUD 顶栏标签与折叠切换 */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-800/50 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 font-mono tracking-wider">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>LIVE HUD // 实时状态监控</span>
            </div>
            {loveData && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                心防羁绊
              </span>
            )}
            {rpgData && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                RPG 战力
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 px-1.5 py-0.5 rounded hover:bg-gray-800/60 transition cursor-pointer"
          >
            <span>{isCollapsed ? '展开仪表盘' : '收起'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* HUD 主体面板 */}
        {!isCollapsed && (
          <div className="pt-2 space-y-2.5">
            {/* 1. 恋爱心防羁绊条 */}
            {loveData && (
              <div className="bg-[#161824]/80 rounded-lg p-2.5 border border-pink-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-pink-200">
                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500/30" />
                    <span>{loveData.character}</span>
                    <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-pink-950/60 text-pink-300 border border-pink-500/30">
                      {loveData.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-pink-300 font-bold">
                      心动: {loveData.affection}/100
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-amber-300">
                      心防防御: {loveData.defense}%
                    </span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden p-0.5 border border-gray-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-400 transition-all duration-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    style={{ width: `${loveData.affection}%` }}
                  />
                </div>

                {/* 亲密权限提示 */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                  <span className="flex items-center gap-1 text-gray-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>当前亲密许可:</span>
                    <strong className="text-gray-200 font-normal">{loveData.permission}</strong>
                  </span>
                  <span className="text-[10px] text-pink-400/80 font-mono">
                    单轮防线浮动 ±3 限制生效中
                  </span>
                </div>
              </div>
            )}

            {/* 2. RPG 战力属性条 */}
            {rpgData && (
              <div className="bg-[#141624]/80 rounded-lg p-2.5 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-200">
                    <Swords className="w-3.5 h-3.5 text-indigo-400" />
                    <span>境界阶位:</span>
                    <span className="text-amber-300 font-mono font-bold">
                      {rpgData.realm}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      (经验: {rpgData.progress}%)
                    </span>
                  </div>

                  {rpgData.loot && rpgData.loot !== '无' && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      <span>战利品: {rpgData.loot}</span>
                    </div>
                  )}
                </div>

                {/* 生命条 (红) 与 法力条 (蓝) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-red-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> 气血/生命
                      </span>
                      <span className="text-gray-300 font-bold">{rpgData.hp}%</span>
                    </div>
                    <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
                        style={{ width: `${rpgData.hp}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 法力/真元
                      </span>
                      <span className="text-gray-300 font-bold">{rpgData.mp}%</span>
                    </div>
                    <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-700 to-cyan-500 transition-all duration-500"
                        style={{ width: `${rpgData.mp}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 储物背包抽屉 */}
                {rpgData.inventory.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsBagOpen(!isBagOpen)}
                      className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-indigo-300 transition cursor-pointer"
                    >
                      <Package className="w-3 h-3 text-indigo-400" />
                      <span>储物袋 ({rpgData.inventory.length} 件物品)</span>
                      <span className="text-[10px] text-gray-500">{isBagOpen ? '点击收起' : '点击查看'}</span>
                    </button>

                    {isBagOpen && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 animate-in fade-in duration-200">
                        {rpgData.inventory.map((item, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded bg-gray-900/90 text-gray-200 text-[10px] border border-gray-700 font-mono"
                          >
                            📦 {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
