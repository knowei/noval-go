import urllib.request
import urllib.error
import json
import ssl
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

card_ids = [
    '2c10c41f-de54-407a-a6e0-a1475b0f2d33',
    'e346f716-5b4c-4fbd-abef-2131c6dcfa71',
    'cce8dc1c-7403-4a71-ad51-7ef85f525426'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://genraton.xyz/',
    'Origin': 'https://genraton.xyz'
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

openers = [
    urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx)),
    urllib.request.build_opener(
        urllib.request.ProxyHandler({'http': 'http://127.0.0.1:7897', 'https': 'http://127.0.0.1:7897'}),
        urllib.request.HTTPSHandler(context=ctx)
    )
]

for aid in card_ids:
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    print(f"Fetching {aid}...", flush=True)
    req = urllib.request.Request(url, headers=headers)
    success = False
    for i, opener in enumerate(openers):
        try:
            with opener.open(req, timeout=10) as resp:
                raw_bytes = resp.read()
                data = json.loads(raw_bytes.decode('utf-8'))
                app_info = data.get('data', {}).get('apps', {})
                name = app_info.get('name', 'unknown')
                author = app_info.get('author', 'unknown')
                print(f" -> [{i}] SUCCESS: '{name}' by '{author}' ({len(raw_bytes)} bytes)", flush=True)
                
                # Save raw json
                filepath = f"scripts/card_{aid}.json"
                with open(filepath, 'wb') as f:
                    f.write(raw_bytes)
                success = True
                break
        except Exception as e:
            # print(f" -> opener {i} error: {e}", flush=True)
            pass
    if not success:
        print(f" -> FAILED to fetch {aid}", flush=True)
