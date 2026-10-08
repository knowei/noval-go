import re

with open(r'C:\Users\zheng\.gemini\antigravity\brain\a04cec19-81b5-48a6-934e-03395fa64973\.system_generated\steps\20625\content.md', 'r', encoding='utf-8') as f:
    text = f.read()

uuids = set(re.findall(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', text))
print(f'Total UUIDs found: {len(uuids)}')

# Search for chinese text near UUIDs or app names
apps_found = []
for m in re.finditer(r'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', text):
    start = max(0, m.start() - 200)
    end = min(len(text), m.end() + 200)
    context = text[start:end]
    # Check if there are app names
    apps_found.append((m.group(1), context))

print(f'Apps found: {len(apps_found)}')
for uid, ctx in apps_found[:15]:
    # Clean up context
    clean_ctx = re.sub(r'<[^>]+>', ' ', ctx).replace('\\"', '"').replace('\n', ' ')
    print(f'ID: {uid} | Context: {clean_ctx[:120]}')
