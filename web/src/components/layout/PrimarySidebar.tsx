"use client";

import React, { useEffect } from 'react';
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
  Monitor
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
  { name: '聊天', icon: MessageCircle, color: 'text-white', href: '/chat/deck_reality_modifier', isChat: true },
  { name: '小说', icon: BookOpen, color: 'text-amber-500', href: '#' },
];

export function PrimarySidebar() {
  const pathname = usePathname();
  const { currentUserId, currentUser, setCurrentUser, setIsUserSwitchOpen, setIsSettingsOpen, modelSettings } = useAppStore();

  useEffect(() => {
    if (currentUserId) {
      fetchUserProfile(currentUserId).then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, [currentUserId, setCurrentUser]);

  const isChatActive = pathname.startsWith('/chat');

  return (
    <aside className="w-[86px] sm:w-[88px] shrink-0 h-screen sticky top-0 bg-[#0d0e13] border-r border-[#1e2029] flex flex-col justify-between py-2.5 px-1.5 z-40 select-none no-scrollbar">
      {/* Top Logo */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center justify-between w-full px-1 py-0.5">
          <Link href="/" className="flex items-center gap-1 group">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition font-black text-xs">
              风月
            </div>
          </Link>
          <Menu className="w-4 h-4 text-gray-400 hover:text-white transition cursor-pointer" />
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
                className={`w-full py-1.5 px-0.5 rounded-xl flex flex-col items-center gap-1 transition text-center group cursor-pointer ${
                  isActive
                    ? 'bg-[#222432] text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#161720]'
                }`}
                title={item.name}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : item.color} group-hover:scale-110 transition`} />
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
          onClick={() => setIsUserSwitchOpen(true)}
          className="w-full py-2 px-1 rounded-2xl bg-[#141620] hover:bg-[#1c1f2e] border border-amber-500/25 hover:border-amber-500/50 flex flex-col items-center cursor-pointer transition text-center group shadow-md"
          title="点击切换账号"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 border border-amber-300/50 flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition">
            {currentUser?.avatar || '🎭'}
          </div>
          <div className="text-xs font-bold text-gray-100 mt-1 truncate max-w-[76px] flex items-center justify-center gap-0.5 group-hover:text-amber-300">
            <span>{currentUser?.nickname || currentUser?.username || '风月旅行者'}</span>
            <span className="text-[10px] text-sky-400">🌐</span>
          </div>
          <div className="text-xs text-amber-400 font-bold font-mono mt-0.5 tracking-tight">
            💎 {currentUser ? (currentUser as any).points || '9,999' : '9,999'}
          </div>
        </div>

        {/* Model Switch Quick Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full py-1 px-1 rounded-xl bg-[#181a24] hover:bg-[#222534] border border-[#2d3144] hover:border-emerald-500/50 text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 transition font-mono shadow-sm cursor-pointer"
          title="点击切换 AI 推演大模型或配置 API"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate max-w-[66px]">{modelSettings.model || 'deepseek'}</span>
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
    </aside>
  );
}
