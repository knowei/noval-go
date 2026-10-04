import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine
import json
import re

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

conn = db_engine.db.get_connection()
c = conn.cursor()
c.execute("SELECT history_json FROM conversations WHERE id = 'conv_1790775888613'")
row = c.fetchone()
data = row.get('history_json') if isinstance(row, dict) else row[0]
turns = json.loads(data) if isinstance(data, str) else data

print(f"Total turns: {len(turns)}")
for i, t in enumerate(turns):
    role = 'User' if t.get('isUser') else 'AI'
    text = t.get('rawText') or t.get('story') or t.get('text') or ''
    print(f"\n==================== Turn {i} ({role}) len={len(text)} ====================")
    print(text)
