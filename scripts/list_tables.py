import sqlite3

conn = sqlite3.connect('noval_data.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = c.fetchall()

print("=" * 60)
print(f"{'TABLE NAME':25} | {'ROW COUNT':10} | {'COLUMNS'}")
print("=" * 60)

for row in tables:
    tname = row[0]
    if tname.startswith('sqlite_'):
        continue
    c.execute(f'SELECT count(*) FROM "{tname}"')
    cnt = c.fetchone()[0]
    c.execute(f'PRAGMA table_info("{tname}")')
    cols = [col[1] for col in c.fetchall()]
    print(f"{tname:25} | {cnt:<10} | {', '.join(cols[:5])}...")
