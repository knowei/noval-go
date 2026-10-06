"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  History,
  Sparkles,
  Share2,
  Download,
  Copy,
  Check,
  X,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Puzzle
} from 'lucide-react';

import { isCheckpointId, useAppStore } from '@/lib/store';
import { fetchStory, fetchConversations, fetchConversation, getSiteToken, clearSiteToken } from '@/lib/api';
import { selectReplyVersion, resolveSnapshot, PromptReport } from '@/lib/sessionEngine';
import { applyModExtensions } from '@/lib/modExtensions';
import { streamCompletion, CompletionStreamError, CompletionUsage } from '@/lib/streamCompletion';
import { inspectReplyEnvelope, mergeReplyContinuation } from '@/lib/replyEnvelope';
import { safeRandomUUID } from '@/lib/uuid';
import { ReplyCompletionNotice } from '@/components/chat/ReplyCompletionNotice';
import { prepareSessionRequest, completeSessionReply } from '@/lib/playtestRuntime';
import { storyOpenings } from '@/lib/storyDiagnostics';
import { SessionWorkbench } from '@/components/chat/SessionWorkbench';
import { ScenePresentation } from '@/components/chat/ScenePresentation';
import { Turn, LoreEntry } from '@/lib/types';
import { soundEngine } from '@/lib/soundEngine';
import { getDeckLorebook } from '@/lib/lorebookEngine';
import { ScenarioSidebar } from '@/components/chat/ScenarioSidebar';
import { ChatInput, ChatInputHandle } from '@/components/chat/ChatInput';
import { CoserCard } from '@/components/chat/CoserCard';
import { RealityModifierCard } from '@/components/chat/RealityModifierCard';
import { SisterTruthOrDareCard } from '@/components/chat/SisterTruthOrDareCard';
import { FatherDaughterJealousyCard } from '@/components/chat/FatherDaughterJealousyCard';
import { GenericCard } from '@/components/chat/GenericCard';
import { ApocalypseSurvivalCard } from '@/components/chat/ApocalypseSurvivalCard';
import { UserTurnActionBar } from '@/components/chat/UserTurnActionBar';
import { ErrorCard } from '@/components/chat/ErrorCard';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { LorebookModal } from '@/components/chat/LorebookModal';
import { InteractiveHandbookCard } from '@/components/InteractiveHandbookCard';
import { FloatingStatusHud } from '@/components/chat/FloatingStatusHud';
import { scopeDeckCustomCss } from '@/lib/scopeCss';
import { registerDeckCgMap, extractCgMapFromCss } from '@/lib/cgManager';
import { RichStoryRenderer } from '@/components/chat/RichStoryRenderer';

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
    setSavedConversations,
    addTurn,
    updateTurn,
    truncateHistory,
    replaceHistoryWithCheckpoint,
    isBranching,
    currentConversationId,
    setCurrentConversationId,
    startNewStory,
    modelSettings,
    toggleRoleplayMode,
    setIsSettingsOpen,
    setIsDrawerOpen,
    isModCenterOpen,
    setIsModCenterOpen,
    enabledMods,
    sessionSettings,
    saveError,
    setIsSiteUnlocked,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  // 推理模型的思考进度（只记长度，不保存思考正文）
  const [thinkingChars, setThinkingChars] = useState(0);
  const [isDeckReady, setIsDeckReady] = useState(false);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [promptReport, setPromptReport] = useState<PromptReport | null>(null);
  const generationRef = useRef<AbortController | null>(null);
  const generationContext = useRef('');
  generationContext.current = [currentUserId, currentConversationId, deckId].join(':');
  useEffect(() => {
    setPromptReport(null); setActiveLoreEntries([]); setIsLoading(false);
    return () => { generationRef.current?.abort(); generationRef.current = null; };
  }, [currentUserId, currentConversationId, deckId]);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [isMobileScenarioOpen, setIsMobileScenarioOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRainActive, setIsRainActive] = useState(false);
  const [isLorebookOpen, setIsLorebookOpen] = useState(false);
  const [activeLoreEntries, setActiveLoreEntries] = useState<LoreEntry[]>([]);
  const [isHeaderMoreOpen, setIsHeaderMoreOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const activeModCount = enabledMods ? Object.values(enabledMods).filter(Boolean).length : 0;

  // ---------------------------------------------------------------------------
  // 长会话性能基础设施
  // 超长会话（数百幕）原先会因为“每次流式更新都重渲染全部卡片 + 重算整条历史”
  // 把主线程占满，表现为页面无响应、CPU 狂转。下面三项分别解决这个问题：
  //   1) isLoadingRef / isDeckReadyRef：让事件回调能读到最新值而不必进依赖数组，
  //      从而保持稳定身份，让子组件的 React.memo 真正生效；
  //   2) 渲染窗口：只挂载最近 N 幕，避免上千个 DOM 节点同时参与布局与绘制；
  //   3) 快照签名：状态快照只在“已完成幕”变化时重算。
  // ---------------------------------------------------------------------------
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;
  const isDeckReadyRef = useRef(isDeckReady);
  isDeckReadyRef.current = isDeckReady;
  // runGeneration 现在是稳定引用（依赖为空），因此路由参数也必须通过 ref 读取最新值
  const deckIdRef = useRef(deckId);
  deckIdRef.current = deckId;

  const TURN_WINDOW = 30;
  const [visibleCount, setVisibleCount] = useState(TURN_WINDOW);

  const completedTurns = useMemo(
    () => conversationHistory.filter((t) => t && !t.isUser && !t.isError && !t.incomplete),
    [conversationHistory]
  );
  const lastCompletedTurn = completedTurns[completedTurns.length - 1];
  const snapshotKey = `${currentConversationId}|${completedTurns.length}|${lastCompletedTurn?.imageOriginId ?? ''}|${lastCompletedTurn?.rawText?.length ?? 0}`;
  const currentSnapshotState = useMemo(
    () => resolveSnapshot(useAppStore.getState().conversationHistory).state,
    // 只以快照签名作为依赖：流式期间签名不变，因此不再逐帧重算整条历史。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapshotKey]
  );

  useEffect(() => {
    setIsMounted(true);
    try {
      setIsSidebarCollapsed(localStorage.getItem('rp_sidebar_collapsed') === '1');
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('rp_sidebar_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // Stop ambient sound on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopRain();
    };
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const latestUserTurnRef = useRef<HTMLDivElement>(null);
  const streamBottomRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolledRef = useRef(false);

  const generateStoryExportText = () => {
    const title = currentDeck?.title || '沉浸式推演剧本';
    const lines = [
      `# 《${title}》· 剧情推演全景录`,
      `> 导出时间：${new Date().toLocaleString('zh-CN')} | 共 ${conversationHistory.length} 幕互动\n`,
      '---',
      ''
    ];

    conversationHistory.forEach((t, i) => {
      if (!t) return;
      if (t.isUser) {
        lines.push(`### 🧑 第 ${i + 1} 幕 · 玩家抉择\n`);
        lines.push(`${t.text || ''}\n`);
      } else {
        lines.push(`### 📖 第 ${i + 1} 幕 · 剧场演进\n`);
        lines.push(`${t.story || ''}\n`);
        if (t.npcThought) {
          lines.push(`> 💭 角色内心动摇：${t.npcThought}\n`);
        }
        if (t.branches && t.branches.length > 0) {
          lines.push('**可选走向分支：**');
          t.branches.forEach((b, bi) => {
            lines.push(`- 分支 ${bi + 1} [${b.title}]: ${b.desc || ''}`);
          });
          lines.push('');
        }
      }
      lines.push('---\n');
    });

    return lines.join('\n');
  };

  const handleCopyStory = () => {
    const text = generateStoryExportText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadStory = (format: 'txt' | 'md') => {
    const text = generateStoryExportText();
    const blob = new Blob([text], {
      type: format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentDeck?.title || '剧情推演').replace(/[/\\?%*:|"<>]/g, '_')}_推演全景记录.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
    let cancelled = false;
    setIsDeckReady(false);
    async function init() {
      if (!deckId) return;

      const deck = await fetchStory(deckId);
      if (cancelled) return;
      if (deck) {
        setCurrentDeck(deckId, deck);
        if (deck.cgMap) {
          registerDeckCgMap(deckId, deck.cgMap);
        } else if (deck.customCss) {
          registerDeckCgMap(deckId, extractCgMapFromCss(deck.customCss));
        }

        // Check if there are existing saves for this deck
        const saves = await fetchConversations(currentUserId);
        if (cancelled) return;
        setSavedConversations(saves);

        const isMatchDeck = (s: any) => {
          if (!deckId) return true;
          if (s.deck_id === deckId) return true;
          if (deckId === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7' && s.deck_id === 'deck_xiuxian_world') return true;
          if (deckId === 'deck_xiuxian_world' && s.deck_id === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7') return true;
          if (deckId === 'b93fc029-e704-42e1-a1a8-d51c62fc8b55' && s.deck_id === 'deck_suyu_contract') return true;
          if (deckId === 'deck_suyu_contract' && s.deck_id === 'b93fc029-e704-42e1-a1a8-d51c62fc8b55') return true;
          if (deckId === '2c10c41f-de54-407a-a6e0-a1475b0f2d33' && s.deck_id === 'deck_wife_business_trip') return true;
          if (deckId === 'deck_wife_business_trip' && s.deck_id === '2c10c41f-de54-407a-a6e0-a1475b0f2d33') return true;
          if (deck?.title && s.deck_title) {
            if (s.deck_title === deck.title) return true;
            if (s.deck_title.includes(deck.title) || deck.title.includes(s.deck_title)) return true;
          }
          return false;
        };

        const deckSaves = saves.filter(s => !isCheckpointId(s.id) && isMatchDeck(s));

        if (deckSaves.length > 0 && deckSaves[0].id) {
          const loaded = await fetchConversation(deckSaves[0].id);
          if (cancelled) return;
          const isDummyOnly = Boolean(
            loaded &&
            loaded.history &&
            loaded.history.length === 1 &&
            !loaded.history[0].isUser &&
            (loaded.history[0].location === '场景开局' ||
             loaded.history[0].story?.includes('故事拉开帷幕的初始场景') ||
             loaded.history[0].story?.includes('你已正式进入【'))
          );

          if (loaded && loaded.history && loaded.history.length > 0 && !isDummyOnly) {
            setCurrentConversationId(loaded.id);
            setConversationHistory(loaded.history);
            setIsDeckReady(true);
            return;
          }
        }

        // Start new story if no previous saves
        startNewStory(deck);
        setIsDeckReady(true);
      }
    }
    void init();
    return () => { cancelled = true; };
  }, [deckId, currentUserId]);

  const isCoser = deckId === 'deck_coser_sister';
  const isModifier = deckId === 'deck_reality_modifier';
  const isSister = deckId === 'deck_sister_truth_or_dare' || deckId === '6ffc2ab9-2907-4304-b0bb-53c0a950b445';
  const isFatherDaughter = deckId === 'deck_father_daughter_jealousy' || deckId === '1f97a5c2-3e5b-48e2-aa3a-893a9332765c';
  const isRentApartment = deckId === 'deck_rent_apartment' || deckId === '1134c46b-04e5-4107-b68d-b24a479650fe';
  const isNudeHousekeeping = deckId === 'deck_nude_housekeeping' || deckId === '239451db-b3db-48ff-9849-836c928fc402';
  const isCousinStay = deckId === 'deck_cousin_stay' || deckId === '433116bf-627e-441b-9add-cb99a3ee0349';
  const isFriendSister = deckId === 'deck_friend_sister' || deckId === '9ba0424a-3278-4fae-b8ea-4fb4d00e2d90';
  const isJiangshiAyane = deckId === 'deck_jiangshi_childhood' || deckId === '722f860e-1011-4123-bc92-8373fa38deca';
  const isAtour = deckId === 'deck_atour_app' || deckId === '1ad4e5fd-7d79-4dd4-a3f3-d9581110c81a';
  const isHeisiDaughter = deckId === 'deck_heisi_daughter' || deckId === 'c78de7d8-7353-467e-bc71-5e6f2c870679';
  const isSisterInLawNiece = deckId === 'deck_sister_in_law_niece' || deckId === '432a57e9-8f8a-4e4e-80fc-83eb9ebc71eb';
  const isApocalypse = deckId === 'deck_apocalypse_survival' || deckId === '059217c9-213b-48e7-b660-0c04f78ede48';
  const isYuzuki = deckId === 'deck_yuzuki';
  const isSuccubusWife = deckId === 'deck_succubus_wife' || deckId === '4881f4b1-dfd0-45cb-8e3a-f7b880f66635';
  const isPerfectGirl = deckId === 'deck_perfect_girl_plan' || deckId === 'eb85f366-919b-466e-a7ff-8d8dbc4ed29b';
  const isDaughterMorningWood = deckId === 'deck_daughter_morning_wood' || deckId === 'b64f6c60-f3b0-438b-91ef-51362dbb4ce4';
  const isTenYuanChildhood = deckId === 'deck_ten_yuan_childhood_friend' || deckId === '6575c840-e7d2-4fdc-a752-b111d9bdf5b8';
  const isGirlsDormitory = deckId === 'deck_girls_dormitory' || deckId === 'e59fe31f-98c7-4b85-9f84-262f5d13bc32';
  const isHousewifeApartment = deckId === 'deck_housewife_apartment' || deckId === '57879274-30f5-4411-957f-2a33bdd2e031';
  const isNudeGirlsSchool = deckId === 'deck_nude_girls_school' || deckId === '087637dd-b4ba-4588-ac91-cd6361d47be0';
  const isIdolSister = deckId === 'deck_idol_sister_debt' || deckId === '3a67a4de-41a4-42ed-8187-af35365d6768';
  const isTwinIdols = deckId === 'deck_twin_idols_fiancee' || deckId === 'ca94cd1d-74e0-4e13-8ff0-f5ed93688866';
  const isBrotherLoli = deckId === 'deck_brother_loli_girlfriend' || deckId === '6836f15a-b43f-47a2-b962-d57362fcfd35';
  const isWhiteTigerSister = deckId === 'deck_white_tiger_sister_night' || deckId === 'e2cb7a3e-dbaa-40a7-831c-2961508083b0';
  const isGradeFirst = deckId === 'deck_grade_first_demands' || deckId === '2da05c45-b6c2-49a1-89ee-d9c2d732d9ed';
  const isMysteriousRecovery = deckId === 'deck_mysterious_recovery_ghost' || deckId === '0881314d-a2ed-4e78-a5af-71dc42e9acac';
  const isMouthFeedSister = deckId === 'deck_mouth_feed_sister' || deckId === '270a0ccb-ac28-4b9b-ac56-f7e6aa8cff41';
  const isXiuxianWorld = deckId === 'deck_xiuxian_world' || deckId === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7';
  const isDaughterDoorBlock = deckId === 'deck_daughter_door_block' || deckId === '2168197e-903b-4727-97e3-bf5f1d5b6c8f';
  const isMotherSisterBaby = deckId === 'deck_mother_sister_baby' || deckId === '758e40b4-c1b3-4655-a83a-5ef136b60a2b';

  let bgClass = '';
  if (isCoser) bgClass = 'coser-sister-bg';
  else if (isModifier) bgClass = 'reality-modifier-bg';
  else if (isSister) bgClass = 'sister-truth-bg';
  else if (isFatherDaughter) bgClass = 'father-daughter-bg';
  else if (isRentApartment) bgClass = 'rent-apartment-bg';
  else if (isNudeHousekeeping) bgClass = 'nude-housekeeping-bg';
  else if (isCousinStay) bgClass = 'cousin-stay-bg';
  else if (isFriendSister) bgClass = 'friend-sister-bg';
  else if (isJiangshiAyane) bgClass = 'jiangshi-ayane-bg';
  else if (isAtour) bgClass = 'atour-app-bg';
  else if (isHeisiDaughter) bgClass = 'heisi-daughter-bg';
  else if (isSisterInLawNiece) bgClass = 'sister-in-law-bg';
  else if (isApocalypse) bgClass = 'apocalypse-survival-bg';
  else if (isYuzuki) bgClass = 'yuzuki-bg';
  else if (isSuccubusWife) bgClass = 'succubus-wife-bg';
  else if (isPerfectGirl) bgClass = 'perfect-girl-bg';
  else if (isDaughterMorningWood) bgClass = 'daughter-morning-bg';
  else if (isTenYuanChildhood) bgClass = 'ten-yuan-bg';
  else if (isGirlsDormitory) bgClass = 'girls-dormitory-bg';
  else if (isHousewifeApartment) bgClass = 'housewife-apartment-bg';
  else if (isNudeGirlsSchool) bgClass = 'nude-girls-school-bg';
  else if (isIdolSister) bgClass = 'idol-sister-bg';
  else if (isTwinIdols) bgClass = 'twin-idols-bg';
  else if (isBrotherLoli) bgClass = 'brother-loli-bg';
  else if (isWhiteTigerSister) bgClass = 'white-tiger-bg';
  else if (isGradeFirst) bgClass = 'grade-first-bg';
  else if (isMysteriousRecovery) bgClass = 'mysterious-recovery-bg';
  else if (isMouthFeedSister) bgClass = 'mouth-feed-bg';
  else if (isXiuxianWorld) bgClass = 'xiuxian-world-bg';
  else if (isDaughterDoorBlock) bgClass = 'daughter-door-block-bg';
  else if (isMotherSisterBaby) bgClass = 'mother-sister-baby-bg';

  const scopedCss = React.useMemo(
    () => scopeDeckCustomCss(currentDeck?.customCss, 'story-custom-scope'),
    [currentDeck?.customCss]
  );

  // 渲染窗口：只挂载最近 visibleCount 幕。数百幕全部挂载会让布局/绘制成本随幕数线性增长，
  // 这是超长会话在手机端直接卡死的第二个主因。
  const validHistory = useMemo(
    () => conversationHistory.filter((t): t is Turn => Boolean(t && typeof t === 'object')),
    [conversationHistory]
  );
  const windowStart = Math.max(0, validHistory.length - visibleCount);
  const visibleTurns = windowStart > 0 ? validHistory.slice(windowStart) : validHistory;

  const runGeneration = useCallback(async (historyContext: Turn[], existingSwipes?: Turn[], repair?: Turn) => {
    if (generationRef.current) return;
    setIsLoading(true);
    setPromptReport(null);
    setThinkingChars(0);
    // 用 getState() 读取最新值：既能保证取值永远最新，又不必写进依赖数组，
    // 这样 runGeneration 及依赖它的回调都能保持稳定身份。
    const live = useAppStore.getState();
    const modelSettings = live.modelSettings;
    // 把模组中心的开关翻译成声明式扩展（尾部 system 钩子）后再组装提示词，
    // 否则这些开关只影响界面显示，对模型毫无作用。
    const sessionSettings = applyModExtensions(live.sessionSettings, live.enabledMods);
    const currentDeck = live.currentDeck;
    const currentUserId = live.currentUserId;
    const currentConversationId = live.currentConversationId;
    const activeModel = modelSettings.model || 'deepseek-flash';
    const lastUserTurn = historyContext[historyContext.length - 1];
    const userActionText = lastUserTurn?.text || '';
    const aiTurnIndex = historyContext.length;

    // 全局历史分支搜集，用于全局强防重
    const allHistoryBranches = historyContext.flatMap((t: Turn) => t.branches || []);

    // 获取最近一轮带有推荐分支的 AI 回复，用于严格去重与分支递进
    const prevAiTurn = [...historyContext].reverse().find((h) => !h.isUser && h.branches && h.branches.length > 0);
    const prevBranches = prevAiTurn?.branches;

    let hasLiveStreamSuccess = false;
    const repairPrefix = repair ? repair.rawText || repair.story || repair.text || '' : '';
    let streamedStory = repairPrefix;
    let receivedSuffix = '';
    let usage: CompletionUsage | undefined;
    const startedAt = Date.now();
    let finishReason = 'done_only';

    // 检查是否配置了 API Key 或指定了服务地址
    const hasApiKey = Boolean(modelSettings.apiKey && modelSettings.apiKey.trim().length > 0);
    const hasCustomBaseUrl = Boolean(
      modelSettings.baseUrl &&
      modelSettings.baseUrl.trim().length > 0 &&
      !modelSettings.baseUrl.includes('api.openai.com')
    );

    if (!hasApiKey && !hasCustomBaseUrl) {
      addTurn({
        isUser: false,
        isError: true,
        error: '未配置大模型 API Key。请点击右上角【设置】或卡片上的【检查模型设置】填入 API Key 与 Base URL，然后再开启剧情推演。',
        model: activeModel,
        location: currentDeck?.title || '系统提示'
      });
      setIsLoading(false);
      return;
    }

    const requestContext = generationContext.current;
    const isCurrent = () => requestContext === generationContext.current && useAppStore.getState().currentConversationId === currentConversationId && useAppStore.getState().currentUserId === currentUserId;
    const controller = new AbortController();
    generationRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 300000);
    try {
      if (!currentDeck) throw new Error('剧本尚未加载');
      const report = await prepareSessionRequest(currentDeck, historyContext, sessionSettings, getDeckLorebook(deckIdRef.current, currentDeck.lorebook), repair ? repairPrefix : undefined);
      if (!isCurrent() || controller.signal.aborted) return;
      setPromptReport(report);
      const activeEntries = report.activeLore;
      setActiveLoreEntries(activeEntries);
      const promptMessages = report.messages;

      const targetUrl = `${modelSettings.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
      const apiModel = targetUrl.includes('deepseek.com') && (activeModel === 'deepseek-flash' || activeModel === 'deepseek-v4-pro')
        ? 'deepseek-chat'
        : activeModel;

      const siteToken = getSiteToken();
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modelSettings.apiKey || ''}`
      };
      if (siteToken) {
        requestHeaders['x-site-token'] = siteToken;
      }

      const resp = await fetch(`/proxy?target=${encodeURIComponent(targetUrl)}`, {
        method: 'POST',
        headers: requestHeaders,
        credentials: 'include',
        body: JSON.stringify({
          model: apiModel,
          messages: promptMessages,
          temperature: sessionSettings.sampling.temperature ?? modelSettings.temperature ?? 0.7,
          top_p: sessionSettings.sampling.topP ?? modelSettings.topP ?? 0.95,
          max_tokens: sessionSettings.responseTokens,
          stream: true
        }),
        signal: controller.signal
      });

      if (!isCurrent()) return;

      if (!resp.ok) {
        let errDetail = `模型服务响应异常 (HTTP ${resp.status})`;
        try {
          const errData = await resp.json();
          if (errData?.error) {
            errDetail = typeof errData.error === 'string' ? errData.error : (errData.error.message || JSON.stringify(errData.error));
          } else if (errData?.message) {
            errDetail = errData.message;
          }
        } catch {
          try {
            const rawText = await resp.text();
            if (rawText) errDetail = `${errDetail}: ${rawText.slice(0, 200)}`;
          } catch {}
        }

        if (resp.status === 401 && (errDetail.includes('密码') || errDetail.includes('未授权'))) {
          clearSiteToken();
          setIsSiteUnlocked(false);
        }

        addTurn({
          isUser: false,
          isError: true,
          error: errDetail,
          model: activeModel,
          location: currentDeck?.title || '推演异常'
        });
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error('模型没有返回可读的回复');
      if (repair) {
        hasLiveStreamSuccess = true;
        addTurn({isUser:false,model:activeModel,location:currentDeck.title,rawText:repairPrefix,story:inspectReplyEnvelope(repairPrefix).story,branches:[],runtimeVersion:1,incomplete:true});
      }
      let lastUpdateTime = 0;
      let lastThinkingUpdate = 0;
      for await (const delta of streamCompletion(resp.body, reason => { finishReason = reason; }, value => { usage = value; }, (chars) => {
        // 思考进度按 400ms 节流上报：既让用户看到“确实在思考”，又不至于每个思考增量都触发渲染
        const now = Date.now();
        if (now - lastThinkingUpdate > 400) {
          lastThinkingUpdate = now;
          setThinkingChars(chars);
        }
      })) {
        if (!isCurrent()) { controller.abort(); return; }
        receivedSuffix += delta;
        streamedStory = repair ? mergeReplyContinuation(repairPrefix, receivedSuffix) : receivedSuffix;
        if (!hasLiveStreamSuccess) {
          hasLiveStreamSuccess = true;
          // 流式期间只保存原文：卡片此时走轻量纯文本渲染，
          // 不再对不断增长的全文反复跑多轮正则（旧实现单次更新要做 5 遍全文扫描）。
          addTurn({ isUser: false, model: activeModel, location: currentDeck.title, rawText: streamedStory, story: '', branches: [], runtimeVersion: 1, incomplete: true });
        } else if (Date.now() - lastUpdateTime > 120) {
          lastUpdateTime = Date.now();
          updateTurn(aiTurnIndex, { rawText: streamedStory, incomplete: true });
        }
      }
      if (!receivedSuffix.trim()) throw new Error('模型没有返回新的正文，请重试；已保留原有内容。');
      const parsed = await completeSessionReply(streamedStory, historyContext, sessionSettings, true);
      if (!isCurrent()) return;
      const currentGeneratedTurn: Turn = {
        ...parsed, model: activeModel, location: currentDeck.title, activeLoreEntries: activeEntries, imageOriginId: safeRandomUUID(), illustrations: [],
        completion: { reason: finishReason, responseTokens: sessionSettings.responseTokens, protocolVersion: 2, receivedChars: receivedSuffix.length, elapsedMs: Date.now()-startedAt, repairs: repair ? (repair.completion?.repairs || 0)+1 : 0, usage },
      };
      currentGeneratedTurn.snapshot = resolveSnapshot([...historyContext, currentGeneratedTurn]);
      const finalSwipes = existingSwipes?.length ? [...existingSwipes, currentGeneratedTurn] : undefined;
      updateTurn(aiTurnIndex, { ...currentGeneratedTurn, swipes: finalSwipes, swipeIndex: finalSwipes ? finalSwipes.length - 1 : undefined });
      if (currentGeneratedTurn.incomplete) void useAppStore.getState().autoSave();
      setTimeout(() => {
        if (!isCurrent()) return;
        // 内联滚动，避免 runGeneration 依赖 handleScrollToBottom 而失去稳定身份
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
      }, 150);
    } catch (err: unknown) {
      if (!isCurrent()) return;
      const error = err instanceof Error ? err : new Error(String(err));
      const message = error.name === 'AbortError' ? '生成已中断或超时。可以重新生成；未完成的回复不会进入记忆。' : error.message;
      if (hasLiveStreamSuccess) {
        updateTurn(aiTurnIndex, { rawText: streamedStory, story: inspectReplyEnvelope(streamedStory).story, incomplete: true, status: {}, memory: [], memoryEntries: [], branches: [], runtimeWarnings: [message], completion: { reason: error instanceof CompletionStreamError ? error.reason : error.name === 'AbortError' ? 'interrupted' : 'error', responseTokens: sessionSettings.responseTokens, protocolVersion: 2, receivedChars: receivedSuffix.length, elapsedMs: Date.now()-startedAt, repairs: repair ? (repair.completion?.repairs || 0)+1 : 0, usage } });
        void useAppStore.getState().autoSave();
      } else {
        addTurn({ isUser: false, isError: true, error: message, model: activeModel });
      }
    } finally {
      clearTimeout(timeoutId);
      if (generationRef.current === controller) generationRef.current = null;
      if (isCurrent()) setIsLoading(false);
      setThinkingChars(0);
    }

  }, []);

  const handleSend = useCallback(async (actionText: string) => {
    const live = useAppStore.getState();
    if (!actionText.trim() || isLoadingRef.current || live.isBranching || generationRef.current || !isDeckReadyRef.current) return;
    const userTurn: Turn = { isUser: true, text: actionText.trim() };
    let baseHistory = live.conversationHistory;
    if (baseHistory.length === 0 && live.currentDeck) {
      const openings = storyOpenings(live.currentDeck, live.sessionSettings);
      if (openings.length > 0) {
        addTurn(openings[0]);
        baseHistory = [openings[0]];
      }
    }
    const nextHistory = [...baseHistory, userTurn];
    addTurn(userTurn);

    // Smoothly scroll the container to align the user's action at the top
    setTimeout(() => {
      if (latestUserTurnRef.current) {
        latestUserTurnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);

    await runGeneration(nextHistory);
  }, [addTurn, runGeneration]);

  const handleRegenerate = useCallback(async (turnIndex: number) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    const history = live.conversationHistory;
    const existingTurn = history[turnIndex];
    if (!existingTurn) return;

    // Preserves existing version in swipes list if not already there (unless it was an error turn)
    const existingSwipes = !existingTurn.isError && existingTurn.swipes && existingTurn.swipes.length > 0
      ? [...existingTurn.swipes]
      : (!existingTurn.isError && (existingTurn.story || existingTurn.text) ? [{ ...existingTurn }] : undefined);

    const truncated = history.slice(0, turnIndex);
    if (!await replaceHistoryWithCheckpoint(truncated, '重新生成前')) return;
    await runGeneration(truncated, existingSwipes);
  }, [replaceHistoryWithCheckpoint, runGeneration]);

  const handleRepairReply = useCallback(async (turnIndex: number) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    const history = live.conversationHistory;
    const original = history[turnIndex];
    if (!original || original.isUser || original.isError || original.completion?.reason === 'content_filter') return;
    const versions = original.swipes?.length ? [...original.swipes] : [{...original}];
    const truncated = history.slice(0,turnIndex);
    if (!await replaceHistoryWithCheckpoint(truncated,'补全回复前')) return;
    await runGeneration(truncated,versions,original);
  }, [replaceHistoryWithCheckpoint, runGeneration]);

  const handleSwipeChange = useCallback(async (turnIndex: number, newSwipeIndex: number) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    const history = live.conversationHistory;
    if ((history[turnIndex]?.swipeIndex ?? 0) === newSwipeIndex) return;
    const next = selectReplyVersion(history, turnIndex, newSwipeIndex);
    if (next !== history) await replaceHistoryWithCheckpoint(next, '切换回复前');
  }, [replaceHistoryWithCheckpoint]);

  const handleContinueWriting = useCallback(async (turnIndex: number) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    const history = live.conversationHistory;
    const kept = history.slice(0, turnIndex + 1);
    const userTurn: Turn = { isUser: true, text: '请根据当前场景继续，给我留出回应的空间。' };
    const next = [...kept, userTurn];
    if (kept.length < history.length) {
      if (!await replaceHistoryWithCheckpoint(next, '从旧消息续写前')) return;
    } else {
      addTurn(userTurn);
    }
    await runGeneration(next);
  }, [addTurn, replaceHistoryWithCheckpoint, runGeneration]);

  const handleEditTurn = useCallback(async (turnIndex: number, newStory: string) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    const history = live.conversationHistory;
    const existing = history[turnIndex];
    if (!existing) return;
    const next = history.slice(0, turnIndex + 1);
    next[turnIndex] = { ...existing, story: newStory, text: newStory, rawText: newStory, displayText: undefined, memory: [], memoryEntries: [], status: {}, snapshot: undefined, swipes: undefined, swipeIndex: undefined, imageOriginId: undefined, illustrations: [] };
    await replaceHistoryWithCheckpoint(next, '编辑回复前');
  }, [replaceHistoryWithCheckpoint]);

  const handleDeleteTurn = useCallback((turnIndex: number) => {
    if (!isLoadingRef.current && !generationRef.current) {
      truncateHistory(turnIndex);
    }
  }, [truncateHistory]);

  const handleEditAndResendUserTurn = useCallback(async (turnIndex: number, text: string) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    if (await replaceHistoryWithCheckpoint(live.conversationHistory.slice(0, turnIndex), '编辑提问前')) {
      chatInputRef.current?.setValue(text);
      chatInputRef.current?.focus();
    }
  }, [replaceHistoryWithCheckpoint]);

  const handleResendUserTurn = useCallback(async (turnIndex: number) => {
    const live = useAppStore.getState();
    if (isLoadingRef.current || generationRef.current || live.isBranching) return;
    const history = live.conversationHistory;
    const kept = history.slice(0, turnIndex + 1);
    if (kept.length < history.length && !await replaceHistoryWithCheckpoint(kept, '重新发送前')) return;
    await runGeneration(kept);
  }, [replaceHistoryWithCheckpoint, runGeneration]);

  const handleRetractUserTurn = useCallback((turnIndex: number) => {
    if (isLoadingRef.current || generationRef.current) return;
    truncateHistory(turnIndex);
  }, [truncateHistory]);

  const handleRegenerateLast = useCallback(() => {
    const history = useAppStore.getState().conversationHistory;
    if (isLoadingRef.current || history.length === 0) return;
    for (let i = history.length - 1; i >= 0; i--) {
      const t = history[i];
      if (t && !t.isUser) {
        void handleRegenerate(i);
        return;
      }
    }
  }, [handleRegenerate]);

  const handleScrollToBottom = useCallback((smooth = true) => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  const handleContainerDoubleClick = useCallback((e: React.MouseEvent) => {
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
  }, [handleScrollToBottom]);

  const handleOpenHandbook = useCallback(() => {
    const el = document.getElementById('handbook-card-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="flex-1 flex min-h-screen">
      <SessionWorkbench open={isWorkbenchOpen} onClose={() => setIsWorkbenchOpen(false)} report={promptReport} busy={isLoading || isBranching} />
      {/* Secondary Scenario & Saves Sidebar (Desktop: collapsible) */}
      <div
        className={`hidden md:block shrink-0 sidebar-collapse-transition overflow-hidden ${
          isSidebarCollapsed ? 'w-0 min-w-0' : 'w-64 lg:w-72'
        }`}
      >
        {!isSidebarCollapsed && (
          <ScenarioSidebar
            onOpenHandbook={handleOpenHandbook}
            onOpenLorebook={() => setIsLorebookOpen(true)}
          />
        )}
      </div>

      {/* Mobile Slide-out Drawer for Scenario Sidebar */}
      {isMobileScenarioOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileScenarioOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-[#121319] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <ScenarioSidebar
              onClose={() => setIsMobileScenarioOpen(false)}
              onOpenHandbook={handleOpenHandbook}
              onOpenLorebook={() => setIsLorebookOpen(true)}
            />
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

      {/* 硬件加速独立背景层：脱离滚动流，避免手机端显存溢出与重绘崩溃 */}
      {bgClass && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 pointer-events-none -z-10 ${bgClass}`}
          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
        />
      )}

      {/* Main Chat Canvas with container ref & double-click listener */}
      <div
        ref={chatContainerRef}
        onDoubleClick={handleContainerDoubleClick}
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-transparent"
      >
        {scopedCss && (
          <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        )}

        {/* Theater Sticky Header */}
        <header
          id="theater-header"
          className="sticky top-0 z-20 border-b border-[#20222e] bg-[#0e0f14]/95 backdrop-blur-md px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1.5 select-none"
        >
          {/* 左侧：折叠开关 + 返回探索 + 剧本标题 + 当前模型 */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* 桌面端侧边栏折叠开关 */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-[#1a1c27] text-gray-400 hover:text-white transition shrink-0 cursor-pointer"
              title={isSidebarCollapsed ? '展开场景侧边栏' : '折叠场景侧边栏'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* 移动端场景抽屉开关 */}
            <button
              onClick={() => setIsMobileScenarioOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-[#1a1c27] text-gray-400 hover:text-white transition shrink-0 cursor-pointer"
              title="打开场景与存档"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>

            <Link
              href="/"
              className="p-1 rounded-lg hover:bg-[#1a1c27] text-gray-400 hover:text-white transition flex items-center gap-1 text-xs shrink-0 group"
              title="返回探索广场"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition" />
              <span className="hidden sm:inline">探索</span>
            </Link>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base shrink-0">
                {isCoser ? '🎀' : isFatherDaughter ? '💔' : isSister ? '👭' : currentDeck?.coverIcon || '📖'}
              </span>
              <span className="font-bold text-xs sm:text-sm text-gray-200 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-[200px] lg:max-w-[280px]">
                {currentDeck?.title || '沉浸剧场'}
              </span>
              {currentDeck?.badge && (
                <span className="hidden xl:inline px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                  {currentDeck.badge}
                </span>
              )}
            </div>

            {/* 当前模型（md 起直显，紧凑药丸） */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/50 hover:border-emerald-400 px-2 py-1 rounded-full font-mono cursor-pointer transition shadow-sm shrink-0 group max-w-[140px]"
              title="点击切换推演大模型或配置 API 密钥"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
              <span suppressHydrationWarning className="font-semibold text-[11px] truncate">{modelSettings.model || 'deepseek-flash'}</span>
            </button>

            <span className="hidden xl:inline text-[11px] text-sky-200/80 shrink-0">{sessionSettings.mode === 'chat' ? '自由聊天' : sessionSettings.mode === 'adventure' ? '规则冒险' : '小说叙事'}</span>
          </div>

          {/* 右侧操作按钮区：宽屏直显 / 小窗全部收纳进「更多」菜单 */}
          <div className="flex items-center gap-1 shrink-0 relative">
            {/* 会话工作台 */}
            <button
              onClick={() => setIsWorkbenchOpen(true)}
              className="rounded-lg border border-sky-700/70 bg-sky-950/40 px-2 py-1 text-[11px] text-sky-200 hover:bg-sky-900/50 transition shrink-0 cursor-pointer"
            >
              工作台
            </button>

            {/* 玩法模组中心 (MOD) */}
            <button
              suppressHydrationWarning
              onClick={() => setIsModCenterOpen(true)}
              className={`inline-flex px-2 py-1 rounded-lg border text-[11px] items-center gap-1 transition cursor-pointer shrink-0 ${
                isMounted && activeModCount > 0
                  ? 'bg-orange-950/60 hover:bg-orange-900/80 border-orange-500/50 text-orange-200 shadow-sm shadow-orange-950/40'
                  : 'bg-[#1b1d28] hover:bg-[#252838] border-[#2e3142] text-gray-300 hover:text-orange-300'
              }`}
              title={isMounted ? `玩法模组中心 (MOD) · 当前已装载 ${activeModCount} 项机制` : '玩法模组中心 (MOD)'}
            >
              <Puzzle className="w-3.5 h-3.5 text-orange-400" />
              <span>模组</span>
              {isMounted && activeModCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-orange-500/30 text-orange-300 font-bold leading-none"
                >
                  {activeModCount}
                </span>
              )}
            </button>

            {/* 世界书 (lg 起直显) */}
            <button
              onClick={() => setIsLorebookOpen(true)}
              className={`hidden lg:inline-flex px-2 py-1 rounded-lg border text-[11px] items-center gap-1 transition cursor-pointer shrink-0 ${
                activeLoreEntries.length > 0
                  ? 'bg-indigo-950/70 hover:bg-indigo-900/80 border-indigo-500/60 text-indigo-200 shadow-sm'
                  : 'bg-[#1b1d28] hover:bg-[#252838] border-[#2e3142] text-gray-300 hover:text-indigo-300'
              }`}
              title="打开世界书背景设定与自定义词条"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>世界书</span>
              {activeLoreEntries.length > 0 && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* 导出长文 (xl 起直显) */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hidden xl:inline-flex px-2 py-1 rounded-lg bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] hover:border-amber-500/50 text-gray-300 hover:text-amber-300 text-[11px] items-center gap-1 transition cursor-pointer shrink-0"
              title="导出或复制整场推演故事长文记录"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>导出</span>
            </button>

            {/* 模型设置 (lg 起直显) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden lg:inline-flex px-2 py-1 rounded-lg bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] hover:border-emerald-500/50 text-gray-300 hover:text-emerald-300 text-[11px] items-center gap-1 transition cursor-pointer shrink-0"
              title="切换推演大模型与接口配置"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>设置</span>
            </button>

            {/* 重新开卷 (xl 起直显) */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="hidden xl:inline-flex px-2 py-1 rounded-lg bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-amber-300 text-[11px] items-center gap-1 transition cursor-pointer shrink-0"
              title="重置到第一幕开局"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重开</span>
            </button>

            {/* 作品专属人物设定卡入口 */}
            {currentDeck?.customHtml && (
              <button
                onClick={handleOpenHandbook}
                className="hidden sm:inline-flex px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 hover:text-white text-[11px] items-center gap-1 transition cursor-pointer shrink-0"
                title="查看作者专属排版作品详情与人物卡"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">设定卡</span>
              </button>
            )}

            {/* 存档抽屉 */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex px-2 py-1 rounded-lg bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-pink-300 text-[11px] items-center gap-1 transition cursor-pointer shrink-0"
              title="打开会话存档抽屉"
            >
              <History className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">存档</span>
            </button>

            {/* 「更多」菜单按钮 */}
            <button
              onClick={() => setIsHeaderMoreOpen(!isHeaderMoreOpen)}
              className="p-1.5 rounded-lg bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] text-gray-300 hover:text-white transition cursor-pointer shrink-0"
              title="更多操作"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-300" />
            </button>

              {/* 「更多」下拉菜单：小窗下收纳全部次要操作 */}
              {isHeaderMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsHeaderMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 py-2 bg-[#171822] border border-[#2f3244] rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1 max-h-[80vh] overflow-y-auto">
                  {/* md 以下显示模型切换入口 */}
                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition md:hidden"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">当前模型：{modelSettings.model || 'deepseek-flash'}</span>
                  </button>

                  {/* lg 以下显示世界书 */}
                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      setIsLorebookOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition lg:hidden"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>世界书档案{activeLoreEntries.length > 0 ? `（${activeLoreEntries.length} 条已激活）` : ''}</span>
                  </button>

                  {/* xl 以下显示导出 */}
                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      setIsExportModalOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition xl:hidden"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>导出全景长文</span>
                  </button>

                  {/* lg 以下显示模型设置 */}
                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition lg:hidden"
                  >
                    <Settings className="w-3.5 h-3.5 text-emerald-400" />
                    <span>切换模型与设置</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      toggleRoleplayMode();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition"
                  >
                    <span>{modelSettings.roleplayMode === 'unrestricted' ? '💖' : '🛡️'}</span>
                    <span>推演风格：{modelSettings.roleplayMode === 'unrestricted' ? '绝对顺从' : '真实推拉'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      setIsModCenterOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <Puzzle className="w-3.5 h-3.5 text-orange-400" />
                      <span>玩法模组中心 (MOD)</span>
                    </div>
                    {activeModCount > 0 && (
                      <span
                        suppressHydrationWarning
                        className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      >
                        {isMounted ? `${activeModCount}项` : ''}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      const active = soundEngine.toggleRain();
                      setIsRainActive(active);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition"
                  >
                    <span>{isRainActive ? '🌧️' : '🎧'}</span>
                    <span>{isRainActive ? '关闭雨声白噪音' : '开启雨声白噪音'}</span>
                  </button>

                  {/* sm 以下显示设定卡入口 */}
                  {currentDeck?.customHtml && (
                    <button
                      onClick={() => {
                        setIsHeaderMoreOpen(false);
                        handleOpenHandbook();
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-[#242738] flex items-center gap-2 transition sm:hidden"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>作品设定卡</span>
                    </button>
                  )}

                  <div className="border-t border-[#262836] my-1" />

                  {/* xl 以下显示重新开卷 */}
                  <button
                    onClick={() => {
                      setIsHeaderMoreOpen(false);
                      setIsResetConfirmOpen(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition xl:hidden"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重新开卷</span>
                  </button>
                  </div>
                </>
              )}
            </div>
        </header>

        {/* Main Dialogue Stream */}
        <div className="story-custom-scope flex-1 max-w-3xl mx-auto w-full p-3 sm:p-6 space-y-5 sm:space-y-6 pb-72 sm:pb-80">
          {/* Author-designed Interactive Character Card & Handbook */}
          {currentDeck?.customHtml && (
            <div id="handbook-card-anchor" data-no-cv className="scroll-mt-14">
              <InteractiveHandbookCard
                html={currentDeck.customHtml}
                customCss={currentDeck.customCss}
                deckTitle={currentDeck.title}
                onStartStory={(customPrompt) => {
                  handleSend(customPrompt);
                }}
                defaultExpanded={conversationHistory.length === 0}
              />
            </div>
          )}

          {/* Clean Welcome Card when no customHtml and history is empty */}
          {!currentDeck?.customHtml && conversationHistory.length === 0 && (
            <div className="bg-[#161722]/80 border border-[#262838] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentDeck?.coverIcon || '📖'}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-100">{currentDeck?.title}</h2>
                  <p className="text-xs text-amber-400/90">{currentDeck?.badge || '剧情角色卡'}</p>
                </div>
              </div>
              {currentDeck?.handbook?.desc && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {currentDeck.handbook.desc}
                </p>
              )}
              {currentDeck?.handbook?.opening_options && currentDeck.handbook.opening_options.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#232534]">
                  <span className="text-xs font-semibold text-gray-400">推荐开局场景（点击直接开始）：</span>
                  <div className="grid grid-cols-1 gap-2">
                    {currentDeck.handbook.opening_options.map((opt: string, oIdx: number) => (
                      <button
                        key={oIdx}
                        onClick={() => handleSend(opt)}
                        className="text-left text-xs p-3 rounded-xl bg-[#1d1f2c] hover:bg-[#252838] border border-[#2d3042] hover:border-amber-500/50 text-gray-200 transition cursor-pointer leading-relaxed"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
                <span>💡 提示：在下方输入框输入行动，或直接点击上方开局选项开启推演</span>
              </div>
            </div>
          )}

          <ScenePresentation key={currentConversationId} />
          {Object.keys(currentSnapshotState).length > 0 && <details className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-200"><summary className="cursor-pointer text-sm">当前状态</summary><dl className="mt-2 grid grid-cols-2 gap-2 text-xs">{Object.entries(currentSnapshotState).map(([key,value]) => <div key={key}><dt className="text-slate-400">{sessionSettings.stateFields.find(f => f.key === key)?.label || key}</dt><dd>{Array.isArray(value) ? value.join('、') || '无' : String(value ?? '未设置')}</dd></div>)}</dl></details>}

          {currentDeck && conversationHistory.length === 0 && storyOpenings(currentDeck, sessionSettings).length > 0 ? (
            <section className="space-y-4 rounded-2xl border border-pink-500/30 bg-[#161726]/85 p-5 text-slate-200 shadow-2xl backdrop-blur-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-pink-300">
                  <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span>预设开场剧情 · 序幕场景</span>
                </div>
                <span className="text-[11px] text-gray-400">点击卡片即可直接以此序幕开启推演</span>
              </div>
              <div className="space-y-3">
                {storyOpenings(currentDeck, sessionSettings).map((opening, i) => (
                  <div
                    key={i}
                    onClick={() => addTurn(opening)}
                    className="group relative rounded-xl border border-gray-800/90 hover:border-pink-500/60 bg-[#12131e]/95 p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_0_25px_rgba(236,72,153,0.18)] cursor-pointer"
                  >
                    <RichStoryRenderer rawStory={opening.story || opening.text || ''} deckId={deckId} />
                    <div className="mt-3 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                      <span className="text-xs text-gray-400 group-hover:text-pink-300 transition">
                        第 {i + 1} 幕序幕设定
                      </span>
                      <button
                        type="button"
                        className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-md transition group-hover:scale-105"
                      >
                        选择此开场开启推演 →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {windowStart > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + TURN_WINDOW)}
                className="px-4 py-2 rounded-xl border border-[#2e3142] bg-[#1b1d28] hover:bg-[#252838] text-xs text-gray-300 hover:text-white transition cursor-pointer"
              >
                显示更早的 {Math.min(TURN_WINDOW, windowStart)} 幕 · 还有 {windowStart} 幕未显示
              </button>
            </div>
          )}
          {visibleTurns.map((turn, i) => {
              const idx = windowStart + i;
              const isLatestUserTurn = Boolean(turn.isUser) && (idx === validHistory.length - 1 || idx === validHistory.length - 2);

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

            if (turn.isError) {
              return (
                <ErrorCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onRegenerate={handleRegenerate}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onDelete={handleDeleteTurn}
                />
              );
            }

            if (turn.runtimeVersion === 1) {
              return <div key={idx}>
                <ReplyCompletionNotice turn={turn} busy={isLoading || isBranching} onRepair={() => handleRepairReply(idx)} onRetry={() => handleRegenerate(idx)} onBudget={() => setIsWorkbenchOpen(true)} />
                <GenericCard turn={turn} index={idx} deckId={deckId} onSendAction={handleSend} onDelete={handleDeleteTurn} onRegenerate={handleRegenerate} onContinueWriting={handleContinueWriting} onEdit={handleEditTurn} onSwipeChange={handleSwipeChange} />
              </div>;
            }

            if (isCoser) {
              return (
                <CoserCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onSendAction={handleSend}
                  onDelete={handleDeleteTurn}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                  onSwipeChange={handleSwipeChange}
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
                  onDelete={handleDeleteTurn}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                  onSwipeChange={handleSwipeChange}
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
                  onDelete={handleDeleteTurn}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                  onSwipeChange={handleSwipeChange}
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
                  onDelete={handleDeleteTurn}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                  onSwipeChange={handleSwipeChange}
                />
              );
            }

            if (isApocalypse && enabledMods.apocalypseSurvival) {
              return (
                <ApocalypseSurvivalCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onSendAction={handleSend}
                  onDelete={handleDeleteTurn}
                  onRegenerate={handleRegenerate}
                  onContinueWriting={handleContinueWriting}
                  onEdit={handleEditTurn}
                  onSwipeChange={handleSwipeChange}
                />
              );
            }

            return (
              <GenericCard
                key={idx}
                turn={turn}
                index={idx}
                deckId={deckId}
                onSendAction={handleSend}
                onDelete={handleDeleteTurn}
                onRegenerate={handleRegenerate}
                onContinueWriting={handleContinueWriting}
                onEdit={handleEditTurn}
                onSwipeChange={handleSwipeChange}
              />
            );
          })}

          <div ref={streamBottomRef} />
        </div>

        {saveError && <div role="alert" className="p-3 text-sm text-amber-200">{saveError}<button className="ml-3 underline" onClick={() => void useAppStore.getState().autoSave()}>重试保存</button></div>}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-2">
            {thinkingChars > 0 && (
              <span className="text-[11px] font-mono text-gray-400 select-none">
                💭 模型思考中… 已思考约 {thinkingChars} 字
              </span>
            )}
            <button className="p-2 text-sm text-sky-200 cursor-pointer" onClick={() => generationRef.current?.abort()}>停止生成</button>
          </div>
        )}
        {/* Floating Bottom Input with Docked Toolbar directly above */}
        <ChatInput
          ref={chatInputRef}
          onSend={handleSend}
          onOpenWorkbench={() => setIsWorkbenchOpen(true)}
          isLoading={isLoading || isBranching || !isDeckReady}
          onRegenerateLast={handleRegenerateLast}
          onScrollToBottom={handleScrollToBottom}
        />
      </div>

      {/* Export Story Full Record Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#161720] border border-[#2c2f3e] rounded-3xl p-5 sm:p-6 shadow-2xl text-gray-200 flex flex-col max-h-[85vh] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#252836] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-sm sm:text-base text-gray-100 truncate">
                  导出《{currentDeck?.title || '剧情推演'}》全景长文记录
                </h2>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#232634] text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-gray-400">
              <span>共包含 {conversationHistory.length} 幕互动对话与剧场演进</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyStory}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '已复制全景文本！' : '一键复制 Markdown'}</span>
                </button>
                <button
                  onClick={() => handleDownloadStory('txt')}
                  className="px-3 py-1.5 rounded-xl bg-[#202230] hover:bg-[#2b2e40] border border-gray-700 text-gray-200 text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>下载 .txt</span>
                </button>
                <button
                  onClick={() => handleDownloadStory('md')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>下载 .md</span>
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-y-auto bg-[#0f1015] border border-[#252834] rounded-2xl p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed select-text min-h-[220px]">
              {generateStoryExportText()}
            </div>
          </div>
        </div>
      )}

      {/* Lorebook World Architecture Modal */}
      <LorebookModal
        isOpen={isLorebookOpen}
        onClose={() => setIsLorebookOpen(false)}
        deckId={deckId}
        deck={currentDeck}
        activeEntries={activeLoreEntries}
      />
    </div>
  );
}
