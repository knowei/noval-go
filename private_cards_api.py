"""Account-owned cards with optimistic revisions and reversible deletion."""
import json
import re
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qs

MAX_BYTES = 12 * 1024 * 1024


def initialize(get_db):
    conn = get_db()
    try:
        conn.cursor().execute('''CREATE TABLE IF NOT EXISTS private_cards (
            user_id VARCHAR(128) NOT NULL, id VARCHAR(128) NOT NULL,
            deck_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
            deleted INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL,
            PRIMARY KEY (user_id, id))''')
        conn.commit()
    finally:
        conn.close()


def handle(handler, get_db, authenticate, method):
    parsed = urlparse(handler.path)
    if parsed.path != '/api/private-cards':
        return False
    user = authenticate(handler.headers)
    if not user:
        handler.send_json({'error': '请登录账号后使用云端角色卡'}, 401)
        return True
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        uid = user['id']  # Never trust a user_id from query/body.
        if method == 'GET':
            query = parse_qs(parsed.query)
            card_id = query.get('id', [''])[0]
            cursor.execute('SELECT id, deck_json, revision, deleted, updated_at FROM private_cards WHERE user_id = ?' + (' AND id = ?' if card_id else ''), (uid, card_id) if card_id else (uid,))
            result = []
            for row in cursor.fetchall():
                item = dict(row)
                item['deck'] = json.loads(item.pop('deck_json'))
                item['deleted'] = bool(item['deleted'])
                result.append(item)
            handler.send_json(result)
        elif method == 'POST':
            size = int(handler.headers.get('Content-Length', '0'))
            if size <= 0 or size > MAX_BYTES:
                handler.send_json({'error': '角色卡大小需在 12 MB 以内'}, 413)
                return True
            data = json.loads(handler.rfile.read(size))
            if not isinstance(data, dict):
                raise ValueError('请求内容必须为对象')
            card_id = data.get('id')
            if not isinstance(card_id, str) or not re.fullmatch(r'local_[a-zA-Z0-9_-]{1,110}', card_id):
                raise ValueError('角色卡 ID 格式无效')
            action = data.get('action', 'save')
            if action not in ('save', 'trash', 'restore'):
                raise ValueError('操作无效')
            revision = data.get('revision', 0)
            if type(revision) is not int or revision < 0:
                raise ValueError('版本号无效')
            cursor.execute('SELECT deck_json, revision, deleted FROM private_cards WHERE user_id = ? AND id = ?', (uid, card_id))
            row = cursor.fetchone()
            current = dict(row) if row else None
            if (current and current['revision'] != revision) or (not current and revision != 0):
                handler.send_json({'error': '云端已有更新，请先刷新并查看云端版本', 'conflict': True}, 409)
                return True
            if action != 'save' and not current:
                handler.send_json({'error': '角色卡不存在'}, 404)
                return True
            deck = data.get('deck') if action == 'save' else json.loads(current['deck_json'])
            if not isinstance(deck, dict) or deck.get('id') != card_id or not isinstance(deck.get('title'), str) or not deck['title'].strip():
                raise ValueError('角色卡缺少名称或 ID 不一致')
            stamp = datetime.now(timezone.utc).isoformat()
            encoded = json.dumps(deck, ensure_ascii=False)
            deleted = 1 if action == 'trash' else 0
            # Atomic compare-and-swap: two clients cannot both update a revision.
            if current:
                cursor.execute('UPDATE private_cards SET deck_json = ?, revision = revision + 1, deleted = ?, updated_at = ? WHERE user_id = ? AND id = ? AND revision = ?', (encoded, deleted, stamp, uid, card_id, revision))
                if cursor.rowcount != 1:
                    conn.rollback()
                    handler.send_json({'error': '版本冲突，请刷新后重试', 'conflict': True}, 409)
                    return True
            else:
                cursor.execute('INSERT INTO private_cards (user_id, id, deck_json, revision, deleted, updated_at) VALUES (?, ?, ?, 1, 0, ?) ON CONFLICT (user_id, id) DO NOTHING', (uid, card_id, encoded, stamp))
                if cursor.rowcount != 1:
                    conn.rollback()
                    handler.send_json({'error': '角色卡已存在，请刷新后重试', 'conflict': True}, 409)
                    return True
            conn.commit()
            handler.send_json({'id': card_id, 'deck': deck, 'revision': revision + 1, 'deleted': bool(deleted), 'updated_at': stamp})
        else:
            handler.send_json({'error': '不支持的操作'}, 405)
    except (ValueError, TypeError, KeyError) as error:
        handler.send_json({'error': str(error)}, 400)
    except Exception:
        if conn:
            conn.rollback()
        handler.send_json({'error': '角色卡服务暂时不可用，请稍后重试'}, 500)
    finally:
        if conn:
            conn.close()
    return True
