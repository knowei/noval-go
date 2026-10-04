import base64
import io
import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import illustrations_api as api


class Handler:
    def __init__(self, path, token, body):
        self.path = path
        encoded = json.dumps(body or {}).encode()
        self.headers = {'Authorization': token, 'Content-Length': str(len(encoded))}
        self.rfile, self.wfile = io.BytesIO(encoded), io.BytesIO()
        self.response_headers = {}

    def send_json(self, value, status=200):
        self.result, self.status = value, status

    def send_response(self, status):
        self.status = status

    def send_header(self, key, value):
        self.response_headers[key] = value

    def end_headers(self):
        pass


class IllustrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='noval-images-test-')
        self.root = Path(self.temp.name)
        api.initialize(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def db(self):
        conn = sqlite3.connect(self.root / 'test.db')
        conn.row_factory = sqlite3.Row
        return conn

    def request(self, method='GET', body=None, token='a', suffix=''):
        h = Handler('/api/illustrations' + suffix, token, body)
        api.handle(h, self.db, lambda headers: {'id': headers['Authorization']} if headers['Authorization'] in ('a', 'b') else None, method, self.root / 'images')
        return h

    def payload(self):
        return {'base64': base64.b64encode(b'\xff\xd8\xffexample').decode(),
                'user_id': 'b', 'metadata': {'source': 'reply-one', 'prompt': 'A lighthouse', 'apiKey': 'must-not-store'}}

    def test_private_round_trip_and_metadata_allowlist(self):
        saved = self.request('POST', self.payload())
        self.assertEqual(saved.status, 200)
        self.assertNotIn('apiKey', saved.result['metadata'])
        ident = saved.result['id']
        self.assertEqual(len(self.request().result), 1)
        self.assertEqual(self.request(token='b').result, [])
        self.assertEqual(self.request(token='b', suffix='/' + ident).status, 404)
        self.assertEqual(self.request(token='guest', suffix='/' + ident).status, 401)
        image = self.request(suffix='/' + ident)
        self.assertEqual(image.wfile.getvalue(), b'\xff\xd8\xffexample')
        self.assertEqual(image.response_headers['Content-Type'], 'image/jpeg')
        self.assertEqual(image.response_headers['Cache-Control'], 'private, no-store')

    def test_rejects_bad_payloads_and_path_traversal(self):
        for data in ['not-base64', base64.b64encode(b'<svg/>').decode()]:
            body = self.payload()
            body['base64'] = data
            self.assertEqual(self.request('POST', body).status, 400)
        body = self.payload()
        body['metadata']['source'] = ''
        self.assertEqual(self.request('POST', body).status, 400)
        self.assertEqual(self.request(suffix='/../../test.db').status, 404)
        self.assertEqual(self.request('POST', self.payload(), token='guest').status, 401)
        self.assertEqual(self.request().result, [])

    def test_size_limit_rejected_before_reading_body(self):
        h = Handler('/api/illustrations', 'a', {})
        h.headers['Content-Length'] = str(api.MAX_BODY_BYTES + 1)
        api.handle(h, self.db, lambda _: {'id': 'a'}, 'POST', self.root / 'images')
        self.assertEqual(h.status, 413)
        self.assertEqual(h.rfile.tell(), 0)


if __name__ == '__main__':
    unittest.main()
