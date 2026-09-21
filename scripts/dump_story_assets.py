import db_engine

with db_engine.db.get_connection() as conn:
    cur = conn.cursor()
    cur.execute("SELECT custom_html, custom_css FROM stories WHERE id = %s", ("758e40b4-c1b3-4655-a83a-5ef136b60a2b",))
    r = cur.fetchone()
    if r:
        with open("scripts/story_html.html", "w", encoding="utf-8") as f:
            f.write(r["custom_html"] or "")
        with open("scripts/story_css.css", "w", encoding="utf-8") as f:
            f.write(r["custom_css"] or "")
        print("Successfully dumped custom_html and custom_css")
    else:
        print("Not found")
