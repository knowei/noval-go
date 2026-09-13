"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { fetchStory, fetchConversations, fetchConversation } from '@/lib/api';
import { CoserCard } from '@/components/chat/CoserCard';
import { GenericCard } from '@/components/chat/GenericCard';
import { ChatInput } from '@/components/chat/ChatInput';
import { Sparkles, ArrowLeft, RotateCcw, Plus, Trash2, Edit2, History } from 'lucide-react';
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
    addTurn,
    updateTurn,
    truncateHistory,
    startNewStory,
    setIsDrawerOpen,
    modelSettings
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
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
      const activeModel = modelSettings.model || 'deepseek-v3.2';
      const promptMessages = [
        {
          role: 'system',
          content: `你是一名顶级沉浸式小说推演者。当前剧本是《${currentDeck?.title || '未命名'}》。
女主角与场景氛围需根据用户行动推进剧情，细致刻画环境、微表情与情绪变化。
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

  return (
    <div className={`flex-1 flex flex-col min-h-full ${isCoser ? 'coser-sister-bg' : ''}`}>
      {/* Theater Sticky Header */}
      <div className="sticky top-14 z-20 border-b border-[#242734]/80 bg-[#12141c]/90 backdrop-blur-md px-4 sm:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-xl hover:bg-[#1f212c] text-gray-400 hover:text-white transition flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回广场</span>
          </Link>

          <div className="h-4 w-px bg-gray-700" />

          <div className="flex items-center gap-2">
            <span className="text-lg">{isCoser ? '🎀' : currentDeck?.coverIcon || '📖'}</span>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-gray-100 flex items-center gap-1.5 font-mono">
                <span>{currentDeck?.title || '沉浸剧场'}</span>
                {currentDeck?.badge && (
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {currentDeck.badge}
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentDeck && confirm('确定要重新开始本剧本第一幕吗？当前进度将重置。')) {
                startNewStory(currentDeck);
              }
            }}
            className="px-2.5 py-1 rounded-xl bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-amber-300 text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="重置到第一幕开局"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">重新开卷</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-2.5 py-1 rounded-xl bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-pink-300 text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[11px]">存档</span>
          </button>
        </div>
      </div>

      {/* Main Dialogue Stream */}
      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6 pb-28">
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
  );
}
