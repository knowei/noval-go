import { Turn, StoryDeck, CharacterIntimacyRecord } from './types';

// 常见特定剧本专属看板角色兜底池
const KNOWN_DECK_ROSTERS: Record<string, Array<{ name: string; avatar: string; tag: string; defaultMood: string; defaultRelation: string; sensitive: string[] }>> = {
  girls_dormitory: [
    {
      name: '苏小可',
      avatar: '/assets/cards/girls_dormitory/suxiaoke.png',
      tag: '元气腹黑 · 双丸子头',
      defaultMood: '穿着轻薄吊带睡裙吃薯片，毫无防备地拉你贴贴',
      defaultRelation: '无防备亲昵室友',
      sensitive: ['腰侧怕痒', '耳尖', '大腿内侧']
    },
    {
      name: '凌玥',
      avatar: '/assets/cards/girls_dormitory/lingyue.jpg',
      tag: '高冷御姐 · 跆拳黑带',
      defaultMood: '眼神冷淡机警，暗暗审视新室友的一举一动',
      defaultRelation: '高冷大姐大',
      sensitive: ['锁骨', '后背防守线', '手腕']
    },
    {
      name: '叶芷柔',
      avatar: '/assets/cards/girls_dormitory/yezhirou.jpg',
      tag: '知性校花 · 温柔白月光',
      defaultMood: '言行端庄知礼，对长相过于漂亮的你抱有天然怜惜',
      defaultRelation: '善解人意校花姐姐',
      sensitive: ['后颈', '发丝', '手心']
    },
    {
      name: '夏仟歌',
      avatar: '/assets/cards/girls_dormitory/xiaqiange.jpg',
      tag: '男装少女 · 秘密同盟',
      defaultMood: '在男生宿舍卧底的同命相怜盟友，满怀惺惺相惜',
      defaultRelation: '秘密共犯生死同盟',
      sensitive: ['腹部', '膝窝', '喉颈伪装带']
    }
  ],
  azur_lane: [
    {
      name: '初月',
      avatar: '/images/azurlane/hatsuzuki.png',
      tag: '傲娇小娇妻 · 秋月级驱逐',
      defaultMood: '口是心非爱逞强，被撞见走光就耳尖熟透',
      defaultRelation: '傲娇逞强小娇妻',
      sensitive: ['耳垂', '后腰', '手背魔方共鸣点']
    },
    {
      name: '大凤',
      avatar: '/images/azurlane/taihou.png',
      tag: '极度病娇 · 装甲航空母舰',
      defaultMood: '满心满眼全是指挥官大人，滚烫依恋渴求侍奉',
      defaultRelation: '病娇独占依恋者',
      sensitive: ['锁骨微汗处', '胸口心智核心', '小腹']
    },
    {
      name: '欧根亲王',
      avatar: '/images/azurlane/prinz_eugen.png',
      tag: '微醺恶魔 · 铁血重巡洋舰',
      defaultMood: '晃动冰啤酒慵懒调笑，眼神玩味挑弄',
      defaultRelation: '微醺调情坏姐姐',
      sensitive: ['唇角', '腰身舰装缝隙', '脚踝']
    },
    {
      name: '贝尔法斯特',
      avatar: '/images/azurlane/belfast.png',
      tag: '完美女仆长 · 皇家轻巡洋舰',
      defaultMood: '端庄从容侍奉，礼节无懈可击却暗藏温柔心跳',
      defaultRelation: '贴身侍奉女仆长',
      sensitive: ['指尖', '颈间丝带', '后颈发际']
    },
    {
      name: '爱宕',
      avatar: '/images/azurlane/atago.png',
      tag: '肉感丰腴 · 温柔膝枕大姐姐',
      defaultMood: '摇着犬耳笑容甜媚，主动招呼你靠在大腿上',
      defaultRelation: '溺爱抚慰大姐姐',
      sensitive: ['犬耳耳根', '丰腴大腿内侧', '侧腰']
    }
  ]
};

/**
 * 从单行或文本中提取数字
 */
function extractNumber(text: string, pattern: RegExp, fallback = 0): number {
  const m = text.match(pattern);
  return m && m[1] ? parseInt(m[1], 10) : fallback;
}

/**
 * 解析多角色私密关系与亲密记录
 */
export function parseHaremIntimacyRecords(
  turns: Turn[],
  currentDeck?: StoryDeck | null,
  deckId: string = ''
): CharacterIntimacyRecord[] {
  const safeTurns = (turns || []).filter((t): t is Turn => Boolean(t && typeof t === 'object'));
  const allText = safeTurns.map(t => (t.story || t.text || t.rawText || '')).join('\n');

  // 1. 确定本卡参与追踪的女角色列表
  const idKey = (deckId || '').toLowerCase();
  const titleKey = (currentDeck?.title || '').toLowerCase();

  let targetChars: Array<{
    name: string;
    avatar?: string;
    tag?: string;
    defaultMood?: string;
    defaultRelation?: string;
    sensitive?: string[];
  }> = [];

  const isGenericPlaceholder = (n: string) => {
    if (!n) return true;
    const clean = n.replace(/[\s\(\)（）\[\]【】]/g, '').trim();
    return /^(故事角色|主要女角色|互动对象|女主角|女主|NPC|npc|女角色|角色|路人|群演)$/i.test(clean);
  };

  // 优先从剧本自带的角色卡列表中自动识别（完全通用：无论新建、复制或导入剧本均自动生效）
  if (currentDeck?.roles && Array.isArray(currentDeck.roles) && currentDeck.roles.length > 0) {
    // 过滤掉玩家/主角
    const femaleRoles = currentDeck.roles.filter((r: any) => {
      const n = (r?.name || '').toLowerCase();
      const roleStr = (r?.role || '').toLowerCase();
      const idStr = (r?.id || '').toLowerCase();
      return !n.includes('玩家') && !n.includes('主角') && !n.includes('我') && 
             !n.includes('指挥官') && !roleStr.includes('主角') && !roleStr.includes('玩家') &&
             !idStr.includes('protagonist') && !idStr.includes('mc');
    });

    if (femaleRoles.length > 0) {
      targetChars = femaleRoles.map((r: any) => ({
        name: (r?.name || '').replace(/\s*[\(（].*?[\)）]/g, '').trim(),
        avatar: r.avatar,
        tag: r.tag || r.role || '主要女角色',
        defaultMood: r.desc?.slice(0, 36) || '默默关注着你的举动',
        defaultRelation: '相识互动中',
        sensitive: ['耳根', '腰际']
      }));
    }
  }

  // 仅针对缺少角色配置的官方示例体验卡进行历史数据兜底
  if (targetChars.length === 0) {
    if (idKey.includes('girls_dormitory') || titleKey.includes('女生宿舍') || idKey.includes('e59fe31f')) {
      targetChars = [...KNOWN_DECK_ROSTERS.girls_dormitory];
    } else if (idKey.includes('azur_lane') || titleKey.includes('碧蓝')) {
      targetChars = [...KNOWN_DECK_ROSTERS.azur_lane];
    }
  }

  // 2. 尝试从最近的 AI 轮次中提取结构化 <harem_status> 或 <intimacy_record>
  const tagDataMap = new Map<string, Partial<CharacterIntimacyRecord>>();

  for (let i = safeTurns.length - 1; i >= 0; i--) {
    const t = safeTurns[i];
    if (!t || t.isUser) continue;
    const raw = t.rawText || t.story || t.text || '';

    const haremMatch = raw.match(/<(?:harem_status|intimacy_record)>([\s\S]*?)<\/(?:harem_status|intimacy_record)>/i) ||
                       raw.match(/【(?:全员私密记录|多角色亲密状态|私密关系监控)】([\s\S]*?)(?:【|<opt>|$)/i);
    if (haremMatch) {
      const block = haremMatch[1];
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

      for (const line of lines) {
        // 先去除前导符号（如 📌、💖、-、#、*、序号等）和中括号
        const clean = line.replace(/^[#*\-•\s📌💖🌸👉▶️>0-9.、]*[\[【]?/, '').trim();
        // 匹配 角色名 + 分隔符(: 或 |) + 内容，兼容各种模型格式
        const matchName = clean.match(/^([^:：|\[\]【】*]+?)[\]】*]*\s*[:：|]\s*(.*)$/);
        if (!matchName) continue;

        let charName = matchName[1].replace(/\s*[\(（].*?[\)）]/g, '').trim();
        const infoStr = matchName[2];

        // 过滤非角色名关键词或异常长文本
        if (!charName || charName.length > 15 || /^(心情|心境|关系|好感|接吻|口交|合体|做爱|中出|内射|高潮|隐秘|弱点|敏感|状态|全员|记录|监控)$/.test(charName)) {
          continue;
        }

        const moodMatch = infoStr.match(/(?:心情|心境|心理)[：:]\s*([^|]+)/);
        const relMatch = infoStr.match(/(?:关系|身份|阶段)[：:]\s*([^|]+)/);
        const favorMatch = infoStr.match(/(?:好感|动摇|沦陷|爱意)[：:]\s*(\d+)/);

        const kiss = extractNumber(infoStr, /接吻[：:]\s*(\d+)/);
        const oral = extractNumber(infoStr, /口交[：:]\s*(\d+)/);
        const sex = extractNumber(infoStr, /(?:合体|做爱|性交)[：:]\s*(\d+)/);
        const creampie = extractNumber(infoStr, /(?:中出|内射)[：:]\s*(\d+)/);
        const orgasm = extractNumber(infoStr, /(?:高潮|绝顶)[：:]\s*(\d+)/);

        const sensMatch = infoStr.match(/(?:弱点|敏感|隐秘状态)[：:]\s*([^|]+)/);

        // 优先匹配已知真实角色（排除“故事角色”等通用占位符）
        const target = targetChars.find(tc => !isGenericPlaceholder(tc.name) && (tc.name.includes(charName) || charName.includes(tc.name)));
        const matchedKey = target ? target.name : charName;

        if (!tagDataMap.has(matchedKey)) {
          tagDataMap.set(matchedKey, {
            characterName: matchedKey,
            mood: moodMatch ? moodMatch[1].trim() : undefined,
            relation: relMatch ? relMatch[1].trim() : undefined,
            favor: favorMatch ? parseInt(favorMatch[1], 10) : undefined,
            kissCount: kiss,
            oralCount: oral,
            sexCount: sex,
            creampieCount: creampie,
            orgasmCount: orgasm,
            sensitivePoints: sensMatch ? sensMatch[1].split(/[,，、/]/).map(s => s.trim()).filter(Boolean) : undefined
          });
        }
      }

      if (tagDataMap.size > 0) {
        break; // 以最新一轮标签为主
      }
    }
  }

  // 动态将从 AI 标签中识别出的真实角色补充并剔除通用占位符
  const tagCharKeys = Array.from(tagDataMap.keys()).filter(k => !isGenericPlaceholder(k));
  if (tagCharKeys.length > 0) {
    // 剔除原本列表里的“故事角色”等占位角色
    targetChars = targetChars.filter(tc => !isGenericPlaceholder(tc.name));

    const fallbackAvatar = 
      (currentDeck?.handbook as any)?.bg_image || 
      currentDeck?.cover_image || 
      (currentDeck?.roles as any[])?.find((r: any) => !r?.name?.includes('主角') && !r?.name?.includes('玩家'))?.avatar ||
      '/images/default_avatar.png';

    for (const tagKey of tagCharKeys) {
      const existing = targetChars.find(tc => tc.name.includes(tagKey) || tagKey.includes(tc.name));
      if (!existing) {
        targetChars.push({
          name: tagKey,
          avatar: fallbackAvatar,
          tag: '剧本核心角色',
          defaultMood: '沉浸在与你的互动中',
          defaultRelation: '亲密羁绊',
          sensitive: ['敏感腰际', '身体深处']
        });
      }
    }
  }

  // 3. 全局历史对话关键词物理扫描统计（结合干净剧情正文与轮次上下文）
  const scannedCounts = new Map<string, { kiss: number; oral: number; sex: number; creampie: number; orgasm: number }>();

  targetChars.forEach(tc => {
    const cname = tc.name;
    const nameAliases = [cname, cname.slice(0, 2), cname.slice(-2)].filter(s => s && s.length >= 2);
    const namePattern = nameAliases.length > 0 ? nameAliases.join('|') : cname;
    const isSingleFemaleDeck = targetChars.length === 1;

    let kiss = 0, oral = 0, sex = 0, creampie = 0, orgasm = 0;

    for (const t of safeTurns) {
      if (!t || t.isUser) continue;
      const turnText = t.story || t.text || t.rawText || '';
      if (!turnText) continue;

      // 必须完全剥离任何 XML 标签、状态块、规则块与监控标签，严防状态标签内的“接吻:0次”等指标名字污染正文统计
      const cleanStory = turnText
        .replace(/<([a-zA-Z0-9_-]+)>[\s\S]*?<\/\1>/gi, '')
        .replace(/<[a-zA-Z0-9_-]+>[\s\S]*$/gi, '')
        .replace(/【[^】]*(?:状态|面板|监控|记录|规则|设定|数值|防线|选项|抉择)[^】]*】[\s\S]*?(?=(?:【|$))/gi, '')
        .replace(/^\[?[^:：\n]+\]?\s*[:：]\s*(?:心情|关系|好感|接吻|口交|合体|中出|高潮|隐秘|弱点|敏感).*$/gim, '')
        .trim();

      if (!cleanStory) continue;

      // 如果本卡仅1位核心女性，或该轮正文中出现了该角色的姓名/代称，即归入该角色
      const mentionsChar = isSingleFemaleDeck || (namePattern && new RegExp(namePattern).test(cleanStory));
      if (!mentionsChar) continue;

      // 统计亲密动作（在干净正文中，排除规则说明与否定句）
      if (/(?:亲吻|接吻|吻住|湿吻|唇舌交缠|吻上她的唇|堵住她的嘴)/.test(cleanStory) && !/(?:未|没有|禁止|严禁|不可).*?(?:亲吻|接吻|吻)/.test(cleanStory)) kiss++;
      if (/(?:口交|深喉|含住|吞吐|吮吸|含入嘴中|口舌侍奉|舔舐肉棒|跪在两腿间)/.test(cleanStory) && !/(?:未|没有|禁止|严禁|不可).*?(?:口交|深喉)/.test(cleanStory)) oral++;
      if (/(?:做爱|插入|合体|贯穿|结合|抽插|进入身体|破处|夺走初夜|占有她|翻云覆雨|撞进那片湿软|肉棒插进去)/.test(cleanStory) && !/(?:未|没有|禁止|严禁|不可).*?(?:做爱|插入|合体|性交)/.test(cleanStory)) sex++;
      // 深度内射 / 中出：包含深处释放、交合处淌下、温热湿意涌出、灌满注入白浊、汁液外溢等
      if (/(?:中出|内射|灌满|射入深处|滚烫浓稠白浊注入|射进体内|子宫口|深处释放|交合.*淌下|深处涌出.*温热.*湿意|汁液外溢.*交合|交合.*汁液|深处.*射入|体内.*射出|射在里面)/.test(cleanStory) && !/(?:未|没有|禁止|严禁).*?(?:中出|内射)/.test(cleanStory)) creampie++;
      if (/(?:高潮|绝顶|潮吹|痉挛颤抖|失神抽搐|娇啼求饶|绝顶后失神)/.test(cleanStory) && !/(?:未|没有|禁止|严禁).*?(?:高潮|绝顶)/.test(cleanStory)) orgasm++;
    }

    scannedCounts.set(cname, { kiss, oral, sex, creampie, orgasm });
  });

  // 4. 组装每位角色的最终状态卡
  return targetChars.map((tc, idx) => {
    const explicit = tagDataMap.get(tc.name) || {};
    const scanned = scannedCounts.get(tc.name) || { kiss: 0, oral: 0, sex: 0, creampie: 0, orgasm: 0 };

    // 取显式 AI 标签与纯正文扫描到的最大值
    const kissCount = explicit.kissCount !== undefined ? Math.max(explicit.kissCount, scanned.kiss) : scanned.kiss;
    const oralCount = explicit.oralCount !== undefined ? Math.max(explicit.oralCount, scanned.oral) : scanned.oral;
    const sexCount = explicit.sexCount !== undefined ? Math.max(explicit.sexCount, scanned.sex) : scanned.sex;
    const orgasmCount = explicit.orgasmCount !== undefined ? Math.max(explicit.orgasmCount, scanned.orgasm) : scanned.orgasm;
    // 物理铁律：只有发生过合体做爱（sexCount > 0），才可能存在体内射精中出
    const creampieCount = sexCount > 0
      ? (explicit.creampieCount !== undefined ? Math.max(explicit.creampieCount, scanned.creampie) : scanned.creampie)
      : 0;

    // 计算关系描述
    let relation = explicit.relation || tc.defaultRelation || '相识互动中';
    if (!explicit.relation) {
      if (sexCount > 0) relation = '身心契合 · 私密恋人';
      else if (oralCount > 0) relation = '深度沦陷 · 私密侍奉';
      else if (kissCount > 0) relation = '暧昧悸动 · 亲密接触';
    }

    // 计算好感度：若无显式标签，基于角色关系与互动次数动态赋予初始值
    let baseFavor = 20;
    const relStr = (relation || '').toLowerCase();
    if (relStr.includes('初') || relStr.includes('陌生') || relStr.includes('敌对') || relStr.includes('冷淡') || relStr.includes('管教') || relStr.includes('戒备') || relStr.includes('抗拒')) {
      baseFavor = 10;
    } else if (relStr.includes('室友') || relStr.includes('同居')) {
      baseFavor = 25;
    }

    let favor = explicit.favor ?? (baseFavor + kissCount * 8 + oralCount * 12 + sexCount * 18);
    favor = Math.min(100, Math.max(5, favor));

    // 计算心境与潜台词
    let mood = explicit.mood || tc.defaultMood || '心中充满好奇与微澜';
    if (!explicit.mood) {
      if (sexCount > 0) mood = '被你彻底占有后余韵未消，看着你的眼神满是化不开的爱恋与羞涩';
      else if (oralCount > 0) mood = '嘴角残留着温热气息，回想起刚才口舌相伺的画面耳根滚烫';
      else if (kissCount > 0) mood = '指尖摸着微肿的嘴唇，心脏扑通狂跳，无法直视你的眼睛';
    }

    // 防线判定
    let defenseStage = '心防完好';
    if (sexCount > 0) defenseStage = '彻底失守 (全线顺从)';
    else if (oralCount > 0) defenseStage = '防线溃败 (私密妥协)';
    else if (kissCount > 0) defenseStage = '心防融化 (半推半就)';
    else if (favor >= 50) defenseStage = '轻微动摇';

    return {
      characterName: tc.name,
      avatar: tc.avatar,
      tag: tc.tag || '核心女角色',
      relation,
      favor,
      mood,
      kissCount,
      oralCount,
      sexCount,
      creampieCount,
      orgasmCount,
      firstTimeLost: sexCount > 0,
      sensitivePoints: explicit.sensitivePoints || tc.sensitive || ['耳垂', '敏感腰际'],
      defenseStage
    };
  });
}
