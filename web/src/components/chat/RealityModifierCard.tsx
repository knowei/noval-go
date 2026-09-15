"use client";

import React, { useState } from 'react';
import { Turn } from '@/lib/types';
import { generateContextualBranches } from '@/lib/modelParser';
import { CardTurnActionBar } from './CardTurnActionBar';
import { RichStoryRenderer } from './RichStoryRenderer';

interface RealityModifierCardProps {
  turn: Turn;
  index: number;
  onSendAction: (action: string) => void;
  onDelete: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onContinueWriting?: (index: number) => void;
  onEdit?: (index: number, newStory: string) => void;
  onSwipeChange?: (index: number, newSwipeIndex: number) => void;
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
    defaultAttitude: '防线在因果律下逐步崩解，对文骏产生强烈的羞耻依恋与身体渴求',
    defaultClothes: '便利店兼职制服 / 短裙 / 湿透白袜',
    defaultModEffect: '【高敏感度】触觉与羞耻感大幅放大，身心逐步失守'
  },
  '苏婉清': {
    name: '苏婉清',
    badge: '🔥 性感邻居',
    age: '24岁',
    identity: '隔壁邻居 · 自由插画师',
    personality: '反差、闷骚、易害羞、巨乳、缺乏安全感',
    defaultAttitude: '常识已深层覆写，主动配合协助调教，视文骏为唯一雄性支配者',
    defaultClothes: '仅裹一条白色浴巾 / 粉色薄款真丝细吊带睡裙',
    defaultModEffect: '【常识全面覆写】视文骏为唯一雄性支配者，随时听凭调遣'
  },
  '林婉柔': {
    name: '林婉柔',
    badge: '🔥 邻家御姐',
    age: '24岁',
    identity: '隔壁邻居 · 自由插画师',
    personality: '闷骚、反差、易害羞、巨乳、缺乏安全感',
    defaultAttitude: '常识覆写生效中，对文骏充满依附感与顺从',
    defaultClothes: '粉色薄款真丝细吊带睡裙 / 蕾丝软底拖鞋',
    defaultModEffect: '【常识覆写生效中】认定穿真丝睡裙敲门借调料完全符合日常邻里礼仪'
  },
  '苏寒月': {
    name: '苏寒月',
    badge: '👠 部门总监',
    age: '29岁',
    identity: '部门总监 · 职场女高管',
    personality: '傲娇、禁欲、职场女强人、私底反差',
    defaultAttitude: '表面严苛挑剔，潜意识在因果律影响下开始渴望被宿主压制征服',
    defaultClothes: '黑色包臀裙职业套装 / 透肤黑丝 / 细高跟',
    defaultModEffect: '【威严逆转】职场支配欲被悄然逆转为被支配渴望'
  }
};

function detectPresentNpcsInScene(storyRaw: string, rawText?: string): string[] {
  const combined = (storyRaw + " " + (rawText || "")).toLowerCase();
  const present: string[] = [];
  if (/顾小梦|小梦|校花|学妹|兼职妹/.test(combined)) present.push('顾小梦');
  if (/苏婉清|婉清|邻居|插画师|对门/.test(combined)) present.push('苏婉清');
  if (/林婉柔|婉柔/.test(combined) && !present.includes('苏婉清')) present.push('林婉柔');
  if (/苏寒月|寒月|总监|女高管|女上司/.test(combined)) present.push('苏寒月');
  if (present.length === 0) {
    present.push('顾小梦');
    present.push('苏婉清');
  }
  return present;
}

function extractNpcSpecificClothes(npcClothesObj: any, npcName: string): string | null {
  if (!npcClothesObj) return null;
  if (typeof npcClothesObj === 'string') return npcClothesObj;
  return npcClothesObj[npcName] || null;
}

function deriveRealtimeNpcThought(storyText: string, turnIndex: number, npcName: string): string {
  if (npcName === '顾小梦') {
    if (/湿|脱|吻|抱|摸|碰|贴/.test(storyText)) {
      return '（双颊红得几乎滴出血来，水汪汪的双眸羞怯地望着文骏）“身体好烫……为什么文骏学长碰我的时候，我一点都不想反抗……好想被他抱紧……好羞耻……可我真的好喜欢这种被他支配的感觉……”';
    }
    return '（手指绞着衣角，心跳如鼓，悄悄偷瞄文骏）“文骏学长认真的样子真的好帅……在修改器的力量下，我觉得无论他提出什么要求，我都愿意听他的话……”';
  }
  if (npcName === '苏婉清' || npcName === '林婉柔') {
    if (/浴巾|睡裙|沙发|吻|摸|脱/.test(storyText)) {
      return '（呼吸急促，眼神满是迷离与渴求）“明明平日里我那么害羞，可是在文骏面前，我就只想把最好的一面展示给他看……只要文骏喜欢，怎么样都可以……”';
    }
    return '（微咬下唇，双腿微微交叠，心口微漾）“这就是我的唯一支配者文骏吗……只要能留在他身边，当他的专属后宫也是一件很幸福的事呢……”';
  }
  return '（表面极力维持镇定，内心深处却在因果律的改写下悄然沦陷）“不能失态……可是为什么视线总是不由自主地被他吸引……”';
}

function extractNpcSpecificThought(npcThoughtObj: any, npcName: string, storyRaw: string, index: number): string {
  if (npcThoughtObj && typeof npcThoughtObj === 'object' && npcThoughtObj[npcName]) {
    return npcThoughtObj[npcName];
  }
  return deriveRealtimeNpcThought(storyRaw, index, npcName);
}

function deriveRealtimeModReport(storyText: string, turnIndex: number, targetNpc: string = '顾小梦'): string {
  if (/指奸|插|按住|高潮|抽搐|蜜液|内裤|沙发/.test(storyText)) {
    return `“【因果律崩坏大胜利！】目标【${targetNpc}】的羞耻心防彻底清零！常识覆写完成度 99.8%！当前处于完全起伏与快感失神状态，已成功锁定为主人专属后宫！建议继续推进，一举达成深层印记！”`;
  }
  return '“报告主人！现实修改器因果律已全面接入，当前在场目标的心防正在雪崩般消解，建议立即采取下一步行动！”';
}

export const RealityModifierCard = React.memo(function RealityModifierCard({
  turn,
  index,
  onSendAction,
  onDelete,
  onRegenerate,
  onContinueWriting,
  onEdit,
  onSwipeChange,
}: RealityModifierCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(turn.story || turn.text || '');
  const storyRaw = turn.story || turn.text || '';
  const presentNpcs = detectPresentNpcsInScene(storyRaw, (turn as any).rawText);
  const modReport = (turn as any).modReport || deriveRealtimeModReport(storyRaw, index, presentNpcs[0] || '顾小梦');

  const wanrouLove = Math.min(100, 35 + index * 3);
  const wanrouSink = Math.min(100, 15 + index * 4);
  const hanyueLove = Math.min(100, 20 + Math.floor(index / 3));
  const hanyueSink = Math.min(100, 10 + Math.floor(index / 4));
  const xiaomengLove = Math.min(100, 30 + Math.floor(index / 2));
  const xiaomengSink = Math.min(100, 15 + Math.floor(index / 3));

  const dynamicActionList = React.useMemo(() => {
    if (turn.branches && turn.branches.length > 0) {
      return turn.branches.map((b) => `【${b.title}】：“${b.desc || b.title}”`);
    } else if (index === 0) {
      return [
        "【尝试第一次修改】：“让对门邻居林婉柔在五分钟内主动来敲我的门借调味品。”",
        "【直接登门拜访】：“装作外卖送错了，端着一盒热披萨去敲对门302室的房门。”",
        "【修改自身参数】：“将自己的外貌魅力和身体各项属性直接提升为男神水准。”",
        "【询问助手小改改】：“调出附近其他两位高分目标（苏寒月、顾小梦）的资料给我看看。”"
      ];
    } else {
      const fallbackBranches = generateContextualBranches('deck_reality_modifier', storyRaw, index);
      return fallbackBranches.map((b) => `【${b.title}】：“${b.desc || b.title}”`);
    }
  }, [turn.branches, index, storyRaw]);

  const renderStoryParagraphs = (text: string) => {
    return text.split('\n').map((line, li) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={li} className="h-2" />;
      const parts = trimmed.split(/([“「][^”」]+[”」])/g);
      return (
        <p key={li} className="leading-relaxed mb-3 font-serif text-[14px] sm:text-[14.5px] text-gray-200">
          {parts.map((part, pi) => {
            if (/^[“「].*[”」]$/.test(part)) {
              return <span key={pi} className="dialogue-quote font-semibold text-sky-400">{part}</span>;
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
          <RichStoryRenderer rawStory={storyRaw} />
        </div>
      )}

      {/* 2. 核心 6 大折叠面板群 (1:1 像素级对齐 media_1789311859304.png) */}
      <div className="reality-panels-container space-y-2 mt-4">
        {/* ① 📱 现实修改器 v6.9 */}
        <details className="reality-panel">
          <summary className="reality-summary cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <span>📱</span>
              <span>现实修改器 v6.9</span>
            </span>
            <span className="reality-arrow"></span>
          </summary>
          <div className="reality-body text-xs text-gray-300 space-y-1">
            <div>• <strong className="text-gray-400">当前版本：</strong>v6.9 豪华破解特权版</div>
            <div>• <strong className="text-gray-400">权限等级：</strong>最高级支配特权（时间暂停、认知修改、身体重构全部解锁）</div>
            <div>• <strong className="text-gray-400">剩余修改点数：</strong>{Math.max(10, 100 - index * 15)} pts（每日自动回满）</div>
            <div>• <strong className="text-gray-400">当前激活规则：</strong>{index > 0 ? "目标苏婉清/顾小梦因果律认知修正规则已生效" : "无（等待输入第一条修改指令）"}</div>
          </div>
        </details>

        {/* ② 👤 主角信息 */}
        <details className="reality-panel">
          <summary className="reality-summary cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <span>👤</span>
              <span>主角信息</span>
            </span>
            <span className="reality-arrow"></span>
          </summary>
          <div className="reality-body text-xs text-gray-300 space-y-1">
            <div>• <strong className="text-gray-400">姓名/身份：</strong>文骏（25岁 / 居家程序员）</div>
            <div>• <strong className="text-gray-400">支配力指数：</strong>Lv.{Math.min(5, 1 + Math.floor(index / 2))} 宿主</div>
            <div>• <strong className="text-gray-400">拥有特权：</strong>绝对记忆豁免（全宇宙唯一保留修改前记忆者）</div>
          </div>
        </details>

        {/* ③ 💋 后宫名册 */}
        <details className="reality-panel">
          <summary className="reality-summary cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <span>💋</span>
              <span>后宫名册 ({index > 15 ? '已攻略 1人 · 待拓展 2人' : (index > 0 ? '攻略中 1人 · 待拓展 2人' : '0人已攻略')})</span>
            </span>
            <span className="reality-arrow"></span>
          </summary>
          <div className="reality-body text-xs text-gray-300 space-y-2.5">
            <div className="p-2.5 rounded-lg bg-pink-950/30 border border-pink-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-300 flex items-center gap-1">
                  <span>🔥</span><span>苏婉清 (24岁 · 性感邻居 · 当前场景)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                  👑 专属后宫 (已彻底沦陷)
                </span>
              </div>
              <div className="text-[11.5px] text-gray-300 leading-relaxed">
                • <strong>好感度：</strong>{wanrouLove}% ｜ <strong>沦陷度：</strong>{wanrouSink}%<br />
                • <strong>当前心防：</strong>【常识全面覆写】视文骏为唯一雄性支配者，随时听凭调遣。
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1a1c26] border border-purple-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-1">
                  <span>👠</span><span>苏寒月 (29岁 · 部门总监 · 职场线)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  待深度攻陷
                </span>
              </div>
              <div className="text-[11.5px] text-gray-400 flex items-center justify-between">
                <span>• 好感度：{hanyueLove}% ｜ 攻陷度：{hanyueSink}% (傲娇、冷艳禁欲)</span>
                <button
                  onClick={() => onSendAction('【发动修改器切换至职场线】：指令苏寒月总监在今晚以考评为由主动来到我的公寓')}
                  className="text-[10px] text-purple-300 hover:text-white px-2 py-0.5 rounded bg-purple-900/50 hover:bg-purple-800 transition cursor-pointer"
                >
                  📱 召唤至当前 ➔
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1a1c26] border border-indigo-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1">
                  <span>🌸</span><span>顾小梦 (20岁 · 兼职学妹 · 校园线)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {index > 2 ? '当前在场中' : '待偶遇接触'}
                </span>
              </div>
              <div className="text-[11.5px] text-gray-400 flex items-center justify-between">
                <span>• 好感度：{xiaomengLove}% ｜ 攻陷度：{xiaomengSink}% (软萌纯真JK)</span>
                <button
                  onClick={() => onSendAction('【发动修改器偶遇学妹】：修改常识让兼职下班的学妹顾小梦避雨来到我的门前')}
                  className="text-[10px] text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-900/50 hover:bg-indigo-800 transition cursor-pointer"
                >
                  📱 召唤至当前 ➔
                </button>
              </div>
            </div>
          </div>
        </details>

        {/* ④ 👗 当前场景在场 NPC */}
        <details className="reality-panel">
          <summary className="reality-summary cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <span>👗</span>
              <span>当前场景在场 NPC (共 {presentNpcs.length} 位女神)</span>
            </span>
            <span className="reality-arrow"></span>
          </summary>
          <div className="reality-body space-y-3 text-gray-300 text-xs">
            {presentNpcs.map((npcName) => {
              const profile = REALITY_NPC_PROFILES[npcName] || REALITY_NPC_PROFILES['顾小梦'];
              const charClothes = extractNpcSpecificClothes((turn as any).npcClothes, npcName) || profile.defaultClothes;
              const charThought = extractNpcSpecificThought((turn as any).npcThought, npcName, storyRaw, index);
              return (
                <div key={npcName} className="p-3.5 rounded-xl bg-[#14151c] border border-pink-500/30 space-y-2 relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-pink-300 flex items-center gap-1.5">
                        <span>{profile.badge.split(' ')[0]}</span>
                        <span>{profile.name}</span>
                      </span>
                      <span className="text-xs text-gray-400 font-mono">({profile.age} · {profile.identity.split(' · ')[1] || profile.identity})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">第 {index + 1} 幕在场</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-300 leading-snug font-sans">
                    <div><strong className="text-gray-400">性格特征：</strong>{profile.personality}</div>
                    <div><strong className="text-gray-400">当前态度：</strong>{profile.defaultAttitude}</div>
                    <div><strong className="text-gray-400">当前服装：</strong><span className="text-pink-300 font-medium">{charClothes}</span></div>
                    <div><strong className="text-gray-400">因果律覆写：</strong><span className="text-purple-300 font-medium">{profile.defaultModEffect}</span></div>
                  </div>
                  <div className="pt-2 border-t border-gray-800/60">
                    <strong className="text-amber-300 text-xs flex items-center gap-1.5">
                      <span>💡</span><span>【{profile.name}】当前内心真实想法：</span>
                    </strong>
                    <div className="mt-1.5 p-2.5 rounded-lg bg-[#1a1b24] border border-[#2c2e3c] text-amber-200/90 leading-relaxed font-sans text-xs shadow-inner whitespace-pre-wrap">
                      {charThought}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="p-3 rounded-xl bg-pink-950/30 border-l-4 border-pink-500 text-pink-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-pink-200">
                <span>⚡</span><span>【小改改实时监控与战术报警】：</span>
              </div>
              <div className="leading-relaxed font-sans text-xs text-pink-200/90 whitespace-pre-wrap">
                {modReport}
              </div>
            </div>
          </div>
        </details>

        {/* ⑤ 📝 本幕记忆沉淀 */}
        <details className="reality-panel">
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
              index > 0 ? (
                <>
                  <div>• 目标顾小梦/苏婉清遵照修改器因果律在场互动，常识覆写完成度极高。</div>
                  <div>• 目标身心产生深层依赖，对主角的服从性与依附度显著提升。</div>
                </>
              ) : (
                <>
                  <div>• 文骏意外激活了手机内置的现实修改器APP，结识了助手小改改。</div>
                  <div>• 小改改锁定了隔壁的插画师苏婉清与学妹顾小梦作为第一攻略目标。</div>
                </>
              )
            )}
          </div>
        </details>

        {/* ⑥ 🎮 当前局势 · 行动与修改指令推荐 */}
        <details className="reality-panel">
          <summary className="reality-summary cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <span>🎮</span>
              <span>当前局势 · 行动与修改指令推荐</span>
            </span>
            <span className="reality-arrow"></span>
          </summary>
          <div className="reality-body space-y-2">
            <div className="text-[11px] text-gray-400 mb-1">
              💡 以下推荐指令已结合当前剧情上下文与因果律实时更新，点击即可直接执行：
            </div>
            <div className="space-y-1.5">
              {dynamicActionList.map((act, ai) => (
                <div
                  key={ai}
                  onClick={() => onSendAction(act)}
                  className="p-2.5 rounded-lg bg-[#202228] hover:bg-pink-950/40 border border-gray-700 hover:border-pink-500/60 text-gray-200 hover:text-pink-300 cursor-pointer transition text-xs flex items-center justify-between group"
                >
                  <span>{act}</span>
                  <span className="text-[10px] text-pink-400 opacity-0 group-hover:opacity-100 transition">点击执行 ➔</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>

      {/* 3. Card Turn Action Bar (1:1 像素级对齐截图) */}
      <CardTurnActionBar
        index={index}
        model={turn.model}
        storyContent={storyRaw}
        onContinueWriting={onContinueWriting}
        onRegenerate={onRegenerate}
        onEditToggle={() => setIsEditing(!isEditing)}
        onDelete={onDelete}
        isEditing={isEditing}
        swipes={turn.swipes}
        swipeIndex={turn.swipeIndex}
        onSwipeChange={onSwipeChange}
      />
    </div>
  );
});
