"use client";

import React, { useState } from 'react';
import { CardTurnActionBar } from './CardTurnActionBar';
import { Turn } from '@/lib/types';
import { Sparkles, BookOpen, Copy, Check } from 'lucide-react';

interface CoserCardProps {
  turn: Turn;
  index: number;
  onSendAction: (action: string) => void;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
}

export function CoserCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
}: CoserCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');
  const [activeTab, setActiveTab] = useState<'daily' | 'roles' | 'archive'>('daily');
  const [copied, setCopied] = useState(false);
  const storyText = turn.story || turn.text || '';

  // Archive live inputs state
  const [name, setName] = useState('你');
  const [age, setAge] = useState('18');
  const [identity, setIdentity] = useState('哥哥');
  const [attitude, setAttitude] = useState('察觉 (你开始注意到她的认真)');
  const [customText, setCustomText] = useState(
    '你一直以为妹妹换衣服给你看只是习惯。直到她说“可以只穿给你一个人看”——你才发现，她做的一切事，都是为了让你多看她一眼。'
  );

  const archivePreview = `【cos · 妹妹档案】
--------------------------------------------------
【你 · 她最在意的人】
👤 姓名：${name}
📅 年龄：${age}岁
🎭 身份：${identity}
💬 对妹妹的态度：${attitude}
📝 独白：${customText}
--------------------------------------------------
【她 · coser妹妹】
👧 林知念 · 16岁 · 高中生
✨ 身份：小有名气的coser · 只想被你看到的人
👗 当前装扮：洛丽塔花瓣展开裙 · 泛红耳尖
💗 心防：渴望独占注视（95%）`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(archivePreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderDialogue = (content: string) => {
    return content.split('\n').map((line, li) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={li} className="h-2" />;
      const parts = trimmed.split(/([“「][^”」]+[”」])/g);
      return (
        <p key={li} className="leading-relaxed mb-3 font-serif text-[14px] sm:text-[14.5px] text-gray-200">
          {parts.map((part, pi) => {
            if (/^[“「].*[”」]$/.test(part)) {
              return (
                <span key={pi} className="dialogue-quote font-semibold text-pink-300">
                  {part}
                </span>
              );
            }
            return <span key={pi}>{part}</span>;
          })}
        </p>
      );
    });
  };

  // Turn 0: Render 3-Tab Comprehensive Card
  if (index === 0) {
    return (
      <div className="p-4 sm:p-7 rounded-2xl bg-[#110c1a] border border-pink-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(244,114,182,0.12)] space-y-5 text-gray-200 select-text">
        {/* Header */}
        <div className="text-center space-y-1.5 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/15 text-pink-400 text-xs font-bold tracking-widest border border-pink-500/30">
            <span>🎭</span>
            <span>COSER · 妹妹</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
            我的绝美coser萝莉妹妹
          </h1>
          <div className="text-xs text-gray-400 font-mono tracking-wider">
            cosplay · 兄妹 · 日常 · 可爱 · 开放式叙事
          </div>
        </div>

        <div className="border-t border-pink-500/20 my-2" />

        {/* 3 Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 pb-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[#371b34] text-[#f472b6] border border-pink-500/50 shadow-[0_0_15px_rgba(244,114,182,0.25)]'
                : 'bg-[#181220] text-gray-400 hover:text-pink-300 hover:bg-[#231730]'
            }`}
          >
            <span>🎭</span>
            <span>日常之章</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-[#371b34] text-[#f472b6] border border-pink-500/50 shadow-[0_0_15px_rgba(244,114,182,0.25)]'
                : 'bg-[#181220] text-gray-400 hover:text-pink-300 hover:bg-[#231730]'
            }`}
          >
            <span>👧</span>
            <span>角色群像</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-[#371b34] text-[#f472b6] border border-pink-500/50 shadow-[0_0_15px_rgba(244,114,182,0.25)]'
                : 'bg-[#181220] text-gray-400 hover:text-pink-300 hover:bg-[#231730]'
            }`}
          >
            <span>📜</span>
            <span>我的档案</span>
          </button>
        </div>

        {/* Tab 1: Daily */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pt-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-400 to-pink-500" />
              <h2 className="text-base sm:text-lg font-bold text-gray-100 flex items-center gap-2">
                <span>🎭</span>
                <span>第一章 · 她回来了</span>
              </h2>
            </div>

            {/* Novel text */}
            <div className="text-gray-200 text-sm sm:text-[14.5px] leading-relaxed space-y-3 whitespace-pre-wrap font-normal">
              {turn.story}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-xs">🎭 coser</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-xs">👧 妹妹</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-xs">💗 可爱</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/30 text-xs">🏠 日常</span>
            </div>

            {/* Sparkle card */}
            <div className="p-4 rounded-xl bg-[#191124] border border-pink-500/25 text-xs text-gray-300 space-y-2 leading-relaxed">
              <div className="text-pink-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>你的妹妹林知念是一个小有名气的coser。</span>
              </div>
              <p>
                她会在换好衣服之后第一个跑出来给你看，会在你回答“还行”的时候假装生气然后又跑回房间。她在网上有几千个粉丝，但她最在乎的那个人——永远只有你一个。
              </p>
              <p>
                她说“可以只穿给你一个人看”的时候，声音很轻——她怕你听懂了，也怕你没听懂。而你才刚刚开始明白，她说了那句话之后为什么要跑回房间。
              </p>
            </div>

            {/* cos手札 Table */}
            <div className="rounded-xl overflow-hidden border border-pink-500/20 bg-[#160f20]">
              <div className="px-3.5 py-2 bg-pink-950/30 border-b border-pink-500/20 text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-pink-400" />
                <span>cos手札 · 日常</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#120c1a] text-gray-400 border-b border-pink-500/10">
                    <tr>
                      <th className="px-3.5 py-2 w-32">时间</th>
                      <th className="px-3.5 py-2">事件</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-500/10 text-gray-300">
                    <tr>
                      <td className="px-3.5 py-2.5 font-mono text-pink-300/90 whitespace-nowrap">周末 · 客厅</td>
                      <td className="px-3.5 py-2.5 leading-relaxed">妹妹林知念换了一套新的洛丽塔裙站在你面前。她说“我可以只穿给你一个人看”。你还没来得及回答，她就跑回了房间。</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dual-track instrument */}
            <div className="p-4 rounded-xl bg-[#191223] border border-purple-500/30 space-y-3">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <span>🎭</span>
                <span>双轨解构仪 · 裙摆与试探</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#130c1d] border-l-2 border-pink-400">
                  <div className="text-[11px] text-pink-400 font-semibold mb-0.5">【表面 · 随口的玩笑】</div>
                  <div className="text-gray-200">“哥……你要是喜欢的话，我可以只穿给你一个人看。”</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#130c1d] border-l-2 border-purple-400">
                  <div className="text-[11px] text-purple-400 font-semibold mb-0.5">【内心 · 认真的试探】</div>
                  <div className="text-gray-300 font-mono">（我不知道他会不会听懂。我穿这些衣服，拍这些照片，让那么多人看到……其实我只是想让他看我。他不知道。但我想让他知道。）</div>
                </div>
              </div>
              <div className="text-[11.5px] text-gray-400 italic pt-1 leading-relaxed">
                ——她说“只穿给你一个人看”的时候，目光在裙摆上停了一下。她没有看你——因为她怕看到你的表情。她怕你只是随口说一句“好啊”，然后她不知道那是不是认真的。
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Roles */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pt-2">
              <span className="text-lg">👧</span>
              <h2 className="text-base font-bold text-pink-200">角色 · 她和她唯一在意的人</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-[#181220] border border-pink-500/20 space-y-2.5">
                <div>
                  <h3 className="text-sm font-bold text-pink-300">林知念 · coser妹妹</h3>
                  <p className="text-[11px] text-gray-400">小有名气的coser · 只想被你看到的人</p>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  16岁，高中生。她在网上有几千个粉丝，每套cos照都会有很多人夸好看。但她最在意的永远是第一个跑出房间给你看的时候——你抬起头看她的那一秒。
                </p>
                <div className="text-xs text-pink-200 font-serif italic border-l-2 border-pink-500/50 pl-2">
                  “哥……你要是喜欢的话，我可以只穿给你一个人看。”
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#181220] border border-pink-500/20 space-y-2.5">
                <div>
                  <h3 className="text-sm font-bold text-pink-300">你 · 她最在意的人</h3>
                  <p className="text-[11px] text-gray-400">哥哥/姐姐 · 唯一能让她紧张的人</p>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  你习惯了妹妹每次换好衣服就跑出来给你看——你以为是习惯。直到她说出那句专属承诺，你才发现她做的一切都是在试探你的心意。
                </p>
                <div className="text-xs text-pink-200 font-serif italic border-l-2 border-pink-500/50 pl-2">
                  “……好看。”
                </div>
              </div>
            </div>

            {/* Relationship Map */}
            <div className="p-4 rounded-xl bg-[#171120] border border-pink-500/25 space-y-2.5 text-xs">
              <div className="text-pink-300 font-bold flex items-center gap-1.5">
                <span>🗺️</span>
                <span>关系网 · 想被你看到</span>
              </div>
              <div className="space-y-1.5 text-gray-300 text-[11.5px]">
                <div>• <strong className="text-pink-300">林知念</strong> ➔ 换好衣服第一个跑出来给你看（她最在乎的人是你）</div>
                <div>• <strong className="text-purple-300">你</strong> ➔ 是那个她最想被看到的人（你开始意识到这一点）</div>
                <div>• <strong className="text-rose-300">那套洛丽塔裙</strong> ➔ 她说“可以只穿给你一个人看”的时候穿着它</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Archive */}
        {activeTab === 'archive' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">姓名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#191324] border border-gray-700 focus:border-pink-500 text-gray-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">年龄</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#191324] border border-gray-700 focus:border-pink-500 text-gray-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">你的身份</label>
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#191324] border border-gray-700 focus:border-pink-500 text-gray-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">你对妹妹的态度</label>
                <select
                  value={attitude}
                  onChange={(e) => setAttitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#191324] border border-gray-700 focus:border-pink-500 text-gray-100 outline-none"
                >
                  <option value="察觉 (你开始注意到她的认真)">察觉 (你开始注意到她的认真)</option>
                  <option value="宠溺 (无论她穿什么都认真夸赞)">宠溺 (无论她穿什么都认真夸赞)</option>
                  <option value="困惑 (还没完全理解她的依赖)">困惑 (还没完全理解她的依赖)</option>
                  <option value="克制 (隐秘心动但碍于身份不敢越界)">克制 (隐秘心动但碍于身份不敢越界)</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-gray-400 mb-1">自定义设定</label>
              <textarea
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#191324] border border-gray-700 focus:border-pink-500 text-gray-100 outline-none leading-relaxed"
              />
            </div>

            {/* Live Terminal Box */}
            <div className="p-3.5 rounded-xl bg-[#0e0a16] border border-pink-500/25 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-wrap select-text max-h-60 overflow-y-auto">
              {archivePreview}
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/25 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已复制到剪贴板！' : '复制cos档案'}</span>
            </button>
          </div>
        )}

        {/* Branch Choices */}
        <div className="pt-3 border-t border-pink-500/20 space-y-2">
          <div className="text-[11px] text-pink-300 font-semibold flex items-center gap-1">
            <span>🎲</span>
            <span>当下心动抉择（点击直接推演下一步）：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(turn.branches || [
              { tag: "A", title: "起身去敲她的房门", desc: "走到知念卧室门前轻轻敲门：“知念……刚才那套裙子，其实真的很漂亮。”" },
              { tag: "B", title: "答应她的专属承诺", desc: "推开虚掩的门缝：“如果我说我很喜欢……你真的愿意只穿给我一个人看吗？”" },
              { tag: "C", title: "拿冰镇饮料去安慰她", desc: "从冰箱拿出她最爱的水蜜桃汽水和薯片，去她房间叫她一起看新番" },
              { tag: "D", title: "帮她拍专属私人返图", desc: "拿出相机：“别换下来，我帮你拍一组专属相册，只存在我手机里的那种。”" }
            ]).map((b, bi) => (
              <button
                key={bi}
                onClick={() => onSendAction(`【${b.title}】：${b.desc || b.title}`)}
                className="p-2.5 rounded-xl bg-[#1b1326] hover:bg-pink-950/40 border border-pink-500/30 hover:border-pink-500 text-left text-xs text-gray-200 hover:text-pink-300 transition group flex items-center justify-between cursor-pointer"
              >
                <span><strong>【{b.tag || '◆'}】</strong> {b.title}</span>
                <span className="text-[10px] text-pink-400 opacity-0 group-hover:opacity-100 transition">➔</span>
              </button>
            ))}
          </div>
        </div>

        {/* Turn Action Bar */}
        <CardTurnActionBar
          index={index}
          model={turn.model}
          storyContent={turn.story || turn.text || ''}
          onContinueWriting={onContinueWriting}
          onRegenerate={onRegenerate}
          onEditToggle={() => setIsEditing(!isEditing)}
          onDelete={onDelete}
          isEditing={isEditing}
        />
      </div>
    );
  }

  // Turn > 0: Subsequent rounds with standardized 1:1 collapsible accordions
  const hasStatus = !!(turn.status || turn.npcThought);
  const hasMemory = turn.memory && turn.memory.length > 0;
  const hasBranches = turn.branches && turn.branches.length > 0;
  const hasAnyPanel = hasStatus || hasMemory || hasBranches;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#110c1a] border border-pink-500/30 shadow-2xl space-y-4 text-gray-200 select-text">
      <div className="flex items-center justify-between border-b border-pink-500/20 pb-2.5 text-xs text-pink-300/90 font-medium">
        <span className="flex items-center gap-1.5">
          <span>📍</span>
          <span>{turn.location || '知念的卧室 · 晚霞与更衣落地镜'}</span>
        </span>
        <span className="text-[10px] text-gray-500 font-mono">第 {index + 1} 幕</span>
      </div>

      {/* Novel text / Editing */}
      {isEditing ? (
        <div className="space-y-2 p-3 rounded-xl bg-[#171022] border border-pink-500/40">
          <div className="text-xs text-pink-300 font-bold flex items-center justify-between">
            <span>✏️ 编辑第 {index + 1} 幕剧情</span>
            <span className="text-[11px] text-gray-400">修改后将即时更新</span>
          </div>
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            rows={8}
            className="w-full p-2.5 rounded-lg bg-[#0e0a16] border border-gray-700 text-gray-100 text-xs sm:text-sm font-serif leading-relaxed outline-none focus:border-pink-400"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setEditedStory(storyText);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (onEdit) onEdit(index, editedStory);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition cursor-pointer"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <div className="novel-text space-y-1">
          {renderDialogue(storyText)}
        </div>
      )}

      {/* 统一折叠面板群 */}
      {hasAnyPanel && (
        <div className="reality-panels-container space-y-2 mt-4">
          {/* ① 👧 林知念 · 实时装扮与心防状态 */}
          {hasStatus && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>👧</span>
                  <span>林知念 · 实时装扮与心防状态</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-2 text-xs text-gray-300">
                <div className="space-y-1 text-[11.5px] leading-relaxed">
                  <div>• <strong className="text-gray-400">当前试穿装扮：</strong><span className="text-pink-300 font-medium">{turn.status?.clothes || '洛丽塔蕾丝花瓣裙 (后背拉链微敞) / 裸足'}</span></div>
                  <div>• <strong className="text-gray-400">体态与微表情：</strong><span className="text-gray-200">{turn.status?.posture || '背对落地镜，双手护在胸前，耳尖泛着薄红'}</span></div>
                  <div>• <strong className="text-gray-400">独占与心跳指标：</strong><span className="text-purple-300 font-medium">{turn.status?.stats || '独占依赖度: 96% | 害羞心跳: 142bpm | 防备度: 10%'}</span></div>
                </div>
                {turn.npcThought && (
                  <div className="pt-2 border-t border-pink-500/20">
                    <div className="text-[11px] text-pink-300 font-bold flex items-center gap-1 mb-1">
                      <span>💡</span>
                      <span>【知念内心真实独白】：</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#110b18] border border-purple-500/30 text-pink-200/90 font-mono text-[11.5px] leading-relaxed">
                      {turn.npcThought}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* ② 📝 记忆折叠 */}
          {hasMemory && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>📝</span>
                  <span>本幕记忆沉淀 ({turn.memory!.length} 条事实)</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-1 text-xs text-gray-300">
                {turn.memory!.map((m, i) => (
                  <div key={i} className="leading-relaxed flex items-start gap-1.5">
                    <span className="text-pink-400 shrink-0">•</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ③ 🎲 推荐互动抉择 */}
          {hasBranches && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>🎮</span>
                  <span>推荐互动抉择 ({turn.branches!.length} 项可选)</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-2">
                <div className="text-[11px] text-gray-400 mb-1">
                  💡 点击直接推进心动情节：
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {turn.branches!.map((b, bi) => (
                    <button
                      key={bi}
                      onClick={() => onSendAction(`【${b.title}】：${b.desc || b.title}`)}
                      className="p-2.5 rounded-xl bg-[#1b1326] hover:bg-pink-950/40 border border-pink-500/30 hover:border-pink-500 text-left text-xs text-gray-200 hover:text-pink-300 transition group flex items-center justify-between cursor-pointer"
                    >
                      <span><strong>【{b.tag || '◆'}】</strong> {b.title}</span>
                      <span className="text-[10px] text-pink-400 opacity-0 group-hover:opacity-100 transition">➔</span>
                    </button>
                  ))}
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* 底部工具条 */}
      <CardTurnActionBar
        index={index}
        model={turn.model}
        storyContent={storyText}
        onContinueWriting={onContinueWriting}
        onRegenerate={onRegenerate}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDelete={onDelete}
        isEditing={isEditing}
      />
    </div>
  );
}
