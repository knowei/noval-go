"use client";

import React, { useState, useMemo } from 'react';
import { Turn, EnabledMods, ScenePhaseData } from '@/lib/types';
import { 
  Heart, 
  ShieldCheck, 
  Swords, 
  Zap, 
  Package, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Layers,
  BellRing,
  Wine,
  Shirt,
  Blinds,
  AlertTriangle
} from 'lucide-react';

interface FloatingStatusHudProps {
  turns: Turn[];
  enabledMods: EnabledMods;
  deckId?: string;
  deckTitle?: string;
  onTriggerAction?: (actionText: string) => void;
}

export function FloatingStatusHud({ 
  turns, 
  enabledMods, 
  deckId = '', 
  deckTitle = '',
  onTriggerAction 
}: FloatingStatusHudProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isPropPanelOpen, setIsPropPanelOpen] = useState(true);

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

    let phaseData: ScenePhaseData | null = null;

    // 从后往前找最新包含状态标签的 AI 轮次
    for (let i = turns.length - 1; i >= 0; i--) {
      const turn = turns[i];
      if (turn.isUser) continue;
      const text = turn.story || turn.text || '';

      // 1. 尝试解析 <scene_phase>
      if (!phaseData && enabledMods.phaseLock) {
        const phaseMatch = text.match(/<scene_phase>([\s\S]*?)<\/scene_phase>/i);
        if (phaseMatch) {
          const content = phaseMatch[1];
          const nameMatch = content.match(/\[(?:当前阶段|阶段)\]:\s*([^|(]+)(?:\((?:进度:)?\s*(\d+)(?:\/100)?%?\))?/i);
          const taskMatch = content.match(/\[(?:核心任务|任务|目标)\]:\s*([^|]+)/i);
          const unlockMatch = content.match(/\[(?:解锁判定|解锁条件|解锁)\]:\s*([^|]+)/i);

          const rawProgress = nameMatch && nameMatch[2] ? parseInt(nameMatch[2], 10) : 25;

          phaseData = {
            phaseName: nameMatch ? nameMatch[1].trim() : '阶段1·玄关初验与防备破冰',
            progress: Math.min(100, Math.max(5, rawProgress)),
            task: taskMatch ? taskMatch[1].trim() : '核实身份背景，消除雨水寒意与戒备局促感',
            unlockCondition: unlockMatch ? unlockMatch[1].trim() : '达成初步信任或指令其去浴室换装'
          };
        }
      }

      // 2. 尝试解析 <love_status>
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

      // 3. 尝试解析 <rpg_status>
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

      if (phaseData && loveData && rpgData) break;
    }

    // 针对密闭/酒店剧本，若开启了 phaseLock 但模型前几轮尚未输出标签，提供默认保底阶段
    const isAtourOrHotel = deckId === 'deck_atour_app' || deckId.includes('1ad4e5fd') || deckTitle.includes('亚朵') || deckTitle.includes('酒店');
    if (!phaseData && enabledMods.phaseLock && isAtourOrHotel && turns.length > 0) {
      const turnCount = turns.length;
      if (turnCount <= 3) {
        phaseData = {
          phaseName: '阶段1·玄关初验与防备破冰',
          progress: Math.min(65, turnCount * 22),
          task: '确认女大身份与包养意向，化解门外的雨水寒意与初次见面的怯弱防备',
          unlockCondition: '核验完毕或指令其进入套房浴室换装'
        };
      } else if (turnCount <= 7) {
        phaseData = {
          phaseName: '阶段2·更衣洗漱与伪装剥离',
          progress: Math.min(85, 30 + (turnCount - 3) * 15),
          task: '引导其洗去日常防备，换上备用轻薄真丝睡袍，完成心理与物理的双重蜕变',
          unlockCondition: '出浴入座，准备展开红酒谈判或契约约定'
        };
      } else {
        phaseData = {
          phaseName: '阶段3·微醺交涉与契约攻心',
          progress: Math.min(95, 60 + (turnCount - 7) * 8),
          task: '落地窗前品酒拉扯，直面羞耻底线，逐步拆解内心最深层的自尊锁链',
          unlockCondition: '达成完全包养契约，身心全面配合'
        };
      }
    }

    return { loveData, rpgData, phaseData };
  }, [turns, enabledMods.affectionGauge, enabledMods.rpgAdventureHud, enabledMods.phaseLock, deckId, deckTitle]);

  const { loveData, rpgData, phaseData } = hudData;
  const showProps = Boolean(enabledMods.sceneIncidents);

  // 如果所有状态都没开启且不显示道具盘，不渲染
  if (!loveData && !rpgData && !phaseData && !showProps) {
    return null;
  }

  // 针对酒店/密闭场景高频道具交互库
  const quickProps = [
    {
      icon: <Shirt className="w-3.5 h-3.5 text-pink-400" />,
      label: '递过真丝睡袍去浴室',
      prompt: '我从衣柜取出一套备好的轻薄真丝睡袍递到她面前，语气不容置疑：“先去大理石浴室把身上的雨水和湿气洗干净，换上这个再出来跟我谈。”',
      color: 'hover:border-pink-500/50 hover:bg-pink-950/30 text-pink-200'
    },
    {
      icon: <Wine className="w-3.5 h-3.5 text-rose-400" />,
      label: '倒两杯罗曼尼红酒',
      prompt: '我走到吧台倒了两杯微甜的进口红酒，将其中一杯轻轻推到她手边：“喝一口暖暖身子，既然来了这间房间，就别这么拘束。”',
      color: 'hover:border-rose-500/50 hover:bg-rose-950/30 text-rose-200'
    },
    {
      icon: <Blinds className="w-3.5 h-3.5 text-amber-400" />,
      label: '拉上全遮光落地窗帘',
      prompt: '我按下床头旁的电动控制键，将俯瞰整座城市的巨大全景落地窗帘缓缓闭合，将外面的雷雨和窥探彻底隔绝，房间内只剩下暧昧昏黄的壁灯。',
      color: 'hover:border-amber-500/50 hover:bg-amber-950/30 text-amber-200'
    },
    {
      icon: <BellRing className="w-3.5 h-3.5 text-cyan-400" />,
      label: '按铃呼叫客房服务',
      prompt: '我随手按下客房服务按键：“让服务生送一份切好的新鲜水果拼盘和冰桶上来。”门外隐约传来的动静让房间内的气氛骤然微紧。',
      color: 'hover:border-cyan-500/50 hover:bg-cyan-950/30 text-cyan-200'
    },
    {
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
      label: '触发突发危机：门外查房/来电',
      prompt: '【突发环境危机干预】：就在此时，门外走廊突然传来了几声沉重的脚步声与门把拧动尝试，紧接着她的手提包里手机剧烈震动了起来！',
      color: 'hover:border-red-500/50 hover:bg-red-950/30 text-red-200'
    }
  ];

  return (
    <div className="w-full mb-3 px-1 sm:px-2 select-none animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-[#11131a]/95 backdrop-blur-md border border-gray-800/80 hover:border-gray-700/80 rounded-xl p-2.5 sm:p-3 shadow-2xl transition-all">
        {/* HUD 顶栏标签与折叠切换 */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-800/50 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-300 font-mono tracking-wider">
              <Activity className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>LIVE HUD // 沉浸式场景控制台</span>
            </div>
            {phaseData && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>阶段推进锁</span>
              </span>
            )}
            {showProps && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <BellRing className="w-3 h-3 text-cyan-400" />
                <span>环境道具盘</span>
              </span>
            )}
            {loveData && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                <span>心防羁绊</span>
              </span>
            )}
            {rpgData && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Swords className="w-3 h-3 text-indigo-400" />
                <span>RPG 战力</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 px-2 py-0.5 rounded bg-gray-900/60 border border-gray-800 hover:bg-gray-800 transition cursor-pointer"
          >
            <span>{isCollapsed ? '展开控制台' : '收起面板'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* HUD 主体面板 */}
        {!isCollapsed && (
          <div className="pt-2.5 space-y-2.5">
            {/* 1. 剧情阶段推进锁定条 (Phase Lock) */}
            {phaseData && (
              <div className="bg-[#171822]/90 rounded-lg p-2.5 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-200">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>{phaseData.phaseName}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    阶段完成度: {phaseData.progress}%
                  </span>
                </div>

                {/* 进度条 */}
                <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    style={{ width: `${phaseData.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-0.5">
                  <div className="text-gray-300 flex items-start gap-1">
                    <span className="text-amber-400 shrink-0">🎯 核心目标:</span>
                    <span className="text-gray-300 font-serif leading-tight">{phaseData.task}</span>
                  </div>
                  {phaseData.unlockCondition && (
                    <div className="text-gray-400 flex items-start gap-1">
                      <span className="text-emerald-400 shrink-0">🔓 解锁判定:</span>
                      <span className="text-gray-300 font-serif leading-tight">{phaseData.unlockCondition}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. 微观密闭·环境交互道具盘 (Room Action Deck) */}
            {showProps && onTriggerAction && (
              <div className="bg-[#141620]/90 rounded-lg p-2.5 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-200">
                    <BellRing className="w-3.5 h-3.5 text-cyan-400" />
                    <span>环境交互道具盘 · 一键施展物理互动</span>
                  </div>
                  <span className="text-[10px] text-gray-400">点击立即融入行动</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                  {quickProps.map((prop, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => onTriggerAction(prop.prompt)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#0e1017] border border-gray-800 text-[11px] font-medium transition cursor-pointer text-left ${prop.color} active:scale-95`}
                      title={prop.prompt}
                    >
                      {prop.icon}
                      <span className="truncate">{prop.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 恋爱心防羁绊条 */}
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

            {/* 4. RPG 战力属性条 */}
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
