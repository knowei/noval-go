"use client";

import React, { useEffect, useState } from 'react';
import { fetchPlazaFeatured, fetchPlazaCategories } from '@/lib/api';
import { PlazaCard } from '@/lib/types';
import { StoryCard } from '@/components/plaza/StoryCard';
import { SearchBar } from '@/components/plaza/SearchBar';
import { Sparkles, Compass, Flame, TrendingUp, Layers } from 'lucide-react';
import Link from 'next/link';

export default function PlazaPage() {
  const [cards, setCards] = useState<PlazaCard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = async (searchKw: string = '') => {
    setIsLoading(true);
    const data = await fetchPlazaFeatured(searchKw);
    setCards(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlazaCategories().then(setCategories);
    loadCards();
  }, []);

  const categoryList = Array.from(
    new Set([
      '全部',
      ...categories.map((c: any) => (typeof c === 'string' ? c : c.name || '')),
    ])
  ).filter(Boolean);

  const filteredCards = cards.filter((c) => {
    if (activeCategory === '全部') return true;
    return c.category === activeCategory;
  });

  return (
    <div className="flex-1 p-3 sm:p-8 pt-16 md:pt-6 pb-20 md:pb-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#201026] via-[#161224] to-[#121626] border border-pink-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>今日头条独占神作 · AI风月高定</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-mono">
            我的绝美coser萝莉妹妹
            <span className="block text-base sm:text-lg font-normal text-pink-300/80 mt-1 font-sans">
              超低消耗 · 兄妹同居 · 双轨心理解构 · 开放式叙事
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            她在网上有几千个粉丝，但她换好每一套戏服第一个跑出来给你看。
            她说“可以只穿给你一个人看”的时候，声音很轻——她在试探一个她最想要的答案。
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/chat/deck_coser_sister"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <span>立即开卷 · 进入第一幕《她回来了》</span>
              <span>➔</span>
            </Link>

            <Link
              href="/chat/deck_reality_modifier"
              className="px-4 py-2.5 rounded-xl bg-[#202230] hover:bg-[#282a3c] border border-gray-700 hover:border-gray-500 text-gray-200 text-xs font-medium transition cursor-pointer"
            >
              体验《现实修改器》
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar with Hot Pills */}
      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onSearch={(kw) => loadCards(kw)}
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#232532] pb-3">
        {categoryList.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/20'
                : 'bg-[#181a24] text-gray-400 hover:text-white hover:bg-[#202330]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5 font-bold text-gray-200">
            <TrendingUp className="w-4 h-4 text-pink-400" />
            <span>精选推荐剧本（共 {filteredCards.length} 部）</span>
          </span>
          <span>点击卡片即可直接进入专属沉浸剧场</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-[#161720] border border-[#262834] animate-pulse" />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            未找到与“{keyword}”匹配的剧本，换个关键词试试看吧~
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCards.map((card) => (
              <StoryCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
