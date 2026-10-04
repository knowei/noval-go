import os
import shutil
import time

key = bytes.fromhex("e5754b57c4980b5dd252d11de99430ec")
src_base = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\img"
dest_base = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG"

category_map = {
    # 核心日常与立绘
    r"pictures\imoto_tachie": "01_妹妹动态立绘_乳摇与换装(24张)",
    r"pictures\washroom_morning_event": "02_早晨洗漱与刷牙动态(234帧)",
    r"pictures\living_room": "03_客厅温馨生活与汉堡排料理(365帧)",
    r"pictures\sis_room": "04_妹妹卧室与膝枕日常(207帧)",
    r"pictures\game_itazura": "05_打游戏与恶作剧动态(311帧)",
    r"pictures\bathroom": "06_浴室场景与光影(8张)",
    r"pictures\bathroom_event": "07_浴室沐浴与擦背动态(131帧)",
    r"pictures\kitchen_event": "08_厨房做饭互动(172帧)",
    r"pictures\crafting_scene": "09_厨房料理调理台(70张)",
    r"pictures\diningRoom": "10_餐厅吃饭日常(13张)",
    r"pictures\nightmare": "11_夜袭与梦境动态(88帧)",
    r"minimap": "12_深渊地下城与迷雾小地图(43张)",
    
    # 亲密高帧率互动
    r"pictures\washroom_tekoki": "13_洗手间高帧率连贯互动(559帧)",
    r"pictures\[NSFW]bathroom_homban": "14_浴室亲密本番(260帧)",
    r"pictures\[NSFW]bathroom_blowjob": "15_浴室心动奉仕(175帧)",
    r"pictures\[NSFW]living_room_ImoutoOnani": "16_客厅秘密自慰窥视(169帧)",
    r"pictures\toilet_nozoku": "17_厕所窥视差分(129帧)",
    r"pictures\washroom_nozoku": "18_淋浴隔门窥视(167帧)",
    r"pictures\bathroom_sumata": "19_浴室素股亲密(96帧)",
    r"pictures\[NSFW]hotWeatherEvent": "20_酷暑充气水池(14帧)",

    # 动作切片 (仅取样或完整导出)
    r"Special__actionSeq": "21_动作切片库(ActionSeq_2300多帧)",
}

def decrypt_file(src_path, dst_path):
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(src_path, "rb") as f:
        header = f.read(16)
        if header.startswith(b"RPGMV") or header.startswith(b"RPGMZ"):
            enc = f.read(16)
            rest = f.read()
            dec = bytes([b ^ key[i] for i, b in enumerate(enc)])
            with open(dst_path, "wb") as out_f:
                out_f.write(dec + rest)
        else:
            f.seek(0)
            with open(dst_path, "wb") as out_f:
                out_f.write(f.read())

def export_all():
    print(f"Starting decryption and export to:\n  {dest_base}\n")
    start = time.time()
    total_files = 0

    for rel_src, folder_name in category_map.items():
        full_src = os.path.join(src_base, rel_src)
        full_dest = os.path.join(dest_base, folder_name)
        if not os.path.exists(full_src):
            print(f"Skipping missing: {rel_src}")
            continue

        count = 0
        for root, dirs, files in os.walk(full_src):
            for file in files:
                if file.endswith(".png_") or file.endswith(".png"):
                    src_f = os.path.join(root, file)
                    rel_to_folder = os.path.relpath(src_f, full_src)
                    out_fname = rel_to_folder.replace(".png_", ".png")
                    dst_f = os.path.join(full_dest, out_fname)
                    decrypt_file(src_f, dst_f)
                    count += 1
        print(f"[{folder_name}] exported {count} files.")
        total_files += count

    elapsed = time.time() - start
    print(f"\nDone! Exported {total_files} decrypted PNG images in {elapsed:.2f}s.")

if __name__ == "__main__":
    export_all()
