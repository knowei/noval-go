"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemePreference } from '@/lib/theme';
import { Moon, Sun, Laptop, Heart, Check } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, effectiveTheme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-xl bg-transparent animate-pulse ${className}`} />
    );
  }

  const THEME_OPTIONS: Array<{
    id: ThemePreference;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }> = [
    {
      id: 'dark',
      label: '暗夜模式',
      sublabel: '深邃沉浸',
      icon: Moon,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/50'
    },
    {
      id: 'light',
      label: '蓝白模式',
      sublabel: '清爽明朗',
      icon: Sun,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'pink',
      label: '樱花粉色',
      sublabel: '甜美浪漫',
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/50'
    },
    {
      id: 'system',
      label: '跟随系统',
      sublabel: '自动同步客户端',
      icon: Laptop,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/50'
    }
  ];

  const currentOption = THEME_OPTIONS.find(o => o.id === theme) || THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer group shadow-xs overflow-hidden theme-toggle-btn bg-[var(--app-card-bg-subtle,#141622)] hover:bg-[var(--app-card-bg,#1d2030)] border-[var(--app-card-border,#2b2f42)] hover:border-pink-500/50"
          title={`当前风格：${currentOption.label}（点击切换）`}
        >
          <div className="flex items-center justify-center gap-1.5 w-full min-w-0">
            <CurrentIcon className={`w-3.5 h-3.5 ${currentOption.color} transition-transform group-hover:scale-110`} />
            <span className="text-[10px] font-bold text-[var(--app-text-main,#f1f5f9)] truncate max-w-[52px]">
              {theme === 'system' ? '跟随' : theme === 'pink' ? '粉色' : theme === 'light' ? '蓝白' : '暗夜'}
            </span>
          </div>
          <span className="text-[9px] text-[var(--app-text-dim,#6b7280)] group-hover:text-[var(--app-text-muted,#9ca3af)] leading-none">
            主题风格
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-full bottom-0 ml-2 w-48 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 border bg-[var(--app-card-bg,#161722)] border-[var(--app-card-border,#2a2d3e)]">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b text-[var(--app-text-dim,#6b7280)] border-[var(--app-card-border,#232638)]">
              选择视觉主题
            </div>
            <div className="space-y-1 mt-1">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-pink-600/15 border border-pink-500/30 font-bold text-pink-500 dark:text-pink-400'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text-sub,#cbd5e1)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${opt.color}`} />
                      <div>
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-[var(--app-text-dim,#64748b)] font-normal">{opt.sublabel}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-pink-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full segmented control for settings modal
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 w-full ${className}`}>
      {THEME_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center relative ${
              isSelected
                ? 'border-pink-500 bg-pink-500/10 shadow-sm shadow-pink-500/15'
                : 'border-[var(--app-card-border,#282a3a)] bg-[var(--app-card-bg-subtle,#141520)] hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${opt.bgColor}`}>
              <Icon className={`w-4 h-4 ${opt.color}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--app-text-main,#f1f5f9)]">{opt.label}</div>
              <div className="text-[10px] text-[var(--app-text-dim,#64748b)] mt-0.5">{opt.sublabel}</div>
            </div>
            {isSelected && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
