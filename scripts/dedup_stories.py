import sys
sys.path.insert(0, '.')
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
import db_engine
from collections import defaultdict

conn = db_engine.db.get_connection()
cur = conn.cursor()

cur.execute("SELECT id FROM plaza_cards")
plaza_ids = set(r['id'] for r in cur.fetchall())

cur.execute("SELECT id, title, custom_html, lorebook_json, system_prompt FROM stories")
stories = cur.fetchall()

by_title = defaultdict(list)
for s in stories:
    by_title[s['title']].append(s)

to_keep = []
to_delete = []

for title, s_list in by_title.items():
    if len(s_list) == 1:
        to_keep.append(s_list[0]['id'])
    else:
        # Find which one is in plaza_ids
        in_plaza = [s for s in s_list if s['id'] in plaza_ids]
        if in_plaza:
            chosen = in_plaza[0]
        else:
            # Prefer the one with more content (lorebook, system_prompt, custom_html)
            chosen = max(s_list, key=lambda x: len(x['lorebook_json'] or '') + len(x['system_prompt'] or '') + len(x['custom_html'] or ''))
        
        to_keep.append(chosen['id'])
        for s in s_list:
            if s['id'] != chosen['id']:
                to_delete.append((s['id'], chosen['id'], title))

print(f"Total unique stories after dedup: {len(to_keep)}")
print(f"Total duplicates to delete: {len(to_delete)}")
print("\n--- Duplicate pairs (Delete ID -> Keep ID) ---")
for del_id, keep_id, title in to_delete[:15]:
    print(f"Delete: {del_id:38} | Keep: {keep_id:38} | Title: {title}")
