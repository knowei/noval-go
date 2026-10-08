import sys
sys.path.insert(0, '.')
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
import db_engine

conn = db_engine.db.get_connection()
cur = conn.cursor()
cur.execute("SELECT id, deck_id, title FROM plaza_cards")
rows = cur.fetchall()
print(f"Total plaza cards: {len(rows)}")
diff_count = 0
for r in rows:
    if r['deck_id'] and r['deck_id'] != r['id']:
        diff_count += 1
        print(f"diff: id={r['id']} vs deck_id={r['deck_id']} for title={r['title']}")
print(f"Total diffs: {diff_count}")
