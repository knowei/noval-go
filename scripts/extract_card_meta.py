import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

card_files = [
    ('scripts/card_pure_love_childhood_friend.json', '青梅纯爱'),
    ('scripts/card_ice_school_flower.json', '毒舌冰山校花'),
    ('scripts/card_azgar_magic_continent.json', '阿兹加尔魔法大陆'),
    ('scripts/card_jiuxiao_xiuxian.json', '九霄修仙传'),
    ('scripts/card_infinity_lord_god.json', '无限流主神空间')
]

for cf, label in card_files:
    with open(cf, 'r', encoding='utf-8') as f:
        data = json.load(f)
    app = data['data']['apps']
    cfg = data['data']['model_config']
    html = app.get('description', '')
    
    print("=" * 80)
    print(f"[{label}] {app.get('name')}")
    print(f"Author: {data['data'].get('author', {}).get('nickname', 'AI风月精选')}")
    print(f"Rating: {app.get('avg_rating_score', 9.9)}, Players: {app.get('players_count')}, Favorites: {app.get('favorites_count')}")
    
    # Check if there are opening options or stages in html
    options = re.findall(r'<button[^>]*class="[^"]*btn[^"]*"[^>]*>(.*?)</button>', html, re.I | re.S)
    if not options:
        options = re.findall(r'<option[^>]*value="([^"]*)"[^>]*>(.*?)</option>', html, re.I | re.S)
    if not options:
        options = re.findall(r'<div[^>]*class="[^"]*route-title[^"]*"[^>]*>(.*?)</div>', html, re.I | re.S)
    print("Found options/routes:", options[:6])
    
    # Check for character info in html
    char_matches = re.findall(r'(?:姓名|角色|名字)[:：]\s*([^\s<]+)', html)
    print("Character matches:", char_matches[:5])
