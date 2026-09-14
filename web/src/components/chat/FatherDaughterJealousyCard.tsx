"use client";

import React, { useState } from 'react';
import { CardTurnActionBar } from './CardTurnActionBar';
import { RichStoryRenderer } from './RichStoryRenderer';
import { Turn } from '@/lib/types';
import { generateContextualBranches } from '@/lib/modelParser';
import { RotateCcw, ChevronDown, BookOpen, Sliders, Flame } from 'lucide-react';

interface FatherDaughterJealousyCardProps {
  turn: Turn;
  index: number;
  onSendAction?: (actionText: string) => void;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
}

export const FatherDaughterJealousyCard = React.memo(function FatherDaughterJealousyCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
}: FatherDaughterJealousyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');
  const storyText = turn.story || turn.text || '';

  // 1:1 对齐 media_1789310230050.png 的玩法风格与设定表单
  const [protagonistStyle, setProtagonistStyle] = useState('外冷内热');
  const [ambiguityLevel, setAmbiguityLevel] = useState('全开');
  const [plotText, setPlotText] = useState(
    "我有一个可爱的女儿。女儿渐渐长大，她也开始早恋了。某个周末，我在单位加班，女儿把她在学校关系很好的男同学邀请到家里一起做作业，当然，写作业只是幌子，她俩是找机会在家里亲热亲热。我在单位干活比较快，早早的就结束了工作回家。一进门，我就听见女儿的书房里传出奇怪的声音，像撒娇又像娇喘，果不其然这两个家伙没干好事。愤怒的我直接冲向女儿的房间敲门，过了一会儿女儿跟她同学两个人衣衫不整的打开门，看起来还有点性感。我带着怒火和嫉妒心质问女儿，小小年纪不好好学习，在这搞这个，看我不收拾你。我把女儿直接扔到床上，问她是不是跟男朋友做爱了。女儿娇滴滴的对我说了，老爸你别生气了，我男朋友他没有操过我。我心想，没操过刚好，那正好我先来。"
  );

  const handleResetDefaults = () => {
    setProtagonistStyle('外冷内热');
    setAmbiguityLevel('全开');
  };

  const handleGenerateStory = () => {
    const prompt = `生成初始剧情。男主风格：【${protagonistStyle}】，暧昧程度：【${ambiguityLevel}】。初始场景与大纲设定：${plotText}`;
    onSendAction?.(prompt);
  };

  // 如果是第 0 轮，按照 media_1789310230050.png 渲染 1:1 自定义填表开场卡
  if (index === 0) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in duration-300 select-text">
        {/* 顶部悬浮选择开场白按钮 */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGenerateStory}
            className="px-4 py-1.5 rounded-full bg-[#1e202c] hover:bg-[#282a3c] border border-gray-700 text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition shadow-md cursor-pointer"
          >
            <span>✨ 选择一段开场白</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* 粉色边框玩法说明提示框 (1:1 还原截图) */}
        <div className="p-3.5 rounded-2xl border border-pink-500/40 bg-pink-950/15 text-pink-200 text-xs leading-relaxed">
          <span className="font-bold text-pink-400">玩法说明。</span>
          <span>选主角风格 -&gt; 改剧情（可以不改） -&gt; 设定角色（可增加角色） -&gt; 一键复制发给AI当第一条消息，生成初始剧情。懒汉玩法：直接点击上方生成初始剧情，或者拖到最后点击懒得填表，总之直接发送“生成初始剧情”就可以。</span>
        </div>

        {/* 玩法风格设置卡片 (1:1 还原截图) */}
        <div className="rounded-2xl border border-[#2b2e40] bg-[#14151f] p-5 space-y-4 shadow-xl text-gray-200 text-xs">
          <div className="flex items-center justify-between border-b border-[#222434] pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-100">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>玩法风格</span>
            </div>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1 rounded-lg bg-[#1c1d28] hover:bg-[#252838] border border-gray-700 text-purple-300 text-[11px] flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>回全默认</span>
            </button>
          </div>

          {/* 男主风格 */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-300">男主风格</div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: '温柔宠溺', desc: '温柔纯爱路线' },
                { name: '义正言辞', desc: '假正经' },
                { name: '外冷内热', desc: '表面冷淡，内心淫荡' },
                { name: '轻松搞笑', desc: '随意搞笑' }
              ].map((style) => (
                <button
                  key={style.name}
                  onClick={() => setProtagonistStyle(style.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    protagonistStyle === style.name
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-500/25'
                      : 'bg-[#1e202c] text-gray-400 hover:text-white border border-gray-700/50 hover:bg-[#252838]'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-gray-400">
              说明: 温柔宠溺=温柔纯爱路线。义正言辞=假正经。外冷内热=表面冷淡，内心淫荡。轻松搞笑=随意搞笑
            </div>
          </div>

          {/* 暧昧程度 */}
          <div className="space-y-2 pt-2 border-t border-[#1f2130]">
            <div className="font-semibold text-gray-300">暧昧程度</div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: '全开', desc: '没有顾忌' },
                { name: '纯爱', desc: '全程暧昧+剧情' }
              ].map((lvl) => (
                <button
                  key={lvl.name}
                  onClick={() => setAmbiguityLevel(lvl.name)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    ambiguityLevel === lvl.name
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow-md shadow-orange-500/25'
                      : 'bg-[#1e202c] text-gray-400 hover:text-white border border-gray-700/50 hover:bg-[#252838]'
                  }`}
                >
                  {lvl.name}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-gray-400">
              说明: 全开=没有顾忌。纯爱=全程暧昧+剧情
            </div>
          </div>
        </div>

        {/* 剧情大纲与开局场景卡片 (1:1 还原截图) */}
        <div className="rounded-2xl border border-[#2b2e40] bg-[#14151f] p-5 space-y-3 shadow-xl text-gray-200">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-100">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>剧情大纲与开局场景</span>
          </div>

          <textarea
            value={plotText}
            onChange={(e) => setPlotText(e.target.value)}
            rows={6}
            className="w-full p-3.5 rounded-xl bg-[#111219] border border-[#27293a] text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed resize-y no-scrollbar"
          />

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-gray-400">
              可直接修改上方剧本大纲，点击生成即可立刻进入第一幕
            </span>
            <button
              onClick={handleGenerateStory}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-900 font-bold text-xs shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>立即生成初始剧情 (推荐)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 剧情回合渲染
  const formatDialogue = (content: string) => {
    return content.split('\n').map((line, li) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={li} className="h-2" />;
      const parts = trimmed.split(/([“「][^”」]+[”」])/g);
      return (
        <p key={li} className="leading-relaxed mb-3 font-serif text-[14px] sm:text-[14.5px] text-gray-200">
          {parts.map((part, pi) => {
            if (/^[“「].*[”」]$/.test(part)) {
              return (
                <span key={pi} className="dialogue-quote font-semibold text-amber-300">
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

  const hasStatus = turn.status && Object.keys(turn.status).length > 0;
  const hasMemory = turn.memory && turn.memory.length > 0;
    const isPlaceholderBranches = !turn.branches || turn.branches.length === 0 ||
    (turn.branches.length <= 2 && turn.branches.some(b => b.title.includes('顺应') || b.title.includes('试探心意')));
  const activeBranches = isPlaceholderBranches
    ? generateContextualBranches('deck_father_daughter_jealousy', storyText, index)
    : turn.branches!;
  const hasBranches = activeBranches && activeBranches.length > 0;
  const hasAnyPanel = hasStatus || hasMemory || hasBranches;

  return (
    <div className="rounded-2xl border border-[#2b2d3c] bg-[#14151f] shadow-xl p-5 sm:p-6 space-y-4 text-gray-200 text-xs sm:text-sm animate-in fade-in duration-200 select-text">
      {/* 剧情文本 / 编辑模式 */}
      {isEditing ? (
        <div className="space-y-2 p-3 rounded-xl bg-[#12131a] border border-amber-500/40">
          <div className="text-xs text-amber-300 font-bold flex items-center justify-between">
            <span>✏️ 编辑第 {index + 1} 幕台词与剧情</span>
            <span className="text-[11px] text-gray-400">修改后将即时更新</span>
          </div>
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            rows={8}
            className="w-full p-2.5 rounded-lg bg-[#0e0f14] border border-gray-700 text-gray-100 text-xs sm:text-sm font-serif leading-relaxed outline-none focus:border-amber-400"
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
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-900 text-xs font-bold transition cursor-pointer"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <div className="novel-text space-y-1">
          <RichStoryRenderer rawStory={storyText} />
        </div>
      )}

      {/* 1:1 统一折叠面板群 */}
      {hasAnyPanel && (
        <div className="reality-panels-container space-y-2 mt-4">
          {/* ① 💔 女儿与父亲心态监控 */}
          {hasStatus && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>💔</span>
                  <span>女儿与父亲心态实时监控</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-1 text-xs text-gray-300">
                {Object.entries(turn.status!).map(([k, v]) => (
                  <div key={k} className="leading-relaxed">
                    • <strong className="text-gray-400">{k}: </strong>
                    <span className="text-amber-300">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ② 📝 记忆沉淀折叠 */}
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
                    <span className="text-amber-400 shrink-0">•</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ③ 🎯 分支抉择 */}
          {hasBranches && (
            <details className="reality-panel">
              <summary className="reality-summary cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <span>🎮</span>
                  <span>下一步惩戒与行动抉择 ({activeBranches.length} 项可选)</span>
                </span>
                <span className="reality-arrow"></span>
              </summary>
              <div className="reality-body space-y-2">
                <div className="text-[11px] text-gray-400 mb-1">
                  💡 点击直接执行惩戒与推进剧情：
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeBranches.map((b, bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => onSendAction?.(b.desc ? `${b.title}：${b.desc}` : b.title)}
                      className="p-3 rounded-xl border border-[#272938] bg-[#191a24] hover:border-amber-500/60 hover:bg-amber-950/20 text-left transition cursor-pointer group"
                    >
                      <div className="font-bold text-xs text-gray-200 group-hover:text-amber-300 flex items-center gap-1.5">
                        <span className="text-amber-400 font-mono">[{b.tag || String.fromCharCode(65 + bIdx)}]</span>
                        <span>{b.title}</span>
                      </div>
                      {b.desc && <div className="text-[11px] text-gray-400 mt-1 leading-snug">{b.desc}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </details>
          )}
        </div>
      )}

      {/* 底部功能条 */}
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
});
