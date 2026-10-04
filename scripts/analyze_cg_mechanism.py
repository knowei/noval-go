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

css = mc.get('built_in_css', '')
html = app.get('description', '')

print("=== 1. CSS ANALYSIS ===")
print("CSS Total Length:", len(css))
# Find background-image rules in CSS
bg_rules = re.findall(r'([^{}]+)\s*\{[^}]*background(?:-image)?:\s*url\(([^)]+)\)[^}]*\}', css, re.DOTALL)
print("CSS background-image rules count:", len(bg_rules))
for selector, url in bg_rules[:15]:
    clean_sel = selector.strip().replace('\n', ' ')
    print(f"  Selector: {clean_sel[:50]} -> {url.strip()[:60]}")

# Look for key CSS classes
classes = set(re.findall(r'\.([a-zA-Z0-9_-]+)', css))
print("\nInteresting CSS classes found:", [c for c in classes if any(k in c.lower() for k in ['cg', 'avatar', 'tachie', 'chara', 'costume', 'cloth', 'face', 'exp', 'body', 'stand', 'girl', 'sister'])][:30])

print("\n=== 2. HTML / JAVASCRIPT ANALYSIS ===")
print("HTML Total Length:", len(html))
# Find script tags in HTML
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL | re.I)
print("Script tags count:", len(scripts))
for idx, s in enumerate(scripts):
    print(f"  Script [{idx}] length: {len(s)}")
    # Find functions or objects
    funcs = re.findall(r'function\s+([a-zA-Z0-9_$]+)', s)
    vars_ = re.findall(r'(?:var|let|const)\s+([a-zA-Z0-9_$]+)', s)
    print(f"    Functions: {funcs[:10]}")
    print(f"    Variables: {vars_[:10]}")

# Find any instructions in HTML or prompt on how CG is triggered
print("\n=== 3. SEARCHING FOR MODEL TRIGGER INSTRUCTIONS ===")
# Search for tags like <cg>, [cg], <立绘>, or instructions to AI
matches = re.findall(r'(.{0,60}(?:立绘|CG|表情|换装|动态|剖面|音效|触发|标签).{0,60})', html)
print(f"Keyword occurrences in HTML: {len(matches)}")
for m in matches[:10]:
    print("  ->", m.strip().replace('\n', ' '))
