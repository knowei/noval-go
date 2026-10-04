# -*- coding: utf-8 -*-
import json
import re

p = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\js\plugins\Shiroin_SceneGalleryA.js"
with open(p, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

start_idx = text.find("DrillUp.g_SGaA_entries = {")
end_idx = text.find("window.ShiroinGallery = {")
gallery_text = text[start_idx:end_idx]

# Let's extract each entry's key, name, cover, video, pic structure
# We can find all keys
pattern = re.compile(r'["\']?([a-zA-Z0-9_-]+)["\']?\s*:\s*\{([^\{\}]*?(?:\{[^\{\}]*?(?:\{[^\{\}]*?\}[^\{\}]*?)*\}[^\{\}]*?)*)\}', re.DOTALL)

with open(r"d:\pro\work\proj\googleAI\noval-go\scripts\gallery_source.js", "w", encoding="utf-8") as f:
    f.write(gallery_text)

print("Exported gallery_source.js")
