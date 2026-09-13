"use client";

import React from 'react';
import Link from 'next/link';
import { PlazaCard } from '@/lib/types';
import { Star, Flame, Eye, User, Sparkles } from 'lucide-react';

export function StoryCard({ card }: { card: PlazaCard }) {
  const isCoser = card.id === 'deck_coser_sister';
  const isModifier = card.id === 'deck_reality_modifier';

  return (
    <Link
      href={`/chat/${card.id}`}
      className={`group relative rounded-2xl overflow-hidden bg-[#171821] border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between cursor-pointer ${
        isCoser
          ? 'border-pink-500/30 hover:border-pink-400 shadow-[0_4px_20px_rgba(244,114,182,0.12)]'
          : isModifier
          ? 'border-purple-500/30 hover:border-purple-400 shadow-[0_4px_20px_rgba(168,85,247,0.12)]'
          : 'border-[#272936] hover:border-amber-500/60 shadow-lg'
      }`}
    >
      {/* Top Banner / Cover */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0d0e14]">
        {card.cover_image ? (
          <img
            src={card.cover_image}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1d1f2c] to-[#12131a] text-4xl">
            {isCoser ? '🎀' : isModifier ? '📱' : '📖'}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#171821] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>{card.rating || '9.9'}</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-pink-300 border border-pink-500/40 flex items-center gap-1">
            <Flame className="w-3 h-3 text-pink-400" />
            <span>{card.heat || '5000+ 亿'}</span>
          </span>
        </div>

        {/* Category Pill */}
        {card.category && (
          <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded-md bg-[#252834]/80 text-[10px] text-gray-300 backdrop-blur-md border border-gray-700/50">
            {card.category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-bold text-sm text-gray-100 group-hover:text-amber-300 transition line-clamp-1">
            {card.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {card.desc || '沉浸式角色扮演推演剧本'}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {((Array.isArray(card.tags) && card.tags.length > 0) ? card.tags : ['日常', '剧情'])
            .slice(0, 3)
            .map((tag: any, i: number) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-[#20222d] text-[10px] text-gray-400 border border-[#2e3140]"
              >
                #{typeof tag === 'string' ? tag : tag.name || String(tag)}
              </span>
            ))}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#252834] flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{card.author || 'AI风月'}</span>
          </span>
          <span className="text-pink-400 font-bold group-hover:translate-x-1 transition flex items-center gap-0.5 text-[11px]">
            <span>开启推演</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
