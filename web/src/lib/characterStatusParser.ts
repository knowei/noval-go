import { Turn } from './types';

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

export interface CharacterStatusSnapshot {
  characterName: string;
  stageName?: string;
  mood?: string;
  thought?: string;
  stats: StatMetric[];
}

/**
 * 从一轮对话文本或历史中，解析当前角色的心理数值与本轮波动
 */
export function parseTurnCharacterStatus(
  turn: Turn,
  deckId: string = '',
  deckTitle: string = '',
  turnIndex: number = 0
): CharacterStatusSnapshot | null {
  if (!turn || turn.isUser) return null;

  const rawText = turn.rawText || turn.story || turn.text || '';
  if (!rawText) return null;

  // 1. 尝试从 <char_status> 标签解析
  const charStatusMatch = rawText.match(/<char_status>([\s\S]*?)<\/char_status>/i);
  if (charStatusMatch) {
    const content = charStatusMatch[1].trim();
    return parseExplicitCharStatus(content, deckId, deckTitle);
  }

  // 2. 尝试从 <love_status> 标签解析
  const loveMatch = rawText.match(/<love_status>([\s\S]*?)<\/love_status>/i);
  if (loveMatch) {
    const content = loveMatch[1].trim();
    return parseLoveStatus(content, rawText);
  }

  // 3. 尝试从 <rpg_status> 标签解析
  const rpgMatch = rawText.match(/<rpg_status>([\s\S]*?)<\/rpg_status>/i);
  if (rpgMatch) {
    const content = rpgMatch[1].trim();
    return parseRpgStatus(content, rawText);
  }

  // 4. 启发式保底回退：若无上述标签，根据剧本特征和正文内容生成精准的状态卡
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

    let icon = '📊';
    let color = 'from-purple-500 to-indigo-500';
    let barColor = 'linear-gradient(90deg, #a855f7, #6366f1)';

    if (isNtr) {
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

  return {
    characterName,
    mood,
    stats
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
    const progressBase = Math.min(95, 10 + turnIndex * 6);
    const interventionBase = Math.min(95, 5 + turnIndex * 12);

    let stage = '安全区 (相敬如宾)';
    if (progressBase >= 90) stage = '完全出轨区';
    else if (progressBase >= 60) stage = '深度沦陷区';
    else if (progressBase >= 30) stage = '暧昧动摇区';

    return {
      characterName: '苏婉晴',
      stageName: stage,
      mood: innerThought || '被你察觉异常后指尖微颤，眼神闪烁间有一丝心虚与自责……',
      stats: [
        {
          name: 'NTR 沦陷进度',
          value: progressBase,
          max: 100,
          delta: '+5 ▲',
          stageDesc: stage,
          color: 'from-rose-500 to-pink-600',
          barColor: 'linear-gradient(90deg, #f43f5e, #ec4899)',
          icon: '💔'
        },
        {
          name: '玩家干预值',
          value: interventionBase,
          max: 100,
          delta: '+15 ▲',
          stageDesc: interventionBase > 40 ? '有效阻断' : '初步试探',
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

  // 通用恋爱心防模型
  const aff = Math.min(100, 25 + turnIndex * 5);
  const def = Math.max(10, 75 - turnIndex * 5);
  return {
    characterName: '主要角色',
    stageName: aff > 60 ? '暧昧悸动' : '初步动摇',
    mood: innerThought || '被你的言行牵动着情绪，正在重新衡量彼此的距离……',
    stats: [
      {
        name: '心动好感度',
        value: aff,
        max: 100,
        delta: '+5 ▲',
        stageDesc: aff > 60 ? '深层好感' : '打破隔阂',
        color: 'from-pink-500 to-rose-500',
        barColor: 'linear-gradient(90deg, #ec4899, #f472b6)',
        icon: '💖'
      },
      {
        name: '戒备防线',
        value: def,
        max: 100,
        delta: '-5 ▼',
        stageDesc: def < 40 ? '防线微弱' : '有所保留',
        color: 'from-purple-500 to-indigo-500',
        barColor: 'linear-gradient(90deg, #a855f7, #6366f1)',
        icon: '🔒'
      }
    ]
  };
}
