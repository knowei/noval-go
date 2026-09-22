import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

test_ids = [
    ('64da8e90-9404-4a55-ae80-fe40c3a28299', 'deck_pure_love_childhood_friend'),
    ('d0c2b806-5a8a-42fd-bdeb-a69fa72cbbf6', 'deck_ice_school_flower'),
    ('b0c6d63f-4185-46a5-bbe8-9d0ef7fc974a', 'deck_azgar_magic_continent'),
    ('75376129-e9a1-461b-9671-0e944e969b8e', 'deck_jiuxiao_xiuxian'),
    ('82e261bc-2d95-4c41-8913-e0cf2756fc04', 'deck_infinity_lord_god')
]

for uuid, alias in test_ids:
    for target in [uuid, alias]:
        url = f'http://127.0.0.1:5174/api/stories?id={target}'
        print(f"Testing {url}...")
        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                print(f"[+] Story OK: {target} -> {data.get('title')} (Badge: {data.get('badge')})")
        except urllib.error.HTTPError as e:
            print(f"[-] Story 404: {target}")

with urllib.request.urlopen('http://127.0.0.1:5174/api/plaza/featured', timeout=5) as resp:
    feat = json.loads(resp.read().decode('utf-8'))
    print(f"\n[+] Total featured plaza cards: {len(feat)}")
    for f in feat[:10]:
        print(f"   - {f.get('title')} [{f.get('category')}]")
