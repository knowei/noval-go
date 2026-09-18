import os
import sys
import json
import re
import urllib.parse
from datetime import datetime

# =============================================================================
# NOVAL-GO 统一多数据库驱动引擎 (PostgreSQL / Supabase / MySQL / SQLite)
# =============================================================================

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
                import pg8000.native
                conn = pg8000.native.Connection(
                    user=self._parsed_config['user'],
                    password=self._parsed_config['password'],
                    host=self._parsed_config['host'],
                    port=self._parsed_config['port'],
                    database=self._parsed_config['database'],
                    ssl_context=True if ('supabase.co' in self._parsed_config['host'] or 'neon.tech' in self._parsed_config['host']) else None
                )
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
                # PostgreSQL / MySQL 标准 DDL
                cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(64) PRIMARY KEY,
                    username VARCHAR(64) UNIQUE NOT NULL,
                    password_hash VARCHAR(128) NOT NULL,
                    nickname VARCHAR(128) DEFAULT '风月旅行者',
                    avatar VARCHAR(64) DEFAULT '🎭',
                    points INTEGER DEFAULT 9999,
                    model_config_json TEXT,
                    auth_token VARCHAR(128) DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                cur.execute('''
                CREATE TABLE IF NOT EXISTS conversations (
                    id VARCHAR(64) PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    deck_id VARCHAR(64) NOT NULL,
                    deck_title VARCHAR(255) DEFAULT '',
                    title VARCHAR(255) DEFAULT '新场景存档',
                    history_json TEXT,
                    turn_count INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                cur.execute('''
                CREATE TABLE IF NOT EXISTS stories (
                    id VARCHAR(64) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    badge VARCHAR(64) DEFAULT '经典必玩',
                    cover_icon VARCHAR(64) DEFAULT '📖',
                    cover_title VARCHAR(255),
                    cover_subtitle TEXT,
                    logo VARCHAR(64) DEFAULT '📖',
                    theme_color VARCHAR(32) DEFAULT 'rose',
                    btn_gradient VARCHAR(128) DEFAULT 'from-rose-600 to-pink-600',
                    handbook_json TEXT,
                    roles_json TEXT,
                    scenes_json TEXT,
                    styles_json TEXT,
                    first_turn_demo_json TEXT,
                    custom_css TEXT,
                    custom_html TEXT,
                    category VARCHAR(64) DEFAULT '都市',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                desc_col = "`desc` TEXT" if self.dialect == "mysql" else '"desc" TEXT'
                cur.execute(f'''
                CREATE TABLE IF NOT EXISTS plaza_cards (
                    id VARCHAR(64) PRIMARY KEY,
                    deck_id VARCHAR(64),
                    title VARCHAR(255) UNIQUE NOT NULL,
                    badge VARCHAR(64) DEFAULT '探索精选',
                    badge_color VARCHAR(64) DEFAULT 'rose',
                    author VARCHAR(128) DEFAULT '风月剧作组',
                    {desc_col},
                    rating VARCHAR(16) DEFAULT '5.0',
                    tags_json TEXT,
                    heat VARCHAR(32) DEFAULT '9.9w',
                    order_index INTEGER DEFAULT 0,
                    cover_image TEXT,
                    image_tag VARCHAR(64) DEFAULT '',
                    badge_type VARCHAR(32) DEFAULT 'fire',
                    is_featured INTEGER DEFAULT 0,
                    category VARCHAR(64) DEFAULT '都市',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                ''')
                cur.execute('''
                CREATE TABLE IF NOT EXISTS system_notices (
                    id VARCHAR(64) PRIMARY KEY,
                    notice_type VARCHAR(32) DEFAULT 'announcement',
                    title VARCHAR(255) NOT NULL,
                    content TEXT,
                    countdown_seconds INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1
                )
                ''')

            if hasattr(conn, 'commit'):
                conn.commit()
        finally:
            if hasattr(conn, 'close'):
                conn.close()


class Pg8000Cursor:
    def __init__(self, conn):
        self.conn = conn
        self._last_result = []
        self._idx = 0
        self._cols = []

    def execute(self, sql, params=()):
        sql_converted = sql.replace('?', '%s')
        if 'INSERT OR REPLACE' in sql_converted:
            # PostgreSQL does not have INSERT OR REPLACE; handle gracefully
            sql_converted = sql_converted.replace('INSERT OR REPLACE INTO', 'INSERT INTO')
        parts = sql_converted.split('%s')
        if len(parts) > 1:
            sql_converted = ''.join(p + (f"${i+1}" if i < len(parts)-1 else '') for i, p in enumerate(parts))
        
        param_list = list(params) if params else []
        try:
            res = self.conn.run(sql_converted, *param_list)
            self._last_result = res if res else []
            self._idx = 0
            if hasattr(self.conn, 'columns'):
                self._cols = [c['name'] for c in self.conn.columns]
            else:
                self._cols = []
        except Exception as e:
            raise e

    def fetchone(self):
        if self._idx < len(self._last_result):
            row = self._last_result[self._idx]
            self._idx += 1
            if self._cols and isinstance(row, (list, tuple)):
                return dict(zip(self._cols, row))
            if isinstance(row, dict):
                return row
            return row
        return None

    def fetchall(self):
        rows = []
        while True:
            r = self.fetchone()
            if r is None:
                break
            rows.append(r)
        return rows

    def close(self):
        pass


class Pg8000Adapter:
    def __init__(self, conn):
        self.conn = conn

    def cursor(self):
        return Pg8000Cursor(self.conn)

    def commit(self):
        pass

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass


class Psycopg2CursorWrapper:
    def __init__(self, cursor):
        self._cur = cursor

    def execute(self, sql, params=None):
        sql_conv = sql.replace('?', '%s')
        if 'INSERT OR REPLACE' in sql_conv:
            sql_conv = sql_conv.replace('INSERT OR REPLACE INTO', 'INSERT INTO')
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

    def commit(self):
        self.conn.commit()

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass


class MysqlCursorWrapper:
    def __init__(self, cursor):
        self._cur = cursor

    def execute(self, sql, params=None):
        sql_conv = sql.replace('?', '%s')
        if 'INSERT OR REPLACE' in sql_conv:
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

    def commit(self):
        self.conn.commit()

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass


# 全局单例引擎实例
db = DatabaseEngine()
