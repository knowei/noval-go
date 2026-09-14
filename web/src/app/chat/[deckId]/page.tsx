"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RotateCcw, History, Sparkles } from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { fetchStory, fetchConversations, fetchConversation } from '@/lib/api';
import { parseModelOutput, generateContextualBranches } from '@/lib/modelParser';
import { buildSystemPrompt } from '@/lib/promptEngine';
import { Turn, Branch } from '@/lib/types';
import { ScenarioSidebar } from '@/components/chat/ScenarioSidebar';
import { ChatInput } from '@/components/chat/ChatInput';
import { CoserCard } from '@/components/chat/CoserCard';
import { RealityModifierCard } from '@/components/chat/RealityModifierCard';
import { SisterTruthOrDareCard } from '@/components/chat/SisterTruthOrDareCard';
import { FatherDaughterJealousyCard } from '@/components/chat/FatherDaughterJealousyCard';
import { GenericCard } from '@/components/chat/GenericCard';
import { UserTurnActionBar } from '@/components/chat/UserTurnActionBar';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

export default function ChatPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const router = useRouter();

  const {
    currentUserId,
    currentDeck,
    setCurrentDeck,
    conversationHistory,
    setConversationHistory,
    addTurn,
    updateTurn,
    truncateHistory,
    currentConversationId,
    setCurrentConversationId,
    startNewStory,
    modelSettings,
    setIsSettingsOpen,
    setIsDrawerOpen,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isMobileScenarioOpen, setIsMobileScenarioOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const latestUserTurnRef = useRef<HTMLDivElement>(null);
  const streamBottomRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolledRef = useRef(false);

  // Reset initial scroll flag when entering or switching conversations
  useEffect(() => {
    hasInitialScrolledRef.current = false;
  }, [deckId, currentConversationId]);

  // Automatically scroll to the latest turn when conversation history loads
  useEffect(() => {
    if (conversationHistory.length > 0 && !hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;
      const timer1 = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'auto'
          });
        }
      }, 100);

      const timer2 = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 350);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [conversationHistory]);

  useEffect(() => {
    async function init() {
      if (!deckId) return;

      const deck = await fetchStory(deckId);
      if (deck) {
        setCurrentDeck(deckId, deck);

        // Check if there are existing saves for this deck
        const saves = await fetchConversations(currentUserId);
        const deckSaves = saves.filter((s) => s.deck_id === deckId);

        if (deckSaves.length > 0 && deckSaves[0].id) {
          const loaded = await fetchConversation(deckSaves[0].id);
          if (loaded && loaded.history && loaded.history.length > 0) {
            setCurrentConversationId(loaded.id);
            setConversationHistory(loaded.history);
            return;
          }
        }

        // Start new story if no previous saves
        startNewStory(deck);
      }
    }
    init();
  }, [deckId, currentUserId]);

  const isCoser = deckId === 'deck_coser_sister';
  const isModifier = deckId === 'deck_reality_modifier';
  const isSister = deckId === 'deck_sister_truth_or_dare' || deckId === '6ffc2ab9-2907-4304-b0bb-53c0a950b445';
  const isFatherDaughter = deckId === 'deck_father_daughter_jealousy' || deckId === '1f97a5c2-3e5b-48e2-aa3a-893a9332765c';
  const bgClass = isCoser ? 'coser-sister-bg' : (isModifier ? 'reality-modifier-bg' : '');

  const getFallbackStory = (actionText: string, turnIdx: number, prevBranches?: Branch[]) => {
    const act = actionText.replace(/【.*?】：?/, '').trim();
    let baseStory = '';
    if (isModifier) {
      baseStory = `现实修改器的指示灯在暗处规律地闪烁着幽紫色微光，因果律常识覆写的波长在空气中无声激荡。

面对“${act || '顺应当前氛围深入探索'}”的指令，顾小梦身子猛然一轻，原本作为大学校花残存的最后一丝羞耻感也如同冰雪初融般悄然溃退。她眼眸半阖，双颊染上绯红的酡色，细密的汗珠顺着白皙修长的脖颈滑落。

“学长……唔……身体好像已经完全习惯了……”少女柔弱无骨地靠了过来，湿透的白袜在木地板上轻轻蹭动，嗓音里夹杂着她自己都未曾察觉的战栗与深层顺从。

而在门外，走廊深处传来了细碎的高跟鞋敲击地砖声——隔壁的成熟插画师苏婉清似乎也正朝着这边走来，空气中的暧昧与危险指数正在疯狂攀升。`;
    } else if (isCoser) {
      baseStory = `听到你关于“${act || '继续互动'}”的话语，林知念捏着洛丽塔裙摆的手指稍稍攥紧，但耳尖那抹艳丽的薄红却迅速蔓延到了雪白的锁骨。

她悄悄抬起眼帘望向你，在触及你眼神的刹那又慌乱地偏过头去，长长的睫毛在黄昏落日的余晖中剧烈颤动：“哥……你、你怎么总是趁人家换衣服的时候说这种话……要是骗我，我以后就真的一套新衣服都不给你看了……”

虽然嘴上娇哼着表达抗议，但她身后的落地穿衣镜里，少女那微微扬起的嘴角与微促的心跳，却早已将她心底藏不住的窃喜与依赖暴露无遗。`;
    } else if (isSister) {
      baseStory = `话音未落，客厅原本稍显轻松的氛围顿时微妙地凝固了一瞬。

宋晚的脸颊刷地一下通红，抓起沙发上的抱枕挡在身前：“喂！你、你怎么能选这个大冒险啊！夏绮，林初，你们快管管他呀……”

坐在地毯上的夏绮双手托腮，一双桃花眼里满是玩味的促狭笑意：“晚晚，大冒险的规矩可是你自己开局定下的哦，愿赌服输，不许耍赖~”

而在角落一直有些羞怯的林初则微微低下了头，手指紧扣着易拉罐，心跳声在安静的客厅里似乎格外清晰。`;
    } else if (isFatherDaughter) {
      baseStory = `面对你的质问与动作，女儿的身子微微发颤。在你的注视下，她眼底最初的委屈与抗拒逐渐瓦解，取而代之的是一丝无法掩饰的慌乱与羞愧。

她紧紧揪着睡衣下摆，眼圈泛红，胸口由于情绪激动而起伏不定：“爸……你凭什么这样管我……你、你根本不知道我心里有多难受……”

然而她微弱的反抗并没能掩饰她身躯的紧绷与依赖，在你的威严与妒意交织的气场下，卧室里的气氛变得愈发危险与禁断。`;
    } else {
      baseStory = `针对你的行动【${act || '深入推进'}】，场间的气氛产生了明显的微妙变化。

窗外的夜色如墨，灯光在两人之间洒下斑驳的光影。对方抬起眼帘凝视着你，眼底闪过复杂的情绪波动，似乎正在重新审视你与彼此之间的界限。随着沉默的打破，彼此的距离在不知不觉中悄然拉近。`;
    }

    const branches = generateContextualBranches(deckId, baseStory, turnIdx, act, prevBranches);
    return {
      story: baseStory,
      branches
    };
  };

  const runGeneration = async (historyContext: Turn[]) => {
    setIsLoading(true);
    const activeModel = modelSettings.model || 'deepseek-flash';
    const lastUserTurn = historyContext[historyContext.length - 1];
    const userActionText = lastUserTurn?.text || '';
    const aiTurnIndex = historyContext.length;

    // 获取最近一轮带有推荐分支的 AI 回复，用于严格去重与分支递进
    const prevAiTurn = [...historyContext].reverse().find((h) => !h.isUser && h.branches && h.branches.length > 0);
    const prevBranches = prevAiTurn?.branches;

    let hasLiveStreamSuccess = false;

    // Determine if real API can be attempted
    const isRealApiKey = Boolean(
      modelSettings.apiKey &&
      modelSettings.apiKey.trim().length > 10 &&
      !modelSettings.apiKey.startsWith('sk-demo')
    );

    if (isRealApiKey) {
      try {
        const systemPromptText = buildSystemPrompt({
          deckId,
          deckTitle: currentDeck?.title,
          deckDesc: currentDeck?.desc,
          previousBranches: prevBranches,
          turnIndex: aiTurnIndex
        });

        const promptMessages = [
          {
            role: 'system',
            content: systemPromptText
          },
          ...historyContext.slice(-6).map((h, idx, arr) => {
            const isLast = idx === arr.length - 1;
            let content = h.text || h.story || '';
            if (isLast && h.isUser) {
              content = `【用户最新推进指令】：${content}。\n（请严格遵循防抢话原则，严禁替玩家发号施令或做心理决策；输出高质量感官与情绪拉扯描写，结尾输出<opt><suggested_questions>全新不重复互动分支）`;
            }
            return {
              role: h.isUser ? 'user' : 'assistant',
              content
            };
          })
        ];

        const targetUrl = `${modelSettings.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
        const apiModel = targetUrl.includes('deepseek.com') && (activeModel === 'deepseek-flash' || activeModel === 'deepseek-v4-pro')
          ? 'deepseek-chat'
          : activeModel;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const resp = await fetch(`/proxy?target=${encodeURIComponent(targetUrl)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${modelSettings.apiKey}`
          },
          body: JSON.stringify({
            model: apiModel,
            messages: promptMessages,
            temperature: modelSettings.temperature || 0.85,
            stream: true
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let streamedStory = '';
          let isFirstToken = true;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            const lines = chunkValue.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    streamedStory += delta;
                    hasLiveStreamSuccess = true;

                    if (isFirstToken) {
                      isFirstToken = false;
                      const initialBranches = generateContextualBranches(deckId, streamedStory, aiTurnIndex, userActionText, prevBranches);
                      addTurn({
                        isUser: false,
                        model: activeModel,
                        location: currentDeck?.title,
                        story: streamedStory,
                        branches: initialBranches
                      });
                    } else {
                      updateTurn(aiTurnIndex, {
                        isUser: false,
                        model: activeModel,
                        location: currentDeck?.title,
                        story: streamedStory
                      });
                    }
                  }
                } catch (e) {}
              }
            }
          }

          if (hasLiveStreamSuccess && streamedStory) {
            const parsed = parseModelOutput(streamedStory, deckId, aiTurnIndex, userActionText, prevBranches);
            updateTurn(aiTurnIndex, {
              isUser: false,
              model: activeModel,
              location: currentDeck?.title || '室内场景',
              story: parsed.story || streamedStory,
              branches: parsed.branches && parsed.branches.length > 0
                ? parsed.branches
                : generateContextualBranches(deckId, streamedStory, aiTurnIndex, userActionText, prevBranches),
              npcThought: parsed.npcThought,
              modReport: parsed.modReport,
              npcClothes: parsed.npcClothes,
              modifyEffect: parsed.modifyEffect,
              memory: parsed.memory,
              status: parsed.status,
              cot: parsed.cot,
              tl: parsed.tl,
            });
          }
        }
      } catch (err) {
        // Fast failover to local simulator
      }
    }

    // High-fidelity instant typewriter stream fallback
    if (!hasLiveStreamSuccess) {
      const fallback = getFallbackStory(userActionText, aiTurnIndex, prevBranches);
      const fullStory = fallback.story;

      // Add turn immediately with initial chunk so user sees response instant (<100ms)
      const initialChars = fullStory.slice(0, 16);
      addTurn({
        isUser: false,
        model: activeModel || '本地沉浸推演引擎',
        location: currentDeck?.title || '室内场景',
        story: initialChars,
        branches: []
      });

      // Typewriter stream smoothly at 30ms interval
      let currentLen = 16;
      const chunkSize = 16;
      while (currentLen < fullStory.length) {
        currentLen = Math.min(currentLen + chunkSize, fullStory.length);
        const currentSlice = fullStory.slice(0, currentLen);
        const isComplete = currentLen >= fullStory.length;

        updateTurn(aiTurnIndex, {
          isUser: false,
          model: activeModel || '本地沉浸推演引擎',
          location: currentDeck?.title || '室内场景',
          story: currentSlice,
          branches: isComplete ? fallback.branches : []
        });

        if (!isComplete) {
          await new Promise((r) => setTimeout(r, 30));
        }
      }
    }

    setIsLoading(false);
  };

  const handleSend = async (actionText: string) => {
    if (!actionText.trim() || isLoading) return;
    const userTurn = { isUser: true, text: actionText.trim() };
    const nextHistory = [...conversationHistory, userTurn];
    addTurn(userTurn);

    // Smoothly scroll the container to align the user's action at the top
    setTimeout(() => {
      if (latestUserTurnRef.current) {
        latestUserTurnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);

    await runGeneration(nextHistory);
  };

  const handleRegenerate = async (turnIndex: number) => {
    if (isLoading) return;
    const truncated = conversationHistory.slice(0, turnIndex);
    setConversationHistory(truncated);
    await runGeneration(truncated);
  };

  const handleContinueWriting = async (turnIndex: number) => {
    if (isLoading) return;
    handleSend('（请顺应当前这一幕的语境与人物状态，接着往后深层次推演剧情，展开更多细节与对白）');
  };

  const handleEditTurn = (turnIndex: number, newStory: string) => {
    const existing = conversationHistory[turnIndex];
    if (!existing) return;
    updateTurn(turnIndex, {
      ...existing,
      story: newStory,
      text: newStory,
    });
  };

  const handleEditAndResendUserTurn = (turnIndex: number, text: string) => {
    setInputText(text);
    truncateHistory(turnIndex);
  };

  const handleResendUserTurn = async (turnIndex: number) => {
    if (isLoading) return;
    const kept = conversationHistory.slice(0, turnIndex + 1);
    setConversationHistory(kept);
    await runGeneration(kept);
  };

  const handleRetractUserTurn = (turnIndex: number) => {
    truncateHistory(turnIndex);
  };

  const handleRegenerateLast = () => {
    if (isLoading || conversationHistory.length === 0) return;
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      if (!conversationHistory[i].isUser) {
        handleRegenerate(i);
        return;
      }
    }
  };

  const handleScrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const handleContainerDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't trigger if user is interacting with form controls or links
    if (
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('button') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('summary')
    ) {
      return;
    }
    handleScrollToBottom(true);
  };

  return (
    <div className="flex-1 flex min-h-screen">
      {/* Secondary Scenario & Saves Sidebar (Desktop: 270px) */}
      <div className="hidden md:block shrink-0">
        <ScenarioSidebar />
      </div>

      {/* Mobile Slide-out Drawer for Scenario Sidebar */}
      {isMobileScenarioOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileScenarioOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-[#121319] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <ScenarioSidebar onClose={() => setIsMobileScenarioOpen(false)} />
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="重新开卷确认"
        message="确定要重置当前剧本回到第一幕开局吗？当前尚未持久化保存的最新推演记录将重置。"
        confirmText="确认重新开卷"
        cancelText="取消"
        isDestructive={false}
        onConfirm={() => {
          if (currentDeck) startNewStory(currentDeck);
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Main Chat Canvas with container ref & double-click listener */}
      <div
        ref={chatContainerRef}
        onDoubleClick={handleContainerDoubleClick}
        className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto ${bgClass}`}
        title="双击空白处可快速滑动至最后一条记录"
      >
        {/* Theater Sticky Header */}
        <div className="sticky top-0 z-20 border-b border-[#20222e] bg-[#0e0f14]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-1 rounded-lg hover:bg-[#1a1c27] text-gray-400 hover:text-white transition flex items-center gap-1 text-xs shrink-0 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
              <span className="hidden xs:inline">探索</span>
            </Link>

            <span className="text-gray-700 font-mono hidden xs:inline">|</span>

            {/* Mobile Button to open Scenario & Saves */}
            <button
              onClick={() => setIsMobileScenarioOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-[#1b1d28] border border-[#2e3142] text-amber-300 hover:text-white text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              title="查看剧本信息与会话存档"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">存档</span>
            </button>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">
                {isCoser ? '🎀' : isFatherDaughter ? '💔' : isSister ? '👭' : currentDeck?.coverIcon || '📖'}
              </span>
              <span className="font-bold text-xs sm:text-sm text-gray-200 truncate">
                {currentDeck?.title || '沉浸剧场'}
              </span>
              {currentDeck?.badge && (
                <span className="hidden lg:inline px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                  {currentDeck.badge}
                </span>
              )}
            </div>

            <span className="text-gray-700 font-mono hidden sm:inline">|</span>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/50 hover:border-emerald-400 px-2.5 sm:px-3 py-1 rounded-full font-mono cursor-pointer transition shadow-sm shrink-0 group"
              title="点击切换推演大模型或配置 API 密钥"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span suppressHydrationWarning className="font-semibold text-xs">{modelSettings.model || 'deepseek-flash'}</span>
              <span className="text-[10px] text-emerald-400 opacity-70 group-hover:opacity-100 transition">▼</span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] hover:border-emerald-500/50 text-gray-300 hover:text-emerald-300 text-xs flex items-center gap-1 transition cursor-pointer"
              title="切换推演大模型与接口配置"
            >
              <span className="text-xs">⚙️</span>
              <span className="hidden sm:inline text-[11px]">切换模型</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-amber-300 text-xs flex items-center gap-1 transition cursor-pointer"
              title="重置到第一幕开局"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">重新开卷</span>
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-pink-300 text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline text-[11px]">存档抽屉</span>
            </button>
          </div>
        </div>

        {/* Main Dialogue Stream */}
        <div className="flex-1 max-w-3xl mx-auto w-full p-3 sm:p-6 space-y-5 sm:space-y-6 pb-28">
          {conversationHistory.map((turn, idx) => {
            const isLatestUserTurn = turn.isUser && (idx === conversationHistory.length - 1 || idx === conversationHistory.length - 2);

            if (turn.isUser) {
              return (
                <div
                  key={idx}
                  ref={isLatestUserTurn ? latestUserTurnRef : undefined}
                  className="flex flex-col items-end gap-1 group scroll-mt-14"
                >
                  <UserTurnActionBar
                    index={idx}
                    text={turn.text || ''}
                    onEditAndResend={handleEditAndResendUserTurn}
                    onResendFromTurn={handleResendUserTurn}
                    onRetract={handleRetractUserTurn}
                  />
                  <div className="bg-[#242734] text-gray-100 text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-xs max-w-lg shadow-lg border border-[#333748] leading-relaxed font-mono select-text">
                    {turn.text}
                  </div>
                </div>
              );
            }

            if (isCoser) {
              return (
                <CoserCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onSendAction={handleSend}
                  onDelete={(dIdx) => truncateHistory(dIdx)}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                />
              );
            }

            if (isModifier) {
              return (
                <RealityModifierCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onSendAction={handleSend}
                  onDelete={(dIdx) => truncateHistory(dIdx)}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                />
              );
            }

            if (isSister) {
              return (
                <SisterTruthOrDareCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onSendAction={handleSend}
                  onDelete={(dIdx) => truncateHistory(dIdx)}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                />
              );
            }

            if (isFatherDaughter) {
              return (
                <FatherDaughterJealousyCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onSendAction={handleSend}
                  onDelete={(dIdx) => truncateHistory(dIdx)}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                />
              );
            }

            return (
              <GenericCard
                key={idx}
                turn={turn}
                index={idx}
                onSendAction={handleSend}
                onDelete={(dIdx) => truncateHistory(dIdx)}
                onRegenerate={handleRegenerate}
                onContinueWriting={handleContinueWriting}
                onEdit={handleEditTurn}
              />
            );
          })}

          <div ref={streamBottomRef} />
        </div>

        {/* Floating Bottom Input with Docked Toolbar directly above */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          onRegenerateLast={handleRegenerateLast}
          inputText={inputText}
          setInputText={setInputText}
          onScrollToBottom={handleScrollToBottom}
        />
      </div>
    </div>
  );
}
