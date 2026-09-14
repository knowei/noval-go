import { Turn, Branch, TurnStatus } from './types';

// ============================================================================
// 1. 丰富多元的剧本情境动作库 (按轮次与情境动态轮转，杜绝千篇一律)
// ============================================================================

const COSER_ACTION_POOLS: Branch[][] = [
  // 阶段 0: 装扮与物理触碰
  [
    { tag: 'A', title: '走上前替她系好后背系带', desc: '走上前伸手帮知念整理后背微敞的系带，指尖不经意触碰她泛红微热的后颈' },
    { tag: 'B', title: '认真回应她的专属承诺', desc: '凝视着她慌乱躲闪的双眼：“如果我说很喜欢……你真的愿意以后只穿给我一个人看？”' },
    { tag: 'C', title: '拿出相机拍私人专属返图', desc: '拿出相机：“别换下来，我帮你拍一组专属特写，只存在我手机里的那种。”' },
    { tag: 'D', title: '轻揉发顶化解羞怯', desc: '笑着走上前揉揉她略显凌乱的发丝，称赞她今天哪怕没摆姿势也最可爱' }
  ],
  // 阶段 1: 试探与言语调侃
  [
    { tag: 'A', title: '跨前一步低语质问', desc: '故意凑近她耳边：“刚才在房间里小声嘟囔什么呢？是不是在偷偷练习怎么跟我撒娇？”' },
    { tag: 'B', title: '夸赞她的洛丽塔反差', desc: '“网上几千个粉丝夸你，都不如我夸一句对不对？小笨蛋，耳朵都红透了。”' },
    { tag: 'C', title: '体贴递过湿纸巾卸妆', desc: '用温热的湿巾轻轻替她擦拭眼尾残留的亮粉，近距离注视她微促轻颤的睫毛' },
    { tag: 'D', title: '约定漫展独占陪同', desc: '“既然只穿给我看，那下次去漫展，全程都得乖乖跟在我身边寸步不离。”' }
  ],
  // 阶段 2: 深入独处与情感羁绊
  [
    { tag: 'A', title: '拉着她的手坐到床沿', desc: '牵起她微凉的小手坐到更衣镜旁的床沿，语气认真地问她是不是有心事' },
    { tag: 'B', title: '提出换下一套私密装扮', desc: '指着衣柜里挂着的另一套女仆装：“既然要试，不如把那套我也一直想看的换上？”' },
    { tag: 'C', title: '用零食与夜宵安抚赌气', desc: '“好啦不逗你了，去洗个手，我给你做了你最喜欢的水蜜桃果冻和夜宵。”' },
    { tag: 'D', title: '给她一个安心的拥抱', desc: '伸手轻轻环住少女略显单薄的肩膀，打破兄妹之间最后一丝羞于言说的隔阂' }
  ],
  // 阶段 3: 情绪升温与双轨心动
  [
    { tag: 'A', title: '直视镜子里的两个人', desc: '站在她身后一同望向落地镜：“你看，镜子里我们俩站在一起，多像一对真的恋人。”' },
    { tag: 'B', title: '拿走她揪住裙摆的手', desc: '握住她紧张得发白的小手，拇指轻轻摩挲她的手背，让她不要再回避对视' },
    { tag: 'C', title: '低声允诺今晚陪她', desc: '“今晚不敲代码了，留在你房间陪你看新番，你想看多久都行。”' },
    { tag: 'D', title: '故意拉开一点距离试探', desc: '假装转身要离开房间，看她会不会着急伸手拉住自己的衣角' }
  ]
];

const MODIFIER_ACTION_POOLS: Branch[][] = [
  // 阶段 0: 初始建立常识覆写
  [
    { tag: 'A', title: '加深现实修改与常识覆写', desc: '在手机APP追加因果律规则，将对方潜意识认定当前亲昵接触完全合乎常理' },
    { tag: 'B', title: '指令在场女神主动靠近', desc: '顺应当前升温局势，指令对方主动走上前来，做出更加顺从大胆的亲昵举措' },
    { tag: 'C', title: '调出小改改系统战术监控', desc: '查看当前剩余修改点数，让小改改实时扫描在场目标的羞耻崩溃度与心防指标' },
    { tag: 'D', title: '发动因果律召唤其他后宫', desc: '修改现实因果律，让隔壁成熟总监苏寒月或清纯学妹顾小梦在关键时刻敲门' }
  ],
  // 阶段 1: 肢体接触与因果深化
  [
    { tag: 'A', title: '行使支配特权解除抗拒', desc: '覆写身体感知，让对方的每一次触碰与呼吸都伴随着数倍放大的快感与依恋' },
    { tag: 'B', title: '拉到沙发上近距离审问', desc: '以邻居/学长身份要求对方坐到身边，近距离审视她被常识覆写后的迷离神态' },
    { tag: 'C', title: '修改自身外貌魅力参数', desc: '直接将自身的男性荷尔蒙与吸引力调至神级，让目标产生无法自拔的崇拜迷恋' },
    { tag: 'D', title: '下达专属私密服务指令', desc: '输入指令，让对方将为主角提供贴身照料视作唯一天职与莫大荣幸' }
  ],
  // 阶段 2: 深入掌控与多女主修罗场
  [
    { tag: 'A', title: '启动时间暂停特权整蛊', desc: '按下时停按键，在静止的时空里从容端详女神凝固在半空的羞耻神态与体态' },
    { tag: 'B', title: '设定双人争宠因果律', desc: '修改规则让在场的苏婉清与顾小梦产生强烈的互妒占有欲，争相讨好主角' },
    { tag: 'C', title: '彻底破除最后一丝遮羞布', desc: '让小改改锁定常识清零状态，引导对方自愿褪去多余束缚展现最本真的顺从' },
    { tag: 'D', title: '建立长效后宫契约印记', desc: '将当前关系永久固化为专属契约后宫，永不衰退且自动免疫外界怀疑' }
  ],
  // 阶段 3: 极致欢愉与绝对主宰
  [
    { tag: 'A', title: '顺应高潮局势深入推演', desc: '不再克制因果律输出，与目标深入探索都市极乐体验的下一篇章' },
    { tag: 'B', title: '温柔耳语击溃最后防线', desc: '拥住她敏感颤抖的身躯，用温柔的低语给予其在绝对支配下的深层安心感' },
    { tag: 'C', title: '切换至职场总监苏寒月线', desc: '指令冷艳女总监今晚以考评为由主动带着红酒来到公寓单独汇报' },
    { tag: 'D', title: '清算并回满每日修改点数', desc: '让小改改兑现本幕攻略成就奖励，解锁更高阶的空间与物质重构特权' }
  ]
];

const SISTER_ACTION_POOLS: Branch[][] = [
  [
    { tag: 'A', title: '逼迫姐姐宋晚立即履行惩罚', desc: '直视脸颊通红的姐姐：“大冒险的规矩可是你定的，愿赌服输，不许耍赖~”' },
    { tag: 'B', title: '矛头转向煽风点火的夏绮', desc: '挑眉坏笑看向夏绮：“既然你笑得这么开心，不如替我姐来接受惩罚？”' },
    { tag: 'C', title: '试探角落害羞的林初', desc: '走到一直低头拽着易拉罐的林初身旁坐下，轻声耳语打趣她的羞涩反应' },
    { tag: 'D', title: '反向提出升级大冒险玩法', desc: '坐到三人中央的地毯上，提出把下一轮大冒险由自己亲自指定惩罚目标' }
  ],
  [
    { tag: 'A', title: '拍拍身侧沙发勒令坐近', desc: '“既然要受罚，离那么远怎么算？宋晚，坐到我旁边来当面回答。”' },
    { tag: 'B', title: '抓住夏绮递酒的手不放', desc: '接过易拉罐时故意握住夏绮温热纤细的手指，看这位平日大胆的闺蜜如何脸红' },
    { tag: 'C', title: '替林初化解尴尬以退为进', desc: '主动递过纸巾帮林初擦拭洒出的啤酒：“初初脸皮薄，你们别总拿她开玩笑。”' },
    { tag: 'D', title: '假意起身回房欲擒故纵', desc: '站起身作势要回卧室关门：“看来你们不敢玩真的，那我回去打游戏了。”' }
  ],
  [
    { tag: 'A', title: '直接提出真心话最致命问题', desc: '“真心话：你们三个谁在心里偷偷幻想过我？限时五秒必须说实话。”' },
    { tag: 'B', title: '提出三人同受惩罚新局', desc: '“既然是一个宿舍的好闺蜜，不如愿赌服输，三个人一起接受大冒险惩罚？”' },
    { tag: 'C', title: '靠在姐姐肩头温热耳语', desc: '借着客厅微醺昏暗的灯光，附在宋晚耳边问她今晚是不是故意找借口叫自己出来' },
    { tag: 'D', title: '开启下半场客厅真心话决战', desc: '把空酒瓶放在地毯正中央：“转到谁算谁，谁也不准借酒装醉耍赖。”' }
  ]
];

const FATHER_DAUGHTER_ACTION_POOLS: Branch[][] = [
  [
    { tag: 'A', title: '严肃质问并行使家长威权', desc: '坐在床沿直视女儿泛红的双眼，厉声追问她与同学的全部隐秘细节' },
    { tag: 'B', title: '当面检查手机私密记录', desc: '勒令女儿交出手机，逐条核对聊天记录，当面勒令其断绝往来' },
    { tag: 'C', title: '收敛怒气以爱意温柔诱导', desc: '轻抚女儿紧绷颤抖的肩头：“爸爸只是太在乎你，过来坐到爸爸怀里”' },
    { tag: 'D', title: '勒令今晚贴身反省惩戒', desc: '反锁卧室房门：“小小年纪不学好，罚你今晚留在我房间好好反省”' }
  ],
  [
    { tag: 'A', title: '厉声勒令交出卧室钥匙', desc: '“以后不准反锁房门，写作业必须在客厅我能看得到的地方进行。”' },
    { tag: 'B', title: '拉近距离审视慌乱神态', desc: '握住她纤细的手腕，逼近她的面庞，不放过她眼中闪烁的任何一丝心虚' },
    { tag: 'C', title: '替女儿擦拭眼角的泪水', desc: '语气放缓替她理好凌乱的睡衣领口：“别哭了，知道自己错在哪了吗？”' },
    { tag: 'D', title: '当面拨通男同学电话问罪', desc: '拿起女儿手机当着她的面回拨过去，勒令对方以后远离自己的女儿' }
  ],
  [
    { tag: 'A', title: '要求女儿做出绝对顺从承诺', desc: '“想让我不生气？那你以后必须保证什么事情都第一个告诉我，能做到吗？”' },
    { tag: 'B', title: '坐在书桌前进行深刻谈话', desc: '拉开椅子坐下，让她站在面前，逐条清算最近逃课与早恋的全部经过' },
    { tag: 'C', title: '假意离开发动心理战', desc: '叹了口气转身走向房门：“我对你太失望了”，看女儿是否会慌乱挽留' },
    { tag: 'D', title: '行使家庭宵禁贴身规训', desc: '宣布没收全部电子设备，今晚就在身边寸步不离完成检讨' }
  ]
];

const GENERIC_ACTION_POOLS: Branch[][] = [
  [
    { tag: 'A', title: '顺势深入掌控主动', desc: '抓住对方话语与微表情中的动摇瞬间，步步紧逼占据心理主动' },
    { tag: 'B', title: '转换节奏轻声试探', desc: '打破当下的沉默与僵局，用柔和又带着压迫感的话语探寻其真实心意' },
    { tag: 'C', title: '以退为进静观其变', desc: '稍稍拉开距离，暗中观察对方在失去支撑后的失落与慌乱反应' },
    { tag: 'D', title: '做出出人意料的果断举动', desc: '打破既定推演轨迹，采取大胆反制的举动彻底改写当下的局势' }
  ],
  [
    { tag: 'A', title: '打破暧昧挑明关系', desc: '不再兜圈子，直视对方双眼直接抛出最核心的利害或情感诉求' },
    { tag: 'B', title: '利用周围环境制造独处', desc: '关上房门阻隔外界声响，营造更加私密窒息的二人独处气场' },
    { tag: 'C', title: '反客为主设下全新条件', desc: '化被动为主动，提出让对方不得不接受的交换条件或博弈规则' },
    { tag: 'D', title: '给出温柔而坚定的承诺', desc: '用最真诚的眼神和低语抚平对方心底所有的顾虑与惶恐' }
  ],
  [
    { tag: 'A', title: '果断出手反制防线', desc: '在对方防备最松懈的刹那果断行动，一举夺取关键的主导地位' },
    { tag: 'B', title: '拉长沉默制造心理施压', desc: '一言不发地注视着对方，用无声的压迫感促使对方率先妥协交底' },
    { tag: 'C', title: '出言安抚化解敌意', desc: '适度展露善意与体贴，让紧绷的气氛稍稍缓和，以图长远突破' },
    { tag: 'D', title: '抛出悬念转身试探', desc: '留下一句引人遐想的话语作势欲走，观察对方是否会主动出声挽留' }
  ]
];

// ============================================================================
// 2. 动态情境推荐选项生成器（防重复机制）
// ============================================================================

export function generateContextualBranches(
  deckKey: string,
  storyText: string,
  turnIndex: number,
  userAction: string = '',
  previousBranches?: Branch[]
): Branch[] {
  const isCoser = deckKey === 'deck_coser_sister';
  const isModifier = deckKey === 'deck_reality_modifier';
  const isSister =
    deckKey === 'deck_sister_truth_or_dare' ||
    deckKey === '6ffc2ab9-2907-4304-b0bb-53c0a950b445';
  const isFatherDaughter =
    deckKey === 'deck_father_daughter_jealousy' ||
    deckKey === '1f97a5c2-3e5b-48e2-aa3a-893a9332765c';

  let pools: Branch[][] = GENERIC_ACTION_POOLS;
  if (isCoser) pools = COSER_ACTION_POOLS;
  else if (isModifier) pools = MODIFIER_ACTION_POOLS;
  else if (isSister) pools = SISTER_ACTION_POOLS;
  else if (isFatherDaughter) pools = FATHER_DAUGHTER_ACTION_POOLS;

  // 根据当前轮次动态循环选择候选池
  const poolIndex = turnIndex % pools.length;
  let selectedBranches = pools[poolIndex];

  // 严格防重：如果选中的分支与上一轮有相同标题，切换到下一候选池
  if (previousBranches && previousBranches.length > 0) {
    const prevTitles = new Set(previousBranches.map((b) => b.title.trim()));
    const hasOverlap = selectedBranches.some((b) => prevTitles.has(b.title.trim()));
    if (hasOverlap) {
      const altIndex = (poolIndex + 1) % pools.length;
      selectedBranches = pools[altIndex];
    }
  }

  return selectedBranches;
}

// ============================================================================
// 3. 超鲁棒大模型输出解析器（全方位提取正文、推荐分支、状态机与心防）
// ============================================================================

export function parseModelOutput(
  rawText: string,
  deckKey: string,
  turnIndex: number,
  userAction: string = '',
  previousBranches?: Branch[]
): Partial<Turn> {
  const turn: Partial<Turn> = {
    rawText: rawText,
    branches: []
  };

  if (!rawText || !rawText.trim()) {
    turn.story = '';
    turn.branches = generateContextualBranches(deckKey, '', turnIndex, userAction, previousBranches);
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

  // 8. 智能提取大模型生成的真实推荐分支
  // 匹配更广泛的标题标记，如：【推荐互动抉择】、### 推荐互动、**下一步行动** 等
  const branchHeaderRegex = /(?:🎲|🎯|💡|🎮|\*|#|-)?\s*【?(?:推荐互动抉择|行动分支选项|下一步行动抉择|推荐互动|推荐行动|下一步行动|行动抉择|行动建议|行动选项|互动选项|分支选项|建议互动选项|可选行动|建议下一步|后续剧情选择|可执行行动|推荐选项)】?\]?[:：\s]*([\s\S]*$)/i;
  const branchMatch = rawText.match(branchHeaderRegex);

  const parsedBranches: Branch[] = [];

  const parseLineToBranch = (rawLine: string): Branch | null => {
    // 移除包裹的 <d> 和 </d> 标签
    const line = rawLine.replace(/<\/?d>/gi, '').trim();
    if (!line) return null;
    // 匹配格式 1: A. [标题] - 描述 或 A. 标题：描述 或 A. 标题 - 描述 或 【A】 标题：描述
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
    // 匹配格式 2: 【标题】：“描述”
    const m2 = line.match(/^【(.*?)】[：:]*[“"「]?(.*?)[”"」]?$/);
    if (m2) {
      const title = m2[1].trim();
      const desc = m2[2].trim() || title;
      if (title.length >= 2) {
        return { tag: '◆', title, desc };
      }
    }
    return null;
  };

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

  // 若带标题匹配未果，尝试从文本最后 15 行无标头兜底解析 A. B. C. D. 列表
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

  // 优先支持 <suggested_questions> / <opt> 标签 (风月标准规范)
  if (parsedBranches.length === 0) {
    const sqMatch = rawText.match(/(?:<opt>)?\s*<suggested_questions>([\s\S]*?)<\/suggested_questions>\s*(?:<\/opt>)?/i);
    if (sqMatch) {
      const dMatches = sqMatch[1].match(/<d>([\s\S]*?)<\/d>/gi);
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
  }

  // 模型真实生成的有效分支使用，否则由动态情境引擎补充（杜绝轮次间完全重复）
  if (parsedBranches.length >= 2) {
    turn.branches = parsedBranches.slice(0, 4);
  } else {
    turn.branches = generateContextualBranches(deckKey, rawText, turnIndex, userAction, previousBranches);
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
