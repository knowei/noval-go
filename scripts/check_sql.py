with open('init_postgres.sql', 'r', encoding='utf-8') as f:
    text = f.read()

# Old schema column limits from git history:
# users: id(64), username(64), password_hash(128), nickname(128), avatar(64), auth_token(128)
# conversations: id(64), user_id(64), deck_id(64), deck_title(255), title(255)
# stories: id(64), title(255), badge(64), cover_icon(64), cover_title(255), logo(64), theme_color(32), btn_gradient(128), category(64)
# plaza_cards: id(64), deck_id(64), title(255), badge(64), badge_color(64), author(128), rating(16), heat(32), image_tag(64), badge_type(32), category(64)
# system_notices: id(64), notice_type(32), title(255)

# Wait! Did any column have VARCHAR(32)?
# 1. stories.theme_color (32)
# 2. plaza_cards.heat (32)
# 3. plaza_cards.badge_type (32)
# 4. system_notices.notice_type (32)
# Wait, what else could be VARCHAR(32)?
# What about plaza_cards.category? In old schema was it 32?
# What about stories.badge?
# What about stories.theme_color?

# Let's check all statements and print any values with length > 32 for columns that could be 32!
import re

lines = text.splitlines()
print(f"Total lines: {len(lines)}")

for i, line in enumerate(lines):
    if line.startswith("INSERT INTO stories"):
        # match columns
        m = re.search(r"INSERT INTO stories \((.*?)\) VALUES", line)
        if m:
            cols = [c.strip().strip('"') for c in m.group(1).split(',')]
            # let's find theme_color
            # theme_color index:
            if 'theme_color' in cols:
                idx = cols.index('theme_color')
                # extract values
                # let's find the string in quotes
                pass
