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
    mc = d.get('model_config', {})
    app = d.get('apps', {})

css = mc.get('built_in_css', '')
rules = re.findall(r'(\.img-[A-Za-z0-9_-]+)\s*\{[^}]*background(?:-image)?:\s*url\(([^)]+)\)[^}]*\}', css)
print(f"Total img rules: {len(rules)}")

types = {}
for sel, url in rules:
    clean_url = url.strip("'\" ")
    parts = sel.split('-')
    cat = parts[1] if len(parts) > 1 else 'other'
    types.setdefault(cat, []).append((sel, clean_url))

for cat, items in types.items():
    print(f"\n--- Category: {cat} (count={len(items)}) ---")
    for sel, url in items[:4]:
        print(f"  {sel} -> {url}")

print("\n--- Searching for how AI should output these images ---")
# Look in the entire JSON for any mentions of 'img-'
raw_str = json.dumps(d, ensure_ascii=False)
mentions = re.findall(r'(.{0,80}img-[A-Za-z0-9_-]+.{0,80})', raw_str)
print(f"Mentions of img- in whole card JSON: {len(mentions)}")
for m in mentions[:10]:
    print("  *", m.strip().replace('\n', ' '))
