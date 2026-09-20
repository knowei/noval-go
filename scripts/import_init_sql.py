import os
import sys
import re
import pg8000.native

def import_sql():
    print("Resetting noval_db in PostgreSQL...")
    admin_conn = pg8000.native.Connection(
        user='postgres',
        password='123456',
        host='127.0.0.1',
        port=5432,
        database='postgres'
    )
    try:
        admin_conn.run("DROP DATABASE IF EXISTS noval_db WITH (FORCE);")
    except Exception:
        pass
    admin_conn.run("CREATE DATABASE noval_db;")
    admin_conn.close()
    print("Clean noval_db database created.")

    print("Connecting to 127.0.0.1:5432/noval_db...")
    conn = pg8000.native.Connection(
        user='postgres',
        password='123456',
        host='127.0.0.1',
        port=5432,
        database='noval_db'
    )

    sql_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'init_postgres.sql')
    with open(sql_path, 'r', encoding='utf-8') as f:
        content = f.read()

    statements = []
    current = []
    in_string = False
    i = 0
    length = len(content)
    while i < length:
        c = content[i]
        if c == "'":
            if in_string:
                if i + 1 < length and content[i+1] == "'":
                    current.append("''")
                    i += 2
                    continue
                else:
                    in_string = False
            else:
                in_string = True
            current.append(c)
        elif c == ';' and not in_string:
            stmt = ''.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
        else:
            current.append(c)
        i += 1

    if current:
        stmt = ''.join(current).strip()
        if stmt:
            statements.append(stmt)

    print(f"Total parsed SQL statements: {len(statements)}")

    success = 0
    errors = 0
    for idx, stmt in enumerate(statements):
        cleaned = re.sub(r'--[^\n]*\n', '', stmt).strip()
        if not cleaned:
            continue
        try:
            conn.run(stmt)
            success += 1
        except Exception as e:
            print(f"Error on statement #{idx}: {e}")
            errors += 1

    print(f"Done! {success} statements executed successfully, {errors} errors.")

    stories = conn.run("SELECT count(*) FROM stories;")[0][0]
    cards = conn.run("SELECT count(*) FROM plaza_cards;")[0][0]
    users = conn.run("SELECT count(*) FROM users;")[0][0]
    convs = conn.run("SELECT count(*) FROM conversations;")[0][0]
    notices = conn.run("SELECT count(*) FROM system_notices;")[0][0]
    print(f"Stories in DB: {stories}")
    print(f"Plaza cards in DB: {cards}")
    print(f"Users in DB: {users}")
    print(f"Conversations in DB: {convs}")
    print(f"System notices in DB: {notices}")

    conn.close()

if __name__ == '__main__':
    import_sql()
