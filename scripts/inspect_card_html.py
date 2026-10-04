import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

files = [
    ('scripts/card_pure_love_childhood_friend.json', '青梅纯爱'),
    ('scripts/card_redeem_yandere_villain.json', '救赎病娇反派'),
    ('scripts/card_ice_school_flower.json', '毒舌冰山校花'),
    ('scripts/card_azgar_magic_continent.json', '阿兹加尔魔法大陆'),
    ('scripts/card_jiuxiao_xiuxian.json', '九霄修仙传'),
    ('scripts/card_infinity_lord_god.json', '无限流主神空间')
]

for fp, label in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    app = data['data']['apps']
    html = app.get('description', '')
    
    # Extract title tag
    title_m = re.search(r'<title>(.*?)</title>', html, re.I | re.S)
    title = title_m.group(1).strip() if title_m else ''
    
    # Strip tags to get raw text
    clean_text = re.sub(r'<style[\s\S]*?</style>', '', html, flags=re.I)
    clean_text = re.sub(r'<script[\s\S]*?</script>', '', clean_text, flags=re.I)
    clean_text = re.sub(r'<[^>]+>', ' ', clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    print("=" * 80)
    print(f"[{label}] {app.get('name')}")
    print(f"Cover: {app.get('cover')}")
    print(f"HTML Title: {title}")
    print(f"Summary: {app.get('summary')}")
    print(f"Text Snippet: {clean_text[:350]}...")
