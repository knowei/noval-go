import os

base_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www"
pic_dir = os.path.join(base_dir, "img", "pictures")

def check_pictures():
    items = os.listdir(pic_dir)
    dirs = [d for d in items if os.path.isdir(os.path.join(pic_dir, d))]
    files = [f for f in items if os.path.isfile(os.path.join(pic_dir, f))]
    print(f"Total subdirectories in img/pictures: {len(dirs)}")
    for d in dirs:
        sub_items = os.listdir(os.path.join(pic_dir, d))
        print(f"  [{d}] contains {len(sub_items)} files. Samples: {sub_items[:5]}")
    
    print(f"\nTotal root files in img/pictures: {len(files)}")
    print("Sample root files:", files[:20])

    # Check whether .png_ is standard PNG or encrypted
    sample_file = None
    for f in files:
        if f.endswith('.png_'):
            sample_file = os.path.join(pic_dir, f)
            break
    if sample_file:
        with open(sample_file, "rb") as f:
            header = f.read(16)
            print("\nHeader of", os.path.basename(sample_file), ":", header)

if __name__ == "__main__":
    check_pictures()
