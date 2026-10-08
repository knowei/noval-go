import json
import re

cards = [
    '972540eb-b794-48ba-b70c-f02c3c2e6a15',
    '77dfcc94-a3d6-4bbc-b15a-f79cc13b9b3a',
    'cd3b5fb0-3359-4f6b-bcf3-29736893fbd7',
    '1a1938d1-1b23-4df6-b7c4-f7feab1490dc'
]

for aid in cards:
    with open(f'cards/{aid}.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    app = data.get('data', {}).get('apps', {})
    name = app.get('name')
    desc = app.get('description', '')
    print('=' * 80)
    print(f"[{aid}] {name}")
    
    # Extract scripts
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', desc, re.DOTALL)
    print(f"Scripts count: {len(scripts)}")
    for i, s in enumerate(scripts):
        tmpls = re.findall(r'`([^`]{50,})`', s, re.DOTALL)
        print(f"  Script {i} templates: {len(tmpls)}")
        for ti, t in enumerate(tmpls):
            print(f"    Tmpl {ti} (len {len(t)}): {t[:250].replace(chr(10), ' ')}...")
            
    # Look for tags or character cards
    char_cards = re.findall(r'<div[^>]*class=[\'"][^\'"]*(?:character|role|card)[^\'"]*[\'"][^>]*>([\s\S]*?)</div>', desc)
    print(f"Char/role cards count: {len(char_cards)}")
    
    # Look for images
    imgs = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', desc)
    print(f"Images count: {len(imgs)}")
    for im in imgs[:5]:
        print(f"  - {im}")
