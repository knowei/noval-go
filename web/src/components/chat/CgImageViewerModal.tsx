"use client";

import React, { useEffect } from 'react';
import { X, ZoomIn, Download, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CgImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
  code?: string;
}

export function CgImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title = '角色立绘鉴赏',
  subtitle,
  code
}: CgImageViewerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center rounded-2xl bg-[#12131d]/95 border border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-800/80 bg-[#171926]/90 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            <span className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>{title}</span>
            </span>
            {code && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition"
              title="查看原图 / 下载"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-rose-900/60 text-gray-400 hover:text-rose-200 transition cursor-pointer"
              title="关闭 (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 图像展示区 */}
        <div className="relative flex-1 w-full flex items-center justify-center p-3 sm:p-5 overflow-auto max-h-[78vh]">
          {/* 背景环境光晕 */}
          <div className="absolute inset-0 bg-gradient-radial from-pink-500/10 via-transparent to-transparent pointer-events-none" />

          {/* 立绘/CG 图片 */}
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 select-none hover:scale-[1.01]"
            loading="eager"
          />
        </div>

        {/* 底部信息栏 */}
        {subtitle && (
          <div className="w-full px-4 py-2.5 bg-[#0e1017]/90 border-t border-gray-800/80 text-center text-xs text-gray-300 font-sans">
            <span className="text-pink-300 font-medium">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}
