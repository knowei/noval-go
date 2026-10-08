import sys
sys.path.insert(0, '.')
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
import db_engine, json, re

conn = db_engine.db.get_connection()
cur = conn.cursor()
cur.execute("""
SELECT id, title, custom_html, lorebook_json, system_prompt
FROM stories
WHERE custom_html IS NOT NULL AND custom_html != ''
  AND (lorebook_json IS NULL OR lorebook_json = '[]' OR lorebook_json = '')
  AND (system_prompt IS NULL OR system_prompt = '')
""")
rows = cur.fetchall()

seen_titles = set()
unique_cards = []
for r in rows:
    title = r['title']
    if title in seen_titles:
        continue
    seen_titles.add(title)
    html = r['custom_html']
    rules_detected = []
    if any(k in html for k in ['GameOver', 'gameover', '游戏结束', '结局', '打出']):
        rules_detected.append('GameOver/死局结局')
    if any(k in html for k in ['数值防线', '防线', '好感', '服从', '屈服', '警戒', '依赖']):
        rules_detected.append('数值防线/好感度/服从度')
    if any(k in html for k in ['惩罚', '报警', '死刑', '自残', '天降正义', '抓伤']):
        rules_detected.append('严苛惩罚/报警死局')
    if any(k in html for k in ['世界书', '设定', '词条']):
        rules_detected.append('世界书背景设定')
    if any(k in html for k in ['状态栏', '状态', '面板', 'HUD', '数据']):
        rules_detected.append('专属状态栏/面板')
    if any(k in html for k in ['CG', '立绘', '图库', '原画']):
        rules_detected.append('CG立绘触发')

    text_clean = re.sub(r'<[^<]+?>', ' ', html)
    text_clean = ' '.join(text_clean.split())
    
    snippet = ''
    for kw in ['防线', 'GameOver', 'gameover', '警告', '注意', '规约', '玩法', '规则', '惩罚']:
        idx = text_clean.find(kw)
        if idx != -1:
            snippet = text_clean[max(0, idx-10):min(len(text_clean), idx+90)]
            break

    unique_cards.append({
        'id': r['id'],
        'title': title,
        'rules': rules_detected,
        'snippet': snippet,
        'html_len': len(html)
    })

print(f"检测到 {len(unique_cards)} 部卡片的 HTML 描述中包含规则/防线/GameOver设定，但未转化为系统的 Lorebook 与 System Prompt：\n")
for idx, c in enumerate(unique_cards):
    rule_str = ', '.join(c['rules']) if c['rules'] else '普通HTML排版'
    print(f"{idx+1}. 【{c['title']}】")
    print(f"   - 卡片ID: {c['id']}")
    print(f"   - HTML长度: {c['html_len']} 字符")
    print(f"   - 包含的机制特性: {rule_str}")
    if c['snippet']:
        print(f"   - 规则核心摘要: \"...{c['snippet']}...\"")
    print()
