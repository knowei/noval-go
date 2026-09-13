"use client";

import React from 'react';
import { Search, X, Flame } from 'lucide-react';

interface SearchBarProps {
  keyword: string;
  setKeyword: (val: string) => void;
  onSearch: (val: string) => void;
}

const HOT_TAGS = ['妹妹', '修改器', '纯爱', '洛丽塔', '破甲', '反差', '夕月'];

export function SearchBar({ keyword, setKeyword, onSearch }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-2.5">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="全库搜索剧本名称、作者、角色或特色标签..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#181a24] border border-[#2c2f3e] focus:border-amber-500/80 text-gray-100 placeholder-gray-500 text-xs sm:text-sm outline-none shadow-xl transition"
        />
        {keyword && (
          <button
            onClick={() => {
              setKeyword('');
              onSearch('');
            }}
            className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hot search pills */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-400">
        <span className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>热搜剧本:</span>
        </span>
        {HOT_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setKeyword(tag);
              onSearch(tag);
            }}
            className="px-2.5 py-0.5 rounded-full bg-[#1b1d28] hover:bg-[#252838] border border-[#2d3040] hover:border-amber-500/50 text-[11px] text-gray-300 hover:text-amber-300 transition cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
