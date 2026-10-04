import json
import re
import sys
import os

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

aid = 'c7c45e4d-6362-4b5b-b8ba-1f7dae288861'
fpath = f'scripts/card_{aid}.json'
with open(fpath, 'r', encoding='utf-8') as f:
    d = json.load(f)

app = d['data']['apps']
mcfg = d['data']['model_config']
desc = app.get('description', '')
css = mcfg.get('built_in_css', '')

print('=== CARD METADATA ===')
print('Name:', app.get('name'))
print('Summary:', app.get('summary'))
print('pre_length:', mcfg.get('pre_length'))
print('Desc length:', len(desc))
print('CSS length:', len(css))

# Look for embedded prompt/templates in desc
print('\n=== CHECKING SCRIPT / TEMPLATES IN HTML ===')
scripts = re.findall(r'<script[^>]*>(.*?)</script>', desc, flags=re.DOTALL)
print('Total <script> blocks:', len(scripts))
for i, s in enumerate(scripts):
    print(f'Script #{i+1} length: {len(s)}')
    for kw in ['prompt', '状态栏', '三观', '性格', 'copy', 'clipboard', 'template']:
        if kw in s.lower():
            print(f'  Found keyword "{kw}" in script #{i+1}!')

print('\n=== OPENINGS IN HANDBOOK ===')
for m in re.finditer(r'<div[^>]*class=[\'"][^\'"]*open-card[^\'"]*[\'"][^>]*>([\s\S]*?)</div>', desc):
    print('Opening card:', re.sub(r'<[^>]+>', ' ', m.group(1)).strip()[:150])

# Search for label spans or text in HTML
print('\n=== ALL LABELS IN HTML ===')
labels_found = re.findall(r'<span class=[\'"]label[\'"][^>]*>([\s\S]*?)</span>', desc)
print('Labels with class="label":', len(labels_found))
for l in labels_found:
    print(' ', re.sub(r'<[^>]+>', '', l).strip())

# Check input fields in kid section
sections = re.findall(r'<section[^>]*id=[\'"]([^\'"]+)[\'"][^>]*>([\s\S]*?)</section>', desc)
for sid, scontent in sections:
    if sid == 'view-kid':
        print('\n=== VIEW-KID INPUT LABELS ===')
        inputs = re.findall(r'<label[^>]*>([\s\S]*?)</label>', scontent)
        for inp in inputs:
            print(' ', re.sub(r'<[^>]+>', ' ', inp).strip())







