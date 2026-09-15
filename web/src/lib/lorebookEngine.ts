import { LoreEntry, Turn } from './types';

// ============================================================================
// 1. 核心大作官方内置世界书词条库 (Lorebook Knowledge Base)
// ============================================================================

export const DEFAULT_LOREBOOKS: Record<string, LoreEntry[]> = {
  // ☣️ 末世求生录
  deck_apocalypse_survival: [
    {
      id: 'apoc_vault_door',
      keys: ['防爆门', '大门', '合金门', '安全门', '门锁', '反锁', '锁死'],
      title: '地下安全屋合金防爆大门',
      category: 'location',
      content: '重达2.4吨的三级军用防生化辐射密封门，带有机械密码转盘与独立液压闭锁机构。只有主角掌握机械钥匙与密码。门外带有防拆高画质针孔夜视探头，门内控制台可清晰查看走廊动静，一旦锁死，哪怕小型炸药或尸潮撞击也无法从外界破坏。'
    },
    {
      id: 'apoc_meds',
      keys: ['抗生素', '药品', '消炎药', '退烧药', '医疗包', '纱布', '碘伏', '伤口', '感染'],
      title: '地下安全屋应急抗生素与战备医疗包',
      category: 'item',
      content: '主角储藏柜中封存着极其珍贵的3盒头孢克肟胶囊、2支肾上腺素、以及半箱医用消毒酒精。在末日爆发、各大医院沦为感染巢穴后，每一颗消炎药都是能救人性命、换取任何生存尊严的至高通货。'
    },
    {
      id: 'apoc_water',
      keys: ['水', '水壶', '清水', '喝水', '口渴', '脱水', '净水', '水源'],
      title: '独立纯净水循环过滤系统与储备纯净水',
      category: 'item',
      content: '安全屋接入了独立深井水过滤冷凝舱，主角手头备有10桶未开封纯净水。外界市政供水早在暴乱第一天就遭到污染断水，苏晓染在走廊逃亡三天滴水未进，喉咙与嘴唇干裂流血，清水的诱惑对她有着绝对摧毁自尊的致命杀伤力。'
    },
    {
      id: 'apoc_suxiaoran',
      keys: ['苏晓染', '学姐', '校花', '晓染', '白皙', '名媛', '高岭之花'],
      title: '苏晓染的角色底细与隐秘自尊防线',
      category: 'character',
      content: '21岁医学院高材生，校花兼院学生会外联部部长，平日在学校备受富二代追捧、矜持高傲。逃亡途中脚踝曾被轻度扭伤但未被咬伤。她极度害怕被丢弃在走廊里沦为丧尸的食粮，内心为了活下去已在崩溃边缘，但潜意识深处还残存着名媛的最后一点体面。'
    },
    {
      id: 'apoc_knife',
      keys: ['匕首', '军刀', '刀', '武器', '高碳钢', '刀刃', '冰冷'],
      title: '军用高碳钢战术军刀与自卫军火',
      category: 'item',
      content: '主角随身携带的40cm长高碳钢战术格斗匕首，刀刃附带防反光特氟龙黑涂层，开过血槽，锋利无匹。散发着刺鼻的防锈机油味，曾在走廊当着苏晓染的面利落地斩断过感染者的头颅，对她造成过极具震慑力的血腥视觉冲击。'
    },
    {
      id: 'apoc_outside_zombie',
      keys: ['丧尸', '怪物', '走廊', '叫声', '惨叫', '感染者', '火光', '外面'],
      title: '避难所外走廊与城市的感染现状',
      category: 'rule',
      content: '外界国家应急系统已全面瘫痪，军警失去联络，城市夜空火光冲天、枪炮声渐弱。宿舍区与住宅走廊已被变异狂暴感染者占据，它们具备强烈的嗜血冲动与微弱听觉感知，走廊深处每隔数分钟就会传来幸存者的求救哀嚎与骨骼撕裂声。'
    }
  ],

  // 📱 现实修改器 v6.9
  deck_reality_modifier: [
    {
      id: 'mod_app_rules',
      keys: ['修改器', '因果律', '点数', '常识覆写', 'APP', '权限', '修改'],
      title: '因果律常识覆写APP运行法则',
      category: 'rule',
      content: '主角手机内置无所不能的因果律现实修改器，可直接修改目标认知与物理规则。修改后的常识在目标脑海中属于“天经地义、从小如此”的铁律，但其潜意识或旧有本能会产生微妙的认知错位与身体羞耻战栗。'
    },
    {
      id: 'mod_xiaogai',
      keys: ['小改改', '助手', '监控', '报告', '警报', '扫描'],
      title: '修改器AI助手小改改',
      category: 'character',
      content: '修改器附带的战术智脑语音助手，说话语气俏皮戏谑、喜欢挑事与拱火。它能够穿透墙壁实时扫描在场目标的生理心跳、体温、心防崩溃百分比与顺从度指数，并向主角汇报。'
    },
    {
      id: 'mod_gu_xiaomeng',
      keys: ['顾小梦', '小梦', '学妹', '白袜', '校花', '兼职', '借住'],
      title: '顾小梦的兼职模特经历与把柄',
      category: 'character',
      content: '大学艺术系校花学妹，表面上是活泼清纯的甜妹，背地里为了还助学贷款在网拍兼职过私房模特。对主角兼具学长依赖与被窥探把柄的羞耻恐慌，双腿极修长，常年穿着及膝白棉袜。'
    },
    {
      id: 'mod_su_wanqing',
      keys: ['苏婉清', '隔壁', '插画师', '御姐', '旗袍', '熟女', '对门'],
      title: '对门邻居插画师苏婉清',
      category: 'character',
      content: '302室对门邻居，28岁单身插画师，身材成熟丰腴，平日在家长裙素雅、温文尔雅。因长期居家作画缺乏社交，内心渴望被强势掌控与探索，曾多次借口调味品敲主角房门试探。'
    }
  ],

  // 🏨 亚朵APP
  deck_atour_app: [
    {
      id: 'atour_vip_tier',
      keys: ['积分', '等级', '会员', '黑金', '充值', '特权', '合约', '免查房'],
      title: '亚朵APP黑金至尊特权与免查房协议',
      category: 'rule',
      content: '玩家账号拥有全网最高黑金至尊权限，已充值海量信用点。在亚朵酒店合作体系中享有专属直连服务、免前台登记、免客房排查、以及随时调用42名女大学生名录的至高隐私保护协议。'
    },
    {
      id: 'atour_room_card',
      keys: ['房卡', '门禁', '房门', '感应', '暗号', '门铃'],
      title: '高定商务行政套房与房门暗号',
      category: 'location',
      content: '亚朵行政楼层顶端的高定套房，全景落地窗眺望城市繁华夜景，配备独立深泡浴缸与高保密隔音棉墙。女大学生抵达后只需出示APP预约码并按三长一短敲门暗号进入。'
    }
  ],

  // 👣 黑丝女儿
  deck_heisi_daughter: [
    {
      id: 'heisi_ballet',
      keys: ['芭蕾', '舞鞋', '足弓', '脚踝', '跳舞', '练功', '旧伤', '茧子'],
      title: '陈佳慧的芭蕾舞练习与足部旧伤',
      category: 'character',
      content: '佳慧从小被要求练习古典芭蕾与现代舞，足弓弧线极高挺秀丽，脚趾与脚踝处带着长期紧绷练功留下的细微旧伤。这使她对足部推拿和接触极为敏感，既想在父亲面前掩饰脆弱，又渴望得到温柔的抚慰。'
    },
    {
      id: 'heisi_wardrobe',
      keys: ['衣柜', '连裤袜', '黑丝', '抽屉', '薄丝', '换袜', '丝袜'],
      title: '衣柜深处的私密连裤袜收纳盒',
      category: 'item',
      content: '少女卧室衣柜内侧的专属透明亚克力抽屉，整齐码放着从超薄透肉油亮黑丝到加厚压力袜的各种款式。这是佳慧步入青春期后瞒着父亲偷偷购买的成年女性装扮，带着禁忌的秘密感与少女体香。'
    }
  ],

  // 🌧️ 深夜求助的嫂子与侄女
  deck_sister_in_law_niece: [
    {
      id: 'sister_debt',
      keys: ['高利贷', '欠条', '哥哥', '跑路', '逼债', '失联', '催债'],
      title: '哥哥赌博跑路留下的高利贷欠条',
      category: 'rule',
      content: '主角哥哥因境外赌博欠下数百万高利贷后秘密失联，债主频繁上门泼油漆威胁。嫂子林晚晴走投无路，只能在暴雨深夜带着女儿周若宁冒雨投奔小叔子，身无分文且随时面临被追债的巨大恐慌。'
    },
    {
      id: 'sister_lin_secret',
      keys: ['林晚晴', '嫂子', '首饰', '旧照片', '旗袍', '丰满', '献身'],
      title: '嫂子林晚晴的成熟风韵与破釜沉舟之心',
      category: 'character',
      content: '36岁全职人妻，虽育有一女但保养得极为柔润年轻，胸腰臀曲线极尽丰盈熟女风韵。平日性格温婉知性，为了保住女儿周若宁的安全与学业，她内心深处早已做好了小叔子提出任何非分要求都决不拒绝的牺牲准备。'
    },
    {
      id: 'niece_ruoning',
      keys: ['周若宁', '若宁', '侄女', '录取通知书', '高考', '雌小鬼', '嘴硬'],
      title: '侄女周若宁的嘴硬挑衅与心理依赖',
      category: 'character',
      content: '18岁刚高中毕业的青涩少女，随身背包里装着刚收到的大学录取通知书。平日嘴上刁蛮淘气、喜欢给叔叔使小绊子，但在这场家庭剧变中极度缺乏安全感，对叔叔的男子汉担当有强烈的依恋与偷偷试探。'
    }
  ],

  // 🌸 我的绝美coser萝莉妹妹
  deck_coser_sister: [
    {
      id: 'coser_wardrobe',
      keys: ['衣服', '洛丽塔', '换衣服', 'cos', '试衣', '假发', '裙摆'],
      title: '试衣镜前的私密换装契约',
      category: 'rule',
      content: '妹妹林知念在各大平台拥有数十万二次元粉丝，但她与哥哥立下过专属秘密契约：每换上一套新的Cos服或洛丽塔裙子，必须第一个走出来给哥哥单独检阅，并在哥哥面前转圈摆出专属动作。'
    }
  ],

  // 🎲 姐姐和俩闺蜜在客厅玩大冒险
  deck_sister_truth_or_dare: [
    {
      id: 'sister_game_rule',
      keys: ['大冒险', '真心话', '酒瓶', '转盘', '喝酒', '惩罚', '大冒险惩罚'],
      title: '客厅真心话大冒险的无底线惩罚规则',
      category: 'rule',
      content: '酒过三巡后三女一男在客厅地毯上定下的成人游戏契约：酒瓶转到谁，谁就必须毫无保留地回答真心话或执行大冒险指令，违者必须脱掉一件衣物或自罚喝下一大杯烈酒，现场任何人不得翻脸退出。'
    }
  ],

  // ❄️ 神崎夕月
  deck_yuzuki: [
    {
      id: 'yuzuki_fever',
      keys: ['发热', '37.1', '体温计', '量体温', '看护', '密闭', '房门'],
      title: '37.1℃微热午后的密闭房间看护',
      category: 'rule',
      content: '神崎夕月在学校是清冷高不可攀的学生会长，私下里却对哥哥有病态的占有欲。借着哥哥轻微发热的由头，反锁房门步步紧逼，用量体温的冰冷水银计与湿毛巾反复测试两人的伦理防线。'
    }
  ]
};

// ============================================================================
// 2. 世界书关键词动态检索器 (Keyword Matcher & Prompt Injector)
// ============================================================================

export function getDeckLorebook(deckId: string, customLore?: LoreEntry[]): LoreEntry[] {
  const defaultEntries = DEFAULT_LOREBOOKS[deckId] || [];
  const customEntries = Array.isArray(customLore) ? customLore : [];

  const entryMap = new Map<string, LoreEntry>();
  defaultEntries.forEach((e) => entryMap.set(e.id, { ...e }));
  customEntries.forEach((e) => entryMap.set(e.id, { ...e }));

  return Array.from(entryMap.values()).filter((e) => e.enabled !== false);
}

export function retrieveActiveLore(
  deckId: string,
  contextText: string,
  customLore?: LoreEntry[],
  maxEntries: number = 4
): { activeEntries: LoreEntry[]; formattedPrompt: string } {
  const lorebook = getDeckLorebook(deckId, customLore);
  if (lorebook.length === 0 || !contextText) {
    return { activeEntries: [], formattedPrompt: '' };
  }

  const cleanContext = contextText.toLowerCase();

  const scoredEntries = lorebook.map((entry) => {
    let score = 0;
    for (const key of entry.keys) {
      const cleanKey = key.trim().toLowerCase();
      if (!cleanKey) continue;

      if (cleanContext.includes(cleanKey)) {
        score += cleanKey.length >= 3 ? 2 : 1;
      }
    }
    return { entry, score };
  });

  const activeEntries = scoredEntries
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxEntries)
    .map((item) => item.entry);

  if (activeEntries.length === 0) {
    return { activeEntries: [], formattedPrompt: '' };
  }

  const promptLines = [
    `\n# 🎯 当前场景触碰到的世界背景与角色隐秘设定 (Lorebook Knowledge):`,
    ...activeEntries.map((e) => `- 【${e.title}】: ${e.content}`)
  ];

  return {
    activeEntries,
    formattedPrompt: promptLines.join('\n')
  };
}

// ============================================================================
// 3. 渐进式历史剧情沉淀池压缩器 (Progressive Milestone Memory)
// ============================================================================

export function compactMilestoneMemory(
  history: Turn[],
  recentWindowSize: number = 6
): string {
  if (!history || history.length <= recentWindowSize) {
    return '';
  }

  const precedingTurns = history.slice(0, -recentWindowSize);
  const facts: string[] = [];

  precedingTurns.forEach((turn, idx) => {
    if (!turn.isUser) {
      if (turn.memory && Array.isArray(turn.memory) && turn.memory.length > 0) {
        turn.memory.forEach((fact) => {
          const clean = fact.replace(/^[•\-\*\d\.\s]+/, '').trim();
          if (clean && !facts.includes(clean)) {
            facts.push(`• [第${idx + 1}幕沉淀] ${clean}`);
          }
        });
      } else if (turn.location && turn.story) {
        const firstSentence = turn.story.split(/[\n。！？]/)[0]?.trim();
        if (firstSentence && firstSentence.length >= 10 && firstSentence.length <= 60) {
          facts.push(`• [第${idx + 1}幕剧情] ${firstSentence}`);
        }
      }
    }
  });

  if (facts.length === 0) {
    return '';
  }

  const cappedFacts = facts.slice(-8);

  const promptBlock = [
    `\n# 📜 剧情前期既成事实与不可逆转的核心进展 (Preceding Milestones & Established Facts):`,
    `（以下为较早轮次中已发生的确凿事实与契约承诺，必须严格保持记忆自洽与前后呼应）：`,
    ...cappedFacts
  ].join('\n');

  return promptBlock;
}
