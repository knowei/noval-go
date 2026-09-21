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
c.execute("SELECT id, title, badge, length(custom_css), length(custom_html) FROM stories WHERE id LIKE '%perfect%' OR id = 'eb85f366-919b-466e-a7ff-8d8dbc4ed29b'")
for row in c.fetchall():
    print('Story:', row)
c.execute("SELECT id, deck_id, title FROM plaza_cards WHERE id LIKE '%perfect%' OR id = 'eb85f366-919b-466e-a7ff-8d8dbc4ed29b'")
for row in c.fetchall():
    print('Plaza card:', row)
conn.close()
