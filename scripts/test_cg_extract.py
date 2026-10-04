import re
import json

with open('scripts/card_7a68d42a-e4bf-4eaf-961d-991baeb50232.json', 'r', encoding='utf-8') as f:
    css = json.load(f)['data']['model_config'].get('built_in_css', '')

rules = re.findall(r'\.([a-zA-Z0-9_-]+)\s*\{[^}]*background(?:-image)?:\s*url\(([^)]+)\)', css)
cg_map = {}
for sel, url in rules:
    clean_url = url.strip('\'" ')
    if clean_url.startswith('http'):
        cg_map[sel] = clean_url

print(f"Extracted {len(cg_map)} direct image URLs!")
print("Sample entries:")
for k in list(cg_map.keys())[:15]:
    print(f"  {k} -> {cg_map[k]}")
