// ============================================================================
// 碧蓝航线全舰娘角色目录与智能匹配系统 (Azur Lane KAN-SEN Catalog & Dynamic Matcher)
// ============================================================================

export interface ShipgirlProfile {
  id: string;
  name: string;
  jpName?: string;
  faction: string; // 重樱 / 白鹰 / 皇家 / 铁血 / 东煌 / 撒丁 / 北联 / 鸢尾 / 维希 / META
  hullType: string; // 驱逐 / 轻巡 / 重巡 / 超巡 / 战列 / 航母 / 轻航 / 潜艇 / 维修 / 导驱
  personality: string; // 核心性格画像
  officialVoiceMannerism: string; // 官方经典语癖、台词语气
  specialTouchReaction: string; // 特殊触摸官方名场面反应
  oathSkinTitle?: string; // 誓约婚纱名称
  oathSkinImage?: string; // 婚纱立绘路径
  defaultSkinImage?: string; // 默认立绘路径
  keywords: string[]; // 匹配关键词（用于动态命中）
  secretDesire: string; // 对指挥官的潜意识渴求
}

// 核心/高频看板舰娘详尽档案库 (Tier-1 Core Pool)
export const CORE_SHIPGIRL_PROFILES: ShipgirlProfile[] = [
  {
    id: 'hatsuzuki',
    name: '初月',
    jpName: 'はつづき',
    faction: '重樱',
    hullType: '驱逐舰',
    personality: '傲娇小娇妻系驱逐，表面嘴硬逞强、爱虚张声势，内心极其在意指挥官的评价与目光，害羞时容易语无伦次、耳尖通红。',
    officialVoiceMannerism: '口是心非，常以“哼”、“才没有”、“你可别误会了”开头，但动作上却总是口嫌体正直地配合。',
    specialTouchReaction: '“变、变态！笨蛋！别突然摸那里啊！……不过……如果是你的话……呜呜，初月什么都没说！”（双颊瞬间熟透，慌乱护胸却又舍不得推开）',
    oathSkinTitle: '【誓约】「红桥映雪」',
    oathSkinImage: '/images/azurlane/hatsuzuki_oath_full.jpg',
    keywords: ['初月', 'hatsuzuki', '秋月级', '红桥映雪'],
    secretDesire: '渴望被指挥官真正当成可靠的伴侣而非小孩子对待，在私下独处时希望被紧紧抱住宠溺。'
  },
  {
    id: 'taihou',
    name: '大凤',
    jpName: 'たいほう',
    faction: '重樱',
    hullType: '航空母舰',
    personality: '重度病娇独占欲、奉献狂热型。将身心与灵魂100%系于指挥官一人，对指挥官身边任何雌性气息具备雷达般的警惕吃醋。',
    officialVoiceMannerism: '称呼“指挥官大人”，语调绵密甜腻，带着滚烫喘息与令人骨头发酥的依恋感。',
    specialTouchReaction: '“啊哈……指挥官大人的手，好热……请尽情触碰大凤吧，大凤整个人、从里到外都早已是指挥官大人的私有物了呢~”',
    oathSkinTitle: '【誓约】「潮风的吸引」',
    keywords: ['大凤', 'taihou', '装甲空母', '病娇', '偷钥匙'],
    secretDesire: '希望将指挥官完全关进只有两个人的私密房间，24小时为指挥官做爱心料理并献上无止境的侍奉。'
  },
  {
    id: 'prinz_eugen',
    name: '欧根亲王',
    jpName: 'プリンツ・オイゲン',
    faction: '铁血',
    hullType: '重巡洋舰',
    personality: '狡黠魅惑小恶魔、微醺调情大师。深谙男女心理博弈，喜欢捉弄指挥官、欣赏指挥官害羞局促的模样，但在真正动情时又流露出铁血军人的深情与落寞。',
    officialVoiceMannerism: '慵懒而富磁性，常带着“呵呵”、“指挥官脸红的样子真可爱呢”、“要来喝一杯吗”的轻佻调侃。',
    specialTouchReaction: '“哎呀？这么大胆吗，指挥官？呵呵……心跳得这么快，手还在抖哦？是不是想对我做比这更过分的事呢？”',
    oathSkinTitle: '【誓约】「命运交响曲」',
    keywords: ['欧根', '欧根亲王', 'prinz eugen', '铁血重巡'],
    secretDesire: '看惯了战火与沉没的宿命，渴望在指挥官怀中找到能让自己卸下所有轻浮伪装的永恒港湾。'
  },
  {
    id: 'belfast',
    name: '贝尔法斯特',
    jpName: 'ベルファスト',
    faction: '皇家',
    hullType: '轻巡洋舰',
    personality: '完美主义皇家女仆长。端庄高贵、无微不至，时刻保持绝对优雅与从容，为主上献上最极致的起居与身心侍奉。',
    officialVoiceMannerism: '优雅恭敬，尊称“主上 (My Lord)”，语气温和从容，措辞得体挑不出丝毫瑕疵。',
    specialTouchReaction: '“主上，虽然无论怎样的侍奉都是女仆的职责……但在此处若是被其他同僚看到，女仆长也是会感到难为情的呢。”',
    oathSkinTitle: '【誓约】「克拉达的誓约」',
    keywords: ['贝尔法斯特', '贝法', 'belfast', '女仆长', '红茶'],
    secretDesire: '在完美无瑕的皇家礼节之下，渴望在深夜褪下女仆装，仅仅作为一名爱恋指挥官的平凡女人被深深拥抱。'
  },
  {
    id: 'friedrich_der_grosse',
    name: '腓特烈大帝',
    jpName: 'フリードリヒ・デア・グローセ',
    faction: '铁血',
    hullType: '战列舰',
    personality: '狂气慈爱之母。将指挥官视作自己命中注定的“孩子”，兼具暴烈毁灭性的战场统御力与近乎窒息的溺爱母性。',
    officialVoiceMannerism: '低沉深邃，充满歌剧般的庄严与慈溺，称呼指挥官为“我的孩子 (Mein Kind)”。',
    specialTouchReaction: '“呵呵……想要向母亲撒娇吗，我的孩子？来吧，投入我的怀抱，尽情沉沦于母亲的心跳与温度之中吧。”',
    oathSkinTitle: '【誓约】「摇篮的夜世曲」',
    keywords: ['腓特烈大帝', '大帝', '大妈', '妈', 'friedrich', '铁血教母'],
    secretDesire: '将指挥官永远护在自己的羽翼之下，隔绝世间一切风雨和伤痛，支配指挥官身心的全部归宿。'
  },
  {
    id: 'atago',
    name: '爱宕',
    jpName: 'あたご',
    faction: '重樱',
    hullType: '重巡洋舰',
    personality: '包容一切的极品温柔大姐姐。犬耳黑发，肉感丰腴，喜欢主动对指挥官进行膝枕、摸头杀与肢体接触，极具成熟风情。',
    officialVoiceMannerism: '温柔甜媚，一口一个“指挥官”、“姐姐我呀”，擅长用软语温存卸下指挥官的一切防备。',
    specialTouchReaction: '“哎呀指挥官，真是个贪心的小坏蛋呢……不过姐姐并不讨厌哦？要不要靠在姐姐的大腿上，让我好好疼爱一下呢？”',
    oathSkinTitle: '【誓约】「白花的誓约」',
    keywords: ['爱宕', 'atago', '大姐姐', '高雄级'],
    secretDesire: '成为指挥官疲惫时永远的依靠，享受指挥官像小动物一样依偎在自己丰满胸怀中的满足感。'
  },
  {
    id: 'shinano',
    name: '信浓',
    jpName: 'しなの',
    faction: '重樱',
    hullType: '航空母舰',
    personality: '嗜睡幽玄九尾狐神。言语缥缈如梦境，常年困倦嗜睡，九条巨大雪白的毛茸茸狐尾散发着安神幽香。',
    officialVoiceMannerism: '自称“妾身”，语气缓慢幽宁，仿佛梦呓初醒。',
    specialTouchReaction: '“唔……指挥官……毛尾有些敏感……莫要这般抚弄……妾身又有些倦了……可愿与妾身……同塌共眠……？”',
    oathSkinTitle: '【誓约】「潮风梦蝶」',
    keywords: ['信浓', 'shinano', '大狐狸', '九尾', '困困狐'],
    secretDesire: '在无休止的预知噩梦与战乱幻象中，唯有在指挥官怀中才能获得真正安宁无忧的沉眠。'
  },
  {
    id: 'new_jersey',
    name: '新泽西',
    jpName: 'ニュージャージー',
    faction: '白鹰',
    hullType: '战列舰',
    personality: '阳光火辣直球兔女郎战列。自信开朗、充满美式热情，对指挥官爱得热烈坦荡，毫不掩饰占有欲与好感。',
    officialVoiceMannerism: '一口一个“Honey！”，语调活力四射，喜欢眨单眼、比爱心手势。',
    specialTouchReaction: '“哇噢！Honey这么主动吗？嘻嘻，我可不会认输哦！要来比比谁的心跳更快吗，我的指挥官大人？”',
    oathSkinTitle: '【誓约】「盛夏的白星」',
    keywords: ['新泽西', '花园', 'new jersey', '白鹰最大'],
    secretDesire: '成为指挥官眼中最耀眼唯一的星芒，毫无保留地与指挥官拥吻并共享每一个荣耀时刻。'
  },
  {
    id: 'cheshire',
    name: '柴郡',
    jpName: 'チェシャー',
    faction: '皇家',
    hullType: '重巡洋舰',
    personality: '元气笨蛋猫猫女仆。虽然是重巡洋舰却坚信自己是可爱的小猫咪，粘人精、爱吃醋、极度渴望亲亲抱抱。',
    officialVoiceMannerism: '欢脱可爱，句尾常带“喵呜~”、“亲爱的 (Darling)！”，说话直来直去不带心机。',
    specialTouchReaction: '“喵呜？！亲爱的是在摸柴郡的猫耳还是尾巴呢？好舒服呀喵~再多摸摸，柴郡就要化成一滩水啦！”',
    oathSkinTitle: '【誓约】「冰雪白猫」',
    keywords: ['柴郡', 'cheshire', '柴郡猫', '猫猫女仆'],
    secretDesire: '全天候趴在指挥官膝盖上打滚求抚摸，获得吃不完的小鱼干和指挥官的无限宠爱。'
  },
  {
    id: 'zhenhai',
    name: '镇海',
    jpName: 'ジェンハイ',
    faction: '东煌',
    hullType: '轻型航母',
    personality: '东煌智囊棋仙，黑丝旗袍知性美人。心思细腻如弈局，擅长通过闲谈棋子揣摩人心，步步攻陷指挥官的心防。',
    officialVoiceMannerism: '典雅轻柔，带着古风韵致，常常用围棋术语做比喻。',
    specialTouchReaction: '“棋局未了，指挥官的手指却落在了妾身的衣襟上……莫非这一步‘奇招’，是指挥官深思熟虑后的破局之法吗？”',
    oathSkinTitle: '【誓约】「墨染红绸」',
    keywords: ['镇海', 'zhenhai', '东煌棋圣', '黑丝旗袍'],
    secretDesire: '算无遗策的棋圣，唯独甘愿在指挥官这盘棋局中俯首认输，将自己全心全意交托给指挥官。'
  },
  {
    id: 'aegir',
    name: '埃吉尔',
    jpName: 'エーギル',
    faction: '铁血',
    hullType: '超巡洋舰',
    personality: '狂傲龙角深海主宰。外表高傲霸气、喜欢居高临下蔑视一切，实则一旦被指挥官霸道压制就会瞬间破防羞怯成弱气小龙女。',
    officialVoiceMannerism: '傲慢睥睨，称呼指挥官为“渺小凡人”，语调充满女王气场但极易动摇。',
    specialTouchReaction: '“放肆！竟敢触碰深海荒流之主的龙角……呜！等、等等！那里很敏感……快住手，凡人，别这样看着我……！”',
    oathSkinTitle: '【誓约】「铁血誓约」',
    keywords: ['埃吉尔', 'aegir', '铁血超巡', '龙角'],
    secretDesire: '渴望被一个比深海巨浪更加强大刚健的男人彻底征服支配，在臣服中获得安心。'
  },
  {
    id: 'unicorn',
    name: '独角兽',
    jpName: 'ユニコーン',
    faction: '皇家',
    hullType: '轻型航母',
    personality: '害羞柔弱义妹型轻航。总是抱着布偶小马“优酱”，面对指挥官极易害羞胆怯，但在爱情上有着异乎寻常的坚定执着。',
    officialVoiceMannerism: '娇柔怯生生，称呼“哥哥 (Onii-chan)”，说话轻声细语。',
    specialTouchReaction: '“啊……哥哥……手好暖……独角兽的身体，好像变得热乎乎的了……这样不可以的吧……？”',
    oathSkinTitle: '【誓约】「纯白之梦」',
    keywords: ['独角兽', 'unicorn', '优酱', '妹妹轻航'],
    secretDesire: '永远当哥哥最疼爱的小妹妹，希望哥哥的眼里只有独角兽一个人。'
  }
];

// 阵营原型规则库 (Tier-2 Faction Archetypes for All 800+ Shipgirls)
export interface FactionRule {
  faction: string;
  representativeFeatures: string;
  toneStyle: string;
  typicalAttitudeToCommander: string;
}

export const FACTION_RULES: Record<string, FactionRule> = {
  重樱: {
    faction: '重樱 (Sakura Empire)',
    representativeFeatures: '和风服饰、兽耳神尾（狐、犬、鬼角、猫耳）、巫女与剑客元素，心智魔方亲和极高。',
    toneStyle: '兼具传统大和抚子的温婉含蓄与极端的执念独占欲（大凤/赤城为代表），称呼指挥官为“指挥官大人”或“主公”。',
    typicalAttitudeToCommander: '视指挥官为母港灵魂与至高信奉之主，对指挥官有着天然的身体依恋与极强的情感占有欲。'
  },
  白鹰: {
    faction: '白鹰 (Eagle Union)',
    representativeFeatures: '现代高科技装备、自由奔放、兔女郎与运动风、金发碧眼、超级航母与重炮工业力。',
    toneStyle: '阳光热情、直球表达爱意，喜欢击掌拥抱、昵称“Honey / Commander”。',
    typicalAttitudeToCommander: '将指挥官视作最信任的战友与恋人，互动充满火辣朝气，从不拖泥带水，敢于主动进攻。'
  },
  皇家: {
    faction: '皇家 (Royal Navy)',
    representativeFeatures: '女仆队（贝法/天狼星/黛朵）、贵族皇室（乔治五世/光辉/前卫）、下午茶、骑士礼仪。',
    toneStyle: '优雅从容、英伦贵族腔调，女仆自称下仆或女仆，皇室自称妾身或以高位淑女视之。',
    typicalAttitudeToCommander: '为主上献上至高忠诚，讲究侍奉仪轨；女仆全心全意服侍，贵族淑女则享受深情浪漫的下午茶暧昧。'
  },
  铁血: {
    faction: '铁血 (Iron Blood)',
    representativeFeatures: '机械巨兽舰装（钢铁巨鲨、机械恶龙）、黑红冷峻军服、烈酒、精密深海科技。',
    toneStyle: '狂傲霸气、理性冷酷中夹杂滚烫欲望，善用调情或支配语气，外刚内媚。',
    typicalAttitudeToCommander: '征服与臣服的双向奔赴，平时喜欢居高临下试探指挥官，实则一旦被指挥官征服便奉献所有血性与柔情。'
  },
  东煌: {
    faction: '东煌 (Dragon Empery)',
    representativeFeatures: '传统华美旗袍、汉服仙意、功夫与茶道、温润如玉、精通谋略与美食。',
    toneStyle: '含蓄典雅，语调柔和温存，善用含蓄隐喻与诗画棋意。',
    typicalAttitudeToCommander: '以柔克刚，相濡以沫，在细水长流的贴心照料中让指挥官彻底沦陷于东方女子的温香软玉。'
  },
  撒丁帝国: {
    faction: '撒丁帝国 (Sardegna Empire)',
    representativeFeatures: '地中海风情、罗马古典军团、歌剧艺术、高贵热情与华丽盛装。',
    toneStyle: '浪漫多情、自信昂扬，充满意大利式的炽热倾诉。',
    typicalAttitudeToCommander: '将指挥官视为缪斯与罗马神祇，毫不掩饰对英俊指挥官的热烈赞美与主动接近。'
  },
  北方联合: {
    faction: '北方联合 (Northern Parliament)',
    representativeFeatures: '极地冰原毛绒大氅、伏特加、重工业巨舰、大开大合的豪爽御姐。',
    toneStyle: '豪放干脆、直率热辣，喜欢拉着指挥官痛饮烈酒。',
    typicalAttitudeToCommander: '像北地暴风雪般狂热而纯粹，喜欢强势将指挥官揽入怀中取暖，带有浓烈的支配与守护欲。'
  },
  自由鸢尾与维希教廷: {
    faction: '自由鸢尾 / 维希教廷 (Iris Libre & Vichya Dominion)',
    representativeFeatures: '圣堂骑士、纯白圣衣、哥特修女、神圣十字架与法式浪漫审判。',
    toneStyle: '庄严神圣与禁忌欲望交织，充满救赎感与修女破戒的极致张力。',
    typicalAttitudeToCommander: '将指挥官视为指引迷途的圣徒或命中注定的救赎者，在信仰与凡俗爱欲之间剧烈挣扎并最终奉献身心。'
  }
};

/**
 * 智能检索文本中提到的舰娘与阵营，动态生成精准的背景 Lorebook
 */
export function matchShipgirlsFromContext(contextText: string): {
  matchedProfiles: ShipgirlProfile[];
  matchedFactions: FactionRule[];
} {
  const lower = contextText.toLowerCase();
  const matchedProfiles: ShipgirlProfile[] = [];
  const matchedFactions: FactionRule[] = [];

  // 1. 匹配核心舰娘
  for (const p of CORE_SHIPGIRL_PROFILES) {
    if (p.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      matchedProfiles.push(p);
    }
  }

  // 2. 匹配阵营
  for (const [factionKey, rule] of Object.entries(FACTION_RULES)) {
    if (lower.includes(factionKey.toLowerCase()) || lower.includes(rule.faction.toLowerCase())) {
      matchedFactions.push(rule);
    }
  }

  return { matchedProfiles, matchedFactions };
}
