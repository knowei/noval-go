import sys
sys.path.insert(0, '.')
from db_engine import db

conn = db.get_connection()
c = conn.cursor()

print("DB Dialect:", db.dialect)
c.execute("SELECT count(*) FROM conversations")
print("Total conversations:", c.fetchone())

c.execute("SELECT id, user_id, deck_id, deck_title, title, turn_count FROM conversations")
rows = c.fetchall()
print(f"Total rows fetched: {len(rows)}")

print("\n--- Rows with 出差 ---")
for r in rows:
    # r can be dict or Row
    d_title = r.get('deck_title') if isinstance(r, dict) else r['deck_title']
    title = r.get('title') if isinstance(r, dict) else r['title']
    uid = r.get('user_id') if isinstance(r, dict) else r['user_id']
    cid = r.get('id') if isinstance(r, dict) else r['id']
    did = r.get('deck_id') if isinstance(r, dict) else r['deck_id']
    tc = r.get('turn_count') if isinstance(r, dict) else r['turn_count']
    if '出差' in (d_title or '') or '出差' in (title or ''):
        print(cid, uid, did, ascii(d_title or ''), ascii(title or ''), tc)

print("\n--- All conversations for knowei / user_efd31e971fe5 ---")
for r in rows:
    uid = r.get('user_id') if isinstance(r, dict) else r['user_id']
    d_title = r.get('deck_title') if isinstance(r, dict) else r['deck_title']
    title = r.get('title') if isinstance(r, dict) else r['title']
    cid = r.get('id') if isinstance(r, dict) else r['id']
    did = r.get('deck_id') if isinstance(r, dict) else r['deck_id']
    tc = r.get('turn_count') if isinstance(r, dict) else r['turn_count']
    if uid == 'user_efd31e971fe5' or 'knowei' in (uid or ''):
        print(cid, uid, did, ascii(d_title or ''), ascii(title or ''), tc)

print("\n--- All users in this DB ---")
c.execute("SELECT id, username, nickname FROM users")
for u in c.fetchall():
    print(u)
