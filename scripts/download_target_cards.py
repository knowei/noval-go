import urllib.request
import json
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
headers = {'User-Agent': 'Mozilla/5.0', 'Referer': 'https://genraton.xyz/', 'Origin': 'https://genraton.xyz'}

aids = [
    ('972540eb-b794-48ba-b70c-f02c3c2e6a15', '只要考得好，妈妈可以满足我一个不花钱的要求'),
    ('77dfcc94-a3d6-4bbc-b15a-f79cc13b9b3a', '偷干老妈屁眼没被打死，被迫签订不平等条约——母子性爱博弈💗'),
    ('cd3b5fb0-3359-4f6b-bcf3-29736893fbd7', '✨ 妹妹最近总是和她的小姐妹玩到深夜才回来'),
    ('1a1938d1-1b23-4df6-b7c4-f7feab1490dc', '💕秦若岚『欠债表姐/调教/反差』')
]

for aid, title in aids:
    path = f'cards/{aid}.json'
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        print(f"Already exists: {path}")
        continue
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    print(f"Downloading {aid} ({title})...")
    req = urllib.request.Request(url, headers=headers)
    with opener.open(req, timeout=10) as resp:
        raw_bytes = resp.read()
        with open(path, 'wb') as f:
            f.write(raw_bytes)
        print(f"Saved {path} ({len(raw_bytes)} bytes)")
