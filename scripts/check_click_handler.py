import sqlite3
import re

c = sqlite3.connect('noval_data.db').cursor()
c.execute("SELECT custom_html FROM stories WHERE id = 'e59fe31f-98c7-4b85-9f84-262f5d13bc32'")
h = c.fetchone()[0]

# Look for character-card click handlers in h
matches = re.findall(r'\.character-card\b[^\n]+', h)
print("Matches with character-card:")
for m in matches:
    print(" ", m)

# Find all occurrences of addEventListener('click' in h
for m in re.finditer(r'card\.addEventListener\([\'"]click[\'"],\s*function\([^)]*\)\s*\{(.+?)\}\);', h, re.S):
    print("Found card click handler:")
    print(m.group(1)[:400])
