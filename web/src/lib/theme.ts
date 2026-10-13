"use client";

import { useState, useEffect, useCallback } from 'react';

export type ThemePreference = 'system' | 'dark' | 'light';
export type EffectiveTheme = 'dark' | 'light';

const STORAGE_KEY = 'noval_theme';

/**
 * 读取当前存储的主题首选项（默认跟随系统）
 */
export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch (e) {}
  return 'system';
}

/**
 * 检测客户端系统的实际明暗模式
 */
export function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'dark';
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch (e) {
    return 'dark';
  }
}

/**
 * 根据首选项解析出实际应用的模式
 */
export function resolveEffectiveTheme(pref: ThemePreference): EffectiveTheme {
  if (pref === 'dark') return 'dark';
  if (pref === 'light') return 'light';
  return getSystemTheme();
}

/**
 * 将主题应用到 document.documentElement
 */
export function applyTheme(pref: ThemePreference): EffectiveTheme {
  if (typeof window === 'undefined') return 'dark';

  const effective = resolveEffectiveTheme(pref);
  const root = document.documentElement;

  // 更新 class 与属性
  root.classList.remove('dark', 'light');
  root.classList.add(effective);
  root.setAttribute('data-theme', effective);
  root.setAttribute('data-theme-pref', pref);

  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch (e) {}

  return effective;
}

/**
 * 全局 React Hook：获取与切换主题
 */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [effectiveTheme, setEffectiveThemeState] = useState<EffectiveTheme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initialPref = getStoredThemePreference();
    setPreferenceState(initialPref);
    const eff = applyTheme(initialPref);
    setEffectiveThemeState(eff);

    // 监听系统深浅色切换（当设置为跟随系统时自动触发）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const currentPref = getStoredThemePreference();
      if (currentPref === 'system') {
        const updatedEff = applyTheme('system');
        setEffectiveThemeState(updatedEff);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  const setTheme = useCallback((newPref: ThemePreference) => {
    setPreferenceState(newPref);
    const eff = applyTheme(newPref);
    setEffectiveThemeState(eff);
  }, []);

  const toggleTheme = useCallback(() => {
    // 循环切换：暗夜 -> 蓝白 -> 跟随系统 -> 暗夜
    setPreferenceState(prev => {
      const nextPref: ThemePreference = prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark';
      const eff = applyTheme(nextPref);
      setEffectiveThemeState(eff);
      return nextPref;
    });
  }, []);

  return {
    theme: preference,
    effectiveTheme,
    setTheme,
    toggleTheme,
    mounted
  };
}
