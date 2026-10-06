"use client";

import React, { useState } from 'react';
import { CharacterStatusSnapshot } from '@/lib/characterStatusParser';
import { ChevronDown, ChevronUp, Activity, Sparkles, ZoomIn, Shirt } from 'lucide-react';
import { resolveCgUrl } from '@/lib/cgManager';
import { CgImageViewerModal } from './CgImageViewerModal';

interface TurnStatusCardProps {
  status: CharacterStatusSnapshot;
  deckId?: string;
}

export function TurnStatusCard({ status, deckId }: TurnStatusCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCgModal, setActiveCgModal] = useState<{ url: string; title: string; subtitle?: string; code?: string } | null>(null);

  if (!status || (!status.stats?.length && !status.customTags?.length && !status.mood && !status.moneyInfo)) {
    return null;
  }

  const costumeUrl = status.moneyInfo?.costumeUrl || (status.moneyInfo?.costume ? resolveCgUrl(status.moneyInfo.costume, deckId) : null);
  const costumeCode = status.moneyInfo?.costumeCode || (status.moneyInfo?.costume?.match(/img-[A-Za-z0-9_-]+/i)?.[0]);

  return (
    <>
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
            {costumeUrl && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <span>👗</span> 立绘已命中
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
            {/* 经济与资产罗盘 (债务/现金/装扮/日程) */}
            {status.moneyInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0c0d14]/90 p-2.5 rounded-xl border border-amber-500/25 shadow-inner">
                {status.moneyInfo.debt && (
                  <div className="flex flex-col gap-0.5 bg-[#141622]/90 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <span>💰</span> 剩余债务
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-amber-200 truncate">
                      {status.moneyInfo.debt}
                    </span>
                  </div>
                )}
                {status.moneyInfo.cash && (
                  <div className="flex flex-col gap-0.5 bg-[#141622]/90 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>💵</span> 手头现金
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-emerald-200 truncate">
                      {status.moneyInfo.cash}
                    </span>
                  </div>
                )}
                {status.moneyInfo.costume && (
                  <div 
                    onClick={() => {
                      if (costumeUrl) {
                        setActiveCgModal({
                          url: costumeUrl,
                          title: `${status.characterName} · 全身立绘鉴赏`,
                          subtitle: `当前着装：${status.moneyInfo?.costume || '日常装扮'} (阶段: ${status.stageName || '互动'})`,
                          code: costumeCode
                        });
                      }
                    }}
                    className={`flex items-center gap-2 bg-[#141622]/90 p-2 rounded-lg border border-purple-500/20 group ${costumeUrl ? 'cursor-pointer hover:border-pink-500/50 hover:bg-[#1b192e] transition' : ''}`}
                    title={costumeUrl ? '点击查看高清立绘大图' : status.moneyInfo.costume}
                  >
                    {costumeUrl ? (
                      <div className="relative w-8 h-10 rounded overflow-hidden shrink-0 border border-pink-400/40 shadow-sm bg-black/50 group-hover:scale-105 transition-transform">
                        <img
                          src={costumeUrl}
                          alt="立绘"
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-0.5">
                          <ZoomIn className="w-2.5 h-2.5 text-pink-300 opacity-80 group-hover:opacity-100" />
                        </div>
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-[10px] text-purple-400 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>👗</span> 当前立绘装扮
                        </span>
                        {costumeUrl && (
                          <span className="text-[9px] text-pink-400 font-normal underline decoration-pink-500/50">看立绘</span>
                        )}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-purple-200 truncate" title={status.moneyInfo.costume}>
                        {status.moneyInfo.costume}
                      </span>
                    </div>
                  </div>
                )}
                {status.moneyInfo.day && (
                  <div className="flex flex-col gap-0.5 bg-[#141622]/90 p-2 rounded-lg border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                      <span>📅</span> 还债日程
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-medium text-cyan-200 truncate">
                      {status.moneyInfo.day}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 角色当前立绘与身形展台 (命中立绘时的专属 Galgame 展台) */}
            {costumeUrl && (
              <div 
                onClick={() => setActiveCgModal({
                  url: costumeUrl,
                  title: `${status.characterName} · 全身立绘鉴赏`,
                  subtitle: `当前穿着：${status.moneyInfo?.costume} | 心境阶段：${status.stageName || '相依为命'}`,
                  code: costumeCode
                })}
                className="relative rounded-xl p-2.5 bg-gradient-to-r from-[#19152b] via-[#141221] to-[#1c142b] border border-pink-500/35 flex items-center gap-3 shadow-md hover:border-pink-500/60 transition cursor-pointer group overflow-hidden"
              >
                {/* 背景光晕装饰 */}
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/25 transition" />

                {/* 立绘缩略图 */}
                <div className="relative w-14 sm:w-16 h-20 sm:h-22 rounded-lg overflow-hidden shrink-0 border border-pink-400/50 shadow-md bg-black/60 group-hover:scale-105 transition-transform">
                  <img
                    src={costumeUrl}
                    alt={status.characterName}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-center pb-1">
                    <span className="text-[9px] text-pink-300 font-mono flex items-center gap-0.5">
                      <ZoomIn className="w-2.5 h-2.5" /> 大图
                    </span>
                  </div>
                </div>

                {/* 角色立绘信息 */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-pink-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>{status.characterName} · 当前立绘演出</span>
                    </span>
                    {costumeCode && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {costumeCode}
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30 font-medium">
                      立绘已命中
                    </span>
                  </div>
                  <div className="text-xs text-gray-200 font-medium truncate">
                    {status.moneyInfo?.costume || '日常装扮'}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>点击查看 2:3 高清全身立绘与表情细节</span>
                    <span className="text-pink-400 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            )}

            {/* 情境与局势标签 (当前时间、主角状态、室友位置等) */}
            {status.customTags && status.customTags.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#0c0d14]/90 p-2.5 rounded-xl border border-purple-500/20 shadow-inner">
                {status.customTags.map((tag, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col gap-0.5 bg-[#141622]/90 p-2 rounded-lg border border-purple-500/15"
                  >
                    <span className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                      <span>{tag.icon || '📌'}</span> {tag.label}
                    </span>
                    <span className="text-xs text-gray-200 leading-snug break-words">
                      {tag.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 数值进度条列表 */}
            {status.stats && status.stats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {status.stats.map((st, idx) => {
              const pct = Math.min(100, Math.max(0, Math.round((st.value / st.max) * 100)));
              const isPositive = st.delta && st.delta.includes('+');
              const isNegative = st.delta && st.delta.includes('-');
              const isGoodMetric = st.name.includes('干预') || st.name.includes('好感') || st.name.includes('心动') || st.name.includes('守护') || st.name.includes('生命') || st.name.includes('气血') || st.name.includes('法力') || st.name.includes('真元') || st.name.includes('清偿') || st.name.includes('现金') || st.name.includes('收入') || st.name.includes('存款');
              const isFavorable = isGoodMetric ? isPositive : isNegative;

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
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isFavorable
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isPositive || isNegative
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
          )}

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

    {/* 高清立绘鉴赏大图模态框 */}
    {activeCgModal && (
      <CgImageViewerModal
        isOpen={Boolean(activeCgModal)}
        onClose={() => setActiveCgModal(null)}
        imageUrl={activeCgModal.url}
        title={activeCgModal.title}
        subtitle={activeCgModal.subtitle}
        code={activeCgModal.code}
      />
    )}
  </>
  );
}
