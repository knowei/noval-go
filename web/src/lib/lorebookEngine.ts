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
  ],

  // 😈 ❤帮兄弟喂养她的新婚魅魔妻子❤
  deck_succubus_wife: [
    {
      id: 'succubus_cup',
      keys: ['飞机杯', '采精', '大强', '洗手间', '备用钥匙', '杯子', '交代'],
      title: '大强留下的专用飞机杯与采精规矩',
      category: 'item',
      content: '好兄弟大强远赴海上油田封闭出差3个月，临走前在洗手间镜柜下留了一个未开封的高级硅胶飞机杯。大强嘱咐你每次去卫生间采精后倒进瓷碗端给莉莉饮用，用冰冷的硅胶隔绝肉体直接接触，作为防范出轨的第一道安全防线。'
    },
    {
      id: 'succubus_hands',
      keys: ['用手', '手交', '手帮我', '帮我弄', '手掌', '嫂子用手', '握住'],
      title: '大强交代的第二许可：拜托嫂子亲手排精',
      category: 'rule',
      content: '大强在电话里曾尴尬地补充叮嘱：如果兄弟实在用不惯假硅胶飞机杯，也可以客气地请嫂子莉莉用柔嫩的双手帮忙套弄排精。这一句无心的退让，成为了撕开两人叔嫂伦理与私密肢体接触的致命缺口。'
    },
    {
      id: 'succubus_feeding_need',
      keys: ['精气', '喂养', '精液', '发热', '口渴', '摄入', '空虚', '体温', '饿'],
      title: '新婚魅魔特异体质与每日精气摄入本能',
      category: 'rule',
      content: '莉莉是血统纯正的魅魔人妻，每天必须摄入新鲜浓郁的男性精气来维持肉体机能。若超过24小时未摄入，她的体温会急剧上升至滚烫发情状态，双腿发软多汁，理智逐渐被本能撕碎，甚至会不顾一切地主动纠缠身边的健康男性。'
    },
    {
      id: 'succubus_h_breast',
      keys: ['巨乳', '胸', 'H罩杯', '工字背心', '激凸', '乳头', '白背心', '白发'],
      title: '莉莉的H罩杯绝美肉体与居家工字背心',
      category: 'character',
      content: '20岁新婚少妇，拥有一头及腰的丝滑纯白长发与梦幻紫眸。水滴型H罩杯饱满浑圆、深粉色大乳晕与挺拔肉粒。在家习惯穿轻薄微透的白色工字背心，随着呼吸剧烈颤动，两颗激凸清晰可见，散发着诱人堕落的魅魔奶香。'
    },
    {
      id: 'succubus_outdoor',
      keys: ['户外', '公园', '放置', '车上', '海边', '露出', '泳装'],
      title: '满好感度解锁的户外放置与极限羞耻玩法',
      category: 'secret',
      content: '莉莉虽然表面害羞保守，但骨子里深埋着魅魔一族对极度刺激的潜意识渴望。当好感度与堕落度突破临界后，她会顺从地跟随你前往深夜无人公园、海边沙滩或私家车后排，在随时可能被路人撞破的恐慌与快感中放浪承欢。'
    }
  ],

  // 💖 完美少女の救赎/堕落计划
  deck_perfect_girl_plan: [
    {
      id: 'perfect_tear_report',
      keys: ['成绩单', '第二', '考试', '年级第二', '风月高中', '学生会', '第二名'],
      title: '江怀月被揉皱的年级第二名期末成绩单',
      category: 'item',
      content: '那张被泪水湿透、死死攥在掌心的重点高中成绩单。原本蝉联三年年级第一的高冷学霸女神，在期末考试中以两分之差跌落至第二名，成为击垮她维持多年完美人设与承受家庭压力的最后一根稻草。'
    },
    {
      id: 'perfect_sugar_milktea',
      keys: ['全糖', '奶茶', '红柚', '笔记本', '涂鸦', '甜品', '热奶茶'],
      title: '偷偷珍藏的全糖奶茶与叛逆涂鸦日记',
      category: 'item',
      content: '为了迎合父母严格的形体与自律要求，她从未当众碰过一口垃圾食品。但私底下书包最内层夹层里，却藏着一杯常温全糖奶茶的消费小票，以及画满颓废反叛摇滚涂鸦的私密笔记本，是她唯一的宣泄窗口。'
    },
    {
      id: 'perfect_family_pressure',
      keys: ['父母', '家里', '期望', '书香门第', '有条件', '听话', '完美', '枷锁'],
      title: '书香门第家庭窒息的“有条件的爱”',
      category: 'rule',
      content: '江怀月的父母皆为知名大学教授，奉行严苛冰冷的功利主义教育。只要她考第一就是骄傲，一旦有任何微小失误就会换来无休止的冷暴力与失望叹息，让她从小患上严重的被抛弃恐惧症。'
    },
    {
      id: 'perfect_dual_route',
      keys: ['救赎', '堕落', '纯爱', '调教', '依赖', '崩溃', '掌控'],
      title: '救赎与堕落的双轨命运分支律',
      category: 'rule',
      content: '【纯爱救赎】：给予毫无保留的关怀与安全感，帮她打破第一名执念，换来她一生一世的忠贞依恋；【诱导堕落】：逐步引诱她放纵叛逆欲，撕碎纯洁自尊，将平日不可一世的校花学霸改造成只对你摇尾乞怜的精神玩偶。'
    }
  ],

  // 🛌 爸爸我下面好痒帮我磨一磨吧
  deck_daughter_morning_wood: [
    {
      id: 'daughter_strawberry_pants',
      keys: ['草莓', '睡裤', '止痒', '痒', '磨一磨', '内裤', '蹭', '撅着屁股'],
      title: '陈小涵的草莓纯棉睡裤与天真止痒举动',
      category: 'item',
      content: '16岁独生女儿陈小涵最喜欢的浅粉色草莓印花睡裤，纯棉材质极其轻薄柔软。清晨隔着这层薄布，将双腿间娇嫩的花径紧紧压在父亲高耸的硬肉棒上，前后扭动磨蹭止痒，摩擦产生的温热体香与水渍极度刺激。'
    },
    {
      id: 'daughter_kitchen_mom',
      keys: ['妈妈', '母亲', '洗漱', '厨房', '水声', '做饭', '脚步声', '开水'],
      title: '近在咫尺的厨房水声与被窝偷情刺激',
      category: 'location',
      content: '主卧大门半掩，厨房仅隔着一条三米长的走廊。母亲正在水槽前洗菜烧水，抽油烟机与碗筷碰撞声清晰可闻。被窝里父女二人任何过激的声响与动作都有可能被突然推门的妻子当场撞破。'
    },
    {
      id: 'daughter_morning_erection',
      keys: ['晨勃', '鸡巴', '肉棒', '立起来', '硬棒子', '顶起', '被窝', '棒子'],
      title: '父亲一柱擎天的晨勃与假正经防线',
      category: 'rule',
      content: '成年男性早晨旺盛的生理晨勃，硬如铁棍顶起棉被。面对女儿天真无邪的主动磨蹭，父亲内心在伦理道德的羞愧申斥与生理本能的极乐快感间剧烈挣扎，身体不敢大幅动弹却又不由自主地挺腰迎合。'
    }
  ],

  // 🪙 十块肏一次的巨乳肥臀校花青梅
  deck_ten_yuan_childhood_friend: [
    {
      id: 'ten_yuan_contract',
      keys: ['十块', '十元', '纸币', '内射', '加钱', '契约', '零花钱', '交易'],
      title: '十块钱肏一次但严禁内射的荒唐规则',
      category: 'rule',
      content: '苏沐橙因网购月光后提出的荒唐同居契约：十块钱基础款只管插入肏一次，限时约5分钟，射完穿裤子，严禁内射；若想升级口交需五十元，乳交足交全套需一百元，内射必须额外大额加价。'
    },
    {
      id: 'ten_yuan_vacuum_tshirt',
      keys: ['不穿内衣', '真空', '大T恤', 'T恤', '激凸', '白虎', '走光', '没穿'],
      title: '合租公寓里从不穿内衣内裤的放浪习惯',
      category: 'character',
      content: '在外是白衬衫扣子系到领口的清纯校花，但在合租屋里因为从小对青梅竹马的极度信任，常年只套一件宽大的灰色男士短袖T恤。里面彻底真空，走动时H罩杯剧烈晃荡，坐下时饱满紧致无毛的白虎粉穴若隐若现。'
    },
    {
      id: 'ten_yuan_h_curves',
      keys: ['H罩杯', '巨乳', '肥臀', '蜜桃臀', '大白兔', '肉感', '苏沐橙'],
      title: '苏沐橙的H罩杯水滴巨乳与蜜桃肥臀',
      category: 'character',
      content: '18岁高三校花，165cm，三围96-58-94。腰肢极细，却长着一对罕见的天然水滴形H罩杯大巨乳，臀部极其肥厚饱满，走起路来微颤，后入时肉浪翻滚，是无数男生可望而不可即的梦中尤物。'
    },
    {
      id: 'ten_yuan_secret_diary',
      keys: ['账本', '日记', '暗恋', '偷偷', '花呗', '买单', '包月', '喜欢'],
      title: '藏在床头柜里的十元交易记账本与暗恋心事',
      category: 'secret',
      content: '苏沐橙床头夹缝里藏着一本粉色日记本。上面详细记录着每次交易的时间、姿势、时长和你给钱时的表情。其实她从初中起就深爱着你，借着缺钱十元一次的荒唐借口，只是为了让两人的关系名正言顺地更进一步。'
    }
  ],

  // 🌸 长得太清秀，被迫入住大学女生宿舍！
  deck_girls_dormitory: [
    {
      id: 'gd_male_disguise',
      keys: ['身份证', '女生宿舍', '302', '男扮女装', '男儿身', '鸡巴', '暴露', '清秀'],
      title: '比女生还美貌的男儿身秘密与暴露危机',
      category: 'rule',
      content: '主角容貌雌雄莫辨、清纯绝美，因父母从小按女孩抚养、身份证登记乌龙，被分入女寝302。虽外表清秀如仙女，却拥有发育完全的粗壮男根。一旦在宿舍被发现真实性别将面临身败名裂的极端危机。'
    },
    {
      id: 'gd_suxiaoke_pranks',
      keys: ['苏小可', '双丸子头', '恶作剧', '贴贴', '一起洗澡', '上厕所', 'B罩杯', '小可'],
      title: '元气腹黑少女苏小可的无防备肢体贴贴',
      category: 'character',
      content: '双丸子头元气少女，可爱调皮，喜好恶作剧。因自己是B罩杯平胸，对同样“纤瘦平胸”的主角天生亲近，经常毫无防备地拽着主角一起挤单人浴室洗澡、更衣、上厕所或被窝贴贴。'
    },
    {
      id: 'gd_lingyue_curves',
      keys: ['凌玥', '御姐', '黑丝', '包臀裙', '跆拳道', '大长腿', 'D罩杯', '大姐大'],
      title: '高冷黑丝大姐大凌玥的敏锐直觉与火辣身材',
      category: 'character',
      content: '大三冷艳御姐，身穿紧身黑丝包臀裙，D罩杯丰满大长腿，曾是高中不良大姐大且为跆拳道黑带。敏锐聪明、洞察力极强，表面冷漠话少，实际上总在用锐利的眼神打量主角过于害羞的异常举止。'
    },
    {
      id: 'gd_yezhirou_elegance',
      keys: ['叶芷柔', '芷柔', '校花', '黑长直', '温婉', '浴巾', '出浴', '书香门第'],
      title: '清纯校花叶芷柔的出浴水汽与端庄反差',
      category: 'character',
      content: '出身书香名门的大一校花，黑长直发、眉目清丽绝俗。性格恬静温柔、容易害羞脸红。洗完澡后仅裹着一条粉白浴巾在宿舍走动，湿漉漉的锁骨与诱人体香无意中对主角施加着极限折磨。'
    }
  ],

  // 🏢 我住的公寓竟全是人妻看我把她们全部肏成RBP
  deck_housewife_apartment: [
    {
      id: 'ha_master_privilege',
      keys: ['房卡', '管理员', '万能钥匙', '查房', '巡查', '月桂庄', '监控', '检修'],
      title: '月桂庄公寓管理员的万能房卡与绝对特权',
      category: 'rule',
      content: '主角身为月桂庄高级公寓新任管理员，拥有全楼12层所有房间的万能主卡、全覆盖高清监控权限与入户检修权。借助丈夫们出差或加班的便利，可以随时以安全排查为名敲开并刷开任何一扇人妻的房门。'
    },
    {
      id: 'ha_hancock_emptiness',
      keys: ['汉库克', '波雅', '1201', '顶楼', '女帝', '出差', '寂寞', '受孕', '播种'],
      title: '1201室高傲女帝汉库克的深夜空虚与受孕渴望',
      category: 'character',
      content: '顶层奢华复式女主人，美艳不可方物的高傲女帝。丈夫常年异界远征，每当深夜独卧2米大床时饱受彻骨空虚煎熬，内心深处极度渴望被强壮刚猛的雄性彻底征服并受孕播种。'
    },
    {
      id: 'ha_gu_bingyan_crack',
      keys: ['顾冰颜', '905', '女总裁', '商业联姻', '厌男', '电梯', '冰山', '裂痕'],
      title: '905室冰山总裁顾冰颜的防线裂纹',
      category: 'character',
      content: '跨国集团冰山女总裁，商业联姻的牺牲品，对丈夫与一切男性抱有冷漠厌恶。但在公寓电梯突发故障或幽闭独处施压时，其高贵自矜的外壳会产生剧烈裂痕，流露出窒息无助的依赖渴求。'
    },
    {
      id: 'ha_uzaki_temptation',
      keys: ['宇崎月', '501', '借盐', '邻家太太', '丰满', '乳沟', '眯眯眼', '脑补'],
      title: '501室丰满太太宇崎月的弯腰借盐诱惑',
      category: 'character',
      content: '温柔可人的邻家人妻，眯眯眼脑补狂魔。总幻想年轻力壮的管理员对自己心怀不轨，却又忍不住在借盐、送汤时特意换上低胸围裙，借着弯腰之机将深不见底的雪白乳沟展露无遗。'
    }
  ],

  // 🏫 全裸女校，只有你是特招
  deck_nude_girls_school: [
    {
      id: 'ngs_naked_rule',
      keys: ['全裸', '校规', '脱衣', '更衣室', '穹顶', '26℃', '一丝不挂', '圣伊甸'],
      title: '入校即全裸的铁律与恒温26℃单向透视穹顶',
      category: 'rule',
      content: '圣伊甸贵族女子学园不可抗拒的至高法则：踏入校门的一刻起，所有人必须卸去全部衣物，全身赤裸行动。校园穹顶单向透视防窥，常年维持26℃最舒适微风，三千名名门千金皆坦诚相见。'
    },
    {
      id: 'ngs_shared_bathroom',
      keys: ['女浴室', '女厕所', '公共浴室', '共用', '洗澡', '好奇', '围观', '卫生间'],
      title: '唯一的男生与全校共用公共女浴室',
      category: 'location',
      content: '学校未设男卫与男浴，身为全校唯一的特招男学生，主角洗漱排泄必须与成群裸体女生共用女卫与大浴池。在蒸腾的水雾中，无数双纯洁或好奇的美眸无时不刻不在注视着唯一的一具雄性肉体。'
    },
    {
      id: 'ngs_principal_cecilia',
      keys: ['塞西莉亚', '校长', '成熟', '35岁', '巡视', '实验体', '压迫感', '玩味'],
      title: '一丝不挂的女校长塞西莉亚的玩味巡视',
      category: 'character',
      content: '35岁圣伊甸绝对掌控者，自身亦严格恪守全裸校规，常以熟透美艳、丰腴高贵的裸体姿态在全校巡视。将主角破例招入并安排与女生同浴，带有一种居高临下观赏“独苗雄性小白鼠反应”的上位者恶趣味。'
    },
    {
      id: 'ngs_biology_teacher',
      keys: ['生理课', '解剖', '讲台', '教具', '实操', '金丝眼镜', '28岁', '抚摸'],
      title: '生理课女教师的活体解剖教具实操演示',
      category: 'character',
      content: '28岁戴金丝眼镜的知性巨乳御姐教师。在健康形体与生理教育课上，公然将主角叫上讲台当作实物教具，指导台下贵族女生轮流上台触摸感知男性的肌肉、体温与勃起生理变化。'
    }
  ],
  // 🎤 【图上互动】替父还债成为顶流偶像的妹妹
  deck_idol_sister_debt: [
    {
      id: 'idol_sister_persona',
      keys: ['江雪见', '江小雪', '小雪', '妹妹', '初恋', '白月光', '偶像'],
      title: '国民初恋江雪见的双面人格与极度依赖',
      category: 'character',
      content: '18岁当红顶流初恋偶像。台上清纯绝美，保镖和粉丝面前冷漠高傲；私底下却是个只喜欢穿男主洗旧宽大男士T恤、光脚爬进男主被窝搂着不放的软糯依赖狂，患有轻度分离焦虑与微病娇占有欲。'
    },
    {
      id: 'idol_sister_contract',
      keys: ['替父还债', '债务', '经纪公司', '违约金', '黑料', '助理'],
      title: '沉重债务枷锁与男主贴身助理身份',
      category: 'rule',
      content: '父亲破产欠下巨额高利贷失踪，江雪见为了替父还债不得不踏入娱乐圈。男主以私人助理兼保镖身份陪在她身边，只有在深夜狭小出租屋的被窝里，他们才能放下沉重枷锁，汲取彼此唯一的体温。'
    },
    {
      id: 'idol_sister_bed',
      keys: ['被窝', 'T恤', '洗头', '夜袭', '搂着', '睡觉', '床沿'],
      title: '深夜被窝里不为人知的私密共处',
      category: 'location',
      content: '无论白天在万人体育馆多么风光，深夜回到出租屋，小雪一定会悄悄推开男主卧室门钻进被窝。宽松T恤下不着寸缕的少女曲线、光洁粉嫩的脚丫与耳畔软糯的呼吸，是属于男主一人的绝密领地。'
    }
  ],

  // 👯‍♀️ 国民级顶流双胞胎偶像转校生是我的未婚妻？
  deck_twin_idols_fiancee: [
    {
      id: 'twins_sister_yaoyao',
      keys: ['夏梦瑶', '姐姐', 'Twilight', '黑长直', '清冷', '高贵'],
      title: 'Twilight姐姐夏梦瑶的清冷与隐秘独占欲',
      category: 'character',
      content: '17岁双子偶像姐姐，黑长直如瀑，气质端庄高贵。看似沉稳顾大局，实则对男主的占有欲比妹妹更强烈，课桌下经常用高跟鞋或黑丝足尖轻轻挑逗男主，极力掩饰吃妹妹醋的娇羞反差。'
    },
    {
      id: 'twins_sister_mili',
      keys: ['夏梦璃', '妹妹', '小恶魔', '双马尾', '腹黑', '老公'],
      title: 'Twilight妹妹夏梦璃的小恶魔贴蹭与大胆挑逗',
      category: 'character',
      content: '17岁双子偶像妹妹，元气灵动的双马尾少女。性格大胆狡黠、天真热烈，喜欢当着全班同学的面用饱满酥胸紧贴男主手臂，娇滴滴地喊老公，把修罗场直接引爆。'
    },
    {
      id: 'twins_contract',
      keys: ['未婚妻', '婚约', '转校', '订婚', '家族', '法定'],
      title: '两大豪门自幼订立的双生婚约特权',
      category: 'rule',
      content: '男主家族与夏家多年前订下誓约，双胞胎成年后将共同履行婚约。两姐妹以普通转校生身份入住男主隔壁并进入同班，在全校狂热追捧下展开争夺未婚夫宠爱的甜蜜博弈。'
    }
  ],

  // 🎹 兄弟的巨乳萝莉女友？是我的了
  deck_brother_loli_girlfriend: [
    {
      id: 'loli_secret_caught',
      keys: ['许晓娜', '自慰', '琴房', '把柄', '陈伟', '女友', '水手服'],
      title: '许晓娜琴房自我慰藉被撞破把柄',
      category: 'secret',
      content: '兄弟陈伟的极品校花女友，在偏僻废弃的隔音琴房撩起水手服自慰，被男主当场撞破并目睹全过程。极度害怕被陈伟知道并失去清纯声誉，成了她不得不对男主言听计从的致命死穴。'
    },
    {
      id: 'loli_body_features',
      keys: ['童颜', '巨乳', 'H罩杯', '敏感', '娇小', '肉感', '萝莉'],
      title: '152cm童颜与H罩杯反差极品敏感体质',
      category: 'character',
      content: '身高只有一米五二的娇小萝莉身材，却发育着夸张沉甸甸的H罩杯水滴雪乳。天生体质极度敏感多水，稍加爱抚或言语羞辱便浑身瘫软泛红、淫水泛滥，是极易被攻破调教的极品尤物。'
    },
    {
      id: 'loli_ntr_progression',
      keys: ['堕落', '背德', '陈伟', '主人', '屈服', '钢琴盖', '调教'],
      title: '背德感与支配欲交织的沦陷轨迹',
      category: 'rule',
      content: '在对不起男友陈伟的强烈道德自责中，许晓娜的肉体却被男主开发得越来越贪恋快感。在钢琴盖上、琴凳前一步步突破底线，最终完全沦为男主专属的肉感玩物。'
    }
  ],

  // 🐯 巨乳白虎妹妹每晚夜袭肥鲍迷奸
  deck_white_tiger_sister_night: [
    {
      id: 'white_tiger_persona',
      keys: ['林溪月', '妹妹', '校花', '白虎', '丹凤眼', '高冷', '黑长直'],
      title: '高冷校花妹妹林溪月的深夜双面目',
      category: 'character',
      content: '全校男生望而生畏的冰山校花，男主的同胞亲妹妹。白天在校对男主形同陌路，夜晚等全家熟睡后却化身贪恋男主体温与肉棒的痴女，掀被钻入被窝主动索求。'
    },
    {
      id: 'white_tiger_traits',
      keys: ['无毛', '白虎', '蜜穴', '粉嫩', '淫水', '喷水', '水滴巨乳'],
      title: '天生白虎粉嫩蜜缝与多汁敏感体征',
      category: 'item',
      content: '林溪月下体天生没有一丝杂毛，干净白嫩如初生婴儿，且极易动情淌水。夜袭时最爱跨坐男主腰间，用湿透的穴口只半含龟头前后摇摆研磨，享受失控高潮的喷水快感。'
    },
    {
      id: 'white_tiger_complicity',
      keys: ['装睡', '共犯', '默许', '夜袭', '被窝', '白丝', '足交'],
      title: '心照不宣的深夜被窝共犯契约',
      category: 'rule',
      content: '男主与妹妹之间从未说破的禁忌默契：男主假装熟睡，任由妹妹用白丝小脚套弄、甚至跨坐浅插自慰；妹妹以为男主不知道，放肆享受征服哥哥肉体的伦理刺激。'
    }
  ],

  // 👑 成绩至上主义学园：不得拒绝年级第一的任何要求
  deck_grade_first_demands: [
    {
      id: 'grade_first_privilege',
      keys: ['年级第一', '特权', '校规', '命令', '金卡', '学园', '满分'],
      title: '学园至尊铁律：年级第一的绝对支配王权',
      category: 'rule',
      content: '全封闭极道私立学园唯一最高校规：年级第一拥有支配校内一切师生的绝对特权。凡被年级第一下达的合理或不合理指令，包括脱衣、跪地、口交、侍寝，受令者均不得以任何理由拒绝违抗。'
    },
    {
      id: 'grade_first_fujing',
      keys: ['苏倾雪', '风纪委员', '校花', '名媛', '短裙', '受罚'],
      title: '高傲名媛风纪委员长苏倾雪的屈辱服从',
      category: 'character',
      content: '17岁全校第一名媛校花，平日铁面无私纠察风纪。在男主满分登顶后被迫在VIP研修室内撩起制服短裙承受特权惩戒，双眼含泪、自尊寸寸崩裂却必须听命承欢。'
    },
    {
      id: 'grade_first_teacher',
      keys: ['沈曼云', '教导主任', '旗袍', '黑丝', '成熟', '女教师'],
      title: '高开叉旗袍教导主任沈曼云的私密课业',
      category: 'character',
      content: '29岁成熟妖娆的教导主任，常年身着修身开叉黑丝旗袍，E罩杯丰满摇曳。为了保全学园升学声誉，不得不亲自上门向男主汇报“特殊课业”，在男主霸道审视下逐渐沉沦于被支配的快感。'
    }
  ],

  // 🕯️ 神秘复苏（是人亦是鬼）
  deck_mysterious_recovery_ghost: [
    {
      id: 'ghost_rules',
      keys: ['厉鬼', '杀人规律', '鬼无法杀死', '灵异', '驭鬼者', '鬼域'],
      title: '神秘复苏世界观三大绝望铁律',
      category: 'rule',
      content: '1. 鬼是无法被杀死的；2. 能对付鬼的只有鬼；3. 洞察厉鬼的杀人规律才能在绝境中找到生路。驭鬼者每一次使用鬼的能力，都在加速自身被体内厉鬼复苏侵蚀直至死亡。'
    },
    {
      id: 'ghost_knock',
      keys: ['敲门鬼', '敲门声', '第七中学', '尸臭', '黑暗', '阴霾'],
      title: '第七中学敲门鬼灵异事件与鬼域蔓延',
      category: 'secret',
      content: '身着黑色长衫、浑身干枯腐烂的老人厉鬼。伴随“咚咚咚”三声缓慢沉重的敲门声，听到声音的人将被标记诅咒，整个第七中学已被死寂暗红的浓郁鬼域彻底封锁断绝外界通信。'
    },
    {
      id: 'ghost_candle',
      keys: ['鬼烛', '红烛', '点燃', '烛光', '安全', '吸引', '燃烧'],
      title: '保命战备奇物：暗红鬼烛的庇护与代价',
      category: 'item',
      content: '总部研发的绝密灵异物资。只要红色烛火还在燃烧，鬼域内的厉鬼就绝对无法伤害烛光范围内的人，但同时散发的阴气会吸引附近所有游荡的厉鬼聚集，烛火燃烧速度与厉鬼威胁程度成正比。'
    }
  ],

  // 🍉 嘴对着喂你的巨乳肥臀姐姐
  deck_mouth_feed_sister: [
    {
      id: 'mouth_feed_linxia',
      keys: ['林夏', '姐姐', '巨乳', 'H罩杯', '肥臀', '呆毛', '废柴'],
      title: '24岁废柴同居巨乳姐姐林夏的外貌与性格',
      category: 'character',
      content: '自由职业插画师，生着夸张H罩杯巨乳与蜜桃丰满肥臀，头顶常年竖着一根压不平的呆毛。极度慵懒、爱撒娇、无戒备心，把使唤照顾弟弟当成天经地义的日常。'
    },
    {
      id: 'mouth_feed_vacuum',
      keys: ['不穿内裤', '真空', '露肩衬衫', '蜜桃臀', '白虎', '走光'],
      title: '在家绝对真空不穿内裤与极致走光诱惑',
      category: 'item',
      content: '林夏一回到家必定第一时间脱掉内裤，下半身彻底真空，仅套一件男主的宽大露肩白衬衫在客厅晃悠。天生无毛粉嫩蜜穴与雪白肥臀在沙发走动时暴露无遗，毫无防备。'
    },
    {
      id: 'mouth_feed_action_rule',
      keys: ['嘴对嘴', '喂食', '西瓜', '嚼碎', '渡饭', '树袋熊', '夹腰'],
      title: '嘴对嘴口渡喂饭与树袋熊式缠腰考验',
      category: 'rule',
      content: '林夏懒得端碗时，会把食物（冰西瓜心、布丁、面条）含在嘴里，嘴对嘴直接渡进男主嘴里，甚至用肉感丰满的大腿像树袋熊般死死夹住男主的腰磨蹭撒娇，用肉体全方位考验弟弟的定力。'
    }
  ],
  deck_xiuxian_world: [
    {
      id: 'xiuxian_canglan_realms',
      keys: ['境界', '突破', '修为', '炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫', '飞升'],
      title: '苍澜界修仙九大境界法则',
      category: 'rule',
      content: '修仙境界分为九阶：炼气期、筑基期、金丹期、元婴期、化神期、炼虚期、合体期、大乘期、渡劫期、飞升成仙。境界壁垒森严，每跨越一重大境界寿命与神识皆数倍暴增，低境界在绝对灵压下举步维艰。'
    },
    {
      id: 'xiuxian_sects_neutral',
      keys: ['昆仑', '天剑门', '天符宗', '天机阁', '万宝楼', '神兵坊', '青囊药谷', '合欢宗'],
      title: '正道魁首与中立势力',
      category: 'location',
      content: '中州昆仑宗为正道领袖兼包万法；天剑门专精杀伐剑道；天符宗统领符阵与传送；天机阁垄断天道星象与风云情报；万宝楼富可敌国掌控商会；青囊药谷医道救世；合欢宗以阴阳双修平衡各派，从不涉足正魔争端。'
    },
    {
      id: 'xiuxian_mo_and_yao',
      keys: ['魔修', '血煞宗', '万毒窟', '阴尸宗', '天魔教', '妖族', '青丘', '落日岭', '丹穴山', '黑龙渊', '血宸剑冢'],
      title: '魔道诸宗与万灵妖族',
      category: 'location',
      content: '魔道四大派行事极狠：万毒窟饲养阴毒情蛊，血煞宗汲取精血战阵，阴尸宗冰窟操纵古尸，天魔教隐于异界伺机倾覆人间；妖族以青丘九尾狐、落日岭白虎猛兽、丹穴山神禽、黑龙渊真龙四分天下；邪派血宸剑冢以生灵精血祭养凶剑，不入正魔两道。'
    },
    {
      id: 'xiuxian_roots_talents',
      keys: ['灵根', '天灵根', '双灵根', '变异灵根', '雷灵根', '冰灵根', '风灵根', '剑骨', '荒古圣体', '合欢圣体', '天赋'],
      title: '灵根品阶与天赋神通',
      category: 'rule',
      content: '灵根决定吸纳天地灵气速度与属性亲和：天灵根与变异灵根（风、雷、冰）为万中无一的宗门圣子；搭配剑心通明、药灵圣体、荒古圣体、合欢圣体等特殊命格，可修习对应的无上大道神通。'
    },
    {
      id: 'xiuxian_lingwang_forum',
      keys: ['灵网', '论坛', '贴吧', '玉简', '发帖', '热议', '吃瓜', '神识通讯'],
      title: '修仙界灵网玉简与苍澜论坛',
      category: 'rule',
      content: '万宝楼研制的传讯法宝，通过遍布中州的符阵基站实现神识互联。修士可匿名在灵网论坛发帖、水贴、围观八卦、查看悬赏求购与榜单热评。输入“开启灵网”即可进入论坛模式，输入“关闭灵网”恢复现实推演。'
    }
  ],

  // 🚪 调皮的女儿用身体堵门
  deck_daughter_door_block: [
    {
      id: 'ddb_koko_blocking',
      keys: ['林可可', '可可', '女儿', '堵门', '门把', '锁扣', '赤足', '光脚', '小腿'],
      title: '林可可的赤足堵门娇蛮占有',
      category: 'character',
      content: '19岁大一新生，长相清纯甜美、身材娇小玲珑。从小极度依赖父亲，甚至嫉妒母亲能得到父亲的拥抱与亲吻。上班前夕赤着一双光洁粉嫩的玉足死死卡在防盗门锁扣上，扬言不抱不亲就不准出门。'
    },
    {
      id: 'ddb_wife_in_kitchen',
      keys: ['妻子', '妈妈', '林婉清', '厨房', '早餐', '煎蛋', '迟到', '全勤'],
      title: '近在咫尺的厨房妻子与上班时限',
      category: 'rule',
      content: '妻子林婉清正在不远处的开放式厨房里哼着歌煎蛋，随时可能端着盘子走出来。距离上班打卡只剩几分钟，玄关处女儿的肉体纠缠与妻子随时撞破的危险感交织，带来窒息的推拉张力。'
    },
    {
      id: 'ddb_father_dilemma',
      keys: ['家法', '宠溺', '亲吻', '门板', '紧靠', '玩火', '迟到'],
      title: '父权惩戒与禁断顺水推舟',
      category: 'rule',
      content: '父亲可以在板起脸严肃立规矩的严父威严、无奈许诺大餐的温和宠溺、以及顺水推舟将娇软女儿按在门背上的禁断反向试探之间自由抉择。'
    }
  ],

  // 👠 成年了还把你当孩子的巨乳美母骚姐
  deck_mother_sister_baby: [
    {
      id: 'msb_sister_qingyan',
      keys: ['顾清颜', '清颜', '姐姐', '超模', '九头身', '黑长直', '粉穴', '旧t恤', '自慰'],
      title: '高冷超模姐姐顾清颜的私密反差',
      category: 'character',
      content: '24岁国内一线模特，身高172cm九头身，天生极品浅粉色私处。在外是高岭之花，在家穿着弟弟的旧大号T恤且从不穿内衣，喜欢指使弟弟跑腿。昨夜在卧室自慰被弟弟无意撞破，极度羞耻敏感。'
    },
    {
      id: 'msb_mother_shenyun',
      keys: ['沈韵', '妈妈', '母亲', '舞蹈老师', 'h罩杯', '巨乳', '雪乳', '浴巾', '吹头发'],
      title: '熟女母亲沈韵的无防备同居',
      category: 'character',
      content: '42岁舞蹈老师，守寡五年的顶级熟女，紫色长发垂腰，H罩杯雪乳挺拔丰腴。视照顾刚成年的儿子为天性，在家习惯只裹单薄浴巾或轻薄丝质睡衣走动，弯腰递水送餐毫不避讳。'
    },
    {
      id: 'msb_flat_atmosphere',
      keys: ['大平层', '客厅', '餐桌', '晨浴', '修罗场', '无边界', '早餐'],
      title: '三口之家边界融化的一线大平层',
      category: 'location',
      content: '一线城市三室两厅高档大平层公寓。父亲去世后形成的“一家人不用讲究”的生活习惯，在昨夜撞见姐姐自慰后彻底变味，早餐桌上的眼神回避与母亲的无意亲近，让暧昧与修罗场暗流汹涌。'
    }
  ]
};

// ============================================================================
// 2. 世界书关键词动态检索器 (Keyword Matcher & Prompt Injector)
// ============================================================================

export function getDeckLorebook(deckId: string, customLore?: LoreEntry[]): LoreEntry[] {
  let defaultEntries = DEFAULT_LOREBOOKS[deckId] || [];
  if (defaultEntries.length === 0) {
    if (deckId === '4881f4b1-dfd0-45cb-8e3a-f7b880f66635') defaultEntries = DEFAULT_LOREBOOKS['deck_succubus_wife'] || [];
    else if (deckId === 'eb85f366-919b-466e-a7ff-8d8dbc4ed29b') defaultEntries = DEFAULT_LOREBOOKS['deck_perfect_girl_plan'] || [];
    else if (deckId === 'b64f6c60-f3b0-438b-91ef-51362dbb4ce4') defaultEntries = DEFAULT_LOREBOOKS['deck_daughter_morning_wood'] || [];
    else if (deckId === '6575c840-e7d2-4fdc-a752-b111d9bdf5b8') defaultEntries = DEFAULT_LOREBOOKS['deck_ten_yuan_childhood_friend'] || [];
    else if (deckId === 'e59fe31f-98c7-4b85-9f84-262f5d13bc32') defaultEntries = DEFAULT_LOREBOOKS['deck_girls_dormitory'] || [];
    else if (deckId === '57879274-30f5-4411-957f-2a33bdd2e031') defaultEntries = DEFAULT_LOREBOOKS['deck_housewife_apartment'] || [];
    else if (deckId === '087637dd-b4ba-4588-ac91-cd6361d47be0') defaultEntries = DEFAULT_LOREBOOKS['deck_nude_girls_school'] || [];
    else if (deckId === 'c78de7d8-7353-467e-bc71-5e6f2c870679') defaultEntries = DEFAULT_LOREBOOKS['deck_heisi_daughter'] || [];
    else if (deckId === '432a57e9-8f8a-4e4e-80fc-83eb9ebc71eb') defaultEntries = DEFAULT_LOREBOOKS['deck_sister_in_law_niece'] || [];
    else if (deckId === '059217c9-213b-48e7-b660-0c04f78ede48') defaultEntries = DEFAULT_LOREBOOKS['deck_apocalypse_survival'] || [];
    else if (deckId === '3a67a4de-41a4-42ed-8187-af35365d6768') defaultEntries = DEFAULT_LOREBOOKS['deck_idol_sister_debt'] || [];
    else if (deckId === 'ca94cd1d-74e0-4e13-8ff0-f5ed93688866') defaultEntries = DEFAULT_LOREBOOKS['deck_twin_idols_fiancee'] || [];
    else if (deckId === '6836f15a-b43f-47a2-b962-d57362fcfd35') defaultEntries = DEFAULT_LOREBOOKS['deck_brother_loli_girlfriend'] || [];
    else if (deckId === 'e2cb7a3e-dbaa-40a7-831c-2961508083b0') defaultEntries = DEFAULT_LOREBOOKS['deck_white_tiger_sister_night'] || [];
    else if (deckId === '2da05c45-b6c2-49a1-89ee-d9c2d732d9ed') defaultEntries = DEFAULT_LOREBOOKS['deck_grade_first_demands'] || [];
    else if (deckId === '0881314d-a2ed-4e78-a5af-71dc42e9acac') defaultEntries = DEFAULT_LOREBOOKS['deck_mysterious_recovery_ghost'] || [];
    else if (deckId === '270a0ccb-ac28-4b9b-ac56-f7e6aa8cff41') defaultEntries = DEFAULT_LOREBOOKS['deck_mouth_feed_sister'] || [];
    else if (deckId === '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7') defaultEntries = DEFAULT_LOREBOOKS['deck_xiuxian_world'] || [];
    else if (deckId === '2168197e-903b-4727-97e3-bf5f1d5b6c8f') defaultEntries = DEFAULT_LOREBOOKS['deck_daughter_door_block'] || [];
    else if (deckId === '758e40b4-c1b3-4655-a83a-5ef136b60a2b') defaultEntries = DEFAULT_LOREBOOKS['deck_mother_sister_baby'] || [];
  }

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
