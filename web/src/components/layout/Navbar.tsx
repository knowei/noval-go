"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchUserProfile } from '@/lib/api';
import { Sparkles, Compass, Theater, Feather, Settings, History } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUserId,
    currentUser,
    setCurrentUser,
    modelSettings,
    setIsSettingsOpen,
    setIsUserSwitchOpen,
    setIsDrawerOpen
  } = useAppStore();

  useEffect(() => {
    fetchUserProfile(currentUserId).then((profile) => {
      if (profile) setCurrentUser(profile);
    });
  }, [currentUserId, setCurrentUser]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#262832] bg-[#121318]/90 backdrop-blur-md px-4 sm:px-8 py-2.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-rose-300 font-mono">
              NOVAL-GO
            </div>
            <div className="text-[10px] text-gray-400 font-mono">AI沉浸式角色扮演风月剧场</div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              pathname === '/'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b22]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>探索广场</span>
          </Link>

          <Link
            href="/chat/deck_coser_sister"
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              pathname.startsWith('/chat')
                ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b22]'
            }`}
          >
            <Theater className="w-3.5 h-3.5" />
            <span>剧情舞台</span>
          </Link>

          <Link
            href="/studio"
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              pathname === '/studio'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1b22]'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>创作工坊</span>
          </Link>
        </nav>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#1b1c24] hover:bg-[#232530] border border-[#2e303d] text-gray-300 hover:text-amber-300 text-xs font-mono flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="配置 AI 驱动模型与接口"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline text-[11px]">{modelSettings.model || 'deepseek-v3.2'}</span>
        </button>

        {/* User Account Switcher */}
        <button
          onClick={() => setIsUserSwitchOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1c1a26] to-[#201c2e] hover:from-[#252233] hover:to-[#2a253d] border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
          title="切换或管理用户账号"
        >
          <div className="w-5 h-5 rounded-full bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-[10px]">
            {currentUser?.avatar || '👤'}
          </div>
          <span className="hidden sm:inline text-xs font-bold font-mono">
            {currentUser?.nickname || currentUser?.username || '首席执笔者'}
          </span>
        </button>

        {/* Drawer Toggle */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-xl bg-[#1b1c24] hover:bg-[#232530] border border-[#2e303d] text-gray-300 hover:text-pink-300 transition cursor-pointer"
          title="打开历史存档抽屉"
        >
          <History className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
