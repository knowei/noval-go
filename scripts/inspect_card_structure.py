import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

proxy = urllib.request.ProxyHandler({'http': 'http://127.0.0.1:7897', 'https': 'http://127.0.0.1:7897'})
opener = urllib.request.build_opener(proxy)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://genraton.xyz/',
    'Origin': 'https://genraton.xyz'
}

aid = '64da8e90-9404-4a55-ae80-fe40c3a28299'
url = f'https://genraton.xyz/go/api/apps/{aid}'
req = urllib.request.Request(url, headers=headers)
with opener.open(req, timeout=10) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Top keys:", list(data.keys()))
    d = data.get('data', {})
    print("data keys:", list(d.keys()))
    apps = d.get('apps', {})
    print("apps keys:", list(apps.keys()))
    print("Name:", apps.get('name'))
    print("Summary:", apps.get('summary'))
    print("Cover:", apps.get('cover'))
    print("Category:", apps.get('category'))
    print("Tags:", apps.get('tags'))
    model_cfg = d.get('model_config', {})
    print("model_config keys:", list(model_cfg.keys()))
    print("User input form:", model_cfg.get('user_input_form'))
    prompt_cfg = model_cfg.get('pre_prompt', '')
    print("Prompt length:", len(prompt_cfg))
    print("Prompt snippet:", prompt_cfg[:300])
    opening = model_cfg.get('opening_statement', '')
    print("Opening length:", len(opening))
    print("Opening snippet:", opening[:300])
    suggested = model_cfg.get('suggested_questions', [])
    print("Suggested questions:", suggested)
