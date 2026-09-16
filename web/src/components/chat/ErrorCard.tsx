"use client";

import React from 'react';
import { AlertTriangle, RotateCcw, Settings, Trash2, Clock } from 'lucide-react';
import { Turn } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface ErrorCardProps {
  turn: Turn;
  index: number;
  onRegenerate?: (index: number) => void;
  onOpenSettings?: () => void;
  onDelete?: (index: number) => void;
}

export const ErrorCard = React.memo(function ErrorCard({
  turn,
  index,
  onRegenerate,
  onOpenSettings,
  onDelete,
}: ErrorCardProps) {
  const { modelSettings } = useAppStore();
  const displayModel = turn.model || modelSettings.model || 'AI 模型';
  const errorMessage = turn.error || '推演请求未能在规定时间内完成或服务响应异常。';
  const isTimeout = errorMessage.includes('超时') || errorMessage.includes('timeout') || errorMessage.includes('120s');

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#181114] border border-red-500/30 shadow-xl space-y-3.5 text-gray-200 select-text animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2.5 text-xs text-red-400 font-medium">
        <div className="flex items-center gap-2">
          {isTimeout ? (
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="font-bold text-red-300">
            {isTimeout ? '推演响应超时' : '推演请求未成功'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-[10px] text-red-300 font-mono">
            {displayModel}
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono">第 {index + 1} 幕</span>
      </div>

      {/* Error Message Box */}
      <div className="p-3.5 rounded-xl bg-[#231418] border border-red-500/25 space-y-2">
        <p className="text-xs sm:text-sm text-red-200/90 leading-relaxed font-mono break-all">
          {errorMessage}
        </p>

        <p className="text-[11px] text-gray-400 leading-normal border-t border-red-500/15 pt-2">
          {isTimeout
            ? '💡 提示：大模型长文本处理或深度思考耗时较长（已等待 120 秒）。若使用的是本地反代或第三方聚合服务，请检查服务负载状态并点击重试。'
            : '💡 提示：系统已严格关闭虚假模拟回复。如果接口配置有误或网络受阻，请检查 API Key、Base URL 或本地模型反代状态。'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1 text-xs select-none flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {onRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate(index)}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-medium text-xs shadow-xs"
              title="重新向模型发送当前剧情上下文进行推演"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>重新生成本幕</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-lg bg-[#252838] hover:bg-[#2e3248] border border-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
              title="配置 API Key、Base URL 及模型名称"
            >
              <Settings className="w-3.5 h-3.5 text-sky-400" />
              <span>检查模型设置</span>
            </button>
          )}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            title="删除此报错记录"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
