import urllib.request
import urllib.parse
import re
import os
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

os.makedirs('web/public/images/azurlane', exist_ok=True)

shipgirls = ['初月', '大凤', '欧根亲王', '贝尔法斯特', '爱宕', '信浓', '新泽西', '柴郡', '埃吉尔']
pinyin_map = {
    '初月': 'hatsuzuki',
    '大凤': 'taihou',
    '欧根亲王': 'prinz_eugen',
    '贝尔法斯特': 'belfast',
    '爱宕': 'atago',
    '信浓': 'shinano',
    '新泽西': 'new_jersey',
    '柴郡': 'cheshire',
    '埃吉尔': 'aegir'
}

for name in shipgirls:
    key = pinyin_map[name]
    target_file = f'web/public/images/azurlane/{key}.png'
    if os.path.exists(target_file) and os.path.getsize(target_file) > 2000:
        print(f"[Skip] {name} already exists ({os.path.getsize(target_file)} bytes)")
        continue
    url = 'https://wiki.biligame.com/blhx/' + urllib.parse.quote(name)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8')
        
        # Look for full portrait or card image
        # biligame uses: <img ... src="https://i0.hdslb.com/bfs/game/...png" ...>
        imgs = re.findall(r'src="(https://[^"]*hdslb\.com/bfs/game/[^"]+\.(?:png|jpg))"', html)
        if not imgs:
            imgs = re.findall(r'src="(https://[^"]+\.(?:png|jpg))"', html)
        
        # Prefer character tachie or icon
        # Usually tachie is in the main body or infobox
        chosen = None
        for img in imgs:
            if any(term in img.lower() for term in ['t_char', 'tachie', '立绘', 'character', 'icon']):
                chosen = img
                break
        if not chosen and imgs:
            # First hdslb image is usually the character infobox image
            chosen = imgs[0]
            
        if chosen:
            # Download image
            download_req = urllib.request.Request(chosen, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(download_req, timeout=15) as img_resp:
                img_data = img_resp.read()
            with open(target_file, 'wb') as out_f:
                out_f.write(img_data)
            print(f"[OK] {name} -> {target_file} ({len(img_data)} bytes)")
        else:
            print(f"[Warn] No image found for {name}")
    except Exception as e:
        print(f"[Error] {name}: {e}")
    import time
    time.sleep(2)

