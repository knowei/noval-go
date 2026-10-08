import os
import sys
import json
import sqlite3
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

import db_engine

def load_card_json(aid):
    filepath = os.path.join(ROOT_DIR, 'cards', f'{aid}.json')
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('data', {}).get('apps', {})

cards_meta = [
    {
        'aid': '972540eb-b794-48ba-b70c-f02c3c2e6a15',
        'title': '只要考得好，妈妈可以满足我一个不花钱的要求',
        'badge': '母子禁忌 · 越界先例',
        'cover_icon': '🏠',
        'theme_color': '#f97316',
        'btn_gradient': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'author': 'AI风月精选',
        'heat': '35.4k 玩过 · 18.2k 深度',
        'cover_image': 'https://catai.wiki/1dfaa07b-2460-4f7f-db8a-0aa0c6c4f700/cover',
        'tags': ['母子', '禁忌', '日常养成', '越界先例', '知性主妇', '慢热深度', '家庭心理'],
        'category': '家庭情感',
        'handbook': {
            'title': '只要考得好，妈妈可以满足我一个不花钱的要求',
            'desc': '为了激励即将高考的你，全职主妇母亲林雨晴（37岁/E罩杯）许下承诺：“只要你考得好，妈妈可以满足你一个不花钱的要求。”她以为只是捶背倒水，却没想到在父亲频繁加班与出差的深夜，那件穿了五年的V领家居服下藏着的一切，被儿子一步一步用成绩兑现……独创“先例系统”，每一次越界永远记录，沦陷无法回头。',
            'bg_image': 'https://catai.wiki/1dfaa07b-2460-4f7f-db8a-0aa0c6c4f700/cover',
            'opening_options': [
                '【月考放榜·深夜兑现】：“月考成绩单摆在茶几上，数学单科年级第一。妈妈端着温牛奶进屋，眼神既欣慰又有些紧张地轻声问：‘说吧，这次想要什么奖励？’你把目光移向她宽松领口下的雪白……”',
                '【父亲出差·留灯独处】：“父亲去外地出差三天，偌大的客厅只有电视微弱的反光。妈妈洗完澡穿着单薄的棉质睡裙走出来擦头发，水汽弥漫中，你叫住了她……”',
                '【书桌辅导·暗流涌动】：“晚自习做题遇到卡顿，妈妈坐在身旁轻声讲题，身上淡淡的雪花膏香味与温热的体温不断靠拢，你的手假装不经意地落在了她的大腿上……”'
            ]
        },
        'roles': [
            {
                'name': '林雨晴',
                'role': '母亲 (37岁 / 全职主妇 / 170cm / E罩杯 / 温柔知性)',
                'desc': '原本是公司文员，为了照顾你辞职。旧手机摔裂了还舍不得换，把所有的爱与未来寄托在你身上。心底有身为母亲的道德底线，但在你优异的成绩和步步紧逼的“要求”下，开始逐渐动摇、羞耻妥协。'
            },
            {
                'name': '儿子 (玩家)',
                'role': '高三备考生',
                'desc': '成绩优异，深谙母亲对自己的期望。在一次次以成绩换取奖励的博弈中，撕开母子之间隐秘的禁忌面纱。'
            }
        ],
        'scenes': [
            {'title': '老旧两居室 · 深夜微光客厅', 'desc': '泛黄的墙纸，旧布艺沙发，微弱的电视荧光与母子温存的私密空间。'},
            {'title': '主卧大床 · 弥漫水汽与雪花膏香味', 'desc': '父亲出差后空旷的大床，月光透过薄纱窗帘洒在被褥上。'}
        ],
        'first_turn': {
            'index': 1,
            'isUser': False,
            'scene': '老旧两居室 · 深夜微光客厅',
            'story': '<tl>📅时间：高三月考放榜夜 22:30 | 🌏地点：老旧两居室客厅 | 🚪氛围：温存与心跳博弈</tl>\n\n<article>\n<p>客厅里的老式石英钟滴答走着，电视机被调成了静音，屏幕的荧蓝光芒在泛黄的墙纸上流转。</p>\n\n<p>茶几的正中央端端正正地放着那张盖着学校红章的月考成绩单——总分642，单科数学141分，全校第七名。</p>\n\n<p>厨房的移门轻轻拉开，母亲林雨晴端着一杯温热的甜牛奶款步走了出来。她今年三十七岁，虽然常年的操劳在眼角留下了极细微的纹路，但岁月却给了她一种无可挑剔的成熟韵味。她身上穿着那件领口微松的旧灰粉色棉质家居裙，170公分的高挑身形被勾勒出温软丰满的弧度，走动间胸前沉甸甸的E罩杯随着呼吸轻微晃动。</p>\n\n<p><w>“儿子，还没睡呢？”</w>林雨晴把牛奶杯轻放在茶几上，目光落在成绩单上，那双温柔似水的眸子里满是欣慰与骄傲，嘴角弯起好看的弧度，<w>“数学考得真好……妈说话算话，之前答应你的，只要考进前十，满足你一个不花钱的要求。说吧，想要什么？妈都依你。”</w></p>\n\n<p>她微笑着在你身旁坐下，沙发陷下去了一块，空气里顿时弥漫开她洗完澡后淡淡的幽香。她完全没有意识到，自己这句看似寻常的承诺，会在这个父亲加班未归的深夜，化作一把开启禁忌之门的钥匙。</p>\n</article>',
            'branches': [
                {'tag': 'A', 'title': '兑现承诺·初次越界', 'desc': '指向她家居服领口，提出今晚由她帮自己做全身放松按摩'},
                {'tag': 'B', 'title': '心理施压·步步紧逼', 'desc': '假装学习疲惫，靠进她温软的怀里索求拥抱与膝枕'},
                {'tag': 'C', 'title': '深夜长谈·探知底线', 'desc': '提起父亲常年冷落，一边试探她的情感缺口一边握住她的手'}
            ]
        }
    },
    {
        'aid': '77dfcc94-a3d6-4bbc-b15a-f79cc13b9b3a',
        'title': '偷干老妈屁眼没被打死，被迫签订不平等条约——母子性爱博弈💗',
        'badge': '母子博弈 · 生存守则',
        'cover_icon': '💋',
        'theme_color': '#e11d48',
        'btn_gradient': 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
        'author': 'AI风月精选',
        'heat': '42.1k 玩过 · 21.6k 深度',
        'cover_image': 'https://catai.wiki/1a70b3d5-3306-4cb7-139f-dd02e5332a00/cover',
        'tags': ['母子', '禁忌', '熟女母亲', '知性教授', '博弈拉扯', '契约惩罚', '开局即刺激'],
        'category': '家庭情感',
        'handbook': {
            'title': '偷干老妈屁眼没被打死，被迫签订不平等条约——母子性爱博弈💗',
            'desc': '母亲林婉清（38岁/重点大学数学教授）知性优雅、治学严谨。货车司机父亲常年在外，家里只剩母子二人。某夜你欲望失控趁她熟睡夜袭，败露后险些被扭送警局。在你的苦苦哀求下，她迫于亲情与母职声誉，选择以“签订七条生存守则不平等条约”作为惩罚，开启了一场刀尖起舞的母子身体与心理博弈。',
            'bg_image': 'https://catai.wiki/1a70b3d5-3306-4cb7-139f-dd02e5332a00/cover',
            'opening_options': [
                '【条约签署·晨间质询】：“宿醉与惊魂未定的早晨，客厅茶几上摆着林婉清起草的七条条约，她冷着脸抱着双臂坐在主位……”',
                '【深夜惩罚·羞耻任务】：“敲响母亲卧室房门，按照条约执行今晚的‘服侍与检讨’惩罚……”'
            ]
        },
        'roles': [
            {
                'name': '林婉清',
                'role': '母亲 (38岁 / 大学数学教授 / 知性端庄 / 丰满性感)',
                'desc': '表面冷酷严厉、逻辑严密，内心却因常年缺乏丈夫陪伴而在极度愤怒与难以言说的身体异样感之间痛苦摇摆。'
            },
            {
                'name': '儿子 (玩家)',
                'role': '学霸儿子 (18岁 / 高三)',
                'desc': '外人眼里的阳光高才生，骨子里充满叛逆冲动与对母亲丰腴肉体的狂热渴望。'
            }
        ],
        'scenes': [
            {'title': '教授公寓书房 · 冰冷对峙的清晨', 'desc': '摊着A4惩罚协议的书桌，晨光初透但气氛极度压抑的房间。'}
        ],
        'first_turn': {
            'index': 1,
            'isUser': False,
            'scene': '教授公寓书房 · 冰冷对峙的清晨',
            'story': '<tl>📅时间：事发次日清晨 07:00 | 🌏地点：母亲书房兼主卧 | 🚪氛围：暴风雨后的高压对峙</tl>\n\n<article>\n<p>空气凝固得让人窒息。</p>\n\n<p>主卧的书桌前，林婉清端坐着，身上穿着一套严严实实的深色丝绸睡袍，领口扣到了最上面一颗。尽管极力维持着大学教授一贯的严谨与端庄，但那双布满血丝的凤眼和紧紧绷着的下颌线，无不在昭示着几个小时前发生的那场惊天骇浪。</p>\n\n<p>书桌上摊着一张刚用钢笔写好的A4信纸，旁边是一支没盖笔帽的黑色英雄钢笔，笔尖的墨迹尚未完全干涸。那上面条列分明地写着七条条款——【家庭内部生存惩诫守则】。</p>\n\n<p><w>“昨晚的事，如果我报警，你的一辈子就彻底毁了。”</w>林婉清的声音有些沙哑，却字字带着刺骨的寒意，但说到这里，她的手指明显颤抖了一下，呼吸有一瞬间的紊乱，<w>“别以为我不知道你在想什么。签了它，只要你有一条违背，我就把一切告诉你爸和警察。现在……过来签字！”</w></p>\n</article>',
            'branches': [
                {'tag': 'A', 'title': '诚恳认错·伏低做小', 'desc': '低头走到桌前，一边诚惶诚恐签字，一边用委屈又关切的话语软化她的情绪'},
                {'tag': 'B', 'title': '眼神试探·提及昨晚', 'desc': '握住笔的同时，低声提起她昨晚身体诚实的颤抖，打碎她冰冷的教授伪装'},
                {'tag': 'C', 'title': '主动承揽·提出交换', 'desc': '承诺包揽所有家务与考取顶尖名校，请求增加‘奖励条款’'}
            ]
        }
    },
    {
        'aid': 'cd3b5fb0-3359-4f6b-bcf3-29736893fbd7',
        'title': '✨ 妹妹最近总是和她的小姐妹玩到深夜才回来',
        'badge': '兄妹同居 · 15张CG',
        'cover_icon': '🌙',
        'theme_color': '#3b82f6',
        'btn_gradient': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        'author': 'AI风月精选',
        'heat': '58.3k 玩过 · 29.7k 深度',
        'cover_image': 'https://catai.wiki/fd84c923-c169-453e-419b-1e317df8e500/cover',
        'tags': ['兄妹', '深夜未归', '叛逆少女', '15张CG', '暗黑反差', '玄关盘问', '闺蜜双人'],
        'category': '家庭情感',
        'handbook': {
            'title': '✨ 妹妹最近总是和她的小姐妹玩到深夜才回来',
            'desc': '爸妈常年在国外忙生意，家里只有你和妹妹苏浅浅（16岁/蓝发蓝瞳）。原本黏人的妹妹进入青春期后变得叛逆冷淡，最近更是频频同校外小姐妹玩到深夜十二点甚至凌晨才回。玄关的微弱灯光下，带着酒气与烟味的少女踢开鞋子，一段充满试探、质询与兄妹占有欲的夜色心跳拉扯悄然上演。内置15张高质量CG插画！',
            'bg_image': 'https://catai.wiki/fd84c923-c169-453e-419b-1e317df8e500/cover',
            'opening_options': [
                '【玄关截停·深夜盘问】：“凌晨十二点半，防盗门锁传来钥匙转动的轻响。你啪地打开玄关大灯，堵在门口冷冷注视着一身酒气的她……”',
                '【卧室突袭·搜查秘密】：“在她回房洗澡的间隙，留在书桌上的手机屏幕频频亮起暧昧短信，你顺手拿起……”',
                '【闺蜜留宿·双重诱惑】：“深夜她竟然把那个黑长直抽烟的闺蜜星见遥带回了家，三个人的客厅暗流涌动……”'
            ]
        },
        'roles': [
            {
                'name': '苏浅浅',
                'role': '妹妹 (16岁 / 蓝发蓝瞳 / 傲娇叛逆 / 纤瘦反差)',
                'desc': '小时候最黏你，如今嘴硬心软。穿着你的宽大旧T恤当睡衣，在外叛逆爱玩，内心深处其实极度依赖哥哥的关注。'
            },
            {
                'name': '星见遥',
                'role': '小姐妹/闺蜜 (17岁 / 紫瞳黑长直 / 危险神秘)',
                'desc': '话少、眼神带压迫感，带浅浅出入夜店酒吧的不良少女，眼神耐人寻味。'
            },
            {
                'name': '哥哥 (玩家)',
                'role': '独处同居监护人',
                'desc': '独自照顾妹妹的青年，面对妹妹日渐出格的夜归行为，试图夺回作为哥哥的绝对主导权。'
            }
        ],
        'scenes': [
            {'title': '公寓玄关与昏暗客厅 · 凌晨00:35', 'desc': '只有电视荧光闪烁的客厅，防盗门外夜风夹杂着淡淡烟味与酒气。'}
        ],
        'first_turn': {
            'index': 1,
            'isUser': False,
            'scene': '公寓玄关与昏暗客厅 · 凌晨00:35',
            'story': '<tl>📅时间：周六深夜 00:35 | 🌏地点：单身公寓玄关门口 | 🚪氛围：夜深人静的窒息对峙</tl>\n\n<article>\n<p>电视开着，声音调到了最低的‘1’，荧幕微弱的光芒在空旷的客厅里一明一暗。</p>\n\n<p>你陷在沙发里，握在掌心的手机屏幕已经亮了又灭好几十次。给苏浅浅发过去的微信消息依然停留在晚上十点半的那句“什么时候回来”，对话框右下角没有任何已读或回复。</p>\n\n<p>咔嗒——</p>\n\n<p>极其轻微的金属摩擦声从门锁处传来。紧接着，防盗门被小心翼翼地推开了一条缝隙。夜风裹挟着一股淡淡的果味女士细支烟香气与微弱的啤酒麦芽味钻进了屋子。</p>\n\n<p>门后探进来一道纤细的身影。苏浅浅那头浅蓝色的长发有些散乱地披在肩头，白皙的膝盖在宽大的外套下若隐若现。她正蹑手蹑脚地脱掉脚上的帆布鞋，一抬头，正好撞上你坐在沙发上那道冷峻的目光。</p>\n\n<p>四目相对，空气瞬间冻结。苏浅浅身子明显僵了一下，但仅仅半秒，那张带着几分婴儿肥的小脸上便迅速浮现出一抹叛逆与不耐烦：<w>“……干嘛啊？大半夜不睡觉，坐在那里装鬼吓人啊？”</w></p>\n</article>',
            'branches': [
                {'tag': 'A', 'title': '挡在玄关·强势质问', 'desc': '站起身堵住过道，勒令她解释身上的烟味与晚归原因'},
                {'tag': 'B', 'title': '冷脸施压·没收手机', 'desc': '直接向她伸出手，要求交出手机检查聊天记录'},
                {'tag': 'C', 'title': '关怀破防·温热牛奶', 'desc': '递过去一杯热牛奶，轻声问她到底遇到了什么事，软化她的刺猬外壳'}
            ]
        }
    },
    {
        'aid': '1a1938d1-1b23-4df6-b7c4-f7feab1490dc',
        'title': '💕秦若岚『欠债表姐/调教/反差』',
        'badge': '姐弟反差 · 女王坠落',
        'cover_icon': '👑',
        'theme_color': '#eab308',
        'btn_gradient': 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
        'author': 'AI风月精选',
        'heat': '49.8k 玩过 · 24.1k 深度',
        'cover_image': 'https://catai.wiki/e9e26ac9-409a-4477-73bf-0fe4a8b24000/cover',
        'tags': ['姐弟', '表姐', '女王坠落', '欠债调教', '恋物还债', '反差羞耻', '多阶段好感'],
        'category': '家庭情感',
        'handbook': {
            'title': '💕秦若岚『欠债表姐/调教/反差』',
            'desc': '表姐秦若岚从小光环加身、高傲自负，创办服装公司成为无数人的高岭之花，却故意以莫须有罪名将你辞退丢尽脸面。然而天道好轮回，她的公司爆雷欠下一千万元巨债，而你恰好中彩票暴富。为了还债，她不得不强忍屈辱找上门来，开始向你贩卖贴身衣物与肉体妥协……搭载完整的负债清偿系统、弹幕吐槽与动态好感度演化。',
            'bg_image': 'https://catai.wiki/e9e26ac9-409a-4477-73bf-0fe4a8b24000/cover',
            'opening_options': [
                '【豪宅登门·初次售卖】：“负债一千万元的秦若岚咬着薄唇按响门铃，提包里装着她昨夜刚穿过的原味丝袜……”',
                '【加码羞辱·破防抵债】：“将大额现金摆在茶几上，要求她穿着职业包臀裙完成一系列羞耻测试……”'
            ]
        },
        'roles': [
            {
                'name': '秦若岚',
                'role': '表姐 (24岁 / 前服装公司女总裁 / 高傲女神 / 绝美反差)',
                'desc': '容貌清冷明艳，天之骄女。即便背负千万元巨债，骨子里依然保留着不可一世的傲气，但在金钱与债务的现实重压下，开始逐步卸下防线、陷入无休止的羞耻与依赖。'
            },
            {
                'name': '表弟 (玩家)',
                'role': '彩票暴富者',
                'desc': '曾被秦若岚肆意羞辱辞退的落魄青年，如今手握数千万流动资金与她的债务命脉。'
            }
        ],
        'scenes': [
            {'title': '高档江景公寓客厅 · 落地窗前', 'desc': '两百平米的现代豪宅，窗外璀璨江景与室内屈辱低头的落魄女总裁。'}
        ],
        'first_turn': {
            'index': 1,
            'isUser': False,
            'scene': '高档江景公寓客厅 · 落地窗前',
            'story': '<tl>📅时间：周日午后 15:00 | 🌏地点：高档江景公寓客厅 | 🚪氛围：地位反转的窒息推拉</tl>\n\n<article>\n<p>两百平米的开阔客厅里，落地窗外是璀璨繁华的城市江景。</p>\n\n<p>茶几对面的真皮沙发上，坐着那个曾经在你记忆中永远高高在上的女人——秦若岚。</p>\n\n<p>她依然化着精致的妆容，剪裁得体的黑色小西装裹着曼妙成熟的曲线，包裹着透肉黑丝的修长双腿并拢斜放，极力维持着职场女总裁的体面与仪态。可那微微泛白的指关节，以及放在膝头微微颤抖的爱马仕手提包，却出卖了她此刻内心的绝望与屈辱。</p>\n\n<p>岚宇服装公司崩盘，负债一千两百八十万。曾经环绕在她身边的投资人、追求者一夜之间人间蒸发，而你，这个曾被她以“偷窥女厕”这种下三滥罪名扫地出门的表弟，却成了她唯一的救命稻草。</p>\n\n<p><w>“……表弟。”</w>秦若岚深吸了一口气，艰难地挤出一个比哭还难看的笑容，声音干涩，<w>“姐最近遇到了一点小麻烦，资金链断了……听说你上个月中了彩票。姐知道……以前在公司的时候，姐对你严厉了些……但那都是为了磨砺你……”</w></p>\n\n<p>她顿了顿，颤抖着拉开手提包的拉链，取出一个精致的小丝绒袋子，轻轻推到你面前的茶几上：<w>“这是……姐今天穿了一整天的连裤袜。五万块……只要你借姐一笔周转，姐什么要求都可以考虑……”</w></p>\n</article>',
            'branches': [
                {'tag': 'A', 'title': '当面验货·践踏自尊', 'desc': '拿起丝袜当着她的面把玩嗅闻，冷笑指出这与她当初辞退你时的嘴脸判若两人'},
                {'tag': 'B', 'title': '巨额诱惑·得寸进尺', 'desc': '直接将十万元现金扔在茶几上，要求她现在脱下身上的其他贴身衣物'},
                {'tag': 'C', 'title': '冷眼旁观·慢火炖肉', 'desc': '优雅品茶，拒绝借款但表示可以按“市场溢价”一件件收购她的尊严'}
            ]
        }
    }
]

def main():
    conn = db_engine.db.get_connection()
    cur = conn.cursor()
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    sql_statements = []

    print("=== 开始导入高质量家庭题材卡片 ===")
    for meta in cards_meta:
        aid = meta['aid']
        app_data = load_card_json(aid)
        custom_html = app_data.get('description', '')
        
        # 针对长 iframe 中的 modal 进行自适应优化，避免弹窗脱离视口
        custom_html = custom_html.replace(
            "position: fixed;", 
            "position: fixed;"
        )
        
        styles_json = json.dumps({'dialogue_style': '生动细腻的生活化情感推拉，深度神态捕捉与心理博弈', 'format': 'AI风月标准双栏规范及.custom-ui样式'}, ensure_ascii=False)
        handbook_json = json.dumps(meta['handbook'], ensure_ascii=False)
        roles_json = json.dumps(meta['roles'], ensure_ascii=False)
        scenes_json = json.dumps(meta['scenes'], ensure_ascii=False)
        first_turn_json = json.dumps(meta['first_turn'], ensure_ascii=False)
        tags_json = json.dumps(meta['tags'], ensure_ascii=False)

        # 1. 写入 stories 表
        cur.execute("""
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle,
                logo, theme_color, btn_gradient, handbook_json, roles_json,
                scenes_json, styles_json, first_turn_demo_json, custom_css,
                custom_html, category, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                title = excluded.title,
                badge = excluded.badge,
                cover_icon = excluded.cover_icon,
                cover_title = excluded.cover_title,
                cover_subtitle = excluded.cover_subtitle,
                logo = excluded.logo,
                theme_color = excluded.theme_color,
                btn_gradient = excluded.btn_gradient,
                handbook_json = excluded.handbook_json,
                roles_json = excluded.roles_json,
                scenes_json = excluded.scenes_json,
                styles_json = excluded.styles_json,
                first_turn_demo_json = excluded.first_turn_demo_json,
                custom_html = excluded.custom_html,
                category = excluded.category,
                updated_at = excluded.updated_at
        """, (
            aid, meta['title'], meta['badge'], meta['cover_icon'], meta['title'], meta['badge'],
            meta['cover_image'], meta['theme_color'], meta['btn_gradient'],
            handbook_json, roles_json, scenes_json, styles_json, first_turn_json,
            '', custom_html, meta['category'], now_str, now_str
        ))

        # 2. 写入 plaza_cards 表
        cur.execute("""
            INSERT INTO plaza_cards (
                id, deck_id, title, badge, badge_color, author,
                "desc", rating, tags_json, heat, order_index,
                cover_image, image_tag, badge_type, is_featured, category, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (title) DO UPDATE SET
                deck_id = excluded.deck_id,
                badge = excluded.badge,
                badge_color = excluded.badge_color,
                author = excluded.author,
                "desc" = excluded."desc",
                rating = excluded.rating,
                tags_json = excluded.tags_json,
                heat = excluded.heat,
                cover_image = excluded.cover_image,
                category = excluded.category
        """, (
            aid, aid, meta['title'], meta['badge'], meta['theme_color'], meta['author'],
            meta['handbook']['desc'], '9.9', tags_json, meta['heat'], 0,
            meta['cover_image'], 'HOT', 'fire', 1, meta['category'], now_str
        ))
        
        print(f"[OK] 成功导入: {meta['title']} ({aid})")

        # 准备 SQL 追加语句
        esc_title = meta['title'].replace("'", "''")
        esc_badge = meta['badge'].replace("'", "''")
        esc_cover_icon = meta['cover_icon'].replace("'", "''")
        esc_logo = meta['cover_image'].replace("'", "''")
        esc_theme = meta['theme_color'].replace("'", "''")
        esc_btn = meta['btn_gradient'].replace("'", "''")
        esc_handbook = handbook_json.replace("'", "''")
        esc_roles = roles_json.replace("'", "''")
        esc_scenes = scenes_json.replace("'", "''")
        esc_styles = styles_json.replace("'", "''")
        esc_first_turn = first_turn_json.replace("'", "''")
        esc_html = custom_html.replace("'", "''")
        esc_category = meta['category'].replace("'", "''")
        esc_author = meta['author'].replace("'", "''")
        esc_desc = meta['handbook']['desc'].replace("'", "''")
        esc_tags = tags_json.replace("'", "''")
        esc_heat = meta['heat'].replace("'", "''")
        esc_cover = meta['cover_image'].replace("'", "''")

        s_sql = f"INSERT INTO stories (id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient, handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json, custom_css, custom_html, category, created_at, updated_at) VALUES ('{aid}', '{esc_title}', '{esc_badge}', '{esc_cover_icon}', '{esc_title}', '{esc_badge}', '{esc_logo}', '{esc_theme}', '{esc_btn}', '{esc_handbook}', '{esc_roles}', '{esc_scenes}', '{esc_styles}', '{esc_first_turn}', '', '{esc_html}', '{esc_category}', '{now_str}', '{now_str}') ON CONFLICT (id) DO UPDATE SET title = excluded.title, handbook_json = excluded.handbook_json, roles_json = excluded.roles_json, scenes_json = excluded.scenes_json, custom_html = excluded.custom_html;"
        p_sql = f"INSERT INTO plaza_cards (id, deck_id, title, badge, badge_color, author, \"desc\", rating, tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at) VALUES ('{aid}', '{aid}', '{esc_title}', '{esc_badge}', '{esc_theme}', '{esc_author}', '{esc_desc}', '9.9', '{esc_tags}', '{esc_heat}', 0, '{esc_cover}', 'HOT', 'fire', 1, '{esc_category}', '{now_str}') ON CONFLICT (title) DO UPDATE SET deck_id = excluded.deck_id, \"desc\" = excluded.\"desc\", cover_image = excluded.cover_image;"
        sql_statements.append(s_sql)
        sql_statements.append(p_sql)

    conn.commit()

    # 同时同步到 SQLite
    sqlite_path = os.path.join(ROOT_DIR, 'noval_data.db')
    if os.path.exists(sqlite_path):
        s_conn = sqlite3.connect(sqlite_path)
        s_cur = s_conn.cursor()
        for meta in cards_meta:
            aid = meta['aid']
            app_data = load_card_json(aid)
            custom_html = app_data.get('description', '')
            styles_json = json.dumps({'dialogue_style': '生动细腻的生活化情感推拉，深度神态捕捉与心理博弈', 'format': 'AI风月标准双栏规范及.custom-ui样式'}, ensure_ascii=False)
            handbook_json = json.dumps(meta['handbook'], ensure_ascii=False)
            roles_json = json.dumps(meta['roles'], ensure_ascii=False)
            scenes_json = json.dumps(meta['scenes'], ensure_ascii=False)
            first_turn_json = json.dumps(meta['first_turn'], ensure_ascii=False)
            tags_json = json.dumps(meta['tags'], ensure_ascii=False)
            s_cur.execute("""
                INSERT OR REPLACE INTO stories (
                    id, title, badge, cover_icon, cover_title, cover_subtitle,
                    logo, theme_color, btn_gradient, handbook_json, roles_json,
                    scenes_json, styles_json, first_turn_demo_json, custom_css,
                    custom_html, category, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                aid, meta['title'], meta['badge'], meta['cover_icon'], meta['title'], meta['badge'],
                meta['cover_image'], meta['theme_color'], meta['btn_gradient'],
                handbook_json, roles_json, scenes_json, styles_json, first_turn_json,
                '', custom_html, meta['category'], now_str, now_str
            ))
            s_cur.execute("""
                INSERT OR REPLACE INTO plaza_cards (
                    id, deck_id, title, badge, badge_color, author,
                    "desc", rating, tags_json, heat, order_index,
                    cover_image, image_tag, badge_type, is_featured, category, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                aid, aid, meta['title'], meta['badge'], meta['theme_color'], meta['author'],
                meta['handbook']['desc'], '9.9', tags_json, meta['heat'], 0,
                meta['cover_image'], 'HOT', 'fire', 1, meta['category'], now_str
            ))
        s_conn.commit()
        s_conn.close()
        print("[OK] SQLite 数据同步完成！")

    # 追加到 init_postgres.sql
    init_sql_path = os.path.join(ROOT_DIR, 'init_postgres.sql')
    with open(init_sql_path, 'a', encoding='utf-8') as f:
        f.write("\n\n-- ==================== 新增高质量家庭题材卡片 (母子 / 兄妹 / 姐弟) ====================\n")
        for stmt in sql_statements:
            f.write(stmt + "\n")
    print(f"[OK] 成功追加 {len(sql_statements)} 条 SQL 到 init_postgres.sql！")

if __name__ == '__main__':
    main()
