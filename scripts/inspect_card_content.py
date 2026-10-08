import urllib.request
import json
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
headers = {'User-Agent': 'Mozilla/5.0', 'Referer': 'https://genraton.xyz/', 'Origin': 'https://genraton.xyz'}

aids = [
    ('972540eb-b794-48ba-b70c-f02c3c2e6a15', '只要考得好，妈妈可以满足我一个不花钱的要求'),
    ('77dfcc94-a3d6-4bbc-b15a-f79cc13b9b3a', '偷干老妈屁眼没被打死，被迫签订不平等条约——母子性爱博弈💗'),
    ('cd3b5fb0-3359-4f6b-bcf3-29736893fbd7', '✨ 妹妹最近总是和她的小姐妹玩到深夜才回来'),
    ('1a1938d1-1b23-4df6-b7c4-f7feab1490dc', '💕秦若岚『欠债表姐/调教/反差』'),
    ('22af6df6-f7a8-42fa-be59-33a5025ccbb2', '中式家庭模拟器——你的完美妈妈、姐姐、妹妹、小弟❤️'),
    ('f2afa934-3f01-48f7-b7ee-fb7f4bcc5f15', '【较难攻略】一脸嫌弃的为我处理性欲的好妹妹'),
    ('33c6daa7-b789-4f21-b655-391041021b44', '色小孩VS坏继母')
]

for aid, title in aids:
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            app = data.get('data', {}).get('apps', {})
            desc = app.get('description', '')
            imgs = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', desc)
            scripts = re.findall(r'<script[^>]*>(.*?)</script>', desc, re.DOTALL)
            print(f"[{aid}] {title}")
            print(f"  - HTML length: {len(desc)}, Images: {len(imgs)}, Scripts: {len(scripts)}")
            # Sample text inside desc (strip HTML)
            clean_text = re.sub(r'<[^>]+>', ' ', desc)
            clean_text = ' '.join(clean_text.split())[:150]
            print(f"  - Text preview: {clean_text}\n")
    except Exception as e:
        print(f"[{aid}] Error: {e}")
