"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { PlazaCard } from '@/lib/types';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Users,
  Dices,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface HeroRecommendationBannerProps {
  cards: PlazaCard[];
}

export function HeroRecommendationBanner({ cards }: HeroRecommendationBannerProps) {
  // 筛选出高评分或精选的候选推荐池（排除空卡）
  const candidateCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];

    // 优先：包含最新导入的幼儿媛、江砚雪、coser妹妹以及评分>=9.3的高热度神作
    const topPicks = cards.filter((c) => {
      const r = parseFloat(c.rating || '0');
      const heatNum = parseInt((c.heat || '').replace(/[^\d]/g, '') || '0', 10);
      return (
        c.is_featured === 1 ||
        r >= 9.3 ||
        heatNum > 5000 ||
        c.id === '7a192c83-3f8b-43f9-add9-18173c521104' ||
        c.id === '7e0efc4b-ee24-4481-8f38-618e6f23ecd0' ||
        c.id === 'deck_coser_sister'
      );
    });

    if (topPicks.length >= 3) {
      return topPicks.slice(0, 12);
    }
    return cards.slice(0, 8);
  }, [cards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 保证索引有效
  const activeIndex = candidateCards.length > 0 ? currentIndex % candidateCards.length : 0;
  const currentCard = candidateCards[activeIndex];

  // 自动轮播（8秒切换，鼠标悬浮时暂停）
  useEffect(() => {
    if (candidateCards.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candidateCards.length);
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [candidateCards.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + candidateCards.length) % candidateCards.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % candidateCards.length);
  };

  const handleRandom = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (candidateCards.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * candidateCards.length);
    if (nextIdx === activeIndex) {
      nextIdx = (nextIdx + 1) % candidateCards.length;
    }
    setCurrentIndex(nextIdx);
  };

  if (!currentCard) {
    return (
      <div className="relative rounded-3xl overflow-hidden bg-[#161224] border border-pink-500/20 p-8 sm:p-10 text-center text-gray-400 animate-pulse">
        精选推荐加载中…
      </div>
    );
  }

  const tags = Array.isArray(currentCard.tags) ? currentCard.tags : [];
  const cardUrl = `/chat/${currentCard.deckKey || currentCard.id}`;
  const badgeText = currentCard.badge || (tags[0] ? `${tags[0]}精选` : '今日重磅推荐');
  const ratingText = currentCard.rating || '9.8';
  const heatText = currentCard.heat || '热门畅玩';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="hero-recommendation-banner relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1c1226] via-[#161426] to-[#121626] border border-pink-500/30 p-6 sm:p-10 shadow-2xl transition-all duration-500 group"
    >
      {/* 渐变氛围背景光圈 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 封面壁纸微透底纹（若存在） */}
      {currentCard.cover_image && (
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none transition-all duration-700 scale-105 group-hover:scale-100"
          style={{ backgroundImage: `url(${currentCard.cover_image})` }}
        />
      )}

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* 左侧主要文案信息 */}
        <div className="max-w-3xl space-y-3.5">
          {/* 顶栏特色徽章与热度 */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>今日头条推荐 · {badgeText}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{ratingText} 分</span>
            </span>

            {currentCard.heat && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>{heatText}</span>
              </span>
            )}

            {currentCard.author && (
              <span className="text-gray-400 text-[11px] ml-1">
                作者：<strong className="text-gray-300 font-medium">{currentCard.author}</strong>
              </span>
            )}
          </div>

          {/* 标题与副标题 */}
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-mono leading-tight">
            <Link href={cardUrl} className="hover:text-pink-300 transition-colors">
              {currentCard.title}
            </Link>
          </h1>

          {/* 标签串 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {tags.slice(0, 6).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#251e36] text-pink-200/90 text-[11px] border border-pink-500/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* 故事简介 */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3 max-w-2xl">
            {currentCard.desc || '扣人心弦的情绪拉扯与高自由度叙事，进入专属剧场探索未知可能……'}
          </p>

          {/* 底部按钮栏 */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={cardUrl}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition cursor-pointer flex items-center gap-2 group/btn"
            >
              <span>立即开卷 · 开启沉浸推演</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>

            <button
              onClick={handleRandom}
              title="换一部随机推荐"
              className="px-4 py-2.5 rounded-xl bg-[#202230] hover:bg-[#2a2d40] border border-gray-700 hover:border-pink-500/40 text-gray-200 hover:text-pink-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Dices className="w-3.5 h-3.5 text-pink-400" />
              <span>换一部看看</span>
            </button>
          </div>
        </div>

        {/* 右侧：轮播控制器与卡片缩略预览 */}
        <div className="flex lg:flex-col items-center justify-between w-full lg:w-auto gap-4 shrink-0 pt-2 lg:pt-0">
          {/* 上一部 / 下一部 翻页按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              title="上一部推荐"
              className="p-2 rounded-xl bg-[#1d1b2a] hover:bg-pink-950/60 border border-gray-700 hover:border-pink-500/60 text-gray-300 hover:text-pink-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-gray-400 px-1 select-none">
              {activeIndex + 1} / {candidateCards.length}
            </span>
            <button
              onClick={handleNext}
              title="下一部推荐"
              className="p-2 rounded-xl bg-[#1d1b2a] hover:bg-pink-950/60 border border-gray-700 hover:border-pink-500/60 text-gray-300 hover:text-pink-200 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 轮播圆点快速直达 */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] py-1">
            {candidateCards.map((c, i) => (
              <button
                key={c.id || i}
                onClick={() => setCurrentIndex(i)}
                title={c.title}
                className={`transition-all rounded-full cursor-pointer ${
                  i === activeIndex
                    ? 'w-6 h-2 bg-gradient-to-r from-pink-500 to-purple-500'
                    : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
