"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { fetchConversation, deleteConversation } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, ArrowUpDown, Clock, Heart, Award, Sparkles } from 'lucide-react';

export function ScenarioSidebar() {
  const {
    currentDeckKey,
    currentDeck,
    savedConversations,
    refreshSaves,
    currentConversationId,
    setCurrentConversationId,
    setConversationHistory,
    startNewStory
  } = useAppStore();

  useEffect(() => {
    refreshSaves();
  }, [currentDeckKey, refreshSaves]);

  const deckSaves = savedConversations.filter(s => s.deck_id === currentDeckKey);

  const handleSelectSave = async (convId: string) => {
    const data = await fetchConversation(convId);
    if (data && data.history) {
      setCurrentConversationId(data.id);
      setConversationHistory(data.history);
    }
  };

  const handleDeleteSave = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除此条存档吗？')) return;
    await deleteConversation(convId);
    await refreshSaves();
  };

  return (
    <aside className="w-64 sm:w-72 shrink-0 h-screen sticky top-0 bg-[#121319] border-r border-[#20222e] flex flex-col justify-between py-4 px-3.5 z-30 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="space-y-4">
        {/* Back link & badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
            <span>返回探索广场</span>
          </Link>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1e202c] text-pink-300 border border-pink-500/20">
            SCENARIO
          </span>
        </div>

        {/* Deck Title & Info */}
        <div className="space-y-1.5 pt-1">
          <h2 className="font-bold text-sm text-gray-100 leading-snug line-clamp-2">
            {currentDeck?.title || '剧本场景'}
          </h2>
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
            {currentDeck?.desc || '沉浸式角色扮演推演剧本'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
          <button className="py-1.5 rounded-lg bg-[#191b24] hover:bg-[#222432] border border-[#2b2d3d] text-gray-300 hover:text-white transition cursor-pointer text-center">
            作品详情
          </button>
          <button className="py-1.5 rounded-lg bg-[#191b24] hover:bg-[#222432] border border-[#2b2d3d] text-gray-300 hover:text-pink-300 transition cursor-pointer text-center flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-pink-400" />
            <span>打赏</span>
          </button>
          <button className="py-1.5 rounded-lg bg-[#191b24] hover:bg-[#222432] border border-[#2b2d3d] text-gray-300 hover:text-amber-300 transition cursor-pointer text-center flex items-center justify-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>热门存档</span>
          </button>
        </div>

        <div className="border-t border-[#1e202b] pt-3" />

        {/* Conversation List Header */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold text-gray-200 flex items-center gap-1">
            <span>会话列表</span>
            <span className="text-[11px] text-gray-500 font-mono">({deckSaves.length})</span>
          </span>
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-gray-300 transition" />
        </div>

        {/* New Conversation Button */}
        <button
          onClick={() => {
            if (currentDeck) {
              startNewStory(currentDeck);
            }
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>新对话</span>
        </button>

        {/* Saves List */}
        <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5 no-scrollbar">
          {deckSaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs leading-relaxed">
              暂无独立存档<br />点击上方“新对话”开启推演
            </div>
          ) : (
            deckSaves.map((conv, idx) => {
              const isActive = conv.id === currentConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectSave(conv.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer group flex items-center justify-between ${
                    isActive
                      ? 'border-amber-500/80 bg-gradient-to-r from-amber-500/15 via-[#232029] to-[#1e1c24] text-amber-200 shadow-md shadow-amber-500/10'
                      : 'border-[#232532] bg-[#161720] hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-xs truncate">
                      存档 {idx + 1} · {conv.title ? conv.title.slice(0, 14) : '初始开卷'}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>第 {conv.turn_count || 1} 幕</span>
                      <span>·</span>
                      <span>{conv.updated_at ? conv.updated_at.slice(5, 16) : '刚才'}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSave(e, conv.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition"
                    title="删除存档"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
