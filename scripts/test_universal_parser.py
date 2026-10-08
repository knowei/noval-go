import re

text = """己的嗓音听起来轻柔自然，时刻牢记自己现在的身份是一个“风趣幽默的漂亮女生”。【404女生宿舍状态面板】当前时间：开学报到日，下午 主角状态：极度紧张，正被苏小可抱住胳膊 暴露风险：15%（肢体接触引发的生理反应预警！）室友位置：- 苏小可：挂在你胳膊上贴贴 - 叶芷柔：在自己书桌前看书 - 凌玥：下楼拿快递（暂未出现）【室友当前好感度】苏小可：50%（对你的颜值极度惊艳，充满好感）叶芷柔：20%（友善的初见）凌玥：0%（未见面）"""

status_pat = re.compile(
    r'(\s*(?:<[a-zA-Z0-9_-]*status[a-zA-Z0-9_-]*>[\s\S]*?(?:<\/[a-zA-Z0-9_-]*status[a-zA-Z0-9_-]*>|$)|【[^】]*(?:状态|面板|监控|属性|数值|好感)[^】]*】[\s\S]*$))',
    re.I
)

m = status_pat.search(text)
if m:
    status_block = m.group(1).strip()
    clean_prose = text[:m.start()].strip()
    print("MATCH SUCCESS!")
    print("Status block:\n", status_block)
    print("\nClean prose:\n", clean_prose)
    
    # Parse numbers / progress bars from status_block
    num_pat = re.compile(r'([^\s:：\[【\(\)]+)\s*[:：]\s*(\d+)%?(?:\s*\/(\d+))?(?:\s*[（(]([^）)]+)[）)])?')
    print("\nExtracted Metrics:")
    for nm in num_pat.finditer(status_block):
        key = nm.group(1).strip()
        val = nm.group(2)
        max_val = nm.group(3) or '100'
        desc = nm.group(4) or ''
        if key not in ('当前时间', '主角状态', '室友位置', '暂未出现'):
            print(f"  - {key}: {val}/{max_val} ({desc})")
else:
    print("NO MATCH")
