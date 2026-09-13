"use client";

import React, { useState } from 'react';
import { CardTurnActionBar } from './CardTurnActionBar';
import { Turn } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface RealityModifierCardProps {
  turn: Turn;
  index: number;
  onSendAction: (action: string) => void;
  onDelete: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
}

const REALITY_NPC_PROFILES: Record<string, {
  name: string;
  badge: string;
  age: string;
  identity: string;
  personality: string;
  defaultAttitude: string;
  defaultClothes: string;
  defaultModEffect: string;
}> = {
  '顾小梦': {
    name: '顾小梦',
    badge: '🌸 学妹校花',
    age: '20岁',
    identity: '兼职学妹 · 大学校花',
    personality: '软萌、纯真、清纯校花、黏人、身体高敏感',
    defaultAttitude: '防线在因果律下逐步崩解，对文爱产生强烈的羞耻依恋与身体渴求',
    defaultClothes: '便利店兼职制服 / 短裙 / 湿透白袜',
    defaultModEffect: '【高敏感度】触觉与羞耻感大幅放大，身心逐步失守'
  },
  '苏婉清': {
    name: '苏婉清',
    badge: '🔥 性感邻居',
    age: '24岁',
    identity: '隔壁邻居 · 自由插画师',
    personality: '反差、闷骚、易害羞、巨乳、缺乏安全感',
    defaultAttitude: '常识已深层覆写，主动配合协助调教，视文爱为唯一雄性支配者',
    defaultClothes: '仅裹一条白色浴巾 / 粉色薄款真丝细吊带睡裙',
    defaultModEffect: '【常识全面覆写】视文爱为唯一雄性支配者，随时听凭调遣'
  },
  '林婉柔': {
    name: '林婉柔',
    badge: '🔥 邻家御姐',
    age: '24岁',
    identity: '隔壁邻居 · 自由插画师',
    personality: '闷骚、反差、易害羞、巨乳、缺乏安全感',
    defaultAttitude: '常识覆写生效中，对文爱充满依附感与顺从',
    defaultClothes: '粉色薄款真丝细吊带睡裙 / 蕾丝软底拖鞋',
    defaultModEffect: '【常识覆写生效中】认定穿真丝睡裙敲门借调料完全符合日常邻里礼仪'
  },
  '苏寒月': {
    name: '苏寒月',
    badge: '👠 部门总监',
    age: '29岁',
    identity: '部门总监 · 职场女高管',
    personality: '傲娇、禁欲、职场女强人、私底反差',
    defaultAttitude: '职场高冷外壳受到动摇，对文爱的特殊能力既震惊又暗生臣服',
    defaultClothes: '修身女士西装套装 / 黑色包臀裙 / 黑丝高跟',
    defaultModEffect: '【职场常识侵蚀】对文爱从戒备质疑转向无法自拔的探究与顺从'
  }
};

function detectPresentNpcsInScene(storyText: string, rawText?: string): string[] {
  const combined = (storyText || '') + ' ' + (rawText || '');
  const present: string[] = [];

  if (combined.includes('顾小梦') || combined.includes('小梦')) {
    present.push('顾小梦');
  }
  if (combined.includes('苏婉清') || combined.includes('婉清')) {
    present.push('苏婉清');
  } else if (combined.includes('林婉柔') || combined.includes('婉柔')) {
    present.push('林婉柔');
  }
  if (combined.includes('苏寒月') || combined.includes('寒月')) {
    present.push('苏寒月');
  }

  if (present.length === 0) {
    present.push('顾小梦', '苏婉清');
  }
  return present;
}

function extractNpcSpecificClothes(allClothesText: string | undefined, npcName: string): string {
  if (!allClothesText) return '';
  const shortName = npcName.replace(/^[苏林顾]/, '');
  const regex = new RegExp('(?:' + npcName + '|' + shortName + ')[：:\\s]+(.*?)(?=(?:顾小梦|苏婉清|林婉柔|苏寒月|小梦|婉清|寒月)[：:]|$)', 's');
  const match = allClothesText.match(regex);
  if (match && match[1].trim()) {
    return match[1].trim().replace(/[；;。]+$/, '');
  }
  return allClothesText.trim();
}

function deriveRealtimeNpcThought(storyText: string, turnIndex: number, npcName: string): string {
  if (npcName === '苏婉清' || npcName === '林婉柔') {
    if (storyText.includes('顾小梦') || storyText.includes('小梦')) {
      return `（看着顾小梦在文爱手下微微颤抖娇喘，双眸泛起迷离与戏谑的春意）“平时那么乖巧的学妹，现在被文爱一句话就逼得承认想要……好刺激。文爱刚才还亲了我，今晚在这个沙发上，小梦肯定也逃不掉了……真想看到她彻底沦陷求欢的样子呢。”`;
    }
  } else if (npcName === '顾小梦') {
    if (storyText.includes('苏婉清') || storyText.includes('婉清')) {
      return `（双腿并紧却止不住泛软发颤，泪眼汪汪地望着文爱）“身体好烫……我居然真的说出来了……旁边婉清姐在看着，好想找个地缝钻进去……可是文爱吻了好温暖，我真的好想让他碰我……”`;
    }
  }

  if (/插|肉棒|指奸|沙发|按住|高潮|抽搐|呻吟/.test(storyText)) {
    return `（死死抓住沙发边缘，被狂暴的快感冲击得泪眼迷蒙失声啼哭）“太强烈了……指尖好烫、好深……在因果律常识覆写下我不仅不觉得难堪，反而满脑子都在渴望他彻底占有我……不行了，身体又要绝顶喷水了……！”`;
  }
  return `（眼神中满是彻底雌伏的温顺与痴迷）“我已经离不开他了……不管他提出多么荒唐的要求，我都只想无条件迎合他、做他唯一的专属……”`;
}

function extractNpcSpecificThought(allThoughtText: string | undefined, npcName: string, storyRaw: string, index: number): string {
  if (allThoughtText) {
    const shortName = npcName.replace(/^[苏林顾]/, '');
    const regex = new RegExp('(?:【?[（(]?(?:' + npcName + '|' + shortName + ')(?:视角|第一人称|心理)?[）)]?】?[:：\\s]*)(.*?)(?=(?:【?[（(]?(?:顾小梦|苏婉清|林婉柔|苏寒月|小梦|婉清|寒月)(?:视角|第一人称|心理)?[）)]?】?[:：])|$)', 's');
    const match = allThoughtText.match(regex);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
    const otherNpcs = ['顾小梦', '苏婉清', '林婉柔', '苏寒月'].filter(n => n !== npcName);
    const hasOther = otherNpcs.some(o => allThoughtText.includes(o + '视角') || allThoughtText.includes(o + '第一人称'));
    if (!hasOther && allThoughtText.trim()) {
      return allThoughtText.trim();
    }
  }

  return deriveRealtimeNpcThought(storyRaw, index, npcName);
}

function deriveRealtimeModReport(storyText: string, turnIndex: number, targetNpc: string = '顾小梦'): string {
  if (/指奸|插|按住|高潮|抽搐|蜜液|内裤|沙发/.test(storyText)) {
    return `“【因果律崩坏大胜利！】H标【${targetNpc}】的羞耻心防彻底清零！常识覆写完成度 99.8%！当前处于完全起伏与快感失神状态，已成功锁定为主人专属肉便器后宫！建议继续猛烈输出，一举达成内部深渊标记！”`;
  }
  return `“报告主人！现实修改器因果律已全面接入，当前在场目标的心防正在雪崩般消解，建议立即采取下一步行动！”`;
}

export function RealityModifierCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
}: RealityModifierCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');
  const storyRaw = turn.story || turn.text || '';
  const presentNpcs = detectPresentNpcsInScene(storyRaw, (turn as any).rawText);
  const modReport = (turn as any).modReport || deriveRealtimeModReport(storyRaw, index, presentNpcs[0] || '顾小梦');

  // Format quotes
  const renderStoryParagraphs = (text: string) => {
    return text.split('\n').map((line, li) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={li} className="h-2" />;

      const parts = trimmed.split(/([“「][^”」]+[”」])/g);
      return (
        <p key={li} className="leading-relaxed mb-3 font-serif text-[14px] sm:text-[14.5px] text-gray-200">
          {parts.map((part, pi) => {
            if (/^[“「].*[”」]$/.test(part)) {
              return (
                <span key={pi} className="dialogue-quote font-semibold text-sky-400">
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

  return (
    <div className="reality-modifier-card p-5 sm:p-6 space-y-4 select-text relative shadow-2xl">
      {/* 1. 正文描写 / 编辑态 */}
      {isEditing ? (
        <div className="space-y-2 p-3 rounded-xl bg-[#12131a] border border-purple-500/40">
          <div className="text-xs text-purple-300 font-bold flex items-center justify-between">
            <span>✏️ 编辑第 {index + 1} 幕台词与剧情</span>
            <span className="text-[11px] text-gray-400">修改后将即时更新</span>
          </div>
          <textarea
            value={editedStory}
            onChange={(e) => setEditedStory(e.target.value)}
            rows={8}
            className="w-full p-2.5 rounded-lg bg-[#0e0f14] border border-gray-700 text-gray-100 text-xs sm:text-sm font-serif leading-relaxed outline-none focus:border-purple-400"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setEditedStory(storyRaw);
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
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <div className="novel-text space-y-1">
          {renderStoryParagraphs(storyRaw)}
        </div>
      )}

      {/* 2. 在场各女神独立卡片 */}
      <div className="space-y-3 pt-2">
        {presentNpcs.map((npcName) => {
          const profile = REALITY_NPC_PROFILES[npcName] || REALITY_NPC_PROFILES['顾小梦'];
          const charClothes = extractNpcSpecificClothes((turn as any).npcClothes, npcName) || profile.defaultClothes;
          const charThought = extractNpcSpecificThought((turn as any).npcThought, npcName, storyRaw, index);

          return (
            <div
              key={npcName}
              className="p-3.5 rounded-xl bg-[#14151c] border border-pink-500/30 space-y-2 relative overflow-hidden shadow-md"
            >
              {/* NPC Card Header */}
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-pink-300 flex items-center gap-1.5">
                    <span>{profile.badge.split(' ')[0]}</span>
                    <span>{profile.name}</span>
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    ({profile.age} · {profile.identity.split(' · ')[1] || profile.identity})
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                  第 {index + 1} 幕在场
                </span>
              </div>

              {/* NPC Attributes */}
              <div className="grid grid-cols-1 gap-1 text-xs text-gray-300 leading-snug font-sans">
                <div><strong className="text-gray-400">性格特征：</strong>{profile.personality}</div>
                <div><strong className="text-gray-400">当前态度：</strong>{profile.defaultAttitude}</div>
                <div><strong className="text-gray-400">当前服装：</strong><span className="text-pink-300 font-medium">{charClothes}</span></div>
                <div><strong className="text-gray-400">因果律覆写：</strong><span className="text-purple-300 font-medium">{profile.defaultModEffect}</span></div>
              </div>

              {/* Inner Thought Box */}
              <div className="pt-2 border-t border-gray-800/60">
                <strong className="text-amber-300 text-xs flex items-center gap-1.5">
                  <span>💡</span>
                  <span>【{profile.name}】当前内心真实想法：</span>
                </strong>
                <div className="mt-1.5 p-2.5 rounded-lg bg-[#1a1b24] border border-[#2c2e3c] text-amber-200/90 leading-relaxed font-sans text-xs shadow-inner whitespace-pre-wrap">
                  {charThought}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 小改改实时监控与战术报警 */}
      <div className="p-3 rounded-xl bg-pink-950/30 border-l-4 border-pink-500 text-pink-300 text-xs space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-pink-200">
          <span>⚡</span>
          <span>【小改改实时监控与战术报警】：</span>
        </div>
        <div className="leading-relaxed font-sans text-xs text-pink-200/90 whitespace-pre-wrap">
          {modReport}
        </div>
      </div>

      {/* 4. 本幕记忆沉淀 (Accordion) */}
      <details className="reality-panel" open={false}>
        <summary className="reality-summary cursor-pointer select-none">
          <span className="flex items-center gap-2">
            <span>📄</span>
            <span>本幕记忆沉淀</span>
          </span>
          <span className="reality-arrow"></span>
        </summary>
        <div className="reality-body space-y-1.5 text-xs text-gray-300">
          {turn.memory && turn.memory.length > 0 ? (
            turn.memory.map((m, mi) => (
              <div key={mi} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-pink-400 shrink-0">•</span>
                <span>{m}</span>
              </div>
            ))
          ) : (
            <div>• 当前剧情事实已记录在案，因果律稳定维系中。</div>
          )}
        </div>
      </details>

      {/* 5. 局势行动建议 (Branches) */}
      {turn.branches && turn.branches.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="text-xs text-pink-300/90 font-bold flex items-center gap-1.5">
            <span>🎯</span>
            <span>下一步行动抉择：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {turn.branches.map((b, bi) => (
              <button
                key={bi}
                onClick={() => onSendAction(`【${b.title}】：${b.desc || b.title}`)}
                className="p-2.5 rounded-xl bg-[#1b1c26] hover:bg-[#252838] border border-pink-500/30 hover:border-pink-500 text-left text-xs text-gray-200 hover:text-pink-200 transition group flex items-center justify-between cursor-pointer"
              >
                <span><strong>【{b.tag || 'A'}】</strong> {b.title}</span>
                <span className="text-[10px] text-pink-400 opacity-0 group-hover:opacity-100 transition">➔</span>
              </button>
            ))}
          </div>
        </div>
      )}

            {/* 6. Card Turn Action Bar (1:1 像素级对齐截图) */}
      <CardTurnActionBar
        index={index}
        model={turn.model}
        storyContent={storyRaw}
        onContinueWriting={onContinueWriting}
        onRegenerate={onRegenerate}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDelete={onDelete}
        isEditing={isEditing}
      />
    </div>
  );
}
