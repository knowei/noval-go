import json
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

base_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www"

def read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def inspect_cn():
    cn_dir = os.path.join(base_dir, "data", "CN")
    
    # 1. Game Terms
    terms_path = os.path.join(cn_dir, "GameTermsTextCN.json")
    if os.path.exists(terms_path):
        print("=== Game Terms ===")
        print(json.dumps(read_json(terms_path), ensure_ascii=False, indent=2)[:500])

    # 2. System Feature Text
    feat_path = os.path.join(cn_dir, "systemFeatureText_CN.json")
    if os.path.exists(feat_path):
        print("\n=== System Features ===")
        feats = read_json(feat_path)
        for k, v in list(feats.items())[:15]:
            print(f"[{k}] {v}")

    # 3. Achievements
    ach_path = os.path.join(cn_dir, "AchievementsLocale_CN.json")
    if os.path.exists(ach_path):
        print("\n=== Achievements (Sample) ===")
        achs = read_json(ach_path)
        for k, v in list(achs.items())[:10]:
            print(f"[{k}] {v}")

    # 4. Map Common Events & Dialogue sample
    dia_files = [f for f in os.listdir(cn_dir) if f.startswith("MapEventDialogue") or f.startswith("MapCommon")]
    print(f"\n=== Dialogue files found: {len(dia_files)} ===")
    for df in dia_files[:3]:
        fpath = os.path.join(cn_dir, df)
        data = read_json(fpath)
        print(f"\n--- {df} (Sample 5 entries) ---")
        items = list(data.items()) if isinstance(data, dict) else enumerate(data)
        for k, v in list(items)[:5]:
            print(f"  {k}: {str(v)[:120]}")

if __name__ == "__main__":
    inspect_cn()
