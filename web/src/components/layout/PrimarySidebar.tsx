"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchUserProfile } from '@/lib/api';
import {
  Compass,
  Feather,
  Gift,
  Ticket,
  CreditCard,
  Camera,
  Share2,
  CalendarCheck,
  Smartphone,
  MessageSquare,
  MessageCircle,
  BookOpen,
  Menu,
  Volume2,
  HelpCircle,
  Monitor,
  Zap,
  User,
  X
} from 'lucide-react';

const MENU_ITEMS = [
  { name: '探索', icon: Compass, color: 'text-amber-500', href: '/' },
  { name: '创作', icon: Feather, color: 'text-orange-500', href: '/studio' },
  { name: '礼包', icon: Gift, color: 'text-rose-500', href: '#' },
  { name: '新人刮卡', icon: Ticket, color: 'text-yellow-400', href: '#' },
  { name: '充值', icon: CreditCard, color: 'text-cyan-400', href: '#' },
  { name: 'AI生图/视频', icon: Camera, color: 'text-emerald-400', href: '#' },
  { name: '有奖邀请', icon: Share2, color: 'text-amber-400', href: '#' },
  { name: '签到中心', icon: CalendarCheck, color: 'text-pink-500', href: '#' },
  { name: 'App下载', icon: Smartphone, color: 'text-sky-400', href: '#' },
  { name: '论坛', icon: MessageSquare, color: 'text-purple-400', href: '#' },
  { name: '聊天', icon: MessageCircle, color: 'text-white', href: '/chat/deck_sister_truth_or_dare', isChat: true },
  { name: '小说', icon: BookOpen, color: 'text-amber-500', href: '#' },
];

export function PrimarySidebar() {
  const pathname = usePathname();
  const { currentUserId, currentUser, setCurrentUser, setIsUserSwitchOpen, setIsSettingsOpen, modelSettings } = useAppStore();
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

  const renderSidebarContent = (isMobile: boolean = false) => (
    <>
      {/* Top Logo */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <div className="flex items-center justify-between w-full px-1 py-0.5">
          <Link href="/" onClick={() => isMobile && setIsMobileDrawerOpen(false)} className="flex items-center gap-1.5 group">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition font-black text-xs">
              风月
            </div>
            {isMobile && <span className="font-bold text-sm text-gray-100 font-mono">AI风月剧场</span>}
          </Link>
          {isMobile ? (
            <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Menu className="w-4 h-4 text-gray-400 hover:text-white transition cursor-pointer" />
          )}
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col items-center space-y-0.5 w-full overflow-y-auto no-scrollbar flex-1 min-h-0 py-0.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.isChat ? isChatActive : pathname === item.href && item.href !== '#';
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsMobileDrawerOpen(false)}
                className={`w-full py-1.5 px-1 rounded-xl flex ${isMobile ? 'flex-row items-center gap-3 px-3' : 'flex-col items-center gap-1'} transition text-center group cursor-pointer ${
                  isActive
                    ? 'bg-[#222432] text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#161720]'
                }`}
                title={item.name}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : item.color} group-hover:scale-110 transition`} />
                <span className="text-[11px] tracking-tight leading-none whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Area */}
      <div className="pt-2 border-t border-[#1e2029] flex flex-col items-center space-y-1.5 w-full">
        {/* User Card */}
        <div
          onClick={() => {
            setIsUserSwitchOpen(true);
            if (isMobile) setIsMobileDrawerOpen(false);
          }}
          className="w-full py-2 px-1 rounded-2xl bg-[#141620] hover:bg-[#1c1f2e] border border-amber-500/25 hover:border-amber-500/50 flex flex-col items-center cursor-pointer transition text-center group shadow-md"
          title="点击切换账号"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border border-amber-300/50 flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition">
            {currentUser?.avatar || '🎭'}
          </div>
          <div className="text-xs font-bold text-gray-100 mt-1 truncate max-w-[80px] flex items-center justify-center gap-0.5 group-hover:text-amber-300">
            <span>{currentUser?.nickname || currentUser?.username || '风月旅行者'}</span>
            <span className="text-[10px] text-sky-400">🌐</span>
          </div>
          <div className="text-xs text-amber-400 font-bold font-mono mt-0.5 tracking-tight">
            💎 <span suppressHydrationWarning>{mounted && currentUser ? (currentUser as any).points || '9,999' : '9,999'}</span>
          </div>
        </div>

        {/* Model Switch Quick Button */}
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            if (isMobile) setIsMobileDrawerOpen(false);
          }}
          className="w-full py-1 px-1 rounded-xl bg-[#181a24] hover:bg-[#222534] border border-[#2d3144] hover:border-emerald-500/50 text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 transition font-mono shadow-sm cursor-pointer"
          title="点击切换 AI 推演大模型或配置 API"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span suppressHydrationWarning className="truncate max-w-[70px]">{mounted ? (modelSettings.model || 'deepseek') : 'deepseek'}</span>
        </button>

        {/* Quick Links */}
        <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5 whitespace-nowrap pt-0.5">
          <span className="hover:text-gray-200 cursor-pointer">关注</span>
          <span className="text-gray-700">|</span>
          <span className="hover:text-gray-200 cursor-pointer">历史</span>
          <span className="text-gray-700">|</span>
          <span className="hover:text-gray-200 cursor-pointer">收藏</span>
        </div>

        {/* Footer tool icons */}
        <div className="flex items-center justify-center gap-2.5 text-gray-500 pt-0.5 pb-0.5">
          <button onClick={() => setIsSettingsOpen(true)} title="模型配置" className="hover:text-amber-300 transition cursor-pointer">
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <HelpCircle className="w-3.5 h-3.5 hover:text-sky-300 transition cursor-pointer" />
          <Monitor className="w-3.5 h-3.5 hover:text-purple-300 transition cursor-pointer" />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-[86px] sm:w-[88px] shrink-0 h-screen sticky top-0 bg-[#0d0e13] border-r border-[#1e2029] flex-col justify-between py-2.5 px-1.5 z-40 select-none no-scrollbar">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Slide-out Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw] bg-[#0d0e13] h-full shadow-2xl p-3 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* 3. Mobile Top Header (on non-chat pages) */}
      {!isChatActive && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-[#0d0e13]/90 backdrop-blur-md border-b border-[#1e2029] z-30 flex items-center justify-between px-3">
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
              <span suppressHydrationWarning>{mounted ? (modelSettings.model || 'deepseek') : 'deepseek'}</span>
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0f1016]/95 backdrop-blur-md border-t border-[#1f212e] z-40 flex items-center justify-around px-2 select-none shadow-2xl">
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
              pathname === '/studio' ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>创作</span>
          </Link>

          <Link
            href="/chat/deck_sister_truth_or_dare"
            className={`flex flex-col items-center gap-1 text-[10px] ${
              isChatActive ? 'text-amber-400 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>聊天</span>
          </Link>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-300 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>模型</span>
          </button>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] text-gray-400 hover:text-amber-300 cursor-pointer"
          >
            <Menu className="w-4 h-4 text-amber-500" />
            <span>更多</span>
          </button>
        </div>
      )}
    </>
  );
}
