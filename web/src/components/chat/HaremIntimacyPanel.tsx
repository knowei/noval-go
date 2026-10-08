"use client";

import React, { useState } from 'react';
import { CharacterIntimacyRecord } from '@/lib/types';
import { 
  Heart, 
  Sparkles, 
  Flame, 
  Droplets, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronUp,
  Smile,
  Info
} from 'lucide-react';

interface HaremIntimacyPanelProps {
  records: CharacterIntimacyRecord[];
  deckTitle?: string;
}

export function HaremIntimacyPanel({ records, deckTitle }: HaremIntimacyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | string>('all');

  if (!records || records.length === 0) {
    return null;
  }

  // 计算全员互动累计数据
  const totalKiss = records.reduce((acc, r) => acc + (r.kissCount || 0), 0);
  const totalOral = records.reduce((acc, r) => acc + (r.oralCount || 0), 0);
  const totalSex = records.reduce((acc, r) => acc + (r.sexCount || 0), 0);
  const totalCreampie = records.reduce((acc, r) => acc + (r.creampieCount || 0), 0);
  const totalOrgasm = records.reduce((acc, r) => acc + (r.orgasmCount || 0), 0);

  const filteredRecords = activeTab === 'all' 
    ? records 
    : records.filter(r => r.characterName === activeTab);

  return (
    <div className="w-full bg-[#131422]/95 border border-pink-500/30 hover:border-pink-500/50 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md space-y-3 transition-all animate-in fade-in duration-300">
      {/* 顶部标题栏与全局战绩统计 */}
      <div className="flex items-center justify-between gap-2 border-b border-pink-500/20 pb-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-pink-300 text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
            <Heart className="w-4 h-4 text-pink-400 fill-pink-500/40" />
            <span>全员私密关系与身体交互记录</span>
            <span className="text-gray-500 font-normal">|</span>
            <span className="text-[11px] font-mono text-gray-300 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-500/30">
              共录入 {records.length} 位角色
            </span>
          </div>

          {/* 全局交互小胶囊 */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-gray-400 pl-2">
            <span className="px-1.5 py-0.5 rounded bg-pink-900/40 text-pink-200 border border-pink-500/30">
              💋 吻 {totalKiss}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-200 border border-purple-500/30">
              👅 口 {totalOral}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-900/40 text-rose-200 border border-rose-500/30">
              🔞 做 {totalSex}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-500/30">
              💦 满 {totalCreampie}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-200 border border-cyan-500/30">
              🌊 潮 {totalOrgasm}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] text-pink-300 hover:text-white px-2 py-0.5 rounded-lg bg-pink-950/50 hover:bg-pink-900/60 border border-pink-500/30 transition cursor-pointer"
          >
            <span>{isExpanded ? '收起记录' : '展开全员状态'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* 角色快速切换标签 (当角色数量 >= 3 时显示) */}
          {records.length >= 3 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer text-xs ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-[#181a28] text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                全员一览 ({records.length})
              </button>
              {records.map((r) => (
                <button
                  key={r.characterName}
                  type="button"
                  onClick={() => setActiveTab(r.characterName)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                    activeTab === r.characterName
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-[#181a28] text-gray-400 hover:text-pink-300 border border-gray-800'
                  }`}
                >
                  <span>{r.characterName}</span>
                  <span className="text-[10px] opacity-75 font-mono">{r.favor}%</span>
                </button>
              ))}
            </div>
          )}

          {/* 角色卡片矩阵网格 */}
          <div className={`grid gap-3 ${
            filteredRecords.length === 1 
              ? 'grid-cols-1' 
              : filteredRecords.length === 2 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'
          }`}>
            {filteredRecords.map((record) => {
              const hasIntimacy = (record.kissCount > 0 || record.oralCount > 0 || record.sexCount > 0 || record.creampieCount > 0 || record.orgasmCount > 0);
              const isVirgin = !record.firstTimeLost && record.sexCount === 0;

              return (
                <div 
                  key={record.characterName}
                  className="bg-[#171928]/95 hover:bg-[#1a1c2e] border border-pink-500/25 hover:border-pink-400/50 rounded-xl p-3 shadow-lg space-y-2.5 transition-all flex flex-col justify-between"
                >
                  {/* 头部：头像 + 姓名标签 + 关系状态 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      {/* 头像 */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-pink-400/60 shadow-[0_0_10px_rgba(244,114,182,0.3)] bg-gradient-to-tr from-pink-900 to-purple-900 flex items-center justify-center">
                          {record.avatar ? (
                            <img 
                              src={record.avatar} 
                              alt={record.characterName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-pink-200">
                              {record.characterName.slice(0, 1)}
                            </span>
                          )}
                        </div>
                        {/* 状态徽记点 */}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#171928] flex items-center justify-center text-[8px] ${
                          hasIntimacy ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                          {hasIntimacy ? '♥' : '●'}
                        </span>
                      </div>

                      {/* 姓名与角色定位 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-gray-100 text-xs sm:text-sm truncate">
                            {record.characterName}
                          </h4>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border shrink-0 ${
                            isVirgin 
                              ? 'bg-pink-950/60 text-pink-300 border-pink-500/40' 
                              : 'bg-rose-950/70 text-rose-200 border-rose-500/50'
                          }`}>
                            {isVirgin ? '🌸 完璧守身' : '💮 熟透破身'}
                          </span>
                        </div>
                        <div className="text-[10px] text-pink-300/80 truncate">
                          {record.tag || '重点角色'}
                        </div>
                      </div>
                    </div>

                    {/* 关系与防线阶段 */}
                    <div className="flex items-center justify-between gap-1 text-[11px] bg-[#121320] px-2 py-1 rounded-lg border border-pink-500/15">
                      <div className="flex items-center gap-1 text-pink-200 truncate">
                        <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
                        <span className="text-gray-400 text-[10px]">关系:</span>
                        <span className="font-semibold truncate">{record.relation}</span>
                      </div>
                      <div className="shrink-0 text-[10px] font-mono text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {record.defenseStage || '心防松动'}
                      </div>
                    </div>

                    {/* 好感度 / 沦陷进度条 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-400 fill-pink-500/30" />
                          <span>好感 / 沉沦度</span>
                        </span>
                        <span className="text-pink-300 font-bold">{record.favor}%</span>
                      </div>
                      <div className="w-full bg-[#10111a] rounded-full h-1.5 overflow-hidden border border-gray-800">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 transition-all duration-500 shadow-[0_0_8px_rgba(244,114,182,0.6)]"
                          style={{ width: `${Math.min(100, Math.max(5, record.favor))}%` }}
                        />
                      </div>
                    </div>

                    {/* 实时内心动态与心理活动 (Mood / reaction quote) */}
                    <div className="bg-[#10111b] p-2 rounded-lg border border-gray-800/80 text-[11px] text-gray-300 leading-relaxed relative">
                      <div className="text-[9px] text-pink-400/90 font-mono mb-0.5 flex items-center gap-1">
                        <Smile className="w-3 h-3 text-pink-400" />
                        <span>实时心境 / 心理活动</span>
                      </div>
                      <p className="italic text-gray-200 line-clamp-3">
                        “{record.mood || '毫无戒备地倚在旁边，目光时而悄悄落在你身上…'}”
                      </p>
                    </div>
                  </div>

                  {/* 身体与私密交互计数矩阵 (接吻/口交/做爱/中出/绝顶) */}
                  <div className="space-y-2 pt-1 border-t border-gray-800/70">
                    <div className="text-[10px] font-bold text-gray-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-pink-300">
                        <Flame className="w-3 h-3 text-pink-400" /> 私密交互频次
                      </span>
                      <span className="text-[9px] font-mono text-gray-500">
                        {hasIntimacy ? '已发生深层互动' : '尚未发生越界'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center font-mono">
                      {/* 接吻 */}
                      <div className="bg-[#121320] p-1 rounded-lg border border-pink-500/20">
                        <div className="text-[12px]">💋</div>
                        <div className="text-[9px] text-gray-400">接吻</div>
                        <div className="text-[11px] font-bold text-pink-300">{record.kissCount}</div>
                      </div>

                      {/* 口交 */}
                      <div className="bg-[#121320] p-1 rounded-lg border border-purple-500/20">
                        <div className="text-[12px]">👅</div>
                        <div className="text-[9px] text-gray-400">口交</div>
                        <div className="text-[11px] font-bold text-purple-300">{record.oralCount}</div>
                      </div>

                      {/* 做爱/合体 */}
                      <div className="bg-[#121320] p-1 rounded-lg border border-rose-500/20">
                        <div className="text-[12px]">🔞</div>
                        <div className="text-[9px] text-gray-400">合体</div>
                        <div className="text-[11px] font-bold text-rose-300">{record.sexCount}</div>
                      </div>

                      {/* 中出灌满 */}
                      <div className="bg-[#121320] p-1 rounded-lg border border-amber-500/20">
                        <div className="text-[12px]">💦</div>
                        <div className="text-[9px] text-gray-400">中出</div>
                        <div className="text-[11px] font-bold text-amber-300">{record.creampieCount}</div>
                      </div>

                      {/* 绝顶高潮 */}
                      <div className="bg-[#121320] p-1 rounded-lg border border-cyan-500/20">
                        <div className="text-[12px]">🌊</div>
                        <div className="text-[9px] text-gray-400">高潮</div>
                        <div className="text-[11px] font-bold text-cyan-300">{record.orgasmCount}</div>
                      </div>
                    </div>

                    {/* 敏感弱点标签 */}
                    {record.sensitivePoints && record.sensitivePoints.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <span className="text-[9px] text-gray-400 shrink-0">敏感带:</span>
                        {record.sensitivePoints.map((point, pIdx) => (
                          <span 
                            key={pIdx}
                            className="px-1.5 py-0.2 rounded text-[9px] bg-pink-950/40 text-pink-300 border border-pink-500/20 font-medium"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
