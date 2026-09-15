"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Plus,
  Trash2,
  Tag,
  Search,
  Check,
  Flame,
  Shield,
  MapPin,
  User,
  Package,
  Scroll
} from 'lucide-react';
import { LoreEntry, StoryDeck } from '@/lib/types';
import { DEFAULT_LOREBOOKS } from '@/lib/lorebookEngine';

interface LorebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  deck?: StoryDeck | null;
  activeEntries?: LoreEntry[];
}

export function LorebookModal({
  isOpen,
  onClose,
  deckId,
  deck,
  activeEntries = []
}: LorebookModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newKeys, setNewKeys] = useState('');
  const [newCategory, setNewCategory] = useState<LoreEntry['category']>('character');
  const [newContent, setNewContent] = useState('');

  // Custom user lore entries stored in localStorage
  const storageKey = `novel_lorebook_${deckId}`;
  const [customEntries, setCustomEntries] = useState<LoreEntry[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setCustomEntries(JSON.parse(saved));
        }
      } catch (e) {}
    }
  }, [storageKey]);

  const saveCustomEntries = (entries: LoreEntry[]) => {
    setCustomEntries(entries);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(entries));
      } catch (e) {}
    }
  };

  // Combine default entries + deck entries + custom entries
  const allEntries: LoreEntry[] = useMemo(() => {
    const builtin = DEFAULT_LOREBOOKS[deckId] || [];
    const deckSpecific = deck?.lorebook || [];
    
    // De-duplicate by ID
    const map = new Map<string, LoreEntry>();
    builtin.forEach((e) => map.set(e.id, e));
    deckSpecific.forEach((e) => map.set(e.id, e));
    customEntries.forEach((e) => map.set(e.id, e));
    return Array.from(map.values());
  }, [deckId, deck, customEntries]);

  const activeIdSet = useMemo(() => {
    return new Set(activeEntries.map((e) => e.id));
  }, [activeEntries]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      // Category filter
      if (activeCategory === 'active') {
        if (!activeIdSet.has(entry.id)) return false;
      } else if (activeCategory !== 'all') {
        if (entry.category !== activeCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchContent = entry.content.toLowerCase().includes(q);
        const matchKeys = entry.keys.some((k) => k.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchKeys) return false;
      }

      return true;
    });
  }, [allEntries, activeCategory, searchQuery, activeIdSet]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newKeys.trim()) return;

    const keysArray = newKeys
      .split(/[,，\s]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    const newEntry: LoreEntry = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      keys: keysArray,
      category: newCategory,
      content: newContent.trim(),
      enabled: true
    };

    const next = [newEntry, ...customEntries];
    saveCustomEntries(next);

    // Reset form
    setNewTitle('');
    setNewKeys('');
    setNewContent('');
    setIsAddingNew(false);
  };

  const handleDeleteCustom = (id: string) => {
    const next = customEntries.filter((e) => e.id !== id);
    saveCustomEntries(next);
  };

  if (!isOpen) return null;

  const categoryIcons: Record<string, React.ReactNode> = {
    character: <User className="w-3.5 h-3.5 text-pink-400" />,
    item: <Package className="w-3.5 h-3.5 text-amber-400" />,
    location: <MapPin className="w-3.5 h-3.5 text-emerald-400" />,
    rule: <Scroll className="w-3.5 h-3.5 text-indigo-400" />,
    secret: <Shield className="w-3.5 h-3.5 text-purple-400" />
  };

  const categoryLabels: Record<string, string> = {
    character: '人物',
    item: '物品',
    location: '场景',
    rule: '法则',
    secret: '隐秘'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-neutral-100">
                  世界书与背景档案库 (Lorebook)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {allEntries.length} 词条
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                剧本：《{deck?.title || '当前推演'}》· 对话命中关键词时自动作为隐秘事实注入AI上下文
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="px-5 py-3 border-b border-neutral-800/80 bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-neutral-200 text-neutral-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              全部 ({allEntries.length})
            </button>
            <button
              onClick={() => setActiveCategory('active')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCategory === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              当前轮次激活 ({activeIdSet.size})
            </button>
            {(['character', 'item', 'location', 'rule', 'secret'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="搜索设定/关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950/80 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/60"
              />
            </div>

            {/* Add button */}
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>自定义词条</span>
            </button>
          </div>
        </div>

        {/* Add Entry Form Drawer (if open) */}
        {isAddingNew && (
          <form
            onSubmit={handleAddCustom}
            className="p-4 mx-5 my-3 bg-neutral-950/90 border border-indigo-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                新增自定义世界书设定
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-neutral-500 hover:text-neutral-300 text-xs"
              >
                取消
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">设定名称 / 标题</label>
                <input
                  type="text"
                  required
                  placeholder="例如：苏晓染的童年弱点"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">词条类别</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="character">人物 (Character)</option>
                  <option value="item">道具 (Item)</option>
                  <option value="location">场景 (Location)</option>
                  <option value="rule">规则/设定 (Rule)</option>
                  <option value="secret">密辛 (Secret)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">触发关键词 (逗号或空格隔开)</label>
                <input
                  type="text"
                  required
                  placeholder="例如：弱点, 胎记, 怕黑, 秘密"
                  value={newKeys}
                  onChange={(e) => setNewKeys(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">设定详细内容 (当关键词命中时，AI 将强制谨记并遵循)</label>
              <textarea
                required
                rows={2}
                placeholder="详细描写该设定的真实情况、因果关系或不能违背的底线..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md transition-colors"
              >
                保存此词条
              </button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-neutral-800/50">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-neutral-500">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无匹配的世界书词条</p>
              <p className="text-xs mt-1 text-neutral-600">尝试切换类别或输入更简短的关键词搜索</p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isActive = activeIdSet.has(entry.id);
              const isCustom = entry.id.startsWith('custom_');

              return (
                <div
                  key={entry.id}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-emerald-950/20 border border-emerald-500/30'
                      : 'hover:bg-neutral-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-medium">
                        {categoryIcons[entry.category || 'rule']}
                        {categoryLabels[entry.category || 'rule']}
                      </span>
                      <h4 className="text-sm font-medium text-neutral-100">
                        {entry.title}
                      </h4>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" />
                          当前轮次已触发
                        </span>
                      )}
                      {isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          玩家自定义
                        </span>
                      )}
                    </div>

                    {isCustom && (
                      <button
                        onClick={() => handleDeleteCustom(entry.id)}
                        className="text-neutral-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="删除自定义词条"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Trigger Keys */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <Tag className="w-3 h-3 text-neutral-500" />
                    <span className="text-[11px] text-neutral-500">触发词:</span>
                    {entry.keys.map((key, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 font-mono"
                      >
                        {key}
                      </span>
                    ))}
                  </div>

                  {/* Content */}
                  <p className="mt-2 text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/60 font-sans">
                    {entry.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-500">
          <div>
            💡 当您在输入框发言或剧情推进包含对应触发词时，该背景将无缝注入 AI 决策层，彻底杜绝失忆。
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
