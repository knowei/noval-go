import urllib.request
import urllib.parse
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

url = 'https://wiki.biligame.com/blhx/' + urllib.parse.quote('初月')
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode('utf-8')

print("Page HTML Length:", len(html))

# Look for skin tabs or gallery images
# biligame uses patterns like: <div class="char-skin" ...> or <img src="..." alt="换装名称">
skin_blocks = re.findall(r'<div[^>]*class="[^"]*tab-content[^"]*"[^>]*>([\s\S]*?)</div>', html)
print("Tab contents:", len(skin_blocks))

# Find all images on the page
img_urls = re.findall(r'src="(https://[^"]+\.(?:png|jpg|jpeg))"', html)
for img in set(img_urls):
    if 'hdslb' in img or 'biligame' in img:
        print("IMG:", img)

# Search for skin names
skin_names = re.findall(r'data-theme="([^"]+)"', html)
print("Skin themes/names:", skin_names)

# Search for any mention of 誓约
mentions = re.findall(r'[^<>"\n]{0,20}誓约[^<>"\n]{0,30}', html)
for m in set(mentions):
    print("Mention of 誓约:", m)
