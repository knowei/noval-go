import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

proxy = urllib.request.ProxyHandler({'http': 'http://127.0.0.1:7897', 'https': 'http://127.0.0.1:7897'})
opener = urllib.request.build_opener(proxy)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://genraton.xyz/',
    'Origin': 'https://genraton.xyz'
}

test_cards = [
    ('64da8e90-9404-4a55-ae80-fe40c3a28299', 'pure_love_childhood_friend'),
    ('7e0efc4b-ee24-4481-8f38-618e6f23ecd0', 'redeem_yandere_villain'),
    ('d0c2b806-5a8a-42fd-bdeb-a69fa72cbbf6', 'ice_school_flower_homestay'),
    ('b0c6d63f-4185-46a5-bbe8-9d0ef7fc974a', 'azgar_magic_continent'),
    ('75376129-e9a1-461b-9671-0e944e969b8e', 'jiuxiao_xiuxian')
]

for aid, name in test_cards:
    # try both endpoints
    urls = [
        f'https://genraton.xyz/go/api/apps/{aid}',
        f'https://awsprod.aiero.cc/console/api/installed-apps/{aid}'
    ]
    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with opener.open(req, timeout=10) as resp:
                data = resp.read()
                parsed = json.loads(data.decode('utf-8'))
                print(f"[+] SUCCESS {url} -> size: {len(data)} bytes, keys: {list(parsed.keys())}")
                if 'data' in parsed and 'apps' in parsed['data']:
                    print(f"    Name: {parsed['data']['apps'].get('name')}")
                elif 'app' in parsed:
                    print(f"    Name: {parsed['app'].get('name')}")
                break
        except Exception as e:
            print(f"[-] FAILED {url} -> {e}")
