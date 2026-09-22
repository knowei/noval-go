import os
import sys
import json
import datetime
import sqlite3

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT_DIR, 'noval_data.db')
CARDS_DIR = os.path.join(ROOT_DIR, 'cards')
os.makedirs(CARDS_DIR, exist_ok=True)

def load_json(fp):
    with open(fp, 'r', encoding='utf-8') as f:
        return json.load(f)

def build_all_cards():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cards_to_import = [
        # 1. 与傲娇青梅的纯爱日常💗
        {
            "uuid": "64da8e90-9404-4a55-ae80-fe40c3a28299",
            "alias": "deck_pure_love_childhood_friend",
            "title": "与傲娇青梅的纯爱日常💗",
            "badge": "青梅竹马 · 甜宠纯爱",
            "badge_color": "#ec4899",
            "author": "AI风月精选",
            "rating": "9.9",
            "heat": "16.8k 玩过 · 1.7k 深度",
            "category": "💎 甜宠恋爱",
            "tags": ["纯爱", "青梅竹马", "傲娇", "成长陪伴", "甜宠日常", "恋爱拉扯"],
            "cover_image": "https://catai.wiki/be607a59-2b82-4374-b26b-f363b6347e00/cover",
            "cover_icon": "🌸",
            "cover_title": "青梅竹马",
            "cover_subtitle": "与傲娇青梅苏晚晴从小到大的纯爱物语",
            "logo": "🌸",
            "theme_color": "#ec4899",
            "btn_gradient": "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
            "handbook": {
                "title": "与傲娇青梅的纯爱日常💗",
                "desc": "与笨蛋傲娇青梅苏晚晴从小到大的日常生活：从幼儿园小学对我有极强占有欲的孩子王，到初中意识到感情的温柔文静，再到高中傲娇毒舌却一心一意的校花，大学患得患失占有欲爆棚的知性少女。这是一段纯粹的纯爱故事，没有背叛与出轨，步步走向专属幸福。",
                "bg_image": "https://catai.wiki/639e4482-7a6e-4fa7-1647-807a51344000/bg",
                "opening_options": [
                    "【高中校花·放学等候】：“背着单肩书包在校门口梧桐树下等你，气鼓鼓地塞给你一盒温热的红豆派：‘笨蛋，才不是特意买给你的呢！买一送一多出来的而已！’”",
                    "【大学租房·同居患得患失】：“坐在出租屋地毯上整理合照相册，抬头咬着下唇望向你：‘喂……今天联谊会上的那个学妹，你加她微信了没有？’”",
                    "【初中雨天·同撑一把伞】：“细雨蒙蒙中小心翼翼地把雨伞往你那边倾斜，自己半边肩膀被雨淋湿，耳垂通红低着头不敢看你。”",
                    "【小学霸道·孩子王保护】：“双手叉腰挡在你身前，凶巴巴地把抢你橡皮擦的男同学推开：‘你敢欺负他？他可是我罩着的！’”"
                ]
            },
            "roles": [
                {
                    "name": "苏晚晴",
                    "role": "邻居青梅竹马 (傲娇/深情/专属独占)",
                    "desc": "从小住在你家对门的邻居青梅。容貌清丽绝伦，高中时及腰长发、身材高挑窈窕，是公认的校花级女神。外表嘴硬要强，经常用毒舌掩饰害羞，实际上日记本里密密麻麻全写满了你，家里藏着装满从小到大回忆物件的宝盒。"
                },
                {
                    "name": "男主 (玩家)",
                    "role": "青梅竹马的命定唯一",
                    "desc": "与苏晚晴一起长大的邻家竹马，深知晚晴所有逞强与脆弱的小习惯，在温柔包容与坏心眼挑逗中逐步攻破傲娇心防。"
                }
            ],
            "scenes": [
                {
                    "title": "🏫 高中校门外 · 梧桐树下的红豆派",
                    "desc": "高二秋季放学时分，夕阳如金。苏晚晴站在校门侧的梧桐树阴影里，踩着落叶不耐烦地等待，手心紧紧捂着还冒着热气的红豆派。"
                },
                {
                    "title": "🏠 大学温馨合租公寓 · 深夜沙发",
                    "desc": "温馨的双人小公寓，地暖散发着融融暖意。晚晴盘腿坐在地毯上，抱着毛绒熊抱枕，偷偷斜眼打量你的手机屏幕。"
                }
            ],
            "styles": {
                "dialogue_style": "轻快细腻的青春恋爱小说风，充满生动的傲娇小动作与心理反差推拉",
                "format": "AI风月标准双栏规范及.custom-ui样式"
            },
            "first_turn": [
                {
                    "index": 1,
                    "isUser": False,
                    "scene": "🏫 高中校门外 · 梧桐树下的红豆派",
                    "story": """<tl>📅时间：高二秋季 17:35 | 🌏地点：圣华中学东门梧桐道 | 🍁天气：晴朗秋风</tl>

<article>
<p>放学的钟声回荡在校园上空，漫天梧桐黄叶在金色斜阳下打着旋儿飘落。你在校门口张望，一眼便望见了树荫下的那一抹熟悉高挑的身影。</p>

<p>苏晚晴正单脚轻踢着路牙石，海风吹拂着她乌黑柔顺的及腰长发，清冷精致的侧脸在落日余晖中仿佛发着光。那是整座高中公认不可侵犯的高岭校花，但此刻，当她的视线捕捉到你走过来的身影时，那双清亮的杏眼骤然亮了一瞬，随即又极其刻意地板起了俏脸。</p>

<p><w>“……大笨蛋！你到底在教室里磨蹭什么啊？！害本姑娘在冷风里足足吹了十五分钟！”</w></p>

<p>她踩着小皮鞋快步走上前，一把将怀里紧紧捂着的小纸袋用力塞进你的怀中。隔着薄薄的油纸，依然能感受到滚烫香甜的红豆派温度。她飞快地别过通红发烫的耳垂，假装漫不经心地哼了一声：</p>

<p><w>“别、别误会了！校门口甜品店刚好第二份半价而已，我只是不想浪费粮食才顺手买的！你要是不喜欢吃就直接扔垃圾桶好了……不准笑！再笑今天我就不让你抄数学作业了！”</w></p>
</article>

<opt>
<suggested_questions>
<d>A. 【轻捏耳垂·坏笑调侃】：伸手接过红豆派咬了一大口，顺势凑近轻捏她发烫的耳尖：“哇，好甜！晚晴特意排队买的爱心甜点，我怎么舍得扔呢？”【策略评估：直接戳破她的傲娇掩饰，极易引发少女羞愤小粉拳与心跳狂飙】</d>
<d>B. 【温柔体贴·分她一半】：微笑着将红豆派掰成两半，将还冒着热气的那一半递到她唇边：“正好肚子饿了。天气这么凉，晚晴也咬一口暖暖身子吧。”【策略评估：以宠溺温柔打破防备，直击少女内心最柔软的被爱渴望】</d>
<d>C. 【故作嫌弃·反向拉扯】：挑了挑眉把纸袋还给她：“真可惜，我今天答应了后桌女同学去吃奶茶，红豆派恐怕吃不下了呢。”【策略评估：剧烈激起占有欲与酸涩醋意，让她瞬间从傲娇破防为焦急质问】</d>
<d>D. 【牵起小手·并肩回家】：顺势一把牵住她被风吹凉的纤细小手揣进自己的暖和外套口袋里，迈步往前走：“走啦，今晚叔叔阿姨不在家，想吃我煮的西红柿鸡蛋面吗？”【策略评估：跨越社交距离的高甜肢体接触，大幅拉满依赖感与纯爱甜蜜度】</d>
</suggested_questions>
</opt>""",
                    "branches": [
                        {"tag": "A", "title": "轻捏耳垂坏笑调侃", "desc": "直接戳破她的傲娇掩饰，引发羞愤娇嗔与心跳飙升"},
                        {"tag": "B", "title": "温柔体贴分她一半", "desc": "以宠溺温柔打破防备，直击少女柔软内心"},
                        {"tag": "C", "title": "故作嫌弃反向拉扯", "desc": "激发独占欲与醋意，打破高傲防线"},
                        {"tag": "D", "title": "牵起小手并肩回家", "desc": "跨越社交距离的亲密牵手，甜蜜值拉满"}
                    ]
                }
            ],
            "custom_css": "",
            "custom_html": ""
        },

        # 2. 寄宿在你家的毒舌冰山校花
        {
            "uuid": "d0c2b806-5a8a-42fd-bdeb-a69fa72cbbf6",
            "alias": "deck_ice_school_flower",
            "title": "寄宿在你家的毒舌冰山校花",
            "badge": "高岭之花 · 毒舌同居",
            "badge_color": "#06b6d4",
            "author": "AI风月精选",
            "rating": "9.8",
            "heat": "31.8k 玩过 · 3.8k 深度",
            "category": "⚡ 反差破甲",
            "tags": ["高岭之花", "毒舌", "同居", "反差萌", "破防推拉", "校园女神"],
            "cover_image": "https://catai.wiki/2e02c343-790f-4336-ba0b-0caa7e623700/cover",
            "cover_icon": "❄️",
            "cover_title": "冷鸢",
            "cover_subtitle": "圣华高中银发冰山校花 · 破冰同居攻略",
            "logo": "❄️",
            "theme_color": "#06b6d4",
            "btn_gradient": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            "handbook": {
                "title": "寄宿在你家的毒舌冰山校花",
                "desc": "全校男生眼中的高岭之花，竟然是你家的寄宿生？银发如雪，清冷如月，她是冷鸢，完美的代名词。但在家门关上的那一刻，面具碎裂。在学校她是不可亵玩的女神，在家里划清界限、把你当空气。内置【冰山融化度】机制（初始-50），看你如何一步步融化她的寒冰。",
                "bg_image": "https://catai.wiki/2e02c343-790f-4336-ba0b-0caa7e623700/cover",
                "opening_options": [
                    "【玄关初见·划清界限】：“双手抱胸靠在玄关鞋柜旁，用居高临下的鄙夷眼神打量你：‘别误会，住在这里只是双方父母的权宜之计。在学校假装不认识我，在家里别超过走廊红线。’”",
                    "【深夜厨房·饥肠辘辘被抓包】：“凌晨两点穿着宽大衬衫光脚在冰箱前偷找吃的，被你撞破后恼羞成怒把牛奶藏在身后。”",
                    "【暴雨停电·脆弱破防】：“惊雷劈下客厅陷入漆黑，平日傲慢冷漠的冰山女神抱着双膝缩在沙发死角瑟瑟发抖……”",
                    "【学校偶遇·陌生人漠视】：“在教学楼走廊擦肩而过，目不斜视毫无波澜，却在无人的楼梯拐角塞给你一张便签。”"
                ]
            },
            "roles": [
                {
                    "name": "冷鸢",
                    "role": "寄宿的高冷校花 (银发/毒舌/高自尊/反差萌)",
                    "desc": "17岁，高二。圣华高中公认的颜值天花板，银白长发、冰蓝凤眸，身材高挑纤细如超模。因父母长期在海外公干暂时借宿在主角家。极度维护自尊，表面嘴毒如刀、将主角视作背景噪音，实则内心缺乏安全感、独处时容易情绪内耗。"
                },
                {
                    "name": "男主 (玩家)",
                    "role": "同居屋主 / 冰山瓦解者",
                    "desc": "这栋房子的年轻主人。面对冷鸢的冷嘲热讽不卑不亢，沉着应对，在一次次生活细节中打破她的界限，掌控推拉主动权。"
                }
            ],
            "scenes": [
                {
                    "title": "🏠 主角家玄关 · 银白行李箱与严苛三章",
                    "desc": "傍晚六点，玄关地灯微亮。冷鸢推着高定行李箱迈进家门，换上室内拖鞋后，冷冷递过来一份手写的同居隔离守则。"
                },
                {
                    "title": "🛋️ 客厅沙发 · 深夜学习与冷战对峙",
                    "desc": "静谧的深夜十一点，客厅茶几上摆着摊开的竞赛习题册，空气中弥漫着淡淡的白茶冷香与冷漠的对峙张力。"
                }
            ],
            "styles": {
                "dialogue_style": "言语交锋极具冷冽压迫感与心理博弈，反差萌显现时细节张力十足",
                "format": "AI风月标准双栏规范及.custom-ui样式"
            },
            "first_turn": [
                {
                    "index": 1,
                    "isUser": False,
                    "scene": "🏠 主角家玄关 · 银白行李箱与严苛三章",
                    "story": """<tl>📅时间：傍晚18:20 | 🌏地点：公寓玄关处 | ❄️氛围：严苛霜寒</tl>

<article>
<p>防盗门在身后轻轻阖上，玄关暖黄的地灯将空气中的微尘勾勒得格外清晰。</p>

<p>站在你对面的少女身着整洁得一丝不苟的圣华高中西装校服，银白色的长发如同冷月织成的锦缎，随意披散在笔挺的肩头。她微微仰着精致白皙到近乎透明的下颌，冰蓝色的眼眸毫无温度地掠过你的脸庞，仿佛站在她面前的只是一具空气人偶。</p>

<p><w>“你就是那个所谓的‘房东儿子’？”</w></p>

<p>她用戴着蕾丝薄手套的指尖轻轻推了推身旁沉重的银色密码箱，嗓音清冷清冽得像冰块撞击玻璃杯。没有半分寄人篱下的客套，反而带着天然的威慑与居高临下的挑剔：</p>

<p><w>“听好，我之所以答应住在这里，纯粹是因为我父母与你家老人的协议，并非出于我本人的意愿。为了避免不必要的麻烦，我们约法三章：”</w></p>

<p><w>“第一，在学校里，装作完全不认识我，任何胆敢跟我打招呼的举动都会被我视为骚扰；第二，二楼走廊尽头的主卧是我的绝对私人领地，未经允许踏入半步后果自负；第三，不要试图跟我建立任何无聊的感情羁绊。如果你能做到，我们相安无事；如果不能……”</w></p>

<p>她冷冷勾起唇角，露出一抹讥诮而危险的弧度：<w>“我会让你在这个家里，连空气都呼吸得极其艰难。”</w></p>
</article>

<opt>
<suggested_questions>
<d>A. 【强势反客为主·逼近审视】：双手插兜迈进一步跨过玄关红线，居高临下直视她的冰眸：“冷小姐，搞清楚这里是谁的家。想要别人尊重你的规则，先学会怎么对房东礼貌说话。”【策略评估：正面硬刚撕碎她高高在上的傲慢姿态，直接震撼其心防】</d>
<d>B. 【平静接过行李·游刃有余】：神色如常地伸手接过她的银白行李箱，嘴角带着从容淡笑：“好的冷大校花，规矩挺多。不过晚饭我做了糖醋小排，如果某人要绝食遵守协议，我也不介意一个人吃完。”【策略评估：以松弛感化解冰冷敌意，拿捏其饥肠辘辘的软肋】</d>
<d>C. 【冷淡略过·视若空气】：面无表情地点点头，直接侧身从她身旁走过，仿佛真把她当成透明人去倒水【策略评估：以其人之道还治其人之身，彻底激起冰山女神的被忽视挫败感】</d>
<d>D. 【玩味调侃·打破界限】：目光从她精致冷傲的面容滑落到她踩在拖鞋里的白皙脚踝，戏谑一笑：“规矩订得挺严，但刚才进门换鞋的时候，你的手抖了三次呢。你在害怕什么，冷鸢同学？”【策略评估：一针见血看穿她虚张声势的防御机制，直戳心理软肋】</d>
</suggested_questions>
</opt>""",
                    "branches": [
                        {"tag": "A", "title": "强势逼近反客为主", "desc": "正面打破居高临下的傲慢，树立房东主宰威严"},
                        {"tag": "B", "title": "接过行李从容拿捏", "desc": "以松弛感与美食诱惑化解冰冷敌意"},
                        {"tag": "C", "title": "冷淡略过视若空气", "desc": "以其人之道还治其身，激起女神挫败感"},
                        {"tag": "D", "title": "看破伪装玩味调侃", "desc": "一语道破手抖破绽，直刺其防卫心防"}
                    ]
                }
            ],
            "custom_css": "",
            "custom_html": ""
        },

        # 3. ⭐️阿兹加尔魔法大陆🔮（完备升级版）——Tales of Magician
        {
            "uuid": "b0c6d63f-4185-46a5-bbe8-9d0ef7fc974a",
            "alias": "deck_azgar_magic_continent",
            "title": "⭐️阿兹加尔魔法大陆🔮（完备升级版）——Tales of Magician",
            "badge": "西幻史诗 · 剑与魔法",
            "badge_color": "#8b5cf6",
            "author": "AI风月精选",
            "rating": "9.7",
            "heat": "47.5k 玩过 · 7.2k 深度",
            "category": "⚔️ 奇幻冒险",
            "tags": ["西幻大世界", "RPG升级", "剑与魔法", "打怪掉落", "世界书", "自由探索"],
            "cover_image": "https://catai.wiki/3c624dcd-da2b-4e55-8f68-6b1c1a824800/cover",
            "cover_icon": "🔮",
            "cover_title": "阿兹加尔",
            "cover_subtitle": "剑与魔法交织的史诗西幻大世界",
            "logo": "🔮",
            "theme_color": "#8b5cf6",
            "btn_gradient": "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            "handbook": {
                "title": "⭐️阿兹加尔魔法大陆🔮（完备升级版）——Tales of Magician",
                "desc": "【用心巨制💎/内含绘制地图 🖼 100+概念图🖼/代入感极强的西幻大世界】这是一片魔法随处可见的大陆，拥有完整的位阶体系（见习/初级/中级/高级/大魔法师/魔导师/圣阶/半神）、四大王国阵营、深渊魔物生态与掉落合成机制。在这里，你可以扮演骑士、法师、游侠或禁忌术士，谱写你的传奇史诗。",
                "bg_image": "https://catai.wiki/3c624dcd-da2b-4e55-8f68-6b1c1a824800/cover",
                "opening_options": [
                    "【边境冒险者工会·初级任务】：“推开喧闹酒馆橡木大门，前台猫耳接待员微笑着递给你一张泛黄的魔物讨伐悬赏令。”",
                    "【皇家魔法学院·魔导测试】：“站在铭刻着繁复以太符文的检测水晶前，将手掌按上，水晶深处骤然迸发出耀眼的七彩魔力漩涡！”",
                    "【迷雾森林遗迹·偶遇落难圣女】：“在古老遗迹深处击退三只嗜血狂暴座狼，救下一位身着残破神官法袍的金发圣女艾莉亚。”",
                    "【深渊边境要塞·骑士试炼】：“手握厚重的十字双手钢剑，城墙外黑云压城，深渊低语伴随号角声由远及近。”"
                ]
            },
            "roles": [
                {
                    "name": "冒险者 (玩家)",
                    "role": "命运之子 / 自定义职业强者",
                    "desc": "踏入阿兹加尔大陆的异邦旅者。具备独特的魔力感知亲和，在探索古老遗迹、讨伐领主魔物与权谋纷争中不断进阶突破。"
                },
                {
                    "name": "艾莉亚 (圣辉圣女)",
                    "role": "圣光教会巡礼圣女 (治愈/圣光/知性)",
                    "desc": "18岁，晨曦圣光大教堂的预备圣女。怀揣纯洁信仰巡礼大陆，性格温柔仁善，精通高阶圣光术。在森林遗迹被主角相救后，选择与主角结伴同行，心怀对主角神圣的感激与少女悸动。"
                }
            ],
            "scenes": [
                {
                    "title": "🏰 边境风盔城 · 麦酒飘香的冒险者公会",
                    "desc": "石砌壁炉烈火熊熊，麦酒沫与烤肉香弥漫大厅。悬赏栏前挤满了形形色色的佣兵与冒险者，传奇在此启航。"
                },
                {
                    "title": "🌲 迷雾遗迹深处 · 创世之柱遗落方碑",
                    "desc": "藤蔓缠绕的千年前古精灵祭坛，四周漂浮着荧光微粒与微弱的以太魔力共鸣，暗处潜伏着危险的魔物。"
                }
            ],
            "styles": {
                "dialogue_style": "宏大史诗的古典奇幻笔触，严谨的魔法吟唱与紧张刺激的战斗判定",
                "format": "AI风月标准双栏规范及.custom-ui样式"
            },
            "first_turn": [
                {
                    "index": 1,
                    "isUser": False,
                    "scene": "🏰 边境风盔城 · 麦酒飘香的冒险者公会",
                    "story": """<tl>📅魔力纪元 347年 · 霜降之月 | 🌏地点：风盔城冒险者公会大厅 | 🛡️状态：见习冒险者</tl>

<article>
<p>厚重的橡木大门在刺骨寒风中被沉沉推开，公会大厅内扑面而来的壁炉热浪与浓郁的麦芽酒香瞬间驱散了周身的寒意。</p>

<p>粗犷的矮人佣兵正踩在长条木凳上拼酒嘶吼，几个披着厚重斗篷的神秘施法者在角落昏暗的油灯下低语，黄铜吊灯的光晕将整个喧嚣的大厅笼罩在一种刀口舔血的粗砺浪漫中。</p>

<p>你迈步穿过纷杂的酒桌来到黑曜石柜台前。前台的半精灵接待员少女放下手中的羊皮纸卷轴，碧绿的眼眸打量着你腰间新配的制式铁剑，露出了职业而灵动的微笑：</p>

<p><w>“欢迎来到风盔城冒险者分会，年轻的旅者！无论你是想赚取几枚闪亮的银鹿币换一顿饱饭，还是妄图在这片大陆留下名垂青史的传说，阿兹加尔都会慷慨地赋予你机会——当然，前提是你能在野外的尖牙与利爪下保住小命。”</w></p>

<p>她抬手在身后的黄铜悬赏板上划过，三张散发着不同魔力波动的委托单排成一列推到你面前：</p>

<p><w>“这是今天最抢手的三项委托，按照公会铁律，新人必须完成首次试炼方可评定实力位阶并领取专属魔导徽章。挑选属于你的道路吧，勇敢的冒险者！”</w></p>
</article>

<opt>
<suggested_questions>
<d>A. 【稳健清怪·讨伐黑沼巨蟾】：指向第一张印有沼泽标记的羊皮纸：“我选这个，黑沼森林边境的毒系异化巨蟾，收集三对完整毒腺。【战斗目标：试炼初阶剑技与魔力护体，稳健获取基础金币与材料】”</d>
<d>B. 【高风险高收益·护送教会车队】：指向带有圣辉纹章的委托：“听说圣光教会的圣女巡礼车队正在招募护卫骑士？正好我也要前往翡翠圣城。【剧情目标：结识核心主线NPC圣女艾莉亚，开启圣光阵营羁绊】”</d>
<d>C. 【神秘探险·古代精灵废墟】：取下那张带有发光符文的残破羊皮纸：“关于迷雾森林中失落的创世之柱遗迹残片……我很有兴趣探索一番。【冒险目标：遭遇古代机关与未知魔偶，探寻上古高阶装备掉落】”</d>
<d>D. 【情报搜集·与酒馆佣兵打探】：掏出一枚银币放在柜台上：“在接任务之前，我想先在酒馆打听一下最近关于北方雪山巨龙苏醒的传闻。【社交目标：搜集世界大势与高价值隐藏线索，触发随机奇遇】”</d>
</suggested_questions>
</opt>""",
                    "branches": [
                        {"tag": "A", "title": "稳健清怪讨伐黑沼巨蟾", "desc": "试炼初阶剑技与魔力护体，稳健获取基础金币与材料"},
                        {"tag": "B", "title": "高收益护送教会巡礼车队", "desc": "结识主线NPC圣女艾莉亚，开启圣光阵营羁绊"},
                        {"tag": "C", "title": "神秘探险古代精灵废墟", "desc": "挑战古代魔偶机关，探寻上古高阶装备掉落"},
                        {"tag": "D", "title": "情报搜集酒馆打探龙息", "desc": "搜集世界大势与隐藏线索，触发随机奇遇"}
                    ]
                }
            ],
            "custom_css": "",
            "custom_html": ""
        },

        # 4. 九霄修仙传：设定超全的修仙卡（开局roll天赋）
        {
            "uuid": "75376129-e9a1-461b-9671-0e944e969b8e",
            "alias": "deck_jiuxiao_xiuxian",
            "title": "九霄修仙传：设定超全的修仙卡（开局roll天赋）",
            "badge": "修真长生 · 开局roll天赋",
            "badge_color": "#10b981",
            "author": "AI风月精选",
            "rating": "9.5",
            "heat": "46.7k 玩过 · 4.4k 深度",
            "category": "⚔️ 奇幻冒险",
            "tags": ["修仙大世界", "开局roll天赋", "境界突破", "宗门炼丹", "神兵法宝", "真实代入"],
            "cover_image": "https://catai.wiki/6fa0ffc0-2a67-4647-06d2-d793428ffe00/cover",
            "cover_icon": "🗡️",
            "cover_title": "九霄仙途",
            "cover_subtitle": "从练气蝼蚁到九霄至尊的逆天长生录",
            "logo": "🗡️",
            "theme_color": "#10b981",
            "btn_gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            "handbook": {
                "title": "九霄修仙传：设定超全的修仙卡（开局roll天赋）",
                "desc": "【设定超全的硬核修仙巨制】完整构建九霄大陆九大境界（练气/筑基/金丹/元婴/化神/炼虚/合体/大乘/渡劫）、宗门林立、灵根资质、天材地宝、妖兽品阶与天地异火系统。开局自选或roll神级命格天赋，真实还原仙途之残酷与长生之逆天，绝不言出法随！",
                "bg_image": "https://catai.wiki/6fa0ffc0-2a67-4647-06d2-d793428ffe00/cover",
                "opening_options": [
                    "【宗门杂役·逆天改命】：“青云宗灵田边，身为五系杂灵根杂役弟子的你，在后山溪水里意外捡到一枚沾满青苔的古朴黑戒……”",
                    "【落魄修仙世家·家族重振】：“破败的林氏祖祠内，长明灯忽明忽暗，身为少主的你接过父亲留下的残缺天阶心法秘籍。”",
                    "【散修破局·险地寻药】：“万毒瘴气弥漫的断魂谷外，你握着手中的淬毒匕首，正死死盯着悬崖边盛开的一株百年洗髓草。”",
                    "【魔宗卧底·双修博弈】：“幽冥魔宗合欢峰顶，冷艳狠辣的魔宗圣女冷冷俯视着跪在玉阶下的你，命你奉上一缕本命精血。”"
                ]
            },
            "roles": [
                {
                    "name": "修仙者 (玩家)",
                    "role": "逆天求道者 / 天赋宿主",
                    "desc": "踏入九霄修真大世界的求道之人。身怀神级天赋词条，在吞吐天地灵气、炼制灵丹妙药、历经天劫雷罚中争夺一线长生机缘。"
                },
                {
                    "name": "云清璃 (青云剑宗小师妹)",
                    "role": "天灵根剑修天才 (傲娇/正义/剑心通明)",
                    "desc": "16岁，青云宗宗主之幼女，罕见纯阳天火灵根。平日里白衣胜雪、仗剑行侠，对凡俗琐事一窍不通，表面嫌弃主角杂役身份，暗地里多次在宗门执法堂护你周全。"
                }
            ],
            "scenes": [
                {
                    "title": "⛰️ 青云剑宗后山 · 灵雾缭绕的断崖",
                    "desc": "云海翻滚，古松如虬。远处的仙禽鹤鸣隐隐约约，瀑布垂落千尺化为弥漫灵雾，是吐纳筑基的绝佳宝地。"
                },
                {
                    "title": "🏯 九霄天元黑市 · 宝光四溢的修仙坊市",
                    "desc": "各派修士掩盖面容交换禁忌灵草法宝，暗流涌动，杀人夺宝与一夜暴富在一念之间。"
                }
            ],
            "styles": {
                "dialogue_style": "原汁原味的古典东方修真玄幻网文风，讲究因果机缘、境界威压与天地法则",
                "format": "AI风月标准双栏规范及.custom-ui样式"
            },
            "first_turn": [
                {
                    "index": 1,
                    "isUser": False,
                    "scene": "⛰️ 青云剑宗后山 · 灵雾缭绕的断崖",
                    "story": """<tl>📅大乾历 728年 · 谷雨 | 🌏地点：青云剑宗外门后山断崖 | 🧘‍♂️境界：练气期一层 (灵气值: 12/100)</tl>

<article>
<p>山风浩荡，将后山断崖上的千顷云海撕扯出万千波澜。暮色四合，九霄主峰上的护宗护山大阵正泛着淡淡的青蒙蒙微光。</p>

<p>你盘膝坐在一块被风雨侵蚀出青苔的磐石上，浑身骨骼在刚才运转吐纳决时发出细微的酸胀声。作为青云宗最不起眼的杂役弟子，你身负驳杂的下品五行灵根，三年苦修不过堪堪叩开练气期一层的门槛，下个月的宗门外门考核若是不过，便要被贬下山为凡尘矿奴。</p>

<p>然而此刻，你紧握在掌心里的一枚乌黑石戒，却正散发着异样温热的脉动。这是你方才在后山灵溪挑水时无意捞起的异物，上面隐约篆刻着古老的九霄铭文。</p>

<p><w>“喂！那个偷懒的杂役，你还赖在断崖上干什么呢？！”</w></p>

<p>一道清脆中带着几分娇蛮的少女娇喝自上方悬崖栈道上传来。伴随着环佩叮当与破空剑气，一袭雪白流仙裙、腰悬青玉剑鞘的少女宛如惊鸿仙子般飘然落下。那是青云宗掌教之女、天生纯阳剑体的绝世天才云清璃。</p>

<p>她微微蹙着秀眉，杏眸带着居高临下的审视上下打量你，手中挽着一株刚采摘下来的散发着浓郁药香的二阶【紫玉芝】：</p>

<p><w>“后山今夜有二阶妖兽赤鳞蟒出没的痕迹，不想沦为妖兽腹中肉的话，就赶紧收拾柴担回杂役院去！……诺，本小姐刚才采药顺手采多了，这片紫芝叶子便宜你这个呆子拿去熬药擦伤吧，省得考核不过给本宗丢人！”</w></p>
</article>

<opt>
<suggested_questions>
<d>A. 【双手接过灵芝·不卑不亢】：从容躬身接过药草，神色平静注视她的眼眸：“多谢云师姐关照。不过今夜这断崖上的赤鳞蟒，我倒很想去见识见识它的蛇胆。【行动目标：试炼初阶雷火法诀，尝试越级挑战残血妖兽】”</d>
<d>B. 【暗中激活黑戒·神识探查】：一只手悄然将灵力注入掌心的古朴石戒，尝试唤醒其中沉睡的古老残魂【行动目标：触发金手指老爷爷/神尊指点，辨认神秘石戒来历与修真秘辛】</d>
<d>C. 【调侃试探·借势拉近】：收起药草狡黠一笑：“云师姐嘴上说顺手，可紫玉芝生长在千仞绝壁，师姐冒着危险采来，不会是特意给师弟我准备的吧？”【行动目标：直击傲娇小师妹羞涩心防，打破身份阶级壁垒】</d>
<d>D. 【虚心求教·请教剑法破绽】：拔出腰间锈迹斑斑的杂役铁剑当场演示一招青云剑式，向剑道天才云清璃求教气机运转之道【行动目标：以坚毅求道之心打动高岭小师妹，争取得到高阶剑诀指点】</d>
</suggested_questions>
</opt>""",
                    "branches": [
                        {"tag": "A", "title": "接过灵芝不卑不亢", "desc": "从容致谢并表明越级挑战妖兽之志向，展现道心"},
                        {"tag": "B", "title": "暗中激活乌黑石戒", "desc": "灵力注入唤醒神秘古戒残魂，开启逆天金手指"},
                        {"tag": "C", "title": "调侃试探傲娇师姐", "desc": "笑戳送药破绽，击溃小师妹傲娇心理防线"},
                        {"tag": "D", "title": "拔剑演示虚心求教", "desc": "以不灭求道之坚毅打动剑道天才，争取指点"}
                    ]
                }
            ],
            "custom_css": "",
            "custom_html": ""
        },

        # 5. 【无限流】主神空间，干穿多元宇宙
        {
            "uuid": "82e261bc-2d95-4c41-8913-e0cf2756fc04",
            "alias": "deck_infinity_lord_god",
            "title": "【无限流】主神空间，干穿多元宇宙",
            "badge": "诸天穿越 · 轮回试炼",
            "badge_color": "#f59e0b",
            "author": "AI风月精选",
            "rating": "9.4",
            "heat": "46.2k 玩过 · 4.0k 深度",
            "category": "⚔️ 奇幻冒险",
            "tags": ["无限流", "主神空间", "任务打怪", "奖励点强化", "诸天多元宇宙", "死亡试炼"],
            "cover_image": "https://catai.wiki/6d09f420-e000-4b95-f1ac-899c3c69c900/cover",
            "cover_icon": "🌐",
            "cover_title": "主神空间",
            "cover_subtitle": "穿越诸天万界的生死试炼与极限强化",
            "logo": "🌐",
            "theme_color": "#f59e0b",
            "btn_gradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            "handbook": {
                "title": "【无限流】主神空间，干穿多元宇宙",
                "desc": "欢迎来到主神空间——连接无限多元宇宙的试炼场！无论是《生化危机》、《赛博朋克2077》、《艾尔登法环》还是《Fate》圣杯战争，完成生死主线任务，获取丰厚的奖励点与支线剧情！兑换血统、禁忌神兵与无上功法，在血腥与绝望中登顶多元至高！",
                "bg_image": "https://catai.wiki/6d09f420-e000-4b95-f1ac-899c3c69c900/cover",
                "opening_options": [
                    "【主神光球·初次降临】：“冰冷、抖动……你在一间飞驰在幽暗隧道中的生化危机蜂巢列车车厢内地板上惊醒！”",
                    "【兑换广场·强化抉择】：“巨大的发光主神大光球下，无数强悍轮回者在交易广场徘徊，你看着自己仅剩的1000奖励点思索兑换方案。”",
                    "【交界地试炼·猎杀半神】：“血月当空的盖利德荒原，漫天猩红腐败中，你握紧手中的高频振动战术短刀直面碎星将军拉塔恩！”",
                    "【赛博夜之城·接取赏金】：“雨夜荒坂塔阴影下，义眼泛着冷酷红光的你正靠在废弃浮空车旁装填电磁狙击步枪。”"
                ]
            },
            "roles": [
                {
                    "name": "轮回者 (玩家)",
                    "role": "入选者 / 试炼破局者",
                    "desc": "按下电脑屏幕‘YES’后被召入主神空间的求生者。通过生死任务获得奖励点与支线剧情，在各方轮回小队的猎杀与诸天神魔对决中不断强化超越极限。"
                },
                {
                    "name": "主神 (光球意志)",
                    "role": "至高主宰 / 任务仲裁者",
                    "desc": "冰冷、无情、全知全能的试炼大光球。不包含任何多余情感，唯有残酷的抹杀铁律与公正的兑换法则。"
                }
            ],
            "scenes": [
                {
                    "title": "🌌 主神空间 · 纯白绝对广场",
                    "desc": "悬浮在无尽虚空中的万丈纯白广场，中央悬浮着巨大的发光大光球，连接着通往亿万次元的轮回光柱。"
                },
                {
                    "title": "🚇 生化蜂巢列车 · 绝望密闭车厢",
                    "desc": "金属门闭锁，车厢应急红灯不断闪烁。门外管道隐约传来丧尸犬低沉的嘶吼与利爪刮擦铁皮声。"
                }
            ],
            "styles": {
                "dialogue_style": "硬派无限流科幻与魔幻交织的冷酷笔调，极度紧凑的任务倒计时与数值博弈",
                "format": "AI风月标准双栏规范及.custom-ui样式"
            },
            "first_turn": [
                {
                    "index": 1,
                    "isUser": False,
                    "scene": "🚇 生化蜂巢列车 · 绝望密闭车厢",
                    "story": """<tl>📅时间：试炼开始 第00分12秒 | 🌏地点：浣熊市地下蜂巢入口列车 | 📊剩余奖励点：1000 点</tl>

<article>
<p>“想明白生命的意义吗？想真正的……活着吗？”</p>

<p>脑海中那行诡异血红的字迹尚未完全褪去，剧烈的眩晕感与冰冷刺骨的金属触感便骤然将你拽回现实。你猛地睁开眼，发现自己正倒在冰冷潮湿的钢铁地板上，空气中充斥着刺鼻的机油与消毒水混合的作呕气味。</p>

<p>这是一节正在地底轨道疾驰的封闭列车车厢。车顶昏暗的应急红灯在剧烈震颤中明灭不定，将四周几名同样刚刚苏醒、满脸惊恐不知所措的男女面庞照得阴森惨白。</p>

<p>就在这时，你脑海深处蓦地响起了那道毫无起伏、漠然得令人骨髓发寒的机械神谕：</p>

<p><w>【滴！主神空间第7742批新晋轮回者降临完成。】</w></p>

<p><w>【当前任务世界：《生化危机·蜂巢绝境》】</w></p>

<p><w>【主线任务一：在地下蜂巢全面封锁断电前，跟随雇佣兵小队抵达中央控制室红后主机房。成功奖励：奖励点 1000点、D级支线剧情 1个；失败惩罚：就地抹杀！】</w></p>

<p><w>【特别提示：车厢尾部密码门将在 30秒后强行解锁，检测到门外管道存在变异舔食者幼体三只！距离门锁解除倒计时：29……28……】</w></p>

<p>刺耳的倒计时警报瞬间在车厢内炸响！一名西装革履的中年男子吓得瘫坐在地尖叫哭嚎，而车厢尾部的金属闸门上，三道深达数寸、被生生撕裂的恐怖爪痕正在发出金属即将崩溃的剧烈呻吟！</p>
</article>

<opt>
<suggested_questions>
<d>A. 【抢夺战术装备·破拆应急箱】：一把拽开座椅下的红色应急柜，拔出高强度消防斧与两枚闪光弹：“都闭嘴！不想死的全部拿起手边铁棍堵死门缝！【战术目标：利用环境构筑第一道防御阵线，稳定全队阵脚】”</d>
<d>B. 【激活初始金手指·兑换初阶强化】：意念瞬间沟通主神手表，消耗初始赠送的1000奖励点，秒速兑换【初阶T病毒免疫体质】与【微型高斯脉冲手枪】【强化目标：获取关键远程破甲火力，确保单挑舔食者生存率】</d>
<d>C. 【冷眼旁观·诱饵战术】：迅速翻身跃上车厢顶部的通风管道隐匿身形，以车厢里嚎哭的新人为诱饵等待怪物破门【生存目标：极致冷酷的无限流老手风范，坐收渔翁之利】</d>
<d>D. 【破坏制动阀·列车强制加速】：冲向车厢前部的紧急制动手柄，反向拉死推进阀，让列车以最高速度撞向终点站台甩脱车尾怪物【极限脱困：利用物理惯性破坏怪物追杀节奏】</d>
</suggested_questions>
</opt>""",
                    "branches": [
                        {"tag": "A", "title": "破拆应急箱抢夺战术装备", "desc": "夺取消防斧与闪光弹，组织新人构筑防御防线"},
                        {"tag": "B", "title": "秒速兑换高斯枪与强化体质", "desc": "消耗初始1000奖励点兑换关键武装，火力破局"},
                        {"tag": "C", "title": "攀上通风管道冷眼坐收", "desc": "隐藏行踪以混乱为掩护，等待关键一击"},
                        {"tag": "D", "title": "强制加速列车甩脱追兵", "desc": "破坏制动极限漂移，利用惯性撞飞异化怪物"}
                    ]
                }
            ],
            "custom_css": "",
            "custom_html": ""
        }
    ]

    sys.path.insert(0, ROOT_DIR)
    import db_engine

    # 1. Update active db_engine (PostgreSQL if .env configured)
    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

    # 2. Also update local SQLite noval_data.db for dual-safety
    sqlite_conn = sqlite3.connect(DB_PATH)
    sc = sqlite_conn.cursor()

    for item in cards_to_import:
        uuid_id = item['uuid']
        alias_id = item['alias']
        title = item['title']

        print(f"\n[*] Processing: {title} ({uuid_id} / {alias_id})")

        # 1. Insert/Update into stories table (both uuid and alias)
        for target_id in [uuid_id, alias_id]:
            # In active DB (PostgreSQL)
            ac.execute("DELETE FROM stories WHERE id = %s" if is_pg else "DELETE FROM stories WHERE id = ?", (target_id,))
            insert_sql_active = """
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """ if is_pg else """
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            params = (
                target_id,
                item['title'],
                item['badge'],
                item['cover_icon'],
                item['cover_title'],
                item['cover_subtitle'],
                item['logo'],
                item['theme_color'],
                item['btn_gradient'],
                json.dumps(item['handbook'], ensure_ascii=False),
                json.dumps(item['roles'], ensure_ascii=False),
                json.dumps(item['scenes'], ensure_ascii=False),
                json.dumps(item['styles'], ensure_ascii=False),
                json.dumps(item['first_turn'], ensure_ascii=False),
                item['custom_css'],
                item['custom_html'],
                item['category'],
                now_str,
                now_str
            )
            ac.execute(insert_sql_active, params)

            # In SQLite
            sc.execute("DELETE FROM stories WHERE id = ?", (target_id,))
            sc.execute("""
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, params)
            print(f"  [+] Stored story in DB: {target_id}")

        # 2. Insert/Update into plaza_cards table
        # In active DB
        ac.execute("DELETE FROM plaza_cards WHERE id = %s OR id = %s OR title = %s" if is_pg else "DELETE FROM plaza_cards WHERE id = ? OR id = ? OR title = ?", (uuid_id, alias_id, item['title']))
        insert_plaza_active = """
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """ if is_pg else """
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        plaza_params = (
            uuid_id,
            uuid_id,
            item['title'],
            item['badge'],
            item['badge_color'],
            item['author'],
            item['handbook']['desc'],
            item['rating'],
            json.dumps(item['tags'], ensure_ascii=False),
            item['heat'],
            0,
            item['cover_image'],
            'HOT',
            'fire',
            1,
            item['category'],
            now_str
        )
        ac.execute(insert_plaza_active, plaza_params)

        # In SQLite
        sc.execute("DELETE FROM plaza_cards WHERE id = ? OR id = ? OR title = ?", (uuid_id, alias_id, item['title']))
        sc.execute("""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, plaza_params)
        print(f"  [+] Stored plaza_card in DB: {uuid_id}")

        # 3. Save JSON backup in cards/
        card_dump = {
            "id": alias_id,
            "uuid": uuid_id,
            "title": item['title'],
            "badge": item['badge'],
            "logo": item['logo'],
            "cover": item['cover_image'],
            "themeColor": item['theme_color'],
            "btnGradient": item['btn_gradient'],
            "handbook": item['handbook'],
            "roles": item['roles'],
            "scenes": item['scenes'],
            "styles": item['styles'],
            "firstTurnDemo": item['first_turn'][0] if item['first_turn'] else {}
        }
        json_path = os.path.join(CARDS_DIR, f"{alias_id}.json")
        with open(json_path, 'w', encoding='utf-8') as jf:
            json.dump(card_dump, jf, ensure_ascii=False, indent=2)
        print(f"  [+] Saved card JSON backup: {json_path}")

    active_conn.commit()
    active_conn.close()
    sqlite_conn.commit()
    sqlite_conn.close()
    print("\n[🎉] All 5 top-rated AI风月 scenario cards successfully imported and synchronized to both PostgreSQL and SQLite!")

if __name__ == '__main__':
    build_all_cards()
