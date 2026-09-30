import urllib.request
import urllib.error
import json
import ssl
import sys
import os

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

card_ids = [
    '0e0de61f-8f94-47f2-871a-2ab89228e709',
    '17629b1d-cdeb-4fb9-9511-49f7f4a5ff83',
    '12aa4c36-6dd6-4dc7-98ed-ac730b0931d6',
    'b4462091-0d4b-4170-9e8c-5b0f1fd40c73'
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
            with opener.open(req, timeout=12) as resp:
                raw_bytes = resp.read()
                data = json.loads(raw_bytes.decode('utf-8'))
                app_info = data.get('data', {}).get('apps', {})
                name = app_info.get('name', 'unknown')
                author = app_info.get('author', 'unknown')
                desc = app_info.get('summary') or app_info.get('description') or ''
                print(f" -> [{i}] SUCCESS: '{name}' by '{author}' ({len(raw_bytes)} bytes)", flush=True)
                print(f"    Summary: {desc[:80]}...", flush=True)
                
                filepath = os.path.join(os.path.dirname(__file__), f"card_{aid}.json")
                with open(filepath, 'wb') as f:
                    f.write(raw_bytes)
                success = True
                break
        except Exception as e:
            # print(f" -> opener {i} error: {e}", flush=True)
            pass
    if not success:
        print(f" -> FAILED to fetch {aid}", flush=True)
