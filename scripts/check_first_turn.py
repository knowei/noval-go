import db_engine, json

with db_engine.db.get_connection() as conn:
    cur = conn.cursor()
    cur.execute("SELECT id, title, first_turn_demo_json FROM stories WHERE id = %s", ("758e40b4-c1b3-4655-a83a-5ef136b60a2b",))
    r = cur.fetchone()
    if r:
        demo = json.loads(r["first_turn_demo_json"] or "{}")
        with open("scripts/first_turn.json", "w", encoding="utf-8") as f:
            json.dump(demo, f, ensure_ascii=False, indent=2)
        print("Wrote scripts/first_turn.json")
