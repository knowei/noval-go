"use client";

import React, { useEffect, useState, useRef } from 'react';
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
  VolumeX
} from 'lucide-react';

import { useAppStore } from '@/lib/store';
import { fetchStory, fetchConversations, fetchConversation } from '@/lib/api';
import { parseModelOutput, generateContextualBranches } from '@/lib/modelParser';
import { buildSystemPrompt } from '@/lib/promptEngine';
import { Turn, Branch, LoreEntry } from '@/lib/types';
import { soundEngine } from '@/lib/soundEngine';
import { retrieveActiveLore, compactMilestoneMemory } from '@/lib/lorebookEngine';
import { ScenarioSidebar } from '@/components/chat/ScenarioSidebar';
import { ChatInput } from '@/components/chat/ChatInput';
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
    toggleRoleplayMode,
    setIsSettingsOpen,
    setIsDrawerOpen,
    isModCenterOpen,
    setIsModCenterOpen,
    enabledMods,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isMobileScenarioOpen, setIsMobileScenarioOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRainActive, setIsRainActive] = useState(false);
  const [isLorebookOpen, setIsLorebookOpen] = useState(false);
  const [activeLoreEntries, setActiveLoreEntries] = useState<LoreEntry[]>([]);

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

  const hasCustomHtml = Boolean(currentDeck?.customHtml);
  const hasUserTurns = conversationHistory.some((t) => t.isUser);
  // 当剧本自带专属卡片时，未进行任何对话前不渲染冗余的预设轮次，彻底避免卡片下方内容重复突兀
  const showDialogueTurns = !hasCustomHtml || hasUserTurns;

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
    } else if (isRentApartment) {
      baseStory = `针对你的举动【${act || '行使房东特权深入查房'}】，狭窄的门厅里空气瞬间凝固到了冰点。

苏玉兰紧紧咬着苍白的下唇，丰满成熟的身躯止不住地轻颤，双手慌乱地抓着围裙边缘，那对H罩杯的饱满巨乳随着急促的呼吸大幅度起伏：“房东先生……求您别赶我们走……只要能宽限几天，我……我什么都听您的……”

而在门边的苏小雅虽然狠狠咬着烟蒂别过头去，但通红的耳尖与下意识攥紧的指节，却暴露了她内心的极度动摇。面对掌控着整栋大楼唯一的绝对主宰，母女二人的心理防线正在步步瓦解。`;
    } else if (isNudeHousekeeping) {
      baseStory = `面对你的互动【${act || '贴身指导保洁侍奉'}】，客厅里原本清爽的空气逐渐染上了甜腻而躁动的温度。

玉姐跪伏在地毯上的丰腴身躯猛地一僵，随后极有风情地直起腰肢，成熟娇媚的脸颊上泛起动人的红晕。她非但没有退缩，反而温柔一笑，将胸前呼之欲出的硕大乳球更加贴近了几分：“老板……您要是这么盯着看，玉姐这地可就没法专心擦了呢……”

而在旁侧端着水桶的小柒更是羞得满面通红，百褶裙摆下的双腿不安地并拢交叠，在母亲默许纵容的注视下，不知所措地将目光投向你。`;
    } else if (isCousinStay) {
      baseStory = `听到你关于“${act || '教训不听话的表妹'}”的话语，林晚晚气鼓鼓地鼓起腮帮子，下意识抬手护住自己露在短T外平坦纤细的马甲线。

“喂！你别仗着是我表哥就动手动脚的啊！”她虽然嘴上凶巴巴地嚷嚷，但那双修长白皙的大腿却不自在地蹭了蹭沙发边缘，整张俏脸一路红到了锁骨：“大不了……大不了今晚点外卖的钱我来出一半还不行吗！笨蛋表哥……”

看着这位平日在学校耀武扬威的叛逆小太妹此刻在自己面前破防娇羞的模样，同居屋檐下的微妙氛围正在迅速升温。`;
    } else if (isFriendSister) {
      baseStory = `顺应着你的举动【${act || '打破深夜走廊的禁忌'}】，独栋别墅深夜的寂静被彻底撕裂。

客房门内，刚刚经历失望的林若曦听到动静猛然抬头，发丝凌乱地贴在潮红的脸侧，那双平日冷若冰霜的美眸在与你对视的刹那闪过一丝惊慌与无法言说的炽热渴求。她没有立刻拉起床单遮掩自己白腻迷人的E罩杯躯体，反而下意识挺直了腰肢。

而在走廊深处，母亲苏青岚房中那声压抑的低咽也戛然而止，空气中弥漫着让人血脉偾张的危险与偷窥刺激。`;
    } else if (isJiangshiAyane) {
      baseStory = `面对你的互动【${act || '抚慰死而复生的青梅'}】，弥漫着冷香的水汽在狭小的空间里轻轻打旋。

绫音那双淡紫色的眼眸微微睁大，那张平日习惯了面无表情的“冷萌脸”上，浮现出一抹无法言喻的依恋与战栗。她那具常年维持在10℃冰冷的躯体顺从地依偎在你掌心，胸前沉甸甸的H罩杯巨乳随着呼吸轻轻贴覆着你的胸口，触感细腻冰凉得宛如最高等的羊脂玉石。

“唔……身体好冷……可是碰着你，里面好像又在发烫……”她轻启冰润的唇瓣，微弱地喘息着，紧贴着你的双腿不自觉地微微内扣，毫无杂草的白虎粉穴深处渗出贪婪的温润，整个人如溺水者抓住救命稻草般死死抱住你的腰身：“……求你……快点喂我……别让我再变僵硬了……”

感受着她胸腔里寂静无声的死寂与肉体对精液近乎本能的渴望，这场跨越生死的契约让空气中的危险与诱惑达到了极致。`;
    } else if (isAtour) {
      baseStory = `面对你的举措【${act || '行使金主特权深入互动'}】，豪华行政套房内原本紧绷的气氛骤然收紧。

站在玄关地毯上的女生身子猛然一僵，原本紧攥着帆布包背带的纤细指节因为用力而微微发白。她偷偷抬眼打量着你的神色，在触及你深邃而带着压迫感的目光时，又触电般慌忙低下头去，耳根与修长的脖颈迅速泛起一抹羞耻与紧张交织的潮红。

“我……我既然拿了APP的定金，就会遵守约定的……”她轻咬下唇，声音带着一丝不易察觉的轻颤。尽管内心对于初次涉足这种关系的耻感还在激烈翻涌，但在你强大的金主气场与现实金钱的威慑下，少女的防线正不可逆转地步步瓦解。

落地窗外，整座城市的万家灯火在雨幕中迷离闪烁，套房内的奢华与私密，正在为这场金钱与欲望的契约揭开最隐秘的一幕。`;
    } else if (isHeisiDaughter) {
      baseStory = `面对你的动作【${act || '霸道管教叛逆女儿'}】，书桌前原本慵懒傲娇的气氛骤然凝固。

陈佳慧娇躯猛地一颤，下意识想要收回搭在软垫上的黑丝长腿，却被你顺势压制。薄薄的黑色连裤袜将她圆润饱满的大腿与脚背紧紧包裹，指腹摩擦过弹性惊人的丝织物，能清晰感受到她皮下肌肉的紧绷与体温的急剧攀升。少女原本轻哼不耐烦的神情荡然无存，白皙的耳根瞬间红透，眼神慌乱得无处安放。

“爸……你干什么呀……快放开我……”她咬着下唇，声音里原本叛逆的尖刺在你的强硬触碰下迅速软化成带着微弱哭腔的娇喘，脚趾在黑色薄丝下不安地蜷缩着，在父权威严与私密羞耻的冲撞中，少女的心理防线彻底溃不成军。`;
    } else if (isSisterInLawNiece) {
      baseStory = `针对你的安排【${act || '接纳避难的母女二人'}】，门厅玄关里弥漫的惊恐与寒意瞬间消散了大半。

林晚晴长长地舒了一口气，泛红的眼眶里涌出滚烫的感激泪水，双手紧紧揪着被雨水湿透的风衣衣角。湿漉漉的布料紧贴在她饱满丰润的D罩杯胸脯与丰腴腰臀上，成熟少妇曼妙诱人的梨形轮廓在暖黄灯光下一览无遗。身旁18岁的侄女周若宁也乖巧地收起了平日里的挑衅坏笑，小脸微红地缩在母亲身侧，偷偷打量着这位高大沉稳的叔叔。

“小叔……真的太谢谢你了……如果不是你，今晚我和若宁真不知道该去哪……”嫂子声音微颤，成熟人妻那股走投无路后的柔软依附感，在温暖的房间里悄然滋长成不可言说的隐秘羁绊。`;
    } else if (isApocalypse) {
      baseStory = `面对你的指令【${act || '废土生存法则的支配'}】，避难所地下安全屋内的气氛冷酷到了极点。

跪倒在水泥地上的昔日校花苏晓染浑身剧烈颤抖，干裂泛白的嘴唇死死咬住，屈辱的眼泪在布满灰尘的脸颊上冲出两道清晰的泪痕。残破的衬衫难以遮掩她发育绝佳的D罩杯傲人曲线，在冰冷的枪口与纯净水源的巨大诱惑面前，昔日万人追捧的高岭之花终于低下了骄傲的头颅。

“我……我听你的……只要给我水喝……我什么都答应……”她颤抖着向前挪动膝盖，双手伏在你的军靴旁，将残存的文明自尊彻底碾碎在废土的尘埃中，沦为这间安全屋专属的私人禁脔。`;
    } else if (isSuccubusWife) {
      baseStory = `面对你的举动【${act || '行使代喂养特权深入互动'}】，昏暗的客厅里空气温度骤然升高，弥漫开一股如蜜糖般浓郁诱人的魅魔冷香。

原本因饥渴而瘫软在沙发上的温雅身子猛地战栗，那对小巧精致的恶魔角微颤，心形尾巴尖在你的大腿处不安分地勾缠摩挲。她羞愤欲绝地咬住下唇，美眸泛着迷离水雾，胸前呼之欲出的硕大雪乳在单薄睡袍下剧烈起伏：“阿言……求你别看了……我、我真的快要克制不住吸食精气的本能了……明宇他还在外面出差，要是被他知道……”

嘴上虽然还在维持着作为新婚人妻的最后一丝道德挣扎，但魅魔受孕发情体质带来的本能反应却背叛了一切，湿润温热的气息直往你颈间喷洒，禁断狂乱的NTL暗流彻底决堤。`;
    } else if (isPerfectGirl) {
      baseStory = `针对你的互动【${act || '推演少女的救赎与堕落'}】，安静的教室内夕阳斜照，投下狭长暧昧的阴影。

作为全校仰慕的学生会长与完美大小姐，苏清雪此刻端坐在座位上，纤细的手指死死攥着平整的百褶裙摆，指节泛白。原本平静从容的美眸深处剧烈动摇，白皙如玉的脸颊与耳垂染透了羞耻的红晕，微张的樱唇间呼出滚烫凌乱的喘息：“你……你以为掌握了这种把柄……就能随意支配我了吗……”

虽然语气里还带着高岭之花的清冷与倔强，但随着你的步步紧逼，她挺直的脊背却在微不可察地发颤，内心深处那座名为“完美”的骄傲堡垒，正不可逆转地滑向彻底顺从与堕落的深渊。`;
    } else if (isDaughterMorningWood) {
      baseStory = `面对你清晨的反应【${act || '纵容女儿的危险止痒试探'}】，主卧大床上被窝里的热度瞬间攀升到了极点。

念念整个人像只黏人的小奶猫般趴在你怀里，薄薄的丝绸睡裙早已在蹭动中卷到了纤细的腰际。她娇小的身躯死死贴着你晨勃挺立的热物，一边磨蹭着自己又痒又湿的幼嫩花蕊，一边扬起那张不谙世事却又媚态天成的清纯小脸，眼角挂着水汽，奶声娇喘：“呜……爸爸……好舒服……可是里面还是好痒……爸爸的大鸡巴好硬好热，快帮念念彻底磨一磨嘛……”

听着亲生女儿毫无防备的荒谬索求，感受着大腿间那抹滑腻泥泞的湿痕，清晨的道德伦理防线在娇软身躯的疯狂摩擦下摇摇欲坠。`;
    } else if (isTenYuanChildhood) {
      baseStory = `面对你的交易指令【${act || '支付十块钱行使青梅特权'}】，略显局促的卧室里瞬间安静下来，只剩下粗重的呼吸与窗外的蝉鸣。

林小悠小心翼翼地把刚收到的皱巴巴十块钱纸币塞进小钱包，随后像是下定决心般缓缓抬起眼眸。这位全校知名的巨乳肥臀校花，此刻双颊红得仿佛能滴出血来，颤巍巍地解开校服领口的纽扣，一对呼之欲出的饱满巨乳伴随着白腻的深沟沉甸甸地弹跳出来，丰腴饱满的肉感臀瓣局促地挪动着：“那……阿伟……说好了就十块钱一次哦……你不许告诉其他人……要是舒服的话，以后……以后也可以经常照顾我生意的……”

看着眼前为了零花钱而彻底沦陷的青梅竹马，纯真与低廉肉体交易的反差感在这一刻引爆了最原始的冲动。`;
    } else if (isGirlsDormitory) {
      baseStory = `面对你的举动【${act || '小心掩饰男儿身深入周旋'}】，女寝302室空气中弥漫的甜腻沐浴水汽骤然变得焦灼危险。

苏小可正拉扯着薄薄的棉质睡裙下摆，一双圆溜溜的杏眼闪烁着恶作剧的光芒，冷不防伸出软绵绵的小手勾住你的纤细手腕：“哎呀新来的，大家都是平胸好姐妹，有什么好害羞的嘛！走，跟小可一起去洗澡去~”

而在书桌前，穿着黑丝包臀裙的高冷大姐大凌玥敏锐地眯起狭长眼眸，指间夹着细烟轻轻吐出一缕白雾，意味深长地上下审视着你紧绷的身体；刚洗完澡裹着单薄浴巾的清纯校花叶芷柔更是羞红了脸颊，温软的体温与若隐若现的锁骨在水汽中蒸腾。身处这片脂粉香艳却危机四伏的温柔乡，你下体那根沉睡的肉棒正如铁棍般疯狂胀痛，随时面临彻底暴露的悬崖边缘。`;
    } else if (isHousewifeApartment) {
      baseStory = `行使着作为月桂庄公寓管理员的特权【${act || '刷卡突击查房深入调教'}】，万能主卡在门锁上发出清脆的“滴——”一声轻鸣。

房门推开，暖黄的廊灯洒在玄关地毯上，屋内的人妻娇躯剧烈一颤。面对你居高临下的巡视目光，平日里高高在上的人妻慌乱地揪住单薄睡袍的领口，成熟丰腴的娇躯止不住地轻微战栗。丈夫常年异地出差所积压的无尽空虚，在这一刻化作了滚烫的泪水与隐秘的渴望。

“管理员先生……这么晚了……您、您怎么突然来巡查了……”她咬着下唇，声音带着一丝不易察觉的轻颤与哀求，而你反手将房门反锁的咔哒声，彻底将这间充斥着成熟肉欲的私密囚笼与外界隔绝开来。`;
    } else if (isNudeGirlsSchool) {
      baseStory = `顺应着圣伊甸女子学园不可违抗的至高铁律【${act || '全裸特招生的校园支配'}】，你缓缓褪去了身上最后一件衣物。

恒温26℃的微风轻拂过你精壮赤裸的身躯，校门林荫道两旁，成百上千名一丝不挂的贵族少女们齐刷刷投来震惊、羞怯与极度好奇的目光。全校三千名平日里只习惯了百合相亲相爱的纯洁名媛，此刻第一次近距离目睹真正成年雄性的肌肉线条与粗硕雄性象征，整座校园的私密气氛瞬间被引爆。

讲台前，戴着金丝眼镜的巨乳女教师嘴角扬起玩味的笑意，在教案上轻轻敲动指节；而一丝不挂的女校长塞西莉亚优雅地端着茶杯，深邃的美眸中满是探寻与期待——这场属于唯一男性的肉体征服盛宴，正式拉开帷幕。`;
    } else if (isXiuxianWorld) {
      baseStory = `面对你的修仙抉择【${act || '步入苍澜大千世界寻仙问道'}】，太白峰下的灵压潮汐骤然剧烈翻腾，九霄之上的浩瀚云海被漫天剑气与五彩霞光生生撕裂！

台前巍峨矗立的九龙测灵石柱嗡鸣激荡，幽蓝的冰魄与赤金的真火在玄奥符印中交相辉映，引来全场数万求道者与各大宗门长老的齐声惊呼。玉台之巅，天剑门剑首萧寒衣原本紧闭的双眸倏然睁开，深邃如渊的眼底划过一抹极罕见的剑意锋芒；昆仑宗掌门君亦尘拂须微笑，目光温润而赞赏；而合欢宗妖娆绝色的宗主魅姬更是掩唇轻笑，足踝的金铃清脆作响，一双秋水长眸脉脉含情地朝你投来暗波流转的深意视线。

“善！此子根骨灵韵卓绝，天地造化钟神秀……”

冥冥之中，苍澜修仙界的风云大势正在为你悄然倾斜，各大宗门的招揽、魔道强者的觊觎、以及一段荡气回肠的仙凡传说，正自此揭开波澜壮阔的序幕！`;
    } else {
      baseStory = `针对你的行动【${act || '深入推进'}】，场间的气氛产生了明显的微妙变化。

窗外的夜色如墨，灯光在两人之间洒下斑驳的光影。对方抬起眼帘凝视着你，眼底闪过复杂的情绪波动，似乎正在重新审视你与彼此之间的界限。随着沉默的打破，彼此的距离在不知不觉中悄然拉近。`;
    }

    const allHistoryBranches = conversationHistory.flatMap((t: Turn) => t.branches || []);
    const branches = generateContextualBranches(deckId, baseStory, turnIdx, act, prevBranches, allHistoryBranches);
    return {
      story: baseStory,
      branches
    };
  };

  const runGeneration = async (historyContext: Turn[], existingSwipes?: Turn[]) => {
    setIsLoading(true);
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

    try {
      // 动态检索当前交互动作与最新上下文命中的世界书背景词条
      const lastAiTurn = [...historyContext].reverse().find((h) => !h.isUser);
      const contextForLore = `${userActionText} ${lastAiTurn?.story || ''}`;
      const { activeEntries, formattedPrompt: activeLoreText } = retrieveActiveLore(
        deckId,
        contextForLore,
        currentDeck?.lorebook
      );
      if (activeEntries && activeEntries.length > 0) {
        setActiveLoreEntries(activeEntries);
      }

      // 自动将较早轮次（前6轮之前）沉淀为事实里程碑，彻底解决长剧本失忆
      const milestoneMemoryText = compactMilestoneMemory(historyContext, 6);

      const systemPromptText = buildSystemPrompt({
        deckId,
        deckTitle: currentDeck?.title,
        deckDesc: currentDeck?.desc,
        previousBranches: prevBranches,
        allHistoryBranches,
        turnIndex: aiTurnIndex,
        activeLoreText,
        milestoneMemoryText,
        roleplayMode: modelSettings.roleplayMode,
        enabledMods
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
            content = `【用户最新推进指令】：${content}。\n【核心执行纪律】：\n1. 严格遵循防抢话原则，严禁替玩家说台词或做心理决策；输出高质量感官与情绪张力描写；\n2. 🎲【互动抉择必达要求】：正文推演结束后，必须在末尾输出 <opt><suggested_questions> 标签，包含4项紧密结合当前最新情节、完全不同于历史选项的全新【玩家可选行动】（使用 <d> 标签包裹），严禁省略！`;
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
      // 客户端等待上限设为 120 秒，适应 DeepSeek 等推理模型长上下文的高思考延迟
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const resp = await fetch(`/proxy?target=${encodeURIComponent(targetUrl)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${modelSettings.apiKey || ''}`
        },
        body: JSON.stringify({
          model: apiModel,
          messages: promptMessages,
          temperature: modelSettings.temperature ?? 0.7,
          top_p: modelSettings.topP ?? 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          max_tokens: 4096,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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

      if (resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let streamedStory = '';
        let isFirstToken = true;
        let lastUpdateTime = 0;

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
                    lastUpdateTime = Date.now();
                  } else {
                    const now = Date.now();
                    // 节流更新 (60ms)，避免移动端每秒触发上百次重绘导致 JS 堆内存暴涨崩溃
                    if (now - lastUpdateTime >= 60 || done) {
                      lastUpdateTime = now;
                      soundEngine.playTypewriterClick();
                      updateTurn(aiTurnIndex, {
                        isUser: false,
                        model: activeModel,
                        location: currentDeck?.title,
                        story: streamedStory
                      });
                    }
                  }
                }
              } catch (e) {}
            }
          }
        }

        if (hasLiveStreamSuccess && streamedStory) {
          const parsed = parseModelOutput(streamedStory, deckId, aiTurnIndex, userActionText, prevBranches, allHistoryBranches);
          const currentGeneratedTurn: Turn = {
            isUser: false,
            model: activeModel,
            location: currentDeck?.title || '室内场景',
            story: parsed.story || streamedStory,
            branches: parsed.branches && parsed.branches.length > 0
              ? parsed.branches
              : generateContextualBranches(deckId, streamedStory, aiTurnIndex, userActionText, prevBranches, allHistoryBranches),
            activeLoreEntries: activeEntries,
            npcThought: parsed.npcThought,
            modReport: parsed.modReport,
            npcClothes: parsed.npcClothes,
            modifyEffect: parsed.modifyEffect,
            memory: parsed.memory,
            status: parsed.status,
            cot: parsed.cot,
            tl: parsed.tl,
          };

          const finalSwipes = existingSwipes && existingSwipes.length > 0
            ? [...existingSwipes, currentGeneratedTurn]
            : undefined;

          updateTurn(aiTurnIndex, {
            ...currentGeneratedTurn,
            swipes: finalSwipes,
            swipeIndex: finalSwipes ? finalSwipes.length - 1 : undefined,
          });

          // 推演生成结束后平滑滚至最底端，确保玩家清晰可见 4 个动作分支与交互条
          setTimeout(() => {
            handleScrollToBottom(true);
          }, 150);
        }
      }
    } catch (err: any) {
      console.error('[Generation Error]:', err);
      if (!hasLiveStreamSuccess) {
        const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');
        const errorMsg = isTimeout
          ? '模型响应超时 (已等待 120 秒)。大模型长文本处理耗时较长或网络连接中断，请点击下方【重新生成】重试。'
          : `推演连接异常: ${err?.message || '网络连接发生故障'}`;

        addTurn({
          isUser: false,
          isError: true,
          error: errorMsg,
          model: activeModel,
          location: currentDeck?.title || '推演超时'
        });
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
    const existingTurn = conversationHistory[turnIndex];
    if (!existingTurn) return;

    // Preserves existing version in swipes list if not already there (unless it was an error turn)
    const existingSwipes = !existingTurn.isError && existingTurn.swipes && existingTurn.swipes.length > 0
      ? [...existingTurn.swipes]
      : (!existingTurn.isError && (existingTurn.story || existingTurn.text) ? [{ ...existingTurn }] : undefined);

    const truncated = conversationHistory.slice(0, turnIndex);
    setConversationHistory(truncated);
    await runGeneration(truncated, existingSwipes);
  };

  const handleSwipeChange = (turnIndex: number, newSwipeIndex: number) => {
    const existing = conversationHistory[turnIndex];
    if (!existing || !existing.swipes || !existing.swipes[newSwipeIndex]) return;

    const target = existing.swipes[newSwipeIndex];
    updateTurn(turnIndex, {
      ...target,
      swipes: existing.swipes,
      swipeIndex: newSwipeIndex
    });
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

  const handleOpenHandbook = () => {
    const el = document.getElementById('handbook-card-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex-1 flex min-h-screen">
      {/* Secondary Scenario & Saves Sidebar (Desktop: 270px) */}
      <div className="hidden md:block shrink-0">
        <ScenarioSidebar
          onOpenHandbook={handleOpenHandbook}
          onOpenLorebook={() => setIsLorebookOpen(true)}
        />
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
        {currentDeck?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: currentDeck.customCss }} />
        )}

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

            {/* 推演风格切换药丸 (真实推拉 vs 绝对顺从) */}
            <button
              onClick={toggleRoleplayMode}
              className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1 rounded-full font-mono cursor-pointer transition shadow-xs shrink-0 border ${
                modelSettings.roleplayMode === 'unrestricted'
                  ? 'text-pink-300 bg-pink-950/60 hover:bg-pink-900/70 border-pink-500/50 hover:border-pink-400'
                  : 'text-amber-300 bg-amber-950/60 hover:bg-amber-900/70 border-amber-500/50 hover:border-amber-400'
              }`}
              title={modelSettings.roleplayMode === 'unrestricted' ? '当前模式：💖 绝对顺从（点击切换为 🛡️ 真实推拉·硬核底线）' : '当前模式：🛡️ 真实推拉·硬核底线（违背意志强推会自卫逃跑，点击切换为 💖 绝对顺从）'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${modelSettings.roleplayMode === 'unrestricted' ? 'bg-pink-400' : 'bg-amber-400'} animate-pulse`} />
              <span className="font-semibold text-xs">{modelSettings.roleplayMode === 'unrestricted' ? '💖 绝对顺从' : '🛡️ 真实推拉'}</span>
            </button>

            {/* 玩法模组中心快捷入口 */}
            <button
              onClick={() => setIsModCenterOpen(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 sm:px-3 py-1 rounded-full font-mono cursor-pointer transition shadow-xs shrink-0 border border-orange-500/50 bg-orange-950/60 hover:bg-orange-900/70 text-orange-300 hover:border-orange-400 group"
              title="打开玩法模组中心 (MOD 插件与机制管理)"
            >
              <span className="text-xs group-hover:rotate-12 transition-transform">🧩</span>
              <span className="font-semibold text-xs">模组</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-500/30 text-orange-200 border border-orange-500/40">
                {Object.values(enabledMods).filter(Boolean).length}
              </span>
            </button>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Ambient Rain White Noise Toggle */}
            <button
              onClick={() => {
                const active = soundEngine.toggleRain();
                setIsRainActive(active);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-xl border text-xs flex items-center gap-1 transition cursor-pointer shrink-0 ${
                isRainActive
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm animate-pulse'
                  : 'bg-[#1b1d28] hover:bg-[#252838] border-[#2e3142] text-gray-400 hover:text-gray-200'
              }`}
              title={isRainActive ? '点击关闭沉浸雨夜白噪音' : '点击开启沉浸雨夜白噪音'}
            >
              <span>{isRainActive ? '🌧️' : '🎧'}</span>
              <span className="hidden sm:inline text-[11px]">{isRainActive ? '雨声开' : '氛围音效'}</span>
            </button>

            {/* Lorebook World Archive Modal Trigger */}
            <button
              onClick={() => setIsLorebookOpen(true)}
              className={`px-2 sm:px-2.5 py-1 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                activeLoreEntries.length > 0
                  ? 'bg-indigo-950/70 hover:bg-indigo-900/80 border-indigo-500/60 text-indigo-200 shadow-sm'
                  : 'bg-[#1b1d28] hover:bg-[#252838] border-[#2e3142] text-gray-300 hover:text-indigo-300'
              }`}
              title="打开世界书背景设定与自定义词条"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline text-[11px]">世界书</span>
              {activeLoreEntries.length > 0 && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Export Story Full Record */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#1b1d28] hover:bg-[#252838] border border-[#2e3142] hover:border-amber-500/50 text-gray-300 hover:text-amber-300 text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
              title="导出或复制整场推演故事长文记录"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">导出长文</span>
            </button>

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

            {currentDeck?.customHtml && (
              <button
                onClick={handleOpenHandbook}
                className="px-2 sm:px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                title="查看作者专属排版作品详情与人物卡"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline text-[11px]">作品详情</span>
              </button>
            )}

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
        <div className="flex-1 max-w-3xl mx-auto w-full p-3 sm:p-6 space-y-5 sm:space-y-6 pb-72 sm:pb-80">
          {/* Author-designed Interactive Character Card & Handbook */}
          {currentDeck?.customHtml && (
            <div id="handbook-card-anchor" className="scroll-mt-14">
              <InteractiveHandbookCard
                html={currentDeck.customHtml}
                deckTitle={currentDeck.title}
                onStartStory={(customPrompt) => {
                  handleSend(customPrompt);
                }}
                defaultExpanded={!hasUserTurns}
              />
            </div>
          )}

          {showDialogueTurns && conversationHistory.map((turn, idx) => {
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

            if (turn.isError) {
              return (
                <ErrorCard
                  key={idx}
                  turn={turn}
                  index={idx}
                  onRegenerate={handleRegenerate}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onDelete={(dIdx) => truncateHistory(dIdx)}
                />
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
                  onDelete={(dIdx) => truncateHistory(dIdx)}
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
                  onDelete={(dIdx) => truncateHistory(dIdx)}
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
                  onDelete={(dIdx) => truncateHistory(dIdx)}
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
                  onDelete={(dIdx) => truncateHistory(dIdx)}
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
                onDelete={(dIdx) => truncateHistory(dIdx)}
                onRegenerate={handleRegenerate}
                onContinueWriting={handleContinueWriting}
                onEdit={handleEditTurn}
                onSwipeChange={handleSwipeChange}
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
