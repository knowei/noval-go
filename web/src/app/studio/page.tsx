"use client";

import React, { useState } from 'react';
import { Sparkles, Feather, Wand2, Eye, Play, Save, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudioPage() {
  const router = useRouter();
  const [templateType, setTemplateType] = useState<'basic' | 'beautified'>('beautified');

  const [title, setTitle] = useState('【纯爱破防】雨夜留宿的合租室友');
  const [badge, setBadge] = useState('🔥 独家首发 · 心理解构');
  const [category, setCategory] = useState('都市');
  const [tags, setTags] = useState('合租, 破甲, 双轨解构, 暴雨夜');
  const [desc, setDesc] = useState(
    '突如其来的暴雨淹没了回家的末班车。她浑身湿透站在门前，睫毛上挂着水珠：“那个……我今晚能在你这儿借宿一晚吗？”'
  );
  const [firstTurnStory, setFirstTurnStory] = useState(
    `玄关的感应灯亮起暖黄的微光。
她有些局促地脱下湿漉漉的小白鞋，白皙细腻的小脚在微凉的地板上缩了缩。
“那个……毛巾在哪里呀？我衣服有点湿……”
她双手护在胸前，薄薄的白衬衫被雨水打湿后紧紧贴在身上，隐约透出少女优美纤细的锁骨弧度。`
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAndTest = async () => {
    const deckId = 'deck_' + Date.now();
    const payload = {
      id: deckId,
      title: title.trim(),
      badge: badge.trim(),
      category: category.trim(),
      desc: desc.trim(),
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      firstTurnDemo: {
        isUser: false,
        location: '合租公寓 · 暖黄微光的玄关',
        story: firstTurnStory.trim(),
        branches: [
          { tag: 'A', title: '递上干燥浴巾', desc: '从浴室拿出刚烘干的毛巾裹住她微颤的肩膀' },
          { tag: 'B', title: '倒一杯热姜茶', desc: '转身去厨房替她冲泡驱寒的姜茶' },
          { tag: 'C', title: '找一套宽松卫衣', desc: '去衣柜拿出自己宽大的卫衣递给她换洗' }
        ]
      }
    };

    try {
      const resp = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        setSavedSuccess(true);
        setTimeout(() => {
          router.push(`/chat/${deckId}`);
        }, 800);
      }
    } catch (e) {
      console.error('Save story error:', e);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-8 pt-16 md:pt-6 pb-20 md:pb-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252836] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
            <Feather className="w-3.5 h-3.5" />
            <span>剧本创作工坊 · 快速起卡工厂</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-100 font-mono">
            创作与构建你的沉浸式剧本
          </h1>
          <p className="text-xs text-gray-400">
            支持基础白模开卡与高定美化皮肤模版，一键推演与自测
          </p>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center gap-2 bg-[#191b26] p-1 rounded-xl border border-[#2b2e3e]">
          <button
            onClick={() => setTemplateType('basic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              templateType === 'basic'
                ? 'bg-[#282b3a] text-gray-100 shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ⚪ 基础白模版
          </button>
          <button
            onClick={() => setTemplateType('beautified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              templateType === 'beautified'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-pink-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ 高定美化版</span>
          </button>
        </div>
      </div>

      {/* Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">剧本标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs sm:text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">特色徽标 Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-300 mb-1.5">题材分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 outline-none"
                >
                  <option value="都市">都市</option>
                  <option value="同人">同人</option>
                  <option value="科幻">科幻</option>
                  <option value="恋爱">恋爱</option>
                  <option value="悬疑">悬疑</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">故事前情与简介</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">第一幕开局沉浸描写</label>
              <textarea
                rows={5}
                value={firstTurnStory}
                onChange={(e) => setFirstTurnStory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Preview & Action */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <h3 className="font-bold text-xs text-gray-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-pink-400" />
              <span>实时卡片预览</span>
            </h3>

            <div className="p-4 rounded-xl bg-[#1c1d29] border border-[#2e3144] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {badge}
                </span>
                <span className="text-gray-500 font-mono">预览模式</span>
              </div>
              <h4 className="font-bold text-sm text-gray-100">{title}</h4>
              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{desc}</p>
            </div>

            <button
              onClick={handleSaveAndTest}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 transition cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已保存！正在跳转推演舞台...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>发布并立即进入推演测试</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
