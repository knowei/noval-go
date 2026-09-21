import db_engine

with db_engine.db.get_connection() as conn:
    cur = conn.cursor()
    cur.execute("SELECT id, title, length(custom_css) as css_len, length(custom_html) as html_len, styles_json FROM stories WHERE id = %s", ("758e40b4-c1b3-4655-a83a-5ef136b60a2b",))
    r = cur.fetchone()
    if r:
        print("ROW:", dict(r))
    else:
        print("NOT FOUND")
