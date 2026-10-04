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

test_urls = [
    'https://awsprod.aiero.cc/console/api/installed-apps?page=2&limit=20',
    'https://awsprod.aiero.cc/console/api/explore/categories',
    'https://awsprod.aiero.cc/console/api/explore/apps?category=all&page=1&limit=20',
    'https://awsprod.aiero.cc/console/api/explore/apps?category=all',
    'https://awsprod.aiero.cc/console/api/explore/apps?page=1&limit=20',
    'https://awsprod.aiero.cc/console/api/installed-apps/search?keyword=校花',
    'https://awsprod.aiero.cc/console/api/installed-apps?keyword=校花',
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[+] {url} -> Status 200, keys: {list(data.keys()) if isinstance(data, dict) else len(data)}")
    except Exception as e:
        print(f"[-] {url} -> {e}")
