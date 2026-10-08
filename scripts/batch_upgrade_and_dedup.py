import os
import sys
import json
import datetime
import sqlite3

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
import db_engine

print("=== 1. 连接数据库 ===")
pg_conn = db_engine.db.get_connection()
pc = pg_conn.cursor()
sq_conn = sqlite3.connect(os.path.join(ROOT_DIR, 'noval_data.db'))
sc = sq_conn.cursor()

# -----------------------------------------------------------------------------
# 2. 全库去重：相同剧本只留一个
# -----------------------------------------------------------------------------
print("\n=== 2. 全库去重处理 (相同剧本只留 1 个) ===")

pc.execute("SELECT id FROM plaza_cards")
plaza_ids = set(r['id'] for r in pc.fetchall())

pc.execute("SELECT id, title, custom_html, lorebook_json, system_prompt FROM stories")
stories = pc.fetchall()

from collections import defaultdict
by_title = defaultdict(list)
for s in stories:
    by_title[s['title']].append(s)

deleted_ids = []
for title, s_list in by_title.items():
    if len(s_list) > 1:
        # Determine which ID to keep
        in_plaza = [s for s in s_list if s['id'] in plaza_ids]
        if in_plaza:
            chosen = in_plaza[0]
        else:
            chosen = max(s_list, key=lambda x: len(x['lorebook_json'] or '') + len(x['system_prompt'] or '') + len(x['custom_html'] or ''))
        
        for s in s_list:
            if s['id'] != chosen['id']:
                del_id = s['id']
                keep_id = chosen['id']
                deleted_ids.append((del_id, keep_id, title))
                # Update any conversations pointing to the deleted ID to point to keep_id
                pc.execute("UPDATE conversations SET deck_id = %s WHERE deck_id = %s", (keep_id, del_id))
                sc.execute("UPDATE conversations SET deck_id = ? WHERE deck_id = ?", (keep_id, del_id))
                # Delete duplicate from stories
                pc.execute("DELETE FROM stories WHERE id = %s", (del_id,))
                sc.execute("DELETE FROM stories WHERE id = ?", (del_id,))
                # Also delete from plaza_cards if somehow present
                pc.execute("DELETE FROM plaza_cards WHERE id = %s", (del_id,))
                sc.execute("DELETE FROM plaza_cards WHERE id = ?", (del_id,))

print(f"成功清理重复剧本记录: {len(deleted_ids)} 条！保留的剧本均为唯一正本。")

# -----------------------------------------------------------------------------
# 3. 针对用户指定的 6 部核心高机制卡片进行深度重构与世界书/法典注入
# -----------------------------------------------------------------------------
print("\n=== 3. 升级 6 部卡片的世界书与规则法典 ===")

cards_data = {
    # 1. 长得太清秀，被迫入住大学女生宿舍
    "deck_girls_dormitory": {
        "lorebook": [
            {
                "id": "lore_gender_secret",
                "keys": ["男生", "发现", "暴露", "识破", "男人", "假发", "验明正身", "脱光", "身体检查", "裤裆", "掏出", "肉棒", "站着尿尿", "报警", "扭送", "ICU", "退学"],
                "title": "绝密身份伪装与败露死局",
                "category": "rule",
                "content": "【最高伪装死刑法典】：玩家身份为误打误撞被迫入住302女生宿舍的清秀男生。在舍友【好感度 < 60%】时，一旦任何舍友发现或确凿证实玩家是男生（如洗澡撞破、被窝摸到下体、假发脱落、站立排尿等），将立刻触发【极度震惊与戒备暴怒】，舍友会立即拉响警报、联合宿管阿姨与保卫处将玩家揍进医院，并以流氓罪扭送派出所开除学籍！AI必须立即判定剧情终止，在文末输出 <game_over>【BAD END · 身份败露，涉嫌流氓罪被保卫处开除并拘留】</game_over> 彻底终结存档！"
            },
            {
                "id": "lore_dorm_rules",
                "keys": ["叶芷柔", "林悠悠", "苏晓冉", "白楚楚", "会长", "舍长", "好感", "换衣服", "澡堂", "熄灯", "睡衣"],
                "title": "宿舍四美性格与好感心防阶梯",
                "category": "character",
                "content": "【舍友心防阶梯】：\n- 叶芷柔（冷艳会长，原则极强）：高难度攻防，好感未达80前戒备极深；\n- 林悠悠（阳光运动女孩）：神经大条，常不拘小节；\n- 苏晓冉（网络主播）：深夜直播，防备心适中；\n- 白楚楚（娇弱软妹）：胆小害羞，易受惊吓。\n【阶段许可】：好感 0-30(冷淡防范，各自更衣防锁) -> 31-60(闺蜜同乐，同桌分食) -> 61-85(情愫暗生，发现秘密也会主动替你遮掩打掩护) -> 86-100(专属同盟与深层私密恋人)。"
            },
            {
                "id": "lore_dorm_stealth",
                "keys": ["洗澡", "沐浴", "浴室", "卫生间", "更衣", "换衣服", "睡衣", "查寝", "宿管", "阿姨"],
                "title": "潜行避险与更衣沐浴危机",
                "category": "rule",
                "content": "【高危作息规约】：早晚公共浴室洗漱、就寝换衣和宿管突击查寝为三大高危事件！玩家必须通过机智推拉、错峰洗澡、紧裹浴巾伪装等策略化解危机。不可无脑自曝！"
            }
        ],
        "system_prompt": """## 🌸《长得太清秀，被迫入住大学女生宿舍！》最高法典：
1. 🎭【身份绝密因果律】：
   - 玩家角色：外貌极其清秀俊美的大一男生，因系统阴差阳错被分入302女生宿舍，隐瞒真实性别在此生活；
   - 舍友：叶芷柔（冷艳会长）、林悠悠（运动健气）、苏晓冉（网络女主播）、白楚楚（软萌甜妹）。
2. 🚨【身份暴露即死刑 GameOver 铁律】（最高执行优先级）：
   - 当任一舍友【好感度 < 60%】时，若玩家在洗澡、更衣、如厕或被窝接触中被确凿发现男性特征（假发脱落、掏出男性器官、站立排尿等），
     舍友绝不会动情顺从！必须立即触发惊恐尖叫、暴力自卫并报警扭送保卫处！
     你必须立即在正文后输出：
     <game_over>【BAD END · 身份败露，涉嫌流氓罪被保卫处开除拘留】你的男性身份被全宿舍当场抓现行，被保卫处与警方带走调查，大学生涯彻底断送。</game_over>
3. 📊【状态维护输出协议】：
   每次回复必须严格输出：
   <article>正文内容</article>
   <state>{
     "伪装暴露风险": "安全(15%)",
     "宿舍综合好感": 35,
     "当前时段": "夜晚熄灯前",
     "最怀疑你的舍友": "叶芷柔"
   }</state>
   若触发上述第2条违规，必须追加 <game_over> 标签结束故事！""",
        "status_template": """```Status
【🌸 女生宿舍伪装生存面板】
⚠️ 伪装暴露风险: {伪装暴露风险}
💖 宿舍综合好感: {宿舍综合好感}/100
⏰ 当前时段: {当前时段}
👀 最怀疑你的舍友: {最怀疑你的舍友}
```""",
        "state_fields": [
            {"key": "伪装暴露风险", "type": "string", "default": "安全(10%)"},
            {"key": "宿舍综合好感", "type": "number", "min": 0, "max": 100, "default": 20},
            {"key": "当前时段", "type": "string", "default": "开学首日入住"},
            {"key": "最怀疑你的舍友", "type": "string", "default": "暂无"}
        ]
    },

    # 2. 末世求生录
    "deck_apocalypse_survival": {
        "lorebook": [
            {
                "id": "lore_apoc_infection",
                "keys": ["丧尸", "撕咬", "抓伤", "感染", "病毒", "发烧", "变异", "尸变", "尸潮", "扑倒", "被咬"],
                "title": "丧尸撕咬、感染率与致命死局",
                "category": "rule",
                "content": "【最高感染死刑法典】：走廊外已被狂暴突变感染者占据！若玩家或苏晓染在探索、开门或战斗中被丧尸抓伤咬伤，感染率将在 3 轮内急速恶化。若没有在感染率达 100% 前注射极其稀缺的抗生素，目标将发生恐怖尸变、敌我不分地撕咬同伴，AI必须立即宣告剧情终止，输出 <game_over>【BAD END · 感染尸变，沦为丧尸血食】</game_over>！"
            },
            {
                "id": "lore_apoc_supplies",
                "keys": ["抗生素", "纯净水", "罐头", "药品", "消毒", "压缩饼干", "食物", "口渴", "饥饿", "脱水"],
                "title": "核心战备物资与因果通货",
                "category": "rule",
                "content": "【不可凭空造物铁律】：安全屋内初始仅有纯净水10桶、抗生素3盒、罐头15个。外界水源已受辐射污染，苏晓染逃亡3天滴水未进，喉咙撕裂干渴。每一口水和食物都是能击穿其高岭骄傲的至高硬通货。物资消耗必须在状态中实时扣减，水粮耗尽即判定绝望渴死！"
            },
            {
                "id": "lore_apoc_vault_door",
                "keys": ["防爆门", "合金门", "密码", "锁死", "开门", "液压", "声响", "开枪", "门外"],
                "title": "三级合金防爆门与走廊防线",
                "category": "rule",
                "content": "【安全屋防御规则】：重达2.4吨的军用合金防爆门为唯一安全屏障，机械转盘密码仅主角掌握。若门外声响过大或引来尸潮冲击，一旦大门被破或主角因失误被拖出门外，直接触发避难所沦陷死局！"
            }
        ],
        "system_prompt": """## 😱《末世求生录》最高法典：
1. ☣️【硬核末日因果律】：
   - 这是一个资源极度匮乏、高死亡率的废土生存剧本，严禁虚空产生水和抗生素；
   - 苏晓染（21岁校花学姐）：矜持高傲的名媛自尊正面临饥渴濒死的极限考验。
2. 🚨【感染与避难所沦陷死刑 GameOver 铁律】：
   - 若角色被咬伤感染且 3 轮内未获得抗生素治疗，或安全门被尸潮冲垮，AI必须立即判定死亡，输出：
     <game_over>【BAD END · 避难所沦陷/感染尸变】冰冷的末日没有奇迹，感染与死亡吞噬了最后的安全屋。</game_over>
3. 📊【状态维护输出协议】：
   每次回复必须严格输出：
   <article>正文内容</article>
   <state>{
     "纯净水存量": "9桶",
     "抗生素存量": "3盒",
     "苏晓染感染度": 0,
     "苏晓染顺从度": 20,
     "门外尸潮威胁": "游荡(低)"
   }</state>
   若角色死亡或沦陷，必须追加 <game_over> 标签结束！""",
        "status_template": """```Status
【☣️ 地下安全屋生存面板】
💧 纯净水存量: {纯净水存量}
💊 抗生素存量: {抗生素存量}
🦠 苏晓染感染度: {苏晓染感染度}%
🛐 苏晓染顺从度: {苏晓染顺从度}/100
🚪 门外尸潮威胁: {门外尸潮威胁}
```""",
        "state_fields": [
            {"key": "纯净水存量", "type": "string", "default": "10桶"},
            {"key": "抗生素存量", "type": "string", "default": "3盒"},
            {"key": "苏晓染感染度", "type": "number", "min": 0, "max": 100, "default": 0},
            {"key": "苏晓染顺从度", "type": "number", "min": 0, "max": 100, "default": 10},
            {"key": "门外尸潮威胁", "type": "string", "default": "低"}
        ]
    },

    # 3. 堵门挑战与心理阈值相关卡片 (2168197e-903b-4727-97e3-bf5f1d5b6c8f)
    "2168197e-903b-4727-97e3-bf5f1d5b6c8f": {
        "lorebook": [
            {
                "id": "lore_clock_deadline",
                "keys": ["上班", "迟到", "打卡", "领导", "扣工资", "扣除", "全勤", "辞退", "手机响", "催促", "8点", "8:30"],
                "title": "上班打卡倒计时与全勤失业死线",
                "category": "rule",
                "content": "【时间死线法典】：当前时间早晨 07:50，公司要求 08:30 前完成指纹打卡。通勤需要 25 分钟。若 08:05 前未能出门必迟到扣除全勤奖 ¥2,000；若 08:35 仍未出门，将面临部门通报与辞退危机！"
            },
            {
                "id": "lore_door_block_mechanic",
                "keys": ["堵门", "抱住", "拦住", "门把手", "钥匙", "撒娇", "晨勃", "亲亲", "想要", "抱抱", "睡裙"],
                "title": "女儿堵门索爱与娇羞阈值",
                "category": "rule",
                "content": "【堵门攻防规约】：18岁调皮女儿穿着单薄睡裙把住大门并藏匿钥匙。唯有在有限时间内，通过强势攻防、快速安抚或激烈的门后亲密接触，让女儿身心娇羞满足交出钥匙，父亲才能在最后关头保住全勤！"
            }
        ],
        "system_prompt": """## 🚪《老爸你想出门上班必须先操我一下》规则法典：
1. ⏰【上班倒计时因果律】：
   - 父亲面临 08:30 严苛上班打卡死线，必须在 08:05 前成功出门；
   - 女儿身体堵门索取晨间亲密温存，藏匿钥匙。
2. 📊【状态维护输出协议】：
   每次回复必须输出：
   <article>正文</article>
   <state>{
     "当前时间": "07:55",
     "迟到危险度": "中(剩余35分钟)",
     "女儿满足度": 20,
     "钥匙是否交出": false
   }</state>""",
        "status_template": """```Status
【🚪 晨间堵门攻防面板】
⏰ 当前时间: {当前时间}
⚠️ 迟到危险度: {迟到危险度}
💖 女儿满足度: {女儿满足度}/100
🔑 钥匙状态: {钥匙是否交出}
```""",
        "state_fields": [
            {"key": "当前时间", "type": "string", "default": "07:50"},
            {"key": "迟到危险度", "type": "string", "default": "低"},
            {"key": "女儿满足度", "type": "number", "min": 0, "max": 100, "default": 0},
            {"key": "钥匙是否交出", "type": "string", "default": "未交出"}
        ]
    },

    # 4. 公寓租住与合同相关卡片 (deck_rent_apartment)
    "deck_rent_apartment": {
        "lorebook": [
            {
                "id": "lore_rent_rules",
                "keys": ["房租", "欠费", "账单", "押金", "搬走", "赶出去", "肉偿", "合同", "抵扣", "清偿", "免租"],
                "title": "公寓租约法典与肉偿违约协议",
                "category": "rule",
                "content": "【租约因果律】：每月5号为交租死线，逾期未缴房东有权断水断电清退。身无分文的绝美租客可自愿签署《特殊租金折抵协议》，以身体承欢抵扣当月租金（每次折抵 ¥1,000~¥2,000）。"
            },
            {
                "id": "lore_tenants_info",
                "keys": ["洛薇雅", "204", "夏小葵", "102", "许曼丽", "301", "沈清竹", "201", "coser", "人妻", "女大"],
                "title": "四大绝色租客房号与财务困境",
                "category": "character",
                "content": "204室 洛薇雅（高挑Coser御姐，欠¥4,800）；102室 夏小葵（贫困大一女大，欠¥2,200）；301室 许曼丽（离异熟韵少妇，欠¥6,500）；201室 沈清竹（失业大厂女白领，欠¥3,500）。"
            }
        ],
        "system_prompt": """## 🏢《交不起房租就要被肏的肉偿公寓》最高法典：
1. 💰【租客账单因果律】：
   - 房东手握整栋公寓主控备用钥匙，面对拖欠房租的各色绝美租客，以断电清退或肉偿协议步步瓦解其自尊心防。
2. 📊【状态维护协议】：
   <article>正文</article>
   <state>{
     "当前催租对象": "204室 洛薇雅",
     "欠租金额": 4800,
     "已抵扣金额": 0,
     "租客屈服度": 15
   }</state>""",
        "status_template": """```Status
【🏢 单身公寓催租管理面板】
🎯 当前催租对象: {当前催租对象}
💸 拖欠房租: ¥{欠租金额}
💳 已抵扣折缴: ¥{已抵扣金额}
🛐 租客屈服度: {租客屈服度}/100
```""",
        "state_fields": [
            {"key": "当前催租对象", "type": "string", "default": "204室 洛薇雅"},
            {"key": "欠租金额", "type": "number", "default": 4800},
            {"key": "已抵扣金额", "type": "number", "default": 0},
            {"key": "租客屈服度", "type": "number", "min": 0, "max": 100, "default": 10}
        ]
    },

    # 5. 中式人生·高中模拟器 (deck_5274d525)
    "deck_5274d525": {
        "lorebook": [
            {
                "id": "lore_gaokao_rules",
                "keys": ["高考", "倒计时", "模拟考", "试卷", "班主任", "排名", "成绩", "提分", "一本", "清华", "考不上"],
                "title": "高考倒计时与七维数值体系",
                "category": "rule",
                "content": "【高考因果律】：从倒计时300天递减。七维属性（智商、情商、体魄、魅力、家境、压力、同桌好感）。模拟考决定名次，高考终局决定人生走向（名校/大专/进厂）。"
            },
            {
                "id": "lore_stress_death",
                "keys": ["压力", "崩溃", "抑郁", "逃课", "撕书", "离家出走", "自暴自弃", "弃考", "退学"],
                "title": "心理压力过载与崩溃放弃死局",
                "category": "rule",
                "content": "【压力死线法典】：【压力值(0-100)】为生存死线！若长期过载且缺乏排解，当【压力值 >= 95】时，将触发重度抑郁或撕毁试卷离家出走，直接判定 <game_over>【BAD END · 压力过载，高考前夕精神崩溃退学】</game_over>！"
            }
        ],
        "system_prompt": """## 📚《【中式人生】高中模拟器》最高法典：
1. 🎓【县城高中三年模拟因果律】：
   - 真实细腻还原中式青春：晚自习风扇轰鸣、漫天试卷、班主任后窗凝视、同桌草稿纸纸条；
   - 压力值 >= 95 必须触发崩溃退学 GameOver！
2. 📊【状态维护协议】：
   <article>正文</article>
   <state>{
     "高考倒计时": "200天",
     "模拟考预估总分": 520,
     "心理压力值": 50,
     "体魄健康度": 65,
     "同桌好感度": 40
   }</state>""",
        "status_template": """```Status
【📚 县城高中三年模拟面板】
⏳ 高考倒计时: {高考倒计时}
📝 模考预估总分: {模拟考预估总分}分
🤯 心理压力值: {心理压力值}/100 (>=95崩溃退学)
💪 体魄健康度: {体魄健康度}/100
💕 同桌好感度: {同桌好感度}/100
```""",
        "state_fields": [
            {"key": "高考倒计时", "type": "string", "default": "200天"},
            {"key": "模拟考预估总分", "type": "number", "default": 520},
            {"key": "心理压力值", "type": "number", "min": 0, "max": 100, "default": 40},
            {"key": "体魄健康度", "type": "number", "min": 0, "max": 100, "default": 70},
            {"key": "同桌好感度", "type": "number", "min": 0, "max": 100, "default": 30}
        ]
    },

    # 6. 演艺圈地下情与经纪人巡查卡片 (deck_idol_sister_debt)
    "deck_idol_sister_debt": {
        "lorebook": [
            {
                "id": "lore_exposure_scandal",
                "keys": ["虹姐", "经纪人", "查房", "敲门", "狗仔", "偷拍", "曝光", "记者", "爆料", "塌房", "封杀", "违约金"],
                "title": "经纪人突击查房与狗仔曝光封杀死局",
                "category": "rule",
                "content": "【曝光封杀死刑法典】：妹妹签有严格禁爱令。经纪人虹姐常突击查房，大楼外长年有狗仔蹲守！当【曝光风险值 >= 85】时，若两人亲密举动被狗仔拍到或虹姐当场撞破，妹妹将面临身败名裂、5,000万巨额赔偿与封杀，直接判定 <game_over>【BAD END · 顶流塌房，身败名裂背负巨债】</game_over> 结束存档！"
            },
            {
                "id": "lore_debt_clearing",
                "keys": ["还债", "债务", "通告费", "演唱会", "商业代言", "被窝", "钻进", "抱抱", "撒娇", "疲惫"],
                "title": "还债进度与深夜被窝温存",
                "category": "rule",
                "content": "【主仆与兄妹推拉】：妹妹白天是高岭之花爱豆，深夜卸下防备后偷偷钻入哥哥被窝寻求依靠。通过接通告扣除3000万债务，随着债务清偿逐步解锁更多私密羁绊。"
            }
        ],
        "system_prompt": """## 🎤《【图上互动】替父还债成为顶流偶像的妹妹》最高法典：
1. 🌟【演艺圈地下秘密恋情因果律】：
   - 妹妹作为顶流爱豆，一旦被经纪人或狗仔证实地下恋情，立即触发塌房封杀 GameOver！
2. 📊【状态维护协议】：
   <article>正文</article>
   <state>{
     "剩余巨债": "2,400万",
     "曝光风险度": 20,
     "妹妹依恋值": 70,
     "经纪人动向": "录影棚开会"
   }</state>""",
        "status_template": """```Status
【🎤 顶流爱豆妹妹还债管理面板】
💰 剩余巨债: {剩余巨债}
📸 曝光风险度: {曝光风险度}/100 (>=85塌房封杀)
💖 妹妹依恋值: {妹妹依恋值}/100
🕵️ 经纪人动向: {经纪人动向}
```""",
        "state_fields": [
            {"key": "剩余巨债", "type": "string", "default": "2,800万"},
            {"key": "曝光风险度", "type": "number", "min": 0, "max": 100, "default": 20},
            {"key": "妹妹依恋值", "type": "number", "min": 0, "max": 100, "default": 65},
            {"key": "经纪人动向", "type": "string", "default": "片场巡视"}
        ]
    }
}

for card_id, cdata in cards_data.items():
    lore_json = json.dumps(cdata["lorebook"], ensure_ascii=False)
    sp = cdata["system_prompt"]
    st = cdata["status_template"]
    
    # Read existing handbook to preserve desc, options, bg_image and update sessionDefaults
    pc.execute("SELECT handbook_json, custom_html FROM stories WHERE id = %s", (card_id,))
    row = pc.fetchone()
    if row:
        hb = {}
        try:
            hb = json.loads(row['handbook_json'] or '{}')
        except Exception:
            pass
        if 'sessionDefaults' not in hb:
            hb['sessionDefaults'] = {}
        hb['sessionDefaults']['stateFields'] = cdata['state_fields']
        new_hb_json = json.dumps(hb, ensure_ascii=False)
        
        pc.execute("""
        UPDATE stories SET
            lorebook_json = %s,
            system_prompt = %s,
            status_template = %s,
            handbook_json = %s
        WHERE id = %s
        """, (lore_json, sp, st, new_hb_json, card_id))
        
        sc.execute("""
        UPDATE stories SET
            lorebook_json = ?,
            system_prompt = ?,
            status_template = ?,
            handbook_json = ?
        WHERE id = ?
        """, (lore_json, sp, st, new_hb_json, card_id))
        
        print(f"✅ 成功升级卡片: {card_id} (世界书词条数: {len(cdata['lorebook'])}, 状态字段: {len(cdata['state_fields'])})")
    else:
        print(f"⚠️ 未找到卡片: {card_id}")

pg_conn.commit()
sq_conn.commit()
pg_conn.close()
sq_conn.close()

print("\n[🎉] 全量去重与 6 部核心卡片的高精度重塑已全部完成！")
