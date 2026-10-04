import io
import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import private_cards_api as api


class Handler:
    def __init__(self, path, token, body):
        self.path = path
        encoded = json.dumps(body or {}).encode()
        self.headers = {'Authorization': token, 'Content-Length': str(len(encoded))}
        self.rfile = io.BytesIO(encoded)

    def send_json(self, value, status=200):
        self.result, self.status = value, status


class PrivateCardsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='noval-cards-test-')
        self.path = str(Path(self.temp.name) / 'test.db')
        api.initialize(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def db(self):
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    def request(self, method='GET', body=None, token='a', path='/api/private-cards'):
        h = Handler(path, token, body)
        handled = api.handle(h, self.db, lambda headers: {'id': headers['Authorization']} if headers['Authorization'] in ('a', 'b') else None, method)
        self.assertTrue(handled)
        return h.status, h.result

    def save(self, **extra):
        body = {'id': 'local_lighthouse', 'revision': 0, 'deck': {'id': 'local_lighthouse', 'title': '灯塔', 'sessionDefaults': {'pace': 'slow'}}}
        body.update(extra)
        return self.request('POST', body)

    def test_requires_account_and_does_not_trust_requested_user(self):
        self.assertEqual(self.request(token='guest')[0], 401)
        self.assertEqual(self.save(user_id='b')[0], 200)
        self.assertEqual(len(self.request(path='/api/private-cards?user_id=b')[1]), 1)
        self.assertEqual(self.request(token='b', path='/api/private-cards?id=local_lighthouse')[1], [])
        status, result = self.save(revision=1, token='b')  # token in JSON cannot alter authenticated identity.
        self.assertEqual(status, 200)
        self.assertEqual(result['revision'], 2)

    def test_revisions_reject_stale_updates_and_trash_is_recoverable(self):
        self.assertEqual(self.save()[1]['revision'], 1)
        self.assertEqual(self.save()[0], 409)
        self.assertEqual(self.save(revision=1)[1]['revision'], 2)
        status, item = self.request('POST', {'id': 'local_lighthouse', 'action': 'trash', 'revision': 2})
        self.assertEqual(status, 200)
        self.assertTrue(item['deleted'])
        self.assertEqual(item['deck']['sessionDefaults']['pace'], 'slow')
        self.assertEqual(self.request('POST', {'id':'local_lighthouse','action':'restore','revision':2})[0], 409)
        self.assertFalse(self.request('POST', {'id':'local_lighthouse','action':'restore','revision':3})[1]['deleted'])

    def test_card_id_is_scoped_by_account(self):
        self.save()
        status, item = self.request('POST', {'id':'local_lighthouse','revision':0,'deck':{'id':'local_lighthouse','title':'另一个账号'}}, token='b')
        self.assertEqual(status, 200)
        self.assertEqual(self.request(token='a')[1][0]['deck']['title'], '灯塔')
        self.assertEqual(self.request(token='b')[1][0]['deck']['title'], '另一个账号')

    def test_invalid_payload_and_oversized_input(self):
        self.assertEqual(self.save(id='../secret')[0], 400)
        self.assertEqual(self.save(revision=-1)[0], 400)
        self.assertEqual(self.save(deck={'id':'local_wrong','title':'bad'})[0], 400)
        h=Handler('/api/private-cards', 'a', {})
        h.headers['Content-Length']=str(api.MAX_BYTES+1)
        api.handle(h,self.db,lambda _: {'id':'a'},'POST')
        self.assertEqual(h.status,413)

    def test_empty_revision_does_not_recreate_deleted_data(self):
        self.save()
        self.request('POST', {'id':'local_lighthouse','action':'trash','revision':1})
        self.assertEqual(self.save()[0],409)
        self.assertTrue(self.request()[1][0]['deleted'])


if __name__ == '__main__':
    unittest.main()
