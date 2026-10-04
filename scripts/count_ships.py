import re

path = r'C:\Users\zheng\.gemini\antigravity\brain\a04cec19-81b5-48a6-934e-03395fa64973\.system_generated\steps\15110\content.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

print("File length:", len(text))
# Check if there are table rows or links or ship names
links = re.findall(r'<a\s+[^>]*href="(/blhx/[^"]+)"[^>]*>([^<]+)</a>', text)
print("Found links with text:", len(links))
for href, name in links[:30]:
    print(href, "->", name)

