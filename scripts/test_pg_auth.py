import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

conn = db_engine.db.get_connection()
c = conn.cursor()
try:
    c.execute("SELECT id FROM users WHERE auth_token = ? AND auth_token != ''", ('test',))
    print("Single quotes query succeeded!")
except Exception as e:
    print("Single quotes failed:", e)

try:
    c.execute('SELECT id FROM users WHERE auth_token = ? AND auth_token != ""', ('test',))
    print("Double quotes query succeeded!")
except Exception as e:
    print("Double quotes failed:", e)

conn.close()
