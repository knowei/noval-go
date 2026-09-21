import urllib.request
import urllib.error
import json
import os
import sys
import time

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

aid = '2168197e-903b-4727-97e3-bf5f1d5b6c8f'
url = f'https://genraton.xyz/go/api/apps/{aid}'

for attempt in range(1, 6):
    print(f"Attempt {attempt} fetching daughter...", flush=True)
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=30) as resp:
            data = resp.read()
            with open('scripts/card_daughter_door_block.json', 'wb') as f:
                f.write(data)
            parsed = json.loads(data.decode('utf-8'))
            name = parsed.get('data', {}).get('apps', {}).get('name')
            print(f"SUCCESS: {name}, size: {len(data)}", flush=True)
            break
    except Exception as e:
        print(f"Failed attempt {attempt}: {e}", flush=True)
        time.sleep(2)
