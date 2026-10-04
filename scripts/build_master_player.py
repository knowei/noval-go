# -*- coding: utf-8 -*-
import os
import re
import json

base_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG"
target_html = os.path.join(base_dir, "00_《存在感薄弱妹妹》全动画互动演播全集.html")

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def find_files(folder, prefix, suffix=".png", max_count=None):
    dp = os.path.join(base_dir, folder)
    if not os.path.exists(dp):
        return []
    res = []
    for f in os.listdir(dp):
        if f.startswith(prefix) and f.endswith(suffix):
            res.append(f)
    res.sort(key=natural_sort_key)
    if max_count:
        res = res[:max_count]
    return [f"./{folder}/{f}" for f in res]

# Build scenes
scenes = []

# ================= 1. 妹妹超灵动立绘 (Live2D级微动与换装系统) =================
scenes.append({
    "category": "🌟 妹妹灵动立绘 (Live2D级交互)",
    "title": "妹妹待机呼吸与6阶乳摇系统",
    "desc": "游戏自研动作切片系统！身体上独立叠加6阶乳摇切片与呼吸微动，支持鼠标互动晃动！",
    "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilTachieBoobShake | 尺寸: 1000×1800",
    "fps": 8,
    "type": "tachie_shake",
    "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
    "body": "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_body.png",
    "shakes": [f"./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_boobShake{i}.png" for i in range(1, 7)],
    "frames": [f"./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_boobShake{i}.png" for i in range(1, 7)],
    "align": {"x": 460, "y": 0, "w": 1000, "h": 1080}
})

scenes.append({
    "category": "🌟 妹妹灵动立绘 (Live2D级交互)",
    "title": "妹妹拉扯掀起 T 恤换装动画",
    "desc": "10阶骨骼级拉扯掀开衣物差分，展现害羞遮掩与微露锁骨的超细腻画质",
    "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilTuggingOnTshirt",
    "fps": 6,
    "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
    "body": "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_body.png",
    "frames": [
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingA1.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingA2.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingA3.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingA4.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingB1.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingB2.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingB3.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingB4.png",
        "./01_妹妹动态立绘_乳摇与换装(24张)/mio_tachie_T-shirt_draggingB5.png"
    ],
    "align": {"x": 460, "y": 0, "w": 1000, "h": 1080}
})

# ================= 2. 早晨洗漱刷牙与温馨晨光 =================
teeth_frames = find_files("02_早晨洗漱与刷牙动态(234帧)", "brushingTeeth")
scenes.append({
    "category": "☀️ 早晨洗漱与温馨晨光",
    "title": "洗手台刷牙洗脸全连贯 (219帧超丝滑)",
    "desc": "清晨洗漱台前，镜中倒映着妹妹含泡沫刷牙、擦脸与微笑的219帧超长连贯生活画卷",
    "codeInfo": "插件: QJ.MPMZ.tl.ImoutoBrushTeethAnimation | 身体位于 (200, 100)",
    "fps": 12,
    "bg": "./02_早晨洗漱与刷牙动态(234帧)/washroom_MirrorCloseUp_background.png",
    "frames": teeth_frames,
    "align": {"x": 200, "y": 100, "w": 1050, "h": 980}
})

# ================= 3. 厨房料理与日常生活 =================
cooking_p1 = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "CookingShow_Hamburger_Pre")
if not cooking_p1:
    cooking_p1 = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "CookingShow_Hamburger")
scenes.append({
    "category": "🍳 厨房料理与汉堡排制作",
    "title": "做饭：汉堡排肉馅调制与搅拌",
    "desc": "妹妹系着小围裙，专注地搅拌碎牛肉与调料，为哥哥准备美味便当",
    "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilImoutoCookingPickIngredients",
    "fps": 6,
    "bg": "./08_厨房做饭互动(172帧)/kitchen_day_background.png" if os.path.exists(os.path.join(base_dir, "08_厨房做饭互动(172帧)/kitchen_day_background.png")) else "",
    "frames": cooking_p1[:15] if cooking_p1 else ["./03_客厅温馨生活与汉堡排料理(365帧)/CookingShow_Hamburger_Pre1.png"],
    "align": {"x": 300, "y": 100, "w": 1300, "h": 900}
})

kitchen_herself = find_files("08_厨房做饭互动(172帧)", "kitchen_sis_cookingHerself")
if kitchen_herself:
    scenes.append({
        "category": "🍳 厨房料理与汉堡排制作",
        "title": "厨房日常：妹妹料理烹饪动作",
        "desc": "灶台前轻轻挥动锅铲，诱人的香气在温馨的小屋中渐渐弥漫",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilImoutoCookingHerselfPhaseOne | (360, 180)",
        "fps": 5,
        "bg": "./08_厨房做饭互动(172帧)/kitchen_day_background.png" if os.path.exists(os.path.join(base_dir, "08_厨房做饭互动(172帧)/kitchen_day_background.png")) else "",
        "frames": kitchen_herself,
        "align": {"x": 360, "y": 180, "w": 1200, "h": 900}
    })

# ================= 4. 客厅玩乐与打游戏 =================
game_frames = find_files("05_打游戏与恶作剧动态(311帧)", "alt_sister_normal_hand")
if game_frames:
    scenes.append({
        "category": "🎮 客厅日常 · 玩乐与游戏",
        "title": "客厅打游戏与手柄连招互动",
        "desc": "兄妹两人坐在地毯上并肩激战主机游戏，妹妹紧张按键的可爱小动作",
        "codeInfo": "场景: livingRoom_gameConsole",
        "fps": 8,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": game_frames,
        "align": {"x": 300, "y": 100, "w": 1300, "h": 900}
    })

cola_frames = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "livingRoom_Imouto_sittingTogether")
if cola_frames:
    scenes.append({
        "category": "🎮 客厅日常 · 玩乐与游戏",
        "title": "客厅依偎与温馨休息",
        "desc": "午后悠闲的阳光洒在地板上，妹妹依偎在身旁，享受宁静的兄妹时光",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilImoutoDrinksCola",
        "fps": 4,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": cola_frames,
        "align": {"x": 200, "y": 0, "w": 1500, "h": 1080}
    })

# ================= 5. 妹妹卧室与膝枕日常 =================
hizamakura_frames = find_files("04_妹妹卧室与膝枕日常(207帧)", "hizamakura_back_kao")
if hizamakura_frames:
    scenes.append({
        "category": "🛌 妹妹卧室与膝枕日常",
        "title": "卧室温馨膝枕与安抚",
        "desc": "躺在妹妹柔软温暖的膝枕上，鼻尖萦绕着淡淡的清香，轻声诉说着白天的琐事",
        "codeInfo": "场景: hizamakura_back",
        "fps": 3,
        "bg": "./04_妹妹卧室与膝枕日常(207帧)/sis_room_night_background.png" if os.path.exists(os.path.join(base_dir, "04_妹妹卧室与膝枕日常(207帧)/sis_room_night_background.png")) else "",
        "frames": hizamakura_frames,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })

dozing_frames = find_files("04_妹妹卧室与膝枕日常(207帧)", "sis_room_dozingOff")
if dozing_frames:
    scenes.append({
        "category": "🛌 妹妹卧室与膝枕日常",
        "title": "卧室日常：打瞌睡与微颤",
        "desc": "学习累了的小脑袋一点一点地打着瞌睡，呆毛随着呼吸轻轻晃荡",
        "codeInfo": "场景: sis_room_dozingOff (17帧连贯)",
        "fps": 6,
        "frames": dozing_frames,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

milk_frames = find_files("04_妹妹卧室与膝枕日常(207帧)", "sis_room_drinkMilk_bare")
if not milk_frames:
    milk_frames = find_files("04_妹妹卧室与膝枕日常(207帧)", "sis_room_drinkMilk")
if milk_frames:
    scenes.append({
        "category": "🛌 妹妹卧室与膝枕日常",
        "title": "睡前喝热牛奶与擦拭嘴角",
        "desc": "双手捧着温热的马克杯小口喝着牛奶，唇边挂着一圈淡淡的白胡子",
        "codeInfo": "场景: sis_room_drinkMilk (16帧连贯)",
        "fps": 6,
        "frames": milk_frames,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

sleep_frames = find_files("21_动作切片库(ActionSeq_2300多帧)", "Imouto_sleep")
if sleep_frames:
    scenes.append({
        "category": "🛌 妹妹卧室与膝枕日常",
        "title": "被窝安眠熟睡微动 (48帧)",
        "desc": "在温暖的被窝中发出均匀细微的呼吸声，长睫毛在睡梦中轻轻颤动",
        "codeInfo": "动作切片: Imouto_sleep (48帧连贯循环)",
        "fps": 8,
        "frames": sleep_frames,
        "align": {"x": 400, "y": 100, "w": 1100, "h": 900}
    })

# ================= 6. 客厅心动 · 看电视与秘密自慰 =================
tv_cowgirl = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "[NSFW]livingRoom_watchTVTogether_reverseCowgirl_action")
tv_cowgirl_ahegao = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "[NSFW]livingRoom_watchTVTogether_reverseCowgirl_action_ahegaoA")
if tv_cowgirl:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅看电视背向坐位亲密 (11帧连贯)",
        "desc": "在客厅沙发上看电视时的亲密互动，倒映着电视荧幕光影的紧贴韵律",
        "codeInfo": "插件: QJ.MPMZ.tl.livingRoomWatchTVTogetherHaimenzai",
        "fps": 10,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": tv_cowgirl,
        "heads": tv_cowgirl_ahegao if tv_cowgirl_ahegao else None,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

tv_cowgirl_alt = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "[NSFW]livingRoom_watchTVTogether_reverseCowgirl_alt_switchPose")
if tv_cowgirl_alt:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅看电视切换体位深入 (15帧连贯)",
        "desc": "随着电视节目的声浪，更深层次的体位变奏与急促喘息",
        "codeInfo": "插件: QJ.MPMZ.tl.livingRoomWatchTVTogetherHaimenzaiAlter",
        "fps": 10,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": tv_cowgirl_alt,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

tv_anal = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "[NSFW]livingRoom_watchTVTogether_analSegs_action")
if tv_anal:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅沙发后背位亲密 (12帧动作)",
        "desc": "沙发扶手旁的紧密拥抱，细腻的光影流转与肢体交叠",
        "codeInfo": "插件: QJ.MPMZ.tl.livingRoomWatchTVTogetherAnalSegs",
        "fps": 10,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": tv_anal,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

onani_switch = find_files("16_客厅秘密自慰窥视(169帧)", "ImoutoOnaniSecretly_actionSwitch")
if onani_switch:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅沙发秘密自慰 · 剧烈转换 (19帧超长)",
        "desc": "以为哥哥熟睡后的妹妹，在沙发角落偷偷触碰自己的心跳时刻",
        "codeInfo": "插件: QJ.MPMZ.tl.livingroomImoutoOnaniSecretly | (580, 100)",
        "fps": 10,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": onani_switch,
        "align": {"x": 580, "y": 100, "w": 760, "h": 980}
    })

onani_zetchou = find_files("16_客厅秘密自慰窥视(169帧)", "ImoutoOnaniSecretly_zetchouEnd")
if onani_zetchou:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅秘密自慰 · 绝顶高潮失神 (10帧余韵)",
        "desc": "难以自抑的痉挛与失神，手指无力地垂在身旁，剧烈起伏的胸口",
        "codeInfo": "动作: ImoutoOnaniSecretly_zetchouEnd",
        "fps": 8,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": onani_zetchou,
        "align": {"x": 580, "y": 100, "w": 760, "h": 980}
    })

# ================= 7. 洗手间高帧率连贯互动 (559帧超清) =================
tekoki_act2 = [f"./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_action2_{i}.png" for i in range(1, 27) if os.path.exists(os.path.join(base_dir, f"13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_action2_{i}.png"))]
if tekoki_act2:
    scenes.append({
        "category": "🚪 洗手间高帧率连贯互动 (559帧)",
        "title": "洗手间手交互动 · 阶段二加速摩擦 (26帧)",
        "desc": "洗手台旁指缝间的温热触感，支持在白/粉/蓝三色内裤与真空之间实时换装！",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction2 | (360, 0)",
        "fps": 12,
        "bg": "./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_back.png",
        "frames": tekoki_act2,
        "hasPanties": True,
        "pantiesPrefix": "./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_action2_",
        "align": {"x": 360, "y": 0, "w": 1000, "h": 1080}
    })

tekoki_act3 = [f"./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_action3_{i}.png" for i in range(1, 45) if os.path.exists(os.path.join(base_dir, f"13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_action3_{i}.png"))]
if tekoki_act3:
    scenes.append({
        "category": "🚪 洗手间高帧率连贯互动 (559帧)",
        "title": "洗手间手交互动 · 阶段三深层刺激 (44帧)",
        "desc": "急促而沉重的喘息声在狭窄的洗手间里回响，指尖完全被体温浸透",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiAction3",
        "fps": 14,
        "bg": "./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_back.png",
        "frames": tekoki_act3,
        "hasPanties": True,
        "pantiesPrefix": "./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_action3_",
        "align": {"x": 360, "y": 0, "w": 1000, "h": 1080}
    })

tekoki_shasei = [f"./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_shasei{i}.png" for i in range(1, 68) if os.path.exists(os.path.join(base_dir, f"13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_shasei{i}.png"))]
if tekoki_shasei:
    scenes.append({
        "category": "🚪 洗手间高帧率连贯互动 (559帧)",
        "title": "洗手间手交互动 · 阶段五绝顶射精 (67帧)",
        "desc": "长达67帧的高潮释放全程！掌心、发梢与洗手台镜面上的连贯飞溅轨迹",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilWashRoomImoutoTekokiShasei",
        "fps": 14,
        "bg": "./13_洗手间高帧率连贯互动(559帧)/washroom_tekoki_back.png",
        "frames": tekoki_shasei,
        "align": {"x": 360, "y": 0, "w": 1000, "h": 1080}
    })

# ================= 8. 厕所隔间偷窥与秘密侍奉 =================
toilet_fera = find_files("17_厕所窥视差分(129帧)", "toilet_sister_fera_action")
toilet_shasei = find_files("17_厕所窥视差分(129帧)", "toilet_sister_fera_shasei")
if toilet_fera:
    scenes.append({
        "category": "🚽 厕所隔间偷窥与秘密侍奉",
        "title": "厕所隔间秘密侍奉动作 (10帧动作)",
        "desc": "关上隔间木门的私密空间，妹妹半蹲在地上的温柔奉仕",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraAction1",
        "fps": 8,
        "bg": "./17_厕所窥视差分(129帧)/PeepingAtImoutoInToilet_back.png",
        "frames": toilet_fera,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })
if toilet_shasei:
    scenes.append({
        "category": "🚽 厕所隔间偷窥与秘密侍奉",
        "title": "厕所隔间绝顶射精释放 (24帧连贯)",
        "desc": "高潮来临时的紧咬与温存，眼眸泛着水雾的满足神情",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilToiletImoutoFeraShasei",
        "fps": 10,
        "bg": "./17_厕所窥视差分(129帧)/PeepingAtImoutoInToilet_back.png",
        "frames": toilet_shasei,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

# ================= 9. 淋浴隔门水花窥视 =================
shower_a = find_files("18_淋浴隔门窥视(167帧)", "imouto_shower_actionA")
shower_b = find_files("18_淋浴隔门窥视(167帧)", "imouto_shower_actionB")
shower_e = find_files("18_淋浴隔门窥视(167帧)", "imouto_shower_actionE")
if shower_a:
    scenes.append({
        "category": "🚿 淋浴隔门水花窥视 (167帧)",
        "title": "淋浴间水花洗浴 A 动作 (15帧连贯)",
        "desc": "透过毛玻璃门映出的曼妙剪影，花洒喷涌的热水冲刷着白皙身躯",
        "codeInfo": "插件: QJ.MPMZ.tl.bathroomShowerheadAnimationPlayer",
        "fps": 8,
        "bg": "./18_淋浴隔门窥视(167帧)/washroom_nozoku_background.png",
        "frames": shower_a,
        "hasSteam": True,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })
if shower_b:
    scenes.append({
        "category": "🚿 淋浴隔门水花窥视 (167帧)",
        "title": "淋浴间水花洗浴 B 动作 (17帧连贯)",
        "desc": "双手抚摸发丝与颈侧，水珠顺着光滑的腰线滴落",
        "codeInfo": "插件: QJ.MPMZ.tl.bathroomShowerheadAnimationPlayer",
        "fps": 8,
        "bg": "./18_淋浴隔门窥视(167帧)/washroom_nozoku_background.png",
        "frames": shower_b,
        "hasSteam": True,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })
if shower_e:
    scenes.append({
        "category": "🚿 淋浴隔门水花窥视 (167帧)",
        "title": "淋浴间水花洗浴 E 动作 (33帧超长连贯)",
        "desc": "超高帧率的大动作连击，在蒸腾的热汽中若隐若现的灵动线条",
        "codeInfo": "动作: imouto_shower_actionE (33帧完整)",
        "fps": 10,
        "bg": "./18_淋浴隔门窥视(167帧)/washroom_nozoku_background.png",
        "frames": shower_e,
        "hasSteam": True,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })

# ================= 10. 浴室日常与沐浴温情 =================
scenes.append({
    "category": "🛁 浴室日常与沐浴温情",
    "title": "🦆 浴缸玩小黄鸭 (8帧循环)",
    "desc": "妹妹一个人浸泡在热水里，轻轻拨弄浮在水面上的小黄鸭玩偶",
    "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilBathRoomSoloPlayingRubberDuck",
    "fps": 8,
    "bg": "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
    "head": "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_shake_eyesOpened1.png",
    "frames": [
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck0.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck1.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck2.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck3.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck4.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck5.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck6.png"
    ],
    "hasSteam": True,
    "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
})

scenes.append({
    "category": "🛁 浴室日常与沐浴温情",
    "title": "🫧 浴缸吹泡泡 (7帧循环)",
    "desc": "妹妹掌心捧着沐浴露打出的绵密泡沫，鼓起腮帮轻轻吹动",
    "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilBathRoomSoloOfuroBubble",
    "fps": 8,
    "bg": "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
    "head": "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_shake_eyesOpened1.png",
    "frames": [f"./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble{i}.png" for i in range(1, 8)],
    "hasSteam": True,
    "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
})

scenes.append({
    "category": "🛁 浴室日常与沐浴温情",
    "title": "🧘 舒展身体懒腰 (11帧微动)",
    "desc": "水温刚好，妹妹惬意地仰起下巴伸展白皙的肢体",
    "codeInfo": "动作: bathroom_sis_solo_stretching",
    "fps": 8,
    "bg": "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
    "head": "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_shake_eyesOpened1.png",
    "frames": [f"./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching{i}.png" for i in range(11)],
    "hasSteam": True,
    "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
})

scenes.append({
    "category": "🛁 浴室日常与沐浴温情",
    "title": "🧴 帮妹妹洗头发与擦背",
    "desc": "哥哥耐心地帮妹妹搓洗长发，指尖抚过发梢的温存日常",
    "codeInfo": "插件: QJ.MPMZ.tl.oniiChanWashHair",
    "fps": 3,
    "bg": "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
    "frames": [
        "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashHair.png",
        "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashBreasts.png",
        "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashArms1.png",
        "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashArms2.png"
    ],
    "hasSteam": True,
    "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
})

scenes.append({
    "category": "🛁 浴室日常与沐浴温情",
    "title": "🛁 两人一起泡澡合浴",
    "desc": "狭小的浴缸里挤着两个人，妹妹害羞地别过头不敢直视",
    "codeInfo": "动作: bathroom_sitTogetherInBathtub",
    "fps": 2,
    "bg": "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
    "frames": [
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sitTogetherInBathtub1.png",
        "./07_浴室沐浴与擦背动态(131帧)/bathroom_sitTogetherInBathtub2.png"
    ],
    "hasSteam": True,
    "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
})

# ================= 11. 浴室镜前本番与侍奉 (内核绝对坐标对齐) =================
scenes.append({
    "category": "🔥 浴室镜前亲密本番 (内核坐标锁定)",
    "title": "🔥 镜前站立后入本番 (11帧连贯 + 头部吻合)",
    "desc": "浴室大镜子前两人紧紧相拥。头部锁定在脖颈(860, 70)，支持三表情切换、剖视与精液注入！",
    "codeInfo": "插件: QJ.MPMZ.tl.bathroomTachiBakku | 头部严格位于 (860, 70)",
    "fps": 12,
    "type": "tachiBakku",
    "bg": "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewBackground.png",
    "fg": "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewForeground.png",
    "frames": [f"./14_浴室亲密本番(260帧)/bathroom_TachiBakku_action{i}.png" for i in range(1, 12)],
    "heads": [f"./14_浴室亲密本番(260帧)/bathroom_TachiBakku_kaoA{i}.png" for i in range(1, 12)],
    "cutaways": [f"./14_浴室亲密本番(260帧)/bathroom_TachiBakku_action_cutawayView{i}.png" for i in range(1, 12)],
    "semens": [f"./14_浴室亲密本番(260帧)/bathroom_TachiBakku_seieki{i}.png" for i in range(1, 12)],
    "hasKaoSwitch": True,
    "hasCutaway": True,
    "hasSemen": True,
    "align": {"x": 0, "y": 0, "w": 1400, "h": 1080}
})

scenes.append({
    "category": "🔥 浴室镜前亲密本番 (内核坐标锁定)",
    "title": "🤝 镜前抓手后入本番 (14帧完整大动态)",
    "desc": "哥哥抓紧妹妹双手，更加强烈的本番节奏与细腻画质",
    "codeInfo": "插件: QJ.MPMZ.tl.bathroomUdeTsukamiBakku | 身体 (150, -80, 缩放110%)",
    "fps": 12,
    "type": "udeTsukamiBakku",
    "bg": "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewBackground.png",
    "fg": "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewForeground.png",
    "frames": [f"./14_浴室亲密本番(260帧)/bathroom_UdeTsukamiBakku_action{i}.png" for i in range(1, 15)],
    "cutaways": [f"./14_浴室亲密本番(260帧)/bathroom_UdeTsukamiBakku_action_cutawayView{i}.png" for i in range(1, 15)],
    "hasCutaway": True,
    "align": {"x": 150, "y": -80, "w": 1120 * 1.1, "h": 1080 * 1.1}
})

blowjob_frames = [f"./15_浴室心动奉仕(175帧)/bathroom_blowjob{i}.png" for i in range(101) if os.path.exists(os.path.join(base_dir, f"15_浴室心动奉仕(175帧)/bathroom_blowjob{i}.png"))]
scenes.append({
    "category": "🔥 浴室镜前亲密本番 (内核坐标锁定)",
    "title": "💋 浴室心动侍奉 (101帧超高清完整连贯)",
    "desc": "浴室地板上全心全意的温暖侍奉，极致的连贯帧数与细腻神态",
    "codeInfo": "插件: QJ.MPMZ.tl.bathroomBatheOniiChanBlowjob | (180, 0)",
    "fps": 16,
    "bg": "./15_浴室心动奉仕(175帧)/bathroom_blowjob_oniichan_background.png",
    "fg": "./15_浴室心动奉仕(175帧)/bathroom_blowjob_oniichan_foreground.png",
    "frames": blowjob_frames,
    "align": {"x": 180, "y": 0, "w": 1640, "h": 1080}
})

sumata_a = [f"./19_浴室素股亲密(96帧)/bathroom_sumata_ridingA{i}.png" for i in range(1, 13)]
scenes.append({
    "category": "🔥 浴室镜前亲密本番 (内核坐标锁定)",
    "title": "🏇 浴室骑乘素股 A 动作 (12帧高频)",
    "desc": "妹妹跨坐在腿上，湿漉漉的肌肤紧密贴合滑动的触电感觉",
    "codeInfo": "插件: QJ.MPMZ.tl.bathroomSumataRiding",
    "fps": 14,
    "bg": "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
    "frames": sumata_a,
    "hasSteam": True,
    "align": {"x": 0, "y": 0, "w": 1920, "h": 1280}
})

# ================= 12. 深夜卧室夜袭与呆毛怪兽 =================
ahoge_frames = find_files("11_夜袭与梦境动态(88帧)", "nightVisit_Imouto_AhogeMonster")
if ahoge_frames:
    scenes.append({
        "category": "🌙 深夜日常 · 卧室夜袭",
        "title": "呆毛夜袭怪兽连贯大动态 (72帧)",
        "desc": "深夜推开房门，妹妹头顶上的呆毛如同拥有独立生命般的奇妙可爱互动",
        "codeInfo": "插件: QJ.MPMZ.tl._nightVisitImoutoAhogeMonster",
        "fps": 12,
        "frames": ahoge_frames[:40],
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

# ================= 13. 深渊地下城与战斗切片 =================
death_attack = find_files("21_动作切片库(ActionSeq_2300多帧)", "DEATH_attack3")
if death_attack:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "💀 冥界死神 BOSS 攻击招式 (70帧华丽大招)",
        "desc": "地下城深处震撼的BOSS死神镰刀斩击与暗黑魔法爆发",
        "codeInfo": "动作序列: DEATH_attack3 (70帧连贯切片)",
        "fps": 16,
        "bg": "./06_浴室场景与光影(8张)/bathroom_night_lightOn_bathtubCoverOpen.png",
        "frames": death_attack,
        "align": {"x": 300, "y": 50, "w": 1320, "h": 980}
    })

kuroha_frames = find_files("21_动作切片库(ActionSeq_2300多帧)", "kurohanyan")
if kuroha_frames:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "🐱 萌系黑猫娘巡逻与动作 (60帧连贯)",
        "desc": "探索迷雾迷宫时的黑猫娘同伴，灵动雀跃的猫耳与轻巧步伐",
        "codeInfo": "动作切片: kurohanyan",
        "fps": 14,
        "frames": kuroha_frames[:60],
        "align": {"x": 400, "y": 100, "w": 1120, "h": 880}
    })

pillar_frames = find_files("21_动作切片库(ActionSeq_2300多帧)", "PillarOfSeal_Active")
if pillar_frames:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "⚡ 深渊封印石柱激活光效 (32帧魔法光芒)",
        "desc": "解开地下城古老机关，符文石柱绽放出璀璨的神圣光柱",
        "codeInfo": "动作切片: PillarOfSeal_Active",
        "fps": 12,
        "frames": pillar_frames,
        "align": {"x": 450, "y": 50, "w": 1020, "h": 980}
    })

pipo_effect = find_files("21_动作切片库(ActionSeq_2300多帧)", "pipofm-fullscreeneffect")
if pipo_effect:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "🔥 冰火魔法全屏特效爆炸 (30帧光影)",
        "desc": "RPG 顶级技能全屏渲染粒子特效，绚丽的光束在视野中爆开",
        "codeInfo": "特效切片: pipofm-fullscreeneffect",
        "fps": 15,
        "frames": pipo_effect,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })

# --- 更多客厅心动与自慰阶段 ---
onani_a = find_files("16_客厅秘密自慰窥视(169帧)", "ImoutoOnaniSecretly_actionA")
if onani_a:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅沙发秘密自慰 · 阶段A探寻抚摸 (8帧)",
        "desc": "指尖轻轻探寻的微弱试探，脸颊泛红的羞怯模样",
        "codeInfo": "动作: ImoutoOnaniSecretly_actionA",
        "fps": 7,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": onani_a,
        "align": {"x": 580, "y": 100, "w": 760, "h": 980}
    })

onani_b = find_files("16_客厅秘密自慰窥视(169帧)", "ImoutoOnaniSecretly_actionB")
if onani_b:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅沙发秘密自慰 · 阶段B深入轻揉 (6帧)",
        "desc": "渐入佳境的轻微抽动与沉醉喘息",
        "codeInfo": "动作: ImoutoOnaniSecretly_actionB",
        "fps": 8,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": onani_b,
        "align": {"x": 580, "y": 100, "w": 760, "h": 980}
    })

living_scared = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "[NSFW]livingRoom_ImoutoScared_segs_actionA")
if living_scared:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅紧张骑乘位 · 害怕被发现 (12帧动作)",
        "desc": "随时可能有人走过的客厅，提心吊胆却又无法自拔的激烈反差",
        "codeInfo": "插件: QJ.MPMZ.tl.livingRoomImoutoScaredKijoui",
        "fps": 11,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": living_scared,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

tv_shasei = find_files("03_客厅温馨生活与汉堡排料理(365帧)", "[NSFW]livingRoom_watchTVTogether_reverseCowgirl_alt_ahegao_shasei")
if tv_shasei:
    scenes.append({
        "category": "📺 客厅心动 · 看电视与秘密自慰",
        "title": "客厅看电视反向坐位 · 绝顶射精 (16帧连贯)",
        "desc": "高潮喷涌时紧紧拥抱的释放瞬间",
        "codeInfo": "动作: livingRoom_watchTVTogether_reverseCowgirl_alt_ahegao_shasei",
        "fps": 12,
        "bg": "./03_客厅温馨生活与汉堡排料理(365帧)/livingRoom_day_background.png",
        "frames": tv_shasei,
        "align": {"x": 200, "y": 0, "w": 1520, "h": 1080}
    })

# --- 更多卧室可爱微动 ---
rub_eyes = find_files("04_妹妹卧室与膝枕日常(207帧)", "sis_chibi_normal_rubEyes")
if rub_eyes:
    scenes.append({
        "category": "🛌 妹妹卧室与膝枕日常",
        "title": "揉眼睛与打哈欠可爱微动 (12帧)",
        "desc": "像小猫咪一样用手背揉着发酸的双眼，迷迷糊糊的治愈神态",
        "codeInfo": "动作: sis_chibi_normal_rubEyes",
        "fps": 6,
        "frames": rub_eyes,
        "align": {"x": 400, "y": 100, "w": 1100, "h": 900}
    })

watering = find_files("04_妹妹卧室与膝枕日常(207帧)", "sis_room_wateringTheFlowers")
if watering:
    scenes.append({
        "category": "🛌 妹妹卧室与膝枕日常",
        "title": "阳台给小花浇水日常 (4帧微动)",
        "desc": "拎着小喷壶细心浇灌窗台上的绿植，阳光落在发梢上的日常一瞥",
        "codeInfo": "插件: QJ.MPMZ.tl._imoutoUtilImoutoWateringTheFlowers",
        "fps": 4,
        "frames": watering,
        "align": {"x": 350, "y": 50, "w": 1200, "h": 950}
    })

# --- 更多淋浴动作差分 ---
shower_c = find_files("18_淋浴隔门窥视(167帧)", "imouto_shower_actionC")
if shower_c:
    scenes.append({
        "category": "🚿 淋浴隔门水花窥视 (167帧)",
        "title": "淋浴间水花洗浴 C 动作 (16帧)",
        "desc": "泡沫顺着肩膀滑下，背对着门外的迷人弧度",
        "codeInfo": "动作: imouto_shower_actionC",
        "fps": 8,
        "bg": "./18_淋浴隔门窥视(167帧)/washroom_nozoku_background.png",
        "frames": shower_c,
        "hasSteam": True,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })

shower_f = find_files("18_淋浴隔门窥视(167帧)", "imouto_shower_actionF")
if shower_f:
    scenes.append({
        "category": "🚿 淋浴隔门水花窥视 (167帧)",
        "title": "淋浴间水花洗浴 F 动作 (22帧连贯)",
        "desc": "抬起单腿清洗脚踝的优美身姿",
        "codeInfo": "动作: imouto_shower_actionF",
        "fps": 10,
        "bg": "./18_淋浴隔门窥视(167帧)/washroom_nozoku_background.png",
        "frames": shower_f,
        "hasSteam": True,
        "align": {"x": 0, "y": 0, "w": 1920, "h": 1080}
    })

# --- 更多深渊地下城与Boss动作切片 ---
demon_pride = find_files("21_动作切片库(ActionSeq_2300多帧)", "DemonOfPride_charge")
if demon_pride:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "👿 傲慢恶魔蓄力大招 (36帧华丽切片)",
        "desc": "地下城精英BOSS傲慢恶魔的黑色魔力聚集与爆发",
        "codeInfo": "动作切片: DemonOfPride_charge",
        "fps": 14,
        "frames": demon_pride,
        "align": {"x": 350, "y": 100, "w": 1220, "h": 900}
    })

lost_mecha = find_files("21_动作切片库(ActionSeq_2300多帧)", "lost_mecha")
if lost_mecha:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "🤖 失落文明机械遗迹防卫者 (64帧连贯)",
        "desc": "深渊齿轮与古代机械科技构造的遗迹守卫巡航",
        "codeInfo": "动作切片: lost_mecha",
        "fps": 14,
        "frames": lost_mecha,
        "align": {"x": 350, "y": 100, "w": 1220, "h": 900}
    })

death_teleport = find_files("21_动作切片库(ActionSeq_2300多帧)", "DEATH_teleport in")
if death_teleport:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "🌌 死神 BOSS 撕裂虚空降临 (30帧瞬移)",
        "desc": "从黑夜空间裂隙中缓缓踏出的压迫感身影",
        "codeInfo": "动作切片: DEATH_teleport in",
        "fps": 12,
        "frames": death_teleport,
        "align": {"x": 350, "y": 100, "w": 1220, "h": 900}
    })

bunny_vending = find_files("21_动作切片库(ActionSeq_2300多帧)", "bunnyVendingMachine")
if bunny_vending:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "🐰 兔兔自动贩卖机投币出货 (31帧可爱切片)",
        "desc": "地下城奇妙补给站，呆萌的兔兔招牌与机械齿轮滚动",
        "codeInfo": "动作切片: bunnyVendingMachine",
        "fps": 12,
        "frames": bunny_vending,
        "align": {"x": 450, "y": 50, "w": 1020, "h": 980}
    })

exp_ice = find_files("21_动作切片库(ActionSeq_2300多帧)", "exp ice")
if exp_ice:
    scenes.append({
        "category": "⚔️ 深渊地下城与战斗切片",
        "title": "❄️ 极寒冰霜魔法爆炸特效 (20帧粒子)",
        "desc": "寒冰碎片向四周飞溅的华丽冰棱结晶光芒",
        "codeInfo": "特效切片: exp ice",
        "fps": 12,
        "frames": exp_ice,
        "align": {"x": 400, "y": 50, "w": 1120, "h": 980}
    })

print(f"Total compiled animation scenes: {len(scenes)}")

# Convert scenes to JSON string
scenes_json = json.dumps(scenes, ensure_ascii=False, indent=2)

html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>《薄妹 1.3》全游戏动态动画演播全集 (Live2D & 序列帧原生引擎)</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #07080d;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }}
    header {{
      background: #0f111a;
      border-bottom: 1px solid #1c2030;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      z-index: 30;
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand-icon {{
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 16px rgba(236,72,153,0.45);
    }}
    .brand-title {{
      font-size: 17px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.5px;
    }}
    .brand-subtitle {{
      font-size: 11px;
      color: #94a3b8;
    }}
    .header-info {{
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: #64748b;
    }}
    .main-layout {{
      display: flex;
      flex: 1;
      height: calc(100vh - 63px);
    }}
    
    /* 左侧分类导航菜单 */
    .sidebar {{
      width: 340px;
      background: #0b0d14;
      border-right: 1px solid #181b28;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .sidebar-search {{
      background: #121520;
      border: 1px solid #202538;
      border-radius: 8px;
      padding: 8px 12px;
      color: #f1f5f9;
      font-size: 12px;
      margin-bottom: 8px;
      outline: none;
      transition: all 0.2s;
    }}
    .sidebar-search:focus {{
      border-color: #ec4899;
      box-shadow: 0 0 10px rgba(236,72,153,0.25);
    }}
    .nav-group-title {{
      font-size: 11px;
      font-weight: bold;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 10px;
      margin-bottom: 4px;
      padding-left: 8px;
    }}
    .nav-btn {{
      background: #131622;
      border: 1px solid #1c2133;
      color: #cbd5e1;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.16s;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .nav-btn:hover {{
      background: #1a1e2e;
      border-color: #3b82f6;
      color: #ffffff;
      transform: translateX(3px);
    }}
    .nav-btn.active {{
      background: linear-gradient(135deg, rgba(236,72,153,0.22), rgba(139,92,246,0.26));
      border-color: #ec4899;
      color: #f472b6;
      box-shadow: 0 0 16px rgba(236,72,153,0.18);
    }}
    .nav-badge {{
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 5px;
      background: #08090f;
      color: #94a3b8;
    }}
    .nav-btn.active .nav-badge {{
      background: rgba(236,72,153,0.3);
      color: #fbcfe8;
    }}

    /* 中间播放主舞台 */
    .stage-container {{
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #040508;
      position: relative;
    }}
    .stage {{
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: radial-gradient(circle at center, #0e111a 0%, #030406 100%);
    }}
    .stage-canvas-box {{
      position: relative;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 45px rgba(0,0,0,0.9);
      border-radius: 8px;
      overflow: hidden;
      background: #000;
    }}
    #stage-canvas {{
      width: 100%;
      height: 100%;
      display: block;
    }}
    .steam-layer {{
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      mix-blend-mode: screen;
      opacity: 0.6;
      pointer-events: none;
      animation: steamFloat 4s ease-in-out infinite alternate;
      display: none;
    }}
    @keyframes steamFloat {{
      0% {{ opacity: 0.4; transform: scale(1); }}
      100% {{ opacity: 0.75; transform: scale(1.03); }}
    }}

    /* 场景信息浮窗 */
    .scene-meta {{
      position: absolute;
      top: 18px;
      left: 22px;
      background: rgba(11, 14, 22, 0.88);
      border: 1px solid rgba(236,72,153,0.35);
      padding: 10px 16px;
      border-radius: 12px;
      backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.6);
      z-index: 20;
      max-width: 520px;
      pointer-events: none;
    }}
    .scene-meta-title {{
      font-size: 15px;
      font-weight: bold;
      color: #fbcfe8;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .scene-meta-desc {{
      font-size: 12px;
      color: #94a3b8;
      margin-top: 3px;
      line-height: 1.4;
    }}
    .code-badge {{
      font-size: 11px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid #334155;
      padding: 2px 8px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: Consolas, monospace;
      margin-top: 5px;
      display: inline-block;
    }}

    /* 底部播控条 */
    .control-bar {{
      height: 86px;
      background: #0d0f17;
      border-top: 1px solid #171a26;
      padding: 10px 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
      z-index: 25;
    }}
    .slider-row {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    input[type=range] {{
      flex: 1;
      accent-color: #ec4899;
      cursor: pointer;
    }}
    .action-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .btn-group {{
      display: flex;
      align-items: center;
      gap: 7px;
    }}
    .ctrl-btn {{
      background: #171b28;
      border: 1px solid #23283b;
      color: #f1f5f9;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }}
    .ctrl-btn:hover {{
      background: #22273b;
      border-color: #3b82f6;
    }}
    .ctrl-btn.active {{
      background: #ec4899;
      border-color: #f472b6;
      color: #fff;
      box-shadow: 0 0 10px rgba(236,72,153,0.35);
    }}
    .info-label {{
      font-size: 12px;
      color: #94a3b8;
      font-family: Consolas, monospace;
    }}
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🎬</div>
      <div>
        <div class="brand-title">《存在感薄弱妹妹》全游戏动态动画演播全集 (Live2D & 序列帧原生引擎)</div>
        <div class="brand-subtitle">游戏自研 Action Sequence 切片内核 · 1920×1080 硬件级绝对坐标 · 涵盖全游戏 53 组完整动态动画</div>
      </div>
    </div>
    <div class="header-info">
      <div>💡 快捷键：<code style="color: #f472b6;">空格</code> 播放/暂停，<code style="color: #f472b6;">← / →</code> 逐帧微调</div>
    </div>
  </header>

  <div class="main-layout">
    <!-- 左侧场景列表 -->
    <div class="sidebar" id="sidebar-container">
      <input type="text" class="sidebar-search" id="scene-search" placeholder="🔍 搜索场景名称、关键词..." oninput="filterScenes(this.value)">
      <div id="nav-list"></div>
    </div>

    <!-- 中间播放舞台 -->
    <div class="stage-container">
      <div class="stage">
        <!-- 场景描述浮窗 -->
        <div class="scene-meta">
          <div id="meta-title" class="scene-meta-title">🔥 场景加载中...</div>
          <div id="meta-desc" class="scene-meta-desc">...</div>
          <div id="code-meta" class="code-badge">游戏内核驱动</div>
        </div>

        <!-- 1920x1080 游戏硬件级画布容器 -->
        <div class="stage-canvas-box" id="canvas-box">
          <canvas id="stage-canvas" width="1920" height="1080"></canvas>
          <img id="layer-steam" class="steam-layer" src="./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_Steam.png" />
        </div>
      </div>

      <!-- 底部播控条 -->
      <div class="control-bar">
        <div class="slider-row">
          <span id="curr-frame-text" class="info-label" style="min-width: 65px;">1 / 1</span>
          <input type="range" id="frame-slider" min="0" max="0" value="0" oninput="onSliderChange(this.value)">
          <span id="fps-text" class="info-label" style="min-width: 65px;">12 FPS</span>
        </div>

        <div class="action-row">
          <div class="btn-group">
            <button id="btn-prev" class="ctrl-btn" onclick="stepFrame(-1)">⏮ 上一帧</button>
            <button id="btn-play" class="ctrl-btn active" onclick="togglePlay()">⏸ 暂停</button>
            <button id="btn-next" class="ctrl-btn" onclick="stepFrame(1)">⏭ 下一帧</button>
          </div>

          <div class="btn-group">
            <span class="info-label" style="margin-right: 2px;">倍速:</span>
            <button class="ctrl-btn" onclick="setSpeed(0.5)">0.5x</button>
            <button class="ctrl-btn active" id="spd-10" onclick="setSpeed(1.0)">1.0x</button>
            <button class="ctrl-btn" onclick="setSpeed(1.5)">1.5x</button>
            <button class="ctrl-btn" onclick="setSpeed(2.0)">2.0x</button>
          </div>

          <div class="btn-group">
            <button id="btn-kao" class="ctrl-btn" onclick="cycleKao()" style="display: none;">😊 表情: 娇羞A</button>
            <button id="btn-panties" class="ctrl-btn" onclick="cyclePanties()" style="display: none;">👙 内裤: 白色</button>
            <button id="btn-cutaway" class="ctrl-btn active" onclick="toggleCutaway()" style="display: none;">🔬 断面透视</button>
            <button id="btn-semen" class="ctrl-btn" onclick="toggleSemen()" style="display: none;">💧 射精注入</button>
            <button id="btn-steam" class="ctrl-btn" onclick="toggleSteam()">💨 水汽蒸汽</button>
            <button id="btn-fullscreen" class="ctrl-btn" onclick="toggleFullscreen()">⛶ 全屏</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const SCENES = {scenes_json};

    // 图像高速缓存池
    const imageCache = new Map();
    function getImage(src) {{
      if (!src) return null;
      if (!imageCache.has(src)) {{
        const img = new Image();
        img.src = src;
        img.onload = () => renderFrame();
        imageCache.set(src, img);
      }}
      return imageCache.get(src);
    }}

    let currentSceneIdx = 0;
    let currentFrameIdx = 0;
    let isPlaying = true;
    let timer = null;
    let speedScale = 1.0;
    let steamActive = false;
    let cutawayActive = true;
    let semenActive = false;
    let kaoMode = 'kaoA'; // kaoA, kaoB, kaoC
    let pantyMode = 'whitePanties'; // whitePanties, bluePanties, pinkPanties, nude

    const canvas = document.getElementById('stage-canvas');
    const ctx = canvas.getContext('2d');

    // 构建侧边栏导航分类
    function renderSidebar(filterText = '') {{
      const navList = document.getElementById('nav-list');
      navList.innerHTML = '';

      let lastCategory = '';
      SCENES.forEach((sc, idx) => {{
        if (filterText && !sc.title.includes(filterText) && !sc.category.includes(filterText) && !sc.desc.includes(filterText)) {{
          return;
        }}

        if (sc.category !== lastCategory) {{
          lastCategory = sc.category;
          const groupTitle = document.createElement('div');
          groupTitle.className = 'nav-group-title';
          groupTitle.innerText = sc.category;
          navList.appendChild(groupTitle);
        }}

        const btn = document.createElement('button');
        btn.className = `nav-btn ${{idx === currentSceneIdx ? 'active' : ''}}`;
        btn.id = `nav-item-${{idx}}`;
        btn.onclick = () => switchScene(idx);

        const titleSpan = document.createElement('span');
        titleSpan.innerText = sc.title;

        const badge = document.createElement('span');
        badge.className = 'nav-badge';
        badge.innerText = `${{sc.frames.length}}帧`;

        btn.appendChild(titleSpan);
        btn.appendChild(badge);
        navList.appendChild(btn);
      }});
    }}

    function filterScenes(txt) {{
      renderSidebar(txt.trim());
    }}

    function initScene(idx) {{
      currentSceneIdx = idx;
      currentFrameIdx = 0;
      const sc = SCENES[idx];

      // 更新标题和描述
      document.getElementById('meta-title').innerText = sc.title;
      document.getElementById('meta-desc').innerText = sc.desc;
      document.getElementById('code-meta').innerText = sc.codeInfo || '游戏内核对齐';

      // 更新按钮高亮
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById(`nav-item-${{idx}}`);
      if (activeBtn) activeBtn.classList.add('active');

      // 水雾控制
      const steamBtn = document.getElementById('btn-steam');
      if (sc.hasSteam) {{
        steamBtn.style.display = 'flex';
      }} else {{
        steamBtn.style.display = 'none';
        setSteam(false);
      }}

      // 断面透视
      const cutawayBtn = document.getElementById('btn-cutaway');
      if (sc.hasCutaway) {{
        cutawayBtn.style.display = 'flex';
      }} else {{
        cutawayBtn.style.display = 'none';
      }}

      // 射精精液
      const semenBtn = document.getElementById('btn-semen');
      if (sc.hasSemen) {{
        semenBtn.style.display = 'flex';
      }} else {{
        semenBtn.style.display = 'none';
      }}

      // 表情切换
      const kaoBtn = document.getElementById('btn-kao');
      if (sc.hasKaoSwitch) {{
        kaoBtn.style.display = 'flex';
        updateKaoBtnText();
      }} else {{
        kaoBtn.style.display = 'none';
      }}

      // 内裤款式切换 (洗手间手交)
      const pantyBtn = document.getElementById('btn-panties');
      if (sc.hasPanties) {{
        pantyBtn.style.display = 'flex';
        updatePantyBtnText();
      }} else {{
        pantyBtn.style.display = 'none';
      }}

      // 滑条范围更新
      const slider = document.getElementById('frame-slider');
      slider.max = sc.frames.length - 1;
      slider.value = 0;

      // 预加载当前场景
      preloadScene(sc);

      renderFrame();
      restartLoop();
    }}

    function preloadScene(sc) {{
      if (sc.bg) getImage(sc.bg);
      if (sc.fg) getImage(sc.fg);
      if (sc.body) getImage(sc.body);
      if (sc.head) getImage(sc.head);
      sc.frames.forEach(f => getImage(f));
      if (sc.heads) {{
        ['kaoA', 'kaoB', 'kaoC'].forEach(m => {{
          sc.heads.forEach(h => getImage(h.replace('kaoA', m)));
        }});
      }}
      if (sc.cutaways) sc.cutaways.forEach(c => getImage(c));
      if (sc.semens) sc.semens.forEach(s => getImage(s));
    }}

    function switchScene(idx) {{
      initScene(idx);
    }}

    function renderFrame() {{
      const sc = SCENES[currentSceneIdx];
      ctx.clearRect(0, 0, 1920, 1080);

      // 1. 绘制背景 (1920x1080)
      if (sc.bg) {{
        const bgImg = getImage(sc.bg);
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {{
          ctx.drawImage(bgImg, 0, 0, 1920, 1080);
        }}
      }}

      // 2. 绘制基础身体 (如果有单独 body 图层)
      if (sc.body) {{
        const bImg = getImage(sc.body);
        if (bImg && bImg.complete && bImg.naturalWidth > 0) {{
          const a = sc.align || {{x: 0, y: 0, w: 1920, h: 1080}};
          ctx.drawImage(bImg, a.x, a.y, a.w, a.h);
        }}
      }}

      // 3. 绘制主动作/主切片
      const frameSrc = sc.frames[currentFrameIdx];
      const frameImg = getImage(frameSrc);

      if (sc.type === 'tachiBakku') {{
        // --- 站立后入内核对齐 ---
        if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {{
          ctx.drawImage(frameImg, 0, 0, 1400, 1080);
        }}
        // 头部
        if (sc.heads && sc.heads[currentFrameIdx]) {{
          const headSrc = sc.heads[currentFrameIdx].replace('kaoA', kaoMode);
          const headImg = getImage(headSrc);
          if (headImg && headImg.complete && headImg.naturalWidth > 0) {{
            ctx.drawImage(headImg, 860, 70, 540, 700);
          }}
        }}
        // 剖面
        if (cutawayActive && sc.cutaways && sc.cutaways[currentFrameIdx]) {{
          const cutawayImg = getImage(sc.cutaways[currentFrameIdx]);
          if (cutawayImg && cutawayImg.complete && cutawayImg.naturalWidth > 0) {{
            ctx.drawImage(cutawayImg, 450, 800, 350, 210);
          }}
        }}
        // 精液
        if (semenActive && sc.semens && sc.semens[currentFrameIdx]) {{
          const semenImg = getImage(sc.semens[currentFrameIdx]);
          if (semenImg && semenImg.complete && semenImg.naturalWidth > 0) {{
            ctx.drawImage(semenImg, 200, 700, 360, 380);
          }}
        }}
      }} else if (sc.type === 'udeTsukamiBakku') {{
        // --- 抓手后入内核对齐 ---
        if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {{
          ctx.drawImage(frameImg, 150, -80, 1120 * 1.1, 1080 * 1.1);
        }}
        if (cutawayActive && sc.cutaways && sc.cutaways[currentFrameIdx]) {{
          const cutawayImg = getImage(sc.cutaways[currentFrameIdx]);
          if (cutawayImg && cutawayImg.complete && cutawayImg.naturalWidth > 0) {{
            ctx.drawImage(cutawayImg, 370, 690, 720 * 1.1, 380 * 1.1);
          }}
        }}
      }} else {{
        // 普通场景按照指定坐标与尺寸居中/定位渲染
        const a = sc.align || {{x: 0, y: 0, w: 1920, h: 1080}};
        if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {{
          ctx.drawImage(frameImg, a.x, a.y, a.w, a.h);
        }}

        // 内裤图层叠加 (洗手间手交)
        if (sc.hasPanties && pantyMode !== 'nude' && sc.pantiesPrefix) {{
          const pSrc = `${{sc.pantiesPrefix}}${{pantyMode}}_${{currentFrameIdx + 1}}.png`;
          const pImg = getImage(pSrc);
          if (pImg && pImg.complete && pImg.naturalWidth > 0) {{
            ctx.drawImage(pImg, a.x, a.y, a.w, a.h);
          }}
        }}

        // 单独头部表情
        if (sc.head) {{
          const hImg = getImage(sc.head);
          if (hImg && hImg.complete && hImg.naturalWidth > 0) {{
            ctx.drawImage(hImg, a.x, a.y, a.w, a.h);
          }}
        }}
      }}

      // 4. 绘制前景置物架/镜框
      if (sc.fg) {{
        const fgImg = getImage(sc.fg);
        if (fgImg && fgImg.complete && fgImg.naturalWidth > 0) {{
          ctx.drawImage(fgImg, 0, 0, 1920, 1080);
        }}
      }}

      // 更新信息显示
      document.getElementById('curr-frame-text').innerText = `${{currentFrameIdx + 1}} / ${{sc.frames.length}}`;
      document.getElementById('frame-slider').value = currentFrameIdx;
      
      const realFps = Math.round(sc.fps * speedScale);
      document.getElementById('fps-text').innerText = `${{realFps}} FPS`;
    }}

    function restartLoop() {{
      if (timer) clearInterval(timer);
      const sc = SCENES[currentSceneIdx];
      if (sc.frames.length <= 1) return;

      const realFps = Math.max(1, Math.round(sc.fps * speedScale));
      timer = setInterval(() => {{
        if (!isPlaying) return;
        currentFrameIdx = (currentFrameIdx + 1) % sc.frames.length;
        renderFrame();
      }}, 1000 / realFps);
    }}

    function togglePlay() {{
      isPlaying = !isPlaying;
      const btn = document.getElementById('btn-play');
      btn.innerText = isPlaying ? '⏸ 暂停' : '▶ 播放';
      if (isPlaying) btn.classList.add('active');
      else btn.classList.remove('active');
    }}

    function stepFrame(step) {{
      const sc = SCENES[currentSceneIdx];
      if (sc.frames.length <= 1) return;
      if (isPlaying) togglePlay();
      currentFrameIdx = (currentFrameIdx + step + sc.frames.length) % sc.frames.length;
      renderFrame();
    }}

    function onSliderChange(val) {{
      if (isPlaying) togglePlay();
      currentFrameIdx = parseInt(val);
      renderFrame();
    }}

    function setSpeed(scale) {{
      speedScale = scale;
      document.querySelectorAll('.btn-group button').forEach(b => {{
        if (b.innerText.endsWith('x')) {{
          if (b.innerText === `${{scale.toFixed(1)}}x`) b.classList.add('active');
          else b.classList.remove('active');
        }}
      }});
      restartLoop();
    }}

    function toggleSteam() {{
      setSteam(!steamActive);
    }}

    function setSteam(active) {{
      steamActive = active;
      const steamEl = document.getElementById('layer-steam');
      const steamBtn = document.getElementById('btn-steam');
      steamEl.style.display = active ? 'block' : 'none';
      if (active) steamBtn.classList.add('active');
      else steamBtn.classList.remove('active');
    }}

    function toggleCutaway() {{
      cutawayActive = !cutawayActive;
      const cutawayBtn = document.getElementById('btn-cutaway');
      if (cutawayActive) cutawayBtn.classList.add('active');
      else cutawayBtn.classList.remove('active');
      renderFrame();
    }}

    function toggleSemen() {{
      semenActive = !semenActive;
      const semenBtn = document.getElementById('btn-semen');
      if (semenActive) semenBtn.classList.add('active');
      else semenBtn.classList.remove('active');
      renderFrame();
    }}

    function cycleKao() {{
      if (kaoMode === 'kaoA') kaoMode = 'kaoB';
      else if (kaoMode === 'kaoB') kaoMode = 'kaoC';
      else kaoMode = 'kaoA';
      updateKaoBtnText();
      renderFrame();
    }}

    function updateKaoBtnText() {{
      const kaoBtn = document.getElementById('btn-kao');
      const labels = {{
        'kaoA': '😊 表情: 娇羞A',
        'kaoB': '😍 表情: 恍惚B',
        'kaoC': '🤤 表情: 失神C'
      }};
      kaoBtn.innerText = labels[kaoMode] || '😊 表情切换';
    }}

    function cyclePanties() {{
      const modes = ['whitePanties', 'bluePanties', 'pinkPanties', 'nude'];
      const curIdx = modes.indexOf(pantyMode);
      pantyMode = modes[(curIdx + 1) % modes.length];
      updatePantyBtnText();
      renderFrame();
    }}

    function updatePantyBtnText() {{
      const btn = document.getElementById('btn-panties');
      const labels = {{
        'whitePanties': '👙 内裤: 纯白',
        'bluePanties': '👙 内裤: 天蓝',
        'pinkPanties': '👙 内裤: 粉嫩',
        'nude': '🚫 内裤: 真空'
      }};
      btn.innerText = labels[pantyMode] || '👙 内裤款式';
    }}

    function toggleFullscreen() {{
      const box = document.getElementById('canvas-box');
      if (!document.fullscreenElement) {{
        box.requestFullscreen().catch(err => alert(`全屏错误: ${{err.message}}`));
      }} else {{
        document.exitFullscreen();
      }}
    }}

    // 键盘快捷键监听
    window.addEventListener('keydown', (e) => {{
      if (e.code === 'Space') {{
        e.preventDefault();
        togglePlay();
      }} else if (e.code === 'ArrowLeft') {{
        e.preventDefault();
        stepFrame(-1);
      }} else if (e.code === 'ArrowRight') {{
        e.preventDefault();
        stepFrame(1);
      }}
    }});

    // 初始化渲染菜单与启动第一幕
    renderSidebar();
    initScene(0);
  </script>
</body>
</html>
"""

with open(target_html, "w", encoding="utf-8") as f:
    f.write(html_template)

print(f"Master Animation Player generated successfully at:\n{target_html}")
