# -*- coding: utf-8 -*-
import os
import json
import re

base_dir = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG"
target_html = os.path.join(base_dir, "00_《存在感薄弱妹妹》全CG画廊与写真图鉴.html")

# Build fast lookup table
lookup = {}
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.png'):
            fn_no_ext = os.path.splitext(f)[0]
            rel_path = os.path.relpath(os.path.join(root, f), base_dir).replace('\\', '/')
            p = './' + rel_path
            lookup[fn_no_ext] = p
            lookup[f] = p

def resolve_path(p_str):
    if not p_str or p_str == 'placeholder': return ''
    basename = os.path.splitext(os.path.basename(p_str))[0]
    return lookup.get(basename, lookup.get(basename + '.png', ''))

# Load dump
with open(r"d:\pro\work\proj\googleAI\noval-go\scripts\cg_gallery_dump.json", "r", encoding="utf-8") as f:
    dump = json.load(f)

# Process entries
gallery_items = []

for item in dump:
    key = item.get("key")
    name_id = item.get("nameId")
    title = item.get("title", key)
    cover_name = item.get("cover")
    cat = item.get("category", "")
    card_style = item.get("cardStyle", 6)
    pic_data = item.get("pic")

    # Determine resolved category & tag
    if cat == "Polaroid" or "chahuiCheki" in str(pic_data):
        category_type = "polaroid"
        category_name = "📸 拍立得写真"
    elif key in ["summerSet", "rubCheeks", "brushingTeeth", "brushingTeeth2", "dryImoutoHair", "carryImoutoBackToRoom", "batheWithImouto", "shakeCola", "competeForToilet", "wakeUpWithImouto", "wakeUpOniichan", "helpWashImouto"]:
        category_type = "event"
        category_name = "🌸 日常温情CG"
    elif key == "480" or "SisterMio" in str(pic_data):
        category_type = "polaroid"
        category_name = "📸 拍立得写真"
    else:
        category_type = "h_recall"
        category_name = "🔥 亲密回想CG"

    # Resolve cover path
    cover_path = ""
    if cover_name:
        cover_path = resolve_path(cover_name)
    if not cover_path and isinstance(pic_data, str) and pic_data != 'placeholder':
        cover_path = resolve_path(pic_data)

    # Process variants / layers
    variants = []
    if isinstance(pic_data, list):
        for v_idx, v in enumerate(pic_data):
            if isinstance(v, list):
                layers = []
                v_name = f"差分 #{v_idx + 1}"
                for layer in v:
                    if isinstance(layer, str):
                        layers.append({"path": resolve_path(layer), "x": 0, "y": 0, "scale": 1})
                    elif isinstance(layer, dict):
                        if "variant" in layer:
                            v_name = layer.get("variant", v_name)
                        elif "path" in layer:
                            layers.append({
                                "path": resolve_path(layer["path"]),
                                "x": layer.get("x", 0),
                                "y": layer.get("y", 0),
                                "scale": layer.get("scale", 1)
                            })
                variants.append({"name": v_name, "layers": [l for l in layers if l["path"]]})
    elif isinstance(pic_data, str) and pic_data != 'placeholder':
        rp = resolve_path(pic_data)
        if rp:
            variants.append({"name": "原画", "layers": [{"path": rp, "x": 0, "y": 0, "scale": 1}]})

    if not cover_path and variants and variants[0]["layers"]:
        cover_path = variants[0]["layers"][0]["path"]

    # Descriptions
    desc_map = {
        "430": "【浴室镜羞耻PLAY】镜前站立后入，两人紧贴倒映在水雾迷蒙的镜面中，包含娇羞/恍惚/失神三表情差分与剖视。",
        "431": "【妹妹的特别清洗服务II】双手紧握的后背位深入，随着水流律动强烈的镜前亲密。",
        "432": "【妹妹的特别清洗服务I】跨坐在哥哥腿上的高频素股摩擦，湿润皮肤紧紧相贴。",
        "433": "【教育偷偷学坏的妹妹】客厅沙发上看电视时的反向坐位与后背位亲密深入。",
        "434": "【和妹妹看恐怖片】被恐怖电影吓到的妹妹依偎在哥哥怀中，心跳急促加速。",
        "435": "【偷看妹妹洗澡】透过淋浴间毛玻璃隔门的水花与剪影，窥探正在沐浴的妹妹。",
        "436": "【对妹妹使用肉棒吧！】在浴室地板上全心全意的温暖奉仕侍奉，101帧超高清完整连贯。",
        "437": "【4545】洗手台旁的手交互动，支持纯白/天蓝/粉嫩/真空4种内裤款式自由切换与67帧绝顶释放。",
        "438": "【新婚三问：先洗澡】以为哥哥熟睡后的妹妹，在客厅沙发上偷偷自慰抚慰的4阶段全程。",
        "439": "【新婚三问：先吃妹妹】客厅茶几旁的紧张骑乘位，随时害怕被发现的刺激反差。",
        "440": "【厕所口交I】厕所隔间半掩着的私密空间，妹妹半蹲在前的温柔侍奉。",
        "441": "【厕所口交II】厕所隔间的高潮释放时刻，眼眸泛着水汽的满足神情。",
        "442": "【帮妹妹吹头发】洗完澡后坐在床边轻柔吹拂湿漉长发，包含回眸微笑与吊带滑落3阶差分。",
        "443": "【今晚会一直在你身边的……】泡澡疲惫昏睡过去的妹妹，被稳稳公主抱回卧室安睡。",
        "444": "【早、早安…】清晨阳光洒在双人被窝里，初醒的迷茫与相视一瞬的脸红。",
        "445": "【和妹妹一起泡澡】两个人挤在狭小的热水浴缸里，害羞地偏过头合浴。",
        "446": "【抢厕所】走廊上急迫憋尿的妹妹，包含6阶段扭动双腿与焦急红晕差分。",
        "447": "【一起刷牙】洗手台前并肩刷牙洗脸，包含梳发、扎双马尾、伸懒腰、摸胸等5阶镜面差分。",
        "448": "【早晨揉脸】捏捏睡意未消的小脸蛋，嘟起嘴唇软绵绵的触感。",
        "449": "【摇可乐】夏日午后猛烈摇晃可乐瓶，泡沫四溢与气泡集中线特写。",
        "450": "【叫哥哥起床】趴在被窝边轻声唤醒，呆毛微动的清晨日常。",
        "451": "【偷窥换衣服】透过拉门缝隙窥视正在脱下衣物的妹妹，心跳加速的独处瞬间。",
        "452": "【帮妹妹洗澡】大浴缸旁的温情擦拭，包含洗头、手臂、前胸、后背到私密清洗6阶差分。",
        "summerSet": "【夏日套装 酷暑充气水池】庭院充气水池里穿着泳装吃冰棒、泳装滑落露出与大腿散开3阶差分。",
        "480": "【堕落修女妹妹写真】大主教禁忌写真系列，白发红瞳与黑色修女服的极度魅惑！"
    }

    desc = desc_map.get(key, "")
    if not desc and "茶会拍立得" in title:
        desc = f"【茶会拍立得写真】官方原版珍藏高清立绘写真卡片，尺寸 1560×2391。"

    gallery_items.append({
        "key": key,
        "nameId": name_id,
        "title": title,
        "categoryType": category_type,
        "categoryName": category_name,
        "cover": cover_path,
        "desc": desc,
        "variants": variants
    })

print(f"Total processed gallery items: {len(gallery_items)}")

gallery_json = json.dumps(gallery_items, ensure_ascii=False, indent=2)

html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>《存在感薄弱妹妹》全CG官方画廊与写真图鉴 (官方完整收录版)</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: #090a10;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }}
    header {{
      background: #11131e;
      border-bottom: 1px solid #1f2336;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }}
    .brand {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .brand-icon {{
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 18px rgba(236,72,153,0.45);
    }}
    .brand-title {{
      font-size: 19px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.5px;
    }}
    .brand-subtitle {{
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }}

    /* 顶部筛选栏 */
    .filter-bar {{
      padding: 18px 32px;
      background: #0d0f17;
      border-bottom: 1px solid #171a26;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }}
    .tab-group {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .tab-btn {{
      background: #151824;
      border: 1px solid #202538;
      color: #94a3b8;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.18s;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .tab-btn:hover {{
      background: #1e2233;
      color: #fff;
    }}
    .tab-btn.active {{
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      border-color: #f472b6;
      color: #fff;
      box-shadow: 0 0 15px rgba(236,72,153,0.3);
    }}
    .search-input {{
      background: #151824;
      border: 1px solid #202538;
      border-radius: 10px;
      padding: 8px 16px;
      color: #fff;
      font-size: 13px;
      outline: none;
      min-width: 260px;
      transition: all 0.2s;
    }}
    .search-input:focus {{
      border-color: #ec4899;
      box-shadow: 0 0 12px rgba(236,72,153,0.3);
    }}

    /* CG 卡片网格 */
    .gallery-grid {{
      padding: 32px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
      flex: 1;
    }}
    .cg-card {{
      background: #12141f;
      border: 1px solid #1e2336;
      border-radius: 14px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      position: relative;
    }}
    .cg-card:hover {{
      transform: translateY(-6px);
      border-color: #ec4899;
      box-shadow: 0 12px 30px rgba(236,72,153,0.22);
    }}
    .cg-card.is-polaroid {{
      background: #fdfdfd;
      border: 1px solid #e2e8f0;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }}
    .cg-card.is-polaroid:hover {{
      border-color: #ec4899;
      box-shadow: 0 14px 35px rgba(236,72,153,0.35);
    }}
    .cg-thumb-wrap {{
      width: 100%;
      aspect-ratio: 16 / 10;
      background: #08090e;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }}
    .cg-card.is-polaroid .cg-thumb-wrap {{
      aspect-ratio: 2 / 3;
      background: #f8fafc;
      padding: 10px 10px 0 10px;
    }}
    .cg-thumb {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }}
    .cg-card.is-polaroid .cg-thumb {{
      object-fit: contain;
      border-radius: 4px;
    }}
    .cg-card:hover .cg-thumb {{
      transform: scale(1.04);
    }}
    .cg-card-body {{
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}
    .cg-card.is-polaroid .cg-card-body {{
      background: #fff;
      color: #1e293b;
      padding: 12px 14px;
    }}
    .cg-tag-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .cg-cat-badge {{
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 5px;
      background: rgba(236,72,153,0.18);
      color: #f472b6;
      font-weight: bold;
    }}
    .cg-card.is-polaroid .cg-cat-badge {{
      background: rgba(139,92,246,0.15);
      color: #7c3aed;
    }}
    .cg-count-badge {{
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }}
    .cg-title {{
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .cg-card.is-polaroid .cg-title {{
      color: #0f172a;
    }}

    /* 模态大图查看器 */
    .modal-overlay {{
      position: fixed;
      inset: 0;
      background: rgba(4, 5, 8, 0.92);
      backdrop-filter: blur(10px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }}
    .modal-box {{
      max-width: 95vw;
      max-height: 94vh;
      background: #11131c;
      border: 1px solid #23283d;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.85);
    }}
    .modal-header {{
      padding: 14px 24px;
      background: #151824;
      border-bottom: 1px solid #202538;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .modal-title {{
      font-size: 16px;
      font-weight: bold;
      color: #fbcfe8;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .modal-close-btn {{
      background: #202538;
      border: none;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.15s;
    }}
    .modal-close-btn:hover {{
      background: #ec4899;
      color: #fff;
    }}
    .modal-stage {{
      flex: 1;
      position: relative;
      background: #06070a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      min-width: 600px;
      min-height: 480px;
      max-height: calc(90vh - 120px);
    }}
    .modal-canvas-wrap {{
      position: relative;
      max-width: 100%;
      max-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    #viewer-canvas {{
      max-width: 100%;
      max-height: calc(90vh - 140px);
      object-fit: contain;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      display: block;
    }}
    .modal-footer {{
      padding: 12px 24px;
      background: #11131c;
      border-top: 1px solid #1e2336;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }}
    .variant-group {{
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .variant-btn {{
      background: #1c2133;
      border: 1px solid #2a314d;
      color: #cbd5e1;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.15s;
    }}
    .variant-btn:hover {{
      background: #272e48;
      border-color: #3b82f6;
    }}
    .variant-btn.active {{
      background: #ec4899;
      border-color: #f472b6;
      color: #fff;
    }}
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🖼️</div>
      <div>
        <div class="brand-title">《存在感薄弱妹妹》全CG官方画廊与写真图鉴 (官方完整收录版)</div>
        <div class="brand-subtitle">包含官方 36 张超清拍立得写真 · 全事件多阶差分 CG · 全回想亲密本番 (已解锁全部内容)</div>
      </div>
    </div>
    <div style="font-size: 12px; color: #64748b;">
      共收录 61 组完整 CG 与写真 · 支持全差分切换与高分辨率浏览
    </div>
  </header>

  <!-- 筛选导航 -->
  <div class="filter-bar">
    <div class="tab-group">
      <button class="tab-btn active" onclick="switchCategory('all')">🌟 全部 CG (<span id="count-all">0</span>)</button>
      <button class="tab-btn" onclick="switchCategory('polaroid')">📸 拍立得写真 (<span id="count-polaroid">0</span>)</button>
      <button class="tab-btn" onclick="switchCategory('event')">🌸 日常温情CG (<span id="count-event">0</span>)</button>
      <button class="tab-btn" onclick="switchCategory('h_recall')">🔥 亲密回想CG (<span id="count-h">0</span>)</button>
    </div>
    <input type="text" class="search-input" id="search-input" placeholder="🔍 搜索 CG 标题、关键词..." oninput="onSearchChange(this.value)">
  </div>

  <!-- 网格展厅 -->
  <div class="gallery-grid" id="gallery-grid"></div>

  <!-- 模态放大查看器 -->
  <div class="modal-overlay" id="modal-overlay" onclick="closeModal(event)">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title" id="modal-title">CG 详情</div>
        <button class="modal-close-btn" onclick="closeModal()">✕</button>
      </div>

      <div class="modal-stage">
        <div class="modal-canvas-wrap">
          <canvas id="viewer-canvas" width="1920" height="1080"></canvas>
        </div>
      </div>

      <div class="modal-footer">
        <div class="variant-group" id="variant-group"></div>
        <div style="display: flex; gap: 8px;">
          <button class="variant-btn" onclick="openOriginalImage()">🔍 查看原图</button>
          <button class="variant-btn" id="btn-open-anim" onclick="openInAnimationPlayer()" style="display: none; background: #ec4899; color: #fff;">🎬 打开动态演播厅</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const GALLERY = {gallery_json};
    let currentCategory = 'all';
    let currentSearch = '';
    let currentItem = null;
    let currentVariantIdx = 0;

    const canvas = document.getElementById('viewer-canvas');
    const ctx = canvas.getContext('2d');
    const imageCache = new Map();

    function getImage(src) {{
      if (!src) return null;
      if (!imageCache.has(src)) {{
        const img = new Image();
        img.src = src;
        img.onload = () => {{
          if (currentItem) renderCurrentItem();
        }};
        imageCache.set(src, img);
      }}
      return imageCache.get(src);
    }}

    // 更新数量统计
    document.getElementById('count-all').innerText = GALLERY.length;
    document.getElementById('count-polaroid').innerText = GALLERY.filter(x => x.categoryType === 'polaroid').length;
    document.getElementById('count-event').innerText = GALLERY.filter(x => x.categoryType === 'event').length;
    document.getElementById('count-h').innerText = GALLERY.filter(x => x.categoryType === 'h_recall').length;

    function renderGrid() {{
      const grid = document.getElementById('gallery-grid');
      grid.innerHTML = '';

      const filtered = GALLERY.filter(item => {{
        if (currentCategory !== 'all' && item.categoryType !== currentCategory) return false;
        if (currentSearch && !item.title.includes(currentSearch) && !item.desc.includes(currentSearch)) return false;
        return true;
      }});

      filtered.forEach(item => {{
        const card = document.createElement('div');
        const isPolaroid = item.categoryType === 'polaroid';
        card.className = `cg-card ${{isPolaroid ? 'is-polaroid' : ''}}`;
        card.onclick = () => openItem(item);

        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'cg-thumb-wrap';

        const img = document.createElement('img');
        img.className = 'cg-thumb';
        img.loading = 'lazy';
        img.src = item.cover || './22_官方画廊与拍立得写真(71张)/Home.png';
        thumbWrap.appendChild(img);

        const cardBody = document.createElement('div');
        cardBody.className = 'cg-card-body';

        const tagRow = document.createElement('div');
        tagRow.className = 'cg-tag-row';

        const catBadge = document.createElement('span');
        catBadge.className = 'cg-cat-badge';
        catBadge.innerText = item.categoryName;

        const countBadge = document.createElement('span');
        countBadge.className = 'cg-count-badge';
        countBadge.innerText = item.variants && item.variants.length > 1 ? `${{item.variants.length}} 阶差分` : '单幅';

        tagRow.appendChild(catBadge);
        tagRow.appendChild(countBadge);

        const title = document.createElement('div');
        title.className = 'cg-title';
        title.innerText = item.title;

        cardBody.appendChild(tagRow);
        cardBody.appendChild(title);

        card.appendChild(thumbWrap);
        card.appendChild(cardBody);
        grid.appendChild(card);
      }});
    }}

    function switchCategory(cat) {{
      currentCategory = cat;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      renderGrid();
    }}

    function onSearchChange(val) {{
      currentSearch = val.trim();
      renderGrid();
    }}

    function openItem(item) {{
      currentItem = item;
      currentVariantIdx = 0;

      document.getElementById('modal-title').innerText = `${{item.categoryName}} · ${{item.title}}`;
      document.getElementById('modal-overlay').style.display = 'flex';

      // 动态演播按钮
      const animBtn = document.getElementById('btn-open-anim');
      if (item.categoryType === 'h_recall' || item.categoryType === 'event') {{
        animBtn.style.display = 'inline-block';
      }} else {{
        animBtn.style.display = 'none';
      }}

      // 差分按钮渲染
      const vGroup = document.getElementById('variant-group');
      vGroup.innerHTML = '';
      if (item.variants && item.variants.length > 1) {{
        item.variants.forEach((v, idx) => {{
          const b = document.createElement('button');
          b.className = `variant-btn ${{idx === 0 ? 'active' : ''}}`;
          b.innerText = v.name;
          b.onclick = () => switchVariant(idx);
          vGroup.appendChild(b);
        }});
      }} else {{
        const b = document.createElement('span');
        b.style.fontSize = '12px';
        b.style.color = '#94a3b8';
        b.innerText = item.desc || '单幅原画展现';
        vGroup.appendChild(b);
      }}

      renderCurrentItem();
    }}

    function switchVariant(idx) {{
      currentVariantIdx = idx;
      document.querySelectorAll('#variant-group .variant-btn').forEach((b, i) => {{
        if (i === idx) b.classList.add('active');
        else b.classList.remove('active');
      }});
      renderCurrentItem();
    }}

    function renderCurrentItem() {{
      if (!currentItem) return;
      const v = (currentItem.variants && currentItem.variants[currentVariantIdx]) || {{layers: []}};

      // 调整画布纵横比
      if (currentItem.categoryType === 'polaroid') {{
        canvas.width = 1560;
        canvas.height = 2391;
      }} else {{
        canvas.width = 1920;
        canvas.height = 1080;
      }}

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (v.layers && v.layers.length > 0) {{
        v.layers.forEach(layer => {{
          const img = getImage(layer.path);
          if (img && img.complete && img.naturalWidth > 0) {{
            const w = img.naturalWidth * (layer.scale || 1);
            const h = img.naturalHeight * (layer.scale || 1);
            ctx.drawImage(img, layer.x || 0, layer.y || 0, w, h);
          }}
        }});
      }} else if (currentItem.cover) {{
        const img = getImage(currentItem.cover);
        if (img && img.complete && img.naturalWidth > 0) {{
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }}
      }}
    }}

    function closeModal(e) {{
      document.getElementById('modal-overlay').style.display = 'none';
      currentItem = null;
    }}

    function openOriginalImage() {{
      if (!currentItem) return;
      const v = (currentItem.variants && currentItem.variants[currentVariantIdx]) || {{layers: []}};
      let targetSrc = currentItem.cover;
      if (v.layers && v.layers.length > 0) {{
        targetSrc = v.layers[0].path;
      }}
      if (targetSrc) {{
        window.open(targetSrc, '_blank');
      }}
    }}

    function openInAnimationPlayer() {{
      window.open('./00_《存在感薄弱妹妹》全动画互动演播全集.html', '_blank');
    }}

    // 键盘 Esc 关闭
    window.addEventListener('keydown', (e) => {{
      if (e.key === 'Escape') closeModal();
    }});

    // 启动初始渲染
    renderGrid();
  </script>
</body>
</html>
"""

with open(target_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"CG Gallery HTML built successfully at:\n{target_html}")
