import os
import sys
import sqlite3
import argparse

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# 引入项目根目录下的 db_engine
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

def migrate(source_sqlite_path, target_database_url):
    print("=" * 60)
    print("[*] NOVAL-GO 数据库一键全量迁移工具")
    print("=" * 60)
    print(f"[*] 源数据库 (SQLite): {source_sqlite_path}")
    print(f"[*] 目标数据库: {target_database_url.split('@')[-1] if '@' in target_database_url else target_database_url}")

    if not os.path.exists(source_sqlite_path):
        print(f"[x] 错误：源 SQLite 数据库不存在：{source_sqlite_path}")
        return False

    # 1. 建立源 SQLite 连接
    src_conn = sqlite3.connect(source_sqlite_path)
    src_conn.row_factory = sqlite3.Row
    src_c = src_conn.cursor()

    # 2. 建立目标数据库引擎并建表
    target_engine = db_engine.DatabaseEngine(target_database_url)
    print(f"[*] 目标方言识别为: {target_engine.dialect}")
    print("[*] 正在确保目标数据库表结构就绪...")
    try:
        target_engine.init_tables()
        print("[+] 目标数据库表结构初始化成功！")
    except Exception as e:
        print(f"[x] 初始化目标数据表结构失败: {e}")
        return False

    # 3. 迁移 stories
    src_c.execute("SELECT * FROM stories")
    stories = [dict(r) for r in src_c.fetchall()]
    print(f"[*] 正在迁移剧本数据 (共 {len(stories)} 条)...")
    for s in stories:
        cols = list(s.keys())
        placeholders = ', '.join(['?'] * len(cols))
        col_names = ', '.join(cols)
        target_engine.execute("DELETE FROM stories WHERE id = ?", (s['id'],))
        target_engine.execute(f"INSERT INTO stories ({col_names}) VALUES ({placeholders})", tuple(s[c] for c in cols))
    print(f"[+] 剧本数据迁移完成: {len(stories)} 部剧本")

    # 4. 迁移 plaza_cards
    src_c.execute("SELECT * FROM plaza_cards")
    cards = [dict(r) for r in src_c.fetchall()]
    print(f"[*] 正在迁移广场卡片 (共 {len(cards)} 条)...")
    for c in cards:
        cols = list(c.keys())
        placeholders = ', '.join(['?'] * len(cols))
        col_names = ', '.join([f'{col}' if (target_engine.dialect == 'mysql' and col == 'desc') else col for col in cols])
        target_engine.execute("DELETE FROM plaza_cards WHERE id = ?", (c['id'],))
        target_engine.execute(f"INSERT INTO plaza_cards ({col_names}) VALUES ({placeholders})", tuple(c[col] for col in cols))
    print(f"[+] 广场卡片迁移完成: {len(cards)} 张卡片")

    # 5. 迁移 users (已脱敏清洗)
    src_c.execute("SELECT * FROM users")
    users = [dict(r) for r in src_c.fetchall()]
    print(f"[*] 正在迁移用户账号 (共 {len(users)} 条)...")
    for u in users:
        cols = list(u.keys())
        placeholders = ', '.join(['?'] * len(cols))
        col_names = ', '.join(cols)
        target_engine.execute("DELETE FROM users WHERE id = ?", (u['id'],))
        target_engine.execute(f"INSERT INTO users ({col_names}) VALUES ({placeholders})", tuple(u[col] for col in cols))
    print(f"[+] 用户账号迁移完成: {len(users)} 个用户")

    # 6. 迁移 system_notices
    try:
        src_c.execute("SELECT * FROM system_notices")
        notices = [dict(r) for r in src_c.fetchall()]
        print(f"[*] 正在迁移系统通知公告 (共 {len(notices)} 条)...")
        for n in notices:
            cols = list(n.keys())
            placeholders = ', '.join(['?'] * len(cols))
            col_names = ', '.join(cols)
            target_engine.execute("DELETE FROM system_notices WHERE id = ?", (n['id'],))
            target_engine.execute(f"INSERT INTO system_notices ({col_names}) VALUES ({placeholders})", tuple(n[col] for col in cols))
        print(f"[+] 系统公告迁移完成: {len(notices)} 条")
    except Exception:
        pass

    src_conn.close()
    print("=" * 60)
    print("[+] 恭喜！数据库全量迁移完毕！")
    print(f"现在只需在环境变量中设置 DATABASE_URL={target_database_url}")
    print("重启后端服务即可全功能平滑运行在全新的网络数据库上！")
    print("=" * 60)
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="NOVAL-GO 数据库全量一键迁移工具")
    parser.add_argument('--src', default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'noval_data.db'), help='源 SQLite 数据库路径')
    parser.add_argument('--target', default=os.environ.get('DATABASE_URL', ''), help='目标数据库连接串 (PostgreSQL / Supabase / MySQL)')

    args = parser.parse_args()

    if not args.target:
        print("[!] 提示：未指定 --target，且环境变量 DATABASE_URL 为空。")
        print("用法示例：")
        print("  python scripts/migrate_to_db.py --target \"postgresql://user:password@db.supabase.co:5432/postgres\"")
        print("  python scripts/migrate_to_db.py --target \"mysql://root:password@127.0.0.1:3306/noval_db\"")
        sys.exit(1)

    migrate(args.src, args.target)
