import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

conn = db_engine.db.get_connection()
cur = conn.cursor()

test_ids = [
    'e59fe31f-98c7-4b85-9f84-262f5d13bc32',
    '972540eb-b794-48ba-b70c-f02c3c2e6a15',
    '77dfcc94-a3d6-4bbc-b15a-f79cc13b9b3a',
    'cd3b5fb0-3359-4f6b-bcf3-29736893fbd7',
    '1a1938d1-1b23-4df6-b7c4-f7feab1490dc'
]

print('=== 数据库验证结果 (stories 剧本表) ===')
for sid in test_ids:
    cur.execute('SELECT id, title, badge, length(custom_html) as hlen, length(roles_json) as rlen FROM stories WHERE id = %s', (sid,))
    row = cur.fetchone()
    if row:
        print(f"[OK] Story: {row['title']} ({row['id']}) | badge: {row['badge']} | HTML: {row['hlen']} bytes")
    else:
        print(f"[MISSING] Story: {sid}")

print('\n=== 数据库验证结果 (plaza_cards 广场卡片表) ===')
for sid in test_ids:
    cur.execute('SELECT id, title, badge, author, rating, heat FROM plaza_cards WHERE id = %s OR deck_id = %s', (sid, sid))
    row = cur.fetchone()
    if row:
        print(f"[OK] Plaza: {row['title']} | {row['badge']} | rating: {row['rating']} | heat: {row['heat']}")
    else:
        print(f"[MISSING] Plaza: {sid}")
