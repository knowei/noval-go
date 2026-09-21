import os
import sys
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

def escape_sql_str(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, datetime.datetime):
        return f"'{val.strftime('%Y-%m-%d %H:%M:%S')}'"
    val_str = str(val)
    val_str = val_str.replace("'", "''")
    return f"'{val_str}'"

def dump_all():
    conn = db_engine.db.get_connection()
    c = conn.cursor()

    sql_lines = []

    # Read schema.sql for DDL
    schema_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'schema.sql')
    if os.path.exists(schema_file):
        with open(schema_file, 'r', encoding='utf-8') as f:
            sql_lines.append(f.read())

    sql_lines.append('\n-- =============================================\n-- 数据填充 (Seed Data)\n-- =============================================\n')

    # 1. users
    c.execute('SELECT * FROM users')
    for u in c.fetchall():
        d = dict(u)
        cols = list(d.keys())
        col_str = ', '.join(cols)
        val_str = ', '.join([escape_sql_str(d[col]) for col in cols])
        sql_lines.append(f'INSERT INTO users ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

    # 2. stories
    c.execute('SELECT * FROM stories')
    for s in c.fetchall():
        d = dict(s)
        cols = list(d.keys())
        col_str = ', '.join(cols)
        val_str = ', '.join([escape_sql_str(d[col]) for col in cols])
        sql_lines.append(f'INSERT INTO stories ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

    # 3. plaza_cards
    c.execute('SELECT * FROM plaza_cards')
    for card in c.fetchall():
        d = dict(card)
        cols = list(d.keys())
        col_str = ', '.join([f'"{col}"' if col == 'desc' else col for col in cols])
        val_str = ', '.join([escape_sql_str(d[col]) for col in cols])
        sql_lines.append(f'INSERT INTO plaza_cards ({col_str}) VALUES ({val_str}) ON CONFLICT (title) DO NOTHING;')

    # 4. system_notices
    c.execute('SELECT * FROM system_notices')
    for n in c.fetchall():
        d = dict(n)
        cols = list(d.keys())
        col_str = ', '.join(cols)
        val_str = ', '.join([escape_sql_str(d[col]) for col in cols])
        sql_lines.append(f'INSERT INTO system_notices ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

    conn.close()

    init_sql_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'init_postgres.sql')
    with open(init_sql_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))

    print(f"[+] init_postgres.sql updated successfully from PostgreSQL! File size: {os.path.getsize(init_sql_path)} bytes")

if __name__ == '__main__':
    dump_all()
