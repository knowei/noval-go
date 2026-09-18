"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchUserProfile } from '@/lib/api';
import {
  Compass,
  Feather,
  Play,
  History,
  Sliders,
  Settings,
  X,
  Menu
} from 'lucide-react';

export function PrimarySidebar() {
  const pathname = usePathname();
  const {
    currentUserId,
    currentUser,
    setCurrentUser,
    setIsUserSwitchOpen,
    setIsSettingsOpen,
    setIsDrawerOpen,
    modelSettings,
    currentDeckKey
  } = useAppStore();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchUserProfile(currentUserId).then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, [currentUserId, setCurrentUser]);

  const isChatActive = pathname.startsWith('/chat');
  const chatHref = currentDeckKey ? `/chat/${currentDeckKey}` : '/chat/deck_jiangshi_childhood';

  // Only truly useful & functional items
  const NAV_ITEMS = [
    {
      id: 'explore',
      name: '探索',
      icon: Compass,
      href: '/',
      isActive: pathname === '/',
      color: 'text-amber-400',
      activeBg: 'from-amber-500/25 to-amber-500/5',
      activeBorder: 'border-amber-500/40',
      activeText: 'text-amber-300',
      desc: '探索广场 · 剧本精选'
    },
    {
      id: 'studio',
      name: '创作',
      icon: Feather,
      href: '/studio',
      isActive: pathname === '/studio',
      color: 'text-pink-400',
      activeBg: 'from-pink-500/25 to-purple-500/5',
      activeBorder: 'border-pink-500/40',
      activeText: 'text-pink-300',
      desc: '剧本工坊 · 自由排版'
    },
    {
      id: 'chat',
      name: '推演',
      icon: Play,
      href: chatHref,
      isActive: isChatActive,
      color: 'text-purple-400',
      activeBg: 'from-purple-500/25 to-indigo-500/5',
      activeBorder: 'border-purple-500/40',
      activeText: 'text-purple-300',
      desc: '沉浸舞台 · 对话推演'
    }
  ];

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full w-full">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center w-full">
        <div className="flex items-center justify-between w-full px-1.5 py-1 mb-4">
          <Link
            href="/"
            onClick={() => isMobile && setIsMobileDrawerOpen(false)}
            className="flex items-center gap-2.5 group w-full justify-center"
            title="回到首页广场"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 group-hover:scale-105 group-hover:shadow-rose-500/40 transition duration-300 font-black text-sm select-none">
              风月
            </div>
            {isMobile && (
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-gray-100 font-mono block truncate">AI风月剧场</span>
                <span className="text-[10px] text-gray-400 block">沉浸互动剧本</span>
              </div>
            )}
          </Link>
          {isMobile && (
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Functional Navigation Buttons */}
        <nav className="flex flex-col items-center space-y-2.5 w-full">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => isMobile && setIsMobileDrawerOpen(false)}
                className={`w-full rounded-2xl flex ${
                  isMobile
                    ? 'flex-row items-center gap-3 px-3.5 py-3'
                    : 'flex-col items-center justify-center gap-1.5 py-2.5 px-1'
                } transition-all duration-200 group cursor-pointer relative ${
                  item.isActive
                    ? `bg-gradient-to-b ${item.activeBg} border ${item.activeBorder} ${item.activeText} shadow-md shadow-purple-950/40`
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#161824] border border-transparent'
                }`}
                title={item.desc}
              >
                {/* Active Indicator on Desktop */}
                {!isMobile && item.isActive && (
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-amber-400 to-rose-500" />
                )}

                <div className="relative">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition duration-200 group-hover:scale-110 ${
                      item.isActive ? item.activeText : item.color
                    }`}
                  />
                </div>

                <span className="text-xs font-bold tracking-wider leading-none whitespace-nowrap">
                  {item.name}
                </span>
                {isMobile && (
                  <span className="text-[10px] text-gray-500 font-normal ml-auto">{item.desc}</span>
                )}
              </Link>
            );
          })}

          {/* Action Button: Saves Drawer */}
          <button
            onClick={() => {
              setIsDrawerOpen(true);
              if (isMobile) setIsMobileDrawerOpen(false);
            }}
            className={`w-full rounded-2xl flex ${
              isMobile
                ? 'flex-row items-center gap-3 px-3.5 py-3'
                : 'flex-col items-center justify-center gap-1.5 py-2.5 px-1'
            } transition-all duration-200 group cursor-pointer text-gray-400 hover:text-amber-300 hover:bg-[#161824] border border-transparent`}
            title="查看与管理我的推演存档"
          >
            <History className="w-5 h-5 shrink-0 text-cyan-400 group-hover:scale-110 transition duration-200" />
            <span className="text-xs font-bold tracking-wider leading-none whitespace-nowrap">
              存档
            </span>
            {isMobile && (
              <span className="text-[10px] text-gray-500 font-normal ml-auto">推演存档管理</span>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom User & Model Settings Area */}
      <div className="flex flex-col items-center space-y-2 w-full pt-3 border-t border-[#1a1c26]">
        {/* Model Switch Pill Button */}
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            if (isMobile) setIsMobileDrawerOpen(false);
          }}
          className={`w-full py-2 px-1.5 rounded-xl bg-[#141622] hover:bg-[#1d2030] border border-[#2b2f42] hover:border-emerald-500/50 flex ${
            isMobile ? 'flex-row items-center justify-between px-3' : 'flex-col items-center justify-center'
          } gap-1 transition cursor-pointer group shadow-sm`}
          title="点击切换推演大模型或配置 API Key"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span
              suppressHydrationWarning
              className="text-[11px] font-mono font-bold text-emerald-400 group-hover:text-emerald-300 truncate max-w-[65px]"
            >
              {mounted ? modelSettings.model || 'deepseek' : 'deepseek'}
            </span>
          </div>
          {!isMobile && (
            <span className="text-[9px] text-gray-500 group-hover:text-gray-400 scale-90">
              模型设定
            </span>
          )}
        </button>

        {/* User Profile Card */}
        <div
          onClick={() => {
            setIsUserSwitchOpen(true);
            if (isMobile) setIsMobileDrawerOpen(false);
          }}
          className={`w-full p-2 rounded-2xl bg-[#141622] hover:bg-[#1c1f2e] border border-amber-500/20 hover:border-amber-500/50 flex ${
            isMobile ? 'flex-row items-center gap-3' : 'flex-col items-center justify-center'
          } cursor-pointer transition group shadow-md text-center`}
          title="点击打开执笔账号与安全中心"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border border-amber-300/40 flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition shrink-0">
            {currentUser?.avatar || '🎭'}
          </div>

          <div className="mt-1 min-w-0">
            <div className="text-[11px] font-bold text-gray-200 group-hover:text-amber-300 truncate max-w-[70px]">
              {currentUser?.nickname || currentUser?.username || '设备访客'}
            </div>
            <div className="text-[10px] text-amber-400 font-bold font-mono tracking-tight flex items-center justify-center gap-0.5">
              <span>💎</span>
              <span suppressHydrationWarning>
                {mounted && currentUser ? (currentUser as any).points || '9,999' : '9,999'}
              </span>
            </div>
          </div>
        </div>

        {/* Settings gear */}
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            if (isMobile) setIsMobileDrawerOpen(false);
          }}
          className="p-1.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-[#1a1c28] transition cursor-pointer flex items-center justify-center"
          title="系统与API设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex w-[78px] shrink-0 h-screen sticky top-0 bg-[#0c0d12] border-r border-[#1b1d26] flex-col justify-between py-3 px-2 z-40 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Slide-out Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-[#0c0d12] h-full shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* 3. Mobile Top Header (on non-chat pages) */}
      {!isChatActive && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-[#0c0d12]/90 backdrop-blur-md border-b border-[#1b1d26] z-30 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-black">
                风月
              </div>
              <span className="font-bold text-xs text-gray-200">AI风月剧场</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span suppressHydrationWarning>{mounted ? modelSettings.model || 'deepseek' : 'deepseek'}</span>
            </button>

            <button
              onClick={() => setIsUserSwitchOpen(true)}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-xs shadow-sm cursor-pointer"
            >
              {currentUser?.avatar || '🎭'}
            </button>
          </div>
        </div>
      )}

      {/* 4. Mobile Bottom Navigation Bar (hidden during chat) */}
      {!isChatActive && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0c0d12]/95 backdrop-blur-md border-t border-[#1b1d26] z-40 flex items-center justify-around px-2 select-none shadow-2xl">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 text-[10px] ${
              pathname === '/' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>探索</span>
          </Link>

          <Link
            href="/studio"
            className={`flex flex-col items-center gap-1 text-[10px] ${
              pathname === '/studio' ? 'text-pink-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>创作</span>
          </Link>

          <Link
            href={chatHref}
            className={`flex flex-col items-center gap-1 text-[10px] ${
              isChatActive ? 'text-purple-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>推演</span>
          </Link>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-gray-400 hover:text-cyan-300 cursor-pointer"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>存档</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-300 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>设置</span>
          </button>
        </div>
      )}
    </>
  );
}

