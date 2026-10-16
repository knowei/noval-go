"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { rechargePointsApi } from '@/lib/api';
import {
  X,
  Coins,
  Zap,
  Check,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Loader2,
  Gift,
  HelpCircle
} from 'lucide-react';

interface RechargePackage {
  id: string;
  amount: number;
  points: number;
  bonusPoints: number;
  tag?: string;
  desc: string;
  popular?: boolean;
}

const PACKAGES: RechargePackage[] = [
  {
    id: 'pkg_6',
    amount: 6,
    points: 6000,
    bonusPoints: 0,
    tag: '尝鲜体验',
    desc: '约可支持 40~60 幕长文推演'
  },
  {
    id: 'pkg_30',
    amount: 30,
    points: 30000,
    bonusPoints: 5000,
    tag: '🔥 热门畅享',
    desc: '超值赠送 5,000 点，畅推 200+ 幕',
    popular: true
  },
  {
    id: 'pkg_68',
    amount: 68,
    points: 68000,
    bonusPoints: 20000,
    tag: '⭐ 性价比之王',
    desc: '狂送 20,000 点！长篇推演首选'
  },
  {
    id: 'pkg_128',
    amount: 128,
    points: 128000,
    bonusPoints: 60000,
    tag: '👑 创世尊享',
    desc: '狂送 60,000 点！海量世界书无拘束'
  }
];

export function RechargeModal() {
  const { isRechargeOpen, setIsRechargeOpen, currentUserId, currentUser, updateUserPoints } = useAppStore();
  const [selectedPkg, setSelectedPkg] = useState<RechargePackage>(PACKAGES[1]);
  const [payChannel, setPayChannel] = useState<'wechat' | 'alipay' | 'quick'>('wechat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ amount: number; points: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isRechargeOpen) return null;

  const currentPoints = currentUser?.points ?? 9999;
  const totalPointsToGet = selectedPkg.points + selectedPkg.bonusPoints;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessInfo(null);

    // 模拟真实支付通道交互延迟 (0.8s)
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const res = await rechargePointsApi(
        currentUserId,
        selectedPkg.amount,
        totalPointsToGet,
        payChannel
      );

      if (res.success && typeof res.points === 'number') {
        updateUserPoints(res.points);
        setSuccessInfo({
          amount: selectedPkg.amount,
          points: totalPointsToGet
        });
      } else {
        setErrorMsg(res.error || '充值处理异常，请重试');
      }
    } catch (e: any) {
      setErrorMsg(e.message || '网络连接异常');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => !isProcessing && setIsRechargeOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[var(--app-card-bg,#141622)] border border-[var(--app-card-border,#2a2e40)] shadow-2xl overflow-hidden flex flex-col text-[var(--app-text-main,#f1f5f9)] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative p-5 sm:p-6 border-b border-[var(--app-card-border,#252836)] bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                <span>执笔人能量充值中心</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  模拟支付·免真钱
                </span>
              </h3>
              <p className="text-xs text-[var(--app-text-muted,#94a3b8)]">
                当前账户剩余：<strong className="text-amber-400 font-mono">{currentPoints.toLocaleString()}</strong> 积分
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRechargeOpen(false)}
            className="p-1.5 rounded-xl text-[var(--app-text-muted,#94a3b8)] hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Success Banner */}
          {successInfo && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 space-y-1.5 animate-in zoom-in-95 duration-200 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>支付成功！已存入 +{successInfo.points.toLocaleString()} 积分</span>
              </div>
              <p className="text-xs opacity-90">
                新账户余额为 <strong>{currentUser?.points?.toLocaleString()}</strong> 积分。您可以立即前往沉浸剧场尽情推演！
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs">
              ❌ {errorMsg}
            </div>
          )}

          {/* Package Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--app-text-muted,#94a3b8)] flex items-center justify-between">
              <span>选择充值档位</span>
              <span className="text-[11px] text-amber-400">1 元 ≈ 1,000 积分（约 100 万 Token）</span>
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPkg.id === pkg.id;
                const totalPts = pkg.points + pkg.bonusPoints;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => {
                      setSelectedPkg(pkg);
                      setSuccessInfo(null);
                    }}
                    className={`relative p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] text-[var(--app-text-muted,#94a3b8)] hover:border-amber-500/40 hover:text-white'
                    }`}
                  >
                    {pkg.tag && (
                      <span
                        className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                          pkg.popular
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {pkg.tag}
                      </span>
                    )}

                    <div>
                      <div className="text-xs text-[var(--app-text-muted,#94a3b8)] font-medium">
                        ￥<span className="text-lg font-bold text-[var(--app-text-main,#f1f5f9)] font-mono">{pkg.amount}</span>
                      </div>
                      <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                        {totalPts.toLocaleString()} <span className="text-[10px] font-normal text-amber-300">积分</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[var(--app-text-dim,#64748b)] leading-snug line-clamp-1">
                      {pkg.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--app-text-muted,#94a3b8)]">
              支付通道（模拟测试，无需真实扣款）
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPayChannel('wechat')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  payChannel === 'wechat'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] text-[var(--app-text-muted,#94a3b8)]'
                }`}
              >
                <span>💚</span>
                <span>微信支付</span>
              </button>

              <button
                type="button"
                onClick={() => setPayChannel('alipay')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  payChannel === 'alipay'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-400 font-bold'
                    : 'bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] text-[var(--app-text-muted,#94a3b8)]'
                }`}
              >
                <span>💙</span>
                <span>支付宝</span>
              </button>

              <button
                type="button"
                onClick={() => setPayChannel('quick')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  payChannel === 'quick'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-400 font-bold'
                    : 'bg-[var(--app-card-bg-subtle,#181a26)] border-[var(--app-card-border,#282a3c)] text-[var(--app-text-muted,#94a3b8)]'
                }`}
              >
                <span>⚡</span>
                <span>快速通道</span>
              </button>
            </div>
          </div>

          {/* Model Free Note */}
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#282a3c)] text-[11px] text-[var(--app-text-muted,#94a3b8)] space-y-1">
            <div className="flex items-center gap-1 text-sky-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>使用规则与自定义模型免充说明：</span>
            </div>
            <p className="leading-relaxed">
              • <strong>官方通道</strong>：消耗账户积分（1,000 Token = 1 积分，命中缓存享 80% 折扣）。<br />
              • <strong>自定义模型</strong>：在设置填入您个人的 API Key 即可<strong>完全免费、不消耗任何积分</strong>！
            </p>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="p-4 sm:p-5 border-t border-[var(--app-card-border,#252836)] bg-[var(--app-card-bg-subtle,#10111a)] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-[var(--app-text-muted,#94a3b8)]">应付金额：</span>
            <span className="text-xl font-bold text-amber-400 font-mono ml-1">￥{selectedPkg.amount}</span>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>安全支付处理中...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>立即模拟充值 +{totalPointsToGet.toLocaleString()} 点</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
