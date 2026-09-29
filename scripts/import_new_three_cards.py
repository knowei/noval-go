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
        "aid": "b9a93dc3-6ce1-4d0d-b4de-1f199a95a095",
        "alias": "deck_sister_roommate_belong",
        "category": "都市情感",
        "badge": "禁断 · 兄妹同居",
        "badge_color": "#ec4899",
        "theme_color": "#ec4899",
        "btn_gradient": "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
        "icon": "🎀",
        "openings": [
            "【霸道审问】：直接抓住妹妹的手腕，逼问今天向她告白的男生到底是谁",
            "【假装冷淡】：故意装作不在意，看她气急败坏下如何主动跨坐上来撩拨",
            "【打破禁忌】：反锁房门，将浑身泛红娇软的妹妹逼入书桌死角打破最后防线"
        ]
    },
    {
        "aid": "9a0243df-2a42-4dfa-adc1-bdcb61313484",
        "alias": "deck_brother_school_flower_dorm",
        "category": "校园",
        "badge": "校园 · 宿舍借宿",
        "badge_color": "#8b5cf6",
        "theme_color": "#8b5cf6",
        "btn_gradient": "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        "icon": "🌸",
        "openings": [
            "【反锁门锁】：悄然反锁宿舍大门，步步逼近正赤裸弯腰铺床的校花背影",
            "【假意咳嗽】：轻咳一声打破寂静，欣赏她惊恐转身捂住硕大双乳的羞耻模样",
            "【借势施压】：冷笑着提醒她王刚还在外面，用撞破秘密的把柄击穿心理防线"
        ]
    },
    {
        "aid": "962951e6-14e2-4733-987e-e8b49c8aebf8",
        "alias": "deck_neighbor_housewife_visit",
        "category": "都市",
        "badge": "都市 · 邻家人妻",
        "badge_color": "#f43f5e",
        "theme_color": "#f43f5e",
        "btn_gradient": "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
        "icon": "💗",
        "openings": [
            "【迎客入室】：热情地把柳阿姨迎进玄关并关上大门，借接过热汤的机会碰触她温软的指尖",
            "【贴身靠近】：借口帮忙查看水管或修理灯泡，在狭小空间内有意无意贴上她饱满的E罩杯雪乳",
            "【试探心防】：倒上一杯温热红酒，语气暧昧地询问她守寡十年独守空房究竟有多寂寞"
        ]
    }
]

def import_new_cards():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

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
        rating_score = str(app_info.get('avg_rating_score') or '9.9')
        players_num = app_info.get('players_count') or 1280
        heat_str = f"{players_num} 玩过" if players_num else "热门精选"

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

        handbook = {
            "title": title,
            "desc": desc_text[:400],
            "bg_image": bg_url,
            "opening_options": item['openings']
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

        # 1. Insert into stories table
        for tid in [aid, alias]:
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
    print("Done importing new three cards.", flush=True)

if __name__ == '__main__':
    import_new_cards()
