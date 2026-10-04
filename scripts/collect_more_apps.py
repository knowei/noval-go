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

all_apps = []
seen_ids = set()

for page in range(1, 6):
    url = f"https://awsprod.aiero.cc/console/api/installed-apps?page={page}&limit=30"
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('installed_apps') or []
            for it in items:
                app = it.get('app', it)
                aid = it.get('id') or app.get('id')
                if aid and aid not in seen_ids:
                    seen_ids.add(aid)
                    all_apps.append({
                        'id': aid,
                        'name': app.get('name'),
                        'desc': (app.get('description') or '')[:80],
                        'mode': app.get('mode')
                    })
    except Exception as e:
        print(f"Page {page} error: {e}")

print(f"Total collected: {len(all_apps)}")
for i, a in enumerate(all_apps):
    print(f"[{i+1}] {a['id']} | {a['name']}")
