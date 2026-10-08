import sys
sys.path.insert(0, '.')
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
import db_engine, json

conn = db_engine.db.get_connection()
cur = conn.cursor()

ids = [
    ('deck_girls_dormitory', 'e59fe31f-98c7-4b85-9f84-262f5d13bc32'),
    ('deck_apocalypse_survival', '059217c9-213b-48e7-b660-0c04f78ede48'),
    ('deck_daughter_door_block', '2168197e-903b-4727-97e3-bf5f1d5b6c8f'),
    ('deck_rent_apartment', None),
    ('deck_5274d525', None),
    ('deck_idol_sister_debt', '3a67a4de-41a4-42ed-8187-af35365d6768')
]

for primary, secondary in ids:
    for cid in [primary, secondary]:
        if not cid:
            continue
        cur.execute("SELECT id, title, length(custom_html) as h_len, custom_html, handbook_json, roles_json, scenes_json FROM stories WHERE id = %s", (cid,))
        r = cur.fetchone()
        if r:
            html = r['custom_html'] or ''
            print(f"[{cid}] title: {r['title']} | HTML len: {len(html)}")
            if len(html) > 0:
                print(f"   HTML snippet: {html[:150].replace(chr(10), ' ')}")
