import sqlite3
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

conn = sqlite3.connect('noval_data.db')
c = conn.cursor()

c.execute("SELECT id, deck_id, updated_at, history_json FROM conversations WHERE deck_id LIKE '%7a68d42a%' OR deck_id LIKE '%sister%' ORDER BY updated_at DESC LIMIT 3")
rows = c.fetchall()
print(f"Found {len(rows)} conversations")
for r in rows:
    conv_id, deck_id, updated_at, hist_str = r
    print(f"\nConv: {conv_id}, Updated: {updated_at}")
    try:
        hist = json.loads(hist_str)
        print(f"Turns count: {len(hist)}")
        for i, turn in enumerate(hist[-3:]):
            text = turn.get('rawText') or turn.get('story') or turn.get('text') or ''
            role = 'User' if turn.get('isUser') else 'AI'
            print(f"  [{role} Turn {i} len={len(text)}]:")
            print(f"    {text[:300]}...")
    except Exception as e:
        print("Error parsing json:", e)
