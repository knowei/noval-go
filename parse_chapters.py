import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('guide_full_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
for i, line in enumerate(lines):
    line_s = line.strip()
    if re.search(r'^(第[一二三四五六七八九十0-9]+[章节卷篇]|【.+】|一、|二、|三、|四、|五、|六、|七、|八、|九、|###?\s+)', line_s):
        print(f'L{i}: {line_s[:80]}')
