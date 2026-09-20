import sqlite3
import os

conn = sqlite3.connect('noval_data.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

def escape_sql_str(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    val_str = str(val)
    val_str = val_str.replace("'", "''")
    return f"'{val_str}'"

sql_lines = []

# DDL
if os.path.exists('schema.sql'):
    with open('schema.sql', 'r', encoding='utf-8') as f:
        sql_lines.append(f.read())

sql_lines.append('\n-- =============================================\n-- 数据填充 (Seed Data)\n-- =============================================\n')

# 1. users
c.execute('SELECT * FROM users')
users = c.fetchall()
for u in users:
    cols = u.keys()
    col_str = ', '.join(cols)
    val_str = ', '.join([escape_sql_str(u[col]) for col in cols])
    sql_lines.append(f'INSERT INTO users ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

# 2. stories
c.execute('SELECT * FROM stories')
stories = c.fetchall()
for s in stories:
    cols = s.keys()
    col_str = ', '.join(cols)
    val_str = ', '.join([escape_sql_str(s[col]) for col in cols])
    sql_lines.append(f'INSERT INTO stories ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

# 3. plaza_cards
c.execute('SELECT * FROM plaza_cards')
cards = c.fetchall()
for card in cards:
    cols = card.keys()
    col_str = ', '.join([f'"{col}"' if col == 'desc' else col for col in cols])
    val_str = ', '.join([escape_sql_str(card[col]) for col in cols])
    sql_lines.append(f'INSERT INTO plaza_cards ({col_str}) VALUES ({val_str}) ON CONFLICT (title) DO NOTHING;')

# 4. system_notices
c.execute('SELECT * FROM system_notices')
notices = c.fetchall()
for n in notices:
    cols = n.keys()
    col_str = ', '.join(cols)
    val_str = ', '.join([escape_sql_str(n[col]) for col in cols])
    sql_lines.append(f'INSERT INTO system_notices ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

# 5. conversations
c.execute('SELECT * FROM conversations')
convs = c.fetchall()
for cv in convs:
    cols = cv.keys()
    col_str = ', '.join(cols)
    val_str = ', '.join([escape_sql_str(cv[col]) for col in cols])
    sql_lines.append(f'INSERT INTO conversations ({col_str}) VALUES ({val_str}) ON CONFLICT (id) DO NOTHING;')

with open('init_postgres.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f'init_postgres.sql generated successfully! Total statements: {len(sql_lines)}')
