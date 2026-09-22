"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { 
  X, 
  Puzzle, 
  ShieldCheck, 
  Radio, 
  Eye, 
  Compass, 
  RotateCcw,
  Heart,
  Swords,
  BookOpen,
  Layers,
  BellRing
} from 'lucide-react';

export function ModCenterModal() {
  const { 
    isModCenterOpen, 
    setIsModCenterOpen, 
    enabledMods, 
    toggleMod, 
    setEnabledMods,
    currentDeckKey,
    currentDeck
  } = useAppStore();

  if (!isModCenterOpen) return null;

  const isApocalypse = currentDeckKey === 'deck_apocalypse_survival' || 
    currentDeckKey.includes('059217c9') || 
    Boolean(currentDeck?.title?.includes('末世'));

  const activeCount = Object.values(enabledMods).filter(Boolean).length;

  const handleResetDefaults = () => {
    setEnabledMods({
      apocalypseSurvival: true,
      antiCoercion: true,
      innerVoice: true,
      explorationBranches: true,
      affectionGauge: false,
      rpgAdventureHud: false,
      lorebookArbiter: true,
      phaseLock: true,
      sceneIncidents: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#11131a] border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="p-4 sm:p-5 border-b border-gray-800/80 bg-gradient-to-r from-orange-950/40 via-[#161823] to-[#11131a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Puzzle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-100">玩法模组中心 · MOD 管理器</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  已装载 {activeCount} 项
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                实时启闭游戏机制插件，随心切换硬核求生与无拘爽文体验
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModCenterOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 模组列表区 */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 no-scrollbar">
          {/* 模组 1：废土生存与开放探索 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.apocalypseSurvival
              ? 'bg-[#181a24] border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    废土生存与开放探索 MOD
                  </span>
                  {isApocalypse && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      当前剧本专属
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">
                    TRPG 生存数值 + GM 裁决
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  挂载废土现实物理法则（断水断电、沿街搜空、因果律防虚空造物）与实时 <strong className="text-orange-300">TACTICAL SURVIVAL HUD</strong>（生命、体力、水分、饱腹、手电、感染度及战术背包）。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-emerald-400">● 实时仪表盘</span>
                  <span className="text-orange-400">● 4项高危探索分支</span>
                  <span className="text-cyan-400">● 战术背包栏</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('apocalypseSurvival')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.apocalypseSurvival ? 'bg-orange-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.apocalypseSurvival ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 2：硬核底线与角色独立防御 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.antiCoercion
              ? 'bg-[#181a24] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    硬核底线与角色独立防御 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {enabledMods.antiCoercion ? '🛡️ 真实推拉模式' : '💖 绝对顺从模式'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  角色拥有自主意志与生存防卫本能。突发强迫或侵犯将触发强烈抗拒、呼救、逃跑或自卫反击（前文达成明确许可除外）。关闭后即可享受无拘顺从爽文模式。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-amber-400">● 心理防线判定</span>
                  <span className="text-emerald-400">● 知情同意豁免机制</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('antiCoercion')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.antiCoercion ? 'bg-amber-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.antiCoercion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 3：潜意识心声与心理动机透视 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.innerVoice
              ? 'bg-[#181a24] border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    潜意识心声与微表情透视 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    全剧本通用
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  穿透角色表面言辞与伪装姿态，在卡片中实时解析并呈现其内心独白、隐藏欲求与微观生理反馈（瞳孔、呼吸、微颤）。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-purple-400">● 思维链破甲</span>
                  <span className="text-pink-400">● 隐藏微动机解构</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('innerVoice')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.innerVoice ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.innerVoice ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 4：高危探索与战术变奏分支 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.explorationBranches
              ? 'bg-[#181a24] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    高危探索与战术变奏分支 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    互动博弈
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  每轮推演后，由 GM 根据当前局势与威胁梯度，生成 4 个高张力破局策略与行动选项，支持点击即发推进剧情。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-cyan-400">● 4选1 战术卡片</span>
                  <span className="text-emerald-400">● 动态变奏建议</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('explorationBranches')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.explorationBranches ? 'bg-cyan-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.explorationBranches ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 5：恋爱心防阶梯与情感羁绊锁 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.affectionGauge
              ? 'bg-[#181a24] border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    恋爱心防阶梯与情感羁绊锁 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    恋爱沉浸 · 防言出法随
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  严禁“一句话攻略/瞬间发情”！将玩家强推指令降级为尝试，植入 4 阶心防阈值（戒备/试探/动摇/沦陷），单轮心动严格限制在 ±3 点内，并在顶栏挂载实时心动值 HUD 仪表盘。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-pink-400">● 心动值进度条</span>
                  <span className="text-rose-400">● 亲密权限阶梯</span>
                  <span className="text-amber-400">● 防线崩溃推拉</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('affectionGauge')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.affectionGauge ? 'bg-pink-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.affectionGauge ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 6：TRPG 战力因果律与 RPG 属性 HUD MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.rpgAdventureHud
              ? 'bg-[#181a24] border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Swords className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    TRPG 战力因果律与成长状态机 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    修仙/冒险/RPG
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  拒绝无脑秒杀与虚空造神器！跨阶挑战强制判定灵压反噬；境界突破受丹药与瓶颈硬约束；打怪搜刮仅掉落阶位相称的战利品，并挂载生命/法力/储物袋实时 HUD。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-red-400">● 气血/法力双条</span>
                  <span className="text-indigo-400">● 境界瓶颈锁</span>
                  <span className="text-emerald-400">● 储物袋与掉落池</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('rpgAdventureHud')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.rpgAdventureHud ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.rpgAdventureHud ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 7：世界书绝对因果锚定 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.lorebookArbiter
              ? 'bg-[#181a24] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    世界书绝对因果锚定 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    核心物理常数
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  将当前剧本世界书（Lorebook）词条提升为不可推翻的宇宙真理。任何与世界书设定的境界、门派实力、地理产物相悖的玩家声明，AI 将以世界书法典为准当场证伪与现实惩戒。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-emerald-400">● 词条最高优先级</span>
                  <span className="text-cyan-400">● 严防虚构设定</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('lorebookArbiter')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.lorebookArbiter ? 'bg-emerald-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.lorebookArbiter ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 8：循序渐进·阶段推拉解锁 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.phaseLock
              ? 'bg-[#181a24] border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    循序渐进·阶段推拉解锁 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    密闭/酒店/都市攻略
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  强制严防无脑跳阶与剧情快进！角色遵循“玄关初验 ➔ 浴室换装 ➔ 契约推拉 ➔ 深层沦陷”严密递进树，实时渲染阶段完成度、核心推拉目标与下一阶段解锁条件。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-amber-400">● 4阶推拉进度条</span>
                  <span className="text-emerald-400">● 目标与解锁判定</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('phaseLock')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.phaseLock ? 'bg-amber-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.phaseLock ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 模组 9：微观密闭·环境道具与突发危机 MOD */}
          <div className={`p-4 rounded-xl border transition-all ${
            enabledMods.sceneIncidents
              ? 'bg-[#181a24] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'bg-[#13141b] border-gray-800 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-gray-100">
                    微观密闭·环境道具与突发危机 MOD
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    环境物理交互 + 突发张力
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  挂载场景微观物件（落地窗帘、大理石浴室、真丝睡袍、高脚红酒杯）一键交互道具盘；并在推拉关键节点随机触发门外查房、手机震动来电等窒息压迫事件。
                </p>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 font-mono">
                  <span className="text-cyan-400">● 5大物理道具交互盘</span>
                  <span className="text-red-400">● 突发环境事件触发</span>
                </div>
              </div>

              {/* 开关 */}
              <button
                type="button"
                onClick={() => toggleMod('sceneIncidents')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabledMods.sceneIncidents ? 'bg-cyan-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabledMods.sceneIncidents ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0e1017] flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-300 text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复默认推荐</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModCenterOpen(false)}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            完成并返回剧场
          </button>
        </div>
      </div>
    </div>
  );
}
