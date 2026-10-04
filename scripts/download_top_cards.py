import urllib.request
import json
import sys
import os

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

proxy = urllib.request.ProxyHandler({'http': 'http://127.0.0.1:7897', 'https': 'http://127.0.0.1:7897'})
opener = urllib.request.build_opener(proxy)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://genraton.xyz/',
    'Origin': 'https://genraton.xyz'
}

cards = [
    ('64da8e90-9404-4a55-ae80-fe40c3a28299', 'card_pure_love_childhood_friend.json'),
    ('7e0efc4b-ee24-4481-8f38-618e6f23ecd0', 'card_redeem_yandere_villain.json'),
    ('d0c2b806-5a8a-42fd-bdeb-a69fa72cbbf6', 'card_ice_school_flower.json'),
    ('b0c6d63f-4185-46a5-bbe8-9d0ef7fc974a', 'card_azgar_magic_continent.json'),
    ('75376129-e9a1-461b-9671-0e944e969b8e', 'card_jiuxiao_xiuxian.json'),
    ('82e261bc-2d95-4c41-8913-e0cf2756fc04', 'card_infinity_lord_god.json')
]

for aid, fname in cards:
    path = os.path.join('scripts', fname)
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    print(f"Fetching {aid} -> {fname}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=12) as resp:
            data = resp.read()
            with open(path, 'wb') as f:
                f.write(data)
            parsed = json.loads(data.decode('utf-8'))
            app_info = parsed.get('data', {}).get('apps', {})
            print(f"  [+] Success: {app_info.get('name')} (bytes: {len(data)})")
    except Exception as e:
        print(f"  [-] Error: {e}")
