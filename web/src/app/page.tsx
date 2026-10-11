"use client";

import React, { useEffect, useState } from 'react';
import { fetchPlazaFeatured } from '@/lib/api';
import { PlazaCard } from '@/lib/types';
import { StoryCard } from '@/components/plaza/StoryCard';
import { SearchBar } from '@/components/plaza/SearchBar';
import { Sparkles, Compass, Flame, TrendingUp, Layers } from 'lucide-react';
import Link from 'next/link';
import { PrivateCardLibrary } from '@/components/plaza/PrivateCardLibrary';
import { HeroRecommendationBanner } from '@/components/plaza/HeroRecommendationBanner';

export default function PlazaPage() {
  const [cards, setCards] = useState<PlazaCard[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const THEME_CATEGORIES = [
    '全部',
    '🔥 热门推荐',
    '⚓ 碧蓝航线',
    '🎀 纯爱甜宠',
    '🏙️ 都市同居',
    '⚡ 反差破甲',
    '👻 艳尸/悬疑',
    '📱 现实掌控',
    '👩‍👧 熟女母女',
    '🌸 二次元骨科'
  ];

  const loadCards = async (searchKw: string = '') => {
    setIsLoading(true);
    const data = await fetchPlazaFeatured(searchKw);
    setCards(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCards();
  }, []);

  const matchCategory = (card: PlazaCard, cat: string) => {
    if (cat === '全部') return true;
    const cleanCat = cat.replace(/^[^\w\u4e00-\u9fa5]+/, '').trim();

    if (cleanCat === '热门推荐') {
      return card.is_featured === 1 || Number(card.rating || '5.0') >= 9.8;
    }

    const themeKeywords: Record<string, string[]> = {
      '碧蓝航线': ['碧蓝', '舰娘', '指挥官', '母港', '初月', '大凤', '欧根', '二次元'],
      '纯爱甜宠': ['纯爱', '甜宠', '同桌', '恋爱', '可爱', '情侣', '37.1℃', '试衣'],
      '都市同居': ['都市', '同居', '合租', '借住', '租房', '公寓', '便利店', '家政'],
      '反差破甲': ['反差', '破甲', '求饶', '冷萌', '高潮', '学妹', '傲娇', '大冒险'],
      '艳尸/悬疑': ['艳尸', '中式恐怖', '还魂夜', '规则怪谈', '悬疑', '榨精', '绫音', '尸'],
      '现实掌控': ['修改器', '现实修改', '掌控', '因果律', '全知全能', '支配', '金手指'],
      '熟女母女': ['家政', '熟女', '母女', '贵妇', '水汇', '理疗', '母亲', '姑姑'],
      '二次元骨科': ['妹妹', '姐姐', '兄妹', '骨科', 'coser', '缘之空', '禁忌', '禁断', '悠月', '表妹', '二次元']
    };

    const keywords = themeKeywords[cleanCat] || [cleanCat];

    // 1. Direct category match
    if (card.category && (card.category === cleanCat || keywords.includes(card.category))) {
      return true;
    }

    // 2. Tags match
    const tags = Array.isArray(card.tags) ? card.tags : [];
    for (const tag of tags) {
      const tagStr = typeof tag === 'string' ? tag : (tag as any).name || '';
      if (keywords.some(kw => tagStr.includes(kw) || kw.includes(tagStr))) {
        return true;
      }
    }

    // 3. Title or Desc match
    const content = `${card.title || ''} ${card.desc || ''}`;
    if (keywords.some(kw => content.includes(kw))) {
      return true;
    }

    return false;
  };

  const filteredCards = cards.filter((c) => matchCategory(c, activeCategory));

  return (
    <div className="flex-1 p-3 sm:p-8 pt-16 md:pt-6 pb-20 md:pb-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      <PrivateCardLibrary />
      {/* Hero Recommendation Banner (动态精品轮播推荐) */}
      <HeroRecommendationBanner cards={cards} />

      {/* Search Bar with Hot Pills */}
      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onSearch={(kw) => loadCards(kw)}
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#232532] pb-3">
        {THEME_CATEGORIES.map((cat) => (
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
