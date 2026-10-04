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

def import_sister_card():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    aid = "7a68d42a-e4bf-4eaf-961d-991baeb50232"
    alias = "deck_sister_debt_cg"
    json_path = os.path.join(ROOT_DIR, 'scripts', f'card_{aid}.json')

    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found!", flush=True)
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        raw = json.load(f)

    app_info = raw.get('data', {}).get('apps', {})
    mc_info = raw.get('data', {}).get('model_config', {})
    author_info = raw.get('data', {}).get('author', {})
    tags_raw = raw.get('data', {}).get('tags', [])

    title = app_info.get('name') or "【CG立绘】巨乳妹妹还债生活"
    author_name = author_info.get('nickname') if isinstance(author_info, dict) else '幻诺精选'
    desc_text = app_info.get('summary') or app_info.get('description') or ''
    cover_url = app_info.get('cover') or 'https://catai.wiki/e3595676-c37d-48a1-f827-174689cee400/cover'
    bg_url = mc_info.get('bg_image') or 'https://catai.wiki/89a4287a-1fd9-44ac-c01d-408f043b2000/bg'
    rating_score = str(app_info.get('avg_rating_score') or '9.9')
    players_num = app_info.get('players_count') or 3560
    heat_str = f"{players_num} 玩过"

    tag_list = []
    for t in tags_raw:
        if isinstance(t, dict) and t.get('name'):
            tag_list.append(t['name'])
        elif isinstance(t, str):
            tag_list.append(t)
    if not tag_list:
        tag_list = ["CG立绘", "动态CG", "都市日常", "心理解构"]

    custom_css = mc_info.get('built_in_css') or ''
    custom_html = app_info.get('description') or ''

    handbook = {
        "title": title,
        "desc": "300+张CG！101套立绘！46种表情！父母欠下巨债后不知所踪，你与相依为命的巨乳妹妹在逼仄出租屋开启了充满波折与心跳的还债同居生活。",
        "bg_image": bg_url,
        "opening_options": [
            "【相依为命】：温柔安抚慌乱的妹妹，承诺共同承担债务",
            "【盘算账目】：冷静规划打工与还债计划，建立开支账本",
            "【危险试探】：在债务重压的狭窄房间内，试探彼此的感情界限"
        ]
    }

    roles = [
        {
            "name": "主角 (哥哥)",
            "role": "故事主角 / 决策者",
            "desc": "为了保护妹妹并偿还家庭巨债而拼搏的青年，每一个抉择都将影响妹妹的命运与心智走向。"
        },
        {
            "name": "妹妹",
            "role": "核心女主 / 巨乳相依为命少女",
            "desc": "拥有惊人曼妙身材与绝美容颜的妹妹，性格柔弱依赖却又渴望为哥哥分忧，在巨额债务的阴影下暗自挣扎。"
        }
    ]

    scenes = [
        {
            "title": "狭窄昏暗的出租屋开局",
            "desc": "堆满逾期账单的逼仄小房间，瓦数不高的暖黄吊灯下，两人面对巨债抉择的命运之夜。"
        }
    ]

    styles = {
        "dialogue_style": "融合CG立绘与丰富表情插图的超沉浸视觉Galgame物语，人物心理细腻，充满张力",
        "format": "内置459张原画立绘与CG动态切片，支持.story-image及.custom-ui联动"
    }

    first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "深夜逼仄出租屋",
            "story": """<tl>📅时间：深夜 | 🌏地点：狭窄出租屋客厅</tl>

<article>
<div class="story-image img-BG-01"></div>
<p>逼仄昏暗的单间出租屋里，只有一盏瓦数不高的暖黄吊灯在头顶微微摇晃。茶几上凌乱堆叠着印有鲜红“逾期催缴”字样的巨额债务单据。</p>

<div class="story-image img-BQ-01"></div>
<p>妹妹穿着单薄宽松的居家旧睡裙，低垂着头紧咬下唇，纤细白皙的十指用力揪着裙摆，饱满挺拔的胸脯随着压抑的呼吸剧烈起伏。她抬起泪光涟涟的双眸望向你，声音微颤：“哥……催债的人说，如果这个月底再还不上第一期利息，他们就要把你……我们该怎么办啊……”</p>
</article>""",
            "branches": [
                {"tag": "A", "title": "温柔安抚紧紧相拥", "desc": "伸手揽住她战栗的肩膀，坚定承诺只要有哥在天就塌不下来"},
                {"tag": "B", "title": "拿起账单冷静盘算", "desc": "拿起茶几上的催缴单仔细核对利息与本金，开始筹划两人的打工兼职"},
                {"tag": "C", "title": "深沉凝视试探底线", "desc": "目光扫过她单薄睡裙下泛着绯红的娇躯，低声询问她能为这个家做到哪一步"}
            ]
        }
    ]

    # Database connections
    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

    sqlite_conn = sqlite3.connect(os.path.join(ROOT_DIR, 'noval_data.db'))
    sc = sqlite_conn.cursor()

    # 1. Insert stories (aid and alias)
    for tid in [aid, alias]:
        # PG / Active
        ac.execute("DELETE FROM stories WHERE id = %s" if is_pg else "DELETE FROM stories WHERE id = ?", (tid,))
        sql_active = """
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
            tid,
            title,
            "立绘 · 动态CG",
            "👙",
            "妹妹还债",
            title,
            "👙",
            "#f43f5e",
            "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)",
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

        # SQLite
        sc.execute("DELETE FROM stories WHERE id = ?", (tid,))
        sc.execute("""
        INSERT INTO stories (
            id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
            handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
            custom_css, custom_html, category, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, params)

    # 2. Insert plaza_cards
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
        "立绘 · 动态CG",
        "#f43f5e",
        author_name,
        desc_text[:300],
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

    sc.execute("DELETE FROM plaza_cards WHERE id = ? OR id = ?", (aid, alias))
    sc.execute("""
    INSERT INTO plaza_cards (
        id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
        heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, plaza_params)

    active_conn.commit()
    active_conn.close()
    sqlite_conn.commit()
    sqlite_conn.close()

    print(f"[✓] Successfully imported: {aid} ({alias}) -> {title}", flush=True)

if __name__ == '__main__':
    import_sister_card()
