# -*- coding: utf-8 -*-
import json
import re

items_path = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\data\Items.json"
with open(items_path, "r", encoding="utf-8") as f:
    items = json.load(f)

# Also load itemsDescription from plugin or language files if any
# Let's check www/data or js/plugins for itemsDescription
out_lines = []
for it in items:
    if not it: continue
    iid = it.get("id")
    name = it.get("name", "")
    desc = it.get("description", "")
    if 400 <= iid <= 460 and name:
        out_lines.append(f"[{iid}] {name} | {desc}")

with open(r"d:\pro\work\proj\googleAI\noval-go\scripts\cg_items_utf8.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

print(f"Written {len(out_lines)} items to scripts/cg_items_utf8.txt")
