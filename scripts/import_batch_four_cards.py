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
        "aid": "0e0de61f-8f94-47f2-871a-2ab89228e709",
        "alias": "deck_school_goddess_jiang",
        "clean_title": "漏出癖黑丝巨乳校花教室自慰",
        "category": "校园日常",
        "badge": "校园 · 极致反差",
        "badge_color": "#f43f5e",
        "theme_color": "#f43f5e",
        "btn_gradient": "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
        "icon": "👠",
        "heroine_name": "姜晚晴",
        "heroine_role": "高冷校花 / 你的同桌",
        "heroine_desc": "高三重点班同桌，公认的冰山女神，柔顺黑长直与极致包臀黑丝高跟。出身严厉名门，内心极度反差渴望打破束缚与露出快感。",
        "scene_title": "夕阳教室的撞破",
        "scene_desc": "放学后空荡荡的教室，夕阳斜照进讲台，你折返拿课本时撞见了全校最神圣女神不可告人的另一面。",
        "opening_text": "现代都市某重点高中，放学后的走廊寂静无声。你因为忘带课本折返教室，推开虚掩后门的刹那，夕阳暖金色的余晖正倾泻在讲台边。\n\n只见平日里清冷高傲、拒人千里的高三同桌姜晚晴，正半靠在讲台前，剪裁紧致的包臀裙已被撩起，包裹在透肉黑丝里的修长美腿微微颤抖……空气中弥漫着急促压抑的喘息。",
        "branches": [
            {"tag": "A", "title": "屏息凝视", "desc": "停在后门口阴影处，静静观察她沉浸于快感与紧张中的反差模样"},
            {"tag": "B", "title": "制造动静", "desc": "故意踏响脚步或轻敲门框，试探这只高傲白天鹅被惊动时的慌乱反应"},
            {"tag": "C", "title": "径直走近", "desc": "坦然跨入教室，直截了当叫出她的名字打破两人的沉默"}
        ]
    },
    {
        "aid": "17629b1d-cdeb-4fb9-9511-49f7f4a5ff83",
        "alias": "deck_russian_landlady_loli",
        "clean_title": "我的房东是傲娇日俄混血小萝莉这件事",
        "category": "异国同居",
        "badge": "异国 · 傲娇同居",
        "badge_color": "#38bdf8",
        "theme_color": "#38bdf8",
        "btn_gradient": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        "icon": "❄️",
        "heroine_name": "索菲亚 (Sofia)",
        "heroine_role": "日俄混血房东少女",
        "heroine_desc": "银发碧眼的小萝莉房东，父母双亡后休学独居。嘴硬心软极度傲娇，爱吃甜食却总摆出一副冷酷大人与严苛房东的架子。",
        "scene_title": "圣彼得堡老旧公寓门前",
        "scene_desc": "漫天飞雪的异国街头，你拖着沉重的行李箱敲开了极低租金公寓的房门，迎面而来的却是一个娇小傲慢的银发少女。",
        "opening_text": "经过漫长转机与奔波，你终于拖着行李箱抵达了圣彼得堡这座带有厚重历史感的老旧公寓楼前。\n\n寒风夹杂着雪粒刮过脸颊，你对照着招租信息按响了三楼的门铃。不多时，门锁发出咔哒一声脆响，房门被小心翼翼拉开了一条缝——门后站着的不是想象中体格魁梧的俄罗斯大妈，而是一个有着洋娃娃般精致五官、银白长发、眼眸宛如贝加尔湖冰蓝剔透的娇小少女。她皱起小巧的鼻尖，双手抱胸，用略带生硬但傲慢的语气打量着你：“……你就是那个网上预约看房的中国留学生？”",
        "branches": [
            {"tag": "A", "title": "礼貌问候与出示凭证", "desc": "微笑着向她出示预约信息，并递上特意准备的中国小点心"},
            {"tag": "B", "title": "惊讶质疑房东身份", "desc": "不敢置信地打量她，确认眼前这个小女孩真的是整栋公寓的房东吗"},
            {"tag": "C", "title": "恭敬称呼房东大人", "desc": "顺着她摆出的大人架势，郑重行礼并称赞公寓的环境"}
        ]
    },
    {
        "aid": "12aa4c36-6dd6-4dc7-98ed-ac730b0931d6",
        "alias": "deck_classmate_xia_wanyu",
        "clean_title": "暴露癖同桌的深夜展示",
        "category": "校园日常",
        "badge": "校园 · 深夜窥见",
        "badge_color": "#a855f7",
        "theme_color": "#a855f7",
        "btn_gradient": "linear-gradient(135deg, #9333ea 0%, #c084fc 100%)",
        "icon": "🌙",
        "heroine_name": "夏晚妤",
        "heroine_role": "乖巧班长 / 你的同桌",
        "heroine_desc": "高二二班班长兼同桌，年级前十，圆框眼镜短发，白皙清秀，平时极度容易害羞。深夜却独自在熄灯教室讲台大胆露出，沉溺于被注视的快感。",
        "scene_title": "深夜十一点半的讲台",
        "scene_desc": "教学楼全员熄灯的深夜，手机微光化作舞台聚光灯，你在折返拿作业时直面了乖乖女班长毫无防备的赤裸秘密。",
        "opening_text": "深夜十一点半，整栋高二教学楼早已归于死寂。\n\n你因为遗落了明天一早就要检查的物理重点作业，借着手机屏幕微弱的亮光轻手轻脚摸回教室后门。然而隔着窗玻璃，讲台上投下的一抹光晕却骤然攥住了你的视线——\n\n那竟是你的同桌、每天早上都会脸红着轻声向你道早安的模范班长夏晚妤。她整齐折叠好校服放在一旁课桌上，此刻正近乎全裸地坐在微凉的讲台边，两颊泛着不自然的潮红，闭着双眼沉浸在压抑而急促的低吟声中。推门的细微响动在空荡教室内回荡，夏晚妤瞬间僵住了动作，像一只受惊的小鹿猛然转过头来，水汽氤氲的眸子里写满了恐惧与耻辱。",
        "branches": [
            {"tag": "A", "title": "轻声唤出班长名字", "desc": "压低声线轻唤“夏班长……？”，安抚她不要惊慌失措"},
            {"tag": "B", "title": "随手反锁教室房门", "desc": "顺势合上门并按下内锁，杜绝巡夜保安发现的可能"},
            {"tag": "C", "title": "上前帮她遮掩校服", "desc": "拿起课桌上的校服走向讲台，将衣服温柔披在她战栗的肩头"}
        ]
    },
    {
        "aid": "b4462091-0d4b-4170-9e8c-5b0f1fd40c73",
        "alias": "deck_gentle_mother_contrast",
        "clean_title": "我的温柔妈妈居然是个丝袜癖反差痴女（可M可S）",
        "category": "家庭情感",
        "badge": "都市 · 丝袜反差",
        "badge_color": "#ec4899",
        "theme_color": "#ec4899",
        "btn_gradient": "linear-gradient(135deg, #db2777 0%, #f472b6 100%)",
        "icon": "🖤",
        "heroine_name": "苏沐晴",
        "heroine_role": "温柔优雅全职人妻",
        "heroine_desc": "34岁全职太太，165cm/56kg，96E丰腴雪乳与蜜桃臀。戴细黑框眼镜，举手投足温婉贤淑挑不出瑕疵，暗地里却对薄透连裤袜与支配快感怀有极度狂热的痴迷。",
        "scene_title": "深夜幽暗的走廊与浴室",
        "scene_desc": "夜深人静，走廊壁灯昏黄，你端着空水杯走出卧室，迎面走来的苏沐晴裙摆下尼龙丝袜摩擦的沙沙细响在寂静中格外清晰。",
        "opening_text": "凌晨一点，整座温馨的复式公寓陷入沉睡。\n\n你感到口渴走出房门，正撞见刚从浴室走出的苏沐晴。她那头乌黑的长发慵懒地低挽在脑后，细黑框眼镜后是一双永远带着温和笑意的眸子。身上虽穿着居家的过膝长裙与针织开衫，但随着她莲步轻移，裙摆翻飞间，隐隐露出包裹在轻薄灰黑丝袜里的饱满长腿与圆润线条，空气中幽幽散发着沐浴后的清甜水汽与丝袜尼龙特有的微妙气息。\n\n“这么晚还不睡吗？小心明天精神不好哦。”她轻柔一笑，递过手中的温水杯，眼神中却闪过一丝不易察觉的审视与玩味。",
        "branches": [
            {"tag": "A", "title": "接过水杯并道谢", "desc": "自然接过水杯，目光克制而礼貌地落在她温柔的微笑上"},
            {"tag": "B", "title": "目光流连于丝袜长腿", "desc": "直勾勾注视着她裙摆下轻薄透肉的丝袜，试探她的态度与底线"},
            {"tag": "C", "title": "低声指出方才的动静", "desc": "若无其事地提起方才浴室里的异样声响，观察她神色间微妙的变化"}
        ]
    }
]

def import_all():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 1. Active DB
    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

    # 2. SQLite
    sqlite_conn = sqlite3.connect(os.path.join(ROOT_DIR, 'noval_data.db'))
    sc = sqlite_conn.cursor()

    for item in cards_meta:
        aid = item['aid']
        alias = item['alias']
        json_path = os.path.join(ROOT_DIR, 'scripts', f'card_{aid}.json')
        if not os.path.exists(json_path):
            print(f"[!] Warning: {json_path} does not exist. Skipping.", flush=True)
            continue

        with open(json_path, 'r', encoding='utf-8') as f:
            raw = json.load(f)

        app_info = raw.get('data', {}).get('apps', {})
        mc_info = raw.get('data', {}).get('model_config', {})
        author_info = raw.get('data', {}).get('author', {})
        tags_raw = raw.get('data', {}).get('tags', [])

        title = app_info.get('name') or item['clean_title']
        author_name = author_info.get('nickname') if isinstance(author_info, dict) else '幻诺精选'
        desc_text = app_info.get('summary') or app_info.get('description') or ''
        cover_url = app_info.get('cover') or ''
        bg_url = mc_info.get('bg_image') or cover_url
        rating_score = str(app_info.get('avg_rating_score') or '9.9')
        players_num = app_info.get('players_count') or 1280
        heat_str = f"{players_num} 玩过"

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
            "opening_options": [
                "【深入互动】：依循情境展开深入探索与对话",
                "【试探心理】：保持警觉，观察对方隐秘情绪与微妙反应",
                "【掌控局势】：以坚定主动态度引导场景走向"
            ]
        }

        roles = [
            {
                "name": "主角 (玩家)",
                "role": "核心视角",
                "desc": "故事的决策者与见证者，每一次对话抉择都将决定剧情与好感走向。"
            },
            {
                "name": item['heroine_name'],
                "role": item['heroine_role'],
                "desc": item['heroine_desc']
            }
        ]

        scenes = [
            {
                "title": item['scene_title'],
                "desc": item['scene_desc']
            }
        ]

        styles = {
            "dialogue_style": "细腻深邃的情感描写，极具沉浸感的人物神态心理博弈与生动对话",
            "format": "幻诺剧场标准交互规范及.custom-ui手账联动"
        }

        first_turn = [
            {
                "index": 1,
                "isUser": False,
                "scene": item['scene_title'],
                "story": f"<tl>📅时间：关键时刻 | 🌏地点：{item['scene_title']}</tl>\n\n<article>\n<p>{item['opening_text']}</p>\n</article>",
                "branches": item['branches']
            }
        ]

        # Insert stories table (aid and alias)
        for tid in [aid, alias]:
            # Postgres / Active
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

        # Insert plaza_cards table
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

        print(f"[✓] Successfully imported: {aid} -> {title}", flush=True)

    active_conn.commit()
    active_conn.close()
    sqlite_conn.commit()
    sqlite_conn.close()
    print("All 4 cards imported successfully into databases.", flush=True)

if __name__ == '__main__':
    import_all()
