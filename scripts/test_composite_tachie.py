import os
from PIL import Image

base_png = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG"
out_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG\00_组合效果演示"
os.makedirs(out_dir, exist_ok=True)

def test_composite():
    # 1. Composite sister bedroom knee pillow (膝枕互动组合)
    sis_room = os.path.join(base_png, "04_妹妹卧室与膝枕日常(207帧)")
    back_p = os.path.join(sis_room, "hizamakura_back.png")
    camisole_p = os.path.join(sis_room, "hizamakura_camisole.png")
    coat_p = os.path.join(sis_room, "hizamakura_coat_normal.png")
    kao_p = os.path.join(sis_room, "hizamakura_back_kao1.png")
    
    if os.path.exists(back_p) and os.path.exists(camisole_p):
        img = Image.open(back_p).convert("RGBA")
        if os.path.exists(camisole_p):
            c_img = Image.open(camisole_p).convert("RGBA")
            img.paste(c_img, (0, 0), c_img)
        if os.path.exists(coat_p):
            coat_img = Image.open(coat_p).convert("RGBA")
            img.paste(coat_img, (0, 0), coat_img)
        if os.path.exists(kao_p):
            kao_img = Image.open(kao_p).convert("RGBA")
            img.paste(kao_img, (0, 0), kao_img)
        
        save_path = os.path.join(out_dir, "demo_knee_pillow_composite.png")
        img.save(save_path)
        print("Generated knee pillow composite:", save_path)

    # 2. Composite Tachie + Nurse Uniform (护士服换装立绘组合)
    tachie_dir = os.path.join(base_png, "01_妹妹动态立绘_乳摇与换装(24张)")
    body_p = os.path.join(tachie_dir, "mio_tachie_body.png")
    nurse_p = os.path.join(tachie_dir, "mio_tachie_nurse_uniform0.png")
    cap_p = os.path.join(tachie_dir, "mio_tachie_nurse_cap.png")
    boob_p = os.path.join(tachie_dir, "mio_tachie_boobShake1.png")

    if os.path.exists(body_p) and os.path.exists(nurse_p):
        body = Image.open(body_p).convert("RGBA")
        nurse = Image.open(nurse_p).convert("RGBA")
        body.paste(nurse, (0, 0), nurse)
        save_nurse = os.path.join(out_dir, "demo_nurse_tachie.png")
        body.save(save_nurse)
        print("Generated nurse tachie composite:", save_nurse)

    # 3. Create an animated GIF from the morning brushing event (早晨刷牙动画组合)
    morning_dir = os.path.join(base_png, "02_早晨洗漱与刷牙动态(234帧)")
    frames = []
    for i in range(0, 48, 2): # take 24 frames for a smooth lightweight loop
        f_name = f"brushingTeeth{i:04d}.png"
        f_path = os.path.join(morning_dir, f_name)
        if os.path.exists(f_path):
            f_img = Image.open(f_path).convert("RGBA")
            # Create a nice soft background
            bg = Image.new("RGBA", f_img.size, (245, 245, 250, 255))
            bg.paste(f_img, (0, 0), f_img)
            frames.append(bg.convert("RGB"))
    
    if frames:
        gif_path = os.path.join(out_dir, "demo_brushing_teeth_loop.gif")
        frames[0].save(
            gif_path,
            save_all=True,
            append_images=frames[1:],
            duration=80, # 80ms per frame ~ 12.5 fps
            loop=0
        )
        print("Generated animated GIF:", gif_path)

if __name__ == "__main__":
    test_composite()
