import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

card_ids = [
    'b9a93dc3-6ce1-4d0d-b4de-1f199a95a095',
    '9a0243df-2a42-4dfa-adc1-bdcb61313484',
    '962951e6-14e2-4733-987e-e8b49c8aebf8'
]

for aid in card_ids:
    with open(f'scripts/card_{aid}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    app = d.get('data', {}).get('apps', {})
    mc = d.get('data', {}).get('model_config', {})
    desc = app.get('description', '')
    summary = app.get('summary', '')
    print('=' * 40)
    print('ID:', aid)
    print('Title:', app.get('name'))
    print('Summary length:', len(summary))
    print('Desc length:', len(desc))
    print('Is HTML:', '<html' in desc)

    # Search for openings
    if '<html' in desc:
        openings = re.findall(r'<div[^>]*class=["\'][^"\']*(?:opening-text|opening)[^"\']*["\'][^>]*>([\s\S]*?)</div>', desc)
        clean_ops = [re.sub(r'<[^>]+>', '', op).strip() for op in openings if op.strip()]
        print('HTML openings found:', len(clean_ops))
        for op in clean_ops[:3]:
            print('  ->', op[:80])
    else:
        print('Plain text desc preview:\n', desc[:300])
