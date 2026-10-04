import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

card_ids = [
    '0e0de61f-8f94-47f2-871a-2ab89228e709',
    '17629b1d-cdeb-4fb9-9511-49f7f4a5ff83',
    '12aa4c36-6dd6-4dc7-98ed-ac730b0931d6',
    'b4462091-0d4b-4170-9e8c-5b0f1fd40c73'
]

for aid in card_ids:
    p = f'scripts/card_{aid}.json'
    with open(p, 'r', encoding='utf-8') as f:
        d = json.load(f).get('data', {})
        app = d.get('apps', {})
        mc = d.get('model_config', {})
        author = d.get('author', {})
        tags = d.get('tags', [])
        
        print("="*60)
        print(f"CARD ID: {aid}")
        print(f"Name: {app.get('name')}")
        print(f"Author: {author.get('nickname') if isinstance(author, dict) else author}")
        print(f"Cover: {app.get('cover')}")
        print(f"BG: {mc.get('bg_image')}")
        print(f"Category: {app.get('category')}")
        tag_names = [t.get('name') if isinstance(t, dict) else t for t in tags]
        print(f"Tags: {tag_names}")
        print(f"Summary: {(app.get('summary') or '')[:200]}")
        
        desc = app.get('description', '')
        print(f"HTML len: {len(desc)}, Built-in CSS len: {len(mc.get('built_in_css') or '')}")
        
        # Check if there is start story or opening in the html script
        # Often the script generates a prompt or summary text when submitted
        text_matches = re.findall(r'(\b(?:prompt|story|summary|opening|template)\b.*?[\'\"`].*?[\'\"`])', desc, re.I | re.DOTALL)
        print(f"Keyword matches in HTML: {len(text_matches)}")
