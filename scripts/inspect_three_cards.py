import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

for aid in ['2c10c41f-de54-407a-a6e0-a1475b0f2d33', 'e346f716-5b4c-4fbd-abef-2131c6dcfa71', 'cce8dc1c-7403-4a71-ad51-7ef85f525426']:
    with open(f'scripts/card_{aid}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    app = d.get('data', {}).get('apps', {})
    mc = d.get('data', {}).get('model_config', {})
    tags = d.get('data', {}).get('tags', [])
    author = d.get('data', {}).get('author', {})
    print(f'==============================')
    print('UUID:', aid)
    print('Title:', app.get('name'))
    print('Author:', author.get('nickname') if isinstance(author, dict) else author)
    print('Desc:', app.get('description'))
    print('Cover:', app.get('cover'))
    print('BG Image:', mc.get('bg_image'))
    print('Tags:', [t.get('name') if isinstance(t, dict) else t for t in tags])
    print('Opening Statement length:', len(mc.get('opening_statement') or ''))
    print('Opening Statement preview:\n', (mc.get('opening_statement') or '')[:500])
    print('---')
    print('Pre Prompt length:', len(mc.get('pre_prompt') or ''))
    print('Pre Prompt preview:\n', (mc.get('pre_prompt') or '')[:500])
    print('---')
    wb = mc.get('world_book')
    print('World Book len / type:', len(wb) if wb else 0, type(wb))
    if wb:
        print('World Book preview:\n', str(wb)[:400])
    css = mc.get('built_in_css')
    print('Built-in CSS length:', len(css) if css else 0)
