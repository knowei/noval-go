import sys
import sqlite3
import json
sys.path.insert(0, '.')
from db_engine import db

print("Syncing PG -> SQLite...")
pg_conn = db.get_connection()
pg_cur = pg_conn.cursor()

sq_conn = sqlite3.connect('noval_data.db')
sq_conn.row_factory = sqlite3.Row
sq_cur = sq_conn.cursor()

pg_cur.execute("SELECT id, user_id, deck_id, deck_title, title, history_json, turn_count, created_at, updated_at FROM conversations")
pg_convs = pg_cur.fetchall()
for conv in pg_convs:
    c_dict = dict(conv)
    cid = c_dict['id']
    sq_cur.execute("SELECT id FROM conversations WHERE id = ?", (cid,))
    if not sq_cur.fetchone():
        cols = list(c_dict.keys())
        vals = [c_dict[k] for k in cols]
        placeholders = ", ".join(["?"] * len(cols))
        col_names = ", ".join(cols)
        query = f"INSERT INTO conversations ({col_names}) VALUES ({placeholders})"
        sq_cur.execute(query, tuple(vals))

sq_conn.commit()
sq_cur.execute("SELECT count(*) FROM conversations")
print("Total conversations in SQLite now:", sq_cur.fetchone()[0])
