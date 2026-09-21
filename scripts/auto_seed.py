import os
import sys
import re

# Add project root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

import db_engine

def auto_seed():
    print("[Noval-Go] Checking database records...")
    with db_engine.db.get_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT count(*) FROM plaza_cards")
            row = cur.fetchone()
            card_count = row[0] if row else 0
        except Exception:
            card_count = 0

        try:
            cur.execute("SELECT count(*) FROM stories")
            row = cur.fetchone()
            story_count = row[0] if row else 0
        except Exception:
            story_count = 0

        print(f"[Noval-Go] Current status: {story_count} stories, {card_count} plaza cards in DB.")

        if card_count > 0 and story_count > 0:
            print("[Noval-Go] Database already has stories and cards. No seeding needed.")
            return

        print("[Noval-Go] Database is empty! Auto-seeding from init_postgres.sql...")
        sql_path = os.path.join(BASE_DIR, 'init_postgres.sql')
        if not os.path.exists(sql_path):
            print(f"[Noval-Go Error] Seed file not found at: {sql_path}")
            return

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

        success = 0
        errors = 0
        for stmt in statements:
            cleaned = re.sub(r'--[^\n]*\n', '', stmt).strip()
            if not cleaned:
                continue
            try:
                cur.execute(cleaned)
                success += 1
            except Exception as e:
                errors += 1
                if errors <= 3:
                    print(f"[Warning] Statement notice: {e}")

        conn.commit()
        print(f"[Noval-Go] Seeding completed: {success} executed, {errors} skipped.")

        cur.execute("SELECT count(*) FROM stories")
        new_stories = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM plaza_cards")
        new_cards = cur.fetchone()[0]
        print(f"[Noval-Go] Database now ready: {new_stories} stories, {new_cards} plaza cards!")

if __name__ == '__main__':
    auto_seed()
