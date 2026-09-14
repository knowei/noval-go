"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Feather,
  Wand2,
  Eye,
  Play,
  Check,
  Plus,
  Trash2,
  Code2,
  BookOpen,
  Layout,
  Palette,
  Layers,
  FileText,
  Activity,
  UserCheck,
  Terminal,
  Scroll,
  HeartHandshake
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  generateCustomHtmlCard,
  ThemePreset,
  CharacterRole,
  ScenarioMechanism,
  OpeningChoice,
  CustomField,
  StatusGauge,
  EnabledBlocks
} from '@/lib/htmlCardGenerator';

export default function StudioPage() {
  const router = useRouter();

  // Active Tab: 'form' | 'preview' | 'code'
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'code'>('form');

  // Theme Preset
  const [themePreset, setThemePreset] = useState<ThemePreset>('notebook');
  const [customThemeColor, setCustomThemeColor] = useState<string>('#9d8ec7');

  // Modular Block Toggles
  const [enabledBlocks, setEnabledBlocks] = useState<EnabledBlocks>({
    hero: true,
    story: true,
    status: true,
    roles: true,
    rules: true,
    playerForm: true,
    openings: true,
    summary: true
  });

  // Basic info
  const [title, setTitle] = useState('【纯爱破防】雨夜留宿的合租室友');
  const [badge, setBadge] = useState('🔥 独家首发 · 心理解构');
  const [category, setCategory] = useState('都市');
  const [tags, setTags] = useState('合租, 破甲, 双轨解构, 暴雨夜');
  const [desc, setDesc] = useState(
    '突如其来的暴雨淹没了回家的末班车。她浑身湿透站在门前，睫毛上挂着水珠，单薄的白衬衫被雨水紧贴在身上：“那个……我今晚能在你这儿借宿一晚吗？”'
  );

  // Status Gauges (仪表盘数值)
  const [statusGauges, setStatusGauges] = useState<StatusGauge[]>([
    { label: '好感心动指数', value: 88, max: 100, unit: '%' },
    { label: '害羞体温', value: 37.8, max: 40, unit: '℃' },
    { label: '心理防备度', value: 25, max: 100, unit: '%' }
  ]);

  // Character profiles (角色卡)
  const [roles, setRoles] = useState<CharacterRole[]>([
    {
      name: '陈诗雨',
      role: '同校学妹 · 隔壁合租室友',
      desc: '平日里气质清冷端庄，不擅长主动表达好感。今晚因为暴雨误车被迫求宿，在私人空间里流露出平日罕见的娇弱与依赖。',
      appearance: '长发及腰，眼眸清澈微泛湿气，身段纤细修长，锁骨线条分明。',
      traits: '耳根极易泛红，对突如其来的靠近格外敏感，呼吸略显急促。'
    }
  ]);

  // Scenario mechanisms / Rules (机制与规则)
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

  // Custom Player Fields (创作者完全自定义玩家输入项)
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 'p_name', label: '玩家姓名', placeholder: '例如：林铭宇 / 顾言', type: 'text' },
    { id: 'p_age', label: '玩家年龄', placeholder: '例如：20 / 24', type: 'text' },
    { id: 'p_look', label: '外貌与身段神态', placeholder: '例如：身材修长，眼神干净深邃，气质沉稳', type: 'text' },
    { id: 'p_relation', label: '与她的相处默契', placeholder: '例如：平日虽然说话不多，但常常互带宵夜', type: 'textarea' },
    { id: 'p_secret', label: '随身道具 / 秘密心思', placeholder: '例如：柜子里留着为她备好的新睡袍', type: 'textarea' }
  ]);

  // Openings (多分支开局)
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

  // Initialize generated HTML
  useEffect(() => {
    const html = generateCustomHtmlCard({
      title,
      badge,
      summary: desc,
      themePreset,
      themeColor: customThemeColor,
      roles,
      statusGauges,
      mechanisms,
      customFields,
      openings,
      enabledBlocks
    });
    setCustomHtml(html);
  }, []);

  // Handle re-generation from form state
  const handleRegenerateHtml = () => {
    const html = generateCustomHtmlCard({
      title,
      badge,
      summary: desc,
      themePreset,
      themeColor: customThemeColor,
      roles,
      statusGauges,
      mechanisms,
      customFields,
      openings,
      enabledBlocks
    });
    setCustomHtml(html);
    setIsHtmlDirty(false);
  };

  // Toggle single block
  const toggleBlock = (blockKey: keyof EnabledBlocks) => {
    setEnabledBlocks(prev => {
      const next = { ...prev, [blockKey]: !prev[blockKey] };
      return next;
    });
  };

  // Add status gauge
  const handleAddGauge = () => {
    setStatusGauges(prev => [
      ...prev,
      { label: `新状态指标 ${prev.length + 1}`, value: 60, max: 100, unit: '%' }
    ]);
  };

  // Add custom player field
  const handleAddField = () => {
    const id = `field_${Date.now()}`;
    setCustomFields(prev => [
      ...prev,
      { id, label: `自定义设定项 ${prev.length + 1}`, placeholder: '请输入提示语...', type: 'text' }
    ]);
  };

  // Add role
  const handleAddRole = () => {
    setRoles(prev => [
      ...prev,
      {
        name: `登场角色 ${prev.length + 1}`,
        role: '主要人物',
        desc: '角色心理性格简述...',
        appearance: '身段外貌与神情气质',
        traits: '敏感弱点与专属特质'
      }
    ]);
  };

  // Add mechanism
  const handleAddMech = () => {
    setMechanisms(prev => [
      ...prev,
      {
        tag: '机制',
        title: '新规则或场景',
        desc: '描写该环境特质或专属因果律规则...'
      }
    ]);
  };

  // Add opening
  const handleAddOpening = () => {
    setOpenings(prev => [
      ...prev,
      {
        tag: `走向 · 分支 ${prev.length + 1}`,
        text: '在此输入该分支的切入场景描写...'
      }
    ]);
  };

  // Save to SQLite database API & test
  const handleSaveAndTest = async () => {
    if (!title.trim()) {
      alert('请填写剧本标题');
      return;
    }

    setIsSaving(true);
    const deckId = 'deck_user_' + Date.now();

    const finalHtml = customHtml || generateCustomHtmlCard({
      title,
      badge,
      summary: desc,
      themePreset,
      themeColor: customThemeColor,
      roles,
      statusGauges,
      mechanisms,
      customFields,
      openings,
      enabledBlocks
    });

    const payload = {
      id: deckId,
      title: title.trim(),
      badge: badge.trim(),
      category: category.trim(),
      desc: desc.trim(),
      tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      themeColor: themePreset,
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
            <span>剧本创作工坊 · 自由积木排版设计系统</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-100 font-mono">
            自定义属于你的专属剧本与互动设定卡
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            模块自由拼装 · 玩家表单任意增减 · 4大独立骨架引擎 · 实时沙盒渲染
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRegenerateHtml}
            className="px-3.5 py-2 rounded-xl bg-[#202230] hover:bg-[#2b2e40] border border-[#34384e] text-purple-300 hover:text-purple-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            title="根据当前配置重新编译排版卡"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>重新编译排版</span>
          </button>

          <button
            onClick={handleSaveAndTest}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>已保存入库，跳转中...</span>
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
          <Layers className="w-4 h-4" />
          <span>📝 积木式模块自由搭建</span>
        </button>

        <button
          onClick={() => {
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

      {/* TAB 1: FORM & BLOCK BUILDER */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {/* Section A: Visual Style Skeletons Selector */}
          <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>排版视觉骨架与风格选择（完全不同的视觉形态与交互隐喻）</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Preset 1: Cyber OS */}
              <div
                onClick={() => {
                  setThemePreset('cyber');
                  setIsHtmlDirty(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                  themePreset === 'cyber'
                    ? 'bg-[#0f1522] border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-[#181a24] border-[#2c3042] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    <span>赛博终端 OS</span>
                  </span>
                  {themePreset === 'cyber' && <span className="text-[11px] text-cyan-300 font-bold">✓ 当前选定</span>}
                </div>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">
                  暗夜矩阵、代码等宽字体、系统扫描线、因果律注入指令，适合修改器与系统流
                </p>
              </div>

              {/* Preset 2: Contract */}
              <div
                onClick={() => {
                  setThemePreset('contract');
                  setIsHtmlDirty(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                  themePreset === 'contract'
                    ? 'bg-[#1c1815] border-amber-600 shadow-lg shadow-amber-600/20'
                    : 'bg-[#181a24] border-[#2c3042] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                    <Scroll className="w-4 h-4" />
                    <span>手撕契约公文</span>
                  </span>
                  {themePreset === 'contract' && <span className="text-[11px] text-amber-400 font-bold">✓ 当前选定</span>}
                </div>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">
                  泛黄牛皮纸、鲜红【即刻生效】印章、强制履约条款，适合房租肉偿、契约协议
                </p>
              </div>

              {/* Preset 3: Notebook */}
              <div
                onClick={() => {
                  setThemePreset('notebook');
                  setIsHtmlDirty(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                  themePreset === 'notebook'
                    ? 'bg-[#22131c] border-pink-500 shadow-lg shadow-pink-500/20'
                    : 'bg-[#181a24] border-[#2c3042] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>拍立得少女手帐</span>
                  </span>
                  {themePreset === 'notebook' && <span className="text-[11px] text-pink-300 font-bold">✓ 当前选定</span>}
                </div>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">
                  彩色纸胶带、拍立得倾斜相框、心跳指数与便签纸，适合纯爱、同居与学妹
                </p>
              </div>

              {/* Preset 4: Classic Purple */}
              <div
                onClick={() => {
                  setThemePreset('classic_purple');
                  setIsHtmlDirty(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                  themePreset === 'classic_purple'
                    ? 'bg-[#191526] border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-[#181a24] border-[#2c3042] hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>典雅高定紫金</span>
                  </span>
                  {themePreset === 'classic_purple' && <span className="text-[11px] text-purple-300 font-bold">✓ 当前选定</span>}
                </div>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">
                  典雅古典衬线体、微光渐变卡片、金紫镶边，适合古风、仙侠与传统深情剧本
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Block Toggles Bar (积木增删与显示控制) */}
          <div className="p-4 rounded-2xl bg-[#151620] border border-[#272938] space-y-2">
            <span className="text-xs font-bold text-gray-400 block mb-2">
              🧩 页面积木块开关（可根据你的剧本自由开启或隐藏任意模块）：
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleBlock('hero')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.hero ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.hero ? '✓ 顶部横幅' : '+ 顶部横幅'}
              </button>
              <button
                onClick={() => toggleBlock('story')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.story ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.story ? '✓ 背景故事' : '+ 背景故事'}
              </button>
              <button
                onClick={() => toggleBlock('status')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.status ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.status ? '✓ 状态数值仪表盘' : '+ 状态数值仪表盘'}
              </button>
              <button
                onClick={() => toggleBlock('roles')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.roles ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.roles ? '✓ 登场人物卡' : '+ 登场人物卡'}
              </button>
              <button
                onClick={() => toggleBlock('rules')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.rules ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.rules ? '✓ 契约条款与机制' : '+ 契约条款与机制'}
              </button>
              <button
                onClick={() => toggleBlock('playerForm')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.playerForm ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.playerForm ? '✓ 自定义玩家表单' : '+ 自定义玩家表单'}
              </button>
              <button
                onClick={() => toggleBlock('openings')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  enabledBlocks.openings ? 'bg-purple-600/30 text-purple-200 border-purple-500/50' : 'bg-[#1e202c] text-gray-500 border-[#2f3244]'
                }`}
              >
                {enabledBlocks.openings ? '✓ 多分支开局' : '+ 多分支开局'}
              </button>
            </div>
          </div>

          {/* Block 1: Basic Info & Story */}
          {enabledBlocks.hero && (
            <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
              <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>1. 剧本基本信息与背景</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">剧本标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs sm:text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">特色徽标 Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">题材分类</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] text-gray-100 text-xs outline-none"
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
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">标签 Tags (逗号分隔)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] text-gray-100 text-xs outline-none"
                  />
                </div>
              </div>

              {enabledBlocks.story && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">故事前情与背景梗概</label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1c28] border border-[#2e3144] focus:border-purple-500 text-gray-100 text-xs outline-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* Block 2: Status Gauges (仪表盘数值) */}
          {enabledBlocks.status && (
            <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>2. 状态数值仪表盘（好感度、体温、理智值、堕落度等）</span>
                </h3>
                <button
                  onClick={handleAddGauge}
                  className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-emerald-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加数值指标</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statusGauges.map((g, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-300">指标 #{idx + 1}</span>
                      <button
                        onClick={() => setStatusGauges(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 text-xs p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={g.label}
                      onChange={(e) => {
                        const next = [...statusGauges];
                        next[idx].label = e.target.value;
                        setStatusGauges(next);
                      }}
                      className="w-full px-2.5 py-1 rounded bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none"
                      placeholder="指标名称（如好感度）"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={g.value}
                        onChange={(e) => {
                          const next = [...statusGauges];
                          next[idx].value = Number(e.target.value);
                          setStatusGauges(next);
                        }}
                        className="w-20 px-2 py-1 rounded bg-[#202230] border border-[#32364a] text-emerald-300 text-xs outline-none font-mono"
                      />
                      <input
                        type="text"
                        value={g.unit || ''}
                        onChange={(e) => {
                          const next = [...statusGauges];
                          next[idx].unit = e.target.value;
                          setStatusGauges(next);
                        }}
                        className="w-16 px-2 py-1 rounded bg-[#202230] border border-[#32364a] text-gray-300 text-xs outline-none text-center"
                        placeholder="单位(%)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block 3: Character Profiles (角色档案) */}
          {enabledBlocks.roles && (
            <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-pink-400" />
                  <span>3. 登场人物卡设计（将在排版网页中作为独立人物卡呈现）</span>
                </h3>
                <button
                  onClick={handleAddRole}
                  className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-pink-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加人物</span>
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-300">人物 #{idx + 1}</span>
                      {roles.length > 1 && (
                        <button
                          onClick={() => setRoles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-500 hover:text-red-400 text-xs p-1"
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
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-400 mb-1">特征细节与敏感弱点</label>
                        <input
                          type="text"
                          value={r.traits || ''}
                          onChange={(e) => {
                            const next = [...roles];
                            next[idx].traits = e.target.value;
                            setRoles(next);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#202230] border border-[#32364a] text-gray-100 text-xs outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block 4: Rules & Mechanisms (机制与条款) */}
          {enabledBlocks.rules && (
            <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-cyan-400" />
                  <span>4. 机制与条款规则（因果律、契约条款、场所禁忌）</span>
                </h3>
                <button
                  onClick={handleAddMech}
                  className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加规则/条款</span>
                </button>
              </div>

              <div className="space-y-3">
                {mechanisms.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m.tag}
                        onChange={(e) => {
                          const next = [...mechanisms];
                          next[idx].tag = e.target.value;
                          setMechanisms(next);
                        }}
                        className="w-24 px-2.5 py-1 rounded bg-[#202230] border border-[#32364a] text-cyan-300 text-xs font-bold outline-none text-center"
                        placeholder="标签(条款/场景)"
                      />
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => {
                          const next = [...mechanisms];
                          next[idx].title = e.target.value;
                          setMechanisms(next);
                        }}
                        className="flex-1 px-3 py-1 rounded bg-[#202230] border border-[#32364a] text-gray-100 text-xs font-bold outline-none"
                        placeholder="机制名称或条款标题"
                      />
                      {mechanisms.length > 1 && (
                        <button
                          onClick={() => setMechanisms(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-500 hover:text-red-400 text-xs p-1"
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
                      className="w-full px-3 py-1.5 rounded bg-[#202230] border border-[#32364a] text-gray-300 text-xs outline-none"
                      placeholder="条款或机制具体内容..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block 5: Custom Player Form (创作者自定义玩家输入项) */}
          {enabledBlocks.playerForm && (
            <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>5. 自定义玩家输入表单（完全由创作者定义让玩家填什么）</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    你可以自由添加任意字段，如【灵根资质】、【修改器权限】、【随身道具】等
                  </p>
                </div>

                <button
                  onClick={handleAddField}
                  className="px-3 py-1.5 rounded-lg bg-[#222434] hover:bg-[#2c2f44] text-xs font-bold text-purple-300 flex items-center gap-1 cursor-pointer transition border border-[#33374e]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加自定义字段</span>
                </button>
              </div>

              <div className="space-y-3">
                {customFields.map((f, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#191a26] border border-[#2a2d3e] flex items-center gap-3">
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => {
                        const next = [...customFields];
                        next[idx].label = e.target.value;
                        setCustomFields(next);
                      }}
                      className="w-44 px-2.5 py-1.5 rounded bg-[#202230] border border-[#32364a] text-purple-200 text-xs font-bold outline-none"
                      placeholder="字段名称"
                    />

                    <input
                      type="text"
                      value={f.placeholder}
                      onChange={(e) => {
                        const next = [...customFields];
                        next[idx].placeholder = e.target.value;
                        setCustomFields(next);
                      }}
                      className="flex-1 px-3 py-1.5 rounded bg-[#202230] border border-[#32364a] text-gray-300 text-xs outline-none"
                      placeholder="提示占位文字"
                    />

                    <select
                      value={f.type || 'text'}
                      onChange={(e) => {
                        const next = [...customFields];
                        next[idx].type = e.target.value as any;
                        setCustomFields(next);
                      }}
                      className="w-24 px-2 py-1.5 rounded bg-[#202230] border border-[#32364a] text-gray-300 text-xs outline-none"
                    >
                      <option value="text">单行文本</option>
                      <option value="textarea">多行文本</option>
                    </select>

                    {customFields.length > 1 && (
                      <button
                        onClick={() => setCustomFields(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-500 hover:text-red-400 text-xs p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block 6: Openings (开场白) */}
          {enabledBlocks.openings && (
            <div className="p-5 rounded-2xl bg-[#151620] border border-[#272938] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>6. 多分支开局切入点（将在卡片上供玩家单选切入）</span>
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
                  <div key={idx} className="p-3.5 rounded-xl bg-[#191a26] border border-[#2a2d3e] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={op.tag}
                        onChange={(e) => {
                          const next = [...openings];
                          next[idx].tag = e.target.value;
                          setOpenings(next);
                        }}
                        className="w-56 px-2.5 py-1 rounded bg-[#202230] border border-[#32364a] text-emerald-300 text-xs font-bold outline-none"
                        placeholder="开局标签"
                      />
                      {openings.length > 1 && (
                        <button
                          onClick={() => setOpenings(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-500 hover:text-red-400 text-xs p-1"
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
                      className="w-full px-3 py-2 rounded bg-[#202230] border border-[#32364a] text-gray-200 text-xs outline-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE PREVIEW IFRAME */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-pink-400" />
              <span>
                当前骨架：
                <b className="text-white">
                  {themePreset === 'cyber' ? '赛博终端 OS' : themePreset === 'contract' ? '手撕契约公文' : themePreset === 'notebook' ? '拍立得少女手帐' : '典雅高定紫金'}
                </b>
                （可直接在下方卡片中点击互动、输入自定义字段并测试生成）
              </span>
            </span>
            <button
              onClick={handleRegenerateHtml}
              className="text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
            >
              刷新排版
            </button>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-[#2a2d3e] bg-[#0c0d14] shadow-2xl">
            <iframe
              srcDoc={customHtml}
              title="Interactive Handbook Preview"
              className="w-full border-none"
              style={{ minHeight: '880px' }}
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
                可自由微调 CSS 样式、排版布局、特效动效或补充特定脚本
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
            rows={28}
            value={customHtml}
            onChange={(e) => {
              setCustomHtml(e.target.value);
              setIsHtmlDirty(true);
            }}
            className="w-full p-4 rounded-xl bg-[#0b0c12] border border-[#292c3d] text-cyan-200 text-xs font-mono leading-relaxed outline-none focus:border-cyan-500"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}


