import os
import json
import shutil

base_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www"
out_dir = r"d:\pro\work\proj\googleAI\noval-go\extracted_assets\thin_sister"
key = bytes.fromhex("e5754b57c4980b5dd252d11de99430ec")

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
            # Already raw or standard
            f.seek(0)
            with open(dst_path, "wb") as out_f:
                out_f.write(f.read())

def extract_key_assets():
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Extract Tachie
    tachie_dir = os.path.join(base_dir, "img", "pictures", "imoto_tachie")
    if os.path.exists(tachie_dir):
        for f in os.listdir(tachie_dir):
            if f.endswith(".png_"):
                src = os.path.join(tachie_dir, f)
                dst = os.path.join(out_dir, "tachie", f[:-5] + ".png")
                decrypt_file(src, dst)
        print("Tachie extracted.")

    # 2. Extract key event / CG samples
    sample_categories = [
        ("living_room", ["CookingShow_Hamburger_Pre1.png_", "livingRoom_Imouto_embracing.png_"]),
        ("sis_room", ["hizamakura_back.png_", "bunnyDoll1.png_"]),
        ("diningRoom", ["diningRoom_ImoutoGorge1.png_"]),
        ("bathroom", ["bathroom_dusk_lightOn.png_"]),
        ("crafting_scene", ["cook_slot_background.png_", "crafting0.png_"]),
        ("map_name", ["abyss_introduction0.png_"]),
    ]

    for cat, flist in sample_categories:
        cat_src = os.path.join(base_dir, "img", "pictures", cat)
        if os.path.exists(cat_src):
            for f in flist:
                f_path = os.path.join(cat_src, f)
                if os.path.exists(f_path):
                    dst = os.path.join(out_dir, "samples", cat, f.replace(".png_", ".png"))
                    decrypt_file(f_path, dst)
            # also pick first 3 files
            for f in os.listdir(cat_src)[:3]:
                if f.endswith(".png_"):
                    f_path = os.path.join(cat_src, f)
                    dst = os.path.join(out_dir, "samples", cat, f.replace(".png_", ".png"))
                    decrypt_file(f_path, dst)
    print("Sample CGs and scenes extracted.")

    # 3. Extract Titles & Game Icons
    titles_dir = os.path.join(base_dir, "img", "titles1")
    if os.path.exists(titles_dir):
        for f in os.listdir(titles_dir):
            if f.endswith(".png_"):
                decrypt_file(os.path.join(titles_dir, f), os.path.join(out_dir, "titles", f[:-5] + ".png"))
    print("Titles extracted.")

    # 4. Extract Faces
    faces_dir = os.path.join(base_dir, "img", "faces")
    if os.path.exists(faces_dir):
        for f in os.listdir(faces_dir):
            if f.endswith(".png_"):
                decrypt_file(os.path.join(faces_dir, f), os.path.join(out_dir, "faces", f[:-5] + ".png"))
    print("Faces extracted.")

if __name__ == "__main__":
    extract_key_assets()
