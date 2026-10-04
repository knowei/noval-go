import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

files = [
    'scripts/card_pure_love_childhood_friend.json',
    'scripts/card_redeem_yandere_villain.json',
    'scripts/card_ice_school_flower.json',
    'scripts/card_azgar_magic_continent.json',
    'scripts/card_jiuxiao_xiuxian.json',
    'scripts/card_infinity_lord_god.json'
]

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    app = data['data']['apps']
    cfg = data['data']['model_config']
    print("=" * 80)
    print(f"FILE: {fp}")
    print(f"ID: {app.get('id')} | Name: {app.get('name')}")
    print(f"Summary: {app.get('summary')[:100]}...")
    print(f"Cover: {app.get('cover')}")
    print(f"Built-in CSS length: {len(cfg.get('built_in_css') or '')}")
    print(f"World Book length: {len(str(cfg.get('world_book') or ''))}")
    print(f"Opening statement: {cfg.get('opening_statement')}")
    print(f"AI opening statements len: {len(str(cfg.get('ai_opening_statements') or ''))}")
    wb = cfg.get('world_book')
    if wb:
        print(f"World Book type: {type(wb).__name__}")
        if isinstance(wb, str):
            print(f"World book snippet: {wb[:300]}...")
    desc = app.get('description') or ''
    print(f"Description length: {len(desc)}")
    if desc:
        print(f"Desc snippet: {desc[:200]}...")
