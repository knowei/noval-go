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

def run_import():
    with open('scripts/card_description.html', 'r', encoding='utf-8') as f:
        custom_html = f.read()

    with open('scripts/card_built_in_css.css', 'r', encoding='utf-8') as f:
        custom_css = f.read()

    with open('scripts/resp_4339eb70-6f5b-40f8-9f19-0da2d6acd6b7.json', 'r', encoding='utf-8') as f:
        api_data = json.load(f)

    app_info = api_data['data']['apps']
    model_cfg = api_data['data']['model_config']

    handbook = {
        "title": "【roll天赋/大世界，可bg,bl,gb,gl】从零开始的修仙日常",
        "desc": app_info.get('summary') or "欢迎来到最真实的修仙世界！这里你可以体验抽灵根，roll天赋，还可以从凡人开始修仙（也可以开局直接当大佬），众多门派任你挑选，正派反派随你选择，当人还是当妖还是当魔修可以，超高自由度！内置二十几个NPC任你挑选，可bg可bl可gb可gl",
        "bg_image": "https://free.picui.cn/free/2025/12/01/692c8049eabb9.jpg",
        "opening_options": model_cfg.get('suggested_questions') or [
            "今天是百年难得一遇的中州宗门统一开放招收弟子的日子……",
            "这是你们宗门招收弟子的日子，你作为长老理应前往……",
            "（自定义开场白）",
            "（输入“开启灵网”打开论坛，输入“关闭灵网”关闭论坛）"
        ]
    }

    roles = [
        {"name": "君亦尘", "role": "昆仑宗掌门", "desc": "外貌三十许岁，面如冠玉，紫金道袍。性格沉稳内敛，心怀天下苍生，行事公正严明，实则是位操心的“老父亲”。"},
        {"name": "萧寒衣", "role": "天剑门剑首", "desc": "胜雪白衣，衣角带陈旧血梅，背负麻布缠裹古剑。极度沉默寡言，纯粹的剑痴，战力惊世。"},
        {"name": "叶倾城", "role": "昆仑宗首席", "desc": "肌肤胜雪，万年玄冰雕琢般的玉人，素白长裙。极度高冷孤傲，一心向道的修炼狂魔。"},
        {"name": "魅姬", "role": "合欢宗宗主", "desc": "清纯与妖艳交织，紫裙赤足，脚踝系红绳金铃。随心所欲玩弄人心，视天下男子为玩物却从未动情。"},
        {"name": "温如玉", "role": "青囊药谷谷主", "desc": "面若冠玉，双目覆素白绫缎，浅青宽袖长衫。温和宽厚彬彬有礼，心眼通透能洞察人心。"},
        {"name": "君无邪", "role": "天魔教教主", "desc": "魔道第一美男，左金右黑摄人异瞳，暗金魔纹黑皇袍。狂傲霸道智多近妖，立志颠覆修仙界的枭雄。"}
    ]

    scenes = [
        {
            "title": "中州太白峰下 · 问仙大会 · 宗门招徒大典",
            "desc": "巍峨磅礴的昆仑仙山直插云霄，太白峰下云海翻涌，瑞气千条。百年难得一遇的中州宗门统一大典今日正式开启，各大正派魁首、中立世家、散修翘楚云集于此。测灵石柱在广场中央耸立，散发出变幻莫测的灵光。各派长老与亲传弟子高踞玉台，审视着台下前赴后继的求道者。天地灵气浩荡激荡，风云变幻，属于你的修仙纪元正在揭开帷幕……"
        }
    ]

    styles = {
        "dialogue_style": "修仙沉浸小说笔调，兼顾仙侠意境、人物心机推拉、道法摩擦与感官张力",
        "format": "AI风月标准双栏规范及.xiuxian-ui样式"
    }

    first_turn_demo = [
        {
            "index": 1,
            "isUser": False,
            "scene": "中州太白峰下 · 问仙大会 · 宗门招徒大典",
            "story": """<tl>📅时间：大典吉时 | 🌏世界：苍澜界 | 🏘️场所：中州太白峰下·问仙灵台</tl>

<article>
<p>巍峨直插入天穹的太白峰下，翻滚的七彩霞云如同怒浪翻腾。数以万计的求道者自九州四海跋涉而来，将整座白玉广场围得水泄不通。天际不时有划破虚空的凌厉剑光与华贵云舟飞掠而过，引来阵阵惊叹与抽气声。</p>

<p>“肃静——！”</p>

<p>天剑门长老洛崇珩声若奔雷，浑厚的灵压自高空垂落，瞬息压制全场喧哗。广场正中央，九根雕刻着上古真龙与玄武的测灵石柱陡然轰鸣，幽蓝、赤金与青翠的玄光在石柱纹路中疯狂游走。玉台之上，正道首座昆仑宗掌门君亦尘神色威严温和，天剑门剑首萧寒衣抱剑闭目不语，合欢宗妖娆妩媚的魅姬则掩唇轻笑，一双桃花眼饶有兴致地打量着台下神态各异的年轻人。</p>

<p><w>“若有身怀绝顶灵根或天生剑骨者，本门绝不吝赐下亲传令羽。”</w></p>

<p>台下人群之中，你深吸了一口气，掌心微微沁出薄汗。周围人的目光或期盼、或嫉妒、或警惕，所有人都在等待着你登上测灵台的那一刻。</p>
<p><thk>台上的各大宗门长老与暗中隐匿的魔修密探都在不动声色地注视着走上前台的每一个苗子，暗自盘算着此人的根骨与未来的道途价值……</thk></p>
</article>

<opt>
<suggested_questions>
<d>A. 【稳步登台测灵】：神色自若迈上测灵白玉台，将手掌贴向九龙测灵柱，毫无保留地展现自身灵根底蕴【策略评估：引动全场异象，直接成为各大顶级宗门争夺的热门天骄】</d>
<d>B. 【收敛隐匿锋芒】：暗中运转独门匿气法门压制灵压，只展露出平平无奇的双灵根资质【策略评估：藏木于林，避免成为众矢之的，为暗中行事提供掩护】</d>
<d>C. 【直面魔宗使者】：将目光投向广场角落戴着兜帽的血煞宗或万毒窟使者，传递桀骜不驯的魔道意志【策略评估：脱离正道桎梏，开启凶险莫测、快意恩仇的魔道修仙路】</d>
<d>D. 【开启灵网玉简】：从怀中取出万宝楼特制的水晶玉简，轻唤“开启灵网”查看全大陆最新八卦与实时宗门招收内幕【策略评估：解锁修仙界互联网论坛模式，搜集情报与修仙道友灌水】</d>
</suggested_questions>
</opt>""",
            "branches": [
                {"tag": "A", "title": "稳步登台展现灵根底蕴", "desc": "迈上测灵白玉台，将手掌贴向九龙测灵柱，引动全场异象"},
                {"tag": "B", "title": "收敛隐匿锋芒暗藏底牌", "desc": "暗中运转匿气法门压制灵压，只展现中庸资质，藏木于林"},
                {"tag": "C", "title": "直面暗处魔宗试探底线", "desc": "将视线投向边缘魔道使者，探寻非正统道途的别样可能"},
                {"tag": "D", "title": "开启灵网玉简搜集情报", "desc": "取出通讯玉简输入“开启灵网”，阅览修仙界论坛热帖与道友议论"}
            ]
        }
    ]

    conn = db_engine.db.get_connection()
    c = conn.cursor()

    card_uuid = '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7'
    card_alias = 'deck_xiuxian_world'
    title = '【roll天赋/大世界，可bg,bl,gb,gl】从零开始的修仙日常'
    badge = '高自由度修仙 · 苍澜界'

    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Insert into stories for both UUID and alias
    for target_id, target_title in [(card_uuid, title), (card_alias, '从零开始的修仙日常')]:
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
            target_title,
            badge,
            '⚔️',
            '从零开始的修仙日常',
            'roll天赋·大世界·开放探索',
            'https://catai.wiki/db5174e8-79b6-4fcc-a931-776ee4351000/cover',
            'bg-slate-900/90 text-sky-200 border-sky-600/50',
            'from-cyan-600 to-blue-700',
            json.dumps(handbook, ensure_ascii=False),
            json.dumps(roles, ensure_ascii=False),
            json.dumps(scenes, ensure_ascii=False),
            json.dumps(styles, ensure_ascii=False),
            json.dumps(first_turn_demo, ensure_ascii=False),
            custom_css,
            custom_html,
            '玄幻',
            now_str,
            now_str
        ))
        print(f"[+] Successfully inserted story '{target_id}' ({target_title})")

    # Insert into plaza_cards for UUID
    c.execute("DELETE FROM plaza_cards WHERE id = %s" if db_engine.db.dialect == 'postgres' else "DELETE FROM plaza_cards WHERE id = ?", (card_uuid,))
    
    tags = ["已破甲", "修仙大世界", "开放世界", "自由探索", "全性向", "高自由度", "角色创建", "灵网论坛"]
    desc_col = '"desc"' if db_engine.db.dialect == 'postgres' else '`desc`' if db_engine.db.dialect == 'mysql' else 'desc'
    
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
        card_uuid,
        card_uuid,
        title,
        badge,
        'bg-slate-900/90 text-sky-200 border-sky-600/50',
        '叶夏沂水（接定制）',
        handbook['desc'],
        '9.9',
        json.dumps(tags, ensure_ascii=False),
        '128.6k 玩过 · 45.2k 深度',
        0,
        'https://catai.wiki/db5174e8-79b6-4fcc-a931-776ee4351000/cover',
        'HOT',
        'fire',
        1,
        '玄幻',
        now_str
    ))
    print(f"[+] Successfully inserted plaza_card '{card_uuid}'")

    conn.close()
    print("[+] All card database operations completed!")

if __name__ == '__main__':
    run_import()
