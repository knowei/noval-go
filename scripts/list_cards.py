import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

conn = db_engine.db.get_connection()
c = conn.cursor()
c.execute('SELECT id, title, category FROM plaza_cards')
print("=== PLAZA CARDS ===")
for row in c.fetchall():
    d = dict(row)
    print(f"{d['id']} | {d['category']} | {d['title']}")

c.execute('SELECT id, title, category FROM stories')
print("\n=== STORIES ===")
for row in c.fetchall():
    d = dict(row)
    print(f"{d['id']} | {d['category']} | {d['title']}")

conn.close()
