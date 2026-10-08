import os
import shutil
from PIL import Image

src_dir = r"C:\Users\zheng\.gemini\antigravity\brain\a04cec19-81b5-48a6-934e-03395fa64973"
dst_dir = "web/public/assets/cards/girls_dormitory"
os.makedirs(dst_dir, exist_ok=True)

# 1. suxiaoke.png: crop from media_1791373315221.png
ss = Image.open(os.path.join(src_dir, ".user_uploaded", "media_1791373315221.png"))
# cx, cy, r
cx, cy, r = 508, 222, 27
avatar_xk = ss.crop((cx - r, cy - r, cx + r, cy + r))
avatar_xk = avatar_xk.resize((240, 240), Image.Resampling.LANCZOS)
avatar_xk.save(os.path.join(dst_dir, "suxiaoke.png"))
print("Saved suxiaoke.png")

# 2. lingyue.jpg
ly_src = os.path.join(src_dir, "lingyue_avatar_1791374396748.jpg")
ly_img = Image.open(ly_src).resize((360, 360), Image.Resampling.LANCZOS)
ly_img.save(os.path.join(dst_dir, "lingyue.jpg"), quality=95)
print("Saved lingyue.jpg")

# 3. yezhirou.jpg
yz_src = os.path.join(src_dir, "yezhirou_avatar_1791374435717.jpg")
yz_img = Image.open(yz_src).resize((360, 360), Image.Resampling.LANCZOS)
yz_img.save(os.path.join(dst_dir, "yezhirou.jpg"), quality=95)
print("Saved yezhirou.jpg")

# 4. xiaqiange.jpg
xq_src = os.path.join(src_dir, "xiaqiange_avatar_1791374527189.jpg")
xq_img = Image.open(xq_src).resize((360, 360), Image.Resampling.LANCZOS)
xq_img.save(os.path.join(dst_dir, "xiaqiange.jpg"), quality=95)
print("Saved xiaqiange.jpg")
