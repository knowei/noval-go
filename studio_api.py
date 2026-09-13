"""Local story workbench storage. No model credentials are stored here."""
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from uuid import uuid4
from contextlib import contextmanager

ROOT = Path(__file__).resolve().parent


@contextmanager
def connection(connect):
    db = connect()
    try:
        with db:
            yield db
    finally:
        db.close()


def initialize(connect):
    with connection(connect) as db:
        db.execute('CREATE TABLE IF NOT EXISTS studio_decks (id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS studio_saves (id TEXT PRIMARY KEY, deck_id TEXT NOT NULL, payload TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)')
        seed = json.loads((ROOT / 'studio' / 'slime.json').read_text(encoding='utf-8'))
        db.execute('INSERT OR IGNORE INTO studio_decks VALUES (?, ?)', (seed['id'], json.dumps(seed, ensure_ascii=False)))


def handle(handler, connect, method):
    parsed = urlparse(handler.path)
    if not parsed.path.startswith('/api/studio/'):
        return False
    try:
        resource = parsed.path.removeprefix('/api/studio/')
        if resource not in ('decks', 'saves'):
            handler.send_json({'error': '接口不存在'}, 404)
            return True
        table = 'studio_' + resource
        if method == 'GET':
            params = parse_qs(parsed.query)
            with connection(connect) as db:
                if params.get('id'):
                    row = db.execute(f'SELECT payload FROM {table} WHERE id=?', (params['id'][0],)).fetchone()
                    handler.send_json(json.loads(row[0]) if row else {'error': '记录不存在'}, 200 if row else 404)
                else:
                    rows = db.execute(f'SELECT payload FROM {table}' + (' ORDER BY updated_at DESC' if resource == 'saves' else '')).fetchall()
                    handler.send_json([json.loads(row[0]) for row in rows])
        elif method == 'POST':
            size = int(handler.headers.get('Content-Length', '0'))
            if not 0 < size <= 2_000_000:
                raise ValueError('内容为空或超过 2 MB')
            body = json.loads(handler.rfile.read(size).decode('utf-8'))
            if not isinstance(body, dict):
                raise ValueError('内容必须是对象')
            record_id = body.setdefault('id', str(uuid4()))
            if not isinstance(record_id, str) or not 1 <= len(record_id) <= 100:
                raise ValueError('记录 ID 无效')
            if resource == 'decks':
                if not isinstance(body.get('title'), str) or not body['title'].strip():
                    raise ValueError('请填写剧本名称')
                if not isinstance(body.get('prompt'), str) or not isinstance(body.get('worldbook', []), list):
                    raise ValueError('提示词或世界书格式不正确')
                opening = body.get('opening')
                if not isinstance(opening, dict) or not isinstance(opening.get('story'), str) or not isinstance(opening.get('state'), dict):
                    raise ValueError('剧本需要有效的开场白和初始状态')
                for entry in body.get('worldbook', []):
                    if not isinstance(entry, dict) or not isinstance(entry.get('keys'), list) or not all(isinstance(k, str) for k in entry['keys']) or not isinstance(entry.get('content'), str):
                        raise ValueError('世界书条目需要 keys 数组和 content 文本')
                    if not isinstance(entry.get('depth', 4), int) or not 1 <= entry.get('depth', 4) <= 20:
                        raise ValueError('扫描深度应为 1–20')
                with connection(connect) as db:
                    db.execute('INSERT INTO studio_decks VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', (record_id, json.dumps(body, ensure_ascii=False)))
            else:
                if not isinstance(body.get('messages'), list) or not isinstance(body.get('deck_id'), str):
                    raise ValueError('存档格式不正确')
                with connection(connect) as db:
                    db.execute('INSERT INTO studio_saves(id,deck_id,payload) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=CURRENT_TIMESTAMP', (record_id, body['deck_id'], json.dumps(body, ensure_ascii=False)))
            handler.send_json({'id': record_id, 'success': True})
        else:
            handler.send_json({'error': '不支持此操作'}, 405)
    except (ValueError, UnicodeError) as error:
        handler.send_json({'error': str(error)}, 400)
    except Exception:
        handler.send_json({'error': '保存服务暂时不可用，请重试'}, 500)
    return True
