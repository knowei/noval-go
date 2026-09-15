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
