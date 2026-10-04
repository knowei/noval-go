import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*',
    'X-Language': 'zh-Hans',
    'Origin': 'https://genraton.xyz',
    'Referer': 'https://genraton.xyz/'
}
proxy_handler = urllib.request.ProxyHandler({'http': 'http://127.0.0.1:7897', 'https': 'http://127.0.0.1:7897'})
opener = urllib.request.build_opener(proxy_handler)

req = urllib.request.Request('https://awsprod.aiero.cc/console/api/installed-apps?page=1&limit=20', headers=headers)
with opener.open(req, timeout=8) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Keys in response:", list(data.keys()))
    items = data.get('installed_apps') or data.get('data') or data.get('apps') or []
    print(f"Count: {len(items)}")
    for i, it in enumerate(items[:15]):
        app = it.get('app', it)
        app_id = it.get('id') or app.get('id')
        name = app.get('name')
        desc = (app.get('description') or '')[:50]
        print(f"[{i+1}] ID: {app_id} | Name: {name} | Desc: {desc}")
