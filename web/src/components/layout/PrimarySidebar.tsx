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
  { name: '探索', icon: Compass, href: '/' },
  { name: '创作', icon: Feather, href: '/studio' },
  { name: '礼包', icon: Gift, href: '#' },
  { name: '新人刮卡', icon: Ticket, href: '#' },
  { name: '充值', icon: CreditCard, href: '#' },
  { name: 'AI生图/视频', icon: Camera, href: '#' },
  { name: '有奖邀请', icon: Share2, href: '#' },
  { name: '签到中心', icon: CalendarCheck, href: '#' },
  { name: 'App下载', icon: Smartphone, href: '#' },
  { name: '论坛', icon: MessageSquare, href: '#' },
  { name: '聊天', icon: MessageCircle, href: '/chat/deck_coser_sister', isChat: true },
  { name: '小说', icon: BookOpen, href: '#' },
];

export function PrimarySidebar() {
  const pathname = usePathname();
  const { currentUserId, currentUser, setCurrentUser, setIsUserSwitchOpen, setIsSettingsOpen } = useAppStore();

  useEffect(() => {
    if (currentUserId) {
      fetchUserProfile(currentUserId).then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, [currentUserId, setCurrentUser]);

  const isChatActive = pathname.startsWith('/chat');

  return (
    <aside className="w-16 sm:w-[72px] shrink-0 h-screen sticky top-0 bg-[#0d0e13] border-r border-[#1e2029] flex flex-col justify-between py-3 px-1.5 z-40 select-none">
      {/* Top Logo */}
      <div className="flex flex-col items-center space-y-3">
        <Link href="/" className="flex items-center gap-1 group py-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition font-black text-xs">
            风月
          </div>
          <Menu className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition" />
        </Link>

        {/* Menu Navigation */}
        <nav className="flex flex-col items-center space-y-1 w-full overflow-y-auto max-h-[calc(100vh-210px)] no-scrollbar pt-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.isChat ? isChatActive : pathname === item.href && item.href !== '#';
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition text-center group cursor-pointer ${
                  isActive
                    ? 'bg-[#222432] text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#161720]'
                }`}
                title={item.name}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-amber-300'}`} />
                <span className="text-[10px] scale-90 tracking-tight leading-none whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Area */}
      <div className="pt-2 border-t border-[#1e2029] flex flex-col items-center space-y-2 w-full">
        {/* User Card */}
        <div
          onClick={() => setIsUserSwitchOpen(true)}
          className="w-full py-1.5 px-1 rounded-xl bg-[#14161f] hover:bg-[#1b1e2a] border border-purple-500/20 flex flex-col items-center cursor-pointer transition text-center group"
          title="点击切换账号"
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xs">
            {currentUser?.avatar || '🎭'}
          </div>
          <div className="text-[10px] font-bold text-gray-200 mt-1 truncate max-w-[60px] group-hover:text-amber-300">
            {currentUser?.nickname || currentUser?.username || '风月旅行者'}
          </div>
          <div className="text-[9px] text-amber-400 font-mono scale-90">
            💎 {currentUser ? (currentUser as any).points || '9,999' : '9,999'}
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-[9px] text-gray-500 flex items-center justify-center gap-1 scale-75 whitespace-nowrap">
          <span className="hover:text-gray-300 cursor-pointer">关注</span>
          <span>|</span>
          <span className="hover:text-gray-300 cursor-pointer">历史</span>
          <span>|</span>
          <span className="hover:text-gray-300 cursor-pointer">收藏</span>
        </div>

        {/* Footer tool icons */}
        <div className="flex items-center justify-center gap-1.5 text-gray-600 pt-0.5">
          <button onClick={() => setIsSettingsOpen(true)} title="模型配置">
            <Volume2 className="w-3 h-3 hover:text-gray-400 cursor-pointer" />
          </button>
          <HelpCircle className="w-3 h-3 hover:text-gray-400 cursor-pointer" />
          <Monitor className="w-3 h-3 hover:text-gray-400 cursor-pointer" />
        </div>
      </div>
    </aside>
  );
}
