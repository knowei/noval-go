"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchStory, fetchConversations, fetchConversation } from '@/lib/api';
import { CoserCard } from '@/components/chat/CoserCard';
import { GenericCard } from '@/components/chat/GenericCard';
import { RealityModifierCard } from '@/components/chat/RealityModifierCard';
import { SisterTruthOrDareCard } from '@/components/chat/SisterTruthOrDareCard';
import { FatherDaughterJealousyCard } from '@/components/chat/FatherDaughterJealousyCard';
import { ChatInput } from '@/components/chat/ChatInput';
import { ScenarioSidebar } from '@/components/chat/ScenarioSidebar';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Sparkles, ArrowLeft, RotateCcw, Plus, Trash2, Edit2, History, Menu, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = (params?.deckId as string) || 'deck_coser_sister';

  const {
    currentUserId,
    currentDeck,
    setCurrentDeck,
    conversationHistory,
    setConversationHistory,
    setCurrentConversationId,
    addTurn,
    updateTurn,
    truncateHistory,
    startNewStory,
    setIsDrawerOpen,
    setIsSettingsOpen,
    modelSettings
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isMobileScenarioOpen, setIsMobileScenarioOpen] = useState(false);
  const streamBottomRef = useRef<HTMLDivElement>(null);

  // Load Deck and Save on mount
  useEffect(() => {
    async function init() {
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

  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isLoading]);

  const handleSend = async (actionText: string) => {
    if (!actionText.trim() || isLoading) return;

    // 1. Add user turn
    const userTurn = { isUser: true, text: actionText };
    addTurn(userTurn);
    setIsLoading(true);

    try {
      // 2. Prepare context for AI call
      const activeModel = modelSettings.model || 'deepseek-flash';
      const promptMessages = [
        {
          role: 'system',
          content: `你是一名顶级沉浸式小说推演者。当前剧本是《${currentDeck?.title || '未命名'}》。
女主与场景氛围需根据用户行动推进剧情，细致刻画环境、微表情与情绪变化。
请严格输出高质量文学叙事，并在结尾提供 2-4 个下一步行动选项。`
        },
        ...conversationHistory.slice(-6).map((h) => ({
          role: h.isUser ? 'user' : 'assistant',
          content: h.text || h.story || ''
        })),
        { role: 'user', content: actionText }
      ];

      // Temporary placeholder AI turn
      const aiTurnIndex = conversationHistory.length + 1;
      let generatedStory = '';

      if (modelSettings.apiKey) {
        // Real API Stream via Proxy
        const targetUrl = `${modelSettings.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
        const resp = await fetch(`/proxy?target=${encodeURIComponent(targetUrl)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${modelSettings.apiKey}`
          },
          body: JSON.stringify({
            model: activeModel,
            messages: promptMessages,
            temperature: modelSettings.temperature || 0.85,
            stream: true
          })
        });

        if (resp.ok && resp.body) {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let done = false;

          addTurn({
            isUser: false,
            model: activeModel,
            location: currentDeck?.title,
            story: '...',
            branches: []
          });

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
                  generatedStory += delta;
                  updateTurn(aiTurnIndex, {
                    isUser: false,
                    model: activeModel,
                    location: currentDeck?.title,
                    story: generatedStory,
                    branches: [
                      { tag: 'A', title: '顺应当前气氛', desc: '根据当前情境做进一步互动' },
                      { tag: 'B', title: '主动试探心意', desc: '进一步追问她的真实想法' }
                    ]
                  });
                } catch (e) {}
              }
            }
          }
        }
      } else {
        // Local high-fidelity simulator
        await new Promise((r) => setTimeout(r, 800));

        let simStory = '';
        if (deckId === 'deck_coser_sister') {
          simStory = `听到你的回答，林知念捏着裙摆的手指稍稍松开了一些，但耳尖的薄红却依旧没有褪去。
她悄悄抬起眼帘看了你一眼，在迎上你视线的瞬间又触电般移开，长长的睫毛在晚霞中轻轻颤动：
“哥……你、你刚才那句话是认真的吗？要是骗我……我以后就真的一套都不穿给你看了……”
虽然嘴上哼了一声，但她身后的落地镜里，少女翘起的唇角却已经出卖了她藏不住的窃喜。`;
        } else {
          simStory = `听到你的指令，场间的气氛微微一滞。窗外的风声掠过树梢，带起一阵沙沙轻响。
对方抬起眼帘望向你，眼底闪过一丝深思与隐秘的动摇，似乎正在重新评估你的意图与彼此之间的微妙距离。`;
        }

        addTurn({
          isUser: false,
          model: '本地沉浸推演引擎',
          location: currentDeck?.title || '室内场景',
          story: simStory,
          branches: [
            { tag: 'A', title: '走上前轻抚她的头发', desc: '打破沉默给予她最安心的确认' },
            { tag: 'B', title: '拿出相机替她拍照', desc: '“既然只穿给我看，那自然也要由我来做独家摄影师”' },
            { tag: 'C', title: '故作平静地递过饮料', desc: '用温和的日常方式化解她的羞赧' }
          ]
        });
      }
    } catch (err) {
      console.error('AI Stream generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isCoser = deckId === 'deck_coser_sister';
  const isModifier = deckId === 'deck_reality_modifier';
  const isSister = deckId === 'deck_sister_truth_or_dare' || deckId === '6ffc2ab9-2907-4304-b0bb-53c0a950b445';
  const isFatherDaughter = deckId === 'deck_father_daughter_jealousy' || deckId === '1f97a5c2-3e5b-48e2-aa3a-893a9332765c';
  const bgClass = isCoser ? 'coser-sister-bg' : (isModifier ? 'reality-modifier-bg' : '');

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

      {/* Main Chat Canvas */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto ${bgClass}`}>
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
              <span className="font-semibold text-xs">{modelSettings.model || 'deepseek-flash'}</span>
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
            if (turn.isUser) {
              return (
                <div key={idx} className="flex flex-col items-end gap-1 group">
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
              />
            );
          })}

          <div ref={streamBottomRef} />
        </div>

        {/* Floating Bottom Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}

