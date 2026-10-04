import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

files = [
    ('scripts/card_azgar_magic_continent.json', '阿兹加尔魔法大陆'),
    ('scripts/card_jiuxiao_xiuxian.json', '九霄修仙传'),
    ('scripts/card_infinity_lord_god.json', '无限流主神空间')
]

for fp, label in files:
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    html = data['data']['apps']['description']
    texts = re.findall(r'<p[^>]*>(.*?)</p>', html, re.S)
    print(f"\n{'='*40}\n[{label}] paragraphs count: {len(texts)}")
    for t in texts:
        clean = re.sub(r'<[^>]+>', '', t).strip()
        if len(clean) > 25 and not clean.startswith('@') and not clean.startswith('{'):
            print(" -", clean[:120])
            if len(clean) > 200:
                break
