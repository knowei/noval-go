import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

targets = [
    'eb85f366-919b-466e-a7ff-8d8dbc4ed29b',
    '2168197e-903b-4727-97e3-bf5f1d5b6c8f',
    '758e40b4-c1b3-4655-a83a-5ef136b60a2b',
    'deck_daughter_door_block',
    'deck_mother_sister_baby',
    'deck_perfect_girl_plan'
]

for target in targets:
    url = f'http://127.0.0.1:5174/api/stories?id={target}'
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            title = data.get('title')
            badge = data.get('badge')
            css_len = len(data.get('customCss') or '')
            html_len = len(data.get('customHtml') or '')
            roles_cnt = len(data.get('roles') or [])
            print(f"[OK] {target}: {title} | {badge} | CSS:{css_len}b | HTML:{html_len}b | Roles:{roles_cnt}")
    except Exception as e:
        print(f"[ERR] {target}: {e}")

print("\n--- PLAZA CHECK ---")
try:
    with urllib.request.urlopen('http://127.0.0.1:5174/api/plaza/featured', timeout=5) as resp:
        cards = json.loads(resp.read().decode('utf-8'))
        found_ids = set()
        for c in cards:
            cid = c.get('id')
            if cid in targets or cid == '4339eb70-6f5b-40f8-9f19-0da2d6acd6b7':
                found_ids.add(cid)
                print(f"[PLAZA FOUND] id={cid}, title={c.get('title')}, category={c.get('category')}")
        print(f"Total featured cards: {len(cards)}, Target cards in plaza: {len(found_ids)}")
except Exception as e:
    print(f"[ERR] Plaza check: {e}")
