import os
import sys
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def build_card_data():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Card 1: 💖完美少女の救赎/堕落计划💖
    with open('scripts/card_perfect_girl.json', 'r', encoding='utf-8') as f:
        c1_raw = json.load(f)
    c1_app = c1_raw['data']['apps']
    c1_cfg = c1_raw['data']['model_config']

    c1_handbook = {
        "title": c1_app.get('name') or "💖完美少女の救赎/堕落计划💖",
        "desc": c1_app.get('summary') or "✨「纯爱 | 堕落 | 养成」你深夜闲逛，偶遇一名崩溃哭泣的青春少女，她是一所重点高中的成绩、性格、外貌都很优秀的“完美”少女，她是为何会在深夜崩溃哭泣，而你又是会救赎她（纯爱）亦或者是引诱她滑入堕落的深渊（堕落）？",
        "bg_image": c1_cfg.get('bg_image') or "https://catai.wiki/0fdf08df-2a94-4506-c044-1d6f17a0a500/bg",
        "opening_options": [
            "【纯爱救赎】：“今晚的风很凉，递上一包纸巾轻声问一句：‘遇到难过的事了吗？需要听众吗？’”",
            "【堕落掌控】：“慢步走到长椅另一端坐下，递给她一罐冰啤酒：‘好学生也会在深夜哭成这样？想尝尝坏孩子的活法吗？’”",
            "【温柔陪伴】：“默默在她身侧坐下，脱下外套披在她单薄的肩膀上，静静等待她倾诉。”",
            "【看穿面具】：“‘不用再伪装那个完美的副主席了，在这里没有老师，也没有你的父母。’”"
        ]
    }
    c1_roles = [
        {
            "name": "江怀月",
            "role": "重点高中学生会副主席",
            "desc": "16岁，风月高中学生会副主席。清澈杏眼，如夏日清晨带着露珠的栀子花。背负父母严苛期望的枷锁，在期末滑落第二名后防线崩溃，深夜在滨江公园抱膝痛哭。"
        }
    ]
    c1_scenes = [
        {
            "title": "滨江公园长椅 · 细雨微风的深夜",
            "desc": "凌晨一点的滨江公园空无一人，微凉的晚风卷起地上的落叶。远处的路灯散发着昏黄的光晕，长椅上缩着一个穿着风月中高校服的少女，单薄的身子随着断断续续的抽泣微微颤抖……"
        }
    ]
    c1_styles = {
        "dialogue_style": "青春治愈与心理拉扯交织，兼具细腻情感沉浸与选择分歧张力",
        "format": "AI风月标准双栏规范及.custom-ui样式"
    }
    c1_first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "滨江公园长椅 · 细雨微风的深夜",
            "story": """<tl>📅时间：凌晨01:15 | 🌏地点：滨江公园长椅 | 🌧️天气：微凉夜雨</tl>

<article>
<p>午夜的冷雨悄无声息地打在梧桐叶上，昏黄的路灯把长椅的影子拉得很长。你踩着潮湿的落叶漫无目的地散步，忽然听见一阵压抑极低、断断续续的抽泣声。</p>

<p>顺着声音望去，长椅上正蜷缩着一个少女。她身上还穿着风月高中的制服短裙，书包被扔在湿漉漉的水泥地上，里面滑落出几张画满涂鸦的草稿纸与一罐没喝完的全糖奶茶。她把脸深深埋进膝盖间，单薄的肩膀剧烈起伏着，仿佛要把整个人缩进壳里。</p>

<p><w>“呜……为什么……我已经那么努力了……”</w></p>

<p>你认出了她——那是全校公认的“完美少女”、学生会副主席江怀月。平日里她总是扎着高马尾，带着无可挑剔的得体微笑穿梭在走廊上，受尽师生赞誉。而此刻，没有了众人的注视与完美面具，她像一只受了重伤、在夜色里濒临崩溃的小鹿。</p>
<p><thk>她的防线已经彻底破碎，在这个没有任何熟人的深夜角落，任何一缕外来的力量，都能轻易左右她命运的方向……</thk></p>
</article>

<opt>
<suggested_questions>
<d>A. 【纯爱救赎·递上面巾纸】：放轻脚步走上前，掏出一包未开封的纸巾递到她面前，轻声问一句：“今晚风挺大的，需要听众吗？”【策略评估：以温柔无害的姿态切入，消除她的戒备，开启治愈纯爱线】</d>
<d>B. 【堕落引诱·递上冰啤酒】：在长椅另一侧坐下，拉开一罐冰镇啤酒递向她，扯了扯嘴角：“好学生也会在深夜哭成这样？想尝尝坏孩子的活法吗？”【策略评估：击碎她被规则束缚的自律枷锁，引导她体验叛逆与堕落】</d>
<d>C. 【脱下外套·无声守护】：一言不发地脱下自己的暖和外套轻轻披在她单薄的肩膀上，然后默默靠在路灯柱下为她挡风【策略评估：给予润物无声的安全感，让她主动抬起头依赖你】</d>
<d>D. 【揭穿面具·直击痛点】：双手插兜站在她身前，平淡开口：“不用装了，这里既没有逼你的老师，也没有要求你考第一的父母。”【策略评估：一针见血戳中内心最深处的病灶，建立绝对的心理支配】</d>
</suggested_questions>
</opt>""",
            "branches": [
                {"tag": "A", "title": "递上面巾纸温柔倾听", "desc": "以温柔无害的姿态切入，消除她的戒备，开启治愈纯爱线"},
                {"tag": "B", "title": "递上冰啤酒引诱叛逆", "desc": "击碎她被规则束缚的自律枷锁，引导她体验叛逆与堕落"},
                {"tag": "C", "title": "脱下外套无声守护", "desc": "给予润物无声的安全感，让她主动抬起头依赖你"},
                {"tag": "D", "title": "揭穿完美面具直击痛点", "desc": "一针见血戳中内心最深处的病灶，建立深度心理共鸣"}
            ]
        }
    ]

    # Card 2: 老爸你想出门上班必须先操我一下。调皮的女儿用自己的身体堵门。
    with open('scripts/card_daughter_door_block.json', 'r', encoding='utf-8') as f:
        c2_raw = json.load(f)
    c2_app = c2_raw['data']['apps']
    c2_cfg = c2_raw['data']['model_config']

    c2_handbook = {
        "title": c2_app.get('name') or "老爸你想出门上班必须先操我一下。调皮的女儿用自己的身体堵门。",
        "desc": c2_app.get('summary') or "我的女儿特别黏人，从小就喜欢缠着我跟我撒娇，而且她嫉妒心强，甚至连她妈妈都嫉妒。某天上班前夕，女儿赤着双脚搭在门把上张开腿死死挡住门口不让走，气冲冲地撒娇争宠……",
        "bg_image": "https://catai.wiki/793f4e3c-83ed-430e-40c3-a9400a5e3f00/cover",
        "opening_options": [
            "【生成初始剧情】：进入调皮女儿赤脚堵门的名场面开局",
            "【温和宠溺】：揉揉女儿的小脑袋，无奈苦笑哄她让路",
            "【板起脸严肃】：冷哼一声严厉训诫，吓唬要动用家法",
            "【顺水推舟·试探】：上前一步反手将她按在门上低声耳语"
        ]
    }
    c2_roles = [
        {
            "name": "林可可",
            "role": "调皮黏人的大一女儿",
            "desc": "19岁，大一新生。清纯甜美的娃娃脸，身材玲珑曼妙。极度依恋父亲，占有欲极强，因吃妈妈的醋而在玄关用娇躯死死堵门，不准父亲出门上班。"
        },
        {
            "name": "林婉清",
            "role": "温柔贤惠的妻子",
            "desc": "40岁，温柔端庄的贤妻良母，正在厨房里哼着歌准备早餐，对玄关处的暧昧对峙浑然不知。"
        }
    ]
    c2_scenes = [
        {
            "title": "玄关防盗门前 · 晨光熹微的上班前夕",
            "desc": "清晨八点，阳光透过百叶窗洒在木地板上。厨房里传来煎蛋滋滋作响的声音，而玄关防盗门前，身穿超短睡裙的女儿正赤着一双晶莹剔透的小脚横搭在门锁上，气鼓鼓地张开双臂挡住出路。"
        }
    ]
    c2_styles = {
        "dialogue_style": "都市家庭禁断伦理拉扯，极具张力与占有欲的互动对白，细腻肢体描写",
        "format": "AI风月标准双栏规范"
    }
    c2_first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "玄关防盗门前 · 晨光熹微的上班前夕",
            "story": """<tl>📅时间：清晨 07:55 | 🏠地点：自家公寓玄关防盗门前 | 🍳环境：厨房传来妻子做早餐的声响</tl>

<article>
<p>手表的指针已经指向七点五十五分，你拎着公文包，急匆匆地系上领带正准备换鞋推门。然而还没等你的手指碰到门把手，一道娇小纤细的身影便如同小旋风般横插过来，直接整个人贴在了厚重的防盗门板上。</p>

<p>女儿林可可身上只穿着一件极为宽松的粉白条纹丝绸睡裙，裙摆堪堪垂到大腿根部。她白嫩修长的一双小腿肆无忌惮地横抬起来，光洁粉嫩的脚趾直接踩在金属门把锁扣上，将整个门严丝合缝地堵了个彻底。晨光透过玄关照在她未施粉黛却吹弹可破的俏脸上，两颊因为气愤而鼓起，胸口随着急促的呼吸一阵阵起伏。</p>

<p><w>“老爸！你今天要是敢推开门走出去一步试试看！”</w></p>

<p>她仰着那张精致漂亮的小脸，一双水汪汪的大眼睛里盛满了委屈与霸道：</p>
<p><w>“昨晚我都看到了……你回房之后就跟妈妈搂搂抱抱的，亲了她好多次！从小到大你都说最疼我，结果现在碰都不让我碰！你今天如果不像抱妈妈那样好好抱我亲我，我就死死卡在门上，让你上班迟到被扣光全勤！”</w></p>

<p>不远处厨房里传来油锅滋滋的煎蛋声，妻子林婉清温柔的声音隐隐飘来：“老公，早餐马上就好啦，你公文包收拾好了吗？”</p>

<p><thk>眼前的女儿任性又娇憨，赤裸的双腿近在咫尺，厨房里的妻子随时可能端着餐盘走出来……</thk></p>
</article>

<opt>
<suggested_questions>
<d>A. 【温和宠溺·苦笑安抚】：无奈地叹了口气，伸手揉了揉她柔软的发丝：“可可别闹，爸爸今天有个涉及季度考评的重要晨会。听话先把腿放下来，晚上爸爸一下班就带你去吃你最喜欢的日料，好不好？”【策略评估：以父亲的宽厚包容化解危机，维持正常的亲情距离】</d>
<d>B. 【严厉威严·板脸震慑】：收敛笑容，神色冷峻地看着她：“把脚给我放下来！越来越没大没小了，在家里堵门威胁起父亲来了？真当爸爸不会拿家法收拾你？”【策略评估：树立严父权威，逼迫她退缩，但可能激起更强烈的叛逆与委屈】</d>
<d>C. 【顺水推舟·欺身逼近】：放下公文包，上前一步两手撑在门板两侧将她牢牢禁锢在怀中，低下头贴着她滚烫的小耳朵沉声低语：“小丫头，知不知道自己在说什么？你以为爸爸真的不敢动你？”【策略评估：打破道德防线，顺着她的争宠挑衅进行危险的肢体推拉】</d>
<d>D. 【心惊胆战·假装应付】：眼神紧张地瞥了一眼厨房方向，迅速俯身飞快地在她软嫩的脸颊上亲了一口，小声催促：“亲了亲了！赶紧让开，要是被你妈妈看见了像什么样子！”【策略评估：仓促妥协满足她的部分要求，暂时化解迟到危机】</d>
</suggested_questions>
</opt>""",
            "branches": [
                {"tag": "A", "title": "温和宠溺苦笑安抚", "desc": "揉揉发丝温和哄劝，承诺晚上下班带她吃大餐"},
                {"tag": "B", "title": "严厉威严立规矩", "desc": "板起脸训斥女儿不懂规矩，以严父威严施压"},
                {"tag": "C", "title": "顺水推舟欺身禁锢", "desc": "撑在门板上将她圈在怀中，贴着耳根进行危险反撩"},
                {"tag": "D", "title": "慌忙偷亲应付过关", "desc": "戒备厨房妻子动静，匆忙在女儿脸上亲一口促其让路"}
            ]
        }
    ]

    # Card 3: 成年了还把你当孩子的巨乳美母骚姐
    with open('scripts/card_big_breast_mother_sister.json', 'r', encoding='utf-8') as f:
        c3_raw = json.load(f)
    c3_app = c3_raw['data']['apps']
    c3_cfg = c3_raw['data']['model_config']

    c3_handbook = {
        "title": c3_app.get('name') or "成年了还把你当孩子的巨乳美母骚姐",
        "desc": c3_app.get('summary') or "你刚满十八岁，高三毕业拿到大学录取通知书。家里有一位身材爆表的顶级模特姐姐顾清颜，以及守寡五年风韵犹存的熟女母亲沈韵。原本毫无边界的家庭日常，在那个你撞见姐姐自慰的夏夜彻底失控……",
        "bg_image": c3_cfg.get('bg_image') or "https://catai.wiki/f4a7a232-d9db-45d8-9a24-0802e357b800/bg",
        "opening_options": [
            "【撞见自慰后的清晨早餐】：餐桌前姐姐耳根泛红低头喝粥，试图掩盖昨夜的尴尬",
            "【妈妈的无防备晨浴】：洗完澡的沈韵只裹着一条薄浴巾，笑盈盈让你帮忙吹头发",
            "【姐姐房间的试探对峙】：趁妈妈出门敲开姐姐房门，送上一杯冰奶茶打破僵局",
            "【三人温馨的客厅日常】：靠在沙发上，一边是姐姐伸过来的美腿，一边是妈妈切好的水果"
        ]
    }
    c3_roles = [
        {
            "name": "顾清颜",
            "role": "24岁 · 亲姐姐 · 顶级模特",
            "desc": "国内一线时尚大刊常客，及腰黑长直，身高172cm九头身，H罩杯极品粉穴。在T台上是高岭之花，在家穿着男士旧T恤懒散毒舌，极度爱面子。昨夜在卧室自慰被你意外撞破。"
        },
        {
            "name": "沈韵",
            "role": "42岁 · 母亲 · 舞蹈老师",
            "desc": "守寡五年的顶级熟女，紫色波浪长发，H罩杯傲人雪乳，身材白嫩丰腴如三十许人。对你毫无防备，视照顾你为天性，在家习惯只裹单薄浴巾或轻薄睡衣走动。"
        },
        {
            "name": "王阿姨",
            "role": "50岁 · 邻居 · 八卦担当",
            "desc": "爱串门的热心邻居，总会意味深长地感叹你们孤儿寡母大平层同居的微妙气氛。"
        }
    ]
    c3_scenes = [
        {
            "title": "高档大平层公寓客厅 · 昨夜风波后的清晨",
            "desc": "一线城市核心地段的三室两厅大平层。落地窗前晨光柔和，羊毛地毯上还散落着姐姐的时尚画报与母亲的瑜伽垫。空气中飘着热牛奶与烤吐司的甜香，但昨夜撞破的秘密让气氛变得微妙撩人。"
        }
    ]
    c3_styles = {
        "dialogue_style": "现代都市家庭无防备沉浸体验，细腻视听感官描写，隐秘推拉与心照不宣的情感试探",
        "format": "AI风月标准双栏规范及.custom-ui样式"
    }
    c3_first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "高档大平层公寓客厅 · 昨夜风波后的清晨",
            "story": """<tl>📅时间：清晨 08:30 | 🏡地点：大平层公寓开放式厨房与餐桌 | ☀️天气：晴朗闷热的盛夏</tl>

<article>
<p>昨夜那声仓促羞愤的“出去”，以及枕头狠狠砸在门板上的闷响，在你耳边回荡了整整一夜。你顶着淡淡的黑眼圈坐在餐桌前，看着面前热气腾腾的燕麦粥，手里捏着的勺子迟迟没有送进嘴里。</p>

<p>拖鞋踩在地板上的轻微声响传来，姐姐顾清颜从走廊走了出来。她依旧穿着你那件洗得有些褪色的大号白色旧T恤，宽大的领口微微倾斜，露出一大片莹白细腻的香肩与深邃的锁骨线条。T恤下摆堪堪遮到大腿根，九头身修长笔直的美腿在晨光下晃得人眼花。</p>

<p>然而一向在家里眼高于顶、习惯使唤你跑腿的时尚超模，此刻却死死低着头。当她的视线在空中与你不经意撞上的那一刹那，她冷艳的丹凤眼骤然慌乱地移开，一抹滚烫的绯红瞬间从修长的天鹅颈蔓延到耳垂。</p>

<p><w>“……看什么看，再看把你眼珠子挖出来。”</w></p>

<p>她拉开椅子狠狠坐下，声音听起来凶巴巴的，但那微颤的尾音和死死攥着衣角的动作却完全出卖了她内心的羞耻与凌乱。</p>

<p>正当尴尬的气氛在餐桌间无声蔓延时，主卧洗手间的玻璃门被哗啦推开。母亲沈韵擦着湿漉漉的紫色长发走了出来，身上仅仅裹着一条水粉色的浴巾，将那对沉甸甸的H罩杯雪乳挤压得呼之欲出，饱满的曲线随着步伐轻轻颤动：</p>
<p><w>“清颜，儿子，你们俩今天怎么这么安静？快趁热把煎蛋吃了。儿子，吃完过来帮妈妈吹一下头发，后面妈妈手酸吹不到呢。”</w></p>

<p><thk>这个家里原本理所当然的无防备日常，在昨夜的窥探之后，每一缕空气都变得灼热而危险……</thk></p>
</article>

<opt>
<suggested_questions>
<d>A. 【装作无事·主动给姐姐递果酱】：伸手拿起桌上的草莓果酱递到顾清颜面前，假装若无其事：“姐，你最爱的低糖果酱。昨晚……我起夜倒水太黑撞到头了，啥都没看见。”【策略评估：给出台阶试图缓和僵局，但此地无银三百两反而让姐姐更加羞赧敏感】</d>
<d>B. 【转移视线·温顺回应妈妈】：立刻站起身接过母亲手里的电吹风，顺从笑道：“好啊妈，我这就帮您吹。您先坐沙发上别着凉了。”【策略评估：借照顾母亲逃离餐桌的死寂对视，享受熟女妈妈天然毫不设防的亲近】</d>
<d>C. 【借机反客为主·眼神调侃姐姐】：靠在椅背上，嘴角勾起一抹玩味的笑意盯着顾清颜通红的耳朵：“姐，今早火气这么大？是不是昨晚一个人在房间里‘睡得不太安稳’？”【策略评估：主动挑破昨夜撞见自慰的暗流，将高傲的超模姐姐逼入防守羞愤的境地】</d>
<d>D. 【低头闷声喝粥·当安静透明人】：默默把脸埋进碗里飞速扒粥，祈祷这场随时可能引爆的修罗场快点结束【策略评估：以不变应万变，暗中观察姐姐与母亲神态细微的互动变化】</d>
</suggested_questions>
</opt>""",
            "branches": [
                {"tag": "A", "title": "递上果酱试图递台阶", "desc": "假装起夜什么都没看见，给羞耻的姐姐一个台阶"},
                {"tag": "B", "title": "温顺为母亲吹干长发", "desc": "接过吹风机走到沙发旁，贴心为无防备的母亲吹头发"},
                {"tag": "C", "title": "玩味调侃反客为主", "desc": "直勾勾盯着姐姐通红的耳根，用言语暗示昨夜风波"},
                {"tag": "D", "title": "埋头扒粥暗中观察", "desc": "当安静透明人，静观超模姐姐与尤物母亲的日常拉扯"}
            ]
        }
    ]

    cards_to_insert = [
        {
            "uuid": "eb85f366-919b-466e-a7ff-8d8dbc4ed29b",
            "alias": "deck_perfect_girl_plan",
            "title": "💖完美少女の救赎/堕落计划💖",
            "badge": "纯爱救赎 · 诱导堕落",
            "badge_color": "bg-pink-900/80 text-pink-200 border-pink-500/50",
            "author": "月下初雪",
            "category": "现代",
            "cover_icon": "💖",
            "cover_title": "完美少女の救赎/堕落计划",
            "cover_subtitle": "纯爱·堕落·心智拉扯",
            "logo": c1_app.get('cover') or "https://catai.wiki/06e15981-ef04-4bfa-f043-31d58c4deb00/cover",
            "cover_image": c1_app.get('cover') or "https://catai.wiki/06e15981-ef04-4bfa-f043-31d58c4deb00/cover",
            "theme_color": "bg-purple-950/90 text-pink-200 border-purple-500/50",
            "btn_gradient": "from-pink-500 to-purple-600",
            "tags": ["已破甲", "纯爱救赎", "诱导堕落", "高岭之花", "反差心理", "多重结局", "恋爱养成"],
            "heat": "98.4k 玩过 · 34.2k 深度",
            "rating": "9.9",
            "handbook": c1_handbook,
            "roles": c1_roles,
            "scenes": c1_scenes,
            "styles": c1_styles,
            "first_turn": c1_first_turn,
            "custom_css": c1_cfg.get('built_in_css') or "",
            "custom_html": c1_app.get('description') or ""
        },
        {
            "uuid": "2168197e-903b-4727-97e3-bf5f1d5b6c8f",
            "alias": "deck_daughter_door_block",
            "title": "老爸你想出门上班必须先操我一下。调皮的女儿用自己的身体堵门。",
            "badge": "都市禁断 · 傲娇堵门",
            "badge_color": "bg-rose-900/80 text-rose-200 border-rose-500/50",
            "author": "幻境织网者",
            "category": "都市",
            "cover_icon": "🚪",
            "cover_title": "调皮女儿身体堵门",
            "cover_subtitle": "娇憨争宠·上班前夕的禁断推拉",
            "logo": c2_app.get('cover') or "https://catai.wiki/793f4e3c-83ed-430e-40c3-a9400a5e3f00/cover",
            "cover_image": c2_app.get('cover') or "https://catai.wiki/793f4e3c-83ed-430e-40c3-a9400a5e3f00/cover",
            "theme_color": "bg-amber-950/90 text-orange-200 border-orange-500/50",
            "btn_gradient": "from-rose-500 to-amber-600",
            "tags": ["已破甲", "都市日常", "反差傲娇", "禁断拉扯", "吃醋争宠", "调皮黏人"],
            "heat": "112.5k 玩过 · 51.3k 深度",
            "rating": "9.8",
            "handbook": c2_handbook,
            "roles": c2_roles,
            "scenes": c2_scenes,
            "styles": c2_styles,
            "first_turn": c2_first_turn,
            "custom_css": c2_cfg.get('built_in_css') or "",
            "custom_html": c2_app.get('description') or ""
        },
        {
            "uuid": "758e40b4-c1b3-4655-a83a-5ef136b60a2b",
            "alias": "deck_mother_sister_baby",
            "title": "成年了还把你当孩子的巨乳美母骚姐",
            "badge": "都市豪门 · 极致推拉",
            "badge_color": "bg-fuchsia-900/80 text-fuchsia-200 border-fuchsia-500/50",
            "author": "猫态工坊",
            "category": "都市",
            "cover_icon": "👠",
            "cover_title": "巨乳美母骚姐",
            "cover_subtitle": "超模姐姐·尤物母亲·大平层无防备同居",
            "logo": c3_app.get('cover') or "https://catai.wiki/0a9d1e66-a774-4a51-da39-63d5acba4c00/cover",
            "cover_image": c3_app.get('cover') or "https://catai.wiki/0a9d1e66-a774-4a51-da39-63d5acba4c00/cover",
            "theme_color": "bg-zinc-950/90 text-rose-200 border-rose-500/50",
            "btn_gradient": "from-pink-600 to-rose-700",
            "tags": ["已破甲", "都市生活", "巨乳美母", "模特姐姐", "无防备同居", "撞破自慰", "极致推拉"],
            "heat": "146.8k 玩过 · 68.9k 深度",
            "rating": "9.9",
            "handbook": c3_handbook,
            "roles": c3_roles,
            "scenes": c3_scenes,
            "styles": c3_styles,
            "first_turn": c3_first_turn,
            "custom_css": c3_cfg.get('built_in_css') or "",
            "custom_html": c3_app.get('description') or ""
        }
    ]

    conn = db_engine.db.get_connection()
    c = conn.cursor()
    desc_col = '"desc"' if db_engine.db.dialect == 'postgres' else '`desc`' if db_engine.db.dialect == 'mysql' else 'desc'

    for item in cards_to_insert:
        uuid_id = item['uuid']
        alias_id = item['alias']

        for target_id in [uuid_id, alias_id]:
            # Delete old stories row if exists
            c.execute("DELETE FROM stories WHERE id = %s" if db_engine.db.dialect == 'postgres' else "DELETE FROM stories WHERE id = ?", (target_id,))

            insert_story_sql = """
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """ if db_engine.db.dialect == 'postgres' else """
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """

            c.execute(insert_story_sql, (
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
            ))
            print(f"[+] Inserted story '{target_id}'")

        # Plaza card with UUID (delete by uuid, alias, or title first)
        c.execute("DELETE FROM plaza_cards WHERE id = %s OR id = %s OR title = %s" if db_engine.db.dialect == 'postgres' else "DELETE FROM plaza_cards WHERE id = ? OR id = ? OR title = ?", (uuid_id, alias_id, item['title']))
        insert_card_sql = f"""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, {desc_col}, rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """ if db_engine.db.dialect == 'postgres' else f"""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, {desc_col}, rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        c.execute(insert_card_sql, (
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
        ))
        print(f"[+] Inserted plaza_card '{uuid_id}'")


    conn.close()
    print("[+] Successfully inserted all 3 cards into database!")

if __name__ == '__main__':
    build_card_data()
