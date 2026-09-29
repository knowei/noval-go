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

def import_azur_lane_card():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    deck_id = "deck_azur_lane_open_world"
    title = "【碧蓝大世界】唯一指挥官与母港全员的日常修罗场"
    badge = "二次元 · 碧蓝航线"
    badge_color = "#38bdf8"
    theme_color = "#0284c7"
    btn_gradient = "linear-gradient(135deg, #0284c7 0%, #ec4899 100%)"
    cover_icon = "⚓"
    cover_image = "/images/azurlane/hatsuzuki_oath_full.jpg"
    category = "二次元"
    author_name = "AI风月官方"
    rating_score = "9.9"
    heat_str = "9999+ 亿"

    tag_list = ["碧蓝航线", "后宫修罗场", "傲娇婚纱", "心智魔方", "初月", "大凤", "欧根亲王", "沉浸大世界"]

    openings = [
        "【暴雨更衣室】：避雨误入露天温泉更衣室，在黑暗水汽中撞入半裹浴巾的初月怀中并仓皇躲入衣柜",
        "【魔方密闭舱】：深夜巡查深海船坞遇电梯故障骤停，在逼仄发烫空间内被魔方过载发热的欧根亲王反扑",
        "【私密夜查房】：庆功宴微醺回宿，当场推门抓包正抱着旧军服吸吮体味的娇羞大凤"
    ]

    desc_text = (
        "【碧蓝母港全员开放世界 · 唯一指挥官的极乐日常】\n"
        "你是碧蓝母港唯一的人类男性指挥官，拥有净化META侵蚀与抚平心智魔方过载的无上特殊体质。"
        "八百余位性格迥异、身姿曼妙的舰娘均将你视作不可替代的灵魂归宿。"
        "台风断电之夜误入温泉更衣室撞见半裹浴巾的傲娇初月、门外爱宕与病娇大凤脚步逼近；"
        "深夜船坞电梯故障与微醺妖娆的欧根亲王密闭共处；随着心智好感度突破，誓约之戒与官方绝美婚纱逐步解锁！"
    )

    handbook = {
        "title": title,
        "desc": desc_text,
        "bg_image": cover_image,
        "opening_options": openings
    }

    roles = [
        {
            "name": "指挥官 (玩家)",
            "role": "母港唯一男性指挥官",
            "desc": "拥有极其罕见的纯净心智魔方共鸣体质，一举一动皆能牵动母港全体舰娘的情愫与修罗场争端。"
        },
        {
            "name": "初月 (秋月级驱逐舰)",
            "role": "傲娇小娇妻",
            "desc": "重樱驱逐，嘴硬逞强却极易害羞破防。官方誓约婚纱「红桥映雪」期待中。"
        },
        {
            "name": "大凤 (装甲航空母舰)",
            "role": "重度病娇独占",
            "desc": "将身心100%系于指挥官一人，手握指挥官卧室备用钥匙，对指挥官身边任何异性保持雷达级警惕。"
        },
        {
            "name": "欧根亲王 (重巡洋舰)",
            "role": "微醺调情坏姐姐",
            "desc": "铁血重巡，喜欢拿着冰啤酒调戏脸红的指挥官，但在深层接触中渴望卸下心防与永恒归宿。"
        },
        {
            "name": "贝尔法斯特 (轻巡洋舰)",
            "role": "完美女仆长",
            "desc": "皇家女仆队领袖，无微不至照料主上的一切起居与身心需求。"
        }
    ]

    scenes = [
        {
            "title": "后宅温泉更衣室 · 暴风雨断电之夜",
            "desc": "台风肆虐断电的更衣室，撞入滑落浴巾的初月怀中，门外爱宕与大凤的脚步声正悄然逼近。"
        },
        {
            "title": "深海重工船坞 · 密闭升降梯故障",
            "desc": "深夜巡查突发系统锁死，狭窄闷热的空间内，魔方过载发热的欧根亲王轻吐酒气步步紧逼。"
        },
        {
            "title": "指挥官官邸主卧 · 私密夜查房",
            "desc": "推开房门，撞破偷抱换洗军服狂吸体味的大凤，病娇与极度羞耻在月光下拉扯破防。"
        }
    ]

    styles = {
        "dialogue_style": "碧蓝航线官方声优台词语癖高度还原，细腻体温感官描摹与多女修罗场极限拉扯",
        "format": "AI风月双轨心理解构标准规范与心智好感度/誓约契约度HUD"
    }

    first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "后宅温泉更衣室 · 暴风雨断电之夜",
            "story": (
                "<tl>📅时间：暴雨深夜 23:45 | 🌏世界：碧蓝大世界 | 🏘️场所：母港后宅·自然温泉更衣室木柜死角</tl>\n\n"
                "<article>\n"
                "<p>窗外狂暴的台风倾盆倾泻，一道刺目的蓝色闪电划破母港夜空，雷鸣炸响的同时，整座温泉别馆的电闸发出一声爆鸣，瞬间陷入一片死寂与漆黑。</p>\n"
                "<p>为了避雨仓皇推门跌入更衣室的你，在伸手不见五指的水汽浓雾中，脚下一个趔趄，整个人直挺挺撞进了一具温软滑腻、散发着幽幽山茶花香气的娇软躯体之中！</p>\n"
                "<p><fx>【扑通——！湿漉漉的布料撕扯与急促喘息声】</fx></p>\n"
                "<p><w>“呀啊——？！变、变态！笨蛋！是谁……唔！？”</w></p>\n"
                "<p>黑暗中，一双慌乱的小手下意识揪紧了你湿透的指挥官制服领口。温热滚烫的呼吸扑在你喉结上，她腰间原本就半松半挂的雪白浴巾在剧烈撞击下无声滑落，少女紧致细腻的雪白肌肤毫无阻隔地与你胸膛相贴！借着窗外再次闪过的雷光，你赫然看清了那张涨得通红、眼角噙着屈辱水汽的精致俏脸——重樱秋月级驱逐舰，初月！</p>\n"
                "<p><thk>（心跳……怎么会跳得这么快？！这股熟悉的烟草与海风气味……是指挥官？！等等，浴巾掉了……初月现在岂不是全被他摸到了看了个精光？！呜呜……要是被他讨厌或者觉得轻浮怎么办……可是被指挥官压着……心智魔方竟然舒服得快要融化了……）</thk></p>\n"
                "<p><alert>【突发修罗场危机】：就在此时，更衣室外木屐踩过积水的清脆声与黏腻脚步声同时由远及近传来！爱宕温柔成熟的嗓音带着微醺：“指挥官不在办公室呢，莫非来温泉暖身子了？”紧接着大凤那令人头皮发麻的甜腻喘息响起：“呵呵……大凤闻到了指挥官大人身上令人着迷的气味就在里面呢……”</alert></p>\n"
                "<p><w>“唔……？！大、大凤她们过来了……！”</w>初月吓得浑身发软战栗，小手死死捂住自己的嘴唇，眼泪汪汪地仰头望着你，惊慌失措地压低声音：<w>“被她们看到我们这样……初月就没脸见人了！快……快跟我躲进衣柜里……别出声！”</w></p>\n"
                "</article>\n"
                "<char_status>[目标角色]: 初月 | [心智好感度]: 68/100 (+8, 怦然喜欢) | [独占渴求值]: 42/100 (+5, 隐秘吃醋) | [誓约契约度]: 45/100 (+5, 「红桥映雪」期待中) | [心境微澜]: 浴巾滑落带来的极致羞耻让耳根滚烫如火，但被指挥官拥在怀里的安全感又让心智魔方兴奋共鸣</char_status>"
            ),
            "branches": [
                {"tag": "A", "title": "顺从躲入衣柜", "desc": "迅速将初月揽入窄小更衣柜，在极度逼仄的空间内紧紧相贴，用手掌捂住她滚烫的小嘴屏息静气"},
                {"tag": "B", "title": "强势主权安抚", "desc": "伸手反握住她颤抖的小手，轻抚她微颤的后背以魔方共鸣安抚其燥热，低声告诉她“有我在，别怕”"},
                {"tag": "C", "title": "反客为主逗弄", "desc": "借着更衣柜漆黑环境，指尖坏心眼地滑过她滑落浴巾的雪白腰肢，故意看这只傲娇驱逐害羞破防的可爱模样"},
                {"tag": "D", "title": "推门直面修罗", "desc": "索性护在初月身前推开更衣室大门，当场截住微醺的爱宕与病娇大凤，将修罗场主动权握在手中"}
            ]
        }
    ]

    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

    sqlite_path = os.path.join(ROOT_DIR, 'noval_data.db')
    sqlite_conn = sqlite3.connect(sqlite_path)
    sc = sqlite_conn.cursor()

    # 1. Insert into stories table
    ac.execute("DELETE FROM stories WHERE id = %s" if is_pg else "DELETE FROM stories WHERE id = ?", (deck_id,))
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
        deck_id,
        title,
        badge,
        cover_icon,
        "碧蓝航线",
        "母港全员日常修罗场",
        cover_icon,
        theme_color,
        btn_gradient,
        json.dumps(handbook, ensure_ascii=False),
        json.dumps(roles, ensure_ascii=False),
        json.dumps(scenes, ensure_ascii=False),
        json.dumps(styles, ensure_ascii=False),
        json.dumps(first_turn, ensure_ascii=False),
        "",
        desc_text,
        category,
        now_str,
        now_str
    )
    ac.execute(sql_active, params)

    sc.execute("DELETE FROM stories WHERE id = ?", (deck_id,))
    sc.execute("""
    INSERT INTO stories (
        id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
        handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
        custom_css, custom_html, category, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, params)

    # 2. Insert into plaza_cards table
    ac.execute("DELETE FROM plaza_cards WHERE id = %s OR deck_id = %s" if is_pg else "DELETE FROM plaza_cards WHERE id = ? OR deck_id = ?", (deck_id, deck_id))
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
        deck_id,
        deck_id,
        title,
        badge,
        badge_color,
        author_name,
        desc_text[:300],
        rating_score,
        json.dumps(tag_list, ensure_ascii=False),
        heat_str,
        0, # Put at top
        cover_image,
        'NEW',
        'fire',
        1,
        category,
        now_str
    )
    ac.execute(sql_plaza, plaza_params)

    sc.execute("DELETE FROM plaza_cards WHERE id = ? OR deck_id = ?", (deck_id, deck_id))
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

    print(f"[+] Successfully inserted '{title}' (ID: {deck_id}) into both Postgres and SQLite!", flush=True)

if __name__ == '__main__':
    import_azur_lane_card()
