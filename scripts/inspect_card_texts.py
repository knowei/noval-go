import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def inspect_pure_love():
    with open('scripts/card_pure_love_childhood_friend.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    html = data['data']['apps']['description']
    # search for stages/descriptions in html
    texts = re.findall(r'<p[^>]*>(.*?)</p>', html, re.S)
    print("Pure Love paragraphs:")
    for t in texts:
        clean = re.sub(r'<[^>]+>', '', t).strip()
        if len(clean) > 10:
            print(" -", clean[:120])

def inspect_ice_flower():
    with open('scripts/card_ice_school_flower.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    html = data['data']['apps']['description']
    texts = re.findall(r'<p[^>]*>(.*?)</p>', html, re.S)
    print("\nIce Flower paragraphs:")
    for t in texts:
        clean = re.sub(r'<[^>]+>', '', t).strip()
        if len(clean) > 10:
            print(" -", clean[:120])

inspect_pure_love()
inspect_ice_flower()
