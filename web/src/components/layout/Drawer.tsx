"use client";

import React, { useEffect, useState } from 'react';
import { isCheckpointId, useAppStore } from '@/lib/store';
import { deleteConversation, fetchConversation } from '@/lib/api';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { X, Plus, Trash2, BookOpen, Clock, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PrivateCardLibrary } from '@/components/plaza/PrivateCardLibrary';

export function Drawer() {
  const router = useRouter();
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    drawerTab,
    setDrawerTab,
    savedConversations,
    refreshSaves,
    currentDeckKey,
    currentDeck,
    startNewStory,
    currentConversationId,
    setCurrentConversationId,
    setConversationHistory
  } = useAppStore();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'cards'>('current');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isDrawerOpen) {
      refreshSaves();
      if (drawerTab) {
        setActiveTab(drawerTab);
      } else if (!currentDeckKey) {
        setActiveTab('all');
      }
    }
  }, [isDrawerOpen, refreshSaves, drawerTab, currentDeckKey]);

  if (!isDrawerOpen) return null;

  const isMatchDeck = (c: any) => {
    if (!currentDeckKey) return true;
    if (c.deck_id === currentDeckKey) return true;
    if (currentDeckKey === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7' && c.deck_id === 'deck_xiuxian_world') return true;
    if (currentDeckKey === 'deck_xiuxian_world' && c.deck_id === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7') return true;
    return false;
  };
  const currentDeckSaves = savedConversations.filter(isMatchDeck);
  const targetSaves = activeTab === 'current' ? currentDeckSaves : savedConversations;

  const filteredSaves = targetSaves.filter(s => {
    if (isCheckpointId(s.id)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (s.title || '').toLowerCase().includes(q);
    const deckTitleMatch = (s.deck_title || s.deck_id || '').toLowerCase().includes(q);
    return titleMatch || deckTitleMatch;
  });

  const handleSelectSave = async (convId: string) => {
    const data = await fetchConversation(convId);
    if (data && data.history) {
      setCurrentConversationId(data.id);
      setConversationHistory(data.history);
      setIsDrawerOpen(false);
      router.push(`/chat/${data.deck_id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setDeleteTargetId(convId);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      const isDeletingCurrent = deleteTargetId === currentConversationId;
      await deleteConversation(deleteTargetId);
      await refreshSaves();
      setDeleteTargetId(null);

      if (isDeletingCurrent) {
        if (currentDeck) {
          startNewStory(currentDeck);
        } else {
          setCurrentConversationId('');
          setConversationHistory([]);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-[var(--app-card-bg,#15161c)] border-l border-[var(--app-card-border,#262832)] text-[var(--app-text-main,#f1f5f9)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[var(--app-card-border,#242630)] flex items-center justify-between bg-[var(--app-card-bg-subtle,#161722)]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <h2 className="font-bold text-sm">
                {activeTab === 'cards' ? '私密角色卡与导入库' : '剧本推演存档库'}
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Triple Tabs: Current Deck vs All Stories vs Private Cards */}
          <div className="px-3 pt-3 flex items-center gap-1.5 border-b border-[var(--app-card-border,#242630)] pb-2.5">
            {currentDeckKey && (
              <button
                onClick={() => {
                  setActiveTab('current');
                  setDrawerTab('current');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'current'
                    ? 'bg-pink-600/20 text-pink-400 border border-pink-500/40 shadow-xs'
                    : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>当前剧本</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-500/25 text-pink-400 font-mono">
                  {currentDeckSaves.length}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('all');
                setDrawerTab('all');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-xs'
                  : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span>全部存档</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/25 text-purple-400 font-mono">
                {savedConversations.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cards');
                setDrawerTab('cards');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-xs'
                  : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <span>🎴 角色卡库</span>
            </button>
          </div>

          {/* Body Content */}
          {activeTab === 'cards' ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <PrivateCardLibrary />
            </div>
          ) : (
            <>
              {/* Search bar inside drawer */}
              <div className="px-3 pt-2 pb-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索存档标题或剧本名称..."
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--app-card-bg-subtle,#1a1b24)] border border-[var(--app-card-border,#2c2e3c)] focus:border-pink-500/60 text-xs text-[var(--app-text-main,#f1f5f9)] placeholder-[var(--app-text-dim,#64748b)] outline-none transition"
                />
              </div>

              {/* New Conversation Button */}
              {currentDeck && activeTab === 'current' && (
                <div className="p-3 pt-1.5">
                  <button
                    onClick={() => {
                      startNewStory(currentDeck);
                      setIsDrawerOpen(false);
                      router.push(`/chat/${currentDeck.id}`);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20 transition active:scale-[0.99] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>开启新一轮推演（第一幕）</span>
                  </button>
                </div>
              )}

              {/* Saves List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredSaves.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs leading-relaxed">
                {searchQuery
                  ? '未找到匹配的存档记录'
                  : activeTab === 'current'
                  ? '当前剧本暂无独立存档\n点击上方按钮立即开启新故事'
                  : '暂无任何历史存档记录'}
              </div>
            ) : (
              filteredSaves.map((conv, idx) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectSave(conv.id)}
                  className="p-3 rounded-xl bg-[#1a1b24] border border-[#2b2d3a] hover:border-pink-500/50 transition cursor-pointer group flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    {/* Deck badge if in all view */}
                    {activeTab === 'all' && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-[9px] text-purple-300 font-bold mb-1 truncate max-w-[200px]">
                        {conv.deck_title || conv.deck_id}
                      </span>
                    )}

                    <div className="font-bold text-xs text-gray-200 truncate group-hover:text-pink-300 transition">
                      {conv.title ? conv.title.slice(0, 20) : `存档 · 第 ${conv.turn_count || 1} 幕`}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span>共 {conv.turn_count || 1} 幕</span>
                      <span>·</span>
                      <span>{conv.updated_at ? conv.updated_at.slice(5, 16) : '刚才'}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer shrink-0"
                    title="删除此存档"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  </div>

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="删除存档"
        message="确定要彻底删除该条会话存档吗？删除后不可恢复。"
        confirmText="确认删除"
        cancelText="取消"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

