import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine
import json

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

conn = db_engine.db.get_connection()
c = conn.cursor()
c.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stories'")
for col in c.fetchall():
    print("Col:", col)

c.execute("SELECT * FROM stories WHERE id LIKE '%7a68d42a%' OR id LIKE '%sister_debt%' LIMIT 1")
row = c.fetchone()
if row:
    print("\nFound row keys:", list(row.keys()) if isinstance(row, dict) else len(row))
    if isinstance(row, dict):
        for k, v in row.items():
            s = str(v)
            print(f"  {k}: len={len(s)}, preview={s[:100]}")
