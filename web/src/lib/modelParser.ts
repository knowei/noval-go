import { Turn, Branch, TurnStatus } from './types';

/**
 * Intelligent context-aware branch options generator for specific scenarios.
 * Ensures users always see vivid, relevant roleplay branches instead of generic placeholders.
 */
export function generateContextualBranches(
  deckKey: string,
  storyText: string,
  turnIndex: number,
  userAction: string = ''
): Branch[] {
  const isCoser = deckKey === 'deck_coser_sister';
  const isModifier = deckKey === 'deck_reality_modifier';
  const isSister =
    deckKey === 'deck_sister_truth_or_dare' ||
    deckKey === '6ffc2ab9-2907-4304-b0bb-53c0a950b445';
  const isFatherDaughter =
    deckKey === 'deck_father_daughter_jealousy' ||
    deckKey === '1f97a5c2-3e5b-48e2-aa3a-893a9332765c';

  if (isCoser) {
    if (turnIndex % 2 === 0) {
      return [
        {
          tag: 'A',
          title: '替她系好后背系带',
          desc: '走上前伸手帮知念整理后背微敞的系带，指尖不经意触碰她泛红微热的后颈'
        },
        {
          tag: 'B',
          title: '认真回应她的专属承诺',
          desc: '凝视着她慌乱躲闪的双眼：“如果我说很喜欢……你真的愿意以后只穿给我一个人看？”'
        },
        {
          tag: 'C',
          title: '拿出相机拍私人专属返图',
          desc: '拿出相机：“别换下来，我帮你拍一组专属特写，只存在我手机里的那种。”'
        },
        {
          tag: 'D',
          title: '轻揉发顶化解羞怯',
          desc: '笑着走上前揉揉她略显凌乱的发丝，称赞她今天哪怕没摆姿势也最可爱'
        }
      ];
    } else {
      return [
        {
          tag: 'A',
          title: '跨前一步拉近距离',
          desc: '看着她赌气又期待的样子，故意走近半步，低头凑到她耳边轻声评价'
        },
        {
          tag: 'B',
          title: '追问她藏在心里的秘密',
          desc: '“刚才在房间里小声嘟囔什么呢？是不是在偷偷练习怎么跟我撒娇？”'
        },
        {
          tag: 'C',
          title: '递过温热的水杯与纸巾',
          desc: '体贴地帮她擦拭眼尾没卸干净的亮粉，用最温柔的日常互动平复她的心跳'
        },
        {
          tag: 'D',
          title: '顺水推舟提出新约定',
          desc: '“既然穿给我看，那下次漫展出cos，是不是也得由我全天陪着你？”'
        }
      ];
    }
  }

  if (isModifier) {
    return [
      {
        tag: 'A',
        title: '加深现实修改与常识覆写',
        desc: '在手机APP中追加新规则，将当前场景与因果律推向更极致的服从与沉沦'
      },
      {
        tag: 'B',
        title: '指令在场目标更亲密互动',
        desc: '顺应当前升温的局势，指令女神主动靠近并做出更顺从大胆的亲昵举措'
      },
      {
        tag: 'C',
        title: '调出小改改系统监控',
        desc: '查看当前剩余修改点数，让小改改分析当前目标心防的全面崩溃进度'
      },
      {
        tag: 'D',
        title: '发动因果律召唤其他后宫',
        desc: '修改世界因果，让隔壁总监苏寒月或学妹顾小梦在关键时刻敲响房门'
      }
    ];
  }

  if (isSister) {
    return [
      {
        tag: 'A',
        title: '逼迫姐姐宋晚立即履行惩罚',
        desc: '直视脸颊通红的姐姐：“大冒险的规矩可是你定的，愿赌服输，不许耍赖~”'
      },
      {
        tag: 'B',
        title: '矛头转向煽风点火的夏绮',
        desc: '挑眉坏笑看向夏绮：“既然你笑得这么开心，不如替我姐来接受惩罚？”'
      },
      {
        tag: 'C',
        title: '试探角落害羞的林初',
        desc: '走到一直低头拽着易拉罐的林初身旁坐下，轻声耳语打趣她的羞涩反应'
      },
      {
        tag: 'D',
        title: '反向提出升级玩法',
        desc: '坐到三人中央的地毯上，提出把下一轮惩罚由自己亲自指定'
      }
    ];
  }

  if (isFatherDaughter) {
    return [
      {
        tag: 'A',
        title: '严肃质问并行使家长威权',
        desc: '坐在床沿直视女儿泛红的双眼，厉声追问她与同学的全部隐秘细节'
      },
      {
        tag: 'B',
        title: '当面检查手机私密记录',
        desc: '勒令女儿交出手机，逐条核对聊天记录，当面勒令其断绝往来'
      },
      {
        tag: 'C',
        title: '收敛怒气以爱意温柔诱导',
        desc: '轻抚女儿紧绷颤抖的肩头：“爸爸只是太在乎你，过来坐到爸爸怀里”'
      },
      {
        tag: 'D',
        title: '勒令今晚贴身反省惩戒',
        desc: '反锁卧室房门：“小小年纪不学好，罚你今晚留在我房间好好反省”'
      }
    ];
  }

  // Generic fallback with realistic dramatic branches
  return [
    {
      tag: 'A',
      title: '顺势深入掌控主动',
      desc: '抓住对方话语与微表情中的动摇瞬间，步步紧逼占据心理主动'
    },
    {
      tag: 'B',
      title: '转换节奏轻声试探',
      desc: '打破当下的沉默与僵局，用柔和又带着压迫感的话语探寻其真实心意'
    },
    {
      tag: 'C',
      title: '以退为进静观其变',
      desc: '稍稍拉开距离，暗中观察对方在失去支撑后的失落与慌乱反应'
    },
    {
      tag: 'D',
      title: '做出出人意料的果断举动',
      desc: '打破既定推演轨迹，采取大胆反制的举动彻底改写当下的局势'
    }
  ];
}

/**
 * Robust parser for AI responses:
 * Extracts clean narrative story, branches, memory, status, NPC thoughts, mod reports, etc.
 */
export function parseModelOutput(
  rawText: string,
  deckKey: string,
  turnIndex: number,
  userAction: string = ''
): Partial<Turn> {
  const turn: Partial<Turn> = {
    rawText: rawText,
    branches: []
  };

  if (!rawText || !rawText.trim()) {
    turn.story = '';
    turn.branches = generateContextualBranches(deckKey, '', turnIndex, userAction);
    return turn;
  }

  // 1. Extract NPC Inner Thought
  const thoughtMatch = rawText.match(
    /(?:(?:💡|💭)?\s*【?(?:NPC内心真实想法|知念内心真实独白|内心真实独白|NPC内心想法|内心真实想法|内心想法|内心独白|心理想法|女性内心)】?[:：\s]*)([\s\S]*?)(?=(?:📡|🚨|📊|👗|👚|💋|👑|📍|📖|📝|🎲|\[)?【?(?:小改改|当前服装|当前装扮|身上的修改效果|修改效果|后宫名册|本幕记忆|行动推荐|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏|兄妹羁绊)|$)/i
  );
  if (thoughtMatch && thoughtMatch[1].trim()) {
    turn.npcThought = thoughtMatch[1].trim();
  }

  // 2. Extract Mod Report (Reality Modifier)
  const reportMatch = rawText.match(
    /(?:(?:📡|🚨|📊)?\s*【?(?:小改改实时监控与战术报告|小改改监控报告|小改改战术报告|小改改报告|监控报告|战术报告)】?[:：\s]*)([\s\S]*?)(?=(?:👗|👚|💋|👑|📍|📖|📝|📊|🎲|\[)?【?(?:当前服装|身上的修改效果|修改效果|后宫名册|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏)|$)/i
  );
  if (reportMatch && reportMatch[1].trim()) {
    turn.modReport = reportMatch[1].trim();
  }

  // 3. Extract Clothes / Outfit
  const clothesMatch = rawText.match(
    /(?:(?:👗|👚)\s*【?(?:当前服装状态|当前装扮与体态|当前服装|NPC当前服装|服装状态|衣着状态)】?[:：\s]*|【(?:当前服装状态|当前装扮与体态|当前服装|NPC当前服装)】[:：\s]*)([\s\S]*?)(?=(?:💋|👑|📍|📖|📝|📊|🎲|💡|\[)?【?(?:身上的修改效果|修改效果|因果律效果|因果律覆写|后宫名册|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏|知念内心|NPC内心)|$)/i
  );
  if (clothesMatch && clothesMatch[1].trim()) {
    turn.npcClothes = clothesMatch[1].trim();
  }

  // 4. Extract Modifier Effect
  const effectMatch = rawText.match(
    /(?:【?(?:身上的修改效果|修改效果|因果律效果|因果律覆写)】?[:：\s]*)([\s\S]*?)(?=(?:💋|👑|📍|📖|📝|📊|🎲|\[)?【?(?:后宫名册|行动分支选项|推荐互动抉择|场景与时间状态|正文描写|记忆区|实时物理状态栏)|$)/i
  );
  if (effectMatch && effectMatch[1].trim()) {
    turn.modifyEffect = effectMatch[1].trim();
  }

  // 5. Extract Location
  const sceneMatch = rawText.match(
    /(?:📍|\[)?【?(?:场景与时间状态|场景状态|环境状态)】?\]?[:：\s]*([\s\S]*?)(?=(?:📖|\[)?【?(?:正文描写|正文|剧情正文)】?\]?)/i
  );
  if (sceneMatch && sceneMatch[1].trim()) {
    turn.location = sceneMatch[1].trim();
  }

  // 6. Extract Memory
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

  // 7. Extract Status
  const statusMatch = rawText.match(
    /(?:📊|\[)?【?(?:实时物理状态栏|物理状态栏|状态栏|客厅局势与三人状态|女儿与父亲心态实时监控|兄妹羁绊与心防指数)】?\]?[:：\s]*([\s\S]*?)(?=(?:🎲|\[)?【?(?:行动分支选项|行动分支|分支选项|推荐互动抉择|推荐行动|下一步行动抉择)|$)/i
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

  // 8. Extract Branches (Real Recommendations from the LLM!)
  const branchMatch = rawText.match(
    /(?:🎲|\[)?【?(?:行动分支选项|推荐互动抉择|行动分支|分支选项|推荐行动|下一步行动抉择|建议互动选项)】?\]?[:：\s]*([\s\S]*$)/i
  );

  const parsedBranches: Branch[] = [];

  if (branchMatch && branchMatch[1].trim()) {
    const branchLines = branchMatch[1].split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of branchLines) {
      const m1 = line.match(/^(?:【?([A-D\d])】?|\b([A-D\d])\b)[\.、:：\s]+(?:\*\*)?(?:\[(.*?)\]|(.*?))(?:\*\*)?(?:\s*[-—–~:：]\s*(.*))?$/);
      if (m1) {
        const tag = (m1[1] || m1[2] || '◆').toUpperCase();
        let title = (m1[3] || m1[4] || '').replace(/\*\*/g, '').replace(/^[“"「]/, '').replace(/[”"」]$/, '').trim();
        let desc = (m1[5] || '').replace(/\*\*/g, '').replace(/^[“"「]/, '').replace(/[”"」]$/, '').trim();
        if (title) {
          if (!desc) desc = title;
          parsedBranches.push({ tag, title, desc });
        }
      } else {
        const m2 = line.match(/^【(.*?)】[：:]*[“"「]?(.*?)[”"」]?$/);
        if (m2) {
          const title = m2[1].trim();
          const desc = m2[2].trim() || title;
          const tag = String.fromCharCode(65 + parsedBranches.length);
          parsedBranches.push({ tag, title, desc });
        }
      }
    }
  }

  // Also check <suggested_questions> tag if present
  if (parsedBranches.length === 0) {
    const sqMatch = rawText.match(/<suggested_questions>([\s\S]*?)<\/suggested_questions>/i);
    if (sqMatch) {
      const sqLines = sqMatch[1].split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of sqLines) {
        const m = line.match(/^【(.*?)】[：:]*[“"「]?(.*?)[”"」]?$/);
        if (m) {
          const tag = String.fromCharCode(65 + parsedBranches.length);
          parsedBranches.push({ tag, title: m[1].trim(), desc: m[2].trim() || m[1].trim() });
        }
      }
    }
  }

  // If the model produced valid branches, use them!
  if (parsedBranches.length > 0) {
    turn.branches = parsedBranches;
  } else {
    // Generate intelligent scenario-tailored contextual branches!
    turn.branches = generateContextualBranches(deckKey, rawText, turnIndex, userAction);
  }

  // 9. Extract Clean Novel Story (Strip metadata tags to keep prose pure)
  let cleanStory = rawText;
  const storyMatch = rawText.match(
    /(?:📖|\[)?【?(?:正文描写|正文|剧情正文)】?\]?[:：\s]*([\s\S]*?)(?=(?:📝|📊|🎲|💡|📡|👗|👚|💋|\[)?【?(?:记忆区|关键记忆|记忆|实时物理状态栏|行动分支选项|推荐互动抉择|NPC内心|知念内心|小改改|当前服装)|$)/i
  );
  if (storyMatch && storyMatch[1].trim()) {
    cleanStory = storyMatch[1].trim();
  } else {
    const splitIdx = rawText.search(
      /(?:📝|📊|🎲|💡|📡|👗|👚|💋|\[)?【?(?:记忆区|关键记忆|实时物理状态栏|行动分支选项|推荐互动抉择|NPC内心真实想法|知念内心真实独白|小改改实时监控|当前服装状态|兄妹羁绊)/i
    );
    if (splitIdx !== -1) {
      cleanStory = rawText.substring(0, splitIdx);
    }
    cleanStory = cleanStory.replace(/(?:📍|\[)?【?(?:场景与时间状态|场景状态)】?\]?[:：\s]*.*?\n/g, '').trim();
  }

  turn.story = cleanStory || rawText.trim();

  return turn;
}
