import json
import os
import glob

base_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www"

def inspect():
    # 1. System
    sys_path = os.path.join(base_dir, "data", "System.json")
    if os.path.exists(sys_path):
        with open(sys_path, "r", encoding="utf-8") as f:
            sys_data = json.load(f)
            print("=== Game Title ===")
            print(sys_data.get("gameTitle"))

    # 2. Map Infos
    map_path = os.path.join(base_dir, "data", "MapInfos.json")
    if os.path.exists(map_path):
        with open(map_path, "r", encoding="utf-8") as f:
            maps = json.load(f)
            print(f"\n=== Total Maps: {len([m for m in maps if m])} ===")
            for m in maps:
                if m:
                    print(f"[{m.get('id'):03d}] {m.get('name')} (Parent: {m.get('parentId')})")

    # 3. Actors
    actor_path = os.path.join(base_dir, "data", "Actors.json")
    if os.path.exists(actor_path):
        with open(actor_path, "r", encoding="utf-8") as f:
            actors = json.load(f)
            print(f"\n=== Total Actors: {len([a for a in actors if a])} ===")
            for a in actors:
                if a:
                    print(f"Actor {a.get('id')}: {a.get('name')} | Nickname: {a.get('nickname')}")
                    if a.get('profile'):
                        print(f"  Profile: {a.get('profile')}")

    # 4. CN Dialogues and texts overview
    cn_dir = os.path.join(base_dir, "data", "CN")
    if os.path.exists(cn_dir):
        print("\n=== CN Localization Files ===")
        for fname in os.listdir(cn_dir):
            fpath = os.path.join(cn_dir, fname)
            size = os.path.getsize(fpath)
            print(f"  {fname} ({size} bytes)")

    # 5. Check Pictures
    pic_dir = os.path.join(base_dir, "img", "pictures")
    if os.path.exists(pic_dir):
        pics = os.listdir(pic_dir)
        print(f"\n=== Total Pictures in img/pictures: {len(pics)} ===")
        print("Sample pictures:", pics[:30])

    # 6. Check Faces & Characters
    faces_dir = os.path.join(base_dir, "img", "faces")
    if os.path.exists(faces_dir):
        faces = os.listdir(faces_dir)
        print(f"\n=== Total Faces: {len(faces)} ===", faces)

    chars_dir = os.path.join(base_dir, "img", "characters")
    if os.path.exists(chars_dir):
        chars = os.listdir(chars_dir)
        print(f"\n=== Total Characters: {len(chars)} ===", chars[:20])

if __name__ == "__main__":
    inspect()
