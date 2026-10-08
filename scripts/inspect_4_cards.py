import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ids = [
    ('60575ef0-3b20-4843-a0a8-5b3e60de9cc7', '绿帽好哥们'),
    ('9d90628c-f7eb-41f3-8403-acebc7fc5e66', '讲台及格分'),
    ('ed79710f-9b0d-42c5-b275-6bdb53a5b6a8', '小透明同桌'),
    ('cd3b5fb0-3359-4f6b-bcf3-29736893fbd7', '深夜妹妹')
]

for aid, short_name in ids:
    print('='*70)
    print(f'CARD: {short_name} ({aid})')
    with open(f'cards/{aid}.json', 'r', encoding='utf-8') as f:
        raw = json.load(f)
    app = raw['data']['apps']
    html = app.get('description', '')
    
    # 1. Look for openings / data-text
    dts = re.findall(r'data-text=["\'](.*?)["\']', html, re.S)
    print(f'data-text count: {len(dts)}')
    for i, dt in enumerate(dts[:5]):
        print(f'  dt[{i+1}]: {dt[:120]}...')
        
    # Look for button onclick or copy text
    buttons = re.findall(r'<button[^>]*>(.*?)</button>', html, re.S)
    print(f'button count: {len(buttons)}')
    for i, b in enumerate(buttons[:5]):
        clean_btn = re.sub(r'<[^>]+>', ' ', b).strip()
        print(f'  btn[{i+1}]: {clean_btn[:80]}')
        
    # Look for class="opening..." or "route..."
    routes = re.findall(r'class=["\'][^"\']*(?:route|opening|card-title|section-title)[^"\']*["\'][^>]*>(.*?)<', html, re.I)
    print(f'route/title tags ({len(routes)}): {routes[:6]}')

    # 2. Look for scripts
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
    print(f'script tags count: {len(scripts)}')
    for si, sc in enumerate(scripts):
        templates = re.findall(r'`([^`]+)`', sc, re.S)
        for ti, tmpl in enumerate(templates):
            if len(tmpl) > 50:
                print(f'  Script {si} template {ti} (len {len(tmpl)}): {repr(tmpl[:150])}')
