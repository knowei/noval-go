"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Feather,
  Wand2,
  Eye,
  Play,
  Save,
  Check,
  Plus,
  Trash2,
  Code2,
  BookOpen,
  Layout,
  Palette,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  generateCustomHtmlCard,
  CharacterRole,
  ScenarioMechanism,
  OpeningChoice
} from '@/lib/htmlCardGenerator';

export default function StudioPage() {
  const router = useRouter();

  // Active Tab: 'form' | 'preview' | 'code'
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'code'>('form');

  // Basic info
  const [title, setTitle] = useState('【纯爱破防】雨夜留宿的合租室友');
  const [badge, setBadge] = useState('🔥 独家首发 · 心理解构');
  const [category, setCategory] = useState('都市');
  const [tags, setTags] = useState('合租, 破甲, 双轨解构, 暴雨夜');
  const [theme, setTheme] = useState<'purple' | 'pink' | 'rose' | 'cyan' | 'amber'>('purple');
  const [desc, setDesc] = useState(
    '突如其来的暴雨淹没了回家的末班车。她浑身湿透站在门前，睫毛上挂着水珠，单薄的白衬衫被雨水紧贴在身上：“那个……我今晚能在你这儿借宿一晚吗？”'
  );

  // Character profiles
  const [roles, setRoles] = useState<CharacterRole[]>([
    {
      name: '陈诗雨',
      role: '同校学妹 · 隔壁合租室友',
      desc: '平日里气质清冷端庄，不擅长主动表达好感。今晚因为暴雨误车被迫求宿，在私人空间里流露出平日罕见的娇弱与依赖。',
      appearance: '长发及腰，眼眸清澈微泛湿气，身段纤细修长，锁骨线条分明。',
      traits: '耳根极易泛红，对突如其来的靠近格外敏感，呼吸略显急促。'
    }
  ]);

  // Scenario mechanisms
  const [mechanisms, setMechanisms] = useState<ScenarioMechanism[]>([
    {
      tag: '场景',
      title: '昏黄玄关与狭小客厅',
      desc: '雨声敲击窗棂，空气中弥漫着清甜的沐浴露气息与淡淡水汽，空间私密而富有压迫感。'
    },
    {
      tag: '规则',
      title: '心房防御与微表情解构',
      desc: '每一次言语与动作都会引发角色微妙的微表情反馈与身体语言波动。'
    }
  ]);

  // Openings
  const [openings, setOpenings] = useState<OpeningChoice[]>([
    {
      tag: '主线 · 第一幕开局',
      text: '玄关感应灯微光暗淡。她低着头脱下湿透的小白鞋，白皙脚趾局促地收拢：“那个……毛巾在哪里呀？我衣服有点湿……”'
    },
    {
      tag: '走向 · 递上干燥大浴巾',
      text: '你取过一条干燥厚实的浴巾轻轻披在她微颤的双肩上，双手不经意触碰到她微凉的锁骨，她身子轻微一僵。'
    },
    {
      tag: '走向 · 倒一杯温热红茶',
      text: '“先坐下暖暖身子。”你转身端来热茶，她捧着茶杯抬起眸子，眼底满是局促却又不舍离开的软意。'
    }
  ]);

  // Generated or custom edited HTML
  const [customHtml, setCustomHtml] = useState<string>('');
  const [isHtmlDirty, setIsHtmlDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initialize generated HTML once on mount
  useEffect(() => {
    const html = generateCustomHtmlCard({
      title,
      badge,
      summary: desc,
      theme,
      roles,
      mechanisms,
      openings
    });
    setCustomHtml(html);
  }, []);

  // Handle re-generation from form state
  const handleRegenerateHtml = () => {
    const html = generateCustomHtmlCard({
      title,
      badge,
      summary: desc,
      theme,
      roles,
      mechanisms,
      openings
    });
    setCustomHtml(html);
    setIsHtmlDirty(false);
  };

  // Add role
  const handleAddRole = () => {
    setRoles((prev) => [
      ...prev,
      {
        name: `新角色 ${prev.length + 1}`,
        role: '登场人物',
        desc: '性格特征与心理描摹...',
        appearance: '身材修长，神态动人',
        traits: '专属特征或敏感点'
      }
    ]);
  };

  // Remove role
  const handleRemoveRole = (idx: number) => {
    setRoles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add mechanism
  const handleAddMech = () => {
    setMechanisms((prev) => [
      ...prev,
      {
        tag: '机制',
        title: '新机制/场景规则',
        desc: '描述该场景的互动规则或特殊反应逻辑'
      }
    ]);
  };

  // Remove mechanism
  const handleRemoveMech = (idx: number) => {
    setMechanisms((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add opening
  const handleAddOpening = () => {
    setOpenings((prev) => [
      ...prev,
      {
        tag: `走向 · 分支 ${prev.length + 1}`,
        text: '在此输入该分支的切入描写...'
      }
    ]);
  };

  // Remove opening
  const handleRemoveOpening = (idx: number) => {
    setOpenings((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save to database API & test
  const handleSaveAndTest = async () => {
    if (!title.trim()) {
      alert('请填写剧本标题');
      return;
    }

    setIsSaving(true);
    const deckId = 'deck_user_' + Date.now();

    // Ensure we have final HTML
    const finalHtml = customHtml || generateCustomHtmlCard({
      title,
      badge,
      summary: desc,
      theme,
      roles,
      mechanisms,
      openings
    });

    const payload = {
      id: deckId,
      title: title.trim(),
      badge: badge.trim(),
      category: category.trim(),
      desc: desc.trim(),
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      themeColor: theme,
      customHtml: finalHtml,
      roles: roles,
      scenes: mechanisms,
      handbook: {
        title: title.trim(),
        badge: badge.trim(),
        desc: desc.trim()
      },
      firstTurnDemo: {
        isUser: false,
        location: mechanisms[0]?.title || '故事起始点',
        story: openings[0]?.text || desc.trim(),
        branches: openings.slice(1).map((op, i) => ({
          tag: String.fromCharCode(65 + i),
          title: op.tag,
          desc: op.text.slice(0, 50) + '...'
        }))
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
        }, 600);
      } else {
        alert('保存失败，请检查网络或后端状态');
        setIsSaving(false);
      }
    } catch (e) {
      console.error('Save story error:', e);
      alert('保存异常：' + String(e));
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-8 pt-16 md:pt-6 pb-24 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252836] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1 border border-purple-500/30">
            <Feather className="w-3.5 h-3.5" />
            <span>剧本创作工坊 · 作者专属排版设计中心</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-100 font-mono">
            创作并生成你的专属剧本与设定卡
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            支持结构化填写、一键生成精美作者排版 HTML 网页、实时交互预览与直接入库
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRegenerateHtml}
            className="px-3.5 py-2 rounded-xl bg-[#202230] hover:bg-[#2b2e40] border border-[#34384e] text-purple-300 hover:text-purple-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            title="根据当前表单内容重新生成排版网页"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>一键生成排版网页</span>
          </button>

          <button
            onClick={handleSaveAndTest}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>保存入库成功，跳转中...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>保存入库并立即推演</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#252836] pb-2">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'form'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1c28]'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>📝 结构化表单设计</span>
        </button>

        <button
          onClick={() => {
            // Auto sync html when switching to preview
            if (!isHtmlDirty) handleRegenerateHtml();
            setActiveTab('preview');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1c28]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>👁️ 效果实时交互预览</span>
        </button>

        <button
          onClick={() => {
            if (!isHtmlDirty) handleRegenerateHtml();
            setActiveTab('code');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'code'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1c28]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>💻 HTML 源码微调</span>
          {isHtmlDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-400" title="已手动修改源码" />
          )}
        </button>
      </div>

      {/* TAB 1: FORM EDITOR */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>1. 剧本基本信息</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">剧本标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs sm:text-sm outline-none"
                  placeholder="例如：【纯爱破防】雨夜留宿的合租室友"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">特色徽标 Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs sm:text-sm outline-none"
                  placeholder="例如：🔥 独家首发 · 心理解构"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">题材分类</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none"
                >
                  <option value="都市">都市</option>
                  <option value="同人">同人</option>
                  <option value="科幻">科幻</option>
                  <option value="恋爱">恋爱</option>
                  <option value="悬疑">悬疑</option>
                  <option value="玄幻">玄幻</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">色系皮肤主题</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none"
                >
                  <option value="purple">💜 梦幻紫 (古典内敛)</option>
                  <option value="pink">💖 甜心粉 (浪漫纯爱)</option>
                  <option value="rose">🌹 炽热红 (张力攻防)</option>
                  <option value="cyan">💎 极客青 (科幻修改)</option>
                  <option value="amber">🍯 琥珀金 (尊享奢华)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">标签 Tags (逗号分隔)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none"
                  placeholder="合租, 破甲, 暴雨夜"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">故事前情与背景简介</label>
              <textarea
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none leading-relaxed"
                placeholder="简要描摹整个剧本的故事背景与冲突..."
              />
            </div>
          </div>

          {/* Section 2: Character Roles */}
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-400" />
                <span>2. 登场人物卡设计（将在排版网页中作为核心档案展示）</span>
              </h3>
              <button
                onClick={handleAddRole}
                className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-purple-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加人物</span>
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((r, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">人物 #{idx + 1}</span>
                    {roles.length > 1 && (
                      <button
                        onClick={() => handleRemoveRole(idx)}
                        className="text-gray-500 hover:text-red-400 text-xs transition cursor-pointer p-1"
                        title="删除此人物"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">人物姓名</label>
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => {
                          const next = [...roles];
                          next[idx].name = e.target.value;
                          setRoles(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">身份与关系</label>
                      <input
                        type="text"
                        value={r.role}
                        onChange={(e) => {
                          const next = [...roles];
                          next[idx].role = e.target.value;
                          setRoles(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">性格与心理特点</label>
                    <textarea
                      rows={2}
                      value={r.desc}
                      onChange={(e) => {
                        const next = [...roles];
                        next[idx].desc = e.target.value;
                        setRoles(next);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">外貌与体态神韵</label>
                      <input
                        type="text"
                        value={r.appearance || ''}
                        onChange={(e) => {
                          const next = [...roles];
                          next[idx].appearance = e.target.value;
                          setRoles(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none"
                        placeholder="发型、身段、锁骨、眼眸等"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">特征与敏感点细节</label>
                      <input
                        type="text"
                        value={r.traits || ''}
                        onChange={(e) => {
                          const next = [...roles];
                          next[idx].traits = e.target.value;
                          setRoles(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none"
                        placeholder="生理敏感点、害羞小习惯、心跳反应等"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Mechanisms & Scenes */}
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>3. 核心机制与场景规则设定</span>
              </h3>
              <button
                onClick={handleAddMech}
                className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加规则/场景</span>
              </button>
            </div>

            <div className="space-y-3">
              {mechanisms.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-2 relative"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.tag}
                      onChange={(e) => {
                        const next = [...mechanisms];
                        next[idx].tag = e.target.value;
                        setMechanisms(next);
                      }}
                      className="w-20 px-2.5 py-1 rounded-md bg-[#202230] border border-[#32364a] text-purple-300 text-xs font-bold outline-none text-center"
                      placeholder="标签"
                    />
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => {
                        const next = [...mechanisms];
                        next[idx].title = e.target.value;
                        setMechanisms(next);
                      }}
                      className="flex-1 px-3 py-1 rounded-md bg-[#202230] border border-[#32364a] text-gray-100 text-xs font-bold outline-none"
                      placeholder="机制名称或场景标题"
                    />
                    {mechanisms.length > 1 && (
                      <button
                        onClick={() => handleRemoveMech(idx)}
                        className="text-gray-500 hover:text-red-400 text-xs transition cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={m.desc}
                    onChange={(e) => {
                      const next = [...mechanisms];
                      next[idx].desc = e.target.value;
                      setMechanisms(next);
                    }}
                    className="w-full px-3 py-1.5 rounded-md bg-[#202230] border border-[#32364a] text-gray-300 text-xs outline-none"
                    placeholder="机制具体交互逻辑与剧情引导规则"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Openings */}
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>4. 多分支开局切入点（将在卡片上供玩家单选切入）</span>
              </h3>
              <button
                onClick={handleAddOpening}
                className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-emerald-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加分支开局</span>
              </button>
            </div>

            <div className="space-y-3">
              {openings.map((op, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={op.tag}
                      onChange={(e) => {
                        const next = [...openings];
                        next[idx].tag = e.target.value;
                        setOpenings(next);
                      }}
                      className="w-48 px-2.5 py-1 rounded-md bg-[#202230] border border-[#32364a] text-emerald-300 text-xs font-bold outline-none"
                      placeholder="开局标签"
                    />
                    {openings.length > 1 && (
                      <button
                        onClick={() => handleRemoveOpening(idx)}
                        className="text-gray-500 hover:text-red-400 text-xs transition cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={op.text}
                    onChange={(e) => {
                      const next = [...openings];
                      next[idx].text = e.target.value;
                      setOpenings(next);
                    }}
                    className="w-full px-3 py-2 rounded-md bg-[#202230] border border-[#32364a] text-gray-200 text-xs outline-none leading-relaxed"
                    placeholder="开局切入描写段落..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PREVIEW IFRAME */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-pink-400" />
              <span>实时沙盒渲染：可以直接在下方卡片中点击选项、填写玩家设定、测试【生成设定】与复制</span>
            </span>
            <button
              onClick={handleRegenerateHtml}
              className="text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
            >
              刷新排版
            </button>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-[#2a2d3e] bg-[#fdfcf8] shadow-2xl">
            <iframe
              srcDoc={customHtml}
              title="Interactive Handbook Preview"
              className="w-full border-none"
              style={{ minHeight: '850px' }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}

      {/* TAB 3: CODE EDITOR */}
      {activeTab === 'code' && (
        <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>HTML 源码直接编辑</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                可自由修改内联 CSS 样式、排版布局、特效动效或补充特定脚本
              </p>
            </div>

            <button
              onClick={handleRegenerateHtml}
              className="px-3 py-1 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs text-amber-300 border border-[#353950] transition cursor-pointer"
            >
              重置为表单生成内容
            </button>
          </div>

          <textarea
            rows={26}
            value={customHtml}
            onChange={(e) => {
              setCustomHtml(e.target.value);
              setIsHtmlDirty(true);
            }}
            className="w-full p-4 rounded-xl bg-[#0f1017] border border-[#292c3d] text-cyan-200 text-xs font-mono leading-relaxed outline-none focus:border-cyan-500"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

