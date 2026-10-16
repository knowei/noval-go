"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isCheckpointId, useAppStore } from '@/lib/store';
import { fetchConversation, deleteConversation } from '@/lib/api';
import { exportConversationBundle, importConversationFile } from '@/lib/conversationBundle';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ArrowLeft, Plus, Trash2, ArrowUpDown, Clock, Heart, Award, Sparkles, X, Download, Upload, Loader2, BookOpen, BookMarked, ChevronRight } from 'lucide-react';

interface ScenarioSidebarProps {
  onClose?: () => void;
  onOpenHandbook?: () => void;
  onOpenLorebook?: () => void;
  onOpenDeckDetail?: () => void;
}

export function ScenarioSidebar({ onClose, onOpenHandbook, onOpenLorebook, onOpenDeckDetail }: ScenarioSidebarProps) {
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

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    refreshSaves();
  }, [currentDeckKey, refreshSaves]);

  // 提示条自动消失
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  /** 导出单个存档：连同它依赖的剧本一起下载。 */
  const handleExport = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    const res = await exportConversationBundle(convId);
    setNotice(res.ok ? '已导出存档文件（含剧本设定）' : `导出失败：${res.error || '未知错误'}`);
  };

  /** 导入存档：先按需补齐剧本，再写入会话，然后直接切过去继续聊。 */
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许连续选择同一个文件
    if (!file) return;
    setImporting(true);
    try {
      const uid = useAppStore.getState().currentUserId || 'default_user';
      const res = await importConversationFile(file, uid);
      if (!res.ok) {
        setNotice(`导入失败：${res.error}`);
        return;
      }
      const deckNote = res.deckAction === 'created' ? '，并创建了剧本' : res.deckAction === 'missing' ? '，但存档里没有剧本设定' : '';
      setNotice(`导入成功：${res.turns} 幕${deckNote}`);
      await refreshSaves();

      if (res.deckId && res.deckId !== currentDeckKey) {
        router.push(`/chat/${res.deckId}`);
        return;
      }
      const data = await fetchConversation(res.conversationId);
      if (data && data.history) {
        setCurrentConversationId(data.id);
        setConversationHistory(data.history);
        if (onClose) onClose();
      }
    } finally {
      setImporting(false);
    }
  };

  const isMatchDeck = (s: any) => {
    if (isCheckpointId(s.id)) return false;
    if (!currentDeckKey) return true;
    if (s.deck_id === currentDeckKey) return true;
    if (currentDeckKey === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7' && s.deck_id === 'deck_xiuxian_world') return true;
    if (currentDeckKey === 'deck_xiuxian_world' && s.deck_id === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7') return true;
    if (currentDeckKey === 'b93fc029-e704-42e1-a1a8-d51c62fc8b55' && s.deck_id === 'deck_suyu_contract') return true;
    if (currentDeckKey === 'deck_suyu_contract' && s.deck_id === 'b93fc029-e704-42e1-a1a8-d51c62fc8b55') return true;
    if (currentDeckKey === '2c10c41f-de54-407a-a6e0-a1475b0f2d33' && s.deck_id === 'deck_wife_business_trip') return true;
    if (currentDeckKey === 'deck_wife_business_trip' && s.deck_id === '2c10c41f-de54-407a-a6e0-a1475b0f2d33') return true;
    if (currentDeck?.title && s.deck_title) {
      if (s.deck_title === currentDeck.title) return true;
      if (s.deck_title.includes(currentDeck.title) || currentDeck.title.includes(s.deck_title)) return true;
    }
    return false;
  };

  const deckSaves = savedConversations.filter(isMatchDeck);

  const handleSelectSave = async (convId: string) => {
    const data = await fetchConversation(convId);
    if (data && data.history) {
      setCurrentConversationId(data.id);
      setConversationHistory(data.history);
      if (onClose) onClose();
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
        // 检查当前剧本是否还有其他剩余存档
        const remaining = (useAppStore.getState().savedConversations || []).filter(isMatchDeck);
        if (remaining.length > 0) {
          const nextData = await fetchConversation(remaining[0].id);
          if (nextData && nextData.history) {
            setCurrentConversationId(nextData.id);
            setConversationHistory(nextData.history);
            return;
          }
        }

        // 无剩余存档，重置为主界面初始开局状态
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
    <>
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

      {notice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl bg-[#1b1c28] border border-purple-500/40 text-xs text-gray-100 shadow-xl shadow-black/40 max-w-[90vw] text-center">
          {notice}
        </div>
      )}

      <aside className="scenario-sidebar w-64 sm:w-72 shrink-0 h-screen sticky top-0 bg-[#121319] border-r border-[#20222e] flex flex-col justify-between py-4 px-3.5 z-30 select-none overflow-y-auto">
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
            <div className="flex items-center gap-1">
              <span className="scenario-badge px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1e202c] text-pink-300 border border-pink-500/20">
                SCENARIO
              </span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#202230] md:hidden cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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

        {/* Quick Action Button: 作品详情与人物设定 (弹窗直达) */}
        <div className="pt-1">
          <button
            onClick={() => {
              if (onOpenDeckDetail) onOpenDeckDetail();
              else if (onOpenHandbook) onOpenHandbook();
              if (onClose) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white transition cursor-pointer flex items-center justify-between text-xs font-semibold shadow-xs group"
            title="查看作者专属排版作品详情、故事世界观与人物设定卡"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>作品详情与人物卡</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400/80 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Action Button: 世界书与背景设定 (弹窗直达) */}
          <button
            onClick={() => {
              if (onOpenLorebook) onOpenLorebook();
              if (onClose) onClose();
            }}
            className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white transition cursor-pointer flex items-center justify-between text-xs font-semibold shadow-xs group"
            title="查看剧本世界观设定、背景词条与全景世界书 (Lorebook)"
          >
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>世界书与背景档案</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="border-t border-[#1e202b] pt-3" />

        {/* Conversation List Header */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold text-gray-200 flex items-center gap-1">
            <span>会话列表</span>
            <span className="text-[11px] text-gray-500 font-mono">({deckSaves.length})</span>
          </span>
          <div className="flex items-center gap-1">
            {/* 导入对话存档：把本地聊过的会话连剧本一起搬过来继续聊 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="p-1 rounded-md text-gray-400 hover:text-sky-300 hover:bg-sky-950/40 transition cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              title="导入对话存档（.json，含剧本设定）"
            >
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            </button>
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-gray-300 transition" />
          </div>
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
                    onClick={(e) => handleExport(e, conv.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-sky-300 hover:bg-sky-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="导出该存档（含剧本设定，可导入到其他服务器继续聊）"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer"
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
    </>
  );
}
