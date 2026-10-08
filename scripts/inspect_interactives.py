import sqlite3
import re

c = sqlite3.connect('noval_data.db').cursor()
c.execute("SELECT custom_html FROM stories WHERE id = 'e59fe31f-98c7-4b85-9f84-262f5d13bc32'")
h = c.fetchone()[0]

print("Clickable elements in JS:")
for m in re.finditer(r'([a-zA-Z0-9_\.\$\(\)\'\"\[\]]+)\.addEventListener\([\'"]click[\'"]', h):
    print(" ", m.group(1))

# Check collapsible triggers, tabs, etc.
triggers = re.findall(r'class="([^"]*trigger[^"]*)"', h)
print("Triggers:", set(triggers))

tabs = re.findall(r'class="([^"]*tab[^"]*)"', h)
print("Tabs:", set(tabs))
