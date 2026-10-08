import json

with open('cards/e59fe31f-98c7-4b85-9f84-262f5d13bc32.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

data = d['data']
app = data['apps']
mc = data.get('model_config', {})
print("app cover:", app.get('cover'))
print("mc keys:", list(mc.keys()))
print("mc bg_image:", mc.get('bg_image'))
print("mc background:", mc.get('background'))
print("mc avatar:", mc.get('avatar'))
print("mc char_image:", mc.get('char_image'))

# Look for image URLs anywhere in model_config
import re
mc_str = json.dumps(mc, ensure_ascii=False)
urls = re.findall(r'https?://[^\s\"\'\<\>]+', mc_str)
print("URLs in model_config:", urls)
