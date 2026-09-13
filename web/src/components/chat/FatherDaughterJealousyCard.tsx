"use client";

import React, { useState } from 'react';
import { Turn } from '@/lib/types';
import { RotateCcw, ChevronDown, ChevronUp, Trash2, BookOpen, Sliders, Flame, Heart } from 'lucide-react';

interface FatherDaughterJealousyCardProps {
  turn: Turn;
  index: number;
  onSendAction?: (actionText: string) => void;
  onDelete?: (index: number) => void;
}

export function FatherDaughterJealousyCard({
  turn,
  index,
  onSendAction,
  onDelete,
}: FatherDaughterJealousyCardProps) {
  const [showMemory, setShowMemory] = useState(false);

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
    return content.split(/([“「].*?[”」])/g).map((part, i) => {
      if (/^[“「].*?[”」]$/.test(part)) {
        return (
          <span key={i} className="dialogue-quote font-semibold text-amber-300">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="rounded-2xl border border-[#2b2d3c] bg-[#14151f] shadow-xl p-5 sm:p-6 space-y-4 text-gray-200 text-xs sm:text-sm animate-in fade-in duration-200">
      {/* 剧情文本 */}
      <div className="leading-relaxed whitespace-pre-wrap font-sans space-y-2 select-text">
        {formatDialogue(turn.story || turn.text || '')}
      </div>

      {/* 记忆沉淀折叠 */}
      {turn.memory && turn.memory.length > 0 && (
        <div className="rounded-xl border border-[#242634] bg-[#101118] overflow-hidden text-xs">
          <button
            onClick={() => setShowMemory(!showMemory)}
            className="w-full px-3.5 py-2 flex items-center justify-between text-gray-400 hover:text-gray-200 transition cursor-pointer font-mono"
          >
            <span className="flex items-center gap-1.5">
              <span>📄 本幕记忆沉淀 ({turn.memory.length} 条事实)</span>
            </span>
            {showMemory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showMemory && (
            <div className="p-3 border-t border-[#1c1d28] space-y-1.5 text-gray-300 bg-[#0e0f14]">
              {turn.memory.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">•</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 状态与心态监控 */}
      {turn.status && (
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/10 text-xs text-amber-200/90 space-y-1">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <span>💔 女儿与父亲心态监控:</span>
          </div>
          {Object.entries(turn.status).map(([k, v]) => (
            <div key={k} className="text-[11px] text-gray-300">
              <span className="text-gray-400">• {k}: </span>
              <span>{typeof v === 'string' ? v : JSON.stringify(v)}</span>
            </div>
          ))}
        </div>
      )}

      {/* 分支抉择 */}
      {turn.branches && turn.branches.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-gray-400">🎯 下一步惩戒与行动抉择:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {turn.branches.map((b, bIdx) => (
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
      )}

      {/* 底部信息 */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-[#20222e]">
        <span>{turn.model || 'deepseek-flash'}</span>
        {onDelete && (
          <button
            onClick={() => onDelete(index)}
            className="hover:text-amber-400 p-1 rounded transition cursor-pointer"
            title="回退到此前回合"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
