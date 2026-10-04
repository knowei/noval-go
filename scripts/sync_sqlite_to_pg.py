import sys
import sqlite3
import json
sys.path.insert(0, '.')
from db_engine import db

print("Target DB Dialect:", db.dialect)
pg_conn = db.get_connection()
pg_cur = pg_conn.cursor()

sq_conn = sqlite3.connect('noval_data.db')
sq_conn.row_factory = sqlite3.Row
sq_cur = sq_conn.cursor()

# 1. Sync stories
sq_cur.execute("SELECT * FROM stories")
sq_stories = sq_cur.fetchall()
for s in sq_stories:
    s_dict = dict(s)
    sid = s_dict['id']
    pg_cur.execute("SELECT id FROM stories WHERE id = %s", (sid,))
    if not pg_cur.fetchone():
        print(f"Syncing missing story to Postgres: {sid} - {ascii(s_dict.get('title'))}")
        cols = list(s_dict.keys())
        vals = [s_dict[k] for k in cols]
        placeholders = ", ".join(["%s"] * len(cols))
        col_names = ", ".join(cols)
        query = f"INSERT INTO stories ({col_names}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING"
        pg_cur.execute(query, tuple(vals))

# 2. Sync plaza_cards
sq_cur.execute("SELECT * FROM plaza_cards")
sq_cards = sq_cur.fetchall()
for c in sq_cards:
    c_dict = dict(c)
    cid = c_dict['id']
    try:
        cols = list(c_dict.keys())
        vals = [c_dict[k] for k in cols]
        placeholders = ", ".join(["%s"] * len(cols))
        col_names = ", ".join([f'"{k}"' for k in cols])
        query = f'INSERT INTO plaza_cards ({col_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'
        pg_cur.execute(query, tuple(vals))
    except Exception as e:
        pass

# 3. Sync conversations
sq_cur.execute("SELECT * FROM conversations")
sq_convs = sq_cur.fetchall()
for conv in sq_convs:
    c_dict = dict(conv)
    cid = c_dict['id']
    try:
        cols = list(c_dict.keys())
        vals = [c_dict[k] for k in cols]
        placeholders = ", ".join(["%s"] * len(cols))
        col_names = ", ".join([f'"{k}"' for k in cols])
        query = f'INSERT INTO conversations ({col_names}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING'
        pg_cur.execute(query, tuple(vals))
    except Exception as e:
        print("Conv sync err:", e)

print("\nSync completed successfully!")
pg_cur.execute("SELECT count(*) FROM conversations")
print("Total conversations in Postgres now:", pg_cur.fetchone())
