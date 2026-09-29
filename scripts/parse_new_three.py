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
    print('=' * 50)
    print('UUID:', aid)
    print('Title:', app.get('name'))
    print('Summary:\n', app.get('summary', '')[:300])
    print('---')
    desc = app.get('description', '')
    # Save desc to html file for inspection
    with open(f'scripts/card_{aid}.html', 'w', encoding='utf-8') as hf:
        hf.write(desc)
    print(f'Wrote scripts/card_{aid}.html ({len(desc)} chars)')
