import os

player_path = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG\00_浴室全系列动态交互播放器.html"

html_content = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>《薄妹 1.3》浴室全系列动态交互播放器 (完整图层合成版)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090a10;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    header {
      background: #12141f;
      border-bottom: 1px solid #232738;
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 15px rgba(236,72,153,0.4);
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
    .main-layout {
      display: flex;
      flex: 1;
      height: calc(100vh - 65px);
    }
    /* 侧边场景菜单 */
    .sidebar {
      width: 320px;
      background: #11131c;
      border-right: 1px solid #1e2233;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .nav-group-title {
      font-size: 11px;
      font-weight: bold;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 10px;
      margin-bottom: 4px;
      padding-left: 8px;
    }
    .nav-btn {
      background: #171926;
      border: 1px solid #23283d;
      color: #cbd5e1;
      padding: 10px 14px;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-btn:hover {
      background: #202438;
      border-color: #3b82f6;
      color: #ffffff;
      transform: translateX(3px);
    }
    .nav-btn.active {
      background: linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.25));
      border-color: #ec4899;
      color: #f472b6;
      box-shadow: 0 0 16px rgba(236,72,153,0.15);
    }
    .nav-badge {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 6px;
      background: #090a10;
      color: #94a3b8;
      font-mono;
    }
    .nav-btn.active .nav-badge {
      background: rgba(236,72,153,0.3);
      color: #fbcfe8;
    }

    /* 主舞台区 */
    .stage-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #07080d;
      position: relative;
    }
    .stage {
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #141724 0%, #06070a 100%);
    }
    .canvas-wrapper {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 16 / 9;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .layer-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
    }
    .steam-layer {
      mix-blend-mode: screen;
      opacity: 0.65;
      animation: steamFloat 4s ease-in-out infinite alternate;
    }
    @keyframes steamFloat {
      0% { opacity: 0.45; transform: scale(1); }
      100% { opacity: 0.8; transform: scale(1.03); }
    }

    /* 底部控制台 */
    .control-bar {
      height: 90px;
      background: #11131c;
      border-top: 1px solid #1e2233;
      padding: 12px 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    input[type=range] {
      flex: 1;
      accent-color: #ec4899;
      cursor: pointer;
    }
    .action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .btn-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ctrl-btn {
      background: #1e2233;
      border: 1px solid #2d344d;
      color: #f1f5f9;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .ctrl-btn:hover {
      background: #2a3047;
      border-color: #475569;
    }
    .ctrl-btn.active {
      background: #ec4899;
      border-color: #f472b6;
      color: #fff;
    }
    .info-label {
      font-size: 12px;
      color: #94a3b8;
      font-mono;
    }
    .scene-meta {
      position: absolute;
      top: 16px;
      left: 20px;
      background: rgba(17, 19, 28, 0.88);
      border: 1px solid rgba(236,72,153,0.35);
      padding: 10px 16px;
      border-radius: 12px;
      backdrop-blur-md;
      pointer-events: none;
      box-shadow: 0 6px 20px rgba(0,0,0,0.5);
      z-index: 10;
    }
    .scene-meta-title {
      font-size: 15px;
      font-weight: bold;
      color: #fbcfe8;
    }
    .scene-meta-desc {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🛁</div>
      <div>
        <div class="brand-title">《存在感薄弱妹妹》浴室全系列动态交互演播厅 (完整多图层合成版)</div>
        <div class="brand-subtitle">解密素材实时对齐 · 头部表情逐帧同步 · 断面透视切换 · 完美消除缺头问题</div>
      </div>
    </div>
    <div style="font-size: 12px; color: #64748b;">
      💡 支持快捷键：<code style="color: #f472b6;">空格</code> 播放/暂停，<code style="color: #f472b6;">← / →</code> 逐帧微调
    </div>
  </header>

  <div class="main-layout">
    <!-- 左侧场景列表 -->
    <div class="sidebar">
      <div class="nav-group-title">🌸 妹妹日常 · 独处沐浴篇</div>
      <button class="nav-btn active" onclick="switchScene(0)">
        <span>🦆 浴缸玩小黄鸭</span>
        <span class="nav-badge">8帧循环</span>
      </button>
      <button class="nav-btn" onclick="switchScene(1)">
        <span>🫧 浴缸吹泡泡</span>
        <span class="nav-badge">7帧循环</span>
      </button>
      <button class="nav-btn" onclick="switchScene(2)">
        <span>🧘 舒展身体懒腰</span>
        <span class="nav-badge">11帧微动</span>
      </button>

      <div class="nav-group-title">🧼 双人互动 · 擦背与温情篇</div>
      <button class="nav-btn" onclick="switchScene(3)">
        <span>🧴 帮妹妹洗头发</span>
        <span class="nav-badge">温情差分</span>
      </button>
      <button class="nav-btn" onclick="switchScene(4)">
        <span>🛁 两人一起泡澡</span>
        <span class="nav-badge">脸红合浴</span>
      </button>
      <button class="nav-btn" onclick="switchScene(5)">
        <span>🧽 抱出浴缸/擦拭</span>
        <span class="nav-badge">体贴动作</span>
      </button>

      <div class="nav-group-title">💓 心动亲密 · 浴室侍奉篇</div>
      <button class="nav-btn" onclick="switchScene(6)">
        <span>🏇 浴室骑乘素股 A</span>
        <span class="nav-badge">12帧高频</span>
      </button>
      <button class="nav-btn" onclick="switchScene(7)">
        <span>🏇 浴室骑乘素股 B</span>
        <span class="nav-badge">12帧深入</span>
      </button>
      <button class="nav-btn" onclick="switchScene(8)">
        <span>💋 浴室心动侍奉</span>
        <span class="nav-badge">101帧超丝滑</span>
      </button>

      <div class="nav-group-title">🔥 镜前激情 · 亲密本番篇</div>
      <button class="nav-btn" onclick="switchScene(9)">
        <span>🔥 镜前站立后入本番</span>
        <span class="nav-badge">11帧完整头部</span>
      </button>
      <button class="nav-btn" onclick="switchScene(10)">
        <span>🤝 镜前抓手后入本番</span>
        <span class="nav-badge">14帧完整动态</span>
      </button>

      <div class="nav-group-title">🌆 场景环境 · 浴室全景光影</div>
      <button class="nav-btn" onclick="switchScene(11)">
        <span>🌇 黄昏 · 浴室开灯</span>
        <span class="nav-badge">环境大图</span>
      </button>
      <button class="nav-btn" onclick="switchScene(12)">
        <span>🌃 深夜 · 浴室开灯 (开浴缸盖)</span>
        <span class="nav-badge">环境大图</span>
      </button>
    </div>

    <!-- 中间播放舞台 -->
    <div class="stage-container">
      <div class="stage">
        <!-- 左上角场景说明浮标 -->
        <div class="scene-meta">
          <div id="meta-title" class="scene-meta-title">🦆 浴缸玩小黄鸭</div>
          <div id="meta-desc" class="scene-meta-desc">妹妹一个人浸泡在热水里，轻轻拨弄浮在水面上的小黄鸭玩偶</div>
        </div>

        <!-- 核心画布层叠容器 (严格原点绝对对齐) -->
        <div class="canvas-wrapper">
          <!-- 1. 背景层 -->
          <img id="layer-bg" class="layer-img" src="" style="display: none;" />
          <!-- 2. 主动作/动画层 -->
          <img id="layer-main" class="layer-img" src="" />
          <!-- 3. 头部/五官差分层 (逐帧与主动作精准同步) -->
          <img id="layer-head" class="layer-img" src="" style="display: none;" />
          <!-- 4. 断面剖面透视层 -->
          <img id="layer-cutaway" class="layer-img" src="" style="display: none;" />
          <!-- 5. 前景/镜面置物架层 -->
          <img id="layer-fg" class="layer-img" src="" style="display: none;" />
          <!-- 6. 水雾水汽层 -->
          <img id="layer-steam" class="layer-img steam-layer" src="./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_Steam.png" style="display: none;" />
        </div>
      </div>

      <!-- 底部播控条 -->
      <div class="control-bar">
        <!-- 进度条 -->
        <div class="slider-row">
          <span id="curr-frame-text" class="info-label" style="min-width: 60px;">0 / 8</span>
          <input type="range" id="frame-slider" min="0" max="7" value="0" oninput="onSliderChange(this.value)">
          <span id="fps-text" class="info-label" style="min-width: 65px;">12 FPS</span>
        </div>

        <!-- 动作操作组 -->
        <div class="action-row">
          <div class="btn-group">
            <button id="btn-prev" class="ctrl-btn" onclick="stepFrame(-1)">⏮ 上一帧</button>
            <button id="btn-play" class="ctrl-btn active" onclick="togglePlay()">⏸ 暂停</button>
            <button id="btn-next" class="ctrl-btn" onclick="stepFrame(1)">⏭ 下一帧</button>
          </div>

          <div class="btn-group">
            <span class="info-label" style="margin-right: 4px;">倍速:</span>
            <button class="ctrl-btn" onclick="setSpeed(0.5)">0.5x</button>
            <button class="ctrl-btn active" id="spd-10" onclick="setSpeed(1.0)">1.0x</button>
            <button class="ctrl-btn" onclick="setSpeed(1.5)">1.5x</button>
            <button class="ctrl-btn" onclick="setSpeed(2.0)">2.0x</button>
          </div>

          <div class="btn-group">
            <button id="btn-kao" class="ctrl-btn" onclick="cycleKao()" style="display: none;">😊 表情: 娇羞A</button>
            <button id="btn-cutaway" class="ctrl-btn" onclick="toggleCutaway()" style="display: none;">🔬 断面透视</button>
            <button id="btn-steam" class="ctrl-btn" onclick="toggleSteam()">💨 水雾蒸汽</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 场景数据定义
    const SCENES = [
      // 0: 小黄鸭
      {
        title: "🦆 浴缸玩小黄鸭",
        desc: "妹妹一个人浸泡在热水里，轻轻拨弄浮在水面上的小黄鸭玩偶",
        fps: 8,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        head: "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_shake_eyesOpened1.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck0.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck1.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck2.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck3.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck4.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck5.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_playWithRubberDuck6.png"
        ],
        hasSteam: true
      },
      // 1: 吹泡泡
      {
        title: "🫧 浴缸吹泡泡",
        desc: "妹妹掌心捧着沐浴露打出的绵密泡沫，鼓起腮帮轻轻吹动",
        fps: 8,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        head: "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_shake_eyesOpened1.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble1.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble2.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble3.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble4.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble5.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble6.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_bubble7.png"
        ],
        hasSteam: true
      },
      // 2: 伸懒腰舒展
      {
        title: "🧘 舒展身体懒腰",
        desc: "水温刚好，妹妹惬意地仰起下巴伸展白皙的肢体",
        fps: 8,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        head: "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_shake_eyesOpened1.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching0.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching1.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching2.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching3.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching4.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching5.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching6.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching7.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching8.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching9.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sis_solo_stretching10.png"
        ],
        hasSteam: true
      },
      // 3: 帮妹妹洗头发
      {
        title: "🧴 帮妹妹洗头发与擦拭",
        desc: "哥哥耐心地帮妹妹搓洗长发，指尖抚过发梢的温存日常",
        fps: 3,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashHair.png",
          "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashBreasts.png",
          "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashArms1.png",
          "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_backWashArms2.png"
        ],
        hasSteam: true
      },
      // 4: 两人一起泡澡
      {
        title: "🛁 两人一起泡澡",
        desc: "狭小的浴缸里挤着两个人，妹妹害羞地别过头不敢直视",
        fps: 2,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sitTogetherInBathtub1.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sitTogetherInBathtub2.png"
        ],
        hasSteam: true
      },
      // 5: 抱出浴缸
      {
        title: "🧽 抱出浴缸/擦拭体贴",
        desc: "泡得有点头晕的妹妹，被稳稳地抱出浴缸用大浴巾包裹",
        fps: 4,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_oniichan_LiftUp0.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_oniichan_LiftUp1.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_oniichan_LiftUp2.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_oniichan_LiftUp3.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_oniichan_LiftUp4.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_oniichan_LiftUp5.png"
        ],
        hasSteam: true
      },
      // 6: 素股A
      {
        title: "🏇 浴室骑乘素股 A 动作",
        desc: "妹妹跨坐在腿上，湿漉漉的肌肤紧密贴合滑动",
        fps: 14,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: Array.from({length: 12}, (_, i) => `./19_浴室素股亲密(96帧)/bathroom_sumata_ridingA${i+1}.png`),
        hasSteam: true
      },
      // 7: 素股B
      {
        title: "🏇 浴室骑乘素股 B 动作",
        desc: "更深频率的摩擦，水花与体温交织的急促呼吸",
        fps: 14,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: Array.from({length: 12}, (_, i) => `./19_浴室素股亲密(96帧)/bathroom_sumata_ridingB${i+1}.png`),
        hasSteam: true
      },
      // 8: 心动侍奉 (101帧超长连贯)
      {
        title: "💋 浴室心动侍奉 (101帧超高清)",
        desc: "在浴室地板上妹妹全心全意的温暖侍奉，极致的连贯帧数",
        fps: 16,
        bg: "./15_浴室心动奉仕(175帧)/bathroom_blowjob_oniichan_background.png",
        fg: "./15_浴室心动奉仕(175帧)/bathroom_blowjob_oniichan_foreground.png",
        frames: Array.from({length: 101}, (_, i) => `./15_浴室心动奉仕(175帧)/bathroom_blowjob${i}.png`),
        hasSteam: false
      },
      // 9: 镜前站立后入本番 (带精准头部与表情切换！)
      {
        title: "🔥 镜前站立后入本番 (11帧动作 + 头部同步)",
        desc: "浴室大镜子前，倒映着两人紧紧相拥。头部、身体与镜面反光完全拼合对齐！",
        fps: 12,
        bg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewBackground.png",
        fg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewForeground.png",
        frames: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_action${i+1}.png`),
        heads: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_kaoA${i+1}.png`),
        cutaways: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_action_cutawayView${i+1}.png`),
        hasKaoSwitch: true,
        hasCutaway: true,
        hasSteam: false
      },
      // 10: 镜前抓手后入本番 (14帧完整动态)
      {
        title: "🤝 镜前抓手后入本番 (14帧完整大动态)",
        desc: "哥哥抓紧妹妹双手，更加强烈的本番节奏与细腻画质",
        fps: 12,
        bg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewBackground.png",
        fg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewForeground.png",
        frames: Array.from({length: 14}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_UdeTsukamiBakku_action${i+1}.png`),
        cutaways: Array.from({length: 14}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_UdeTsukamiBakku_action_cutawayView${i+1}.png`),
        hasCutaway: true,
        hasSteam: false
      },
      // 11: 黄昏开灯
      {
        title: "🌇 黄昏 · 浴室开灯全景",
        desc: "窗外是晚霞渐隐的暖红，浴室吊灯已点亮，泛着柔和水光",
        fps: 1,
        bg: "",
        frames: ["./06_浴室场景与光影(8张)/bathroom_dusk_lightOn.png"],
        hasSteam: false
      },
      // 12: 深夜开灯开浴缸盖
      {
        title: "🌃 深夜 · 浴室开灯 (开浴缸盖)",
        desc: "深夜无人的浴室，浴缸热气腾腾，等待着疲惫归来的旅人",
        fps: 1,
        bg: "",
        frames: ["./06_浴室场景与光影(8张)/bathroom_night_lightOn_bathtubCoverOpen.png"],
        hasSteam: false
      }
    ];

    let currentSceneIdx = 0;
    let currentFrameIdx = 0;
    let isPlaying = true;
    let timer = null;
    let speedScale = 1.0;
    let steamActive = false;
    let cutawayActive = false;
    let kaoMode = 'kaoA'; // kaoA, kaoB, kaoC

    function initScene(idx) {
      currentSceneIdx = idx;
      currentFrameIdx = 0;
      const sc = SCENES[idx];

      // 更新标题和描述
      document.getElementById('meta-title').innerText = sc.title;
      document.getElementById('meta-desc').innerText = sc.desc;

      // 更新按钮高亮
      const btns = document.querySelectorAll('.nav-btn');
      btns.forEach((b, i) => {
        if (i === idx) b.classList.add('active');
        else b.classList.remove('active');
      });

      // 配置背景与前景
      const bgEl = document.getElementById('layer-bg');
      if (sc.bg) {
        bgEl.src = sc.bg;
        bgEl.style.display = 'block';
      } else {
        bgEl.style.display = 'none';
      }

      const fgEl = document.getElementById('layer-fg');
      if (sc.fg) {
        fgEl.src = sc.fg;
        fgEl.style.display = 'block';
      } else {
        fgEl.style.display = 'none';
      }

      // 水雾控制
      const steamBtn = document.getElementById('btn-steam');
      if (sc.hasSteam) {
        steamBtn.style.display = 'flex';
      } else {
        steamBtn.style.display = 'none';
        setSteam(false);
      }

      // 断面透视按钮控制
      const cutawayBtn = document.getElementById('btn-cutaway');
      if (sc.hasCutaway) {
        cutawayBtn.style.display = 'flex';
      } else {
        cutawayBtn.style.display = 'none';
        setCutaway(false);
      }

      // 表情切换按钮控制 (站立后入专享)
      const kaoBtn = document.getElementById('btn-kao');
      if (sc.hasKaoSwitch) {
        kaoBtn.style.display = 'flex';
        updateKaoBtnText();
      } else {
        kaoBtn.style.display = 'none';
      }

      // 滑条范围更新
      const slider = document.getElementById('frame-slider');
      slider.max = sc.frames.length - 1;
      slider.value = 0;

      renderFrame();
      restartLoop();
    }

    function switchScene(idx) {
      initScene(idx);
    }

    function renderFrame() {
      const sc = SCENES[currentSceneIdx];
      const imgPath = sc.frames[currentFrameIdx];
      document.getElementById('layer-main').src = imgPath;

      // 头部/表情同步更新 (逐帧对齐)
      const headEl = document.getElementById('layer-head');
      if (sc.heads && sc.heads[currentFrameIdx]) {
        // 根据当前的 kaoA / kaoB / kaoC 动态切换对应的表情帧
        const targetHead = sc.heads[currentFrameIdx].replace('kaoA', kaoMode);
        headEl.src = targetHead;
        headEl.style.display = 'block';
      } else if (sc.head) {
        headEl.src = sc.head;
        headEl.style.display = 'block';
      } else {
        headEl.style.display = 'none';
      }

      // 断面剖面透视图层更新
      const cutawayEl = document.getElementById('layer-cutaway');
      if (cutawayActive && sc.cutaways && sc.cutaways[currentFrameIdx]) {
        cutawayEl.src = sc.cutaways[currentFrameIdx];
        cutawayEl.style.display = 'block';
      } else {
        cutawayEl.style.display = 'none';
      }

      document.getElementById('curr-frame-text').innerText = `${currentFrameIdx + 1} / ${sc.frames.length}`;
      document.getElementById('frame-slider').value = currentFrameIdx;
      
      const realFps = Math.round(sc.fps * speedScale);
      document.getElementById('fps-text').innerText = `${realFps} FPS`;
    }

    function restartLoop() {
      if (timer) clearInterval(timer);
      const sc = SCENES[currentSceneIdx];
      if (sc.frames.length <= 1) return;

      const realFps = Math.max(1, Math.round(sc.fps * speedScale));
      timer = setInterval(() => {
        if (!isPlaying) return;
        currentFrameIdx = (currentFrameIdx + 1) % sc.frames.length;
        renderFrame();
      }, 1000 / realFps);
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      const btn = document.getElementById('btn-play');
      btn.innerText = isPlaying ? '⏸ 暂停' : '▶ 播放';
      if (isPlaying) btn.classList.add('active');
      else btn.classList.remove('active');
    }

    function stepFrame(step) {
      const sc = SCENES[currentSceneIdx];
      if (sc.frames.length <= 1) return;
      if (isPlaying) togglePlay(); // 步进时自动暂停
      currentFrameIdx = (currentFrameIdx + step + sc.frames.length) % sc.frames.length;
      renderFrame();
    }

    function onSliderChange(val) {
      if (isPlaying) togglePlay();
      currentFrameIdx = parseInt(val);
      renderFrame();
    }

    function setSpeed(scale) {
      speedScale = scale;
      restartLoop();
    }

    function toggleSteam() {
      setSteam(!steamActive);
    }

    function setSteam(active) {
      steamActive = active;
      const steamEl = document.getElementById('layer-steam');
      const steamBtn = document.getElementById('btn-steam');
      steamEl.style.display = active ? 'block' : 'none';
      if (active) steamBtn.classList.add('active');
      else steamBtn.classList.remove('active');
    }

    function toggleCutaway() {
      setCutaway(!cutawayActive);
      renderFrame();
    }

    function setCutaway(active) {
      cutawayActive = active;
      const cutawayBtn = document.getElementById('btn-cutaway');
      if (active) cutawayBtn.classList.add('active');
      else cutawayBtn.classList.remove('active');
    }

    function cycleKao() {
      if (kaoMode === 'kaoA') kaoMode = 'kaoB';
      else if (kaoMode === 'kaoB') kaoMode = 'kaoC';
      else kaoMode = 'kaoA';
      updateKaoBtnText();
      renderFrame();
    }

    function updateKaoBtnText() {
      const kaoBtn = document.getElementById('btn-kao');
      const names = { kaoA: '😊 表情: 娇羞A', kaoB: '😍 表情: 陶醉B', kaoC: '😵 表情: 失神C' };
      kaoBtn.innerText = names[kaoMode];
    }

    // 键盘快捷键监听
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
      }
    });

    // 默认开启站立后入幕次 (场景9)，直观展示头部合成修复！
    initScene(9);
    setSteam(false);
  </script>
</body>
</html>
"""

with open(player_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Updated player with head layer synchronization successfully.")
