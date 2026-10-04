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

candidate_endpoints = [
    '/api/explore/apps',
    '/api/explore/recommend',
    '/api/explore/popular',
    '/api/explore/hot',
    '/api/apps',
    '/api/apps/explore',
    '/api/plaza',
    '/api/forum/posts?page=1&limit=10',
    '/console/api/explore/apps',
    '/console/api/explore/installed-apps',
    '/console/api/installed-apps',
    '/console/api/apps',
    '/console/api/apps/recommended',
    '/console/api/apps/explore',
    '/console/api/featured-apps',
    '/console/api/recommend',
    '/console/api/rank/hot',
    '/console/api/rank/new',
]

for ep in candidate_endpoints:
    url = f"https://awsprod.aiero.cc{ep}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[+] {ep} -> Status 200, type: {type(data)}, keys: {list(data.keys()) if isinstance(data, dict) else len(data)}")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            print(f"[!] {ep} -> HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')[:100]}")
    except Exception as e:
        pass
