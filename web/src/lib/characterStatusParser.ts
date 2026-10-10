import { Turn } from './types';
import { resolveCgUrl } from './cgManager';

export interface StatMetric {
  name: string;
  value: number;
  max: number;
  delta?: string; // e.g. "+5 ▲" or "-10 ▼"
  stageDesc?: string; // e.g. "暧昧动摇"
  color: string; // e.g. "from-rose-500 to-pink-500"
  barColor: string; // CSS gradient or hex
  icon: string;
}

export interface MoneyDebtInfo {
  debt?: string;
  totalDebt?: string;
  cash?: string;
  costume?: string;
  costumeCode?: string;
  costumeUrl?: string;
  day?: string;
}

export interface CustomStatusTag {
  label: string;
  value: string;
  icon?: string;
}

export interface CharacterStatusSnapshot {
  characterName: string;
  stageName?: string;
  mood?: string;
  thought?: string;
  stats: StatMetric[];
  moneyInfo?: MoneyDebtInfo;
  customTags?: CustomStatusTag[];
}

/**
 * 通用状态块提取器：
 * 从模型回复正文中剥离出各种形式的状态面板（XML标签或中文方括号块），
 * 返回剥离后的干净正文 cleanText，以及提取到的 statusBlock
 */
export function extractStatusBlock(text: string): { cleanText: string; statusBlock: string | null } {
  if (!text) return { cleanText: '', statusBlock: null };

  // 1. 匹配 XML-like 状态标签，如 <dormitory_status>...</dormitory_status>, <status>...</status>, <char_status>...</char_status>
  const xmlMatch = text.match(/(<([a-zA-Z0-9_-]*status[a-zA-Z0-9_-]*)>([\s\S]*?)(?:<\/\2>|$))/i);
  if (xmlMatch) {
    const cleanText = text.replace(xmlMatch[1], '').trim();
    return { cleanText, statusBlock: xmlMatch[3].trim() || xmlMatch[1].trim() };
  }

  // 2. 匹配中文方头括号状态面板块，例如：【404女生宿舍状态面板】... 或 【末世生存监控】...
  const bracketMatch = text.match(/(【[^】]*(?:状态|面板|监控|属性|数值|好感|危机|存活|生理|情报)[^】]*】[\s\S]*?)(?=(?:【[^】]*(?:选项|抉择|分支|行动)[^】]*】|<opt>|<actions>|$))/i);
  if (bracketMatch) {
    const cleanText = text.replace(bracketMatch[1], '').trim();
    return { cleanText, statusBlock: bracketMatch[1].trim() };
  }

  // 3. 匹配【当前状态】/ [状态面板] 等格式
  const altMatch = text.match(/((?:\[(?:当前状态|状态面板|数值监控)\]|【(?:当前状态|状态面板|数值监控)】)[\s\S]*?)(?=(?:\[(?:选项|抉择)\]|【(?:选项|抉择)】|<opt>|$))/i);
  if (altMatch) {
    const cleanText = text.replace(altMatch[1], '').trim();
    return { cleanText, statusBlock: altMatch[1].trim() };
  }

  return { cleanText: text, statusBlock: null };
}

/**
 * 通用自适应状态解析器：
 * 自动识别任何剧本卡片输出的状态文本，提取指标进度条、情境标签与角色心理
 */
export function parseUniversalStatusBlock(
  content: string,
  deckId: string = '',
  deckTitle: string = ''
): CharacterStatusSnapshot | null {
  if (!content || !content.trim()) return null;

  // 1. 提取面板标题或阶段名，如从【404女生宿舍状态面板】提取
  let stageName: string | undefined;
  const titleMatch = content.match(/【([^】]*(?:状态|面板|监控|属性|数值|好感|危机|存活)[^】]*)】/);
  if (titleMatch) {
    stageName = titleMatch[1].trim();
  }

  // 2. 提取角色名 (如果有显式声明，或从标题提取，或从首个角色指标提取)
  let characterName = '当前局势';
  const charMatch = content.match(/\[(?:目标角色|角色|当前对象)\]:\s*([^\n|]+)/i) ||
                     content.match(/(?:目标角色|角色|当前对象)[：:]\s*([^\n|]+)/i);
  if (charMatch) {
    characterName = charMatch[1].trim();
  } else if (stageName) {
    characterName = stageName.replace(/状态面板|状态栏|面板|监控/g, '').trim() || '当前局势';
  }

  const stats: StatMetric[] = [];
  const customTags: CustomStatusTag[] = [];
  let moodText: string | undefined;

  // 3. 逐行自适应解析指标项与情境标签
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const processedKeys = new Set<string>();

  for (const line of lines) {
    if (/^【.*】$/.test(line)) continue;

    // 匹配 "键 : 值 (说明/备注)" 模式
    const lineMatch = line.match(/^([^\s:：\[【]+|\S.*?)\s*[:：]\s*([\s\S]*)$/);
    if (!lineMatch) continue;

    let rawKey = lineMatch[1].trim();
    const rawVal = lineMatch[2].trim();

    // 提取行首 Emoji 图标与清洗键名
    const emojiMatch = rawKey.match(/^([\p{Emoji_Presentation}\p{Extended_Pictographic}⚠️❄️🎨🍷💕⏰👤📍💭📌✨💖🛡️💰]+)\s*(.*)$/u);
    let iconFromLine: string | null = null;
    if (emojiMatch) {
      iconFromLine = emojiMatch[1];
      if (emojiMatch[2]) {
        rawKey = emojiMatch[2].trim();
      }
    }

    if (!rawKey || processedKeys.has(rawKey)) continue;

    // 判断值是否为数值指标项（如 15%、50%、15/100，并附带小括号说明）
    const numValMatch = rawVal.match(/^(\d+)%?(?:\s*\/(\d+))?(?:\s*[（(]([\s\S]*?)[）)])?$/);
    const isExplicitNonNum = rawKey.includes('时间') || rawKey.includes('主角状态') || rawKey.includes('位置') || rawKey.includes('地点') || rawKey.includes('心境') || rawKey.includes('微澜');

    if (numValMatch && !isExplicitNonNum) {
      const value = parseInt(numValMatch[1], 10);
      const max = parseInt(numValMatch[2], 10) || 100;
      const extra = (numValMatch[3] || '').trim();

      let icon = iconFromLine || '📊';
      let color = 'from-blue-500 to-indigo-500';
      let barColor = 'linear-gradient(90deg, #3b82f6, #6366f1)';

      if (rawKey.includes('好感') || rawKey.includes('心动') || rawKey.includes('爱意') || rawKey.includes('迷恋') || rawKey.includes('依恋') || rawKey.includes('小可') || rawKey.includes('芷柔') || rawKey.includes('玥') || rawKey.includes('仟歌')) {
        if (!iconFromLine) icon = '💖';
        color = 'from-pink-500 to-rose-500';
        barColor = 'linear-gradient(90deg, #ec4899, #f43f5e)';
      } else if (rawKey.includes('风险') || rawKey.includes('危机') || rawKey.includes('暴露') || rawKey.includes('警报') || rawKey.includes('怀疑') || rawKey.includes('堕落') || rawKey.includes('警戒')) {
        if (!iconFromLine) icon = value > 50 ? '🚨' : '⚠️';
        color = value > 50 ? 'from-rose-600 to-red-600' : 'from-amber-500 to-rose-500';
        barColor = value > 50 ? 'linear-gradient(90deg, #e11d48, #be123c)' : 'linear-gradient(90deg, #f59e0b, #f43f5e)';
      } else if (rawKey.includes('防线') || rawKey.includes('理智') || rawKey.includes('安全') || rawKey.includes('防御') || rawKey.includes('抗性')) {
        if (!iconFromLine) icon = '🛡️';
        color = 'from-emerald-500 to-teal-500';
        barColor = 'linear-gradient(90deg, #10b981, #14b8a6)';
      } else if (rawKey.includes('金钱') || rawKey.includes('现金') || rawKey.includes('债务') || rawKey.includes('资源') || rawKey.includes('水') || rawKey.includes('食物')) {
        if (!iconFromLine) icon = '💰';
        color = 'from-amber-400 to-emerald-400';
        barColor = 'linear-gradient(90deg, #f59e0b, #10b981)';
      }

      stats.push({
        name: rawKey,
        value,
        max,
        stageDesc: extra || undefined,
        color,
        barColor,
        icon
      });
      processedKeys.add(rawKey);
    } else {
      // 4. 情境标签与文本状态
      let icon = iconFromLine || '📌';
      if (rawKey.includes('时间') || rawKey.includes('日期') || rawKey.includes('时刻')) {
        if (!iconFromLine) icon = '⏰';
      } else if (rawKey.includes('状态') || rawKey.includes('主角') || rawKey.includes('伪装')) {
        if (!iconFromLine) icon = '👤';
      } else if (rawKey.includes('位置') || rawKey.includes('地点') || rawKey.includes('室友') || rawKey.includes('场景')) {
        if (!iconFromLine) icon = '📍';
      } else if (rawKey.includes('心理') || rawKey.includes('心境') || rawKey.includes('微澜') || rawKey.includes('心声')) {
        if (!iconFromLine) icon = '💭';
        moodText = rawVal;
      }

      customTags.push({
        label: rawKey,
        value: rawVal,
        icon
      });
      processedKeys.add(rawKey);
    }
  }

  if (stats.length === 0 && customTags.length === 0) {
    return null;
  }

  return {
    characterName,
    stageName: stageName || '局势监控',
    mood: moodText || (customTags.find(t => t.label.includes('状态'))?.value),
    stats,
    customTags
  };
}

/**
 * 寻找历史对话中最近一轮确立的有效状态快照
 */
export function findLatestStatusSnapshot(
  history: Turn[],
  deckId: string = '',
  deckTitle: string = ''
): CharacterStatusSnapshot | null {
  if (!history || history.length === 0) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const t = history[i];
    if (!t || t.isUser) continue;
    const raw = t.rawText || t.story || t.text || '';
    const { statusBlock } = extractStatusBlock(raw);
    if (statusBlock) {
      const snap = parseUniversalStatusBlock(statusBlock, deckId, deckTitle);
      if (snap && (snap.stats.length > 0 || (snap.customTags && snap.customTags.length > 0))) {
        return snap;
      }
    }
    const charStatusMatch = raw.match(/<char_status>([\s\S]*?)<\/char_status>/i);
    if (charStatusMatch) {
      return parseExplicitCharStatus(charStatusMatch[1].trim(), deckId, deckTitle);
    }
  }
  return null;
}

/**
 * 将状态快照转换为供大模型在 system prompt 中参考的结构化基准文本
 */
export function formatSnapshotForPrompt(snapshot: CharacterStatusSnapshot): string {
  const parts: string[] = [];
  if (snapshot.stageName) {
    parts.push(`【${snapshot.stageName}】`);
  }
  if (snapshot.customTags && snapshot.customTags.length > 0) {
    for (const tag of snapshot.customTags) {
      parts.push(`${tag.icon ? tag.icon + ' ' : ''}${tag.label}：${tag.value}`);
    }
  }
  if (snapshot.stats && snapshot.stats.length > 0) {
    for (const st of snapshot.stats) {
      parts.push(`${st.icon ? st.icon + ' ' : ''}${st.name}：${st.value}%${st.stageDesc ? `（${st.stageDesc}）` : ''}`);
    }
  }
  if (snapshot.mood) {
    parts.push(`💭 心境微澜：${snapshot.mood}`);
  }
  return parts.join('\n');
}

const turnStatusCache = new WeakMap<Turn, CharacterStatusSnapshot | null>();

/**
 * 从一轮对话文本或历史中，解析当前角色的心理数值与本轮波动（内置 WeakMap 缓存）
 */
export function parseTurnCharacterStatus(
  turn: Turn,
  deckId: string = '',
  deckTitle: string = '',
  turnIndex: number = 0,
  history?: Turn[]
): CharacterStatusSnapshot | null {
  if (!turn || turn.isUser) return null;
  if (turnStatusCache.has(turn)) {
    return turnStatusCache.get(turn)!;
  }
  const result = parseTurnCharacterStatusInternal(turn, deckId, deckTitle, turnIndex, history);
  turnStatusCache.set(turn, result);
  return result;
}

function parseTurnCharacterStatusInternal(
  turn: Turn,
  deckId: string = '',
  deckTitle: string = '',
  turnIndex: number = 0,
  history?: Turn[]
): CharacterStatusSnapshot | null {
  const rawText = turn.rawText || turn.story || turn.text || '';
  if (!rawText) return null;

  // 1. 通用自适应解析器优先：自动命中任意卡片的状态面板（如【404女生宿舍状态面板】或 <dormitory_status>）
  const { statusBlock } = extractStatusBlock(rawText);
  if (statusBlock) {
    const universal = parseUniversalStatusBlock(statusBlock, deckId, deckTitle);
    if (universal && (universal.stats.length > 0 || (universal.customTags && universal.customTags.length > 0))) {
      return universal;
    }
  }

  // 2. 尝试从 <char_status> 标签解析
  const charStatusMatch = rawText.match(/<char_status>([\s\S]*?)<\/char_status>/i);
  if (charStatusMatch) {
    const content = charStatusMatch[1].trim();
    return parseExplicitCharStatus(content, deckId, deckTitle);
  }

  // 3. 尝试从 <love_status> 标签解析
  const loveMatch = rawText.match(/<love_status>([\s\S]*?)<\/love_status>/i);
  if (loveMatch) {
    const content = loveMatch[1].trim();
    return parseLoveStatus(content, rawText);
  }

  // 4. 尝试从 <rpg_status> 标签解析
  const rpgMatch = rawText.match(/<rpg_status>([\s\S]*?)<\/rpg_status>/i);
  if (rpgMatch) {
    const content = rpgMatch[1].trim();
    return parseRpgStatus(content, rawText);
  }

  // 5. 状态平滑继承机制 (State Inheritance)：
  // 若本轮模型未输出状态面板（如长上下文、模型注意力转移或未触发输出），
  // 向前回溯最近一轮有效的面板状态并无损继承，绝不降级丢掉已有角色与数值！
  if (history && history.length > 0) {
    const maxSearch = Math.min(turnIndex, history.length);
    for (let i = maxSearch - 1; i >= 0; i--) {
      const prevTurn = history[i];
      if (!prevTurn || prevTurn.isUser) continue;
      const prevRaw = prevTurn.rawText || prevTurn.story || prevTurn.text || '';
      const { statusBlock: prevBlock } = extractStatusBlock(prevRaw);
      if (prevBlock) {
        const prevSnap = parseUniversalStatusBlock(prevBlock, deckId, deckTitle);
        if (prevSnap && (prevSnap.stats.length > 0 || (prevSnap.customTags && prevSnap.customTags.length > 0))) {
          // 提取本轮可能的微表情作为心声更新
          const innerMatch = rawText.match(/(?:心想|心境|心头|暗想|心道|暗自)[：:，,]([^。\n]+)/);
          return {
            ...prevSnap,
            mood: innerMatch ? innerMatch[1].trim() : prevSnap.mood
          };
        }
      }
    }
  }

  // 6. 启发式保底回退：若全剧本历史从未出现过任何结构化面板，才生成基础状态卡
  return generateHeuristicStatus(turn, deckId, deckTitle, turnIndex);
}

function parseExplicitCharStatus(content: string, deckId: string, deckTitle: string): CharacterStatusSnapshot {
  const charMatch = content.match(/\[(?:目标角色|角色)\]:\s*([^|]+)/i);
  const moodMatch = content.match(/\[(?:心境微澜|心境|状态|心理)\]:\s*([^|]+)/i);

  const characterName = charMatch ? charMatch[1].trim() : '主要角色';
  const mood = moodMatch ? moodMatch[1].trim() : undefined;

  // 解析各个属性 [属性名]: 数值/上限 (变化, 阶段)
  const stats: StatMetric[] = [];
  const statRegex = /\[([^\]]+)\]:\s*(\d+)(?:\/(\d+))?(?:\s*\(([^)]+)\))?/g;
  let match;

  while ((match = statRegex.exec(content)) !== null) {
    const key = match[1].trim();
    if (key === '目标角色' || key === '角色' || key === '心境微澜' || key === '心境' || key === '状态' || key === '心理') {
      continue;
    }

    const value = parseInt(match[2], 10) || 0;
    const max = parseInt(match[3], 10) || 100;
    const extra = match[4] ? match[4].trim() : '';

    let delta: string | undefined;
    let stageDesc: string | undefined;

    if (extra) {
      const parts = extra.split(/[,，、]/).map(s => s.trim());
      for (const p of parts) {
        if (/^[+-]?\d+/.test(p)) {
          const num = parseInt(p, 10);
          delta = num > 0 ? `+${num} ▲` : num < 0 ? `${num} ▼` : undefined;
        } else {
          stageDesc = p;
        }
      }
    }

    const isNtr = key.includes('NTR') || key.includes('沦陷') || key.includes('堕落');
    const isIntervention = key.includes('干预') || key.includes('守护') || key.includes('阻止');
    const isAffection = key.includes('心动') || key.includes('好感') || key.includes('爱意');
    const isDefense = key.includes('防线') || key.includes('羞耻') || key.includes('戒备');
    const isOath = key.includes('誓约') || key.includes('契约度') || key.includes('婚纱');
    const isExclusivity = key.includes('独占渴求') || key.includes('独占欲') || key.includes('吃醋') || key.includes('占有');
    const isCubeResonance = key.includes('魔方') || key.includes('共鸣');

    const isDebt = key.includes('债务') || key.includes('还款') || key.includes('清偿') || key.includes('借款') || key.includes('欠债');
    const isCash = key.includes('现金') || key.includes('资金') || key.includes('存款') || key.includes('收入') || key.includes('打工');
    const isCostume = key.includes('着装') || key.includes('服装') || key.includes('立绘') || key.includes('装扮');

    let icon = '📊';
    let color = 'from-purple-500 to-indigo-500';
    let barColor = 'linear-gradient(90deg, #a855f7, #6366f1)';

    if (isDebt) {
      icon = '💰';
      color = 'from-amber-500 to-emerald-400';
      barColor = 'linear-gradient(90deg, #f59e0b, #10b981)';
    } else if (isCash) {
      icon = '💵';
      color = 'from-emerald-500 to-teal-400';
      barColor = 'linear-gradient(90deg, #10b981, #06b6d4)';
    } else if (isCostume) {
      icon = '👗';
      color = 'from-purple-500 to-pink-500';
      barColor = 'linear-gradient(90deg, #8b5cf6, #ec4899)';
    } else if (isOath) {
      icon = '💍';
      color = 'from-cyan-400 to-blue-500';
      barColor = 'linear-gradient(90deg, #06b6d4, #3b82f6)';
    } else if (isCubeResonance) {
      icon = '💠';
      color = 'from-sky-400 to-indigo-500';
      barColor = 'linear-gradient(90deg, #38bdf8, #6366f1)';
    } else if (isExclusivity) {
      icon = '🔥';
      color = 'from-amber-500 to-rose-500';
      barColor = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    } else if (isNtr) {
      icon = '💔';
      color = 'from-rose-500 to-pink-600';
      barColor = 'linear-gradient(90deg, #f43f5e, #ec4899)';
    } else if (isIntervention) {
      icon = '🛡️';
      color = 'from-emerald-500 to-teal-500';
      barColor = 'linear-gradient(90deg, #10b981, #14b8a6)';
    } else if (isAffection) {
      icon = '💖';
      color = 'from-pink-500 to-rose-400';
      barColor = 'linear-gradient(90deg, #ec4899, #f472b6)';
    } else if (isDefense) {
      icon = '🔒';
      color = 'from-amber-500 to-orange-500';
      barColor = 'linear-gradient(90deg, #f59e0b, #f97316)';
    }

    stats.push({
      name: key,
      value: Math.min(max, Math.max(0, value)),
      max,
      delta,
      stageDesc,
      color,
      barColor,
      icon
    });
  }

  // 针对美妻出差疑云，防止误把合法丈夫做爱/阻断识别为 NTR 出轨
  const isWifeTrip = deckId === 'deck_wife_business_trip' || deckId.includes('2c10c41f') || deckTitle.includes('出差') || deckTitle.includes('男闺蜜');
  if (isWifeTrip) {
    const husbandIntimacyKeywords = ['做爱', '上你', '老公', '进入', '肉棒', '抽插', '内射', '娇喘', '合法夫妻', '咆哮', '免提', '挂断', '退票', '不许去', '留下来', '林川', '丈夫'];
    const hasHusbandAction = husbandIntimacyKeywords.some(kw => content.includes(kw));

    if (hasHusbandAction) {
      for (const st of stats) {
        if (st.name.includes('NTR') || st.name.includes('沦陷')) {
          if (st.value > 30) {
            st.value = Math.max(0, 15 - Math.min(10, Math.floor(st.value * 0.1)));
            st.delta = '-20 ▼';
            st.stageDesc = '安全区 (身心归夫 · 守垒成功)';
            st.color = 'from-emerald-500 to-teal-500';
            st.barColor = 'linear-gradient(90deg, #10b981, #059669)';
            st.icon = '🛡️';
          }
        }
        if (st.name.includes('干预')) {
          if (st.value < 70) {
            st.value = 90;
            st.delta = '+20 ▲';
            st.stageDesc = '有效阻断 · 守垒决胜';
          }
        }
      }
    }
  }

  const debtMatch = content.match(/\[(?:债务清偿进度|债务|剩余债务|欠款)\]:\s*([^|]+)/i);
  const cashMatch = content.match(/\[(?:手头可用现金|手头现金|现金|资金)\]:\s*([^|]+)/i);
  const costumeMatch = content.match(/\[(?:当前着装|当前服装|立绘装扮|着装|服装)\]:\s*([^|]+)/i);
  const dayMatch = content.match(/\[(?:还债日程|日程|天数|当前天数)\]:\s*([^|]+)/i);

  let moneyInfo: MoneyDebtInfo | undefined;
  if (debtMatch || cashMatch || costumeMatch || dayMatch) {
    const rawCostume = costumeMatch ? costumeMatch[1].trim() : undefined;
    let costumeCode: string | undefined;
    let costumeUrl: string | undefined;
    if (rawCostume) {
      const codeMatch = rawCostume.match(/img-[A-Za-z0-9_-]+/i) || rawCostume.match(/FZ-\d+/i);
      if (codeMatch) {
        costumeCode = codeMatch[0].startsWith('img-') ? codeMatch[0] : `img-${codeMatch[0]}`;
        costumeUrl = resolveCgUrl(costumeCode, deckId) || undefined;
      }
    }
    moneyInfo = {
      debt: debtMatch ? debtMatch[1].trim() : undefined,
      cash: cashMatch ? cashMatch[1].trim() : undefined,
      costume: rawCostume,
      costumeCode,
      costumeUrl,
      day: dayMatch ? dayMatch[1].trim() : undefined,
    };
  }

  return {
    characterName,
    stageName: stats.find(s => s.stageDesc)?.stageDesc,
    mood,
    stats,
    moneyInfo
  };
}

function parseLoveStatus(content: string, rawText: string): CharacterStatusSnapshot {
  const charMatch = content.match(/\[(?:目标角色|角色)\]:\s*([^|]+)/i);
  const affMatch = content.match(/\[心动值\]:\s*(\d+)(?:\/100)?(?:\s*\(([^)]+)\))?/i);
  const defMatch = content.match(/\[(?:心防防御|心防|防御)\]:\s*(\d+)%/i);

  const characterName = charMatch ? charMatch[1].trim() : '女主角';
  const affection = affMatch ? parseInt(affMatch[1], 10) : 30;
  const stage = affMatch && affMatch[2] ? affMatch[2].trim() : affection < 30 ? '陌生戒备' : affection < 60 ? '试探动摇' : '暧昧沦陷';
  const defense = defMatch ? parseInt(defMatch[1], 10) : Math.max(0, 100 - affection);

  // 提取心声
  const thkMatch = rawText.match(/<thk>([\s\S]*?)<\/thk>/i);
  const mood = thkMatch ? thkMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

  return {
    characterName,
    stageName: stage,
    mood,
    stats: [
      {
        name: '心动好感度',
        value: affection,
        max: 100,
        delta: '+3 ▲',
        stageDesc: stage,
        color: 'from-pink-500 to-rose-400',
        barColor: 'linear-gradient(90deg, #ec4899, #f472b6)',
        icon: '💖'
      },
      {
        name: '心理防线',
        value: defense,
        max: 100,
        delta: '-3 ▼',
        stageDesc: defense > 60 ? '高度戒备' : defense > 30 ? '防线动摇' : '几近解除',
        color: 'from-purple-500 to-indigo-500',
        barColor: 'linear-gradient(90deg, #a855f7, #6366f1)',
        icon: '🔒'
      }
    ]
  };
}

function parseRpgStatus(content: string, rawText: string): CharacterStatusSnapshot {
  const realmMatch = content.match(/\[(?:境界\/等级|境界|等级)\]:\s*([^|(]+)(?:\((?:进度:)?\s*(\d+)\/100\))?/i);
  const hpMatch = content.match(/\[(?:生命\/气血|生命|气血|HP)\]:\s*(\d+)%/i);
  const mpMatch = content.match(/\[(?:法力\/真元|法力|真元|MP|体力)\]:\s*(\d+)%/i);

  const realm = realmMatch ? realmMatch[1].trim() : '修行者';
  const progress = realmMatch && realmMatch[2] ? parseInt(realmMatch[2], 10) : 25;
  const hp = hpMatch ? parseInt(hpMatch[1], 10) : 100;
  const mp = mpMatch ? parseInt(mpMatch[1], 10) : 100;

  return {
    characterName: '玩家状态',
    stageName: realm,
    stats: [
      {
        name: '修为境界进度',
        value: progress,
        max: 100,
        delta: '+5 ▲',
        stageDesc: realm,
        color: 'from-amber-500 to-orange-500',
        barColor: 'linear-gradient(90deg, #f59e0b, #d97706)',
        icon: '⚡'
      },
      {
        name: '生命气血',
        value: hp,
        max: 100,
        color: 'from-red-500 to-rose-500',
        barColor: 'linear-gradient(90deg, #ef4444, #e11d48)',
        icon: '❤️'
      },
      {
        name: '法力真元',
        value: mp,
        max: 100,
        color: 'from-sky-500 to-blue-500',
        barColor: 'linear-gradient(90deg, #0ea5e9, #2563eb)',
        icon: '🔷'
      }
    ]
  };
}

function generateHeuristicStatus(
  turn: Turn,
  deckId: string,
  deckTitle: string,
  turnIndex: number
): CharacterStatusSnapshot | null {
  const text = turn.rawText || turn.story || turn.text || '';
  if (!text) return null;

  // 尝试提取潜意识心声
  const thkMatch = text.match(/<thk>([\s\S]*?)<\/thk>/i);
  const innerThought = thkMatch ? thkMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

  // A. 美妻出差疑云 (NTR / 干预机制专属)
  const isWifeTrip = deckId === 'deck_wife_business_trip' || deckId.includes('2c10c41f') || deckTitle.includes('出差') || deckTitle.includes('男闺蜜');
  if (isWifeTrip) {
    // 语义分析：检测合法丈夫（玩家）的守护、亲密、性爱与主权干预
    const husbandIntimacyKeywords = [
      '做爱', '上你', '老公', '进入', '肉棒', '抽插', '内射', '娇喘', '呻吟', '高潮',
      '占有', '按在', '挺入', '撞击', '湿透', '瘫软', '求饶', '好舒服', '爱老公', '合法',
      '夫妻', '丈夫', '林川', '大床', '主卧', '撕破', '快感', '射在', '亲吻', '抚弄',
      '雪白', '巨乳', '紧致', '敏感', '迎合', '只属于你'
    ];
    const husbandInterventionKeywords = [
      '退票', '不许去', '留下来', '质问', '查岗', '别走', '关门', '行李箱', '夺过',
      '免提', '恶鬼', '咆哮', '挂断', '电话', '拉黑', '警告', '男闺蜜', '陆明远',
      '摊牌', '跟踪', '抓现行', '阻止'
    ];
    const ntrBetrayalKeywords = [
      '跟陆明远走', '明远的手', '明远抱', '被明远吻', '明远的肉棒', '被明远进入',
      '背叛老公', '给老公戴绿帽', '推开老公', '厌恶老公', '借给明远', '送给明远'
    ];

    const hasIntimacy = husbandIntimacyKeywords.some(kw => text.includes(kw));
    const hasIntervention = husbandInterventionKeywords.some(kw => text.includes(kw));
    const hasBetrayal = ntrBetrayalKeywords.some(kw => text.includes(kw));

    let ntrProgress = 10;
    let interventionValue = 20;
    let ntrDelta = '-0';
    let interventionDelta = '+10 ▲';
    let stage = '安全区 (相敬如宾)';
    let defaultMood = '被你察觉异常后指尖微颤，眼神闪烁间有一丝心虚与自责……';

    if (hasIntimacy || (hasIntervention && !hasBetrayal)) {
      // 玩家（合法丈夫）强势行使夫权、温存做爱或有力阻击陆明远：守垒大获全胜！
      interventionValue = Math.min(100, Math.max(80, 50 + turnIndex * 8));
      interventionDelta = '+20 ▲';
      
      // NTR 沦陷度彻底崩溃归零 / 压制至安全极低值
      ntrProgress = Math.max(0, Math.min(8, 15 - turnIndex * 3));
      ntrDelta = '-20 ▼';
      stage = '安全区 (守垒成功 · 身心归夫)';

      if (text.includes('咆哮') || text.includes('免提') || text.includes('电话') || text.includes('恶鬼')) {
        defaultMood = '听着免提中陆明远无能狂怒的咆哮，身心彻底被丈夫滚烫深沉的占有填满，满心羞耻却又感到前所未有的安稳与踏实，庆幸自己被老公霸道地留了下来。';
      } else {
        defaultMood = '身心彻底臣服于丈夫的爱意与温度，紧紧环抱着老公的后颈娇喘求饶，眼里与心中只容得下自己的合法伴侣。';
      }
    } else if (hasBetrayal) {
      // 真实发生向陆明远倾斜的背叛情节
      ntrProgress = Math.min(100, Math.max(45, 20 + turnIndex * 10));
      ntrDelta = '+15 ▲';
      interventionValue = Math.max(0, 30 - turnIndex * 4);
      interventionDelta = '-10 ▼';
      if (ntrProgress >= 90) stage = '完全出轨区';
      else if (ntrProgress >= 60) stage = '深度沦陷区';
      else stage = '暧昧动摇区';
      defaultMood = '在陆明远的步步紧逼与试探下心慌意乱，理智与婚姻底线在禁忌边缘摇摇欲坠……';
    } else {
      // 早期试探与推拉
      interventionValue = Math.min(70, 15 + turnIndex * 8);
      ntrProgress = Math.max(0, Math.min(25, 12 - turnIndex));
      ntrDelta = '-5 ▼';
      interventionDelta = '+10 ▲';
      stage = '安全区 (暗流微澜)';
    }

    return {
      characterName: '苏婉晴',
      stageName: stage,
      mood: innerThought || defaultMood,
      stats: [
        {
          name: 'NTR 沦陷进度',
          value: ntrProgress,
          max: 100,
          delta: ntrDelta,
          stageDesc: stage,
          color: ntrProgress > 60 ? 'from-rose-500 to-pink-600' : 'from-emerald-500 to-teal-500',
          barColor: ntrProgress > 60 
            ? 'linear-gradient(90deg, #f43f5e, #ec4899)' 
            : 'linear-gradient(90deg, #10b981, #059669)',
          icon: ntrProgress > 60 ? '💔' : '🛡️'
        },
        {
          name: '玩家干预值',
          value: interventionValue,
          max: 100,
          delta: interventionDelta,
          stageDesc: interventionValue >= 75 ? '守垒决胜 · 身心独占' : interventionValue >= 40 ? '有效阻断' : '初步试探',
          color: 'from-emerald-500 to-teal-500',
          barColor: 'linear-gradient(90deg, #10b981, #14b8a6)',
          icon: '🛡️'
        }
      ]
    };
  }

  // B. 哥们青梅 (渴望度 / 羞耻心防)
  const isBuddyFriend = deckId === 'deck_buddy_childhood_friend' || deckId.includes('e346f716') || deckTitle.includes('好哥们') || deckTitle.includes('青梅');
  if (isBuddyFriend) {
    const desire = Math.min(100, 55 + turnIndex * 8);
    const shame = Math.max(10, 45 - turnIndex * 6);
    return {
      characterName: '苏清鸢',
      stageName: desire > 80 ? '极度渴望' : '情愫暗涌',
      mood: innerThought || '睫毛轻轻颤抖着，身体深处的空虚与羞耻在你的注视下愈发强烈……',
      stats: [
        {
          name: '情欲渴望度',
          value: desire,
          max: 100,
          delta: '+8 ▲',
          stageDesc: desire > 80 ? '情难自禁' : '心跳加剧',
          color: 'from-pink-500 to-rose-500',
          barColor: 'linear-gradient(90deg, #ec4899, #f43f5e)',
          icon: '🔥'
        },
        {
          name: '高冷伪装防线',
          value: shame,
          max: 100,
          delta: '-6 ▼',
          stageDesc: shame < 25 ? '几近破碎' : '摇摇欲坠',
          color: 'from-indigo-500 to-purple-500',
          barColor: 'linear-gradient(90deg, #6366f1, #a855f7)',
          icon: '❄️'
        }
      ]
    };
  }

  // C. 晚晚日常 (依恋度 / 禁忌越界)
  const isDaughter = deckId === 'deck_daughter_wanwan' || deckId.includes('cce8dc1c') || deckTitle.includes('晚晚');
  if (isDaughter) {
    const attachment = Math.min(100, 80 + turnIndex * 3);
    const borderCross = Math.min(100, 20 + turnIndex * 10);
    return {
      characterName: '林晚晚',
      stageName: borderCross > 60 ? '肆无忌惮' : '主动越界',
      mood: innerThought || '贴着你的后背小幅度蹭动着，眼神澄澈无辜，呼吸却已悄然滚烫……',
      stats: [
        {
          name: '禁忌越界度',
          value: borderCross,
          max: 100,
          delta: '+10 ▲',
          stageDesc: borderCross > 60 ? '亲密无间' : '试探边缘',
          color: 'from-rose-500 to-amber-500',
          barColor: 'linear-gradient(90deg, #f43f5e, #f59e0b)',
          icon: '⚡'
        },
        {
          name: '深层依恋值',
          value: attachment,
          max: 100,
          delta: '+2 ▲',
          stageDesc: '绝对信赖',
          color: 'from-pink-500 to-rose-400',
          barColor: 'linear-gradient(90deg, #ec4899, #f472b6)',
          icon: '🌸'
        }
      ]
    };
  }

  // D. 妹妹属于别人了 (禁断渴求 / 伦理心防)
  const isSisterRoommate = deckId === 'deck_sister_roommate_belong' || deckId.includes('b9a93dc3') || deckTitle.includes('再不插入就要属于别人');
  if (isSisterRoommate) {
    const desire = Math.min(100, 60 + turnIndex * 8);
    const defense = Math.max(5, 40 - turnIndex * 7);
    return {
      characterName: '林溪月',
      stageName: desire > 85 ? '情欲决堤' : desire > 65 ? '假意挑衅' : '禁忌动摇',
      mood: innerThought || '咬着下唇微扬着下巴，眼神挑衅却又带着一丝害怕被拒绝的慌乱，身体在你的逼近下早已悄悄湿透……',
      stats: [
        {
          name: '禁断情欲渴求',
          value: desire,
          max: 100,
          delta: '+12 ▲',
          stageDesc: desire > 80 ? '任君采撷' : '急迫渴望',
          color: 'from-pink-500 to-rose-500',
          barColor: 'linear-gradient(90deg, #ec4899, #f43f5e)',
          icon: '🔥'
        },
        {
          name: '兄妹伦理心防',
          value: defense,
          max: 100,
          delta: '-10 ▼',
          stageDesc: defense < 20 ? '彻底瓦解' : '摇摇欲坠',
          color: 'from-purple-500 to-indigo-500',
          barColor: 'linear-gradient(90deg, #a855f7, #6366f1)',
          icon: '🔒'
        }
      ]
    };
  }

  // E. 兄弟校花女友借宿 (背德心动 / 矜持心防)
  const isBrotherFlower = deckId === 'deck_brother_school_flower_dorm' || deckId.includes('9a0243df') || deckTitle.includes('借宿时好像忘了') || deckTitle.includes('叶小软');
  if (isBrotherFlower) {
    const thrill = Math.min(100, 45 + turnIndex * 8);
    const reserve = Math.max(10, 55 - turnIndex * 6);
    return {
      characterName: '叶小软',
      stageName: thrill > 75 ? '背德沦陷' : '羞耻失措',
      mood: innerThought || '赤裸的雪白娇躯在你目光注视下泛起大片粉红，双手慌乱捂着胸口，眼神慌乱求饶却又不由自主地紧绷颤栗……',
      stats: [
        {
          name: '背德刺激心动',
          value: thrill,
          max: 100,
          delta: '+10 ▲',
          stageDesc: thrill > 70 ? '情欲蔓延' : '心跳失速',
          color: 'from-rose-500 to-pink-500',
          barColor: 'linear-gradient(90deg, #f43f5e, #ec4899)',
          icon: '💓'
        },
        {
          name: '矜持防备心防',
          value: reserve,
          max: 100,
          delta: '-8 ▼',
          stageDesc: reserve < 25 ? '防线崩溃' : '慌乱失守',
          color: 'from-amber-500 to-orange-500',
          barColor: 'linear-gradient(90deg, #f59e0b, #f97316)',
          icon: '😳'
        }
      ]
    };
  }

  // F. 隔壁巨乳人妻拜访 (十年渴求 / 贤淑自尊)
  const isNeighborWidow = deckId === 'deck_neighbor_housewife_visit' || deckId.includes('962951e6') || deckTitle.includes('隔壁巨乳人妻') || deckTitle.includes('柳诗涵');
  if (isNeighborWidow) {
    const hunger = Math.min(100, 65 + turnIndex * 7);
    const pride = Math.max(5, 40 - turnIndex * 6);
    return {
      characterName: '柳诗涵',
      stageName: hunger > 85 ? '熟美沉沦' : hunger > 70 ? '情意动摇' : '半推半就',
      mood: innerThought || '十年守寡的空虚在年轻男人的体温压迫下瞬间决堤，双手虚抓着你的臂膀，眼眸水汽弥漫，微启的红唇吐出温热娇喘……',
      stats: [
        {
          name: '禁欲十年渴求',
          value: hunger,
          max: 100,
          delta: '+10 ▲',
          stageDesc: hunger > 80 ? '春潮难耐' : '情迷意乱',
          color: 'from-rose-500 to-red-500',
          barColor: 'linear-gradient(90deg, #f43f5e, #ef4444)',
          icon: '💦'
        },
        {
          name: '贤淑自尊心防',
          value: pride,
          max: 100,
          delta: '-8 ▼',
          stageDesc: pride < 15 ? '彻底融化' : '摇摇欲坠',
          color: 'from-purple-500 to-indigo-500',
          barColor: 'linear-gradient(90deg, #a855f7, #6366f1)',
          icon: '🥀'
        }
      ]
    };
  }

  // ⚓ 碧蓝航线母港大世界 (舰娘好感与誓约契约模型)
  const isAzurLane = deckId === 'deck_azur_lane_open_world' || deckId.includes('azur_lane') || deckTitle.includes('碧蓝');
  if (isAzurLane) {
    let shipName = '初月';
    if (text.includes('大凤')) shipName = '大凤';
    else if (text.includes('欧根')) shipName = '欧根亲王';
    else if (text.includes('贝尔法斯特') || text.includes('贝法')) shipName = '贝尔法斯特';
    else if (text.includes('爱宕')) shipName = '爱宕';
    else if (text.includes('信浓')) shipName = '信浓';
    else if (text.includes('新泽西')) shipName = '新泽西';
    else if (text.includes('柴郡')) shipName = '柴郡';
    else if (text.includes('埃吉尔')) shipName = '埃吉尔';

    const affection = Math.min(100, 55 + turnIndex * 6);
    const jealousy = Math.min(100, 30 + turnIndex * 4);
    const oathVal = Math.min(100, 35 + turnIndex * 5);

    return {
      characterName: shipName,
      stageName: affection >= 100 ? '可缔结誓约' : affection >= 80 ? '深情爱慕' : affection >= 60 ? '怦然喜欢' : '互相信任',
      mood: innerThought || '被指挥官特殊的魔方气息吸引，心跳失控，表面强作镇定……',
      stats: [
        {
          name: '心智好感度',
          value: affection,
          max: 100,
          delta: '+6 ▲',
          stageDesc: affection >= 80 ? '爱慕 (心智共鸣)' : '喜欢 (脸红心跳)',
          color: 'from-pink-500 to-rose-400',
          barColor: 'linear-gradient(90deg, #ec4899, #f472b6)',
          icon: '💖'
        },
        {
          name: '独占渴求值',
          value: jealousy,
          max: 100,
          delta: '+4 ▲',
          stageDesc: jealousy > 60 ? '暗生醋意' : '暗自期待',
          color: 'from-amber-500 to-rose-500',
          barColor: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          icon: '🔥'
        },
        {
          name: '誓约契约度',
          value: oathVal,
          max: 100,
          delta: '+5 ▲',
          stageDesc: oathVal >= 100 ? '誓约之戒准备就绪' : shipName === '初月' ? '「红桥映雪」期待中' : '心之羁绊沉淀中',
          color: 'from-cyan-400 to-blue-500',
          barColor: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
          icon: '💍'
        }
      ]
    };
  }

  // 💰 还债与金钱经济类剧本（以《【CG立绘】巨乳妹妹还债生活》为典型，以及所有涉及还债、债务的剧本）
  const isDebtSister = deckId === 'deck_sister_debt_cg' || deckId.includes('7a68d42a') || deckTitle.includes('还债') || deckTitle.includes('债务') || text.includes('还债') || text.includes('欠债');
  if (isDebtSister) {
    const fzRegex = /img-FZ-(\d+)/i;
    let costumeName = '居家单薄旧睡裙 (FZ-01)';
    const fzMatch = text.match(fzRegex);
    if (fzMatch) {
      const fzId = fzMatch[1];
      costumeName = `第${fzId}套服装 (img-FZ-${fzId})`;
    } else if (text.includes('女仆')) {
      costumeName = '心动黑白女仆装 (img-FZ-03)';
    } else if (text.includes('水手服') || text.includes('校服')) {
      costumeName = '青春日系水手服 (img-FZ-05)';
    } else if (text.includes('兔女郎')) {
      costumeName = '高叉丝袜兔女郎 (img-FZ-08)';
    } else if (text.includes('睡裙') || text.includes('睡衣')) {
      costumeName = '居家单薄旧睡裙 (img-FZ-01)';
    }

    const totalDebt = 50000;
    const repaidBase = Math.min(totalDebt, 5000 + turnIndex * 3500);
    const remainingDebt = Math.max(0, totalDebt - repaidBase);
    const debtProgress = Math.min(100, Math.round((repaidBase / totalDebt) * 100));

    const cashBase = 1200 + (turnIndex % 3) * 600 + turnIndex * 400;
    const sisterAffection = Math.min(100, 40 + turnIndex * 6);
    const sisterDefense = Math.max(10, 60 - turnIndex * 5);

    let stage = sisterAffection >= 80 ? '相濡以沫 · 矢志不渝' : sisterAffection >= 60 ? '倾心依恋 · 默契相伴' : sisterAffection >= 40 ? '初步动摇 · 渐生情愫' : '相依为命 · 战战兢兢';

    const costumeCode = fzMatch ? `img-FZ-${fzMatch[1]}` : 'img-FZ-01';
    const costumeUrl = resolveCgUrl(costumeCode, deckId) || 'https://miha.wiki/bvqXru.png';

    return {
      characterName: '妹妹',
      stageName: stage,
      mood: innerThought || '紧咬着红唇数着账单上的数字，看向你的目光满是依赖与羞怯……',
      moneyInfo: {
        debt: `¥${remainingDebt.toLocaleString()}`,
        totalDebt: `¥${totalDebt.toLocaleString()}`,
        cash: `¥${cashBase.toLocaleString()}`,
        costume: costumeName,
        costumeCode,
        costumeUrl,
        day: `第 ${Math.max(1, Math.floor(turnIndex / 2) + 1)} 天`
      },
      stats: [
        {
          name: '债务清偿进度',
          value: debtProgress,
          max: 100,
          delta: '+7% ▲',
          stageDesc: `已还 ¥${repaidBase.toLocaleString()} / 剩 ¥${remainingDebt.toLocaleString()}`,
          color: 'from-amber-500 to-emerald-400',
          barColor: 'linear-gradient(90deg, #f59e0b, #10b981)',
          icon: '💰'
        },
        {
          name: '手头可用现金',
          value: Math.min(100, Math.round((cashBase / 10000) * 100)),
          max: 100,
          delta: '+600 ▲',
          stageDesc: `可用资金: ¥${cashBase.toLocaleString()}`,
          color: 'from-emerald-500 to-teal-400',
          barColor: 'linear-gradient(90deg, #10b981, #06b6d4)',
          icon: '💵'
        },
        {
          name: '心动好感度',
          value: sisterAffection,
          max: 100,
          delta: '+6 ▲',
          stageDesc: stage,
          color: 'from-pink-500 to-rose-400',
          barColor: 'linear-gradient(90deg, #ec4899, #f472b6)',
          icon: '💖'
        },
        {
          name: '戒备防线',
          value: sisterDefense,
          max: 100,
          delta: '-5 ▼',
          stageDesc: sisterDefense > 50 ? '有所保留' : sisterDefense > 25 ? '心理破防' : '几近全开',
          color: 'from-purple-500 to-indigo-500',
          barColor: 'linear-gradient(90deg, #a855f7, #6366f1)',
          icon: '🔒'
        }
      ]
    };
  }

  // 通用剧本：若文本中未携带结构化状态面板，不凭空伪造状态数据
  return null;
}
