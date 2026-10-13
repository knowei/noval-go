"""
通用春水Live（chunshuiai.net）作品/角色卡导入器。

用法：
    .venv\\Scripts\\python.exe scripts\\import_chunshui_card.py <作品ID或完整URL> [<作品ID> ...]
    可选参数：
      --no-plaza        只导入剧本，不加入广场卡片列表
      --force           强制覆盖已存在的卡片（默认跳过已存在的卡片）

说明：
    - 数据源自春水Live开放接口：https://chunshuiai.net/v1/braindances/{id}
    - 自动保留作品的交互式 HTML、内联 CSS、人物立绘与背景图片
    - 独立维护，不影响原有的风月（genraton.xyz）导入脚本
"""
import datetime
import io
import json
import os
import re
import ssl
import sys
import urllib.request

# 统一控制台输出 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import db_engine  # noqa: E402

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def _build_opener():
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY') or 'http://127.0.0.1:7897'
    try:
        p_handler = urllib.request.ProxyHandler({'http': proxy, 'https': proxy})
        return urllib.request.build_opener(p_handler, urllib.request.HTTPSHandler(context=CTX))
    except Exception:
        return urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX))


OPENER = _build_opener()
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://chunshuiai.net/',
    'Origin': 'https://chunshuiai.net',
    'Accept': 'application/json, text/plain, */*',
}

THEME_BY_TAG = {
    '病娇': ('#7c3aed', 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'),
    '救赎': ('#7c3aed', 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'),
    '纯爱': ('#ec4899', 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)'),
    '校园': ('#0ea5e9', 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)'),
    '青梅': ('#ec4899', 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)'),
    '修仙': ('#059669', 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)'),
    '末世': ('#dc2626', 'linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)'),
    '家庭': ('#06b6d4', 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'),
    '后宫': ('#d946ef', 'linear-gradient(135deg, #d946ef 0%, #ec4899 100%)'),
    '兄妹': ('#f43f5e', 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)'),
    '恋爱': ('#ec4899', 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'),
    '都市': ('#3b82f6', 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'),
}
DEFAULT_THEME = ('#8b5cf6', 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)')

UUID_RE = re.compile(r'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', re.IGNORECASE)
EMOJI_RE = re.compile(
    r'^([\U0001F300-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]+)'
)


def extract_id(raw_input: str) -> str:
    m = UUID_RE.search(raw_input.strip())
    if m:
        return m.group(1).lower()
    return raw_input.strip().lower()


def fetch_chunshui(aid: str) -> dict:
    cache = os.path.join(ROOT, 'cards', f'{aid}.json')
    if os.path.exists(cache) and os.path.getsize(cache) > 1000:
        with open(cache, encoding='utf-8') as f:
            return json.load(f)

    url = f'https://chunshuiai.net/v1/braindances/{aid}'
    req = urllib.request.Request(url, headers=HEADERS)
    with OPENER.open(req, timeout=30) as resp:
        raw = resp.read()

    os.makedirs(os.path.dirname(cache), exist_ok=True)
    with open(cache, 'wb') as f:
        f.write(raw)
    return json.loads(raw.decode('utf-8'))


def pick_theme(tags):
    for t in tags:
        if t in THEME_BY_TAG:
            return THEME_BY_TAG[t]
    return DEFAULT_THEME


def import_one(target: str, with_plaza: bool = True, force: bool = False) -> bool:
    aid = extract_id(target)
    if not aid:
        print(f'  [错误] 无法识别作品 ID: {target}')
        return False

    conn = db_engine.db.get_connection()
    cur = conn.cursor()

    # 1. 检查已存在
    cur.execute('SELECT id, title FROM stories WHERE id = %s', (aid,))
    existing_story = cur.fetchone()
    cur.execute('SELECT id, title FROM plaza_cards WHERE id = %s', (aid,))
    existing_plaza = cur.fetchone()

    if (existing_story or existing_plaza) and not force:
        title = (existing_story or existing_plaza).get('title') if isinstance(existing_story or existing_plaza, dict) else aid
        print(f'  [已存在，跳过] {aid} ({title})')
        conn.close()
        return True

    # 2. 抓取数据
    try:
        raw = fetch_chunshui(aid)
    except Exception as e:
        print(f'  [抓取失败] {aid}: {e}')
        conn.close()
        return False

    bd = raw.get('braindance') or raw
    if not bd or not bd.get('name'):
        print(f'  [跳过] {aid} 数据格式异常或未找到 name')
        conn.close()
        return False

    title = bd.get('name', '').strip()
    summary = (bd.get('summary') or '').strip()
    html = bd.get('description') or ''
    css = bd.get('builtInCss') or ''

    # 作者
    author = (
        bd.get('publisherNickname')
        or bd.get('creatorName')
        or bd.get('publisherUsername')
        or '春水Live'
    ).strip()

    # 标签
    tags = bd.get('tags') or bd.get('featuredTagNames') or []
    if isinstance(tags, str):
        tags = [tags]

    # 素材资产
    assets = bd.get('assets') or {}
    cover_obj = assets.get('cover') or {}
    bg_obj = assets.get('background') or {}

    cover = cover_obj.get('desktop') or cover_obj.get('thumbnail') or ''
    bg = bg_obj.get('desktop') or bg_obj.get('mobile') or ''
    if not cover and bg:
        cover = bg

    # 评分与热度
    rating = str(round(float(bd.get('ratingAvg') or 9.8), 1))
    play_count = bd.get('playCount') or bd.get('heatScore') or 0
    heat = f'{play_count} 玩过' if play_count else '🔥 热门推荐'

    # 主题样式
    m = EMOJI_RE.match(title)
    icon = m.group(1) if m else '🌸'
    theme_color, btn_gradient = pick_theme(tags)
    badge = ' · '.join(tags[:2]) if tags else '春水精选'
    category = tags[0] if tags else '都市'

    handbook = {
        'title': title,
        'desc': summary[:200] if summary else f'{title}（春水Live导入）',
        'bg_image': bg,
    }
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 生成开场演示剧情
    opening_text = (bd.get('openingStatement') or '').strip()
    first_turn_demo = []
    if opening_text:
        first_turn_demo = [{
            'isUser': False,
            'story': opening_text,
            'branches': [
                {'tag': 'A', 'title': '环顾四周，仔细观察周围的环境与人物', 'desc': '环顾四周，仔细观察周围的环境与人物'},
                {'tag': 'B', 'title': '主动上前打招呼试探', 'desc': '主动上前打招呼试探'}
            ]
        }]
    elif summary:
        first_turn_demo = [{
            'isUser': False,
            'story': f"【序章 · 初临】\n\n{summary}\n\n你迈出脚步，开启了在这片天地间的全新契约篇章……",
            'branches': [
                {'tag': 'A', 'title': '环顾四周观察当前局势', 'desc': '环顾四周观察当前局势'},
                {'tag': 'B', 'title': '查看契约合同与身边角色', 'desc': '查看契约合同与身边角色'}
            ]
        }]

    # 写入 stories
    cols = (
        'id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient, '
        'handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json, '
        'custom_css, custom_html, category, created_at, updated_at'
    )
    values = (
        aid, title, badge, icon, title, summary[:80] or title, icon, theme_color, btn_gradient,
        json.dumps(handbook, ensure_ascii=False), '[]', '[]', '{}', json.dumps(first_turn_demo, ensure_ascii=False),
        css, html, category, now, now,
    )
    placeholders = ', '.join(['%s'] * len(values))
    cur.execute(
        f'''INSERT INTO stories ({cols}) VALUES ({placeholders})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title, badge = EXCLUDED.badge,
              cover_icon = EXCLUDED.cover_icon, cover_title = EXCLUDED.cover_title,
              cover_subtitle = EXCLUDED.cover_subtitle, logo = EXCLUDED.logo,
              theme_color = EXCLUDED.theme_color, btn_gradient = EXCLUDED.btn_gradient,
              handbook_json = EXCLUDED.handbook_json,
              first_turn_demo_json = CASE WHEN EXCLUDED.first_turn_demo_json != '[]' THEN EXCLUDED.first_turn_demo_json ELSE stories.first_turn_demo_json END,
              custom_css = EXCLUDED.custom_css,
              custom_html = EXCLUDED.custom_html, category = EXCLUDED.category,
              updated_at = EXCLUDED.updated_at''',
        values,
    )
    print(f'  [剧本导入成功] {aid} ← {title}')

    # 写入 plaza_cards
    if with_plaza:
        cur.execute(
            '''INSERT INTO plaza_cards (
                 id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
                 heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (id) DO UPDATE SET
                 title = EXCLUDED.title, badge = EXCLUDED.badge,
                 badge_color = EXCLUDED.badge_color, author = EXCLUDED.author,
                 "desc" = EXCLUDED."desc", rating = EXCLUDED.rating,
                 tags_json = EXCLUDED.tags_json, heat = EXCLUDED.heat,
                 cover_image = EXCLUDED.cover_image, category = EXCLUDED.category,
                 created_at = COALESCE(plaza_cards.created_at, EXCLUDED.created_at)''',
            (aid, aid, title, badge, theme_color, author, summary[:200] or title, rating,
             json.dumps(tags, ensure_ascii=False), heat, 0, cover, 'SPRING', 'fire', 1, category, now),
        )
        print(f'  [广场卡片加入] {title}（{author} / 评分 {rating} / {heat}）')

    conn.commit()
    conn.close()
    return True


def main():
    args = sys.argv[1:]
    with_plaza = '--no-plaza' not in args
    force = '--force' in args
    targets = [a for a in args if not a.startswith('--')]

    if not targets:
        print('用法: .venv\\Scripts\\python.exe scripts\\import_chunshui_card.py <作品ID或URL> [--force] [--no-plaza]')
        sys.exit(1)

    print(f'准备导入春水Live {len(targets)} 个作品（广场：{with_plaza}，强制覆盖：{force}）')
    success_count = 0
    for t in targets:
        print(f'\n=== 目标: {t} ===')
        if import_one(t, with_plaza=with_plaza, force=force):
            success_count += 1

    print(f'\n完成：成功 {success_count} / {len(targets)}')


if __name__ == '__main__':
    main()
