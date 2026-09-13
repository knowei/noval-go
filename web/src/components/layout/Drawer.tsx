"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { deleteConversation, fetchConversation } from '@/lib/api';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { X, Plus, Trash2, BookOpen, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Drawer() {
  const router = useRouter();
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    savedConversations,
    refreshSaves,
    currentDeckKey,
    currentDeck,
    startNewStory,
    setCurrentConversationId,
    setConversationHistory
  } = useAppStore();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      refreshSaves();
    }
  }, [isDrawerOpen, refreshSaves]);

  if (!isDrawerOpen) return null;

  const currentDeckSaves = savedConversations.filter(c => c.deck_id === currentDeckKey);

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
      await deleteConversation(deleteTargetId);
      await refreshSaves();
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-[#15161c] border-l border-[#262832] text-gray-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#242630] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-400" />
              <h2 className="font-bold text-sm">剧本推演存档库</h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-[#20222a] text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Deck Context */}
          <div className="p-3 bg-[#191a22] border-b border-[#242630] flex items-center justify-between text-xs">
            <span className="text-gray-400 truncate max-w-[200px]">
              当前剧本: <strong className="text-pink-300">{currentDeck?.title || currentDeckKey}</strong>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
              {currentDeckSaves.length} 个存档
            </span>
          </div>

          {/* New Conversation Button */}
          <div className="p-3">
            <button
              onClick={() => {
                if (currentDeck) {
                  startNewStory(currentDeck);
                  setIsDrawerOpen(false);
                  router.push(`/chat/${currentDeck.id}`);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20 transition active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>开启新一轮推演（第一幕）</span>
            </button>
          </div>

          {/* Saves List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {currentDeckSaves.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                当前剧本暂无独立存档<br />点击上方按钮立即开启新故事
              </div>
            ) : (
              currentDeckSaves.map((conv, idx) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectSave(conv.id)}
                  className="p-3 rounded-xl bg-[#1a1b24] border border-[#2b2d3a] hover:border-pink-500/50 transition cursor-pointer group flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-xs text-gray-200 truncate group-hover:text-pink-300 transition">
                      存档 {idx + 1} · {conv.title ? conv.title.slice(0, 16) : '未命名剧情'}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>第 {conv.turn_count || 1} 幕</span>
                      <span>·</span>
                      <span>{conv.updated_at ? conv.updated_at.slice(5, 16) : '刚才'}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="删除此存档"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
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

