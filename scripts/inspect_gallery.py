# -*- coding: utf-8 -*-
import json
import re

p = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\js\plugins\Shiroin_SceneGalleryA.js"
with open(p, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

print("File size:", len(text))

# Drill_SceneGalleryA usually parses PluginManager.parameters('Drill_SceneGalleryA') or similar
# Let's see how parameters are defined or if there are hardcoded lists
for line in text.splitlines():
    if "DrillUp.g_SGa_list" in line or "ShiroinGallery" in line or "context" in line:
        if len(line) < 200:
            print(line)
