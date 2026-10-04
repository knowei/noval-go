# -*- coding: utf-8 -*-
import json
import re

p = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\js\plugins\Shiroin_SceneGalleryA.js"
with open(p, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

start_idx = text.find("DrillUp.g_SGaA_entries = {")
end_idx = text.find("window.ShiroinGallery = {")
gallery_text = text[start_idx:end_idx]

# Let's extract entries
# Each entry is preceded by a key in DrillUp.g_SGaA_entries
# Example: "480": { ... }, "summerSet": { ... }
lines = gallery_text.splitlines()
entries = []
cur_key = None
cur_content = []

for line in lines:
    m = re.match(r'^\s*["\']?([a-zA-Z0-9_-]+)["\']?\s*:\s*\{', line)
    if m:
        if cur_key:
            entries.append((cur_key, "\n".join(cur_content)))
        cur_key = m.group(1)
        cur_content = [line]
    else:
        if cur_key:
            cur_content.append(line)

if cur_key:
    entries.append((cur_key, "\n".join(cur_content)))

print(f"Total entries found: {len(entries)}")

# Also let's inspect where item / CG names come from
# Look at line: window.itemsDescription?.[entry?.name]?.subtitle ?? entry?.context
print("\nSample entries:")
for k, content in entries[:15]:
    # find cover, video, pic
    cover = re.search(r'cover:\s*["\']([^"\']+)["\']', content)
    video = re.search(r'video:\s*["\']?([^,\n\r}]+)', content)
    category = re.search(r'category:\s*["\']([^"\']+)["\']', content)
    order = re.search(r'order:\s*(\d+)', content)
    name = re.search(r'name:\s*["\']?([^,\n\r}]+)', content)
    print(f"Key: {k}, Name: {name.group(1) if name else ''}, Order: {order.group(1) if order else ''}, Cover: {cover.group(1) if cover else ''}")
