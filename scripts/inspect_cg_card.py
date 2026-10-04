import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

aid = '7a68d42a-e4bf-4eaf-961d-991baeb50232'
with open(f'scripts/card_{aid}.json', 'r', encoding='utf-8') as f:
    d = json.load(f).get('data', {})
    app = d.get('apps', {})
    mc = d.get('model_config', {})
    
    print('=== APP INFO ===')
    print('Name:', app.get('name'))
    print('has_special_cg:', app.get('has_special_cg'))
    print('Cover:', app.get('cover'))
    print('Summary:', (app.get('summary') or '')[:200])
    
    print('\n=== MODEL CONFIG ===')
    print('is_have_cg_image:', mc.get('is_have_cg_image'))
    print('regex_replaces:', mc.get('regex_replaces'))
    print('pre_prompt length:', len(mc.get('pre_prompt') or ''))
    print('built_in_css length:', len(mc.get('built_in_css') or ''))
    print('description length:', len(app.get('description') or ''))
    print('world_book len:', len(mc.get('world_book') or ''))

    # Inspect HTML description to see how it works
    desc = app.get('description', '')
    print('\n=== HTML INSPECTION ===')
    imgs_in_html = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', desc, re.I)
    print('Images in HTML count:', len(imgs_in_html))
    for u in imgs_in_html[:10]:
        print('  HTML img:', u)

    # Search for all URLs
    raw_str = json.dumps(d, ensure_ascii=False)
    all_urls = re.findall(r'https?://[^\s"\'<>]+', raw_str)
    img_urls = [u for u in set(all_urls) if any(ext in u.lower() for ext in ['.png', '.jpg', '.jpeg', '.webp', 'catai.wiki', 'image', 'cg'])]
    print(f'\nTotal potential image URLs across JSON: {len(img_urls)}')
    for u in sorted(img_urls)[:25]:
        print('  ->', u)
