# -*- coding: utf-8 -*-
import os

key_hex = "e5754b57c4980b5dd252d11de99430ec"
key_bytes = bytes.fromhex(key_hex)

src_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\PC\薄妹1.3\www\img\Menu__picturegallery"
dst_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG\22_官方画廊与拍立得写真(71张)"

os.makedirs(dst_dir, exist_ok=True)

files = os.listdir(src_dir)
count = 0
for f in files:
    src_path = os.path.join(src_dir, f)
    if not os.path.isfile(src_path): continue
    
    with open(src_path, "rb") as fp:
        data = bytearray(fp.read())
    
    # Decrypt header
    if len(data) >= 32 and data[:16] == b"RPGMV\x00\x00\x00\x00\x03\x01\x00\x00\x00\x00\x00":
        enc_header = data[16:32]
        dec_header = bytearray(16)
        for i in range(16):
            dec_header[i] = enc_header[i] ^ key_bytes[i]
        out_data = dec_header + data[32:]
    else:
        out_data = data

    out_name = f
    if out_name.endswith(".png_"):
        out_name = out_name[:-1]
    elif out_name.endswith(".rpgmvp"):
        out_name = out_name[:-7] + ".png"

    dst_path = os.path.join(dst_dir, out_name)
    with open(dst_path, "wb") as fp:
        fp.write(out_data)
    count += 1

print(f"Decrypted {count} files to {dst_dir}")
