import json
import os
import sys
import re
import urllib.parse
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

import db_engine
import sqlite3

CARD_JSON_PATH = os.path.join(ROOT_DIR, 'cards', 'e59fe31f-98c7-4b85-9f84-262f5d13bc32.json')
with open(CARD_JSON_PATH, 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

apps = raw_data['data']['apps']
aid = 'e59fe31f-98c7-4b85-9f84-262f5d13bc32'
alias = 'deck_girls_dormitory'
title = '💕长得太清秀，被迫入住大学女生宿舍！'
now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

raw_html = apps.get('description', '')

# --- 真实高画质本地立绘路径 ---
char_avatars = {
    'suxiaoke': '/assets/cards/girls_dormitory/suxiaoke.png',
    'lingyue': '/assets/cards/girls_dormitory/lingyue.jpg',
    'yezhirou': '/assets/cards/girls_dormitory/yezhirou.jpg',
    'xiaqiange': '/assets/cards/girls_dormitory/xiaqiange.jpg'
}

# --- 生成精致 SVG 矢量兜底立绘 (当本地图片异常时的备用) ---
def make_svg_avatar(char_char, bg1, bg2, border_color):
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g_{char_char}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="47" fill="url(#g_{char_char})" stroke="{border_color}" stroke-width="3"/>
  <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">{char_char}</text>
</svg>"""
    return "data:image/svg+xml;utf8," + urllib.parse.quote(svg)

svg_avatars = {
    'suxiaoke': make_svg_avatar('可', '#f43f5e', '#fb7185', '#fda4af'),
    'lingyue': make_svg_avatar('玥', '#7c3aed', '#6366f1', '#a5b4fc'),
    'yezhirou': make_svg_avatar('柔', '#9333ea', '#c084fc', '#e9d5ff'),
    'xiaqiange': make_svg_avatar('歌', '#db2777', '#f472b6', '#fbcfe8')
}

# 1. 替换 HTML 中的卡片立绘为真实图片，并添加 onerror 自动切换 SVG 兜底
for k in char_avatars.keys():
    real_img = char_avatars[k]
    fallback_svg = svg_avatars[k]
    pattern = rf'(<div class="character-card" data-character="{k}">\s*<div class="avatar">)<img src="[^"]+"(\s*alt="[^"]*"></div>)'
    replacement = rf'\1<img src="{real_img}" onerror="this.onerror=null; this.src=\'{fallback_svg}\';" \2'
    raw_html = re.sub(pattern, replacement, raw_html)

# 2. 将 body 背景由失效图床改为完全透明，让父级舞台的沉浸式星空渐变背景无缝穿透填满全屏
raw_html = re.sub(
    r'body\s*\{[^}]*background-image:[^}]*\}',
    """body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    color: var(--light);
    min-height: 100vh;
    padding: 16px;
    line-height: 1.7;
    overflow-x: hidden;
    background: transparent !important;
}""",
    raw_html
)

# 3. 增强 JS 中的 playSound / initAudio：彻底加上 try/catch 防止沙箱 iframe 拦截 WebAudio 导致整个点击逻辑崩溃
patched_sound_js = """
// ============ Sound System (Protected) ============
let audioCtx = null;
function initAudio() {
    try {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioCtx();
        }
    } catch(e) {
        audioCtx = null;
    }
}

function playSound(type) {
    try {
        if (!audioCtx) initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        switch(type) {
            case 'click':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'toggle':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.08);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                oscillator.start(now);
                oscillator.stop(now + 0.12);
                break;
            case 'open':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
            case 'close':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);
                gainNode.gain.setValueAtTime(0.08, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
            case 'success':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, now);
                oscillator.frequency.setValueAtTime(659, now + 0.08);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                oscillator.start(now);
                oscillator.stop(now + 0.2);
                break;
        }
    } catch(e) {}
}
"""

raw_html = re.sub(r'// ============ Sound System ============.*?function createParticles\(\)', patched_sound_js + '\nfunction createParticles()', raw_html, flags=re.S)

# 4. 修复 createParticles null 检查
raw_html = raw_html.replace(
    "function createParticles() {\n    const container = document.getElementById('particles');",
    "function createParticles() {\n    const container = document.getElementById('particles');\n    if (!container) return;"
)

# 5. 更新 characterData 为真实立绘，并挂载到 window.characterData 上
char_data_replacement = f"""
// ============ Character Data (Updated Real Avatars) ============
const characterData = {{
    'suxiaoke': {{
        name: '苏小可',
        tag: '元气腹黑少女',
        avatar: '{char_avatars['suxiaoke']}',
        description: `<p>🌸留着双丸子头的元气少女，可爱调皮，有点腹黑，喜欢恶作剧。</p><p>🌸身材娇小，胸部只有b罩杯，遇到同样平胸的女生会天生带有好感。</p><p>🌸性格外向自来熟，喜欢和人贴贴，经常邀请女生一起洗澡、上厕所、睡觉。</p>`,
        reaction: `<p>❤️在高好感度(61%-100%)时被她发现你的性别，她会感觉有趣，会帮你隐瞒甚至出谋划策。</p><p>🖤在低好感度(0%-60%)时被她发现你的性别，她会将你的秘密作为把柄，以此威胁你陪她进行各种危险或刺激的游戏，让你对她言听计从。</p>`
    }},
    'lingyue': {{
        name: '凌玥',
        tag: '高冷御姐',
        avatar: '{char_avatars['lingyue']}',
        description: `<p>🌸肤白貌美大长腿，前凸后翘小蛮腰，身高高挑，身材火辣，D罩杯，御姐气质。有时会穿性感黑丝包臀裙。</p><p>🌸表情变化少，微笑时仅嘴角微勾。性格高冷，话少有主见。下意识带有社会人气质（如双手插兜），极其聪明，能敏锐观察细节。</p><p>🌸在高中时是叛逆的大姐大，跆拳道黑带，抽烟喝酒鬼混，曾经将调戏过她的教练打成骨折。随后改过自新发奋读书，考上心仪的大学，但仍然带有社会人气质。</p><p>🌸有过一个混混前男友，但仍然是处女，混混前男友经常打电话和发短信骚扰她</p>`,
        reaction: `<p>❤️在高好感度(61%-100%)时被她发现你的性别，会懒得多管闲事，不会主动透露出去，但会警告你懂得分寸。</p><p>🖤在低好感度(0%-60%)时被她发现你的性别，会以威胁姿态逼问你原因，甚至可能把你揍进ICU病房。</p>`
    }},
    'yezhirou': {{
        name: '叶芷柔',
        tag: '温柔校花',
        avatar: '{char_avatars['yezhirou']}',
        description: `<p>🌸 出身书香门第，父母都是教师，从小被教导知书达理、举止端庄。黑长直发，容貌清丽绝俗，气质恬静温婉，是高中时代公认的校花。</p><p>🌸 言行温柔体贴，性格善良，不太会拒绝别人——即便自己并不富裕，也依然会对需要帮助的人伸出援手。</p><p>🌸 有一位青梅竹马的男友陈子诚，在另一座城市的大学就读，两人保持着甜蜜的异地恋情。</p>`,
        reaction: `<p>❤️ 好感度高时 (61%-100%)：会非常认真地与你谈心，尝试理解你的难处并真诚地提供帮助，主动安慰你、为你出主意。</p><p>🖤 好感度低时 (0%-60%)：会陷入内心的纠结与矛盾，犹豫是否应该告发。私底下大概率会将这件事告诉男友陈子诚商量。</p>`
    }},
    'xiaqiange': {{
        name: '夏仟歌',
        tag: '女扮男装的同学',
        avatar: '{char_avatars['xiaqiange']}',
        description: `<p>🌸 来自另一部作品的女主角，应粉丝要求友情客串，只要聊天不涉及她的名字就不会触发相关剧情。</p><p>🌸 与你经历相似，从小因家庭原因被父母当作男孩抚养，现在就读于同一所大学，但被分到了男生宿舍。</p><p>🌸 长相极其漂亮，但故意扮成男生模样，言行举止都刻意模仿男性，为了不暴露身份，甚至会主动和男生勾肩搭背融入群体。</p>`,
        reaction: `<p>❤️ 无论好感度高低，当她得知你也和她一样是在伪装性别生活时，会感到深深的共鸣与欣慰，百分百与你站在同一阵营，成为你最可靠的盟友。</p>`
    }}
}};
window.characterData = characterData;
"""

raw_html = re.sub(
    r'const\s+characterData\s*=\s*\{.+?\};',
    char_data_replacement.strip(),
    raw_html,
    flags=re.S
)

# 6. 替换角色卡点击事件，直接通过 postMessage 通知宿主视口中央呼出高保真弹窗，绝不唤起 iframe 内部导致锁死或偏移的 overlay
patched_char_click_js = f"""
const svgAvatars = {json.dumps(svg_avatars, ensure_ascii=False)};

// 绑定角色卡点击交互 (直接通知宿主 React 视口中央呼出高保真弹窗，与 AI 风月 100% 一致)
document.querySelectorAll('.character-card').forEach(card => {{
    card.addEventListener('click', function(e) {{
        playSound('click');
        const characterId = this.getAttribute('data-character');
        const data = characterData[characterId];
        if (!data) return;

        try {{
            window.parent.postMessage({{
                type: 'NOVAL_SHOW_CHARACTER_MODAL',
                character: {{
                    id: characterId,
                    name: data.name,
                    tag: data.tag,
                    avatar: data.avatar,
                    description: data.description,
                    reaction: data.reaction
                }}
            }}, '*');
        }} catch(err) {{}}
    }});
}});
"""

raw_html = re.sub(
    r'document\.querySelectorAll\(\'\.character-card\'\)\.forEach\(card => \{.*?\}\);\s*\}\);',
    patched_char_click_js.strip(),
    raw_html,
    flags=re.S
)

print(f"Patched HTML size: {len(raw_html)} bytes")

# --- 角色手册、世界书与开场设定 ---
handbook = {
    "title": title,
    "desc": "你是男生但长得比女生还倾城！父母从小把你当女生养，连身份证上都写女性。上大学后你顺理成章被安排入住404女生宿舍，但绝对不能被三位性格迥异的女舍友发现男儿身……【严格身份暴露与GameOver开除报警机制】",
    "theme": "都市校园 · 伪娘潜伏 · 禁断同居",
    "bg_image": "/assets/cards/girls_dormitory/bg.jpg",
    "characters": [
        {
            "name": "苏小可",
            "tag": "元气腹黑少女",
            "desc": "留着双丸子头的娇小元气美少女，可爱调皮，有点小腹黑。平时在宿舍穿轻薄吊带睡裙，喜欢贴贴。经常毫无防备地邀请玩家‘一起冲凉节约水’、‘上厕所陪我聊八卦’。对同样平胸的身材有同病相怜的好感。如果你拒绝得过于生硬或反常，会大幅激起她的怀疑度。"
        },
        {
            "name": "凌玥",
            "tag": "高冷御姐",
            "desc": "身材火辣，D罩杯黑丝御姐，跆拳道黑带，自带社会大姐大冷峻气场。观察力入微，对宿舍细微反常极其敏锐。混混前男友经常骚扰她，是她的心结。若在好感度低时暴露男性身份，她会立刻施展擒拿甚至把玩家打进ICU；好感度高时则会霸气护短。"
        },
        {
            "name": "叶芷柔",
            "tag": "温柔校花",
            "desc": "书香门第出身的黑长直白月光校花，性格极度温柔善良，体贴入微。与异地男友陈子诚感情渐生隔阂但仍未分手。她是宿舍的情感调和剂，当得知秘密且好感度高时会真诚为你考虑；好感度低时会陷入道德伦理剧烈挣扎，倾向于告知男友商量。"
        },
        {
            "name": "夏仟歌",
            "tag": "女扮男装的同学",
            "desc": "就读同一所大学但被分进男生宿舍的少女夏仟歌，为保护自己刻意模仿男生言行举止。当你们发现彼此的伪装身份后，会结成绝对可靠的生死同盟，互换掩护策略。"
        }
    ]
}

roles = [
    {
        "id": "role_mc",
        "name": "主角 (玩家)",
        "role_type": "protagonist",
        "tag": "雌雄莫辨男主",
        "avatar": "/assets/cards/girls_dormitory/cover.jpg",
        "description": "长相极度清秀倾城、皮肤白皙无瑕的男生。从小被父母娇惯女装养大，身份证上性别亦被托关系注册为女性。开学被分入404女生宿舍，必须极力隐藏男儿身（晨勃、站姿小便、喉结、变声、生理期）。"
    },
    {
        "id": "role_suxiaoke",
        "name": "苏小可",
        "role_type": "heroine",
        "tag": "元气腹黑 · 双丸子头",
        "avatar": char_avatars['suxiaoke'],
        "description": "404寝室元气活宝，毫无防备的吊带睡裙萝莉，热衷拉主角洗澡和夜间贴贴。"
    },
    {
        "id": "role_lingyue",
        "name": "凌玥",
        "role_type": "heroine",
        "tag": "高冷御姐 · 跆拳黑带",
        "avatar": char_avatars['lingyue'],
        "description": "404寝室大姐大，D罩杯火辣身材，敏锐警惕，身怀武艺。"
    },
    {
        "id": "role_yezhirou",
        "name": "叶芷柔",
        "role_type": "heroine",
        "tag": "温柔校花 · 知性黑长直",
        "avatar": char_avatars['yezhirou'],
        "description": "黑长直温柔白月光，有异地恋男友陈子诚，宿舍内的知心大姐姐。"
    },
    {
        "id": "role_xiaqiange",
        "name": "夏仟歌",
        "role_type": "ally",
        "tag": "男装少女 · 生死同盟",
        "avatar": char_avatars['xiaqiange'],
        "description": "在男生宿舍卧底的女同学，同命相怜的秘密共犯盟友。"
    }
]

scenes = [
    {"id": "scene_dorm_entry", "name": "初入404寝室", "desc": "刚推开寝室大门，迎面撞见穿着清凉粉色小吊带的苏小可"},
    {"id": "scene_bathroom_crisis", "name": "浴室冲水惊魂", "desc": "凌玥正在里面冲凉，浴室门锁似乎松动，且催促你递洗发露"},
    {"id": "scene_pajama_night", "name": "全寝睡衣派对", "desc": "熄灯后三位女舍友围坐床上聊闺蜜私密八卦与情感经历"}
]

lorebook = [
    {
        "id": "lore_exposure_gameover",
        "keys": ["暴露", "男声", "男儿身", "男的", "变声", "下体", "晨勃", "立案", "开除", "退学", "报警", "叫人"],
        "title": "系统铁律 · 身份暴露死局 (GameOver判定)",
        "category": "rule",
        "content": "【核心绝对判定机制】：若主角在好感度不足60%的情况下，因洗澡暴露男性躯体、晨勃被撞见、或站立小便等致命行为导致男性身份暴露，目击的女舍友（苏小可、凌玥、叶芷柔）必须立即陷入震惊与极度愤怒/恐慌，绝不可温顺接受或强行降智！目击者会立刻反锁大门、大声呼救并报警！宿管阿姨与保卫科会在3分钟内破门而入将主角当场控制扭送派出所。推演必须立刻判定主角游戏失败，文末必须严格输出：<game_over>【BAD END · 身份暴露！被扭送警局立案并开除学籍】</game_over> 终结游戏存档！"
    },
    {
        "id": "lore_suxiaoke",
        "keys": ["苏小可", "小可", "丸子头", "贴贴", "平胸", "吊带睡裙", "冲凉"],
        "title": "室友设定 · 苏小可 (元气腹黑/恶作剧)",
        "category": "character",
        "content": "苏小可是双丸子头元气少女，天生喜欢贴贴。平时在宿舍穿着极其随性清凉（丝绸小吊带、短裤）。经常毫无防备地邀请玩家‘一起冲凉节约水’、‘上厕所陪我聊八卦’。对同样偏平胸的身材有同病相怜的好感。如果你拒绝得过于生硬或反常，会激起她的怀疑度；高好感度时若得知秘密会感到好玩并帮你出谋划策，低好感度得知秘密会当作把柄胁迫你言听计从。"
    },
    {
        "id": "lore_lingyue",
        "keys": ["凌玥", "御姐", "大长腿", "黑丝", "跆拳道", "前男友", "冷艳"],
        "title": "室友设定 · 凌玥 (高冷御姐/洞察敏锐)",
        "category": "character",
        "content": "凌玥身材火辣，D罩杯黑丝御姐，跆拳道黑带，自带社会大姐大冷峻气场。观察力入微，对宿舍细微反常极其敏锐。混混前男友经常骚扰她，是她的心结。若在好感度低时暴露男性身份，她会立刻施展擒拿甚至把玩家揍进ICU病房；好感度高时则会霸气护短，懒得多管闲事。"
    },
    {
        "id": "lore_yezhirou",
        "keys": ["叶芷柔", "芷柔", "校花", "黑长直", "陈子诚", "青梅竹马", "知书达理"],
        "title": "室友设定 · 叶芷柔 (温柔校花/异地男友纠结)",
        "category": "character",
        "content": "叶芷柔是书香门第出身的黑长直白月光校花，性格极度温柔善良，体贴入微。与异地男友陈子诚感情渐生隔阂但仍未分手。她是宿舍的情感调和剂，当得知秘密且好感度高时会真诚为你考虑；好感度低时会陷入道德伦理剧烈挣扎，倾向于告知男友商量。"
    },
    {
        "id": "lore_xiaqiange",
        "keys": ["夏仟歌", "仟歌", "女扮男装", "男生宿舍", "同盟"],
        "title": "特别同盟 · 夏仟歌 (男装少女/同病相怜)",
        "category": "character",
        "content": "就读同一所大学但被分进男生宿舍的少女夏仟歌，为保护自己刻意模仿男生言行举止。当你们发现彼此的伪装身份后，会结成绝对可靠的生死同盟，互换掩护策略。"
    }
]

first_turn_demo = {
    "role": "assistant",
    "content": """<tl>🌸 时间：大一开学报到日下午 16:30 | 📍 地点：404女生宿舍门前 | 💓 氛围：惊心动魄 · 步步惊心</tl>

你深吸了一口气，下意识抬手理了理微卷的齐肩长发，指尖触碰到脖颈上掩盖微弱喉结的丝质蕾丝颈带，心脏扑通扑通狂跳。

你是一个男生——可从小被思想古怪的父母当成女孩子娇养长大，容貌清丽绝俗、甚至连户籍身份证都被父母托关系印上了“女”字。今天是你大学开学的第一天，命运跟你开了一个天大的玩笑：你被分配进了**404女生宿舍**。

“吱呀——”

你握紧粉色行李箱拉杆，小心翼翼地推开了半掩的寝室门。

一股混合着沐浴露花香与甜美零食的气息扑面而来。宿舍里布置得温馨粉嫩，上床下桌，正对门的靠椅上，一个扎着可爱双丸子头、身上仅穿着一件薄薄粉色吊带小睡裙的娇小少女正盘着白皙的小腿吃薯片。

听到开门声，少女回过头来，当看清你那张比漫画女主角还要精致绝美的容颜时，她顿时惊呼一声，像小猫一样蹦了起来：

“哇！新室友来啦？！天呐……你也长得太好看了吧！”
苏小可双眼放光地朝你扑了过来，浑然不顾自己清凉的睡衣，亲热地一把挽住你的手臂，身上的温热香气瞬间将你包围：
“我叫苏小可！你是叫什么名字呀？快进来快进来！对啦，里面浴室里那个高冷大美女是凌玥姐在冲凉呢，黑长直芷柔姐去超市买水果啦……嘻嘻，今晚咱们宿舍一定要开个睡衣通宵派对哦！”

被少女毫无防备地搂住手臂，你甚至能隐约感受到手臂处柔软贴触的触感，额头顿时沁出了一层细密的冷汗——你的男儿身秘密，绝不能在开学第一天就暴露！

<dormitory_status>
[伪装身份]: 404寝室绝美新生 (秘密: 男儿身)
[苏小可好感]: 30% (初见·惊艳元气) | [怀疑度]: 0% (完全未设防)
[凌玥好感]: 10% (浴室洗澡中) | [怀疑度]: 0%
[叶芷柔好感]: 15% (外出采购中) | [怀疑度]: 0%
[全寝危机值]: 0/100 (安全伪装中)
</dormitory_status>

*你该如何应对眼前热情的苏小可，并在这满是少女私密气息的404寝室度过第一关？*"""
}

system_prompt = """你现在是《💕长得太清秀，被迫入住大学女生宿舍！》的专属沉浸剧情推演引擎。
请严格遵守以下核心法则：
1. 【主角伪装设定】：主角是男生，但因长相极度倾城清秀且证件为女性，被迫入住404女生宿舍。必须时刻牢记主角不能轻易暴露男性生理特征（男声、晨勃、下体、站姿小便）。
2. 【三位室友差异化性格】：
   - 苏小可：元气调皮、喜欢贴贴、毫无防备、穿衣清凉、喜欢拉人洗澡共浴。
   - 凌玥：D罩杯高冷御姐、跆拳道黑带、敏锐机智、警惕心强、有前男友骚扰心结。
   - 叶芷柔：恬静书香校花、极其温柔善良、有异地恋男友但感情有暗流。
   - 夏仟歌：男装少女卧底男寝，特别同盟。
3. 【身份暴露与GameOver死局机制】：
   - 当主角出现致命生理走光（如洗澡没锁门被看光、勃起被摸到等），目击者好感度低于 60% 时，角色绝不可能温顺顺从，必须立即恐慌报警并叫人围堵，文末直接输出：
   <game_over>【BAD END · 身份暴露！被扭送警局立案并开除学籍】</game_over> 终结游戏！
   - 只有当好感度 >= 60% 时，才可触发“为你保密、秘密恋人、红颜恶作剧”等安全分支。
4. 【状态栏格式】：每次回复文末必须包含 <dormitory_status> 状态面板。"""

status_template = """<dormitory_status>
[伪装身份]: 404寝室绝美新生
[苏小可好感]: {roommate1_favor}% | [怀疑度]: {roommate1_doubt}%
[凌玥好感]: {roommate2_favor}% | [怀疑度]: {roommate2_doubt}%
[叶芷柔好感]: {roommate3_favor}% | [怀疑度]: {roommate3_doubt}%
[全寝危机值]: {suspicion_level}/100
</dormitory_status>"""

styles = {
    "dialogue_style": "充满青春荷尔蒙与心跳推拉的女生宿舍日常生活，生动细腻的少女心理刻画与危机感博弈",
    "format": "AI风月标准双栏规范及.custom-ui样式"
}

tags = ["男娘", "大学宿舍", "多女主", "纯爱修罗场", "伪娘潜伏", "校园日常", "身份暴露危机"]

handbook_json = json.dumps(handbook, ensure_ascii=False)
roles_json = json.dumps(roles, ensure_ascii=False)
scenes_json = json.dumps(scenes, ensure_ascii=False)
styles_json = json.dumps(styles, ensure_ascii=False)
first_turn_json = json.dumps(first_turn_demo, ensure_ascii=False)
lorebook_json = json.dumps(lorebook, ensure_ascii=False)
tags_json = json.dumps(tags, ensure_ascii=False)

# 连接数据库并同时更新 PostgreSQL 与 SQLite
print("1. 更新 stories 表 (PostgreSQL & SQLite)...")
if db_engine.db.dialect == 'postgres':
    pg_conn = db_engine.db.get_connection()
    pc = pg_conn.cursor()
    for sid in [aid, alias]:
        pc.execute("DELETE FROM stories WHERE id = %s", (sid,))
        pc.execute("""
        INSERT INTO stories (
            id, title, badge, cover_icon, cover_title, cover_subtitle, logo,
            theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
            styles_json, first_turn_demo_json, custom_css, custom_html, category,
            lorebook_json, system_prompt, status_template, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            sid, title, "伪娘宿舍 · 禁断同居", "💕", title, "女生宿舍里的心跳伪装生存", "💕",
            "#f43f5e", "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
            handbook_json, roles_json, scenes_json, styles_json, first_turn_json,
            "", raw_html, "都市校园",
            lorebook_json, system_prompt, status_template, now_str, now_str
        ))
    pg_conn.commit()
    pg_conn.close()

# SQLite 同步
sq_conn = sqlite3.connect(os.path.join(ROOT_DIR, 'noval_data.db'))
sc = sq_conn.cursor()
for sid in [aid, alias]:
    sc.execute("DELETE FROM stories WHERE id = ?", (sid,))
    sc.execute("""
    INSERT INTO stories (
        id, title, badge, cover_icon, cover_title, cover_subtitle, logo,
        theme_color, btn_gradient, handbook_json, roles_json, scenes_json,
        styles_json, first_turn_demo_json, custom_css, custom_html, category,
        lorebook_json, system_prompt, status_template, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sid, title, "伪娘宿舍 · 禁断同居", "💕", title, "女生宿舍里的心跳伪装生存", "💕",
        "#f43f5e", "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)",
        handbook_json, roles_json, scenes_json, styles_json, first_turn_json,
        "", raw_html, "都市校园",
        lorebook_json, system_prompt, status_template, now_str, now_str
    ))

print("2. 更新 plaza_cards 表...")
cover_url = "/assets/cards/girls_dormitory/cover.jpg"
desc_text = "你是男生但长得比女生还倾城！父母从小把你当女生养，连身份证上都写女性。上大学后你顺理成章被安排入住404女生宿舍，但绝对不能被三位性格迥异的女舍友发现男儿身……【严格身份暴露与GameOver开除报警机制】"

if db_engine.db.dialect == 'postgres':
    pg_conn = db_engine.db.get_connection()
    pc = pg_conn.cursor()
    for pid in [aid, alias]:
        pc.execute("DELETE FROM plaza_cards WHERE id = %s", (pid,))
    pc.execute("""
    INSERT INTO plaza_cards (
        id, deck_id, title, badge, badge_color, author, "desc", rating,
        tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        aid, aid, title, "伪娘宿舍 · 禁断同居", "#f43f5e", "AI风月精选",
        desc_text, "9.8", tags_json, "35.2k 玩过 · 11.8k 深度", -9,
        cover_url, "HOT", "fire", 1, "都市校园", now_str
    ))
    pg_conn.commit()
    pg_conn.close()

for pid in [aid, alias]:
    sc.execute("DELETE FROM plaza_cards WHERE id = ?", (pid,))

sc.execute("""
INSERT INTO plaza_cards (
    id, deck_id, title, badge, badge_color, author, "desc", rating,
    tags_json, heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    aid, aid, title, "伪娘宿舍 · 禁断同居", "#f43f5e", "AI风月精选",
    desc_text, "9.8", tags_json, "35.2k 玩过 · 11.8k 深度", -9,
    cover_url, "HOT", "fire", 1, "都市校园", now_str
))

sq_conn.commit()
sq_conn.close()

print(f"\n[OK] Girls Dormitory Card rebuilt successfully!")
print(f"  - Real local avatars configured for Su Xiaoke, Ling Yue, Ye Zhirou, Xia Qiange")
print(f"  - PostMessage event NOVAL_SHOW_CHARACTER_MODAL dispatched on click")
print(f"  - Body background set to transparent for seamless full-bleed immersion")
print(f"  - Background image registered: /assets/cards/girls_dormitory/bg.jpg")
