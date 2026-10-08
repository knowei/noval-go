import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

cards = [
    ('60575ef0-3b20-4843-a0a8-5b3e60de9cc7', '绿帽好哥们'),
    ('9d90628c-f7eb-41f3-8403-acebc7fc5e66', '讲台及格分'),
    ('ed79710f-9b0d-42c5-b275-6bdb53a5b6a8', '小透明同桌'),
    ('cd3b5fb0-3359-4f6b-bcf3-29736893fbd7', '深夜妹妹')
]

for aid, name in cards:
    print('=' * 80)
    print(f"[{name}] {aid}")
    with open(f'cards/{aid}.json', 'r', encoding='utf-8') as f:
        data = json.load(f)['data']
    app = data['apps']
    html = app.get('description', '')
    
    # Strip script and style
    no_script = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.S)
    no_script = re.sub(r'<script[^>]*>.*?</script>', '', no_script, flags=re.S)
    text = re.sub(r'<[^>]+>', '\n', no_script)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    print(f"Name: {app.get('name')}")
    print(f"Cover: {app.get('icon_url') or app.get('cover')}")
    print(f"Summary: {app.get('summary')}")
    print("\n--- Extracted Text Preview (first 25 lines) ---")
    for i, l in enumerate(lines[:25]):
        print(f"  {i+1}: {l}")

    # Check script templates
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, flags=re.S)
    for si, sc in enumerate(scripts):
        tmpls = re.findall(r'`([^`]{50,})`', sc, flags=re.S)
        if tmpls:
            print(f"\n--- Script {si} Templates ({len(tmpls)}) ---")
            for ti, t in enumerate(tmpls):
                print(f"  Tmpl {ti} (len {len(t)}): {t[:300]}...\n")
