"use client";

import React, { useState, useRef, useEffect } from "react";
import { CompletionUsage } from "@/lib/types";
import { Zap, Coins, Sparkles, CheckCircle2, ShieldCheck, ChevronRight, Info } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface TokenUsageBadgeProps {
  usage?: CompletionUsage;
  model?: string;
}

export function TokenUsageBadge({ usage, model }: TokenUsageBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { setIsRechargeOpen, currentUser } = useAppStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!usage || (!usage.totalTokens && !usage.promptTokens && !usage.completionTokens)) {
    return null;
  }

  const promptTokens = usage.promptTokens ?? 0;
  const completionTokens = usage.completionTokens ?? 0;
  const totalTokens = usage.totalTokens ?? (promptTokens + completionTokens);
  const cacheHitTokens = usage.cacheHitTokens ?? 0;
  const cacheMissTokens = usage.cacheMissTokens ?? Math.max(0, promptTokens - cacheHitTokens);
  const reasoningTokens = usage.reasoningTokens;
  const isCustom = Boolean(usage.isCustomModel);
  const costPoints = isCustom ? 0 : (usage.costPoints ?? 1);

  // Cache hit percentage
  const cacheHitRate = promptTokens > 0 ? Math.round((cacheHitTokens / promptTokens) * 100) : 0;

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1.5 border transition cursor-pointer shadow-xs select-none ${
          isCustom
            ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-400"
            : cacheHitTokens > 0
            ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:border-indigo-400"
            : "bg-[#181a24] border-gray-700/60 text-amber-300/90 hover:border-amber-500/50"
        }`}
        title="查看本次对话 Token 消耗与缓存命中明细"
      >
        <Zap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
        <span>{totalTokens.toLocaleString()} Token</span>
        {cacheHitTokens > 0 && (
          <span className="hidden sm:inline-flex items-center gap-0.5 text-sky-300 font-semibold">
            <span>· 命中</span>
            <span>{cacheHitTokens.toLocaleString()}</span>
          </span>
        )}
        <span className="text-gray-500">|</span>
        {isCustom ? (
          <span className="text-emerald-400 font-semibold">免扣</span>
        ) : (
          <span className="text-amber-400 font-semibold flex items-center gap-0.5">
            <Coins className="w-2.5 h-2.5 text-amber-400" />
            <span>-{costPoints}点</span>
          </span>
        )}
      </button>

      {/* Floating Detailed Breakdown Popover */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-[var(--app-card-bg,#141622)] border border-[var(--app-card-border,#2e3246)] shadow-2xl z-50 text-xs text-[var(--app-text-main,#f1f5f9)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--app-card-border,#282a3c)]">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Token 消耗与缓存命中明细</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--app-text-muted,#94a3b8)]">
              {model || "大模型"}
            </span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {/* Input Context */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--app-text-muted,#94a3b8)]">输入上下文 (Prompt)：</span>
              <span className="font-semibold">{promptTokens.toLocaleString()} Token</span>
            </div>

            {/* Cache Hit */}
            <div className="flex items-center justify-between bg-sky-950/20 px-2 py-1 rounded-lg border border-sky-500/20 text-sky-300">
              <span className="flex items-center gap-1">
                <span>🎯 缓存命中 (Cache Hit)：</span>
              </span>
              <span className="font-bold">
                {cacheHitTokens.toLocaleString()} Token
                {cacheHitRate > 0 && ` (${cacheHitRate}%)`}
              </span>
            </div>

            {/* Cache Miss */}
            <div className="flex items-center justify-between pl-2 text-[10px] text-[var(--app-text-muted,#94a3b8)]">
              <span>缓存未命中 (Miss)：</span>
              <span>{cacheMissTokens.toLocaleString()} Token</span>
            </div>

            {/* Output Generation */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--app-text-muted,#94a3b8)]">角色回复输出 (Output)：</span>
              <span className="font-semibold text-pink-300">{completionTokens.toLocaleString()} Token</span>
            </div>

            {/* Reasoning if any */}
            {reasoningTokens !== undefined && reasoningTokens > 0 && (
              <div className="flex items-center justify-between text-[10px] text-purple-300 pl-2">
                <span>思维链深度思考 (Thinking)：</span>
                <span>{reasoningTokens.toLocaleString()} Token</span>
              </div>
            )}

            {/* Total */}
            <div className="pt-2 border-t border-[var(--app-card-border,#282a3c)] flex items-center justify-between font-bold text-xs">
              <span>总计实际消耗：</span>
              <span className="text-amber-400">{totalTokens.toLocaleString()} Token</span>
            </div>

            {/* Billing Mode Status */}
            <div className="mt-2.5 pt-2 border-t border-[var(--app-card-border,#282a3c)] text-xs">
              {isCustom ? (
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>自定义 API Key 通道</span>
                  </div>
                  <p className="text-[10px] opacity-90 leading-tight">
                    当前使用您个人配置的 API Key，已为您免除全额平台积分扣除！
                  </p>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>官方高速推荐通道</span>
                    </div>
                    <span className="font-bold text-sm">扣除 {costPoints} 积分</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-80">
                    <span>当前账户剩余：{(currentUser?.points ?? 9999).toLocaleString()} 积分</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsRechargeOpen(true);
                      }}
                      className="text-amber-400 underline font-semibold hover:text-amber-300 cursor-pointer"
                    >
                      去充值 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
