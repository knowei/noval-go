import sys
import os
import json

sys.path.insert(0, '.')
import scripts.import_4_aigirlfriend_cards as imp

entries = []
for cfg in imp.cards_configs:
    aid = cfg['aid']
    alias = cfg['alias']
    title = cfg['title']
    json_path = os.path.join('cards', f'{aid}.json')
    raw_html = ''
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            raw_html = json.load(f).get('data', {}).get('apps', {}).get('description', '')

    handbook = {
        'title': title,
        'desc': cfg.get('summary') or title,
        'bg_image': cfg['cover_url'],
        'opening_options': cfg['opening_options']
    }
    first_turn = {
        'index': 1,
        'isUser': False,
        'scene': cfg['scenes'][0]['title'],
        'story': cfg['first_story'],
        'branches': [
            {'tag': 'A', 'title': '强势主动', 'desc': '把握主导权，将局势引向最深层的欲望试探'},
            {'tag': 'B', 'title': '细致观察', 'desc': '审视对方微小的呼吸与神态变化，步步为营'},
            {'tag': 'C', 'title': '言语挑逗', 'desc': '用暧昧低沉的耳语彻底击溃对方的心防防线'}
        ]
    }
    handbook_json = json.dumps(handbook, ensure_ascii=False).replace("'", "''")
    roles_json = json.dumps(cfg['roles'], ensure_ascii=False).replace("'", "''")
    scenes_json = json.dumps(cfg['scenes'], ensure_ascii=False).replace("'", "''")
    styles_json = json.dumps({'dialogue_style': '沉浸式细腻小说叙事，富有张力的肉体与情感博弈', 'format': 'AI风月标准双栏规范及.custom-ui样式'}, ensure_ascii=False).replace("'", "''")
    first_turn_json = json.dumps(first_turn, ensure_ascii=False).replace("'", "''")
    raw_html_escaped = raw_html.replace("'", "''")
    tags_json = json.dumps(cfg['tags'], ensure_ascii=False).replace("'", "''")
    safe_title = title.replace("'", "''")
    safe_badge = cfg['badge'].replace("'", "''")
    now = '2026-10-05 10:15:00'

    # stories (UUID and alias)
    for sid in [aid, alias]:
        sql_s = f"INSERT INTO stories (id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient, handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json, custom_css, custom_html, category, created_at, updated_at) VALUES ('{sid}', '{safe_title}', '{safe_badge}', '{cfg['icon']}', '{safe_title}', '{safe_badge}', '{cfg['icon']}', '{cfg['theme_color']}', '{cfg['btn_gradient']}', '{handbook_json}', '{roles_json}', '{scenes_json}', '{styles_json}', '{first_turn_json}', '', '{raw_html_escaped}', '{cfg['category']}', '{now}', '{now}') ON CONFLICT (id) DO NOTHING;"
        entries.append(sql_s)

    # plaza_cards (UUID)
    sql_p = f"INSERT INTO plaza_cards (id, deck_id, title, badge, badge_color, author, \"desc\", rating, tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at) VALUES ('{aid}', '{aid}', '{safe_title}', '{safe_badge}', '{cfg['badge_color']}', 'AI风月精选', '{safe_title}', '{cfg['rating']}', '{tags_json}', '{cfg['heat']}', 0, '{cfg['cover_url']}', 'HOT', 'fire', 1, '{cfg['category']}', '{now}') ON CONFLICT (title) DO NOTHING;"
    entries.append(sql_p)

with open('init_postgres.sql', 'a', encoding='utf-8') as f:
    f.write('\n-- 4 New AI Girlfriend Cards (Imported 2026-10-05)\n')
    for e in entries:
        f.write(e + '\n')

print(f"Successfully appended {len(entries)} SQL statements to init_postgres.sql!")
