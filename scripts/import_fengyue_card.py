"""
通用风月（genraton.xyz）卡片导入器。

用法：
    .venv\\Scripts\\python.exe scripts\\import_fengyue_card.py <卡片ID> [<卡片ID> ...]
    .venv\\Scripts\\python.exe scripts\\import_fengyue_card.py --ranking [数量，默认20]
    可选参数：
      --no-plaza        只导入剧本，不加入广场卡片列表
      --force           强制覆盖已存在的卡片（默认跳过已存在的卡片）

说明：
- 卡片 HTML 来自 app.description；样式内联在 HTML 的 <style> 里，存入 custom_html。
- 自动维护 plaza_cards 与 stories，记录准确的 created_at 导入时间以便首页倒序排序。
"""
import datetime
import io
import json
import os
import re
import ssl
import sys
import urllib.request

# 统一控制台输出 UTF-8，防止 Windows GBK 报错
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
        # test proxy handler first
        p_handler = urllib.request.ProxyHandler({'http': proxy, 'https': proxy})
        return urllib.request.build_opener(p_handler, urllib.request.HTTPSHandler(context=CTX))
    except Exception:
        return urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX))

OPENER = _build_opener()
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://genraton.xyz/zh/explore/apps?ranking=overall_rank&display=simple',
    'Origin': 'https://genraton.xyz',
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
    '调教': ('#d946ef', 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)'),
    '萝莉': ('#f43f5e', 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)'),
    '高自由度': ('#3b82f6', 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'),
    '无限流': ('#6366f1', 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'),
}
DEFAULT_THEME = ('#8b5cf6', 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)')

EMOJI_RE = re.compile(
    '^([\U0001F300-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]+)'
)


def fetch(aid: str) -> dict:
    cache = os.path.join(ROOT, 'cards', f'{aid}.json')
    if os.path.exists(cache) and os.path.getsize(cache) > 1000:
        with open(cache, encoding='utf-8') as f:
            return json.load(f)
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    req = urllib.request.Request(url, headers=HEADERS)
    with OPENER.open(req, timeout=30) as resp:
        raw = resp.read()
    os.makedirs(os.path.dirname(cache), exist_ok=True)
    with open(cache, 'wb') as f:
        f.write(raw)
    return json.loads(raw.decode('utf-8'))


def fetch_ranking_cards(limit: int = 20) -> list:
    """从风月探索榜单获取高推荐卡片"""
    cards = []
    page = 1
    while len(cards) < limit:
        url = f'https://genraton.xyz/go/api/explore/search?ranking=overall_rank&page={page}&limit=20'
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with OPENER.open(req, timeout=15) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                apps = res.get('data', {}).get('apps') or []
                if not apps:
                    break
                for a in apps:
                    aid = a.get('id')
                    if aid and aid not in [c['id'] for c in cards]:
                        cards.append(a)
                        if len(cards) >= limit:
                            break
                page += 1
        except Exception as e:
            print(f'  [请求榜单失败 page {page}]: {e}')
            break
    return cards


def pick_theme(tags):
    for t in tags:
        if t in THEME_BY_TAG:
            return THEME_BY_TAG[t]
    return DEFAULT_THEME


def import_one(aid: str, with_plaza: bool = True, force: bool = False) -> bool:
    conn = db_engine.db.get_connection()
    cur = conn.cursor()

    # 1. 检查系统是否已存在该卡
    cur.execute('SELECT id, title FROM stories WHERE id = %s', (aid,))
    existing_story = cur.fetchone()
    cur.execute('SELECT id, title FROM plaza_cards WHERE id = %s', (aid,))
    existing_plaza = cur.fetchone()

    if (existing_story or existing_plaza) and not force:
        title = (existing_story or existing_plaza).get('title') if isinstance(existing_story or existing_plaza, dict) else aid
        print(f'  [已存在，跳过] {aid} ({title})')
        conn.close()
        return True

    try:
        raw = fetch(aid)
    except Exception as e:
        print(f'  [下载失败] {aid}: {e}')
        conn.close()
        return False

    data = raw.get('data') or {}
    app = data.get('apps') or {}
    mc = data.get('model_config') or {}
    tags = [t.get('name') for t in (data.get('tags') or []) if t.get('name')]
    author = (data.get('author') or {}).get('name') or '风月'

    title = (app.get('name') or aid).strip()
    if not title:
        print(f'  [跳过] {aid} 没有标题')
        conn.close()
        return False

    html = app.get('description') or ''
    css = mc.get('built_in_css') or ''
    bg = mc.get('bg_image') or ''
    cover = app.get('cover') or ''
    summary = (app.get('summary') or '').strip()
    rating = str(app.get('avg_rating_score') or '9.5')
    players = app.get('players_count') or 0
    heat = f'{players} 玩过' if players else ''

    m = EMOJI_RE.match(title)
    icon = m.group(1) if m else '📖'
    theme_color, btn_gradient = pick_theme(tags)
    badge = ' · '.join(tags[:2]) if tags else '风月推荐'
    category = tags[0] if tags else '都市'

    handbook = {
        'title': title,
        'desc': summary[:200] if summary else f'{title}（风月导入）',
        'bg_image': bg,
    }
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 生成开场演示剧情（避免开场白为空时卡在占位符）
    opening_text = (mc.get('opening_statement') or '').strip()
    is_placeholder = not opening_text or opening_text in ['选择一段开场白', '请选择开场白', '选择开场白', '请选择一段开场白']
    first_turn_demo = []
    if not is_placeholder:
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
            'story': f"【序章 · 初临】\n\n{summary}\n\n阳光穿透微隙，周围的喧嚣渐渐清晰。你迈出脚步，开启了在这片天地间的全新篇章……",
            'branches': [
                {'tag': 'A', 'title': '环顾四周观察当前局势', 'desc': '环顾四周观察当前局势'},
                {'tag': 'B', 'title': '顺应眼前的指引前行', 'desc': '顺应眼前的指引前行'}
            ]
        }]

    # ---- 剧本本体写入 ----
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

    # ---- 广场卡片写入 ----
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
             json.dumps(tags, ensure_ascii=False), heat, 0, cover, 'HOT', 'fire', 1, category, now),
        )
        print(f'  [广场卡片加入] {title}（{author} / 评分 {rating} / {heat}）')

    conn.commit()
    conn.close()
    return True


def main():
    args = sys.argv[1:]
    with_plaza = '--no-plaza' not in args
    force = '--force' in args
    args = [a for a in args if not a.startswith('--')]

    # 1. 榜单批量导入模式
    if '--ranking' in sys.argv:
        limit = 20
        for i, a in enumerate(sys.argv):
            if a == '--ranking' and i + 1 < len(sys.argv) and sys.argv[i + 1].isdigit():
                limit = int(sys.argv[i + 1])
        print(f'=== 正在从 AI风月 获取前 {limit} 个高推荐卡片 ===\n')
        ranking_cards = fetch_ranking_cards(limit)
        print(f'获取到 {len(ranking_cards)} 张榜单卡片，开始逐一处理...\n')
        imported_count = 0
        skipped_count = 0
        for item in ranking_cards:
            aid = item.get('id')
            title = item.get('name')
            print(f'>>> 处理: {title} ({aid})')
            try:
                conn = db_engine.db.get_connection()
                cur = conn.cursor()
                cur.execute('SELECT id FROM stories WHERE id = %s', (aid,))
                exists = cur.fetchone()
                conn.close()
                if exists and not force:
                    print(f'    系统已存在，跳过。')
                    skipped_count += 1
                else:
                    if import_one(aid, with_plaza=with_plaza, force=force):
                        imported_count += 1
            except Exception as e:
                print(f'    导入失败: {e}')
            print('')
        print(f'=== 榜单导入完成: 新导入 {imported_count} 张, 跳过 {skipped_count} 张 ===')
        return 0

    if not args:
        print(__doc__)
        return 1

    print(f'准备导入指定 {len(args)} 张卡片（广场：{"是" if with_plaza else "否"}，强制覆盖：{"是" if force else "否"}）\n')
    ok = 0
    for aid in args:
        print(f'=== 卡片 ID: {aid} ===')
        try:
            if import_one(aid, with_plaza=with_plaza, force=force):
                ok += 1
        except Exception as e:
            print(f'  [处理异常] {type(e).__name__}: {e}')
        print('')
    print(f'完成：成功 {ok} / {len(args)}')
    return 0 if ok == len(args) else 1


if __name__ == '__main__':
    sys.exit(main())
