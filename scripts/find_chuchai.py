import sqlite3

conn = sqlite3.connect('noval_data.db')
c = conn.cursor()

print("--- Searching stories ---")
c.execute("SELECT id, title FROM stories WHERE title LIKE '%出差%' OR handbook_json LIKE '%出差%'")
for r in c.fetchall():
    print("Story:", r[0], ascii(r[1]))

print("\n--- Searching conversations ---")
c.execute("SELECT id, user_id, deck_id, deck_title, title, turn_count FROM conversations WHERE deck_title LIKE '%出差%' OR title LIKE '%出差%' OR history_json LIKE '%出差%'")
for r in c.fetchall():
    print("Conv:", r[0], r[1], r[2], ascii(r[3]), ascii(r[4]), r[5])

print("\n--- All conversations for knowei (user_efd31e971fe5) ---")
c.execute("SELECT id, user_id, deck_id, deck_title, title, turn_count FROM conversations WHERE user_id='user_efd31e971fe5'")
for r in c.fetchall():
    print("User Conv:", r[0], r[1], r[2], ascii(r[3]), ascii(r[4]), r[5])

print("\n--- All users in DB ---")
c.execute("SELECT id, username, nickname FROM users")
for r in c.fetchall():
    print("User:", r[0], ascii(r[1]), ascii(r[2]))

print("\n--- All conversations in DB ---")
c.execute("SELECT id, user_id, deck_id, deck_title, turn_count FROM conversations")
for r in c.fetchall():
    print("All Conv:", r[0], r[1], r[2], ascii(r[3]), r[4])
