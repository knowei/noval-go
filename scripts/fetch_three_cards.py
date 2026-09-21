import urllib.request
import urllib.error
import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
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
    ('eb85f366-919b-466e-a7ff-8d8dbc4ed29b', 'perfect_girl'),
    ('2168197e-903b-4727-97e3-bf5f1d5b6c8f', 'daughter_door_block'),
    ('758e40b4-c1b3-4655-a83a-5ef136b60a2b', 'big_breast_mother_sister')
]

for aid, name in cards:
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    print(f"Fetching {name} ({aid})...", flush=True)
    req = urllib.request.Request(url, headers=headers)
    try:
        with opener.open(req, timeout=10) as resp:
            data = resp.read()
            filepath = f'scripts/card_{name}.json'
            with open(filepath, 'wb') as f:
                f.write(data)
            parsed = json.loads(data.decode('utf-8'))
            app_info = parsed.get('data', {}).get('apps', {})
            print(f" -> SUCCESS: {app_info.get('name')}, size: {len(data)} bytes", flush=True)
    except Exception as e:
        print(f" -> ERROR: {e}", flush=True)
