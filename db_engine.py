import os
import sys
import json
import re
import urllib.parse
from datetime import datetime

# =============================================================================
# NOVAL-GO 统一多数据库驱动引擎 (PostgreSQL / Supabase / MySQL / SQLite)
# =============================================================================

def _load_env_file():
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_file):
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip("'").strip('"')
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

_load_env_file()

DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
NOVAL_DB_PATH = os.environ.get('NOVAL_DB_PATH') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'noval_data.db')

class DatabaseEngine:
    def __init__(self, url=None):
        self.raw_url = url or DATABASE_URL
        self.dialect = 'sqlite'
        self._pool = None
        self._sqlite_path = None
        self._parsed_config = {}

        self._parse_url()

    def _parse_url(self):
        if not self.raw_url:
            self.dialect = 'sqlite'
            self._sqlite_path = NOVAL_DB_PATH
            return

        url = self.raw_url
        if url.startswith('postgres://') or url.startswith('postgresql://'):
            self.dialect = 'postgres'
            # 兼容云服务商 (如 Heroku/Supabase) 的 postgres:// 前缀
            parsed = urllib.parse.urlparse(url)
            self._parsed_config = {
                'user': parsed.username or 'postgres',
                'password': urllib.parse.unquote(parsed.password or ''),
                'host': parsed.hostname or 'localhost',
                'port': parsed.port or 5432,
                'database': parsed.path.lstrip('/') or 'postgres'
            }
        elif url.startswith('mysql://'):
            self.dialect = 'mysql'
            parsed = urllib.parse.urlparse(url)
            self._parsed_config = {
                'user': parsed.username or 'root',
                'password': urllib.parse.unquote(parsed.password or ''),
                'host': parsed.hostname or 'localhost',
                'port': parsed.port or 3306,
                'database': parsed.path.lstrip('/') or 'noval_db',
                'charset': 'utf8mb4'
            }
        elif url.startswith('sqlite://'):
            self.dialect = 'sqlite'
            path = url[len('sqlite://'):]
            if path.startswith('/'):
                self._sqlite_path = path
            else:
                self._sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)
        else:
            # 默认为本地 SQLite 文件路径
            self.dialect = 'sqlite'
            self._sqlite_path = url

    def get_connection(self):
        if self.dialect == 'sqlite':
            import sqlite3
            os.makedirs(os.path.dirname(os.path.abspath(self._sqlite_path)), exist_ok=True)
            conn = sqlite3.connect(self._sqlite_path, timeout=30.0)
            conn.row_factory = sqlite3.Row
            try:
                conn.execute('PRAGMA journal_mode=WAL;')
                conn.execute('PRAGMA synchronous=NORMAL;')
                conn.execute('PRAGMA busy_timeout=5000;')
            except Exception:
                pass
            return conn

        elif self.dialect == 'postgres':
            # 优先尝试导入 pg8000 (纯Python无编译依赖)，其次尝试 psycopg2
            try:
                import pg8000.dbapi
                conn = pg8000.dbapi.connect(
                    user=self._parsed_config['user'],
                    password=self._parsed_config['password'],
                    host=self._parsed_config['host'],
                    port=self._parsed_config['port'],
                    database=self._parsed_config['database'],
                    ssl_context=True if ('supabase.co' in self._parsed_config['host'] or 'neon.tech' in self._parsed_config['host']) else None
                )
                conn.autocommit = True
                return Pg8000Adapter(conn)
            except ImportError:
                try:
                    import psycopg2
                    import psycopg2.extras
                    conn = psycopg2.connect(
                        user=self._parsed_config['user'],
                        password=self._parsed_config['password'],
                        host=self._parsed_config['host'],
                        port=self._parsed_config['port'],
                        dbname=self._parsed_config['database']
                    )
                    return Psycopg2Adapter(conn)
                except ImportError:
                    raise ImportError('检测到配置了 PostgreSQL 数据库，但未安装连接驱动。请运行：pip install pg8000 或 pip install psycopg2-binary')

        elif self.dialect == 'mysql':
            try:
                import pymysql
                import pymysql.cursors
                conn = pymysql.connect(
                    user=self._parsed_config['user'],
                    password=self._parsed_config['password'],
                    host=self._parsed_config['host'],
                    port=self._parsed_config['port'],
                    database=self._parsed_config['database'],
                    charset='utf8mb4',
                    cursorclass=pymysql.cursors.DictCursor,
                    autocommit=True
                )
                return MysqlAdapter(conn)
            except ImportError:
                raise ImportError('检测到配置了 MySQL 数据库，但未安装连接驱动。请运行：pip install pymysql cryptography')

    def execute(self, sql, params=None):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            adapted_sql, adapted_params = self._adapt_sql(sql, params)
            cur.execute(adapted_sql, adapted_params or ())
            if hasattr(conn, 'commit'):
                conn.commit()
            return cur
        finally:
            if hasattr(conn, 'close'):
                conn.close()

    def fetchone(self, sql, params=None):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            adapted_sql, adapted_params = self._adapt_sql(sql, params)
            cur.execute(adapted_sql, adapted_params or ())
            row = cur.fetchone()
            if row is None:
                return None
            return dict(row)
        finally:
            if hasattr(conn, 'close'):
                conn.close()

    def fetchall(self, sql, params=None):
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            adapted_sql, adapted_params = self._adapt_sql(sql, params)
            cur.execute(adapted_sql, adapted_params or ())
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        finally:
            if hasattr(conn, 'close'):
                conn.close()

    def _adapt_sql(self, sql, params):
        if self.dialect in ('postgres', 'mysql'):
            # 将 SQLite 风格的 '?' 占位符转换为 '%s'
            adapted_sql = sql.replace('?', '%s')
            return adapted_sql, params
        return sql, params

    def init_tables(self):
        """自动在当前配置的数据库中初始化全部 5 张核心业务表"""
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            if self.dialect == 'sqlite':
                # 1. users
                cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE,
                    password_hash TEXT DEFAULT '',
                    nickname TEXT,
                    avatar TEXT,
                    points INTEGER DEFAULT 9999,
                    model_config_json TEXT DEFAULT '',
                    auth_token TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
                )
                ''')
                # 2. conversations
                cur.execute('''
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
                ''')
                # 3. stories
                cur.execute('''
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
                    custom_css TEXT DEFAULT '',
                    custom_html TEXT DEFAULT '',
                    category TEXT DEFAULT '都市',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                # 4. plaza_cards
                cur.execute('''
                CREATE TABLE IF NOT EXISTS plaza_cards (
                    id TEXT PRIMARY KEY,
                    deck_id TEXT,
                    title TEXT UNIQUE,
                    badge TEXT,
                    badge_color TEXT,
                    author TEXT,
                    desc TEXT,
                    rating TEXT DEFAULT '5.0',
                    tags_json TEXT,
                    heat TEXT,
                    order_index INTEGER DEFAULT 0,
                    cover_image TEXT DEFAULT '',
                    image_tag TEXT DEFAULT '',
                    badge_type TEXT DEFAULT 'fire',
                    is_featured INTEGER DEFAULT 0,
                    category TEXT DEFAULT '都市',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                # 5. system_notices
                cur.execute('''
                CREATE TABLE IF NOT EXISTS system_notices (
                    id TEXT PRIMARY KEY,
                    notice_type TEXT,
                    title TEXT NOT NULL,
                    content TEXT,
                    countdown_seconds INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1
                )
                ''')
            else:
                # PostgreSQL 自动将旧版遗留 VARCHAR 字段无损扩容为 TEXT
                if self.dialect == 'postgres':
                    alter_stmts = [
                        'ALTER TABLE IF EXISTS users ALTER COLUMN id TYPE TEXT',
                        'ALTER TABLE IF EXISTS users ALTER COLUMN username TYPE TEXT',
                        'ALTER TABLE IF EXISTS users ALTER COLUMN password_hash TYPE TEXT',
                        'ALTER TABLE IF EXISTS users ALTER COLUMN nickname TYPE TEXT',
                        'ALTER TABLE IF EXISTS users ALTER COLUMN avatar TYPE TEXT',
                        'ALTER TABLE IF EXISTS users ALTER COLUMN auth_token TYPE TEXT',
                        'ALTER TABLE IF EXISTS conversations ALTER COLUMN id TYPE TEXT',
                        'ALTER TABLE IF EXISTS conversations ALTER COLUMN user_id TYPE TEXT',
                        'ALTER TABLE IF EXISTS conversations ALTER COLUMN deck_id TYPE TEXT',
                        'ALTER TABLE IF EXISTS conversations ALTER COLUMN deck_title TYPE TEXT',
                        'ALTER TABLE IF EXISTS conversations ALTER COLUMN title TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN id TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN title TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN badge TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN cover_icon TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN cover_title TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN logo TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN theme_color TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN btn_gradient TYPE TEXT',
                        'ALTER TABLE IF EXISTS stories ALTER COLUMN category TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN id TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN deck_id TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN title TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN badge TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN badge_color TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN author TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN rating TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN heat TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN image_tag TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN badge_type TYPE TEXT',
                        'ALTER TABLE IF EXISTS plaza_cards ALTER COLUMN category TYPE TEXT',
                        'ALTER TABLE IF EXISTS system_notices ALTER COLUMN id TYPE TEXT',
                        'ALTER TABLE IF EXISTS system_notices ALTER COLUMN notice_type TYPE TEXT',
                        'ALTER TABLE IF EXISTS system_notices ALTER COLUMN title TYPE TEXT'
                    ]
                    for s in alter_stmts:
                        try:
                            cur.execute(s)
                        except Exception:
                            pass

                # PostgreSQL / MySQL 标准 DDL
                cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    nickname TEXT DEFAULT '风月旅行者',
                    avatar TEXT DEFAULT '🎭',
                    points INTEGER DEFAULT 9999,
                    model_config_json TEXT,
                    auth_token TEXT DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                cur.execute('''
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    deck_id TEXT NOT NULL,
                    deck_title TEXT DEFAULT '',
                    title TEXT DEFAULT '新场景存档',
                    history_json TEXT,
                    turn_count INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                cur.execute('''
                CREATE TABLE IF NOT EXISTS stories (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    badge TEXT DEFAULT '经典必玩',
                    cover_icon TEXT DEFAULT '📖',
                    cover_title TEXT,
                    cover_subtitle TEXT,
                    logo TEXT DEFAULT '📖',
                    theme_color TEXT DEFAULT 'rose',
                    btn_gradient TEXT DEFAULT 'from-rose-600 to-pink-600',
                    handbook_json TEXT,
                    roles_json TEXT,
                    scenes_json TEXT,
                    styles_json TEXT,
                    first_turn_demo_json TEXT,
                    custom_css TEXT DEFAULT '',
                    custom_html TEXT DEFAULT '',
                    category TEXT DEFAULT '都市',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                desc_col = "`desc` TEXT" if self.dialect == "mysql" else '"desc" TEXT'
                cur.execute(f'''
                CREATE TABLE IF NOT EXISTS plaza_cards (
                    id TEXT PRIMARY KEY,
                    deck_id TEXT,
                    title TEXT UNIQUE NOT NULL,
                    badge TEXT DEFAULT '探索精选',
                    badge_color TEXT DEFAULT 'rose',
                    author TEXT DEFAULT '风月剧作组',
                    {desc_col},
                    rating TEXT DEFAULT '5.0',
                    tags_json TEXT,
                    heat TEXT DEFAULT '9.9w',
                    order_index INTEGER DEFAULT 0,
                    cover_image TEXT,
                    image_tag TEXT DEFAULT '',
                    badge_type TEXT DEFAULT 'fire',
                    is_featured INTEGER DEFAULT 0,
                    category TEXT DEFAULT '都市',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                cur.execute('''
                CREATE TABLE IF NOT EXISTS system_notices (
                    id TEXT PRIMARY KEY,
                    notice_type TEXT DEFAULT 'announcement',
                    title TEXT NOT NULL,
                    content TEXT,
                    countdown_seconds INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1
                )
                ''')

                if self.dialect == 'postgres':
                    cur.execute('''
                    INSERT INTO users (id, username, password_hash, nickname, avatar, points)
                    VALUES ('default_user', 'player', '', '风月旅行者', '🎭', 9999)
                    ON CONFLICT (id) DO NOTHING
                    ''')
                elif self.dialect == 'mysql':
                    cur.execute('''
                    INSERT IGNORE INTO users (id, username, password_hash, nickname, avatar, points)
                    VALUES ('default_user', 'player', '', '风月旅行者', '🎭', 9999)
                    ''')

            if hasattr(conn, 'commit'):
                conn.commit()
        finally:
            if hasattr(conn, 'close'):
                conn.close()


class DictRow(dict):
    def __init__(self, cols, values):
        super().__init__(zip(cols, values))
        self._values = list(values)

    def __getitem__(self, item):
        if isinstance(item, int):
            return self._values[item]
        return super().__getitem__(item)


class Pg8000CursorWrapper:
    def __init__(self, cursor):
        self._cur = cursor

    def execute(self, sql, params=None):
        sql_conv = sql.replace('?', '%s')
        if 'INSERT OR IGNORE INTO' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR IGNORE INTO', 'INSERT INTO')
            if 'ON CONFLICT' not in sql_conv:
                sql_conv = sql_conv.rstrip().rstrip(';') + ' ON CONFLICT DO NOTHING'
        elif 'INSERT OR REPLACE INTO' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR REPLACE INTO', 'INSERT INTO')
            if 'ON CONFLICT' not in sql_conv:
                sql_conv = sql_conv.rstrip().rstrip(';') + ' ON CONFLICT (id) DO NOTHING'
        return self._cur.execute(sql_conv, params or ())

    def fetchone(self):
        row = self._cur.fetchone()
        if row is None:
            return None
        if self._cur.description:
            cols = [d[0] for d in self._cur.description]
            return DictRow(cols, row)
        return row

    def fetchall(self):
        rows = self._cur.fetchall()
        if not rows:
            return []
        if self._cur.description:
            cols = [d[0] for d in self._cur.description]
            return [DictRow(cols, r) for r in rows]
        return rows

    def close(self):
        return self._cur.close()

    def __getattr__(self, name):
        return getattr(self._cur, name)


class Pg8000Adapter:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        return Pg8000CursorWrapper(self.conn.cursor())

    def execute(self, sql, params=None):
        cur = self.cursor()
        cur.execute(sql, params or ())
        return cur

    def commit(self):
        try:
            self.conn.commit()
        except Exception:
            pass

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.commit()
        return False


class Psycopg2CursorWrapper:
    def __init__(self, cursor):
        self._cur = cursor

    def execute(self, sql, params=None):
        sql_conv = sql.replace('?', '%s')
        if 'INSERT OR IGNORE INTO' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR IGNORE INTO', 'INSERT INTO')
            if 'ON CONFLICT' not in sql_conv:
                sql_conv = sql_conv.rstrip().rstrip(';') + ' ON CONFLICT DO NOTHING'
        elif 'INSERT OR REPLACE' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR REPLACE INTO', 'INSERT INTO')
            if 'ON CONFLICT' not in sql_conv:
                sql_conv = sql_conv.rstrip().rstrip(';') + ' ON CONFLICT (id) DO NOTHING'
        return self._cur.execute(sql_conv, params)

    def fetchone(self):
        row = self._cur.fetchone()
        return dict(row) if row else None

    def fetchall(self):
        rows = self._cur.fetchall()
        return [dict(r) for r in rows] if rows else []

    def close(self):
        return self._cur.close()

    def __getattr__(self, name):
        return getattr(self._cur, name)


class Psycopg2Adapter:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        import psycopg2.extras
        return Psycopg2CursorWrapper(self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor))

    def execute(self, sql, params=None):
        cur = self.cursor()
        cur.execute(sql, params or ())
        return cur

    def commit(self):
        self.conn.commit()

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.commit()
        return False


class MysqlCursorWrapper:
    def __init__(self, cursor):
        self._cur = cursor

    def execute(self, sql, params=None):
        sql_conv = sql.replace('?', '%s')
        if 'INSERT OR IGNORE INTO' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR IGNORE INTO', 'INSERT IGNORE INTO')
        elif 'INSERT OR REPLACE' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR REPLACE', 'REPLACE')
        return self._cur.execute(sql_conv, params)

    def fetchone(self):
        return self._cur.fetchone()

    def fetchall(self):
        return self._cur.fetchall()

    def close(self):
        return self._cur.close()

    def __getattr__(self, name):
        return getattr(self._cur, name)


class MysqlAdapter:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        return MysqlCursorWrapper(self.conn.cursor())

    def execute(self, sql, params=None):
        cur = self.cursor()
        cur.execute(sql, params or ())
        return cur

    def commit(self):
        self.conn.commit()

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.commit()
        return False


# 全局单例引擎实例
db = DatabaseEngine()
