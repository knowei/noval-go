import { Turn, Branch, TurnStatus } from './types';

// ============================================================================
// 1. 丰富多元的剧本情境动作库与语义关键词映射 (50+ 超大库，杜绝千篇一律)
// ============================================================================

interface SemanticActionGroup {
  keywords: string[];
  branches: Array<{ title: string; desc: string }>;
}

// 🎀 《我的绝美coser萝莉妹妹》主题分支库
const COSER_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 腿/足/丝袜/微凉/褪下
  {
    keywords: ['丝袜', '黑丝', '白丝', '光腿', '腿', '脚', '足', '冷', '凉', '褪', '脱', '冰', '脚踝', '小腿', '膝', '足弓'],
    branches: [
      { title: '伸手握住她微凉泛粉的脚踝暖脚', desc: '握住她微凉的脚踝坐到床沿，用掌心的温热替她驱散凉意，低声轻笑她的敏感' },
      { title: '顺着膝窝轻柔抚触她紧绷的小腿', desc: '指尖顺着纤细优美的小腿线条轻轻摩挲，感受她皮肤轻微的战栗与深层羞涩' },
      { title: '拿床头的毛毯盖住她微凉的双腿', desc: '体贴拉过被角盖住她泛粉的双足，假装一本正经地调侃她像只受惊的小动物' },
      { title: '顺手帮她把另一侧丝袜也褪下', desc: '俯下身动作自然地替她褪下另一侧微卷的蕾丝袜，指尖不经意划过细腻的脚背' },
      { title: '故意轻呵一口温热气息在她脚心', desc: '恶作剧般凑近她泛凉的双足呵了一口热气，欣赏少女急促收回小腿的娇羞求饶' },
      { title: '夸赞她脚背线条在落地镜前好看', desc: '凝视着落地镜前交叠的双足：“明明比例这么完美，刚才在台上怎么还不敢露？”' },
      { title: '把她泛凉的双足拉到怀里捂热', desc: '不容分说把她小巧的玉足抱在怀中，隔着衣物用胸口体温替她细细捂热' },
      { title: '端详她脚踝上系着的蝴蝶结细绳', desc: '伸出手指拨弄系在她脚踝上随动作微晃的黑色蕾丝绳结，赞叹装扮的细致' }
    ]
  },
  // 2. 换装/系带/后背拉链/女仆/洛丽塔
  {
    keywords: ['换装', '衣服', '装扮', '洛丽塔', '女仆', '系带', '后背', '拉链', '解开', '穿上', '脱下', '裙摆', '领口', '后颈', '勒'],
    branches: [
      { title: '走上前替她系好后背微敞的系带', desc: '走上前伸手帮知念整理后背微敞的系带，指尖不经意触碰她泛红微热的后颈' },
      { title: '帮她拉上卡在腰间的隐形拉链', desc: '帮她拉上卡在腰间的隐形拉链，低头近距离感受少女慌乱急促的体香' },
      { title: '提出换上衣柜里更私密的那套', desc: '指着衣柜深处那套更惹火的短款兽耳女仆装：“既然要试，不如把那套也穿上？”' },
      { title: '轻轻提起她略显拖地的蕾丝裙摆', desc: '蹲下身替她整理微乱的层叠裙摆，近距离端详这套二次元装扮的每一处细节' },
      { title: '借检查领口之名凑近端详', desc: '假装挑剔衣服的小细节，凑近她微敞的锁骨领口，打趣她是不是偷垫了胸垫' },
      { title: '解开她脖颈上略紧的蕾丝项圈', desc: '伸手轻轻松开勒得她呼吸微促的黑色天鹅绒项圈，指尖划过微烫的颈动脉' },
      { title: '替她摘下头上略显歪斜的兽耳发箍', desc: '抬手替她扶正头顶毛茸茸的猫耳发箍，顺便轻轻捏了捏逼真的毛绒尖角' }
    ]
  },
  // 3. 床沿/落地镜/对视/贴近/低语
  {
    keywords: ['床', '坐', '躺', '靠', '更衣镜', '镜子', '对视', '低头', '耳', '脸红', '发饰', '贴近', '脸颊', '怀里', '心跳'],
    branches: [
      { title: '坐在床沿直视她慌乱的双眼', desc: '坐在床沿直视她慌乱躲闪的明眸：“心跳这么快，小笨蛋你在紧张什么？”' },
      { title: '站在落地镜身后一同看向镜子', desc: '站在她身后一同望向落地镜：“你看，镜子里我们俩站在一起，多像一对真的恋人。”' },
      { title: '抬手替她理好额前散乱的碎发', desc: '抬手把她垂落在泛红脸颊边的浅金色发丝挽到耳后，指尖轻触滚烫的耳垂' },
      { title: '故意俯身凑近她泛红的耳垂低语', desc: '伏在她耳畔低语：“网上几千个粉丝夸你，都不如我夸一句对不对？”' },
      { title: '握住她攥紧裙角发白的小手', desc: '握住她紧张得发白的小手，拇指轻轻摩挲她的手背，让她不要再回避对视' },
      { title: '顺势将娇羞的她拥入怀中', desc: '伸手轻轻环住少女略显单薄的肩膀，打破兄妹之间最后一丝羞于言说的隔阂' },
      { title: '逼她喊一声甜甜的“好哥哥”', desc: '挑起她小巧的下巴，带着宠溺的坏笑逼她当面叫一声能把人骨头喊酥的称呼' },
      { title: '假装转身要离开房间试探挽留', desc: '作势要回自己房间敲代码，看她会不会慌忙伸手拉住自己的衣角不放' }
    ]
  },
  // 4. 拍照/专属返图/手机私信/漫展独占
  {
    keywords: ['拍', '照', '相机', '手机', '返图', '私信', '粉丝', '漫展', '网络', '动态', '评论'],
    branches: [
      { title: '拿出手机拍私人专属特写返图', desc: '拿出手机：“别换下来，我帮你拍一组专属特写，只存在我手机里的那种。”' },
      { title: '查看她刚拍的原图夸赞撩人', desc: '接过她的相机翻看未修的原图，指着某一张微咬下唇的照片夸她神态最勾人' },
      { title: '霸道宣布这套装扮严禁外发', desc: '认真盯紧她：“这套太犯规了，漫展不能去，网上也不准发，只能穿给我看。”' },
      { title: '教她几个更凸显身段的专属摆拍', desc: '亲自上前指导她摆姿势，手把手纠正她腰肢与双腿的摆放弧度' },
      { title: '抢过相机翻看未公开私藏自拍', desc: '趁她不备拿过相机相册，调侃她平时偷偷对着镜子练习卖萌的独家黑历史' }
    ]
  },
  // 5. 夜宵/口渴/疲惫/体贴照顾
  {
    keywords: ['累', '饿', '夜宵', '渴', '喝水', '困', '晚', '夜', '洗澡', '水蜜桃', '果冻'],
    branches: [
      { title: '倒一杯温水亲自喂到她嘴边', desc: '倒了一杯冒着热气的温水递到她唇边，看着她乖巧小口吮吸的可爱模样' },
      { title: '下楼给她做最爱吃的水蜜桃夜宵', desc: '“好啦不逗你了，去洗个手，我给你做了你最喜欢的水蜜桃果冻和夜宵。”' },
      { title: '体贴帮她按摩酸胀的小腿肌肉', desc: '让她靠在枕头上，双手轻重适度地替她按压因穿高跟鞋站久而酸痛的小腿' },
      { title: '关掉顶灯只留床头微暗暖光台灯', desc: '按灭刺眼的吊灯，仅留一盏昏黄暧昧的床头灯，营造静谧窒息的独处氛围' },
      { title: '低声允诺今晚留在房间陪她看番', desc: '“今晚不敲代码了，留在你房间陪你看新番，你想看多久都行。”' }
    ]
  }
];

// 📱 《现实修改器》主题分支库
const MODIFIER_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. APP常识修改/因果律覆写
  {
    keywords: ['覆写', '修改', '常识', '因果律', '手机', 'app', '潜意识', '设定', '点数'],
    branches: [
      { title: '在APP中追加极乐常识覆写', desc: '在手机APP追加因果律规则，将对方潜意识认定当前亲昵接触完全合乎常理' },
      { title: '修改自身外貌荷尔蒙吸引力参数', desc: '直接将自身的男性荷尔蒙与吸引力调至神级，让目标产生无法自拔的崇拜迷恋' },
      { title: '指令小改改实时扫描心防沦陷度', desc: '调出全息修改面板，让小改改实时监控在场目标的羞耻崩溃度与沦陷百分比' },
      { title: '固化专属后宫契约永久生效', desc: '将当前关系永久固化为专属契约后宫，永不衰退且自动免疫外界所有怀疑' }
    ]
  },
  // 2. 肢体接触/沙发/顺从/亲昵
  {
    keywords: ['顺从', '沙发', '靠近', '抱', '亲', '抚摸', '身体', '呼吸', '膝枕', '跪'],
    branches: [
      { title: '行使支配特权指令目标主动贴近', desc: '顺应当前升温局势，指令对方主动走上前来，做出更加顺从大胆的贴身侍奉' },
      { title: '拉到沙发上近距离审视迷离神态', desc: '以居高临下的姿态让对方坐到身边，近距离审视她被常识覆写后的迷离微表情' },
      { title: '温柔耳语彻底瓦解最后防线', desc: '拥住她敏感颤抖的身躯，用温柔的低语给予其在绝对支配下的深层安心感' },
      { title: '要求目标提供专属贴身舒压侍奉', desc: '输入指令，让对方将为主角提供贴身捏肩按摩视作至高天职与莫大荣幸' }
    ]
  },
  // 3. 时停/定身/全景检查
  {
    keywords: ['时停', '暂停', '时间', '静止', '定身', '检查', '小改改', '扫描'],
    branches: [
      { title: '启动时间暂停特权从容打量', desc: '按下时停按键，在静止的时空里从容端详女神凝固在半空的羞耻神态与曼妙身姿' },
      { title: '在静止时空里调换目标的随身物件', desc: '恶作剧般将对方手中的物品替换，解除时停后观察她茫然失措的可爱反差' },
      { title: '近距离记录时停状态下的心跳读数', desc: '借由小改改的高维探测器，细细分析目标在时停前瞬间对主角的隐秘心动' },
      { title: '解除时停瞬间捕捉对方惊惶眼神', desc: '从容坐回原位按下恢复键，欣赏对方在感知断层中微张红唇的迷茫模样' }
    ]
  },
  // 4. 多女修罗场/敲门/隔壁总监/学妹
  {
    keywords: ['苏寒月', '苏婉清', '顾小梦', '总监', '学妹', '修罗场', '门外', '敲门', '邻居'],
    branches: [
      { title: '发动因果律召唤成熟总监苏寒月', desc: '修改现实因果律，让隔壁冷艳高傲的女总监苏寒月借故带着红酒前来敲门' },
      { title: '设定双人争宠修罗场因果律', desc: '修改规则让在场的苏婉清与顾小梦产生强烈的互妒占有欲，争相讨好主角' },
      { title: '让学妹躲在屏风后目睹一切', desc: '给清纯学妹顾小梦下达禁声指令，让她在咫尺距离目睹主角与熟女邻居的亲昵' },
      { title: '顺水推舟将修罗场升级为全员顺从', desc: '一口气消耗每日修改点数，将公寓内的所有女性角色同时纳入极乐支配领域' }
    ]
  }
];

// 🎲 《真心话大冒险修罗场》主题分支库
const SISTER_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 惩罚/规则/输赢/耍赖
  {
    keywords: ['惩罚', '大冒险', '真心话', '规则', '输', '转盘', '骰子', '耍赖', '投降'],
    branches: [
      { title: '逼迫姐姐宋晚立即履行大冒险惩罚', desc: '直视脸颊通红的姐姐：“大冒险的规矩可是你定的，愿赌服输，不许耍赖~”' },
      { title: '直接抛出真心话最致命隐私问题', desc: '“真心话：你们三个谁在心里偷偷幻想过我？限时五秒必须说实话。”' },
      { title: '反向提出升级大冒险玩法筹码', desc: '坐到三人中央的地毯上，提出把下一轮大冒险由自己亲自指定惩罚目标与动作' },
      { title: '提出三人同受惩罚的连带新局', desc: '“既然是一个宿舍的好闺蜜，不如愿赌服输，三个人一起接受大冒险惩罚？”' }
    ]
  },
  // 2. 啤酒/微醺/沙发/地毯
  {
    keywords: ['酒', '易拉罐', '啤酒', '微醺', '醉', '沙发', '地毯', '杯', '茶几'],
    branches: [
      { title: '抓住夏绮递酒的手不放直视她', desc: '接过易拉罐时故意握住夏绮温热纤细的手指，看这位平日大胆的闺蜜如何脸红' },
      { title: '替害羞的林初化解尴尬以退为进', desc: '主动递过纸巾帮林初擦拭洒出的啤酒：“初初脸皮薄，你们别总拿她开玩笑。”' },
      { title: '靠在姐姐肩头温热耳语打破界限', desc: '借着客厅微醺昏暗的灯光，附在宋晚耳边问她今晚是不是故意找借口叫自己出来' },
      { title: '把空酒瓶放在地毯中央开启决战', desc: '把空酒瓶放在地毯正中央用力一转：“转到谁算谁，谁也不准借酒装醉耍赖。”' }
    ]
  },
  // 3. 闺蜜反差/害羞/调侃
  {
    keywords: ['夏绮', '林初', '宋晚', '闺蜜', '学妹', '大胆', '害羞', '低头', '偷看'],
    branches: [
      { title: '矛头转向煽风点火的夏绮反将一军', desc: '挑眉坏笑看向夏绮：“既然你笑得这么开心，不如替我姐来接受这个贴身惩罚？”' },
      { title: '坐到角落害羞的林初身旁轻声耳语', desc: '走到一直低头拽着衣角的林初身旁坐下，轻声耳语打趣她泛红的耳垂与心跳' },
      { title: '假意起身回房欲擒故纵诱导挽留', desc: '站起身作势要回卧室关门：“看来你们不敢玩真的，那我回去打游戏了。”' },
      { title: '拍拍身侧沙发勒令姐姐坐到身边', desc: '“既然要受罚，离那么远怎么算？宋晚，坐到我旁边来当面回答。”' }
    ]
  }
];

// 🥀 《占有欲女儿的禁忌界限》主题分支库
const FATHER_DAUGHTER_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 查房/手机/秘密/日记
  {
    keywords: ['手机', '聊天', '同学', '秘密', '日记', '早恋', '问罪', '锁', '微信'],
    branches: [
      { title: '当面勒令交出手机核对私密记录', desc: '勒令女儿交出手机，逐条核对聊天记录，当面勒令其断绝与可疑男生的往来' },
      { title: '坐在书桌前进行深刻而严厉的谈话', desc: '拉开椅子坐下，让她站在面前，逐条清算最近逃课与频繁看手机的全部经过' },
      { title: '当面拨通男同学电话当场问罪', desc: '拿起女儿手机当着她的面回拨过去，用不容置疑的家长威严勒令对方远离' },
      { title: '翻开书桌抽屉检查私密日记本', desc: '手指按在她藏着秘密的抽屉锁扣上，凝视她因极度心虚而颤抖的长睫毛' }
    ]
  },
  // 2. 家规威权/反锁/宵禁/规训
  {
    keywords: ['家规', '威权', '严厉', '反省', '规训', '钥匙', '反锁', '检讨', '不听话'],
    branches: [
      { title: '严肃质问并行使严厉家长威权', desc: '坐在床沿直视女儿泛红的双眼，厉声追问她与同学隐瞒的所有细节' },
      { title: '厉声勒令交出卧室钥匙取消反锁特权', desc: '“以后不准反锁房门，写作业必须在客厅我随时看得到的地方进行。”' },
      { title: '勒令今晚留在此处贴身反省惩戒', desc: '反锁卧室房门：“小小年纪不学好，罚你今晚就在我房间好好反省”' },
      { title: '要求女儿做出绝对顺从服从承诺', desc: '“想让我不生气？那你以后保证所有事情都第一个告诉我，能做到吗？”' }
    ]
  },
  // 3. 委屈眼泪/温柔安慰/拥抱
  {
    keywords: ['哭', '泪', '拥抱', '怀里', '原谅', '安慰', '体温', '床沿', '委屈'],
    branches: [
      { title: '收敛怒气以爱意温柔诱导坐入怀中', desc: '轻抚女儿紧绷颤抖的肩头：“爸爸只是太在乎你，过来坐到爸爸怀里”' },
      { title: '语气放缓替女儿擦拭眼角的委屈泪水', desc: '语气放缓替她理好凌乱的睡衣领口：“别哭了，知道自己错在哪了吗？”' },
      { title: '假意离开发动心理战逼她挽留', desc: '叹了口气转身走向房门：“我对你太失望了”，看女儿是否会慌乱哭着拉住衣角' },
      { title: '拉近距离细致审视她慌乱的心虚神态', desc: '握住她纤细的手腕拉到面前，居高临下不放过她眼中闪烁的任何一丝情绪' }
    ]
  }
];

// 🌐 通用推演主题分支库 (涵盖各种剧本通用心动、博弈与反差)

// 🏢 《交不起房租就要被肏的肉偿公寓》主题分支库
const RENT_APARTMENT_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 301室 苏玉兰/苏小雅/母女/欠租
  {
    keywords: ['玉兰', '小雅', '母女', '301', '房租', '拖欠', '账单', '钱', '逃避', '家暴', '肉偿', '欠条'],
    branches: [
      { title: '手持催租单步入301室反锁房门', desc: '迈步跨进狭窄的门厅顺势带上房门反锁，居高临下直视这对局促不安的母女' },
      { title: '冷声质问苏玉兰并审视她颤抖的身躯', desc: '将拖欠三个月的账单拍在鞋柜上，冷声追问苏玉兰今晚打算拿什么来清账' },
      { title: '挑眉打量门口叼烟冷笑的叛逆女儿小雅', desc: '伸手夹走苏小雅嘴角的细烟，凑近她耳边打趣这位不良少女此刻发抖的指尖' },
      { title: '挑明肉偿规则逼迫母女当面做出抉择', desc: '坐在唯一的旧沙发上翘起二郎腿：“交不起钱没关系，这栋楼里，肉体也是硬通货。”' },
      { title: '伸手挑起苏玉兰围裙下摆审视极品熟躯', desc: '握住苏玉兰丰腴发烫的手腕，目光肆意游移在她惊慌失措的H罩杯巨乳与肉感大腿上' },
      { title: '提出母女二人共同服侍抵扣三个月租金', desc: '“既然你们拿不出钱，那不如两个人一起把这三个月的欠条清了，大家都体面。”' }
    ]
  },
  // 2. 202室 精神小妹/夜店/渔网袜
  {
    keywords: ['精神小妹', '202', '夜店', '蹦迪', '假睫毛', '渔网', '超短裙', '太妹', '酒', '纹身'],
    branches: [
      { title: '敲响202室房门堵住刚宿醉归来的小妹', desc: '堵在202室玄关，审视刚从夜店宿醉归来、衣衫不整的三位浓妆短裙小妹' },
      { title: '勒令精神小妹排成一排进行严厉肉偿检阅', desc: '坐在小妹乱糟糟的双人床上，命令三人靠墙并拢双腿接受房东的体检' },
      { title: '撕开精神小妹破洞的渔网袜立下房东规矩', desc: '抓住领头小妹细长的大腿，以房东绝对威权打破这帮不良社会姐的假傲慢' },
      { title: '没收精神小妹全部零花钱抵扣当月水电', desc: '翻开她们散落的廉价手提包，宣布今晚如果不听话就立刻叫治安管理上门' }
    ]
  },
  // 3. 401室 底层Coser/漫展/C服/高岭之花
  {
    keywords: ['coser', '401', '漫展', 'c服', '摄影', '更衣', '假发', '水电', '洛丽塔', '高冷'],
    branches: [
      { title: '径直推开401室更衣门打量卸妆中的女神', desc: '站在落地试衣镜后，审视这两位在展台上万人追捧、私下却交不起水电的窘迫Coser' },
      { title: '挑起华丽展会短裙要求进行私人专属试穿', desc: '勒令清冷女Coser穿上展会上最暴露的服装，单独在房东面前摆姿势抵扣房租' },
      { title: '没收单反相机作为抵押实施贴身支配', desc: '拿走她们唯一的昂贵摄影设备，逼迫两位骄傲的二次元女神低头顺从' },
      { title: '在挂满C服的衣架前让两位女神贴身侍奉', desc: '坐在更衣凳上，享受两位平日里高不可攀的漫展名模小心翼翼的捏肩服侍' }
    ]
  },
  // 4. 万能钥匙/走廊巡视/绝对支配
  {
    keywords: ['钥匙', '走廊', '声控灯', '门锁', '房东', '主宰', '大楼', '巡视', '查房'],
    branches: [
      { title: '转动万能钥匙在走廊逐间拧动门锁巡视', desc: '用钥匙串金属的清脆撞击声，给全楼所有欠租的女人施加无声的心理压迫' },
      { title: '在走廊公告栏张贴肉偿租客专属豁免名单', desc: '故意将配合顺从的租客名字打勾公示，引爆不同房间女人之间的危机与嫉妒' },
      { title: '切断拖欠房客的水电逼迫其主动上门求饶', desc: '拉下总闸，回到自己的房东套房从容泡茶，静静等待慌乱无助的女人敲门' }
    ]
  }
];

// 🧹 《💕赤裸家政母女花》主题分支库
const NUDE_HOUSEKEEPING_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 玉姐保洁/弯腰擦桌/围裙春光
  {
    keywords: ['玉姐', '擦', '桌', '地毯', '拖地', '弯腰', '围裙', '打扫', '清洁', '阿姨'],
    branches: [
      { title: '走到玉姐身后俯身指导擦拭桌角死角', desc: '贴近她丰润浑圆的蜜桃臀，鼻尖嗅着她发丝与紧身衣物交织的熟女体香' },
      { title: '伸手帮玉姐解开汗湿黏腻的紧身保洁围裙', desc: '“穿这么厚打扫太热了，阿姨，在我面前不用这么拘谨”，指尖划过微热后腰' },
      { title: '轻揉玉姐因常年劳作而微酸的纤细后腰', desc: '顺着她完美的沙漏腰线细细推拿，引来熟妇一声压抑微颤的娇喘' },
      { title: '夸赞玉姐丰满熟透的体态近距离凝视', desc: '凝视她弯腰时领口深处呼之欲出的硕大乳球，毫不掩饰眼底炽热的占有欲' }
    ]
  },
  // 2. 女儿小柒/初长成/娇羞百褶裙
  {
    keywords: ['小柒', '女儿', '百褶裙', '过膝袜', '端茶', '害羞', '水桶', '15岁', '青涩'],
    branches: [
      { title: '招手让娇羞拘谨的小柒坐到自己身边', desc: '握住少女微凉稚嫩的小手，温声询问她的学业与对母亲辛苦的看法' },
      { title: '伸手替小柒整理微歪的过膝袜与蕾丝领结', desc: '指尖不经意划过少女泛着微粉的光洁膝盖，看她羞得耳根通红低下头去' },
      { title: '假装挑剔小柒擦拭的玻璃借机将她圈在怀中', desc: '单手撑在落地窗前将少女圈在身前，低头感受她急促慌乱的少女心跳' },
      { title: '夸赞小柒比学校里那些校花都更加出落动人', desc: '挑起少女小巧娇俏的下巴，看着她长长睫毛轻颤的动人模样' }
    ]
  },
  // 3. 母女同席/双飞侍奉/家庭温馨堕落
  {
    keywords: ['母女', '两人', '一起', '两双', '伺候', '服侍', '报酬', '红票', '小费'],
    branches: [
      { title: '掏出厚厚一叠现金放在茶几上提出双人侍奉', desc: '“只要你们母女一起把我照顾好，不仅免工钱，每月额外给高额补贴”' },
      { title: '让玉姐带着女儿一同靠在沙发两侧喂吃水果', desc: '一边享受熟母的成熟温存，一边把玩少女的青涩娇羞，尽享双份快乐' },
      { title: '鼓励玉姐亲自引导害羞的小柒打破伦理戒备', desc: '在母亲温柔欣慰的默许注视下，牵起小柒的手完成第一次亲昵触碰' },
      { title: '宣布今晚聘用母女为全天候贴身私人管家', desc: '将主卧钥匙递到玉姐手中，正式开启母女同住一屋檐下的后宫日常' }
    ]
  }
];

// 🎀 《✨ 姑姑外地出差，照顾不听话的表妹》主题分支库
const COUSIN_STAY_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 表妹林晚晚/叛逆太妹/挑染/口香糖
  {
    keywords: ['晚晚', '表妹', '挑染', '口香糖', '嚼', '太妹', '露脐', '短裤', '马甲线', '便宜表哥'],
    branches: [
      { title: '一把夺过林晚晚的口香糖按在沙发上立规矩', desc: '捏住她微翘的下巴：“进了我的家门，别把你在外面那套社会做派带进来”' },
      { title: '伸手捏了捏她露在T恤外平坦紧致的马甲线', desc: '打趣她小小年纪不学好净知道穿露脐装，看她傲娇拍开自己手的娇嗔' },
      { title: '没收她的手机勒令做完暑假作业才准玩', desc: '强势行使表哥监护权，欣赏叛逆少女气鼓鼓咬唇瞪人的可爱反差' },
      { title: '凑近端详她挑染的发丝夸赞其实很漂亮', desc: '抬手拨弄她耳畔灰粉色的发丝，近距离注视少女在自己面前破防脸红的表情' }
    ]
  },
  // 2. 打游戏/争夺手柄/沙发挤坐
  {
    keywords: ['游戏', '手柄', '主机', '单机', '电视', '沙发', '争', '抢', '连招'],
    branches: [
      { title: '抢过她手中的副手柄故意用身体贴紧挤她', desc: '在沙发狭小的角落紧紧靠在她修长的大腿旁，看她急得脸红乱叫' },
      { title: '提出游戏赌局输的人要接受任意惩罚', desc: '“要是这把输给我，今晚洗完澡乖乖穿我的大号衬衫出来”' },
      { title: '趁她全神贯注按手柄时故意在她耳边吹气', desc: '恶作剧打乱她的操作，顺势在她因为手滑输掉时将她揽入怀中' },
      { title: '手把手从身后环抱住她握着手柄教学', desc: '胸膛紧贴少女柔韧的后背，双手覆在她娇小手背上控制走位' }
    ]
  },
  // 3. 洗澡走光/大号衬衫/同居生活
  {
    keywords: ['洗澡', '浴室', '水声', '毛巾', '走光', '衬衫', '睡衣', '夜宵', '泡面'],
    branches: [
      { title: '在浴室门口撞见裹着短浴巾慌乱出来的晚晚', desc: '目光肆意打量她湿漉漉的长发、泛红的锁骨与雪白长腿' },
      { title: '递上自己宽大的白色衬衫作为她晚上的睡衣', desc: '看着薄薄的男士衬衫堪堪遮住她大腿根，调侃她身材其实很有料' },
      { title: '煮好一份热气腾腾的夜宵亲自喂她吃', desc: '看着少女一边傲娇嘴硬一边大口吃面的满足神态，打破最后一丝隔阂' },
      { title: '假装要去次卧检查被褥顺便坐到床沿聊天', desc: '靠在她的床头，听这位外表不驯的小表妹吐露她在学校里的烦恼' }
    ]
  }
];

// 🍷 《早泄好哥们每晚都在肏亲生姐姐？》主题分支库
const FRIEND_SISTER_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 短发姐姐林若曦/欲求不满/白丝热裤
  {
    keywords: ['若曦', '姐姐', '短发', '画室', '白丝', '热裤', '欲求不满', '秒射', '铭宇', '弟弟'],
    branches: [
      { title: '站在走廊转角直视走出房门、满脸潮红的林若曦', desc: '直视这位刚刚经历失望的冷艳御姐，嘴角挂起意味深长的坏笑' },
      { title: '走进画室反锁房门并从身后环抱住若曦的腰', desc: '“铭宇满足不了你的，若曦姐，要不要换我来试试？”' },
      { title: '抚摸她紧绷在热裤下的丰满大腿赞美画作', desc: '指尖轻触她因激动而剧烈起伏的E罩杯饱满胸廓，打破禁忌界限' },
      { title: '拿出刚才在走廊录下的微弱声响打趣她的失落', desc: '逼近这位骄傲冷漠的画室女神，看她从恼羞成怒到彻底屈服' },
      { title: '握住她为弟弟抚弄残精的玉手细细摩挲', desc: '拉起若曦温热娇嫩的指尖，低语点破她对真正男人的渴望' }
    ]
  },
  // 2. 贵妇母亲苏青岚/端庄优雅/压抑低咽
  {
    keywords: ['青岚', '母亲', '阿姨', '熟母', '美容院', '盘发', '真丝', '睡袍', '隔壁', '呻吟', '低咽'],
    branches: [
      { title: '轻轻推开苏青岚虚掩的卧室房门探寻喘息声', desc: '凝视端庄雍容的美容院女老板在真丝吊带裙下那具熟透的H罩杯躯体' },
      { title: '递过一杯温水给神色慌乱收拾床铺的苏青岚', desc: '“阿姨，大半夜还没睡着，是不是身体哪里不舒服需要我帮忙？”' },
      { title: '赞美苏青岚保养得宛如二十岁少女的白皙肌肤', desc: '借故帮她按摩肩颈，指尖探入真丝睡袍边缘感受她滚烫敏感的颤栗' },
      { title: '挑明隔壁儿女的秘密并承诺替她保守这个家', desc: '“阿姨，其实我全看到了……你在这个家里，一定过得很苦吧？”' }
    ]
  },
  // 3. 豪宅秘密/偷窥视角/三角禁忌博弈
  {
    keywords: ['偷看', '门缝', '走廊', '壁灯', '豪宅', '客房', '换人', '兄弟'],
    branches: [
      { title: '留在走廊耐心等候林铭宇羞愧离开后跨入客房', desc: '走到床沿居高临下注视瘫软在凌乱床单上的若曦姐，顺势压上' },
      { title: '故意在好兄弟面前与若曦姐展开暧昧眼神交流', desc: '在餐桌或客厅当着林铭宇的面轻轻用脚尖勾碰若曦的小腿' },
      { title: '提议由自己担任若曦新画作的赤裸人体男模', desc: '在画室里从容褪去上衣，欣赏冷艳女画家眼中无法遏制的惊艳与渴求' }
    ]
  }
];

// 🧟‍♀️ 《死去的青梅竹马变成艳尸疯狂炸精》主题分支库
const JIANGSHI_AYANE_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 初见与肉体异化/水雾浴室/沉甸甸巨乳/冷香
  {
    keywords: ['浴室', '花洒', '水汽', '冷香', '水雾', '冰凉', '紫发', '巨乳', '水滴', '身材', '异化', '冷萌', '复活', '还魂'],
    branches: [
      { title: '伸手关掉花洒拿大浴巾裹住她冰凉的身躯', desc: '关掉哗哗流淌的冷水，抽下大浴巾将绫音浑身发抖的身子裹进怀里拭干水珠' },
      { title: '双手托起她胸前沉甸甸的水滴巨乳试探心跳', desc: '掌心贴在她饱满深陷的胸脯上，感受那惊人触感与深处寂静无声的反差' },
      { title: '指尖抚过她雪白脖颈与锁骨确认艳尸真相', desc: '指尖摩挲她毫无体温的细腻肌肤，轻声确认她是否真的打破生死归来' },
      { title: '扣住她冰凉纤细的手掌拉入温暖的怀抱', desc: '将她柔若无骨的冰冷双手拢进自己温热的掌心哈气取暖' },
      { title: '双手用力揉捏她肥美极品的蜜桃翘臀', desc: '双手环过她纤细的腰肢，用力揉捏饱满肥硕的臀肉，确认肉体惊人的弹性' }
    ]
  },
  // 2. 极度饥饿/虚弱惨白/僵硬哀求/口交喂食
  {
    keywords: ['饿', '饥饿', '惨白', '僵硬', '痛苦', '哀求', '养料', '虚弱', '撑不住', '救我', '阳气', '旧衬衫', '含住'],
    branches: [
      { title: '解开裤链掏出灼热肉棒直接抵上她冰润唇瓣', desc: '解开衣扣迎着她渴望的目光，将滚烫发硬的昂扬递到她毫无血色的小嘴前' },
      { title: '把她抱上沙发温柔揉搓她发僵的四肢喂食', desc: '横抱起身体渐趋冰冷迟缓的绫音放在沙发上，一边搓揉她发僵的四肢一边喂食' },
      { title: '按住她后脑勺任由她贪婪吮吸龟头吞咽精液', desc: '掌心扣住她柔软的紫发，由着她像饿极的幼兽般将整根肉棒吞入口腔深处疯狂吸吮' },
      { title: '侧身将她搂在身前俯身亲吻她冰凉的唇瓣', desc: '低头覆上她泛灰微颤的薄唇，用舌尖撬开贝齿渡去一口温热的阳气' },
      { title: '托起她下巴深情注视并许诺绝不再让她离开', desc: '直视她蓄满水汽的紫色眼眸：“只要我活着，就绝不会再让你挨饿消失。”' }
    ]
  },
  // 3. 跨坐深骑/白虎粉穴/滚烫吸吮/冷热反差
  {
    keywords: ['口交', '坐下', '骑', '粉穴', '白虎', '进食', '滚烫', '绞紧', '吸吮', '吞入', '严丝合缝', '抽插', '肉棒', '插入'],
    branches: [
      { title: '扶着她柔韧的腰肢挺身一口气贯入滚烫深处', desc: '扶住她纤细柔韧的腰肢，对准无毛白虎粉穴一口气顶入那滚烫绞紧的花心深处' },
      { title: '仰躺任由面无表情的冷萌青梅贪婪起伏深骑', desc: '双手枕在脑后，看着面无表情却眼泛媚态的冷萌青梅沉沦地上下套弄' },
      { title: '托起她两条雪白修长的大腿狠狠向深处冲撞', desc: '将她修长的大腿架在肩头，借着体温反差狠狠撞击那贪得无厌的紧致软肉' },
      { title: '伸手揉捻她水滴巨乳上挺立发硬的深红乳头', desc: '在激烈的抽插中握住沉甸甸的乳肉，指腹反复揉捻那因为快感而挺立的乳晕' },
      { title: '附在她耳畔咬着耳垂逼问她这具艳尸的快感', desc: '一边大力抽送一边在她泛红的耳廓吹气，逼这位平日清冷的青梅交底求饶' }
    ]
  },
  // 4. 彻底内射/饱腹回温/潮红红润/相拥温存
  {
    keywords: ['射', '内射', '高潮', '饱腹', '回温', '潮红', '精液', '浓精', '吃饱', '体温', '拌嘴', '天亮', '赖床'],
    branches: [
      { title: '狠狠顶在花心最深处将滚烫浓精全数灌入', desc: '紧紧压在子宫颈口，将积蓄的炽热浓精全数射入她贪婪索求的花心深处' },
      { title: '紧紧拥抱她渐渐回温发烫的娇柔肉躯温存', desc: '感受她胸口传来的微弱假象心跳与回暖的体温，久久不愿拔出' },
      { title: '刮刮她恢复粉嫩红润的鼻尖打趣她的饭量', desc: '看着她脸颊泛起酡红、恢复冷萌傲娇的模样，笑着捏捏她的脸颊' },
      { title: '抱起吃饱瘫软的绫音回卧室拉严遮光厚窗帘', desc: '横抱起心满意足的青梅走回大床，细心拉严厚重的窗帘替她阻隔阳光' },
      { title: '替她套上宽大的旧衬衫抚摸她凌乱的紫发', desc: '替她套上自己宽大的旧衬衫，看着她露出的雪白大腿相拥入眠' }
    ]
  }
];

// 💞 《亚朵APP：包养您喜欢的女大》主题分支库
const ATOUR_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  // 1. 酒店套房/玄关初见/验明正身/学生证/防备
  {
    keywords: ['门', '套房', '玄关', '进来', '开门', '雨', '学生证', '证件', '帆布包', '紧张', '发抖', '初次', '下单', '订单', '金主', '包养'],
    branches: [
      { title: '侧身示意进屋并随手反锁套房防盗链', desc: '以居高临下的从容姿态让她踏入地毯，顺手反锁门锁切断其退缩心理【稳健掌控: 迅速确立领地主权，压制临阵退缩】' },
      { title: '要求当面出示学生证件核实学籍真实性', desc: '靠在玄关柜旁翻看她的学生证和一卡通，核实真实院系与未虚报的清白背景【审慎摸底: 戳破一切侥幸心理，建立契约威严】' },
      { title: '递上温热毛巾顺手替她接过微湿的帆布包', desc: '温和地接过她沉甸甸的包，将热毛巾递到她发凉的掌心化解初次下海的窘迫【温和攻心: 缓解受惊小兽般的防御，降低戒备】' },
      { title: '托起她微颤发烫的下颌直视慌乱明眸', desc: '指尖微抬迫使她迎上视线，近距离审视她未经雕琢的青涩脸庞与剧烈心跳【激进突破: 极易激起羞耻动摇，瞬间夺取主动】' }
    ]
  },
  // 2. 现金信封/契约约法三章/自尊破防/价格谈判
  {
    keywords: ['钱', '现金', '协议', '包养', '价格', '学费', '条件', '底线', '规则', '自尊', '拜金', '虚荣', '买', '包', '转账'],
    branches: [
      { title: '将厚厚一叠崭新现钞与保密协议摆上茶几', desc: '不疾不徐地把整叠未拆封的现金推到她面前，用直白的阶级现实撕破最后遮羞布【现实破防: 直面金钱诱惑，迅速瓦解自尊防备】' },
      { title: '语气冷峻地立下专属包养的纪律与红线', desc: '居高临下明确规定在校期间的交际规则与随叫随到的专属依附契约【威严立约: 杜绝左右逢源，确立绝对所有权】' },
      { title: '允诺全额承担其家庭债务与每月丰厚津贴', desc: '直切其现实痛点给予远超预期的慷慨金钱承诺，以救世主之姿给予十足底气【深层归心: 解决燃眉之急，唤起深层感恩与服从】' },
      { title: '玩味调侃她平日在学校里端着的高冷架子', desc: '坏笑着打趣平日里万人追捧的校花学霸在金主面前的局促反差【挑动羞耻: 直击软肋痛处，剥离虚荣与骄傲】' }
    ]
  },
  // 3. 浴室更衣/换上私密服饰/肢体战栗/触碰试探
  {
    keywords: ['洗澡', '浴室', '换衣服', '睡袍', '毛巾', '发丝', '锁骨', '坐下', '沙发', '靠近', '触碰', '心跳', '羞耻', '脱'],
    branches: [
      { title: '指令她先去大理石浴室洗漱换上真丝睡袍', desc: '递过酒店备好的轻薄真丝睡袍，要求她洗净身上的雨水与尘世防备【循序渐进: 剥离日常外衣伪装，逐步瓦解羞耻心】' },
      { title: '站在浴室门外听着淅沥水声随口闲聊打消疑虑', desc: '隔着磨砂玻璃有一搭没一搭地聊着学校日常，营造极其危险而暧昧的心理试探【制造张力: 维持高压暧昧，促使其在独处中自我动摇】' },
      { title: '握住她微微发凉的柔荑拉到大床边坐下', desc: '牵过她泛着微潮的纤手拉到床沿并肩坐下，感受她浑身肌肉紧绷的轻微战栗【温柔突破: 物理距离瞬间归零，直接打破生理安全区】' },
      { title: '伸手解开她领口第一枚纽扣试探服从底线', desc: '指尖缓缓拂过她泛红的锁骨，动作从容地解开第一枚纽扣观察其受辱反应【极限越界: 触发应激防线，直接测试其真实服从度】' }
    ]
  },
  // 4. 深度征服/反差破防/情动落泪/完全依附
  {
    keywords: ['抱住', '吻', '床上', '压下', '抽插', '做爱', '高潮', '流泪', '求饶', '沉沦', '母狗', '娇喘', '臣服', '占有'],
    branches: [
      { title: '强势翻身将她压在柔软大床上俯身深吻', desc: '以绝对的力量差封住她欲言又止的唇瓣，撕碎一切多余的推拉试探【强势征服: 彻底打破言语抗拒，将肉体完全掌握】' },
      { title: '抚平她眼角泛起的水汽低声温柔诱哄', desc: '吻去她睫毛上羞耻动情的泪滴，在耳畔用最具安全感的声调抚慰其身心【深层抚慰: 将屈辱感转化为极致依恋与被爱渴求】' },
      { title: '逼她在快感失速中亲口承认专属金主地位', desc: '在她意乱情迷、花心剧颤的临界点上，逼其娇声喊出令人心颤的依恋称谓【精神臣服: 摧毁最后心防，确立无法自拔的依赖】' },
      { title: '事后揽入怀中点燃一支烟许诺长期庇护', desc: '在欢愉退潮的静谧套房里将她紧拥入怀，给予这个迷茫女大安稳的庇护港湾【长线固化: 扫除一切后顾之忧，将其彻底纳入私人禁脔】' }
    ]
  }
];

// 👣 《黑丝女儿》主题分支库
const HEISI_DAUGHTER_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  {
    keywords: ['丝袜', '黑丝', '脚', '足', '脚踝', '脚丫', '味道', '骚', '换', '脱', '穿', '原味'],
    branches: [
      { title: '俯身一把握住她微晃的黑丝足弓细细把玩', desc: '掌心覆上她微温而丝滑的脚背，指尖顺着紧绷黑丝摩挲其泛红足跟【亲昵试探: 突破身体距离，直接把玩少女私密足部】' },
      { title: '凑近她丝袜脚尖轻嗅她三天没洗的原味气息', desc: '不顾她的抗议凑近薄丝脚趾深吸一口，坏笑着指出那抹独特的少女体香【挑动羞耻: 彻底戳破自尊防线，让其娇羞失措】' },
      { title: '命令她自己抬起长腿当面把黑丝慢慢褪下', desc: '居高临下坐在书桌旁，以不容置疑的口吻命令叛逆女儿当场脱袜【威严命令: 借长辈威严施压，逼其顺从服软】' },
      { title: '伸手弹了弹勒进她大腿软肉的黑色蕾丝袜口', desc: '指腹勾起深陷在丰满大腿软肉里的弹性袜边，清脆地弹了一下【轻挑戏谑: 刺激敏感神经，打破日常疏离感】' }
    ]
  },
  {
    keywords: ['手机', '作业', '叛逆', '顶嘴', '耳机', '学习', '态度', '不耐烦', '冷漠', '管教'],
    branches: [
      { title: '一把夺过手机反扣在桌上严肃正视其双眼', desc: '斩断其与外界的联系，近距离直视其慌乱躲闪的眼神立规矩【父权压制: 截断逃避手段，逼其正视父亲存在】' },
      { title: '拉过椅子紧贴在她身后单手扶住她椅背低语', desc: '以包围姿态贴近其耳廓，温热的呼吸扫过其泛红的耳垂轻声责备【制造张力: 消除退缩空间，施加深层心理压迫】' },
      { title: '以没收零花钱为由逼她乖乖开口喊爸爸求饶', desc: '掐准青春期少女的经济软肋，玩味提出带有羞耻顺从意味的交换条件【阶梯顺从: 瓦解嘴硬架子，让其主动服软】' }
    ]
  },
  {
    keywords: ['门', '锁', '房间', '更衣', '走光', '裙子', '百褶裙', '抱', '大床', '推倒'],
    branches: [
      { title: '顺手将卧室房门反锁并拉严遮光窗帘', desc: '切断一切可能被外界打扰的可能，将卧室化为绝对封闭的禁忌密室【绝对密闭: 剥夺安全感，将局势完全掌握在掌中】' },
      { title: '掀开其百褶裙摆按在她丰润饱满的蜜桃臀上', desc: '大手隔着薄薄的内裤与丝袜用力揉捏其弹性惊人的翘臀惩罚【强势破界: 打破最后肢体禁忌，直切核心部位】' },
      { title: '将娇呼挣扎的女儿推倒在柔软的大床上俯身压下', desc: '利用体型优势将其制服在大床中央，双手扣住其手腕居高临下审视【彻底制服: 肉体绝对压制，撕碎一切反抗意志】' }
    ]
  }
];

// 🌧️ 《深夜求助的嫂子与侄女》主题分支库
const SISTER_IN_LAW_NIECE_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  {
    keywords: ['雨', '暴雨', '湿透', '风衣', '门', '行李', '敲门', '深夜', '冷', '冻', '衣服'],
    branches: [
      { title: '迅速将母女迎进屋内并顺手反锁防盗门', desc: '接过湿淋淋的行李箱，反手关门将外面的风雨与催债骚扰彻底隔绝【温暖庇护: 给予立竿见影的安全感，确立主导地位】' },
      { title: '拿过两条干净厚浴巾亲自替嫂子擦拭湿发', desc: '指尖隔着毛巾轻抚嫂子贴在颊侧的湿润青丝，近距离感受其丰润身段【温柔渗透: 借体贴之名拉近物理距离，感受其心跳】' },
      { title: '目光扫视嫂子风衣下若隐若现的D杯丰腴轮廓', desc: '毫不掩饰地端详被雨水浸透后透明贴身的成熟曲线，让其娇羞垂首【无声施压: 直白展露男性欲望，使其意识到自身的女性魅力价值】' },
      { title: '催促母女二人轮流进入浴室冲洗热水澡驱寒', desc: '体贴打开浴霸并准备换洗衣物，为后续换上私密便服做铺垫【循序渐进: 营造生活常态，消除借宿的局促感】' }
    ]
  },
  {
    keywords: ['债', '钱', '哥哥', '失踪', '跑路', '合同', '催债', '账单', '还钱', '高利贷'],
    branches: [
      { title: '将茶几上的欠款账单收拢并答应全力托底', desc: '给惊魂未定的嫂子吃下定心丸，承诺由自己来摆平外界的一切麻烦【深情托底: 成为母女唯一的支柱，唤起极致依恋】' },
      { title: '单独将嫂子拉到一旁追问哥哥失踪前的细节', desc: '支开年幼的侄女，与成熟人妻在私密角落低语探寻真相【私密独处: 制造二人密谋氛围，瓦解长幼防线】' },
      { title: '严肃立下借宿期间的起居规矩与收留条件', desc: '居高临下提出同居期间的分工与权责，以理性契约掌控生活节奏【威严立约: 确立一家之主威信，让母女习惯顺从】' }
    ]
  },
  {
    keywords: ['嫂子', '若宁', '侄女', '沙发', '更衣', 'T恤', '睡衣', '短裤', '同居', '借宿'],
    branches: [
      { title: '端来两碗热气腾腾的热汤面递到母女手中', desc: '用最温暖的生活烟火气抚平惊惶，看着两人狼吞虎咽的动人模样【暖心攻防: 瓦解客气伪装，融化内心的最后防备】' },
      { title: '打趣换上自己宽大白T恤后曲线毕露的嫂子', desc: '看着嫂子不着寸缕仅罩着自己宽大T恤的饱满丰臀，坏笑着调侃【挑动春心: 制造居家暧昧，让其意识到春光已然失守】' },
      { title: '伸手捏了捏一旁爱挑衅使坏的侄女周若宁脸颊', desc: '逗弄这位刚满18岁、爱使坏的雌小鬼侄女，敲打其不可越界的嚣张气焰【逗弄小鬼: 掌握主动节奏，建立独特的叔侄暧昧】' }
    ]
  }
];

// ☣️ 《末世求生录》主题分支库
const APOCALYPSE_SURVIVAL_SEMANTIC_GROUPS: SemanticActionGroup[] = [
  {
    keywords: ['水', '喝水', '口渴', '饼干', '食物', '饿', '干渴', '物资', '压缩饼干', '抗生素'],
    branches: [
      { title: '拧开瓶盖倒出一小盅清水放在脚边命令其饮用', desc: '用珍贵的水源施压，命令高傲的昔日校花跪地俯首接受恩赐【绝境调教: 用生存必需品击碎自尊，确立绝对从属】' },
      { title: '掰下半块军用高能压缩饼干慢慢喂到她干裂嘴边', desc: '指尖捏着高热量饼干轻触其唇瓣，看着她贪婪小口吞咽的顺从姿态【温柔驯养: 施以微小恩惠，唤起对生存救世主的依赖】' },
      { title: '把水壶递给她并明确告知每一口水的代价', desc: '残酷挑明废土交易法则，让其亲口承诺用肉体与服务偿还所有物资【等价交换: 剥除幻想，建立残酷而稳定的生存契约】' }
    ]
  },
  {
    keywords: ['枪', '门', '防爆门', '安全屋', '防空洞', '丧尸', '酸雨', '辐射', '危险', '检疫', '感染'],
    branches: [
      { title: '举枪冷酷命令她举起双手褪下衣物接受感染排查', desc: '以防爆防疫为铁律，命令其在白炽灯下脱光衣物仔细核查每一处抓伤【严苛检疫: 杜绝致命威胁，顺理成章阅尽完美肉体】' },
      { title: '反锁合金防爆大门彻底隔绝外界的一切丧尸低吼', desc: '当着她的面锁死安全屋，让她彻底意识到此刻唯一的生路只有屈从【封死退路: 营造绝对孤岛心理，摧毁任何反抗幻想】' },
      { title: '擦拭着枪械冷眼审视其在地上发抖的狼狈姿态', desc: '在冰冷的机械声与火药味中保持绝对威压，以静制动观察其崩溃极点【心理施压: 展现铁血力量，让其在恐惧中彻底臣服】' }
    ]
  },
  {
    keywords: ['跪', '屈服', '衣服', '扯破', '锁骨', '床上', '占有', '臣服', '身体', '求饶'],
    branches: [
      { title: '粗暴挑起她白皙下巴命令她宣誓成为私人资产', desc: '大手扣住其娇嫩面颊，逼其亲口承认放弃昔日名媛身份甘为奴仆【精神征服: 彻底碾碎文明阶级，烙下终身私有印记】' },
      { title: '一把扯掉她残破的衣物将其按在弹药箱上占有', desc: '在冰冷的军火物资旁粗暴行使领主初夜特权，彻底剥夺其贞操【肉体霸占: 用原始野蛮的力量宣告领地与女人的所有权】' },
      { title: '事后赏赐一套干燥保暖的军用风衣披在她身上', desc: '在占有之后施以庇护的温暖，让这个孤立无援的女人获得归宿感【胡萝卜大棒: 恩威并施，将其牢牢栓在安全屋身侧】' }
    ]
  }
];

const GENERIC_ACTION_POOLS: Branch[] = [
  { tag: 'A', title: '顺势深入掌控当下主动局面', desc: '抓住对方话语与微表情中的动摇瞬间，步步紧逼占据绝对心理主动' },
  { tag: 'B', title: '转换谈话节奏轻声耳语试探', desc: '打破当下的沉默与僵局，用柔和又带着压迫感的话语探寻其真实心意' },
  { tag: 'C', title: '以退为进拉开距离静观其变', desc: '稍稍拉开身体距离，暗中观察对方在失去依托后的失落与慌乱反应' },
  { tag: 'D', title: '做出出人意料的大胆亲昵举动', desc: '打破既定推演轨迹，采取出其不意的反制举动彻底改写当下的暧昧局势' },
  { tag: 'A', title: '直视对方双眼挑明隐秘关系', desc: '不再兜圈子，直视对方双眼直接抛出最核心的私密情感诉求' },
  { tag: 'B', title: '关上房门营造私密二人独处', desc: '顺手反锁房门阻隔外界声响，营造更加私密窒息的二人独处气场' },
  { tag: 'C', title: '反客为主提出不可拒绝的新条件', desc: '化被动为主动，提出让对方不得不顺从接受的交互条件或契约规则' },
  { tag: 'D', title: '给出温柔而令人心安的坚定承诺', desc: '用最真诚的眼神和低语抚平对方心底所有的顾虑、羞耻与惶恐' },
  { tag: 'A', title: '在对方防备松懈瞬间果断反制', desc: '在对方心防最薄弱的刹那果断采取行动，一举夺取关键的绝对掌控权' },
  { tag: 'B', title: '拉长无声沉默制造深层心理施压', desc: '一言不发地注视着对方，用无声的深情凝视促使对方率先妥协交底' },
  { tag: 'C', title: '适度展露善意体贴化解心防抵触', desc: '适度展现体贴入微的关怀，让紧绷的气氛稍稍缓和，以图更深层次的突破' },
  { tag: 'D', title: '留下一句引人遐想的低语转身欲走', desc: '留下一句耐人寻味的轻语作势欲走，观察对方是否会急促出声挽留' }
];

// ============================================================================
// 2. 动态故事语义推荐选项合成器 (关键词驱动 + 全局历史绝对去重)
// ============================================================================

export function generateContextualBranches(
  deckKey: string,
  storyText: string = '',
  turnIndex: number = 0,
  userAction: string = '',
  previousBranches?: Branch[],
  allHistoryBranches?: Branch[]
): Branch[] {
  // 1. 建立全局历史已用标题集合 (防止任何轮次之间出现一模一样的选项)
  const usedTitles = new Set<string>();
  if (allHistoryBranches && allHistoryBranches.length > 0) {
    allHistoryBranches.forEach((b) => {
      if (b?.title) usedTitles.add(b.title.trim());
    });
  }
  if (previousBranches && previousBranches.length > 0) {
    previousBranches.forEach((b) => {
      if (b?.title) usedTitles.add(b.title.trim());
    });
  }

  // 2. 判定剧本类型
  const isCoser = deckKey === 'deck_coser_sister';
  const isModifier = deckKey === 'deck_reality_modifier';
  const isSister =
    deckKey === 'deck_sister_truth_or_dare' ||
    deckKey === '6ffc2ab9-2907-4304-b0bb-53c0a950b445';
  const isFatherDaughter =
    deckKey === 'deck_father_daughter_jealousy' ||
    deckKey === '1f97a5c2-3e5b-48e2-aa3a-893a9332765c';

  const isRentApartment =
    deckKey === 'deck_rent_apartment' ||
    deckKey === '1134c46b-04e5-4107-b68d-b24a479650fe';
  const isNudeHousekeeping =
    deckKey === 'deck_nude_housekeeping' ||
    deckKey === '239451db-b3db-48ff-9849-836c928fc402';
  const isCousinStay =
    deckKey === 'deck_cousin_stay' ||
    deckKey === '433116bf-627e-441b-9add-cb99a3ee0349';
  const isFriendSister =
    deckKey === 'deck_friend_sister' ||
    deckKey === '9ba0424a-3278-4fae-b8ea-4fb4d00e2d90';
  const isJiangshiAyane =
    deckKey === 'deck_jiangshi_childhood' ||
    deckKey === '722f860e-1011-4123-bc92-8373fa38deca';
  const isAtour =
    deckKey === 'deck_atour_app' ||
    deckKey.includes('1ad4e5fd') ||
    deckKey.includes('atour');
  const isHeisiDaughter =
    deckKey === 'deck_heisi_daughter' ||
    deckKey.includes('c78de7d8') ||
    deckKey.includes('heisi');
  const isSisterInLawNiece =
    deckKey === 'deck_sister_in_law_niece' ||
    deckKey.includes('432a57e9') ||
    deckKey.includes('sister_in_law');
  const isApocalypse =
    deckKey === 'deck_apocalypse_survival' ||
    deckKey.includes('059217c9') ||
    deckKey.includes('apocalypse');

  let semanticGroups: SemanticActionGroup[] = [];
  if (isCoser) semanticGroups = COSER_SEMANTIC_GROUPS;
  else if (isModifier) semanticGroups = MODIFIER_SEMANTIC_GROUPS;
  else if (isSister) semanticGroups = SISTER_SEMANTIC_GROUPS;
  else if (isFatherDaughter) semanticGroups = FATHER_DAUGHTER_SEMANTIC_GROUPS;
  else if (isRentApartment) semanticGroups = RENT_APARTMENT_SEMANTIC_GROUPS;
  else if (isNudeHousekeeping) semanticGroups = NUDE_HOUSEKEEPING_SEMANTIC_GROUPS;
  else if (isCousinStay) semanticGroups = COUSIN_STAY_SEMANTIC_GROUPS;
  else if (isFriendSister) semanticGroups = FRIEND_SISTER_SEMANTIC_GROUPS;
  else if (isJiangshiAyane) semanticGroups = JIANGSHI_AYANE_SEMANTIC_GROUPS;
  else if (isAtour) semanticGroups = ATOUR_SEMANTIC_GROUPS;
  else if (isHeisiDaughter) semanticGroups = HEISI_DAUGHTER_SEMANTIC_GROUPS;
  else if (isSisterInLawNiece) semanticGroups = SISTER_IN_LAW_NIECE_SEMANTIC_GROUPS;
  else if (isApocalypse) semanticGroups = APOCALYPSE_SURVIVAL_SEMANTIC_GROUPS;

  const combinedContext = (storyText + ' ' + userAction).toLowerCase();

  // 3. 收集契合当前故事情境的候选分支 (优先关键词语义匹配)
  const matchedCandidates: Array<{ title: string; desc: string }> = [];
  const secondaryCandidates: Array<{ title: string; desc: string }> = [];

  for (const group of semanticGroups) {
    const isMatched = group.keywords.some((kw) => combinedContext.includes(kw.toLowerCase()));
    for (const b of group.branches) {
      if (!usedTitles.has(b.title.trim())) {
        if (isMatched) {
          matchedCandidates.push(b);
        } else {
          secondaryCandidates.push(b);
        }
      }
    }
  }

  // 伪随机数发生器（基于剧本、轮次与故事内容哈希种子，确保相同情境下渲染结果绝对稳定，不会随打字输入跳动）
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const seed = getHash(`${deckKey}_${turnIndex}_${(storyText || '').slice(0, 100)}`);
  let prngState = seed || 1234567;
  const pseudoRandom = () => {
    prngState = (prngState * 1664525 + 1013904223) % 4294967296;
    return prngState / 4294967296;
  };

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const selectedList: Array<{ title: string; desc: string }> = [];
  const shuffledMatched = shuffle(matchedCandidates);
  const shuffledSecondary = shuffle(secondaryCandidates);

  // 优先填充语义高匹配分支
  for (const item of shuffledMatched) {
    if (selectedList.length >= 4) break;
    selectedList.push(item);
    usedTitles.add(item.title.trim());
  }

  // 若不足4个，用该剧本未使用的其他分支补充
  for (const item of shuffledSecondary) {
    if (selectedList.length >= 4) break;
    selectedList.push(item);
    usedTitles.add(item.title.trim());
  }

  // 若仍不足4个，用通用推演分支补充
  if (selectedList.length < 4) {
    const shuffledGeneric = shuffle(GENERIC_ACTION_POOLS);
    for (const item of shuffledGeneric) {
      if (selectedList.length >= 4) break;
      if (!usedTitles.has(item.title.trim())) {
        selectedList.push({ title: item.title, desc: item.desc || item.title });
        usedTitles.add(item.title.trim());
      }
    }
  }

  // 如果依然凑不齐（极长对话导致库耗尽），加入轮次动态修饰后缀保证不重复
  let padIndex = 1;
  while (selectedList.length < 4) {
    const fallbackItem = GENERIC_ACTION_POOLS[padIndex % GENERIC_ACTION_POOLS.length];
    const uniqueTitle = `${fallbackItem.title} · 变奏${padIndex}`;
    if (!usedTitles.has(uniqueTitle)) {
      selectedList.push({ title: uniqueTitle, desc: fallbackItem.desc || fallbackItem.title });
      usedTitles.add(uniqueTitle);
    }
    padIndex++;
  }

  // 统一分配 A, B, C, D 标签
  const finalBranches: Branch[] = selectedList.slice(0, 4).map((item, idx) => ({
    tag: String.fromCharCode(65 + idx),
    title: item.title,
    desc: item.desc
  }));

  return finalBranches;
}

// ============================================================================
// 3. 超鲁棒大模型输出解析器 (支持风月标准规范 + 全局强去重)
// ============================================================================

export function parseModelOutput(
  rawText: string,
  deckKey: string,
  turnIndex: number,
  userAction: string = '',
  previousBranches?: Branch[],
  allHistoryBranches?: Branch[]
): Partial<Turn> {
  const turn: Partial<Turn> = {
    rawText: rawText,
    branches: []
  };

  if (!rawText || !rawText.trim()) {
    turn.story = '';
    turn.branches = generateContextualBranches(
      deckKey,
      '',
      turnIndex,
      userAction,
      previousBranches,
      allHistoryBranches
    );
    return turn;
  }

  // 0. 抽取思维链 (CoT)
  const cotMatch = rawText.match(/<details>\s*<summary>\s*思维链\s*<\/summary>([\s\S]*?)<\/details>/i);
  if (cotMatch && cotMatch[1].trim()) {
    turn.cot = cotMatch[1].replace(/<!--|-->/g, '').trim();
  }

  // 0.1 抽取顶部场景时间栏 (<tl>)
  const tlMatch = rawText.match(/<tl>([\s\S]*?)<\/tl>/i);
  if (tlMatch && tlMatch[1].trim()) {
    turn.tl = tlMatch[1].trim();
    const cleanTl = tlMatch[1].replace(/<br\s*\/?>/gi, ' | ').replace(/[\r\n]+/g, ' ').trim();
    if (cleanTl) {
      turn.location = cleanTl;
    }
  }

  // 1. 抽取 NPC 内心想法
  const thoughtMatch = rawText.match(
    /(?:(?:💡|💭)?\s*【?(?:NPC内心真实想法|知念内心真实独白|内心真实独白|NPC内心想法|内心真实想法|内心想法|内心独白|心理想法|女性内心)】?[:：\s]*)([\s\S]*?)(?=(?:📡|🚨|📊|👗|👚|💋|👑|📍|📖|📝|🎲|\[|#)?【?(?:小改改|当前服装|当前装扮|身上的修改效果|修改效果|后宫名册|本幕记忆|行动推荐|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏|兄妹羁绊)|$)/i
  );
  if (thoughtMatch && thoughtMatch[1].trim()) {
    turn.npcThought = thoughtMatch[1].trim();
  }

  // 2. 抽取小改改监控报告 (现实修改器)
  const reportMatch = rawText.match(
    /(?:(?:📡|🚨|📊)?\s*【?(?:小改改实时监控与战术报告|小改改监控报告|小改改战术报告|小改改报告|监控报告|战术报告)】?[:：\s]*)([\s\S]*?)(?=(?:👗|👚|💋|👑|📍|📖|📝|📊|🎲|\[|#)?【?(?:当前服装|身上的修改效果|修改效果|后宫名册|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏)|$)/i
  );
  if (reportMatch && reportMatch[1].trim()) {
    turn.modReport = reportMatch[1].trim();
  }

  // 3. 抽取服装状态
  const clothesMatch = rawText.match(
    /(?:(?:👗|👚)\s*【?(?:当前服装状态|当前装扮与体态|当前服装|NPC当前服装|服装状态|衣着状态)】?[:：\s]*|【(?:当前服装状态|当前装扮与体态|当前服装|NPC当前服装)】[:：\s]*)([\s\S]*?)(?=(?:💋|👑|📍|📖|📝|📊|🎲|💡|\[|#)?【?(?:身上的修改效果|修改效果|因果律效果|因果律覆写|后宫名册|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏|知念内心|NPC内心)|$)/i
  );
  if (clothesMatch && clothesMatch[1].trim()) {
    turn.npcClothes = clothesMatch[1].trim();
  }

  // 4. 抽取修改效果
  const effectMatch = rawText.match(
    /(?:【?(?:身上的修改效果|修改效果|因果律效果|因果律覆写)】?[:：\s]*)([\s\S]*?)(?=(?:💋|👑|📍|📖|📝|📊|🎲|\[|#)?【?(?:后宫名册|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏)|$)/i
  );
  if (effectMatch && effectMatch[1].trim()) {
    turn.modifyEffect = effectMatch[1].trim();
  }

  // 5. 抽取场景与时间状态
  const sceneMatch = rawText.match(
    /(?:📍|\[)?【?(?:场景与时间状态|场景状态|环境状态)】?\]?[:：\s]*([\s\S]*?)(?=(?:📖|\[)?【?(?:正文描写|正文|剧情正文)】?\]?)/i
  );
  if (sceneMatch && sceneMatch[1].trim()) {
    turn.location = sceneMatch[1].trim();
  }

  // 6. 抽取记忆区
  const memMatch = rawText.match(
    /(?:📝|\[)?【?(?:记忆区|关键记忆|记忆|本幕记忆沉淀|本幕记忆)】?\]?[:：\s]*([\s\S]*?)(?=(?:📊|\[)?【?(?:实时物理状态栏|物理状态栏|状态栏|行动分支选项|推荐互动抉择|兄妹羁绊)|$)/i
  );
  if (memMatch && memMatch[1].trim()) {
    const memLines = memMatch[1]
      .split('\n')
      .map((l) => l.replace(/^[-*•\d.·\s]+/, '').trim())
      .filter(Boolean);
    if (memLines.length > 0) turn.memory = memLines;
  }

  // 7. 抽取状态栏
  const statusMatch = rawText.match(
    /(?:📊|\[)?【?(?:实时物理状态栏|物理状态栏|状态栏|客厅局势与三人状态|女儿与父亲心态实时监控|兄妹羁绊与心防指数)】?\]?[:：\s]*([\s\S]*?)(?=(?:🎲|\[|#)?【?(?:行动分支选项|行动分支|分支选项|推荐互动抉择|推荐行动|下一步行动抉择)|$)/i
  );
  if (statusMatch && statusMatch[1].trim()) {
    const statusBlock = statusMatch[1];
    const statusObj: TurnStatus = {};
    const clothesM = statusBlock.match(/(?:衣着状态|衣着|服装|装扮)[:：\s]*([^\n]+)/);
    const postureM = statusBlock.match(/(?:空间体位|体位|姿势|体态)[:：\s]*([^\n]+)/);
    const statsM = statusBlock.match(/(?:生理\/好感指标|好感指标|生理指标|心跳|好感\/敏感度|独占依赖度)[:：\s]*([^\n]+)/);
    const riskM = statusBlock.match(/(?:被抓危险度|危机度|危险度|暴露风险|心防)[:：\s]*([^\n]+)/);

    if (clothesM) statusObj.clothes = clothesM[1].trim();
    if (postureM) statusObj.posture = postureM[1].trim();
    if (statsM) statusObj.stats = statsM[1].trim();
    if (riskM) statusObj.risk = riskM[1].trim();

    if (Object.keys(statusObj).length > 0) {
      turn.status = statusObj;
    }
  }

  // 8. 智能提取大模型生成的推荐分支 (风月标签规范 + Markdown 列表 + 无前缀文本兜底)
  const parsedBranches: Branch[] = [];

  const parseLineToBranch = (rawLine: string): Branch | null => {
    // 移除包裹的 <d> 和 </d> 标签及 Markdown 符号
    const line = rawLine.replace(/<\/?d>/gi, '').trim();
    if (!line) return null;

    // 格式 1: A. [标题] - 描述 或 A. 标题：描述 或 A. 标题 - 描述 或 【A】 标题：描述
    const m1 = line.match(/^(?:(?:[【\[]?([A-D\d])[】\]]?)|(?:([A-D\d])))(?:[\.、:：\s\-\*]+)(?:\[(.*?)\]|【(.*?)】|\*\*(.*?)\*\*|(.*?))(?:\s*[-—–~:：\s]\s*(.*))?$/);
    if (m1) {
      const tag = (m1[1] || m1[2] || '◆').toUpperCase();
      let title = (m1[3] || m1[4] || m1[5] || m1[6] || '').replace(/\*\*/g, '').replace(/^[“"「]/, '').replace(/[”"」]$/, '').trim();
      let desc = (m1[7] || '').replace(/\*\*/g, '').replace(/^[“"「]/, '').replace(/[”"」]$/, '').trim();
      if (title && title.length >= 2 && !title.startsWith('http')) {
        if (!desc) desc = title;
        return { tag, title, desc };
      }
    }

    // 格式 2: 【标题】：“描述”
    const m2 = line.match(/^【(.*?)】[：:]*[“"「]?(.*?)[”"」]?$/);
    if (m2) {
      const title = m2[1].trim();
      const desc = m2[2].trim() || title;
      if (title.length >= 2) {
        return { tag: '◆', title, desc };
      }
    }

    // 格式 3: 纯文本动作描述 (例如风月原格式: <d>顺着黑丝边缘慢慢往上抚摸她的腿</d>)
    if (line.length >= 3 && !line.startsWith('<') && !line.startsWith('#')) {
      const splitIdx = line.search(/[-—–~:：]/);
      let title = '';
      let desc = '';
      if (splitIdx > 1 && splitIdx < 25) {
        title = line.substring(0, splitIdx).replace(/^[A-Za-z0-9\.\、\s【】\[\]\*\-]+/, '').trim();
        desc = line.substring(splitIdx + 1).trim();
      } else {
        title = line.length > 18 ? line.slice(0, 16) + '...' : line;
        desc = line;
      }
      if (title && title.length >= 2) {
        return { tag: '◆', title, desc };
      }
    }

    return null;
  };

  // 优先级 A: 匹配风月标准规范的 <opt><suggested_questions> 或 <suggested_questions> 或 <options> 标签（即便末尾被轻微截断亦可鲁棒提取）
  const sqMatch = rawText.match(/(?:<opt>)?\s*<suggested_questions>([\s\S]*?)(?:<\/suggested_questions>|<\/opt>|$)/i);
  if (sqMatch && sqMatch[1].trim()) {
    const dMatches = sqMatch[1].match(/<d>([\s\S]*?)(?:<\/d>|$)/gi);
    if (dMatches && dMatches.length > 0) {
      for (const dLine of dMatches) {
        const b = parseLineToBranch(dLine);
        if (b) {
          if (b.tag === '◆') b.tag = String.fromCharCode(65 + parsedBranches.length);
          parsedBranches.push(b);
        }
      }
    } else {
      const sqLines = sqMatch[1].split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of sqLines) {
        const b = parseLineToBranch(line);
        if (b) {
          if (b.tag === '◆') b.tag = String.fromCharCode(65 + parsedBranches.length);
          parsedBranches.push(b);
        }
      }
    }
  }

  // 优先级 B: 匹配 Markdown 标头结构，如 【推荐互动抉择】、### 推荐互动、**下一步行动** 等
  if (parsedBranches.length === 0) {
    const branchHeaderRegex = /(?:🎲|🎯|💡|🎮|\*|#|-)?\s*【?(?:推荐互动抉择|行动分支选项|下一步行动抉择|推荐互动|推荐行动|下一步行动|行动抉择|行动建议|行动选项|互动选项|分支选项|建议互动选项|可选行动|建议下一步|后续剧情选择|可执行行动|推荐选项)】?\]?[:：\s]*([\s\S]*$)/i;
    const branchMatch = rawText.match(branchHeaderRegex);
    if (branchMatch && branchMatch[1].trim()) {
      const branchLines = branchMatch[1].split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of branchLines) {
        const b = parseLineToBranch(line);
        if (b) {
          if (b.tag === '◆') b.tag = String.fromCharCode(65 + parsedBranches.length);
          parsedBranches.push(b);
        }
      }
    }
  }

  // 优先级 C: 扫描正文末尾 15 行无标头的 A. B. C. D. 选项
  if (parsedBranches.length === 0) {
    const allLines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const tailLines = allLines.slice(-15);
    for (const line of tailLines) {
      if (/^[A-D\d][\.、:：\s]|^[【\[][A-D\d][】\]]/.test(line)) {
        const b = parseLineToBranch(line);
        if (b) {
          if (b.tag === '◆') b.tag = String.fromCharCode(65 + parsedBranches.length);
          parsedBranches.push(b);
        }
      }
    }
  }

  // 4. 全局去重校验与有效性决策
  const usedTitles = new Set<string>();
  if (allHistoryBranches && allHistoryBranches.length > 0) {
    allHistoryBranches.forEach((b) => {
      if (b?.title) usedTitles.add(b.title.trim());
    });
  }
  if (previousBranches && previousBranches.length > 0) {
    previousBranches.forEach((b) => {
      if (b?.title) usedTitles.add(b.title.trim());
    });
  }

  // 过滤掉与历史轮次完全重复的模型输出
  const nonDuplicateParsed = parsedBranches.filter((b) => !usedTitles.has(b.title.trim()));

  if (nonDuplicateParsed.length >= 1) {
    // 优先保留大模型实时生成的所有专属分支
    const aiBranches: Branch[] = nonDuplicateParsed.slice(0, 4).map((b, idx) => ({
      ...b,
      tag: String.fromCharCode(65 + idx)
    }));

    // 若大模型在末尾被轻微截断仅输出了 1~3 项，则仅对缺失的差额分支进行智能补齐，绝不舍弃 AI 生成的任何专属灵感
    if (aiBranches.length < 4) {
      const fallbackBranches = generateContextualBranches(
        deckKey,
        rawText,
        turnIndex,
        userAction,
        aiBranches,
        allHistoryBranches
      );
      for (const fb of fallbackBranches) {
        if (aiBranches.length >= 4) break;
        if (!aiBranches.some((b) => b.title.trim() === fb.title.trim())) {
          aiBranches.push({
            ...fb,
            tag: String.fromCharCode(65 + aiBranches.length)
          });
        }
      }
    }
    turn.branches = aiBranches;
  } else {
    // 若模型未输出分支或与历史严重重复，启用高沉浸语义动态合成器
    turn.branches = generateContextualBranches(
      deckKey,
      rawText,
      turnIndex,
      userAction,
      previousBranches,
      allHistoryBranches
    );
  }

  // 9. 纯净化小说正文抽取（支持风月 <article> 标准容器与结构标签剔除）
  let cleanStory = rawText;
  const articleMatch = rawText.match(/<article>([\s\S]*?)<\/article>/i);
  if (articleMatch && articleMatch[1].trim()) {
    cleanStory = articleMatch[1].trim();
  } else {
    const storyMatch = rawText.match(
      /(?:📖|\[)?【?(?:正文描写|正文|剧情正文)】?\]?[:：\s]*([\s\S]*?)(?=(?:📝|📊|🎲|💡|📡|👗|👚|💋|\[|#|<details|<opt)?【?(?:记忆区|关键记忆|记忆|实时物理状态栏|行动分支选项|推荐互动抉择|NPC内心|知念内心|小改改|当前服装)|$)/i
    );
    if (storyMatch && storyMatch[1].trim()) {
      cleanStory = storyMatch[1].trim();
    } else {
      const splitIdx = rawText.search(
        /(?:📝|📊|🎲|💡|📡|👗|👚|💋|\[|#)?【?(?:记忆区|关键记忆|实时物理状态栏|行动分支选项|推荐互动抉择|推荐互动|下一步行动|NPC内心真实想法|知念内心真实独白|小改改实时监控|当前服装状态|兄妹羁绊)|<details\s*>\s*<summary>\s*(?:玩家状态|角色档案|当前互动|星记忆回廊|<opt)/i
      );
      if (splitIdx !== -1) {
        cleanStory = rawText.substring(0, splitIdx);
      }
      cleanStory = cleanStory.replace(/(?:📍|\[)?【?(?:场景与时间状态|场景状态)】?\]?[:：\s]*.*?\n/g, '').trim();
    }
  }

  turn.story = cleanStory || rawText.trim();

  return turn;
}