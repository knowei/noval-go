# -*- coding: utf-8 -*-
import json

items_path = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\data\Items.json"
with open(items_path, "r", encoding="utf-8") as f:
    items = json.load(f)

print(f"Total items in Items.json: {len(items)}")

# Find items related to recollection / CG (usually around ID 400-500)
cg_items = []
for it in items:
    if not it: continue
    iid = it.get("id")
    name = it.get("name", "")
    desc = it.get("description", "")
    note = it.get("note", "")
    if iid >= 400 or "回想" in desc or "CG" in desc or "回想" in name or "CG" in name:
        cg_items.append((iid, name, desc))

print(f"Found {len(cg_items)} recollection/CG items:")
for iid, name, desc in cg_items:
    print(f"[{iid}] {name}: {desc}")
