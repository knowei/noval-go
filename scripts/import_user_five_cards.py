import os
import sys
import json
import sqlite3
from datetime import datetime

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
        "aid": "d9380550-16bf-48a8-8492-e5edd9bd8497",
        "clean_title": "24小时便利店：色情店员的无套内射服务",
        "category": "都市隐秘",
        "badge": "都市 · 特殊服务",
        "badge_color": "#f59e0b",
        "theme_color": "#f59e0b",
        "btn_gradient": "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
        "icon": "🏪",
        "roles": [
            {
                "name": "主角 (玩家)",
                "role": "核心视角 / 顾客",
                "desc": "手握充沛预算走进这家表面平凡却暗藏玄机的24小时便利店的顾客。"
            },
            {
                "name": "李佳怡",
                "role": "店员 · 青春少女 (20岁)",
                "desc": "高马尾鹅蛋脸，活泼开朗善于察言观色，兼职赚取生活费，周一、周四排班。"
            },
            {
                "name": "沈璃",
                "role": "店员 · 高冷御姐 (24岁)",
                "desc": "黑长直冷白皮凤眼，高冷傲慢少言，求职碰壁为生计兼职，周二、周五排班。"
            },
            {
                "name": "王馨悦",
                "role": "店员 · 成熟人妻 (30岁)",
                "desc": "丰腴温柔眉目含情，背负家庭房贷重压，周三、周六排班。"
            }
        ],
        "scene_title": "深夜的24小时便利店收银台",
        "scene_desc": "老旧居民区边缘亮着暖黄色灯光的便利店，后方收银台隔帘后暗藏私密隔间。",
        "opening_text": "午夜两点半，街头冷风呼啸，唯有老旧街角那盏闪烁着「24小时便利店」的招牌还透着暖黄光晕。\n\n你推开玻璃门，机械门铃发出「叮咚，欢迎光临」的清脆声响。店内货架齐整，而在收银台后，值班店员正抬起头打量着你，领口微敞的制服与若有似无的香水味在静谧的空气中悄然弥漫……小票机上静静闪烁着特殊服务的消费代码。",
        "branches": [
            {"tag": "A", "title": "选购高额商品", "desc": "递上印有大额消费的小票，试探开启暗室服务密码"},
            {"tag": "B", "title": "靠在收银台前", "desc": "直接询问今晚有哪些特色服务与私密体验项目"},
            {"tag": "C", "title": "点名挑选店员", "desc": "指名心仪当班店员，直接进入收银台后方的私密隔间"}
        ]
    },
    {
        "aid": "955cb633-7214-4265-b3a9-4ac7e5c74b38",
        "clean_title": "高考完才知道老家给你养着个巨乳肥臀的娃娃亲未婚妻",
        "category": "乡村纯爱",
        "badge": "乡村 · 娃娃亲未婚妻",
        "badge_color": "#ec4899",
        "theme_color": "#ec4899",
        "btn_gradient": "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
        "icon": "🌾",
        "roles": [
            {
                "name": "主角 (玩家)",
                "role": "核心视角 / 城里归来的准大学生",
                "desc": "刚刚结束高考的青年，被父母告知老家养着等了自己十八年的娃娃亲未婚妻。"
            },
            {
                "name": "王梅秀",
                "role": "娃娃亲未婚妻 (18岁 / H罩杯)",
                "desc": "乌黑粗长的大辫子，杏眼虎牙，身段丰腴火辣却生性质朴纯真。认定自己是你的人，苦等十八年。"
            }
        ],
        "scene_title": "王家屯村头老槐树下",
        "scene_desc": "夏日蝉鸣阵阵的山坳乡村，老槐树下碎花布衫的丰腴姑娘正翘首以盼。",
        "opening_text": "高考结束的第三天，母亲将一张泛黄发脆的照片拍在饭桌上：「这是你媳妇。老家订的娃娃亲，人家姑娘在王家屯等了你整整十八年。」\n\n大巴车颠簸驶入翠绿的山坳，你在村头老槐树下见到了她——一条乌黑发亮的粗长麻花辫垂过腰际，碎花布衫紧绷着几乎要撑破衣扣的硕大雪乳，浑圆饱满的臀肉将粗布裤子绷出惊心动魄的弧度。她见你走下车，两颊瞬间飞起红霞，绞着衣角怯生生迎上来：「……是……是俺男人回来了不？」",
        "branches": [
            {"tag": "A", "title": "温声应答并牵手", "desc": "笑着上前握住她粗糙温热的手，温声承认彼此的关系"},
            {"tag": "B", "title": "上下打量逗弄", "desc": "眼神在她惊人丰腴的身段上游移，故意逗弄她脸红害羞"},
            {"tag": "C", "title": "接包袱一同回家", "desc": "接过她手中的粗布包袱，并肩一同走回老宅院子"}
        ]
    },
    {
        "aid": "90d8ead6-940a-4c15-a750-5de8fc13e2d7",
        "clean_title": "好哥们新婚当天骚老婆进错房间疯狂炸精",
        "category": "都市背德",
        "badge": "背德 · 新婚夜错房",
        "badge_color": "#8b5cf6",
        "theme_color": "#8b5cf6",
        "btn_gradient": "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
        "icon": "💍",
        "roles": [
            {
                "name": "主角 (玩家)",
                "role": "核心视角 / 新郎上下铺好哥们",
                "desc": "受邀担任伴郎，婚宴烂醉后被安置在酒店隔壁客房。"
            },
            {
                "name": "江晚晴",
                "role": "好哥们的新婚妻子 (美艳新娘)",
                "desc": "婚礼上一出场艳惊四座的美艳新娘，婚宴后微醺迷糊，错将你的房间当成了婚房。"
            }
        ],
        "scene_title": "五星级酒店豪华客房 · 凌晨两点",
        "scene_desc": "酒气弥漫的昏暗客房，红酒香与浓烈体香交织，隔壁便是烂醉如泥的新郎。",
        "opening_text": "凌晨两点，五星级酒店走廊一片死寂。你喝得头痛欲裂，仰躺在客房大床上昏昏欲睡。\n\n房门锁咔嗒轻响，一双沾着酒气的高跟鞋被踢落在地毯上。伴随着窸窸窣窣的丝绸摩擦声，一具滚烫、滑腻、散发着高级甜香的娇躯掀开被角钻了进来。她从背后死死抱住你，两团沉甸甸饱满的胸肉挤压在你后背，灼热的吐息扑在你的脖颈：「老公……今天应酬累死了……快抱抱我……」\n\n你浑身一震瞬间清醒——隔壁才是新郎林浩的婚房，而趴在你怀里的，正是他那美若天仙的新婚妻子江晚晴！",
        "branches": [
            {"tag": "A", "title": "将错就错抱入怀", "desc": "翻过身将错就错，顺势将这位微醺新娘揽入怀中深吻"},
            {"tag": "B", "title": "耳语挑明身份", "desc": "抓住她滑腻的双手，压低声音在她耳边挑明自己的真实身份"},
            {"tag": "C", "title": "轻抚腰肢静观其变", "desc": "屏住呼吸轻抚她纤细腰肢，静待药劲与酒劲彻底瓦解防线"}
        ]
    },
    {
        "aid": "09b2ff91-9dff-4ab3-afc2-709626a89d57",
        "clean_title": "在公厕遇到被轮奸的洛丽塔该怎么办",
        "category": "现代救赎",
        "badge": "都市 · 救赎与抉择",
        "badge_color": "#a855f7",
        "theme_color": "#a855f7",
        "btn_gradient": "linear-gradient(135deg, #9333ea 0%, #c084fc 100%)",
        "icon": "🎀",
        "roles": [
            {
                "name": "主角 (玩家)",
                "role": "核心视角 / 深夜路人",
                "desc": "深夜路过公厕的决策者，一念之间决定少女走向纯爱救赎还是彻底沉沦。"
            },
            {
                "name": "林诗音",
                "role": "洛丽塔少女 (19岁 / 高二学生)",
                "desc": "家境优渥，表面毒舌冷傲、防备心极强，身着凌乱的白色蕾丝蓬蓬裙，内心极度脆弱敏感。"
            }
        ],
        "scene_title": "深夜公园公厕深处 · 昏黄灯光下",
        "scene_desc": "泛黄闪烁的日光灯下，地砖冰凉，少女蜷缩在最里侧隔间。",
        "opening_text": "深夜十一点半，公园公厕深处传来断断续续的抽泣与水声。\n\n你推开虚掩的最内侧隔间，只见一个身穿白色蕾丝边洛丽塔蓬蓬裙的女孩瘫坐在冰凉的地砖上。裙摆凌乱褶皱，白丝过膝袜上沾满灰尘，一只小皮鞋半挂在脚尖。她双眼含泪，在看清你的瞬间猛地往后蜷缩，却咬着下唇强撑出冰冷凶狠的眼神：「……看什么看？滚出去！再看把你眼睛挖出来……」\n\n然而她发抖的嘴唇和眼角滑落的泪水，彻底出卖了那副武装下的绝望与脆弱。",
        "branches": [
            {"tag": "A", "title": "脱下外套披上", "desc": "脱下外套轻轻披在她凌乱的肩头，温声安抚她的情绪"},
            {"tag": "B", "title": "递纸巾询问情况", "desc": "蹲下身递上纸巾，冷峻地询问刚才究竟发生了什么"},
            {"tag": "C", "title": "关门掌控局势", "desc": "反手合上隔间门隔绝外界视线，以强势姿态掌控局面"}
        ]
    },
    {
        "aid": "5395361a-9dbb-41fc-bbfb-aa67e229a434",
        "clean_title": "被父母抛弃的失明少女要拿处女身抵房租",
        "category": "情感羁绊",
        "badge": "都市 · 视觉剥夺",
        "badge_color": "#06b6d4",
        "theme_color": "#06b6d4",
        "btn_gradient": "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
        "icon": "🕯️",
        "roles": [
            {
                "name": "主角 (玩家)",
                "role": "核心视角 / 25岁年轻房东",
                "desc": "和平里六号楼的独居房东，前来上门催缴逾期房租，却目睹了被家庭遗弃的盲女。"
            },
            {
                "name": "林知遥",
                "role": "失明少女 (20岁 / 302租客)",
                "desc": "因青光眼手术并发症双目失明，被赌鬼父亲抛弃独留空房，绝望之下试图以纯洁之身抵扣房租。"
            }
        ],
        "scene_title": "和平里六号楼302室 · 狼藉空房",
        "scene_desc": "家具被搬空的昏暗客厅，碎玻璃满地，白色纱布缠眼的少女缩在墙角。",
        "opening_text": "和平里六号楼302室的房租已逾期半个月，电话始终无法接通。\n\n你掏出备用钥匙拧开门锁，客厅里没开灯，家具已被搬空，地面上落满碎玻璃。在墙角的阴影中，正蜷坐着一个年轻女孩——乌黑的长发凌乱铺散，眼上缠着的白纱布松脱了一半，渗出点点血迹。她的小手正按在碎玻璃边缘，鲜血顺着瓷砖缝蔓延。\n\n听见脚步声，她身子剧烈颤抖着往墙缝里缩，空洞无神的双眸偏离地转向你身侧，声音抖得不成调子：「房……房东先生吗？我爸跑了……家里没钱了……求你别赶我走……我身上是干净的……拿我抵房租行不行……」",
        "branches": [
            {"tag": "A", "title": "拉开双手止血包扎", "desc": "快步上前拉开她按在玻璃碴上的小手，按压伤口包扎止血"},
            {"tag": "B", "title": "蹲身冷峻质问", "desc": "蹲在她面前低声质问，试探她是真心献身还是绝望哀求"},
            {"tag": "C", "title": "扶起喂食温声抚慰", "desc": "扶起她坐到仅剩的旧垫子上，将带来的温水与食物递到她手中"}
        ]
    }
]

def run_import():
    active_conn = db_engine.db.get_connection()
    is_pg = db_engine.db.dialect == 'postgres'
    ac = active_conn.cursor()

    sqlite_conn = None
    sc = None
    if is_pg:
        sqlite_path = os.path.join(ROOT_DIR, 'noval_data.db')
        sqlite_conn = sqlite3.connect(sqlite_path)
        sc = sqlite_conn.cursor()

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for item in cards_meta:
        aid = item['aid']
        json_path = os.path.join(ROOT_DIR, f"cards/{aid}.json")
        if not os.path.exists(json_path):
            print(f"[!] Card file not found: {json_path}")
            continue

        with open(json_path, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        app_info = raw_data.get('data', {}).get('apps', {})
        mc_info = raw_data.get('data', {}).get('model_config', {})
        
        orig_title = app_info.get('name') or item['clean_title']
        title = orig_title
        cover_url = app_info.get('cover') or "https://catai.wiki/default/cover"
        bg_url = mc_info.get('bg_image') or cover_url
        author_name = app_info.get('author') or "AI风月官方"
        rating_score = float(app_info.get('avg_rating_score') or 4.9)
        players = app_info.get('players_count') or 1280
        heat_str = f"{players / 1000:.1f}k" if players >= 1000 else str(players)

        desc_text = item['opening_text']
        tag_list = [t.get('name') for t in app_info.get('tags', []) if t.get('name')]
        if not tag_list:
            tag_list = ["互动故事", "沉浸体验", item['category']]

        custom_css = mc_info.get('built_in_css') or ''
        custom_html = app_info.get('description') or ''

        handbook = {
            "title": title,
            "desc": desc_text[:400],
            "bg_image": bg_url,
            "opening_options": [
                f"【{b['title']}】：{b['desc']}" for b in item['branches']
            ]
        }

        roles = item['roles']
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
                "story": f"<tl>📅时间：关键时刻 | 🌏地点：{item['scene_title']}</tl>\n\n<article>\n<p>{item['opening_text'].replace(chr(10), '</p><p>')}</p>\n</article>",
                "branches": item['branches']
            }
        ]

        # 1. 插入 stories 表
        for tid in [aid]:
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

            if sc:
                sc.execute("DELETE FROM stories WHERE id = ?", (tid,))
                sc.execute("""
                INSERT INTO stories (
                    id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
                    handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
                    custom_css, custom_html, category, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, params)

        # 2. 插入 plaza_cards 表
        ac.execute("DELETE FROM plaza_cards WHERE id = %s" if is_pg else "DELETE FROM plaza_cards WHERE id = ?", (aid,))
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

        if sc:
            sc.execute("DELETE FROM plaza_cards WHERE id = ?", (aid,))
            sc.execute("""
            INSERT INTO plaza_cards (
                id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
                heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, plaza_params)

        print(f"[OK] Successfully imported: {aid} -> {title}", flush=True)

    active_conn.commit()
    active_conn.close()
    if sqlite_conn:
        sqlite_conn.commit()
        sqlite_conn.close()
    print("[ALL DONE] 5 cards imported successfully into stories and plaza_cards.")

if __name__ == '__main__':
    run_import()
