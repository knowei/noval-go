import os
import sys
import sqlite3

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
import db_engine

def cleanup():
    # 1. PostgreSQL
    conn = db_engine.db.get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM conversations WHERE title LIKE '%场景开局%'")
    conn.commit()
    conn.close()

    # 2. SQLite
    db_file = os.path.join(ROOT_DIR, 'noval_data.db')
    if os.path.exists(db_file):
        s_conn = sqlite3.connect(db_file)
        sc = s_conn.cursor()
        sc.execute("DELETE FROM conversations WHERE title LIKE '%场景开局%'")
        s_conn.commit()
        s_conn.close()

    print("Cleaned up dummy placeholder saves from database.")

if __name__ == '__main__':
    cleanup()
