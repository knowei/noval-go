"""
AI角色扮演/剧本一键抓取与格式化导入脚本
支持平台: AI风月 (genraton.xyz), 纯文本或自定义链接
使用方式:
  python import_story.py "https://genraton.xyz/zh/explore/installed/2b4d9743-b660-4b75-825b-d141a7594477"
  python import_story.py --id 2b4d9743-b660-4b75-825b-d141a7594477
"""

import sys
import os
import re
import json
import urllib.request
import urllib.parse

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

PROJECT_DIR = r"d:\pro\work\proj\googleAI\noval-go"
CARDS_DIR = os.path.join(PROJECT_DIR, "cards")
DATA_JS_PATH = os.path.join(PROJECT_DIR, "stories_data.js")

os.makedirs(CARDS_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'X-Language': 'zh-Hans',
    'Origin': 'https://genraton.xyz',
    'Referer': 'https://genraton.xyz/'
}

# 基础内置剧本集
BASE_DECKS = {
  "harumi": {
    "id": "harumi",
    "title": "(纯爱肉卡) 爆操反差婊小学妹！",
    "badge": "纯爱肉卡 · 反差优等生",
    "logo": "📖",
    "cover": "https://catai.wiki/f7757124-7521-4218-6a6e-bd9644f06400/cover",
    "themeColor": "rose",
    "btnGradient": "from-rose-600 to-pink-600",
    "styles": [
      { "name": "把柄施压", "desc": "以抓包把柄居高临下试探防线，言语坏笑逼其就范" },
      { "name": "强势掌控", "desc": "果断反客为主制住双手与退路，粉碎一切虚张声势" },
      { "name": "温柔诱捕", "desc": "在羞耻破防时给予温柔安抚，将其完全融化在怀中" },
      { "name": "假意呼救", "desc": "故意制造门外动静，引诱对方慌乱用唇封口求饶" }
    ],
    "scenes": [
      {
        "title": "📍 废弃图书室死角·撞破秘密 (官方开局)",
        "desc": "青叶台高中的走廊尽头旧图书室。全班最优秀的晴海小晴，在书架后看羞耻内容被你当场撞破，惊慌失措下把你按在书架上威吓……",
        "text": "青叶台高中的走廊尽头，有一间几乎没人用的旧图书室。你在那里撞见了全班最优秀的晴海小晴——她正盯着手机屏幕，脸红到耳根。你还没看清画面，她就像炸毛的猫一样扑了过来，却笨拙地把你按倒在书架旁。\n\n“学长……你要是说出去，我会杀了你。”"
      }
    ],
    "roles": [
      {
        "name": "晴海小晴",
        "tag": "高一优等生 / 模范学妹 (16岁)",
        "roleType": "女主",
        "color": "rose",
        "desc": "<strong>外在面具：</strong> 成绩第一的模范优等生，黑发齐肩，平日里表情清冷严谨。<br><strong>隐性诱饵：</strong> 内心有极度羞耻的欲望秘密，被学长抓包后高自尊极易破防，双手被制便迅速泪崩屈服。"
      },
      {
        "name": "学长 (玩家)",
        "tag": "秘密掌控者",
        "roleType": "男主",
        "color": "blue",
        "desc": "<strong>定位：</strong> 撞破秘密的绝对支配者。在逗弄、把柄压制与极致深情的占有中逐步瓦解防线。"
      }
    ],
    "firstTurnDemo": {
      "location": "旧图书室第三排书架阴影深处。黄昏17:42，夕阳如血，走廊尽头传来值日生拖地声。",
      "story": "夕阳将两人交叠在书架上的影子拉得极长。晴海小晴整个人几乎完全贴在你的胸膛上，透过单薄的水手服能感受到她剧烈失速的心跳。\n\n她掉在地上的手机屏幕还亮着极其露骨羞耻的内容，眼眶泛红盈满泪花，在门外值日生走过的脚步声中慌忙哀求：“求你……学长别出声……只要你替我保守秘密，小晴什么都听学长的……真的……”",
      "memory": [
        "图书室把柄时刻：撞破优等生晴海小晴看羞耻内容的绝对隐私",
        "反差破防：小晴从虚张声势迅速瓦解为带哭腔的投怀哀求",
        "外部危机：走廊外有值日生拖地，脚步声正逼近门口"
      ],
      "status": {
        "clothes": "晴海小晴：深蓝水手服纽扣松开、领巾半解、百褶裙挤压上移、长筒袜",
        "posture": "整个人撞在学长怀中、双手揪住衣襟、膝盖紧贴在两腿之间",
        "stats": "心跳指数: 158bpm | 羞耻度: 96% | 屈从度: 85%",
        "risk": "走廊值日生距离门口仅剩10米，被发现风险 80%"
      },
      "branches": [
        { "tag": "A", "title": "强势反制", "desc": "反手一把扣住她纤细柔弱的双手压在书架上，低头冷笑着审问" },
        { "tag": "B", "title": "把柄威胁", "desc": "用脚尖将手机踢进口袋，故意贴近她发烫的耳垂挑逗逼她叫学长" },
        { "tag": "C", "title": "极度温存", "desc": "顺势环住她微颤的软腰，低头轻吻去她眼角的羞耻泪珠安抚" },
        { "tag": "D", "title": "佯装呼救", "desc": "清了清嗓子作势要向门外喊人，引她惊慌失措主动垫脚用唇封口" }
      ]
    }
  },
  "school": {
    "id": "school",
    "title": "【中式人生】高三盛夏模拟器",
    "badge": "中式校园 · 晚自习",
    "logo": "🎒",
    "cover": "",
    "themeColor": "sky",
    "btnGradient": "from-sky-600 to-blue-600",
    "styles": [
      { "name": "坏笑调侃", "desc": "故意在言语上逗弄同桌，看似漫不经心却步步紧逼" },
      { "name": "温柔包容", "desc": "体贴耐心，顺水推舟化解女生的羞怯与防备" },
      { "name": "义正言辞", "desc": "假正经好学生，表面催促学习，暗中制造身体接触" },
      { "name": "强势主导", "desc": "直接在课桌下掌控节奏，剥夺少女的逃避退路" }
    ],
    "scenes": [
      {
        "title": "📍 闷热周五晚自习·课桌下踩脚",
        "desc": "暴雨前夕极其闷热。老旧吊扇吱呀作响，讲台上严厉的林老师在批改试卷。苏小雨在草稿纸上画了个哭脸递给你，课桌下脚尖悄悄踩在了你的球鞋上……",
        "text": "南江一中高三(3)班，周五晚自习20:38。闷热潮湿的夏夜让人透不过气，天花板上的吊扇发出沉闷的吱呀声。讲台上冷厉的班主任林疏影正低头批改试卷。最后一排靠窗死角里，同桌苏小雨在草稿纸上画着流泪小兔子推给你：『立体几何第二问救命！还有你膝盖不要老顶着我！』而在课桌下方，她那只踩在浅蓝帆布鞋里的小白袜脚尖，正悄悄踩在了你的鞋面上……"
      }
    ],
    "roles": [
      {
        "name": "苏小雨",
        "tag": "同桌青梅 (17岁/高三)",
        "roleType": "女主",
        "color": "sky",
        "desc": "<strong>外在面具：</strong> 傲娇小班花，表面上嫌弃你成绩偏科。<br><strong>隐性诱饵：</strong> 肌肤饥渴，课桌下经常主动用脚尖蹭你；一旦被强势抓握住脚踝就会浑身发软。"
      }
    ],
    "firstTurnDemo": {
      "location": "高三(3)班教室后排靠窗·晚自习20:39。吊扇轻转，讲台林老师批卷，窗外闷雷翻滚。",
      "story": "教室里只有笔尖沙沙声和吊扇声。课桌掩护的阴影深处，苏小雨那只踩在你球鞋上的小白袜脚尖，轻轻顺着你的裤管往上蹭了小半寸。她侧过身用草稿本立在课桌间充当屏风，温热的唇瓣凑到你耳侧轻吐热气：“喂……假正经，你怎么不理我？小心我现在举手告诉林老师你走神欺负同桌哦……”",
      "memory": ["晚自习同桌互动：苏小雨传纸条求教大题并在课桌下蹭脚"],
      "status": {
        "clothes": "苏小雨：蓝白短袖校服、藏蓝百褶裙、白色棉袜",
        "posture": "课桌下脚尖踩在男主鞋面上、草稿本掩护凑近耳语",
        "stats": "心跳: 125bpm | 羞耻度: 70% | 亲密度: 91%",
        "risk": "讲台班主任偶尔抬头，危险度 65%"
      },
      "branches": [
        { "tag": "A", "title": "课桌下反抓", "desc": "桌底一把扣住她纤细小脚踝，让她惊呼却不敢叫出声" },
        { "tag": "B", "title": "写纸条反撩", "desc": "草稿纸写『你裙子太短了，再乱蹭我就不客气了』递过去" },
        { "tag": "C", "title": "凑近她耳垂", "desc": "借讲题名义凑近她通红的耳垂吹气反制" },
        { "tag": "D", "title": "故意挪开脚", "desc": "冷淡避开看她主动急着再贴上来" }
      ]
    }
  },
  "novel": {
    "id": "novel",
    "title": "雪夜共生 · 悠月与哥哥",
    "badge": "日系轻小说 · 禁断",
    "logo": "❄️",
    "cover": "",
    "themeColor": "pink",
    "btnGradient": "from-pink-600 to-rose-600",
    "styles": [
      { "name": "温柔宠溺", "desc": "体贴入微，用溺爱慢慢融化悠月" },
      { "name": "义正言辞", "desc": "表面严厉守序，暗自克制冲动" },
      { "name": "强势掌控", "desc": "霸道占有，剥夺少女逃避退路" }
    ],
    "scenes": [
      {
        "title": "📍 书房解题·大腿坐姿",
        "desc": "深夜暴雨，书房门虚掩。悠月穿着微敞的制服白衬衫，坐在哥哥大腿上问微积分，追问口袋里硬硬的是什么……",
        "text": "家中书房，夜晚21:40。窗外冷雨淅沥，门外传来母亲收拾餐具的声音。悠月坐在大腿上问微积分，眼神带着好奇与羞涩：“哥哥……你口袋里装了什么硬邦邦的东西呀？硌得我有点发麻了……”"
      }
    ],
    "roles": [
      {
        "name": "水无月 悠月",
        "tag": "高二学生会长 (16岁)",
        "roleType": "女主",
        "color": "pink",
        "desc": "<strong>外在面具：</strong> 清冷受人敬仰的高岭之花学生会长。<br><strong>隐性诱饵：</strong> 离开哥哥就会崩溃的重度依恋障碍与肌肤饥渴，藏有病娇独占欲。"
      }
    ],
    "firstTurnDemo": {
      "location": "书房内部·夜晚21:42。窗外秋雨敲窗，门外走廊有母亲脚步声。",
      "story": "昏黄铜灯下，悠月双腿分开稳稳跨坐在我的大腿上。纯白校服衬衫紧绷，锁骨白皙一览无遗。她将发热的额头靠在我下颌边轻声呢喃：“哥哥……你还没回答悠月呢。口袋里到底装了什么呀？要是答不上来，今晚悠月可不让你走哦。”",
      "memory": ["书房解题：悠月跨坐在大腿上逼问"],
      "status": {
        "clothes": "悠月：校服衬衫微敞、百褶短裙、及膝袜",
        "posture": "正面跨坐在哥哥大腿上、双臂环颈",
        "stats": "依恋度: 96% | 羞耻度: 65% | 占有欲: 92%",
        "risk": "门外隐约有人影走动，高度背德感"
      },
      "branches": [
        { "tag": "A", "title": "温柔诱哄", "desc": "轻抚后颈坦白冲动，引她更进一步" },
        { "tag": "B", "title": "借机教导", "desc": "扶住纤腰假借兄长身份惩罚" },
        { "tag": "C", "title": "直接上手", "desc": "按紧细腰打破最后遮羞布" }
      ]
    }
  },
  "spa": {
    "id": "spa",
    "title": "私密水汇 · VIP专属深情护理",
    "badge": "现代都市 · 私密",
    "logo": "🌿",
    "cover": "",
    "themeColor": "amber",
    "btnGradient": "from-amber-600 to-orange-600",
    "styles": [
      { "name": "沉稳享受", "desc": "放松合眼任由理疗师细致伺候" },
      { "name": "调侃坏笑", "desc": "言语试探技师的职业底线" }
    ],
    "scenes": [
      {
        "title": "📍 独立VIP精油包厢",
        "desc": "幽暗香薰包厢内，水汽与檀香氤氲。温雅倒出温热精油贴上你的肩背……",
        "text": "水汇中心VIP豪华包厢。温雅身着浅杏色开叉旗袍，手掌搓热精油按在肩颈处低语：“贵宾……力道还可以吗？如果您觉得哪里需要加钟放松，一定要告诉温雅哦……”"
      }
    ],
    "roles": [
      {
        "name": "温雅",
        "tag": "VIP金牌理疗师 (24岁)",
        "roleType": "女主",
        "color": "amber",
        "desc": "<strong>外在面具：</strong> 端庄知性的大牌护理师。<br><strong>隐性诱饵：</strong> 独处时手法常不由自主带着温存撩拨。"
      }
    ],
    "firstTurnDemo": {
      "location": "VIP私密水疗包厢·深夜23:15。柔和地灯与精油薄雾。",
      "story": "温雅跪坐在侧后方，柔嫩手掌裹着温热依兰精油推拿肩颈，开叉旗袍裙摆微缩，温热大腿不经意蹭过你的臂膀：“贵宾……是今天太累了……还是因为温雅按得让您觉得害羞呢？”",
      "memory": ["水汇VIP体验：温雅进行深度精油肩颈护理"],
      "status": {
        "clothes": "温雅：浅杏色开叉旗袍、长发挽起",
        "posture": "俯身跪坐床侧、双手覆在后背推拿",
        "stats": "心跳: 110bpm | 羞耻度: 60% | 默契度: 88%",
        "risk": "走廊偶尔有服务生走过"
      },
      "branches": [
        { "tag": "A", "title": "反握柔荑", "desc": "反手扣住滑腻手掌低声发问" },
        { "tag": "B", "title": "翻身相对", "desc": "翻过身正对视线让她继续" }
      ]
    }
  }
}

def extract_uuid(url_or_id):
    m = re.search(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', url_or_id)
    if m:
        return m.group(0).lower()
    return url_or_id.strip()

def fetch_genraton_card(card_id):
    endpoints = [
        f"https://awsprod.aiero.cc/console/api/installed-apps/{card_id}",
        f"https://awsprod.aiero.cc/console/api/installed-apps/{card_id}/parameters"
    ]
    card_info, params_info = {}, {}
    try:
        req = urllib.request.Request(endpoints[0], headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            card_info = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"[-] 抓取详情失败: {e}")

    try:
        req = urllib.request.Request(endpoints[1], headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            params_info = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"[-] 抓取参数失败: {e}")
    return card_info, params_info

def parse_and_convert(card_id, card_info, params_info):
    app = card_info.get('app', {})
    name = app.get('name') or "未命名剧本"
    summary = app.get('summary') or "暂无故事大纲"
    cover = app.get('cover') or ""
    
    deck_id = "deck_" + card_id[:8]

    deck = {
        "id": deck_id,
        "sourceId": card_id,
        "title": name,
        "badge": "AI风月收录 · 纯爱肉卡",
        "logo": "📖",
        "cover": cover,
        "themeColor": "rose",
        "btnGradient": "from-rose-600 to-pink-600",
        "styles": [
          { "name": "把柄施压", "desc": "以抓包把柄居高临下试探防线，言语坏笑逼其就范" },
          { "name": "强势掌控", "desc": "果断反客为主制住双手与退路，粉碎一切虚张声势" },
          { "name": "温柔诱捕", "desc": "在羞耻破防时给予温柔安抚，将其完全融化在怀中" },
          { "name": "假意呼救", "desc": "故意制造门外动静，引诱对方慌乱用唇封口求饶" }
        ],
        "scenes": [
          {
            "title": "📍 开场核心事件: 秘密撞破",
            "desc": summary[:80] + "...",
            "text": summary
          }
        ],
        "roles": [
          {
            "name": "主角(女生)",
            "tag": "反差优等生 / 核心女主",
            "roleType": "女主",
            "color": "rose",
            "desc": f"<strong>外在面具与设定：</strong> {summary[:80]}...<br><strong>隐性诱饵：</strong> 拥有极度羞耻的反差秘密，被抓住把柄后从虚张声势快速瓦解为带哭腔的服从。"
          },
          {
            "name": "玩家(主角)",
            "tag": "秘密掌控者",
            "roleType": "男主",
            "color": "blue",
            "desc": "<strong>定位：</strong> 撞破秘密的绝对支配者。在逗弄、把柄压制与极致深情的占有中逐步瓦解防线。"
          }
        ],
        "firstTurnDemo": {
          "location": "密闭场景深处·黄昏时刻。光线昏暗，门外走廊隐约传来脚步声与杂音。",
          "story": summary + "\n\n对方发抖的双手紧紧揪着你的衣角，因为心跳失速眼眶瞬间盈满水汽，身子在逼仄的角落里瑟瑟发抖……",
          "memory": [
            "开局事件：撞破绝密隐私",
            "权力颠倒：对方从试图恐吓迅速转向慌乱与哀求",
            "外部环境：门外有脚步声走动，随时可能被发现"
          ],
          "status": {
            "clothes": "制服微敞、领结凌乱、百褶裙被挤压上移",
            "posture": "被逼至墙角/书架死角、双手抵在男主胸口、身体紧贴颤抖",
            "stats": "心跳指数: 155bpm | 羞耻度: 95% | 屈从度: 82%",
            "risk": "门外脚步声逼近，被抓风险 75%"
          },
          "branches": [
            { "tag": "A", "title": "强势反制", "desc": "反手扣住她发抖的手腕压在墙上，低声审问是否真的什么都听你的" },
            { "tag": "B", "title": "把柄威胁", "desc": "将她的秘密拿在手中把玩，居高临下逼她亲口叫一声动听的称呼" },
            { "tag": "C", "title": "极度温存", "desc": "顺势环住她微颤的腰肢，低头拭去眼角泪水将恐惧转化为依恋" },
            { "tag": "D", "title": "佯装呼救", "desc": "作势要惊动门外路过的人，引她惊恐失措主动投怀用唇封口" }
          ]
        }
    }
    return deck

def sync_to_stories_data(new_deck=None):
    all_decks = dict(BASE_DECKS)
    if os.path.exists(DATA_JS_PATH):
        try:
            with open(DATA_JS_PATH, 'r', encoding='utf-8') as f:
                content = f.read()
                m = re.search(r'window\.SHARED_STORY_DATABASE\s*=\s*(\{.*?\});', content, re.DOTALL)
                if m:
                    existing = json.loads(m.group(1))
                    all_decks.update(existing)
        except:
            pass

    if new_deck:
        all_decks[new_deck['id']] = new_deck
        card_file = os.path.join(CARDS_DIR, f"{new_deck['id']}.json")
        with open(card_file, 'w', encoding='utf-8') as f:
            json.dump(new_deck, f, ensure_ascii=False, indent=2)

    with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write("// 本文件由 import_story.py 自动生成与维护\n")
        f.write("window.SHARED_STORY_DATABASE = ")
        f.write(json.dumps(all_decks, ensure_ascii=False, indent=2))
        f.write(";\n")
    print(f"[+] stories_data.js 更新成功，当前总剧本库包含 {len(all_decks)} 个剧本！")

def main():
    if len(sys.argv) < 2:
        # 如果不传参数，自动将基础预设写入 stories_data.js
        print("[*] 未传入URL，正在初始化并同步基础剧本库...")
        sync_to_stories_data()
        return

    arg = sys.argv[1]
    card_id = extract_uuid(arg)
    print(f"[*] 解析卡片 ID: {card_id}")
    card_info, params_info = fetch_genraton_card(card_id)
    if not card_info or not card_info.get('app'):
        print("[-] 未能抓取到卡片详情，请检查链接或网络。")
        return

    deck = parse_and_convert(card_id, card_info, params_info)
    print(f"[+] 抓取成功！剧本标题: 【{deck['title']}】")
    sync_to_stories_data(deck)
    print("[*] 导入完毕！直接在浏览器刷新 index.html 即可体验新剧本。")

if __name__ == '__main__':
    main()
