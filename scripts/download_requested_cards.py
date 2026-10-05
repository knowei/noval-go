import urllib.request
import json
import sys
import os
import time

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

cards = [
    ('60575ef0-3b20-4843-a0a8-5b3e60de9cc7', 'card_60575ef0.json'),
    ('9d90628c-f7eb-41f3-8403-acebc7fc5e66', 'card_9d90628c.json'),
    ('ed79710f-9b0d-42c5-b275-6bdb53a5b6a8', 'card_ed79710f.json'),
    ('cd3b5fb0-3359-4f6b-bcf3-29736893fbd7', 'card_cd3b5fb0.json')
]

os.makedirs('cards', exist_ok=True)
os.makedirs('scripts', exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://aigirlfriend.baby/',
    'Origin': 'https://aigirlfriend.baby'
}

for aid, fname in cards:
    card_path = os.path.join('cards', f'{aid}.json')
    script_path = os.path.join('scripts', fname)
    if os.path.exists(card_path) and os.path.getsize(card_path) > 1000:
        print(f"[CACHE] {aid} already downloaded ({os.path.getsize(card_path)} bytes)")
        continue

    url = f'https://aigirlfriend.baby/go/api/apps/{aid}'
    print(f"Downloading {aid} -> {url}...")
    success = False
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                with open(card_path, 'wb') as f:
                    f.write(data)
                with open(script_path, 'wb') as f:
                    f.write(data)
                parsed = json.loads(data.decode('utf-8'))
                app = parsed.get('data', {}).get('apps', {})
                name = app.get('name', 'Unknown')
                print(f"  [SUCCESS] {aid} (attempt {attempt+1}) -> Title: {name}, bytes: {len(data)}")
                success = True
                break
        except Exception as e:
            print(f"  [RETRY {attempt+1}/3] {aid} error: {e}")
            time.sleep(2)
    if not success:
        print(f"  [FAILED] Failed to download {aid}")

print("\n--- Summary of Downloaded Cards ---")
for aid, fname in cards:
    p = os.path.join('cards', f'{aid}.json')
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            d = json.load(f).get('data', {}).get('apps', {})
            print(f"ID: {aid} | Name: {d.get('name')} | Category: {d.get('category')} | Heat: {d.get('use_count')}")
