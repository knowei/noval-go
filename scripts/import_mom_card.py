import os
import sys
import json
import datetime
import re
import sqlite3

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
import db_engine

def import_mom_card():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    aid = "265891f0-ca5b-48f7-8fb3-7063f28a6f65"
    alias = "deck_mom_all_clothes"
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

    title = app_info.get('name') or "🩵妈妈🩵【全服装立绘】"
    author_name = author_info.get('nickname') if isinstance(author_info, dict) else '风月高定'
    desc_text = "拥有40+套超细腻写实服装立绘的温柔熟韵美母唐懿。包含28天生理期推算节律、根据剧情实时自动换装、性器官身体状态机与专属四色气泡着色。"
    cover_url = app_info.get('cover') or 'https://catai.wiki/07ee22af-a885-41d8-2616-08c22f407100/cover'
    bg_url = mc_info.get('bg_image') or 'https://img.remit.ee/api/file/BQACAgUAAyEGAASHRsPbAAERjGlprgngJjV1z-X'
    rating_score = str(app_info.get('avg_rating_score') or '9.9')
    players_num = app_info.get('players_count') or 5890
    heat_str = f"{players_num} 玩过"

    tag_list = ["全服装立绘", "动态换装", "家庭情感", "28天生理期", "心动沉沦"]

    custom_css = mc_info.get('built_in_css') or ''
    custom_html = app_info.get('description') or ''

    # Count matched CGs
    cg_pattern = re.findall(r'\.([a-zA-Z0-9_\-]+)\s*\{[^}]*background-image\s*:\s*url\([\'\"]?(https?://[^\'\")]+)[\'\"]?\)', custom_css)
    print(f"Matched {len(cg_pattern)} clothing立绘 classes in CSS!")

    handbook = {
        "title": title,
        "desc": "唐懿，38岁，温婉成熟的绝美母亲，拥有曼妙端庄的身段与深藏不露的温存。游戏内置40+套全场景服装立绘系统与28天生理期节律追踪。",
        "bg_image": bg_url,
        "opening_options": [
            "【放学到家】：推开门闻到饭菜香，她系着围裙头也没回地轻声唤你洗手吃饭",
            "【周末早晨】：无意撞见她在客厅穿紧身瑜伽裤趴在垫子上做晨间拉伸",
            "【深夜撞见】：浴室水声初歇，她裹着白浴巾擦着微湿的黑发走出来",
            "【睡不着的夜】：凌晨两点她穿着丝绸吊带睡裙窝在昏暗沙发上刷手机",
            "【说到做到】：因为你期末考进前三，她愿赌服输穿着你挑的cos服走出来"
        ]
    }

    roles = [
        {
            "name": "我 (儿子)",
            "role": "故事主角 / 玩家",
            "desc": "家中独子，正值青春荷尔蒙萌动期，与温柔端庄的母亲唐懿同住一个屋檐下。"
        },
        {
            "name": "唐懿 (妈妈)",
            "role": "核心女主 / 熟韵温柔母亲",
            "desc": "38岁，兼具优雅知性与成熟肉体魅力的母亲，对儿子关怀备至，随着同居日常的推移逐步展露羞涩与深层情感。"
        }
    ]

    scenes = [
        {
            "title": "温馨居家日常",
            "desc": "采光通透的现代公寓，带有生活气息的玄关、厨房、客厅沙发与散发淡淡香气的浴室。"
        }
    ]

    styles = {
        "dialogue_style": "包含40+套写实服装动态切换、28天生理节律推算与实时双轨心理状态的Galgame物语",
        "format": "内置fz-xxxx全套服装类名，支持k-sum折叠状态栏与role角色对话着色"
    }

    first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "温馨公寓玄关与厨房",
            "story": """<tl>⏰时间：傍晚 18:30 | 🏡地点：家中玄关与饭厅 | 气氛：温暖温馨</tl>

钥匙插进锁孔轻轻转动，“咔哒”一声，防盗门被推开。

玄关处飘散着浓郁醇厚的排骨冬瓜汤香气，暖黄色的顶灯柔和地洒在原木地板上，将一整天的疲惫悄然驱散。

厨房里传来抽油烟机微弱的嗡鸣与锅铲碰撞的清脆声响。一位身姿曼妙曼丽的成熟女子正站在灶台前，身上穿着一件修身居家的针织体恤，外系一袭天蓝色的围裙，恰到好处地收束出纤细柔软的腰肢与饱满圆润的臀线。几缕微卷的青丝散落在白皙细嫩的后颈旁，随着她翻炒的动作轻轻摇曳。

<p class="role-jiejie">“嗯？回来了吗？今天学校功课多不多？”</p>

听到门响，唐懿微微侧过柔美的脸庞，温婉的眸子在你脸上轻轻打量了一眼，嘴角泛起一抹让人安心的浅笑：

<p class="role-jiejie">“先去把书包放下，洗洗手准备吃饭。锅里焖着你最喜欢的红烧排骨，马上就能出锅了。”</p>

<thk>（这孩子最近长个子真快……眼神总往我身上瞟，今天出门前换围裙是不是太显身段了？……算了，多给他补补营养才是正事。）</thk>

她轻轻转回身去盛汤，围裙布料被紧绷的曲线微微撑起，在暖光下勾勒出成熟女性独有的柔美温存。

<details>
<summary class="k-sum">✨【角色状态栏】</summary>
<div class="k-box">◆信息状态栏◆
🌏【世界】：现代都市 / 21世纪
⏰【时间】：2026/09/30/周三/秋季/晴朗/18:30
🏕️【地点】：中国/沿海城市/静安区/温馨公寓
🏡【场景】：玄关与饭厅/饭菜飘香/温暖居家氛围
◆主互动角色状态栏◆
<div class="k-img">
<div class="fz-aprn"></div>
</div>
👤【角色】：唐懿 / 女 / 38岁
🎭【身份】：母亲 / 企业财务主管
💰【资金】：今日日常买菜开销 ¥128 / 家庭活期储蓄 ¥450,000
🫂【关系】：温柔宠溺 / 好感度 35% / 无变动
🌹【外貌】：黑发微卷低马尾 / 浅棕温婉美眸 / 丰腴成熟曲线 / 皮肤白皙细腻
👗【服装】：棕色长袖体恤搭配天蓝色围裙、黑色长裙（家务装）
🧍‍♀️【姿势】：手持汤勺站在灶台前微微回眸浅笑
💬【内心】：看到儿子平安放学心头微松，希望他多吃两碗排骨
🤍【健康】：体温 36.5℃ / 精力充沛 / 周期第8天·卵泡期正常
🔞【身体】：未进入特殊剧情
◆我的状态栏◆
👤【我】：儿子 / 18岁 / 高中毕业生
🍌【身材】：180cm / 匀称健康 / 暂无反应
✍️【设定】：容貌清秀 / 略带少年荷尔蒙躁动
💰【物品】：学生书包、钥匙串、零花钱 ¥85
</div>
</details>

<opt>
<suggested_questions>
["乖巧应答，把书包放到沙发并进厨房从身后帮妈妈系紧松开的围裙带子", "从玄关换鞋走过去，从背后探头看看锅里好吃的，顺势夸赞妈妈今天真香真美", "走到洗手台洗干净手，主动拿碗筷摆桌，询问妈妈今天上班累不累", "略显迟疑地站在厨房门口，目光忍不住落在妈妈被围裙勾勒出的丰腴腰臀曲线上"]
</suggested_questions>
</opt>"""
        }
    ]

    # Insert into Database (both PostgreSQL active engine and SQLite backup)
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
            "全服装立绘",
            "🩵",
            title,
            "40+写实服装换装·28天经期系统",
            "🩵",
            "#06b6d4",
            "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            json.dumps(handbook, ensure_ascii=False),
            json.dumps(roles, ensure_ascii=False),
            json.dumps(scenes, ensure_ascii=False),
            json.dumps(styles, ensure_ascii=False),
            json.dumps(first_turn, ensure_ascii=False),
            custom_css,
            custom_html,
            "家庭情感",
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

    # Plaza cards
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
        "全服装立绘 · 28天生理期",
        "#06b6d4",
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
        "家庭情感",
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
    import_mom_card()
