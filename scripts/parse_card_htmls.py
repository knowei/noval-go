import re
import sys
import json

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

for fname, label in [
    ('wife_business_trip.html', '美妻出差 (2c10c41f)'),
    ('buddy_childhood_friend.html', '哥们青梅 (e346f716)'),
    ('daughter_wanwan.html', '女儿晚晚 (cce8dc1c)')
]:
    with open('scripts/' + fname, 'r', encoding='utf-8') as f:
        html = f.read()
    
    print("=" * 80)
    print(f"FILE: {fname} -> {label}")
    
    # 1. Opening options
    # Find data-text
    dts = re.findall(r'data-text=["\'](.*?)["\']', html, re.S)
    print(f"Data-texts ({len(dts)}):")
    for i, dt in enumerate(dts):
        # clean html
        dt_clean = re.sub(r'\s+', ' ', dt).strip()
        print(f"  ({i+1}) {dt_clean}")
    
    # Check if there are .opening-item or .opening or .opt divs
    openings = re.findall(r'<div[^>]*class=["\'][^"\']*(?:opening|route|option|choice)[^"\']*["\'][^>]*>(.*?)</div>', html, re.I | re.S)
    print(f"\nDiv openings/options ({len(openings)}):")
    for i, op in enumerate(openings[:6]):
        clean = re.sub(r'<[^>]+>', ' ', op)
        clean = re.sub(r'\s+', ' ', clean).strip()
        if len(clean) > 5:
            print(f"  [{i+1}] {clean}")

    # 2. Check generate function in script
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.S)
    for si, sc in enumerate(scripts):
        print(f"\n--- Script {si} content ---")
        # Find template string
        tmpl = re.findall(r'`([^`]+)`', sc, re.S)
        if tmpl:
            for ti, t in enumerate(tmpl):
                print(f"  Template {ti} (len {len(t)}):")
                print(t[:600])
        else:
            print(sc[:600])
