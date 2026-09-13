"""Isolated tests: no live database or external model is used."""
import copy
import json
import sqlite3
import tempfile
import threading
import unittest
import urllib.request
import urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer
import server
import studio_api


class StudioTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.previous_db = server.DB_FILE
        server.DB_FILE = str(Path(cls.temp.name) / 'test.db')
        studio_api.initialize(server.get_db)
        cls.http = ThreadingHTTPServer(('127.0.0.1', 0), server.ProxyHandler)
        cls.thread = threading.Thread(target=cls.http.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = 'http://127.0.0.1:' + str(cls.http.server_port)

    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown()
        cls.http.server_close()
        cls.thread.join()
        server.DB_FILE = cls.previous_db
        cls.temp.cleanup()

    def request(self, route, data=None):
        payload = json.dumps(data).encode() if data is not None else None
        req = urllib.request.Request(self.url + '/api/studio/' + route, data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            return json.load(response)

    def test_seed_edit_survives_restart(self):
        deck = self.request('decks?id=slime-forest')
        deck['title'] = 'Edited title'
        self.request('decks', deck)
        studio_api.initialize(server.get_db)
        self.assertEqual(self.request('decks?id=slime-forest')['title'], 'Edited title')

    def test_save_roundtrip_and_update(self):
        record = {'id': 'save-test', 'deck_id': 'slime-forest', 'messages': [{'role': 'user', 'text': '<script>test</script>'}], 'character': {'name': '测试'}}
        self.request('saves', record)
        self.assertEqual(self.request('saves?id=save-test'), record)
        record['messages'].append({'role': 'user', 'text': 'next'})
        self.request('saves', record)
        self.assertEqual(len(self.request('saves?id=save-test')['messages']), 2)

    def test_invalid_worldbook_rejected(self):
        deck = self.request('decks?id=slime-forest')
        deck['worldbook'] = [{'keys': 'wrong', 'content': 'text'}]
        with self.assertRaises(urllib.error.HTTPError) as error:
            self.request('decks', deck)
        self.assertEqual(error.exception.code, 400)

    def test_static_workbench(self):
        for path in ['/studio/', '/studio/app.js', '/studio/engine.js', '/studio/style.css', '/studio/intro.html']:
            with urllib.request.urlopen(self.url + path) as response:
                self.assertEqual(response.status, 200)


if __name__ == '__main__':
    unittest.main()
