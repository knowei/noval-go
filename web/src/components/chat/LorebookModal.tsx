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
import { DEFAULT_LOREBOOKS, getDeckLorebook } from '@/lib/lorebookEngine';

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
    const builtin = getDeckLorebook(deckId, deck?.lorebook);
    
    // De-duplicate by ID
    const map = new Map<string, LoreEntry>();
    builtin.forEach((e) => map.set(e.id, e));
    if (deck?.lorebook && Array.isArray(deck.lorebook)) {
      deck.lorebook.forEach((e) => map.set(e.id, e));
    }
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
    character: <User className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />,
    item: <Package className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />,
    location: <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />,
    rule: <Scroll className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
    secret: <Shield className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
  };

  const categoryLabels: Record<string, string> = {
    character: '人物',
    item: '物品',
    location: '场景',
    rule: '法则',
    secret: '隐秘'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="lorebook-modal relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all duration-300 bg-[var(--app-card-bg,#141620)] border-[var(--app-card-border,#282a3c)] text-[var(--app-text-main,#f1f5f9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--app-card-border,#252836)] bg-[var(--app-card-bg-subtle,#161722)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--app-text-main,#f1f5f9)]">
                  世界书与背景档案库 (Lorebook)
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-semibold">
                  {allEntries.length} 词条
                </span>
              </div>
              <p className="text-xs text-[var(--app-text-muted,#94a3b8)] mt-0.5">
                剧本：《{deck?.title || '当前推演'}》· 对话命中关键词时自动作为隐秘事实注入AI上下文
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
            title="关闭世界书"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="px-5 py-3 border-b border-[var(--app-card-border,#252836)] bg-[var(--app-card-bg-subtle,#161722)]/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              全部 ({allEntries.length})
            </button>
            <button
              onClick={() => setActiveCategory('active')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-[var(--app-text-muted,#94a3b8)] hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>当前轮次激活 ({activeIdSet.size})</span>
            </button>
            {(['character', 'item', 'location', 'rule', 'secret'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {categoryIcons[cat]}
                <span>{categoryLabels[cat]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--app-text-dim,#94a3b8)] pointer-events-none" />
              <input
                type="text"
                placeholder="搜索设定/关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--app-input-bg,#12131b)] border border-[var(--app-input-border,#282a3a)] rounded-lg text-[var(--app-text-main,#f1f5f9)] placeholder:text-[var(--app-text-dim,#94a3b8)] focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Add button */}
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shrink-0 shadow-xs active:scale-95"
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
            className="p-4 mx-5 my-3 bg-[var(--app-card-bg-subtle,#161722)] border border-indigo-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-md shrink-0"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                新增自定义世界书设定
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-[var(--app-text-muted,#94a3b8)] hover:text-[var(--app-text-main,#f1f5f9)] text-xs cursor-pointer"
              >
                取消
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[var(--app-text-muted,#94a3b8)] block mb-1">设定名称 / 标题</label>
                <input
                  type="text"
                  required
                  placeholder="例如：苏晓染的童年弱点"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[var(--app-input-bg,#12131b)] border border-[var(--app-input-border,#282a3a)] rounded-lg text-[var(--app-text-main,#f1f5f9)] placeholder:text-[var(--app-text-dim,#94a3b8)] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--app-text-muted,#94a3b8)] block mb-1">词条类别</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[var(--app-input-bg,#12131b)] border border-[var(--app-input-border,#282a3a)] rounded-lg text-[var(--app-text-main,#f1f5f9)] focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="character">人物 (Character)</option>
                  <option value="item">道具 (Item)</option>
                  <option value="location">场景 (Location)</option>
                  <option value="rule">规则/设定 (Rule)</option>
                  <option value="secret">密辛 (Secret)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[var(--app-text-muted,#94a3b8)] block mb-1">触发关键词 (逗号或空格隔开)</label>
                <input
                  type="text"
                  required
                  placeholder="例如：弱点, 胎记, 怕黑, 秘密"
                  value={newKeys}
                  onChange={(e) => setNewKeys(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[var(--app-input-bg,#12131b)] border border-[var(--app-input-border,#282a3a)] rounded-lg text-[var(--app-text-main,#f1f5f9)] placeholder:text-[var(--app-text-dim,#94a3b8)] focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-[var(--app-text-muted,#94a3b8)] block mb-1">设定详细内容 (当关键词命中时，AI 将强制谨记并遵循)</label>
              <textarea
                required
                rows={2}
                placeholder="详细描写该设定的真实情况、因果关系或不能违背的底线..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[var(--app-input-bg,#12131b)] border border-[var(--app-input-border,#282a3a)] rounded-lg text-[var(--app-text-main,#f1f5f9)] placeholder:text-[var(--app-text-dim,#94a3b8)] focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-xs transition cursor-pointer"
              >
                保存此词条
              </button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-[var(--app-card-border,#252836)]/50 no-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-[var(--app-text-muted,#94a3b8)]">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-[var(--app-text-dim,#64748b)]" />
              <p className="text-sm font-medium">暂无匹配的世界书词条</p>
              <p className="text-xs mt-1 text-[var(--app-text-dim,#64748b)]">尝试切换类别或输入更简短的关键词搜索</p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isActive = activeIdSet.has(entry.id);
              const isCustom = entry.id.startsWith('custom_');

              return (
                <div
                  key={entry.id}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/20'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[var(--app-text-sub,#334155)] border border-[var(--app-card-border,#e2e8f0)] font-medium">
                        {categoryIcons[entry.category || 'rule']}
                        <span>{categoryLabels[entry.category || 'rule']}</span>
                      </span>
                      <h4 className="text-sm font-semibold text-[var(--app-text-main,#0f172a)]">
                        {entry.title}
                      </h4>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-500/40 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" />
                          当前轮次已触发
                        </span>
                      )}
                      {isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-medium">
                          玩家自定义
                        </span>
                      )}
                    </div>

                    {isCustom && (
                      <button
                        onClick={() => handleDeleteCustom(entry.id)}
                        className="text-[var(--app-text-dim,#94a3b8)] hover:text-red-500 p-1 rounded transition cursor-pointer"
                        title="删除自定义词条"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Trigger Keys */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <Tag className="w-3 h-3 text-[var(--app-text-dim,#94a3b8)]" />
                    <span className="text-[11px] text-[var(--app-text-muted,#94a3b8)]">触发词:</span>
                    {entry.keys.map((key, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[var(--app-card-border,#e2e8f0)] text-[var(--app-text-sub,#334155)] font-mono"
                      >
                        {key}
                      </span>
                    ))}
                  </div>

                  {/* Content */}
                  <p className="mt-2 text-xs text-[var(--app-text-sub,#334155)] leading-relaxed bg-[var(--app-card-bg-subtle,#f8fafd)] p-3 rounded-lg border border-[var(--app-card-border,#e2e8f0)] font-sans">
                    {entry.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--app-card-border,#252836)] bg-[var(--app-card-bg-subtle,#161722)] flex items-center justify-between gap-3 text-xs text-[var(--app-text-muted,#94a3b8)] shrink-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span>💡</span>
            <span>当您在发言中提到设定关键词时，该档案将作为世界观真实规律无缝注入 AI 决策层。</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--app-card-bg,#ffffff)] border border-[var(--app-card-border,#cbd5e1)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--app-text-main,#0f172a)] rounded-xl transition font-medium cursor-pointer shrink-0"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
