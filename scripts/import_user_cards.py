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

cards_meta = [
    {
        "aid": "2c10c41f-de54-407a-a6e0-a1475b0f2d33",
        "alias": "deck_wife_business_trip",
        "category": "都市情感",
        "badge": "都市 · 情感抉择",
        "badge_color": "#8e5cc4",
        "theme_color": "#8e5cc4",
        "btn_gradient": "linear-gradient(135deg, #8e5cc4 0%, #e0689a 100%)",
        "icon": "👠"
    },
    {
        "aid": "e346f716-5b4c-4fbd-abef-2131c6dcfa71",
        "alias": "deck_buddy_childhood_friend",
        "category": "都市情感",
        "badge": "校园 · 隐秘悸动",
        "badge_color": "#a78bfa",
        "theme_color": "#a78bfa",
        "btn_gradient": "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
        "icon": "🌸"
    },
    {
        "aid": "cce8dc1c-7403-4a71-ad51-7ef85f525426",
        "alias": "deck_daughter_wanwan",
        "category": "家庭情感",
        "badge": "日常 · 互动陪伴",
        "badge_color": "#ec4899",
        "theme_color": "#ec4899",
        "btn_gradient": "linear-gradient(135deg, #ec4899 0%, #a78bfa 100%)",
        "icon": "🎀"
    }
]

def import_requested_cards():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # 1. Active DB connection
    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

    # 2. SQLite DB connection
    sqlite_conn = sqlite3.connect(os.path.join(ROOT_DIR, 'noval_data.db'))
    sc = sqlite_conn.cursor()

    for item in cards_meta:
        aid = item['aid']
        alias = item['alias']
        json_path = os.path.join(ROOT_DIR, 'scripts', f'card_{aid}.json')
        if not os.path.exists(json_path):
            print(f"Skipping {aid}: file not found", flush=True)
            continue

        with open(json_path, 'r', encoding='utf-8') as f:
            raw = json.load(f)

        app_info = raw.get('data', {}).get('apps', {})
        mc_info = raw.get('data', {}).get('model_config', {})
        author_info = raw.get('data', {}).get('author', {})
        tags_raw = raw.get('data', {}).get('tags', [])

        title = app_info.get('name') or '未命名剧本'
        author_name = author_info.get('nickname') if isinstance(author_info, dict) else 'AI风月精选'
        desc_text = app_info.get('summary') or app_info.get('description') or ''
        cover_url = app_info.get('cover') or ''
        bg_url = mc_info.get('bg_image') or cover_url
        rating_score = str(app_info.get('avg_rating_score') or '9.8')
        players_num = app_info.get('players_count') or 0
        heat_str = f"{players_num} 玩过" if players_num else "精选热门"

        tag_list = []
        for t in tags_raw:
            if isinstance(t, dict) and t.get('name'):
                tag_list.append(t['name'])
            elif isinstance(t, str):
                tag_list.append(t)
        if not tag_list:
            tag_list = ["互动故事", "沉浸体验", item['category']]

        custom_css = mc_info.get('built_in_css') or ''
        custom_html = app_info.get('description') or ''

        # Prepare handbook and roles
        handbook = {
            "title": title,
            "desc": desc_text[:400],
            "bg_image": bg_url,
            "opening_options": [
                "【深入交流】：依循情境展开深入互动",
                "【观察试探】：保持距离，观察对方的微妙反应",
                "【直抒心意】：坦率挑明当前的心境与真实感受"
            ]
        }

        roles = [
            {
                "name": "主角 (玩家)",
                "role": "核心视角",
                "desc": "故事的决策者与推进者"
            },
            {
                "name": title.split(' ')[0] if ' ' in title else "故事角色",
                "role": "互动对象",
                "desc": "性格与背景随着剧情发展逐步揭示"
            }
        ]

        scenes = [
            {
                "title": "场景开局",
                "desc": "故事拉开帷幕的初始场景，交织着微妙的气氛与情感抉择。"
            }
        ]

        styles = {
            "dialogue_style": "细腻深邃的情感物语，富有张力的人物神态与心理博弈",
            "format": "AI风月标准双栏规范及.custom-ui样式"
        }

        first_turn = [
            {
                "index": 1,
                "isUser": False,
                "scene": "初始情境",
                "story": f"<tl>📅时间：夜晚 | 🌏地点：故事开端</tl>\n\n<article>\n<p>{desc_text[:350]}</p>\n</article>",
                "branches": [
                    {"tag": "A", "title": "深入互动", "desc": "顺应当前情境展开下一步剧情"},
                    {"tag": "B", "title": "试探心理", "desc": "观察对方细微的反应与意图"},
                    {"tag": "C", "title": "掌握主动", "desc": "以坚定的态度引导局势发展"}
                ]
            }
        ]

        # 1. Insert into stories table (both PG and SQLite)
        for tid in [aid, alias]:
            # PG
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
                item['badge'],
                item['icon'],
                title[:10],
                title,
                item['icon'],
                item['theme_color'],
                item['btn_gradient'],
                json.dumps(handbook, ensure_ascii=False),
                json.dumps(roles, ensure_ascii=False),
                json.dumps(scenes, ensure_ascii=False),
                json.dumps(styles, ensure_ascii=False),
                json.dumps(first_turn, ensure_ascii=False),
                custom_css,
                custom_html,
                item['category'],
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

        # 2. Insert into plaza_cards table
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
            item['badge'],
            item['badge_color'],
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
            item['category'],
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

        print(f"[+] Successfully imported card: {aid} ({alias}) -> {title}", flush=True)

    active_conn.commit()
    active_conn.close()
    sqlite_conn.commit()
    sqlite_conn.close()
    print("Done importing requested cards.", flush=True)

if __name__ == '__main__':
    import_requested_cards()
