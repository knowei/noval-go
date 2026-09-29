"use client";

import React, { useState } from 'react';
import { CharacterStatusSnapshot } from '@/lib/characterStatusParser';
import { ChevronDown, ChevronUp, Activity, Sparkles } from 'lucide-react';

interface TurnStatusCardProps {
  status: CharacterStatusSnapshot;
}

export function TurnStatusCard({ status }: TurnStatusCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!status || !status.stats || status.stats.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-3 rounded-xl bg-[#13141f]/90 border border-purple-500/20 hover:border-purple-500/35 transition-all shadow-md overflow-hidden text-gray-200 select-text">
      {/* 顶部标题栏 */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 flex items-center justify-between bg-[#181926]/80 cursor-pointer select-none border-b border-gray-800/60 hover:bg-[#1e2030]/80 transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5 font-sans">
            <span>📊 本幕状态演变与心理波动</span>
            <span className="text-gray-400 font-normal">·</span>
            <span className="text-pink-300 font-semibold">{status.characterName}</span>
          </span>
          {status.stageName && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {status.stageName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 transition">
          <span>{isOpen ? '收起' : '查看详情'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* 展开内容 */}
      {isOpen && (
        <div className="p-3 sm:p-3.5 space-y-3 animate-in fade-in duration-150">
          {/* 数值进度条列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {status.stats.map((st, idx) => {
              const pct = Math.min(100, Math.max(0, Math.round((st.value / st.max) * 100)));
              const isPositive = st.delta && st.delta.includes('+');
              const isNegative = st.delta && st.delta.includes('-');

              return (
                <div 
                  key={idx} 
                  className="bg-[#0e0f17]/80 rounded-lg p-2.5 border border-gray-800/80 flex flex-col justify-between gap-1.5 shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-gray-200">
                      <span>{st.icon}</span>
                      <span>{st.name}</span>
                    </span>

                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-gray-100">{st.value}</span>
                      <span className="text-gray-500 text-[10px]">/{st.max}</span>
                      {st.delta && (
                        <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                          isPositive
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isNegative
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-300'
                        }`}>
                          {st.delta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="w-full bg-[#1b1c28] rounded-full h-1.5 overflow-hidden border border-gray-800/50">
                    <div 
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ 
                        width: `${pct}%`,
                        background: st.barColor 
                      }}
                    />
                  </div>

                  {st.stageDesc && (
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-sans pt-0.5">
                      <span>当前定位</span>
                      <span className="text-gray-300 font-medium">【{st.stageDesc}】</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 心境微澜独白 */}
          {status.mood && (
            <div className="flex items-start gap-2 bg-[#171926]/90 border border-pink-500/20 rounded-lg p-2.5 text-xs text-pink-200/90 leading-relaxed font-serif">
              <span className="text-pink-400 shrink-0 select-none text-sm">💭</span>
              <div className="space-y-0.5">
                <span className="text-[10px] text-pink-400/80 font-sans block font-bold">心境微澜与微表情：</span>
                <span className="italic">{status.mood}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
