import json
import re

def inspect(aid):
    with open(f'cards/{aid}.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    app = data.get('data', {}).get('apps', {})
    desc = app.get('description', '')
    no_tags = re.sub(r'<style[^>]*>.*?</style>', '', desc, flags=re.S)
    no_tags = re.sub(r'<script[^>]*>.*?</script>', '', no_tags, flags=re.S)
    no_tags = re.sub(r'<[^>]+>', '\n', no_tags)
    lines = [l.strip() for l in no_tags.split('\n') if l.strip()]
    print('=' * 80)
    print(aid, app.get('name'))
    print('Cover:', app.get('icon_url') or app.get('cover'))
    print('Summary:', app.get('summary'))
    print('\nFirst 40 lines of text:')
    for l in lines[:40]:
        print(' ', l)

inspect('972540eb-b794-48ba-b70c-f02c3c2e6a15')
inspect('cd3b5fb0-3359-4f6b-bcf3-29736893fbd7')
