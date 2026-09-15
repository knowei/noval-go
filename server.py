"""
轻量级本地生产服务：
1. 静态托管当前目录 (index.html, stories_data.js 等)
2. 跨域代理转发 /proxy?target=...
3. SQLite 关系型数据库 (noval_data.db)：
   - users 表：用户身份与资产
   - conversations 表：分剧本多存档会话
   - stories 表：剧本、角色卡与开卷手册核心资产库 (RESTful API)
   - plaza_cards 表：探索广场卡片库与真分页检索 (RESTful API)
"""
import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import hashlib
import sqlite3
import os
import sys
from datetime import datetime
import studio_api

PORT = int(os.environ.get('NOVAL_PORT', '5173'))
DB_FILE = os.environ.get('NOVAL_DB_PATH') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'noval_data.db')

# Ensure DB directory exists and seed if empty
os.makedirs(os.path.dirname(os.path.abspath(DB_FILE)), exist_ok=True)
seed_db = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'noval_data.db')
if not os.path.exists(DB_FILE) and os.path.exists(seed_db) and os.path.abspath(DB_FILE) != os.path.abspath(seed_db):
    import shutil
    shutil.copy2(seed_db, DB_FILE)

def get_db():
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA busy_timeout=5000;")
    except Exception:
        pass
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # 1. 用户表
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT DEFAULT '',
        nickname TEXT,
        avatar TEXT,
        points INTEGER DEFAULT 9999,
        model_config_json TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    )
    """)
    try:
        c.execute("ALTER TABLE users ADD COLUMN password_hash TEXT DEFAULT ''")
    except Exception: pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN model_config_json TEXT DEFAULT ''")
    except Exception: pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP")
    except Exception: pass
    # stories 扩展字段平滑迁移
    for col, col_def in [
        ("custom_css", "TEXT DEFAULT ''"),
        ("custom_html", "TEXT DEFAULT ''"),
        ("category", "TEXT DEFAULT '都市'")
    ]:
        try:
            c.execute(f"ALTER TABLE stories ADD COLUMN {col} {col_def}")
        except Exception: pass

    # plaza_cards 扩展字段平滑迁移
    for col, col_def in [
        ("deck_id", "TEXT"),
        ("badge", "TEXT"),
        ("badge_color", "TEXT"),
        ("author", "TEXT"),
        ("desc", "TEXT"),
        ("rating", "TEXT DEFAULT '5.0'"),
        ("tags_json", "TEXT"),
        ("heat", "TEXT"),
        ("order_index", "INTEGER DEFAULT 0"),
        ("cover_image", "TEXT DEFAULT ''"),
        ("image_tag", "TEXT DEFAULT ''"),
        ("badge_type", "TEXT DEFAULT 'fire'"),
        ("is_featured", "INTEGER DEFAULT 0"),
        ("category", "TEXT DEFAULT '都市'")
    ]:
        try:
            c.execute(f"ALTER TABLE plaza_cards ADD COLUMN {col} {col_def}")
        except Exception: pass

    # 2. 会话/存档表
    c.execute("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'default_user',
        deck_id TEXT,
        deck_title TEXT,
        title TEXT,
        history_json TEXT,
        turn_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. 剧本设定主表 (Stories / Decks)
    c.execute("""
    CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        badge TEXT,
        cover_icon TEXT,
        cover_title TEXT,
        cover_subtitle TEXT,
        logo TEXT,
        theme_color TEXT,
        btn_gradient TEXT,
        handbook_json TEXT,
        roles_json TEXT,
        scenes_json TEXT,
        styles_json TEXT,
        first_turn_demo_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 4. 探索广场卡片表 (Plaza Cards)
    c.execute("""
    CREATE TABLE IF NOT EXISTS plaza_cards (
        id TEXT PRIMARY KEY,
        deck_id TEXT,
        title TEXT NOT NULL,
        badge TEXT,
        badge_color TEXT,
        author TEXT,
        desc TEXT,
        rating TEXT DEFAULT '5.0',
        tags_json TEXT,
        heat TEXT DEFAULT '1.0 亿',
        order_index INTEGER DEFAULT 0,
        cover_image TEXT,
        image_tag TEXT,
        badge_type TEXT DEFAULT 'fire',
        is_featured INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 5. 分类标签表
    c.execute("""
    CREATE TABLE IF NOT EXISTS plaza_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        order_index INTEGER DEFAULT 0
    )
    """)

    # 6. 社区精选文章表
    c.execute("""
    CREATE TABLE IF NOT EXISTS community_articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        icon TEXT,
        heat TEXT,
        tag TEXT,
        action_type TEXT,
        action_target TEXT,
        order_index INTEGER DEFAULT 0
    )
    """)

    # 7. 系统通知与公告表
    c.execute("""
    CREATE TABLE IF NOT EXISTS system_notices (
        id TEXT PRIMARY KEY,
        notice_type TEXT,
        title TEXT NOT NULL,
        content TEXT,
        countdown_seconds INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
    )
    """)

    # 默认用户
    c.execute("""
    INSERT OR IGNORE INTO users (id, username, nickname, avatar, points) 
    VALUES ('default_user', 'player', '风月旅行者', '🎭', 9999)
    """)

    conn.commit()
    conn.close()

    # 检查并从已有的 stories_data.js 迁移数据入库
    migrate_default_data_if_needed()
    # 自动从随代码更新的 seed 数据库增补/同步官方剧本与广场卡片（平滑支持 Docker 挂载数据卷）
    sync_from_seed_db()
    studio_api.initialize(get_db)

def sync_from_seed_db():
    seed_db = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'noval_data.db')
    if not os.path.exists(seed_db) or os.path.abspath(DB_FILE) == os.path.abspath(seed_db):
        return
    try:
        s_conn = sqlite3.connect(seed_db)
        s_c = s_conn.cursor()
        t_conn = sqlite3.connect(DB_FILE)
        t_c = t_conn.cursor()

        # 动态同步官方系统表数据，保持用户表 users 与会话表 conversations 绝不被覆盖
        sync_tables = ['stories', 'plaza_cards', 'plaza_categories', 'community_articles', 'system_notices']
        for tbl in sync_tables:
            try:
                t_c.execute(f"PRAGMA table_info({tbl})")
                t_cols = set(r[1] for r in t_c.fetchall())
                s_c.execute(f"PRAGMA table_info({tbl})")
                s_cols = [r[1] for r in s_c.fetchall() if r[1] in t_cols]
                if not s_cols:
                    continue

                col_str = ', '.join(s_cols)
                placeholders = ', '.join(['?'] * len(s_cols))
                update_clause = ', '.join([f"{col}=excluded.{col}" for col in s_cols if col not in ('id', 'created_at')])

                s_c.execute(f"SELECT {col_str} FROM {tbl}")
                rows = s_c.fetchall()
                if rows:
                    sql = f"INSERT INTO {tbl} ({col_str}) VALUES ({placeholders}) ON CONFLICT(id) DO UPDATE SET {update_clause}"
                    t_c.executemany(sql, rows)
            except Exception as te:
                print(f"[DB Auto-Sync] table {tbl} notice: {te}")

        t_conn.commit()
        s_conn.close()
        t_conn.close()
        print("[DB Auto-Sync] Successfully synced latest official decks and plaza cards from seed database.")
    except Exception as e:
        print(f"[DB Auto-Sync Warning] Failed to sync from seed_db: {e}")

def migrate_default_data_if_needed():
    conn = get_db()
    c = conn.cursor()

    stories_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stories_data.js')
    if os.path.exists(stories_file):
        try:
            with open(stories_file, 'r', encoding='utf-8') as f:
                code = f.read()
            prefix = 'window.SHARED_STORY_DATABASE = '
            idx = code.find(prefix)
            if idx != -1:
                json_str = code[idx+len(prefix):].rstrip().rstrip(';')
                stories_map = json.loads(json_str)
                for deck_id, s in stories_map.items():
                    c.execute("""
                    INSERT OR IGNORE INTO stories (
                        id, title, badge, cover_icon, cover_title, cover_subtitle,
                        logo, theme_color, btn_gradient, handbook_json, roles_json,
                        scenes_json, styles_json, first_turn_demo_json, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    """, (
                        deck_id,
                        s.get('title', ''),
                        s.get('badge', ''),
                        s.get('coverIcon') or s.get('logo', '📖'),
                        s.get('coverTitle') or s.get('title', ''),
                        s.get('coverSubtitle', ''),
                        s.get('logo', '📖'),
                        s.get('themeColor', 'rose'),
                        s.get('btnGradient', 'from-rose-600 to-pink-600'),
                        json.dumps(s.get('handbook', {}), ensure_ascii=False),
                        json.dumps(s.get('roles', []), ensure_ascii=False),
                        json.dumps(s.get('scenes', []), ensure_ascii=False),
                        json.dumps(s.get('styles', []), ensure_ascii=False),
                        json.dumps(s.get('firstTurnDemo', {}), ensure_ascii=False)
                    ))
                conn.commit()
                print(f"[DB] Successfully synced {len(stories_map)} stories into SQLite table.")
        except Exception as e:
            print(f"[DB Migration Warning] stories sync failed: {e}")

    # 检查 plaza_cards 表
    c.execute('SELECT COUNT(*) FROM plaza_cards')
    card_count = c.fetchone()[0]
    if card_count == 0:
        default_cards = [
            ("p_yuzuki", "deck_yuzuki", "【共生沉沦】37.1℃发热午后 · 妹妹夕月的量体温照护", "🔥 官方力荐 · 病娇高岭之花", "bg-rose-950/90 text-rose-300 border-rose-600/60", "神崎优真", "【密闭榻榻米】【病娇妹妹】【伦理越界攻防】全校公认的高岭之花神崎夕月，在电脑撞破秘密后借看护之名反锁房门步步紧逼……", "5.0", ["病娇独占", "高岭之花", "37.1℃发热", "伪装看护", "密闭空间"], "99.9 亿", 0),
            ("p1", "deck_5274d525", "【中式人生】高中模拟器", "官方神级力作 · 县城高中三年模拟", "bg-rose-950/90 text-rose-200 border-rose-600/60", "桃意间", "【早午晚三段视觉（精品美化）】【类人生重开模拟器玩法】十年寒窗，晚自习下课铃声响起的瞬间，同桌在草稿纸上画哭脸塞给你耳机线...", "9.8", ["中式青春", "人生模拟", "晚自习", "七维数值", "破甲"], "98.8 亿", 1),
            ("p2", "harumi", "(纯爱肉卡) 爆操反差婊小学妹！", "校园优等生 · 秘密撞破", "bg-pink-950/90 text-pink-200 border-pink-600/60", "晴海制作组", "青叶台高中废弃图书室死角。平日清冷第一的优等生晴海小晴，看羞耻视频被你当场撞破，双手被制便迅速泪崩投怀哀求...", "9.7", ["反差破防", "校园把柄", "极度温存", "掌控"], "134.2 亿", 2),
            ("p3", "novel", "雪夜共生 · 悠月与哥哥", "日系轻小说 · 禁断之恋", "bg-sky-950/90 text-sky-200 border-sky-600/60", "桃意间", "极度细腻的情感心理拉扯。暴雪夜里被迫与妹妹困在单间公寓，被炉下的体温与呼吸交错，彼此压抑多年的秘密破茧成蝶...", "9.9", ["日系轻小说", "情感张力", "骨科", "氛围", "救赎"], "42.5 亿", 3),
            ("p4", "spa", "私密水疗 · 极道温存理疗师", "现代都市 · 私享治愈", "bg-purple-950/80 text-purple-200 border-purple-700/50", "浅草会馆", "幽暗香薰包厢内，温热精油贴上肩颈。开叉旗袍温雅耳畔轻语，带你在私密按摩中彻底卸下一切防备与疲惫...", "9.3", ["水疗技师", "温柔治愈", "密室独处", "破甲"], "12.8 亿", 4),
            ("p5", "deck_d8ab1654", "🐉我即系统!🐉【自定义系统任务及奖励】", "神级脑洞 · 幕后黑手流", "bg-amber-950/80 text-amber-200 border-amber-700/50", "系统法则", "无玩家实体。绑定主角发布每日任务与定制奖励，看着对方为了变强一步步按照你的剧本沦陷沉沦...", "9.5", ["系统流", "幕后黑手", "养成", "自由度"], "19.9 亿", 5),
            ("p6", "deck_5274d525", "【末世废土】避难所唯一的男医生", "末日生存 · 资源与欲望", "bg-emerald-950/80 text-emerald-200 border-emerald-700/50", "核子可乐", "地下避难所资源极度匮乏，作为唯一的全科医生，每一针抗生素与纯净水都成了交换最隐秘条件的硬通货...", "9.6", ["末世求生", "医生特权", "反差女角色", "暗黑欲望"], "26.3 亿", 6),
            ("p7", "deck_5274d525", "我的白月光同桌在毕业十年后", "都市重逢 · 遗憾重燃", "bg-stone-800 text-stone-200 border-stone-600", "风吹麦浪", "同学聚会后的微醺深夜，当年未说出口的遗憾在酒店长廊偶遇。已为人妻的她红着眼眶问：“当年那张纸条，你真的没看到吗？”", "9.7", ["都市情感", "久别重逢", "成年人拉扯", "纯爱与出轨"], "31.7 亿", 7),
            ("p8", "deck_5274d525", "病娇魅魔青梅的逆向饲育记录", "奇幻反差 · 占有欲爆棚", "bg-rose-950/90 text-rose-200 border-rose-600/60", "暗黑砂糖", "表面是温柔体贴的邻家姐姐，背地里却在你的饭菜里混入魅魔契约药剂。锁链轻响的地下室，她微笑着端来今天的热汤...", "9.8", ["病娇", "逆向饲育", "重度依恋", "监禁纯爱"], "48.2 亿", 8),
            ("p9", "deck_5274d525", "零都 少女的终局战场 🥷", "近期热门作品", "bg-stone-800 text-stone-200 border-stone-600", "极波姬", "【💥战斗狂爱】【🌸文风氧化】【💉内容脱靶】【🗡可快餐可长线】【💣战烈播种】近未来废墟中与改造少女的生死誓约...", "10.0", ["高自由度", "增强色情描写", "开放世界", "战斗"], "3.9 亿", 9),
            ("p10", "deck_5274d525", "【roll天赋/大世界】从零开始的修仙日常", "踏入名门正派还是沦落魔道杀伐？", "bg-[#252830] text-amber-300 border-[#3a3f4d]", "叶宛沂水", "欢迎来到最真实的修仙世界！这里你可以体验抽灵根，roll天赋，还可以从凡人开始修仙... 全宗门都有专属法术与情缘！", "9.4", ["全性向", "高自由度", "修仙", "大世界"], "375.4 亿", 10)
        ]
        for card in default_cards:
            c.execute("""
            INSERT INTO plaza_cards (id, deck_id, title, badge, badge_color, author, desc, rating, tags_json, heat, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (card[0], card[1], card[2], card[3], card[4], card[5], card[6], card[7], json.dumps(card[8], ensure_ascii=False), card[9], card[10]))
        conn.commit()
        print(f"[DB] Initialized {len(default_cards)} default plaza cards into SQLite table.")

    conn.close()

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        resp_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(resp_bytes)))
        self.end_headers()
        self.wfile.write(resp_bytes)

    def do_POST(self):
        if studio_api.handle(self, get_db, 'POST'):
            return
        # 1. 跨域代理转发 /proxy?target=...
        if self.path.startswith('/proxy'):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            target_url = params.get('target', [None])[0]

            if not target_url:
                self.send_json({'error': 'Missing target url'}, 400)
                return

            content_len = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_len)

            req_headers = {
                'Content-Type': self.headers.get('Content-Type', 'application/json')
            }
            if 'Authorization' in self.headers:
                req_headers['Authorization'] = self.headers['Authorization']

            try:
                forward_req = urllib.request.Request(target_url, data=post_body, headers=req_headers, method='POST')
                with urllib.request.urlopen(forward_req, timeout=180) as resp:
                    self.send_response(resp.getcode())
                    content_type = resp.headers.get('Content-Type', 'application/json')
                    self.send_header('Content-Type', content_type)
                    self.send_header('Cache-Control', 'no-cache')
                    self.send_header('Connection', 'keep-alive')
                    self.end_headers()
                    while True:
                        chunk = resp.read(512)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        self.wfile.flush()
            except urllib.error.HTTPError as e:
                err_data = e.read()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(err_data)
            except Exception as e:
                self.send_json({'error': str(e)}, 500)
            return

        # 2. 保存会话/存档 POST /api/conversations
        if self.path == '/api/conversations':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))

            conv_id = body.get('id') or f"conv_{int(datetime.now().timestamp()*1000)}"
            user_id = body.get('user_id', 'default_user')
            deck_id = body.get('deck_id', 'deck_5274d525')
            deck_title = body.get('deck_title', '中式人生')
            title = body.get('title', '新场景存档')
            history = body.get('history', [])
            turn_count = len(history)
            now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            conn = get_db()
            c = conn.cursor()
            c.execute("""
            INSERT INTO conversations (id, user_id, deck_id, deck_title, title, history_json, turn_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                deck_id = excluded.deck_id,
                deck_title = excluded.deck_title,
                history_json = excluded.history_json,
                turn_count = excluded.turn_count,
                updated_at = excluded.updated_at
            """, (conv_id, user_id, deck_id, deck_title, title, json.dumps(history, ensure_ascii=False), turn_count, now_str, now_str))
            conn.commit()
            conn.close()

            self.send_json({'success': True, 'id': conv_id, 'updated_at': now_str})
            return

        # 3. 删除会话 POST /api/conversations/delete
        if self.path == '/api/conversations/delete':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))
            conv_id = body.get('id')

            conn = get_db()
            c = conn.cursor()
            c.execute('DELETE FROM conversations WHERE id = ?', (conv_id,))
            conn.commit()
            conn.close()

            self.send_json({'success': True, 'id': conv_id})
            return

        # 4. 账号系统与个人配置相关 POST
        if self.path == '/api/auth/register':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))
            username = (body.get('username') or '').strip()
            password = body.get('password') or ''
            nickname = (body.get('nickname') or username or '新晋旅行者').strip()
            avatar = body.get('avatar') or '🌟'
            model_config = body.get('model_config') or {
                'api_base': 'https://api.deepseek.com/v1',
                'api_key': '',
                'api_model': 'deepseek-flash',
                'provider': 'custom'
            }

            if not username:
                self.send_json({'error': '用户名不能为空'}, 400)
                return

            conn = get_db()
            c = conn.cursor()
            c.execute('SELECT id FROM users WHERE username = ?', (username,))
            if c.fetchone():
                conn.close()
                self.send_json({'error': '用户名已存在，请直接登录或换一个用户名'}, 400)
                return

            new_id = f"user_{int(datetime.now().timestamp()*1000)}"
            pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest() if password else ''

            c.execute("""
            INSERT INTO users (id, username, password_hash, nickname, avatar, points, model_config_json)
            VALUES (?, ?, ?, ?, ?, 9999, ?)
            """, (new_id, username, pw_hash, nickname, avatar, json.dumps(model_config, ensure_ascii=False)))
            conn.commit()
            conn.close()

            self.send_json({
                'success': True,
                'user': {
                    'id': new_id,
                    'username': username,
                    'nickname': nickname,
                    'avatar': avatar,
                    'points': 9999,
                    'model_config': model_config
                }
            })
            return

        if self.path == '/api/auth/login':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))
            username = (body.get('username') or '').strip()
            password = body.get('password') or ''

            conn = get_db()
            c = conn.cursor()
            c.execute('SELECT id, username, password_hash, nickname, avatar, points, model_config_json FROM users WHERE username = ?', (username,))
            row = c.fetchone()
            conn.close()

            if not row:
                self.send_json({'error': '该用户不存在，请先注册'}, 404)
                return

            pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest() if password else ''
            stored_hash = row['password_hash']
            if stored_hash and stored_hash != pw_hash:
                self.send_json({'error': '密码错误，请重新输入'}, 401)
                return

            cfg = {}
            if row['model_config_json']:
                try:
                    cfg = json.loads(row['model_config_json'])
                except Exception:
                    pass

            self.send_json({
                'success': True,
                'user': {
                    'id': row['id'],
                    'username': row['username'],
                    'nickname': row['nickname'],
                    'avatar': row['avatar'],
                    'points': row['points'],
                    'model_config': cfg
                }
            })
            return

        if self.path == '/api/user/model-settings':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))
            user_id = body.get('user_id') or self.headers.get('X-User-Id') or 'default_user'
            model_config = body.get('model_config') or {}

            conn = get_db()
            c = conn.cursor()
            c.execute('UPDATE users SET model_config_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                      (json.dumps(model_config, ensure_ascii=False), user_id))
            conn.commit()
            conn.close()

            self.send_json({'success': True, 'id': user_id, 'model_config': model_config})
            return

        if self.path == '/api/user/profile':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))
            nickname = body.get('nickname', '风月旅行者')
            avatar = body.get('avatar', '🎭')
            user_id = body.get('user_id') or self.headers.get('X-User-Id') or 'default_user'

            conn = get_db()
            c = conn.cursor()
            c.execute('UPDATE users SET nickname = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', (nickname, avatar, user_id))
            conn.commit()
            conn.close()

            self.send_json({'success': True, 'id': user_id, 'nickname': nickname, 'avatar': avatar})
            return

        # 5. 在线创建/更新剧本 POST /api/stories (创作中心持久化)
        if self.path == '/api/stories':
            content_len = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(content_len).decode('utf-8'))
            deck_id = payload.get('id') or f"deck_{int(datetime.now().timestamp()*1000)}"
            s = payload.get('story') if isinstance(payload.get('story'), dict) else payload
            title = s.get('title', '新创作剧本')
            badge = s.get('badge', '用户自创')
            cover_icon = s.get('coverIcon') or s.get('logo', '📖')
            cover_title = s.get('coverTitle') or title
            cover_subtitle = s.get('coverSubtitle', '')
            logo = s.get('logo', '📖')
            theme_color = s.get('themeColor', 'rose')
            btn_gradient = s.get('btnGradient', 'from-rose-600 to-pink-600')
            handbook = json.dumps(s.get('handbook', {}), ensure_ascii=False)
            roles = json.dumps(s.get('roles', []), ensure_ascii=False)
            scenes = json.dumps(s.get('scenes', []), ensure_ascii=False)
            styles = json.dumps(s.get('styles', []), ensure_ascii=False)
            demo = json.dumps(s.get('firstTurnDemo', {}), ensure_ascii=False)
            custom_html = s.get('customHtml') or s.get('custom_html') or ''

            conn = get_db()
            c = conn.cursor()
            c.execute("""
            INSERT INTO stories (
                id, title, badge, cover_icon, cover_title, cover_subtitle,
                logo, theme_color, btn_gradient, handbook_json, roles_json,
                scenes_json, styles_json, first_turn_demo_json, custom_html, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                badge = excluded.badge,
                cover_icon = excluded.cover_icon,
                cover_title = excluded.cover_title,
                cover_subtitle = excluded.cover_subtitle,
                handbook_json = excluded.handbook_json,
                roles_json = excluded.roles_json,
                scenes_json = excluded.scenes_json,
                styles_json = excluded.styles_json,
                first_turn_demo_json = excluded.first_turn_demo_json,
                custom_html = excluded.custom_html,
                updated_at = CURRENT_TIMESTAMP
            """, (deck_id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient, handbook, roles, scenes, styles, demo, custom_html))

            # 同步写入/更新 plaza_cards 广场卡片，让新创作的剧本即刻在首页展示
            desc = s.get('desc') or (s.get('handbook') or {}).get('desc') or title
            tags = s.get('tags') or []
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',') if t.strip()]
            category = s.get('category') or '都市'
            c.execute("""
            INSERT OR REPLACE INTO plaza_cards (
                id, deck_id, title, badge, badge_color, author,
                desc, rating, tags_json, heat, is_featured, order_index, category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"p_{deck_id}",
                deck_id,
                title,
                badge,
                theme_color,
                s.get('author', '原创作者'),
                desc,
                '9.9',
                json.dumps(tags, ensure_ascii=False),
                'NEW · 刚刚创作',
                1,
                1,
                category
            ))

            conn.commit()
            conn.close()

            self.send_json({'success': True, 'id': deck_id, 'title': title})
            return

        # 6. 新增/发布探索广场卡片 POST /api/plaza
        if self.path == '/api/plaza':
            content_len = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_len).decode('utf-8'))
            card_id = body.get('id') or f"p_{int(datetime.now().timestamp()*1000)}"
            deck_id = body.get('deck_id')
            title = body.get('title', '')
            badge = body.get('badge', '热门')
            badge_color = body.get('badge_color', 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50')
            author = body.get('author', 'AI风月')
            desc = body.get('desc', '')
            rating = body.get('rating', '5.0')
            tags = json.dumps(body.get('tags', []), ensure_ascii=False)

            conn = get_db()
            c = conn.cursor()
            c.execute("""
            INSERT OR REPLACE INTO plaza_cards (
                id, deck_id, title, badge, badge_color, author,
                desc, rating, tags_json, order_index
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            """, (card_id, deck_id, title, badge, badge_color, author, desc, rating, tags))
            conn.commit()
            conn.close()

            self.send_json({'success': True, 'id': card_id})
            return

        super().do_POST()

    def do_GET(self):
        if studio_api.handle(self, get_db, 'GET'):
            return
        # 1. 跨域代理 GET
        if self.path.startswith('/proxy'):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            target_url = params.get('target', [None])[0]

            if not target_url:
                self.send_json({'error': 'Missing target url'}, 400)
                return

            req_headers = {}
            if 'Authorization' in self.headers:
                req_headers['Authorization'] = self.headers['Authorization']

            try:
                forward_req = urllib.request.Request(target_url, headers=req_headers, method='GET')
                with urllib.request.urlopen(forward_req, timeout=15) as resp:
                    resp_data = resp.read()
                    self.send_response(resp.getcode())
                    self.send_header('Content-Type', resp.headers.get('Content-Type', 'application/json'))
                    self.end_headers()
                    self.wfile.write(resp_data)
            except urllib.error.HTTPError as e:
                err_data = e.read()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(err_data)
            except Exception as e:
                self.send_json({'error': str(e)}, 500)
            return

        # 2. 获取用户资料与多账号列表 GET
        if self.path.startswith('/api/auth/me') or self.path.startswith('/api/user/profile'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            user_id = params.get('user_id', [None])[0] or self.headers.get('X-User-Id') or 'default_user'

            conn = get_db()
            c = conn.cursor()
            c.execute('SELECT id, username, nickname, avatar, points, model_config_json FROM users WHERE id = ?', (user_id,))
            row = c.fetchone()
            conn.close()
            if row:
                u = dict(row)
                cfg = {}
                if u.get('model_config_json'):
                    try:
                        cfg = json.loads(u['model_config_json'])
                    except Exception:
                        pass
                u['model_config'] = cfg
                u.pop('model_config_json', None)
                self.send_json(u)
            else:
                self.send_json({'id': 'default_user', 'username': 'player', 'nickname': '风月旅行者', 'avatar': '🎭', 'points': 9999, 'model_config': {}})
            return

        if self.path == '/api/user/list':
            conn = get_db()
            c = conn.cursor()
            c.execute('SELECT id, username, nickname, avatar, points, updated_at FROM users ORDER BY updated_at DESC, created_at DESC')
            rows = c.fetchall()
            conn.close()
            self.send_json([dict(r) for r in rows])
            return

        # 3. 获取会话列表或单个会话 GET /api/conversations (支持按 user_id 严格物理隔离)
        if self.path.startswith('/api/conversations'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            conv_id = params.get('id', [None])[0]
            user_id = params.get('user_id', [None])[0] or self.headers.get('X-User-Id')

            conn = get_db()
            c = conn.cursor()
            if conv_id:
                c.execute("""
                SELECT id, user_id, deck_id, deck_title, title, history_json, turn_count, created_at, updated_at 
                FROM conversations WHERE id = ?
                """, (conv_id,))
                row = c.fetchone()
                conn.close()
                if row:
                    data = dict(row)
                    data['history'] = json.loads(data.pop('history_json') or '[]')
                    self.send_json(data)
                else:
                    self.send_json({'error': 'Conversation not found'}, 404)
            else:
                if user_id and user_id != 'all':
                    c.execute("""
                    SELECT id, user_id, deck_id, deck_title, title, turn_count, created_at, updated_at 
                    FROM conversations WHERE user_id = ? ORDER BY updated_at DESC
                    """, (user_id,))
                else:
                    c.execute("""
                    SELECT id, user_id, deck_id, deck_title, title, turn_count, created_at, updated_at 
                    FROM conversations ORDER BY updated_at DESC
                    """)
                rows = c.fetchall()
                conn.close()
                self.send_json([dict(r) for r in rows])
            return

        # 4. 获取剧本库数据 GET /api/stories (单查与全量字典查询)
        if self.path.startswith('/api/stories'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            deck_id = params.get('id', [None])[0]

            conn = get_db()
            c = conn.cursor()
            if deck_id:
                c.execute('SELECT * FROM stories WHERE id = ?', (deck_id,))
                row = c.fetchone()
                conn.close()
                if row:
                    s = dict(row)
                    res = {
                        'id': s['id'],
                        'title': s['title'],
                        'badge': s['badge'],
                        'coverIcon': s['cover_icon'],
                        'coverTitle': s['cover_title'],
                        'coverSubtitle': s['cover_subtitle'],
                        'logo': s['logo'],
                        'themeColor': s['theme_color'],
                        'btnGradient': s['btn_gradient'],
                        'handbook': json.loads(s['handbook_json'] or '{}'),
                        'roles': json.loads(s['roles_json'] or '[]'),
                        'scenes': json.loads(s['scenes_json'] or '[]'),
                        'styles': json.loads(s['styles_json'] or '[]'),
                        'firstTurnDemo': json.loads(s['first_turn_demo_json'] or '{}'),
                        'customCss': s.get('custom_css') or '',
                        'customHtml': s.get('custom_html') or ''
                    }
                    self.send_json(res)
                else:
                    self.send_json({'error': 'Story deck not found'}, 404)
            else:
                # 返回全部剧本字典格式，无缝兼容前端调用
                c.execute('SELECT * FROM stories ORDER BY updated_at DESC')
                rows = c.fetchall()
                conn.close()
                result_map = {}
                for row in rows:
                    s = dict(row)
                    result_map[s['id']] = {
                        'id': s['id'],
                        'title': s['title'],
                        'badge': s['badge'],
                        'coverIcon': s['cover_icon'],
                        'coverTitle': s['cover_title'],
                        'coverSubtitle': s['cover_subtitle'],
                        'logo': s['logo'],
                        'themeColor': s['theme_color'],
                        'btnGradient': s['btn_gradient'],
                        'handbook': json.loads(s['handbook_json'] or '{}'),
                        'roles': json.loads(s['roles_json'] or '[]'),
                        'scenes': json.loads(s['scenes_json'] or '[]'),
                        'styles': json.loads(s['styles_json'] or '[]'),
                        'firstTurnDemo': json.loads(s['first_turn_demo_json'] or '{}'),
                        'customCss': s.get('custom_css') or '',
                        'customHtml': s.get('custom_html') or ''
                    }
                response_payload = {'stories': result_map}
                response_payload.update(result_map)
                self.send_json(response_payload)
            return

        # 5.1 获取广场精选推荐轮播大卡 GET /api/plaza/featured
        if self.path.startswith('/api/plaza/featured'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            keyword = params.get('keyword', [''])[0].strip().lower()

            conn = get_db()
            c = conn.cursor()
            if keyword:
                kw_pat = f"%{keyword}%"
                c.execute("""
                SELECT * FROM plaza_cards 
                WHERE is_featured = 1 AND (title LIKE ? OR desc LIKE ? OR author LIKE ? OR tags_json LIKE ?) 
                ORDER BY order_index ASC
                """, (kw_pat, kw_pat, kw_pat, kw_pat))
            else:
                c.execute("SELECT * FROM plaza_cards WHERE is_featured = 1 ORDER BY order_index ASC")
            rows = c.fetchall()
            conn.close()
            items = []
            for r in rows:
                item = dict(r)
                item['tags'] = json.loads(item.pop('tags_json') or '[]')
                item['deckKey'] = item.pop('deck_id')
                item['badgeColor'] = item.pop('badge_color')
                items.append(item)
            self.send_json(items)
            return

        # 5.2 获取广场分类标签列表 GET /api/plaza/categories
        if self.path == '/api/plaza/categories':
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM plaza_categories ORDER BY order_index ASC")
            rows = c.fetchall()
            conn.close()
            self.send_json([dict(r) for r in rows])
            return

        # 5.3 获取社区精选指南文章 GET /api/community/articles
        if self.path == '/api/community/articles':
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM community_articles ORDER BY order_index ASC")
            rows = c.fetchall()
            conn.close()
            self.send_json([dict(r) for r in rows])
            return

        # 5.4 获取系统通知与公告 GET /api/system/notices
        if self.path == '/api/system/notices':
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM system_notices WHERE is_active = 1")
            rows = c.fetchall()
            conn.close()
            self.send_json([dict(r) for r in rows])
            return

        # 5.5 获取探索广场真实分页数据 GET /api/plaza
        if self.path.startswith('/api/plaza'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)

            page = max(1, int(params.get('page', [1])[0]))
            size = max(1, int(params.get('size', params.get('limit', [10]))[0]))
            keyword = params.get('keyword', [''])[0].strip().lower()
            category = params.get('category', [''])[0].strip()

            conn = get_db()
            c = conn.cursor()

            conditions = []
            args = []
            if category and category not in ('全部', '推荐'):
                conditions.append("(category = ? OR tags_json LIKE ?)")
                args.extend([category, f"%{category}%"])

            if keyword:
                conditions.append("(title LIKE ? OR desc LIKE ? OR author LIKE ? OR tags_json LIKE ?)")
                kw_pat = f"%{keyword}%"
                args.extend([kw_pat, kw_pat, kw_pat, kw_pat])

            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

            c.execute(f"SELECT COUNT(*) FROM plaza_cards {where_clause}", args)
            total_count = c.fetchone()[0]

            total_pages = max(1, (total_count + size - 1) // size)
            if page > total_pages and total_count > 0:
                page = total_pages

            offset = (page - 1) * size
            c.execute(f"SELECT * FROM plaza_cards {where_clause} ORDER BY order_index ASC LIMIT ? OFFSET ?", args + [size, offset])
            rows = c.fetchall()
            conn.close()

            items = []
            for r in rows:
                item = dict(r)
                item['tags'] = json.loads(item.pop('tags_json') or '[]')
                item['deckKey'] = item.pop('deck_id')
                item['badgeColor'] = item.pop('badge_color')
                items.append(item)

            self.send_json({
                'total': total_count,
                'page': page,
                'size': size,
                'total_pages': total_pages,
                'category': category,
                'items': items
            })
            return

        super().do_GET()

    def do_DELETE(self):
        if self.path.startswith('/api/conversations'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            conv_id = params.get('id', [None])[0]
            if not conv_id:
                self.send_json({'error': 'Missing id'}, 400)
                return

            conn = get_db()
            c = conn.cursor()
            c.execute('DELETE FROM conversations WHERE id = ?', (conv_id,))
            conn.commit()
            conn.close()
            self.send_json({'success': True, 'id': conv_id})
            return

        self.send_response(405)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    init_db()
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), ProxyHandler) as httpd:
        print(f"Server successfully started on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
