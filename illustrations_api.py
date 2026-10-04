"""Private illustration files. Generation credentials never reach this store."""
import base64
import binascii
import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

MAX_IMAGE_BYTES = 16 * 1024 * 1024
MAX_BODY_BYTES = 23 * 1024 * 1024


def initialize(get_db):
    conn = get_db()
    try:
        conn.cursor().execute('''CREATE TABLE IF NOT EXISTS illustrations (
            id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(128) NOT NULL,
            mime VARCHAR(64) NOT NULL, metadata_json TEXT NOT NULL, created_at TEXT NOT NULL)''')
        conn.commit()
    finally:
        conn.close()


def image_mime(data):
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'image/png'
    if data.startswith(b'\xff\xd8\xff'):
        return 'image/jpeg'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return 'image/webp'
    raise ValueError('仅支持 PNG、JPEG、WebP 图片')


def handle(handler, get_db, authenticate, method, directory):
    path = urlparse(handler.path).path
    if path != '/api/illustrations' and not path.startswith('/api/illustrations/'):
        return False
    user = authenticate(handler.headers)
    if not user:
        handler.send_json({'error': '请登录后访问云端插图'}, 401)
        return True
    conn = None
    written = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        root = Path(directory).resolve()
        if method == 'POST' and path == '/api/illustrations':
            size = int(handler.headers.get('Content-Length', 0))
            if size <= 0 or size > MAX_BODY_BYTES:
                handler.send_json({'error': '图片请求过大'}, 413)
                return True
            value = json.loads(handler.rfile.read(size))
            if not isinstance(value, dict) or not isinstance(value.get('base64'), str):
                raise ValueError('缺少图片数据')
            data = base64.b64decode(value['base64'], validate=True)
            if not data or len(data) > MAX_IMAGE_BYTES:
                raise ValueError('单张图片需在 16 MB 以内')
            mime = image_mime(data)
            supplied = value.get('metadata')
            if not isinstance(supplied, dict):
                raise ValueError('缺少图片说明')
            meta = {}
            for key, limit in [('source', 128), ('conversationId', 128), ('deckId', 128), ('prompt', 12000), ('model', 200), ('size', 32), ('style', 1000), ('mode', 32)]:
                item = supplied.get(key, '')
                if not isinstance(item, str) or len(item) > limit:
                    raise ValueError('图片说明字段无效')
                meta[key] = item
            if not meta['source'] or not meta['prompt']:
                raise ValueError('图片缺少回复来源或绘图描述')
            ident = uuid.uuid4().hex
            stamp = datetime.now(timezone.utc).isoformat()
            root.mkdir(parents=True, exist_ok=True)
            written = root / ident
            with written.open('xb') as output:
                output.write(data)
            cursor.execute('INSERT INTO illustrations (id, user_id, mime, metadata_json, created_at) VALUES (?, ?, ?, ?, ?)',
                           (ident, user['id'], mime, json.dumps(meta, ensure_ascii=False), stamp))
            conn.commit()
            written = None
            handler.send_json({'id': ident, 'mime': mime, 'metadata': meta, 'createdAt': stamp})
        elif method == 'GET' and path == '/api/illustrations':
            cursor.execute('SELECT id, mime, metadata_json, created_at FROM illustrations WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', (user['id'],))
            handler.send_json([{'id': r['id'], 'mime': r['mime'], 'metadata': json.loads(r['metadata_json']), 'createdAt': r['created_at']} for r in cursor.fetchall()])
        elif method == 'GET':
            ident = path.rsplit('/', 1)[-1]
            if not re.fullmatch(r'[a-f0-9]{32}', ident):
                handler.send_json({'error': '图片不存在'}, 404)
                return True
            cursor.execute('SELECT mime FROM illustrations WHERE id = ? AND user_id = ?', (ident, user['id']))
            row = cursor.fetchone()
            if not row or not (root / ident).is_file():
                handler.send_json({'error': '图片不存在或无访问权限'}, 404)
                return True
            data = (root / ident).read_bytes()
            handler.send_response(200)
            handler.send_header('Content-Type', row['mime'])
            handler.send_header('Content-Length', str(len(data)))
            handler.send_header('Cache-Control', 'private, no-store')
            handler.send_header('X-Content-Type-Options', 'nosniff')
            handler.end_headers()
            handler.wfile.write(data)
        else:
            handler.send_json({'error': '不支持的操作'}, 405)
    except (ValueError, TypeError, KeyError, binascii.Error):
        handler.send_json({'error': '图片或说明格式无效'}, 400)
    except Exception:
        if conn:
            conn.rollback()
        handler.send_json({'error': '图片保存服务暂时不可用'}, 500)
    finally:
        if written:
            written.unlink(missing_ok=True)
        if conn:
            conn.close()
    return True
