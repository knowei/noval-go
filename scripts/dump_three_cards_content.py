import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

cards = [
    ('2c10c41f-de54-407a-a6e0-a1475b0f2d33', 'wife_business_trip'),
    ('e346f716-5b4c-4fbd-abef-2131c6dcfa71', 'buddy_childhood_friend'),
    ('cce8dc1c-7403-4a71-ad51-7ef85f525426', 'daughter_wanwan')
]

for aid, short_name in cards:
    with open(f'scripts/card_{aid}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    app = d['data']['apps']
    mc = d['data']['model_config']
    desc_html = app.get('description', '')
    
    # Save the description html for reference
    with open(f'scripts/{short_name}.html', 'w', encoding='utf-8') as hf:
        hf.write(desc_html)
    
    print(f"==================== {short_name} ====================")
    print("Name:", app.get('name'))
    print("Summary:", app.get('summary'))
    print("HTML length:", len(desc_html))
    
    # Extract scripts
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', desc_html, re.S)
    print(f"Found {len(scripts)} script tags")
    for idx, s in enumerate(scripts):
        print(f"--- Script {idx} ({len(s)} chars) ---")
        print(s[:500])
        print("...")
