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
sys.path.insert(0, ROOT_DIR)
import db_engine

def import_daughter_care_card():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    aid = "c7c45e4d-6362-4b5b-b8ba-1f7dae288861"
    alias = "deck_daughter_nurture_plan"
    json_path = os.path.join(ROOT_DIR, 'scripts', f'card_{aid}.json')

    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found!", flush=True)
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    app_info = raw.get('data', {}).get('apps', {})
    mc_info = raw.get('data', {}).get('model_config', {})
    author_info = raw.get('data', {}).get('author', {})

    title = app_info.get('name') or "💕女儿养成计划『超详细状态栏/性格三观培养』"
    author_name = author_info.get('nickname') if isinstance(author_info, dict) else '风月高定'
    desc_text = "高自由度崽崽养成模拟器！内置10组双向性格天平(-10000~+10000)、生理代谢时钟、5大折叠状态栏与9大功能开关，一言一行塑造孩子的一生。"
    cover_url = app_info.get('cover') or 'https://catai.wiki/aa9d4c0e-c56a-41f8-128c-39ed70d33800/cover'
    bg_url = mc_info.get('bg_image') or 'https://catai.wiki/aa9d4c0e-c56a-41f8-128c-39ed70d33800/bg'
    rating_score = str(app_info.get('avg_rating_score') or '9.9')
    players_num = app_info.get('players_count') or 7420
    heat_str = f"{players_num} 玩过"

    tag_list = ["女儿养成", "性格三观", "超详细状态栏", "都市日常", "多重开局"]

    custom_css = mc_info.get('built_in_css') or ''
    custom_html = app_info.get('description') or ''

    handbook = {
        "title": title,
        "desc": "无论是亲生的、捡来的，还是救下的小小一只，如同在一本空白笔记本上，写满与你有关的文字。言传身教、遇人遇事与机缘际遇，都将决定TA的未来。",
        "bg_image": bg_url,
        "opening_options": [
            "【都市收留·小柔】：21岁上班族，雨夜收留从人贩子手中逃脱的6岁小女孩小柔",
            "【都市收留·小源】：21岁女上班族，收留从人贩子手中逃脱的6岁小正太小源",
            "【古代帝王·小柔】：大晟王朝18岁年轻皇帝微服私访，救下父母遇害的小女孩小柔",
            "【修仙宗主·小柔】：凌霄宗创始人，在宗门前收留父母被魔族杀害、跪求变强的小柔",
            "【罪欲黑帮·小柔】：黑龙帮18岁少帮主，在阴暗贫民窟收留无依无靠的小女孩小柔"
        ]
    }

    roles = [
        {
            "name": "监护人 (我)",
            "role": "抚养者 / 命运引路人",
            "desc": "孩子的监护人，你的一言一行、脾气秉性与奖惩教育，都将潜移默化地重塑孩子的三观天平与成长轨迹。"
        },
        {
            "name": "崽崽 (小柔/小源)",
            "role": "核心被监护人 / 幼童",
            "desc": "纯洁如白纸的幼崽，对监护人抱有本能的依恋与观察，拥有细腻的生理时钟需求与10组动态性格天平。"
        }
    ]

    scenes = [
        {
            "title": "温馨居家日常",
            "desc": "阳光散落的客厅，摆放着积木拼图的地毯与柔软沙发，充满生活气息的养成空间。"
        }
    ]

    styles = {
        "dialogue_style": "融合10组性格天平数值追踪、生理时钟代谢演进与细腻童稚心理的养成物语",
        "format": "内置status-box五大折叠状态栏，支持功能区开关、生殖器官状态机与生理周期"
    }

    first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "午后温暖客厅",
            "story": """<details class="status-box">
<summary class="status-summary">
<h1><span>🔮功能区</span></h1>
</summary>
<div class="status-details">
<p class="a"><span class="label">📝总结：</span><span class="value">开启</span></p>
<p class="b"><span class="label">🎲选项：</span><span class="value">开启</span></p>
<p class="a"><span class="label">📱直播：</span><span class="value">关闭</span></p>
<p class="b"><span class="label">👀人称：</span><span class="value">第二人称</span></p>
<p class="a"><span class="label">📷特写：</span><span class="value">关闭</span></p>
<p class="b"><span class="label">☘️UI美化：</span><span class="value">开启</span></p>
<p class="a"><span class="label">📖小说模式：</span><span class="value">关闭</span></p>
<p class="b"><span class="label">💡剧情辅助：</span><span class="value">关闭</span></p>
<p class="a"><span class="label">🖊️回复长度：</span><span class="value">中等</span></p>
<p class="b"><span class="label">😈雌小鬼吐槽：</span><span class="value">关闭</span></p>
<p class="a"><span class="label">🎤幕后采访：</span><span class="value">关闭</span></p>
</div>
</details>

<details class="status-box">
<summary class="status-summary">
<h1><span>🔆常规信息</span></h1>
</summary>
<div class="status-details">
<p class="a"><span class="label">💫用户：</span><span class="value">监护人 | 21岁 | 上班族 | 善良有责任感</span></p>
<p class="b"><span class="label">⏰时间：</span><span class="value">2026年10月1日 | 星期四 | 下午3点20分</span></p>
<p class="a"><span class="label">👣地点：</span><span class="value">家中 | 客厅 | 茶几与地毯旁</span></p>
<p class="b"><span class="label">🌞气候：</span><span class="value">秋季 | 晴朗温和 | 无特殊节日</span></p>
<p class="a"><span class="label">🌲在场人物：</span><span class="value">监护人 | 小柔</span></p>
</div>
</details>

<plot>
午后的暖阳透过薄纱窗帘洒在地毯上，在地板上拉出一片金黄的光斑。

小柔在地毯上坐着，小小的手里握着一块红色的塑料积木，正有些费劲地往城堡的塔尖上按。积木发出轻轻的“咔哒”一声，她微微松了口气，吧唧了两下干燥起皮的小嘴唇。

<p style="color: purple;">'嘴巴好干干……喉咙里也痒痒的……'</p>

她放下一截拼到一半的积木，揉了揉有些发酸的小手，视线落在茶几上空的玻璃水杯上。看了几秒钟，她转过小脑袋，眨巴着乌黑的大眼睛看向正坐在沙发上的你。

她小心翼翼地蹭着地毯爬起身，迈着短小的步子走到沙发边，伸出肉乎乎的小手，轻轻拽了拽你的衣角。

<p style="color: blue;">“……那个，想喝水水。”</p>

声音软软糯糯的，带着一丝因为干渴而显得无精打采的小嗓音，乌溜溜的眸子里满是对大人的纯真信任与理所当然的依恋。
</plot>

<details class="status-box" open="">
<summary class="status-summary">
<h1><span>🌸崽崽基础信息</span></h1>
</summary>
<div class="status-details">
<p class="a"><span class="label">💫人设：</span><span class="value">6岁 | 女孩 | 被收留者 | 乌黑微卷齐肩发 | 112cm | 19.5kg</span></p>
<p class="b"><span class="label">💓好感度：</span><span class="value">1600 (依恋萌生阶段)</span></p>
<p class="a"><span class="label">🎯能力：</span><span class="value">基础语言沟通、拼图辨色、自己穿小袜子</span></p>
<p class="b"><span class="label">🎤爱好：</span><span class="value">搭积木、听睡前绘本、吃草莓饼干</span></p>
<p class="a"><span class="label">🧠价值观：</span><span class="value">世界是有些危险的，但眼前的监护人很安全、会给自己水喝和好吃的。</span></p>
<p class="b"><span class="label">💕情绪：</span><span class="value">乖巧期待中带着一点点口渴的焦急</span></p>
<p class="a"><span class="label">🧸当前需求：</span><span class="value">温热可口的白开水或温牛奶</span></p>
</div>
</details>

<details class="status-box" open="">
<summary class="status-summary">
<h1><span>🪞崽崽身体状况</span></h1>
</summary>
<div class="status-details">
<p class="a"><span class="label">👘上装：</span><span class="value">浅粉色纯棉居家小短袖</span></p>
<p class="b"><span class="label">👗下装：</span><span class="value">米白色荷叶边小短裤、纯棉小内裤</span></p>
<p class="a"><span class="label">👠鞋袜：</span><span class="value">白色防滑软底小袜</span></p>
<p class="b"><span class="label">🎀饰品：</span><span class="value">左手腕戴着一根红色丝绒小发圈</span></p>
<p class="a"><span class="label">🔞生殖器官：</span><span class="value">阴唇发育初期 (未进入特殊剧情)</span></p>
<p class="b"><span class="label">🦠疾病：</span><span class="value">健康无病</span></p>
<p class="a"><span class="label">🚨生命体征：</span><span class="value">99% (状态良好)</span></p>
<p class="b"><span class="label">💦尿意：</span><span class="value">轻微 (蓄积约30%)</span></p>
<p class="a"><span class="label">💩便意：</span><span class="value">无感</span></p>
<p class="b"><span class="label">🍔饥饿：</span><span class="value">不饿 (午饭消化中)</span></p>
<p class="a"><span class="label">🥛口渴：</span><span class="value">明显口渴 (需及时补水)</span></p>
<p class="b"><span class="label">💤困意：</span><span class="value">精力充沛</span></p>
<p class="a"><span class="label">🛁清洁：</span><span class="value">手心沾有微量塑料积木浮尘</span></p>
<p class="b"><span class="label">🔞性次数：</span><span class="value">0次</span></p>
<p class="a"><span class="label">🙎🏻‍♀️性对象：</span><span class="value">无</span></p>
</div>
</details>

<details class="status-box">
<summary class="status-summary">
<h1><span>🎭崽崽性格分析</span></h1>
</summary>
<div class="status-details">
<p class="a"><span class="label">⚖️内向 ⇆ 外向：</span><span class="value">-140 (↑10，敢于主动走近拉监护人衣角表达需求)</span></p>
<p class="b"><span class="label">⚖️保守 ⇆ 开放：</span><span class="value">0</span></p>
<p class="a"><span class="label">⚖️邪恶 ⇆ 善良：</span><span class="value">250 (天真无邪)</span></p>
<p class="b"><span class="label">⚖️感性 ⇆ 理性：</span><span class="value">-750 (由直觉与当下情感主导)</span></p>
<p class="a"><span class="label">⚖️悲观 ⇆ 乐观：</span><span class="value">320 (在新家里渐渐放下防备)</span></p>
<p class="b"><span class="label">⚖️冲动 ⇆ 沉稳：</span><span class="value">-380</span></p>
<p class="a"><span class="label">⚖️依赖 ⇆ 独立：</span><span class="value">-1150 (↑50，展现出对监护人的高度信赖)</span></p>
<p class="b"><span class="label">⚖️利他 ⇆ 利己：</span><span class="value">480</span></p>
<p class="a"><span class="label">⚖️混乱 ⇆ 守序：</span><span class="value">120 (玩积木后懂得留在一处)</span></p>
<p class="b"><span class="label">⚖️欺骗 ⇆ 诚实：</span><span class="value">620 (渴了诚实表达)</span></p>
<p class="a"><span class="label">🎭性格：</span><span class="value">乖巧软萌但曾受过惊吓的幼女，开始卸下防备，遇到身体需求会主动向你求助，对你的每一个眼神和动作都格外敏感。</span></p>
</div>
</details>

<details class="status-box" open="">
<summary class="status-summary">
<h1><span>♻️其他人物</span></h1>
</summary>
<div class="status-details">
<p class="a"><span class="label">💫人设：</span><span class="value">监护人 | 21岁 | 上班族</span></p>
<p class="b"><span class="label">🧘‍♂️姿势：</span><span class="value">坐在沙发上，膝头刚被小手轻轻拽动</span></p>
<p class="a"><span class="label">👙服装：</span><span class="value">棉麻居家衬衫与宽松休闲裤</span></p>
<p class="b"><span class="label">💞情绪：</span><span class="value">温和关切</span></p>
<p class="a"><span class="label">🥵性次数：</span><span class="value">0次</span></p>
<p class="b"><span class="label">🙎🏻‍♀️性对象：</span><span class="value">无</span></p>
</div>
</details>

<opt>
<suggested_questions>
["立刻放下手头的事，起身去厨房倒一杯温开水，试好温度后蹲下身喂小柔喝", "温柔地把小柔抱到沙发上坐好，刮一下她的小鼻梁夸她懂事，再去拿温水和她最爱的草莓饼干", "牵起她的小手走到茶几前，一边给她倒水，一边教她以后口渴怎么拿小水壶", "顺便看一眼墙上的时钟，关心地摸摸她的小肚子问她是不是也有点饿了想吃下午点心"]
</suggested_questions>
</opt>"""
        }
    ]

    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = (db_engine.db.dialect != 'sqlite')

    sqlite_db_path = os.path.join(ROOT_DIR, 'noval.db')
    sqlite_conn = sqlite3.connect(sqlite_db_path)
    sc = sqlite_conn.cursor()

    for tid in [aid, alias]:
        if is_pg:
            ac.execute("DELETE FROM stories WHERE id = %s", (tid,))
            sql_active = """
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
        else:
            ac.execute("DELETE FROM stories WHERE id = ?", (tid,))
            sql_active = """
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """

        params = (
            tid,
            title,
            "性格三观培养",
            "🍼",
            title,
            "10组性格天平·5大折叠状态栏·生理时钟",
            "🍼",
            "#f472b6",
            "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)",
            json.dumps(handbook, ensure_ascii=False),
            json.dumps(roles, ensure_ascii=False),
            json.dumps(scenes, ensure_ascii=False),
            json.dumps(styles, ensure_ascii=False),
            json.dumps(first_turn, ensure_ascii=False),
            custom_css,
            custom_html,
            "都市日常",
            now_str,
            now_str
        )
        ac.execute(sql_active, params)

        try:
            sc.execute("DELETE FROM stories WHERE id = ?", (tid,))
            sc.execute("""
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                custom_css, custom_html, category, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, params)
        except Exception:
            pass

    # Plaza card
    ac.execute("DELETE FROM plaza_cards WHERE id = %s OR id = %s" if is_pg else "DELETE FROM plaza_cards WHERE id = ? OR id = ?", (aid, alias))
    sql_plaza = """
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
        aid,
        aid,
        title,
        "性格三观培养 · 详细状态栏",
        "#f472b6",
        author_name,
        desc_text,
        rating_score,
        json.dumps(tag_list, ensure_ascii=False),
        heat_str,
        0,
        cover_url,
        'HOT',
        'fire',
        1,
        "都市日常",
        now_str
    )
    ac.execute(sql_plaza, plaza_params)

    try:
        sc.execute("DELETE FROM plaza_cards WHERE id = ? OR id = ?", (aid, alias))
        sc.execute("""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, plaza_params)
    except Exception:
        pass

    active_conn.commit()
    active_conn.close()
    try:
        sqlite_conn.commit()
        sqlite_conn.close()
    except Exception:
        pass

    print(f"[✓] Successfully imported: {aid} ({alias}) -> {title}", flush=True)

if __name__ == '__main__':
    import_daughter_care_card()
