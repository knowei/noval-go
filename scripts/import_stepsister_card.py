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

aid = "78546857-37c0-4608-a376-9d7efc653cdf"
alias = "deck_rebellious_stepsister"
title = "爹妈将管教不了的妹妹交给了你"
now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# Load raw downloaded json
json_path = os.path.join(ROOT_DIR, 'cards', f'{aid}.json')
raw_html = ''
if os.path.exists(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
        raw_html = raw_data.get('data', {}).get('apps', {}).get('description', '')

handbook = {
    "title": title,
    "desc": "你的家庭是一个重组家庭。近期，你的继妹夏茉迎来了极其严重的青春期叛逆，染发抽烟甚至对父母满嘴恶言。极度失望的父母断绝了她的生活费并打包送上了高铁塞到你家，给你下了死命令：不管用什么手段，替我们狠狠管教她！",
    "bg_image": "https://catai.wiki/2d0465c2-18a6-48c4-3d07-c565e7c2a100/cover",
    "opening_options": [
        "【玄关对峙·立下规矩】：“夏茉嚼着口香糖，戴着耳机将行李箱往你脚边一踢，伸手找你要钱点外卖。你面色冷淡地打掉她的手……”",
        "【没收手机·断网制裁】：“进门第一件事，你要求她交出手机并拔掉WiFi电源，她瞬间像被踩了尾巴的小猫一样尖叫起来……”",
        "【冷眼旁观·任性碰壁】：“你没有多说什么，自顾自做饭吃晚餐，看她能在又饿又没钱的情况下硬撑到几点……”"
    ]
}

roles = [
    {
        "name": "夏茉",
        "role": "继妹 (16岁 / 地雷系穿搭 / 叛逆嘴臭 / 初恋脸)",
        "desc": "重组家庭的继妹。表面嚣张跋扈、满嘴网络抽象梗，把你当成免费佣人和老登；内心极度敏感脆弱、渴望被在意，防备心极强。"
    },
    {
        "name": "哥哥 (玩家)",
        "role": "管教者与监护人",
        "desc": "独自居住的大学毕业生/青年，受父母之托对夏茉进行生活上的管教与心理上的引导。"
    }
]

scenes = [
    {
        "title": "单身公寓门厅 · 杂乱的玄关前",
        "desc": "狭窄但整洁的公寓门口，弥漫着少女身上淡淡的电子烟香气。"
    },
    {
        "title": "单身公寓客厅 · 紧闭的次卧房门",
        "desc": "仅有一道门帘相隔的合住空间，充斥着两人的心智博弈。"
    }
]

first_turn_demo = {
    "index": 1,
    "isUser": False,
    "scene": "单身公寓门厅 · 杂乱的玄关前",
    "story": """<tl>📅时间：周五傍晚 18:00 | 🌏地点：单身公寓门厅 | 🚪氛围：针锋相对</tl>

<article>
<p>砰的一声，门铃响得急促而暴躁。</p>

<p>你拉开防盗门，一股混杂着劣质草莓味电子烟与少女微弱香水的气味迎面扑来。站在门外台阶上的，正是那个让全家头疼欲裂的继妹——夏茉。</p>

<p>她头戴一副硕大的粉黑配色降噪耳机，身上套着一件快要盖过百褶裙的宽大破洞T恤，细瘦白皙的长腿上踩着厚底松糕鞋。她嘴里正漫不经心地嚼着口香糖，鼻腔里哼出一声冷气，抬起脚把那个沉重的行李箱直接踢到了你的鞋柜边上。</p>

<p><w>“看什么看啊虾头男？”</w>夏茉摘下一侧耳机挂在脖子上，抱着双臂斜眼上下打量着你，语气刻薄又带着挑衅，<w>“别以为那两个老登把你搬出来本小姐就会怕你。赶紧爆点金币给我点个外卖，本小姐坐了一下午高铁快饿死了，别逼我急眼啊！”</w></p>
</article>""",
    "branches": [
        {"tag": "A", "title": "立下规矩", "desc": "严厉制止她的无礼行为，勒令收起香烟与耳机"},
        {"tag": "B", "title": "经济制裁", "desc": "明确告知这里由你做主，交出手机才给饭吃"},
        {"tag": "C", "title": "冷漠无视", "desc": "无视她的叫嚣，关上房门看她能嘴硬多久"}
    ]
}

styles = {
    "dialogue_style": "张力十足的生活化情感博弈，生动的神态捕捉与心理推拉",
    "format": "AI风月标准双栏规范及.custom-ui样式"
}

tags = ["叛逆少女", "家庭情感", "地雷系", "性格反差", "养成管教", "慢热剧情"]

handbook_json = json.dumps(handbook, ensure_ascii=False)
roles_json = json.dumps(roles, ensure_ascii=False)
scenes_json = json.dumps(scenes, ensure_ascii=False)
styles_json = json.dumps(styles, ensure_ascii=False)
first_turn_json = json.dumps(first_turn_demo, ensure_ascii=False)
tags_json = json.dumps(tags, ensure_ascii=False)

# 1. Active connection
active_conn = db_engine.db.get_connection()
ac = active_conn.cursor()
is_pg = db_engine.db.dialect == 'postgres'

# 2. Local SQLite connection if separate
sqlite_conn = sqlite3.connect(os.path.join(ROOT_DIR, 'noval_data.db')) if is_pg else None
sc = sqlite_conn.cursor() if is_pg else None

badge = "家庭 · 叛逆管教"
badge_color = "#ec4899"
theme_color = "#ff1493"
btn_gradient = "linear-gradient(135deg, #ff1493 0%, #c71585 100%)"
cover_url = "https://catai.wiki/2d0465c2-18a6-48c4-3d07-c565e7c2a100/cover"
category = "家庭情感"
rating = "8.5"
heat = "28.2k 玩过 · 8.1k 深度"

for sid in [aid, alias]:
    if is_pg:
        ac.execute("DELETE FROM stories WHERE id = %s", (sid,))
        ac.execute("""
        INSERT INTO stories (
            id, title, badge, cover_icon, cover_title, cover_subtitle, logo,
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_demo_json, custom_css, custom_html, category, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            sid, title, badge, "👧", title, badge, "👧",
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_json, "", raw_html, category, now_str, now_str
        ))
    else:
        ac.execute("DELETE FROM stories WHERE id = ?", (sid,))
        ac.execute("""
        INSERT INTO stories (
            id, title, badge, cover_icon, cover_title, cover_subtitle, logo,
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_demo_json, custom_css, custom_html, category, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sid, title, badge, "👧", title, badge, "👧",
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_json, "", raw_html, category, now_str, now_str
        ))

    if sc:
        sc.execute("DELETE FROM stories WHERE id = ?", (sid,))
        sc.execute("""
        INSERT INTO stories (
            id, title, badge, cover_icon, cover_title, cover_subtitle, logo,
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_demo_json, custom_css, custom_html, category, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sid, title, badge, "👧", title, badge, "👧",
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_json, "", raw_html, category, now_str, now_str
        ))

for pid, pdeck, ptitle in [(aid, aid, title), (alias, alias, f"{title} (别名)")]:
    if is_pg:
        ac.execute("DELETE FROM plaza_cards WHERE id = %s OR title = %s", (pid, ptitle))
        ac.execute("""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating,
            tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            pid, pdeck, ptitle, badge, badge_color, "AI风月精选",
            title, rating, tags_json, heat, 1,
            cover_url, "HOT", "fire", 1, category, now_str
        ))
    else:
        ac.execute("DELETE FROM plaza_cards WHERE id = ? OR title = ?", (pid, ptitle))
        ac.execute("""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating,
            tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pid, pdeck, ptitle, badge, badge_color, "AI风月精选",
            title, rating, tags_json, heat, 1,
            cover_url, "HOT", "fire", 1, category, now_str
        ))

    if sc:
        sc.execute("DELETE FROM plaza_cards WHERE id = ? OR title = ?", (pid, ptitle))
        sc.execute("""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating,
            tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pid, pdeck, ptitle, badge, badge_color, "AI风月精选",
            title, rating, tags_json, heat, 1,
            cover_url, "HOT", "fire", 1, category, now_str
        ))

active_conn.commit()
active_conn.close()
if sqlite_conn:
    sqlite_conn.commit()
    sqlite_conn.close()

print(f"[🎉] Successfully imported '{title}' into stories & plaza_cards tables!")
