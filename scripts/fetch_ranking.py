import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://genraton.xyz/',
    'Origin': 'https://genraton.xyz',
    'Accept': 'application/json, text/plain, */*'
}

# Fetch multiple pages of installed-apps (this is the apps explore list on awsprod.aiero.cc)
all_apps = []
for page in range(1, 10):
    url = f'https://awsprod.aiero.cc/console/api/installed-apps?page={page}&limit=30'
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('installed_apps') or []
            print(f"Page {page}: got {len(items)} items (total: {data.get('total')})")
            if not items:
                break
            for it in items:
                app = it.get('app', it)
                all_apps.append({
                    'id': it.get('id') or app.get('id'),
                    'app_id': app.get('id'),
                    'name': app.get('name'),
                    'description': app.get('description'),
                    'icon': app.get('icon'),
                    'icon_background': app.get('icon_background'),
                    'mode': app.get('mode'),
                    'created_at': it.get('created_at'),
                    'heat': it.get('heat') or it.get('use_count') or it.get('user_count')
                })
    except Exception as e:
        print(f"Page {page} error: {e}")
        break

print(f"Total apps fetched: {len(all_apps)}")

# Filter for family / taboo keywords: 母子, 姐弟, 兄妹, 继母, 继妹, 母亲, 姐姐, 妹妹, 哥哥, 弟弟, 骚妈, 人妻
target_keywords = ['母子', '姐弟', '兄妹', '继母', '继妹', '妈', '母', '姐', '妹', '哥', '弟', '姨', '人妻', '乱伦', '管教']
matched = []
for a in all_apps:
    name = a.get('name') or ''
    desc = a.get('description') or ''
    text = name + ' ' + desc
    for kw in target_keywords:
        if kw in name or kw in desc:
            matched.append(a)
            break

print(f"\nMatched family/taboo cards: {len(matched)}")
for i, m in enumerate(matched):
    print(f"[{i+1}] ID: {m['id']} | Name: {m['name']}")

with open('scripts/matched_apps.json', 'w', encoding='utf-8') as f:
    json.dump(matched, f, ensure_ascii=False, indent=2)
