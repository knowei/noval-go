# -*- coding: utf-8 -*-
import os

target = r"D:\game\存在感薄弱妹妹ver1.3.1\薄妹动态素材库_已解密PNG\00_浴室全系列动态交互播放器.html"

content = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>《薄妹 1.3》浴室全系列动态交互演播厅 (游戏内核绝对坐标对齐版)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #08090e;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    header {
      background: #11131e;
      border-bottom: 1px solid #1f2336;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      z-index: 20;
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
      font-size: 17px;
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
      height: calc(100vh - 61px);
    }
    /* 侧边场景菜单 */
    .sidebar {
      width: 320px;
      background: #0d0f17;
      border-right: 1px solid #1b1e2e;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
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
      background: #151824;
      border: 1px solid #202436;
      color: #cbd5e1;
      padding: 9px 12px;
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.18s;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-btn:hover {
      background: #1c2132;
      border-color: #3b82f6;
      color: #ffffff;
      transform: translateX(3px);
    }
    .nav-btn.active {
      background: linear-gradient(135deg, rgba(236,72,153,0.22), rgba(139,92,246,0.26));
      border-color: #ec4899;
      color: #f472b6;
      box-shadow: 0 0 16px rgba(236,72,153,0.15);
    }
    .nav-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 5px;
      background: #090a10;
      color: #94a3b8;
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
      background: #050609;
      position: relative;
    }
    .stage {
      flex: 1;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: radial-gradient(circle at center, #111420 0%, #040507 100%);
    }
    .stage-canvas-box {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.85);
      border-radius: 8px;
      overflow: hidden;
      background: #000;
    }
    #stage-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .steam-layer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      mix-blend-mode: screen;
      opacity: 0.6;
      pointer-events: none;
      animation: steamFloat 4s ease-in-out infinite alternate;
      display: none;
    }
    @keyframes steamFloat {
      0% { opacity: 0.4; transform: scale(1); }
      100% { opacity: 0.75; transform: scale(1.03); }
    }

    /* 场景信息与游戏代码对齐提示 */
    .scene-meta {
      position: absolute;
      top: 20px;
      left: 24px;
      background: rgba(14, 17, 26, 0.88);
      border: 1px solid rgba(236,72,153,0.35);
      padding: 10px 16px;
      border-radius: 12px;
      backdrop-filter: blur(8px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.6);
      z-index: 10;
      max-width: 480px;
      pointer-events: none;
    }
    .scene-meta-title {
      font-size: 15px;
      font-weight: bold;
      color: #fbcfe8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .scene-meta-desc {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 3px;
      line-height: 1.4;
    }
    .code-badge {
      font-size: 11px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid #334155;
      padding: 2px 8px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: Consolas, monospace;
      margin-top: 5px;
      display: inline-block;
    }

    /* 底部控制台 */
    .control-bar {
      height: 86px;
      background: #0f111a;
      border-top: 1px solid #1a1e2d;
      padding: 10px 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
      z-index: 20;
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
      background: #1a1e2d;
      border: 1px solid #272c42;
      color: #f1f5f9;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }
    .ctrl-btn:hover {
      background: #252b40;
      border-color: #3b82f6;
    }
    .ctrl-btn.active {
      background: #ec4899;
      border-color: #f472b6;
      color: #fff;
      box-shadow: 0 0 10px rgba(236,72,153,0.35);
    }
    .info-label {
      font-size: 12px;
      color: #94a3b8;
      font-family: Consolas, monospace;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🛁</div>
      <div>
        <div class="brand-title">《薄妹 1.3》浴室全系列动态交互演播厅 (游戏内核绝对坐标对齐版)</div>
        <div class="brand-subtitle">1920×1080 游戏引擎硬件级绝对坐标渲染 · 头部(860, 70)无缝吻合 · 断面透视 · 射精层叠</div>
      </div>
    </div>
    <div style="font-size: 12px; color: #64748b;">
      💡 快捷键：<code style="color: #f472b6;">空格</code> 播放/暂停，<code style="color: #f472b6;">← / →</code> 逐帧微调
    </div>
  </header>

  <div class="main-layout">
    <!-- 左侧场景列表 -->
    <div class="sidebar">
      <div class="nav-group-title">🔥 镜前激情 · 亲密本番篇 (重点修复对齐)</div>
      <button class="nav-btn active" onclick="switchScene(0)">
        <span>🔥 镜前站立后入本番</span>
        <span class="nav-badge">11帧完美头部</span>
      </button>
      <button class="nav-btn" onclick="switchScene(1)">
        <span>🤝 镜前抓手后入本番</span>
        <span class="nav-badge">14帧镜前对齐</span>
      </button>

      <div class="nav-group-title">🌸 妹妹日常 · 独处沐浴篇</div>
      <button class="nav-btn" onclick="switchScene(2)">
        <span>🦆 浴缸玩小黄鸭</span>
        <span class="nav-badge">8帧微动</span>
      </button>
      <button class="nav-btn" onclick="switchScene(3)">
        <span>🫧 浴缸吹泡泡</span>
        <span class="nav-badge">7帧循环</span>
      </button>
      <button class="nav-btn" onclick="switchScene(4)">
        <span>🧘 舒展身体懒腰</span>
        <span class="nav-badge">11帧微动</span>
      </button>

      <div class="nav-group-title">🧼 双人互动 · 擦背与温情篇</div>
      <button class="nav-btn" onclick="switchScene(5)">
        <span>🧴 帮妹妹洗头发</span>
        <span class="nav-badge">温情差分</span>
      </button>
      <button class="nav-btn" onclick="switchScene(6)">
        <span>🛁 两人一起泡澡</span>
        <span class="nav-badge">脸红合浴</span>
      </button>
      <button class="nav-btn" onclick="switchScene(7)">
        <span>🧽 抱出浴缸/擦拭</span>
        <span class="nav-badge">体贴动作</span>
      </button>

      <div class="nav-group-title">💓 心动亲密 · 浴室侍奉篇</div>
      <button class="nav-btn" onclick="switchScene(8)">
        <span>🏇 浴室骑乘素股 A</span>
        <span class="nav-badge">12帧高频</span>
      </button>
      <button class="nav-btn" onclick="switchScene(9)">
        <span>🏇 浴室骑乘素股 B</span>
        <span class="nav-badge">12帧深入</span>
      </button>
      <button class="nav-btn" onclick="switchScene(10)">
        <span>💋 浴室心动侍奉</span>
        <span class="nav-badge">101帧超丝滑</span>
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

    <!-- 中间主舞台 -->
    <div class="stage-container">
      <div class="stage">
        <!-- 场景描述浮窗 -->
        <div class="scene-meta">
          <div id="meta-title" class="scene-meta-title">🔥 镜前站立后入本番 (11帧动作 + 头部精准同步)</div>
          <div id="meta-desc" class="scene-meta-desc">浴室大镜子前，倒映着两人紧紧相拥。头部、身体与镜面反光完全拼合对齐！</div>
          <div id="code-meta" class="code-badge">内核对齐: 头部坐标 X=860, Y=70 | 身体原点 (0, 0)</div>
        </div>

        <!-- 1920x1080 游戏硬件级画布容器 -->
        <div class="stage-canvas-box">
          <canvas id="stage-canvas" width="1920" height="1080"></canvas>
          <img id="layer-steam" class="steam-layer" src="./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_Steam.png" />
        </div>
      </div>

      <!-- 底部播控条 -->
      <div class="control-bar">
        <div class="slider-row">
          <span id="curr-frame-text" class="info-label" style="min-width: 65px;">1 / 11</span>
          <input type="range" id="frame-slider" min="0" max="10" value="0" oninput="onSliderChange(this.value)">
          <span id="fps-text" class="info-label" style="min-width: 65px;">12 FPS</span>
        </div>

        <div class="action-row">
          <div class="btn-group">
            <button id="btn-prev" class="ctrl-btn" onclick="stepFrame(-1)">⏮ 上一帧</button>
            <button id="btn-play" class="ctrl-btn active" onclick="togglePlay()">⏸ 暂停</button>
            <button id="btn-next" class="ctrl-btn" onclick="stepFrame(1)">⏭ 下一帧</button>
          </div>

          <div class="btn-group">
            <span class="info-label" style="margin-right: 2px;">倍速:</span>
            <button class="ctrl-btn" onclick="setSpeed(0.5)">0.5x</button>
            <button class="ctrl-btn active" id="spd-10" onclick="setSpeed(1.0)">1.0x</button>
            <button class="ctrl-btn" onclick="setSpeed(1.5)">1.5x</button>
            <button class="ctrl-btn" onclick="setSpeed(2.0)">2.0x</button>
          </div>

          <div class="btn-group">
            <button id="btn-kao" class="ctrl-btn" onclick="cycleKao()" style="display: none;">😊 表情: 娇羞A</button>
            <button id="btn-cutaway" class="ctrl-btn active" onclick="toggleCutaway()" style="display: none;">🔬 断面透视</button>
            <button id="btn-semen" class="ctrl-btn" onclick="toggleSemen()" style="display: none;">💧 射精注入</button>
            <button id="btn-steam" class="ctrl-btn" onclick="toggleSteam()">💨 水汽蒸汽</button>
            <button id="btn-fullscreen" class="ctrl-btn" onclick="toggleFullscreen()">⛶ 全屏</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 图像高速缓存池
    const imageCache = new Map();
    function getImage(src) {
      if (!src) return null;
      if (!imageCache.has(src)) {
        const img = new Image();
        img.src = src;
        img.onload = () => renderFrame();
        imageCache.set(src, img);
      }
      return imageCache.get(src);
    }

    // 场景全景定义 (完整涵盖解密后的所有浴室素材)
    const SCENES = [
      // 0: 镜前站立后入本番 (优先展示，彻底解决头部对齐)
      {
        id: "tachiBakku",
        title: "🔥 镜前站立后入本番 (11帧动作 + 头部精准同步)",
        desc: "浴室大镜子前，倒映着两人紧紧相拥。头部、身体与镜面反光完全拼合对齐！",
        codeInfo: "内核对齐: 头部 (860, 70) · 身体 (0, 0) · 剖面 (450, 800) · 精液 (200, 700)",
        fps: 12,
        bg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewBackground.png",
        fg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewForeground.png",
        frames: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_action${i+1}.png`),
        heads: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_kaoA${i+1}.png`),
        cutaways: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_action_cutawayView${i+1}.png`),
        semens: Array.from({length: 11}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_TachiBakku_seieki${i+1}.png`),
        hasKaoSwitch: true,
        hasCutaway: true,
        hasSemen: true,
        hasSteam: false
      },
      // 1: 镜前抓手后入本番
      {
        id: "udeTsukamiBakku",
        title: "🤝 镜前抓手后入本番 (14帧完整大动态)",
        desc: "哥哥抓紧妹妹双手，更加强烈的本番节奏与细腻画质",
        codeInfo: "内核对齐: 身体 (150, -80, 缩放110%) · 剖面 (370, 690, 缩放110%)",
        fps: 12,
        bg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewBackground.png",
        fg: "./14_浴室亲密本番(260帧)/bathroom_homban_mirrorViewForeground.png",
        frames: Array.from({length: 14}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_UdeTsukamiBakku_action${i+1}.png`),
        cutaways: Array.from({length: 14}, (_, i) => `./14_浴室亲密本番(260帧)/bathroom_UdeTsukamiBakku_action_cutawayView${i+1}.png`),
        hasCutaway: true,
        hasSteam: false
      },
      // 2: 小黄鸭
      {
        id: "duck",
        title: "🦆 浴缸玩小黄鸭",
        desc: "妹妹一个人浸泡在热水里，轻轻拨弄浮在水面上的小黄鸭玩偶",
        codeInfo: "内核对齐: 浴缸全景 (0, 0)",
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
      // 3: 吹泡泡
      {
        id: "bubble",
        title: "🫧 浴缸吹泡泡",
        desc: "妹妹掌心捧着沐浴露打出的绵密泡沫，鼓起腮帮轻轻吹动",
        codeInfo: "内核对齐: 浴缸全景 (0, 0)",
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
      // 4: 伸懒腰舒展
      {
        id: "stretching",
        title: "🧘 舒展身体懒腰",
        desc: "水温刚好，妹妹惬意地仰起下巴伸展白皙的肢体",
        codeInfo: "内核对齐: 浴缸全景 (0, 0)",
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
      // 5: 帮妹妹洗头发
      {
        id: "washHair",
        title: "🧴 帮妹妹洗头发与擦拭",
        desc: "哥哥耐心地帮妹妹搓洗长发，指尖抚过发梢的温存日常",
        codeInfo: "内核对齐: 浴室地板全景 (0, 0)",
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
      // 6: 两人一起泡澡
      {
        id: "sitTogether",
        title: "🛁 两人一起泡澡",
        desc: "狭小的浴缸里挤着两个人，妹妹害羞地别过头不敢直视",
        codeInfo: "内核对齐: 浴缸全景 (0, 0)",
        fps: 2,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: [
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sitTogetherInBathtub1.png",
          "./07_浴室沐浴与擦背动态(131帧)/bathroom_sitTogetherInBathtub2.png"
        ],
        hasSteam: true
      },
      // 7: 抱出浴缸
      {
        id: "liftUp",
        title: "🧽 抱出浴缸/擦拭体贴",
        desc: "泡得有点头晕的妹妹，被稳稳地抱出浴缸用大浴巾包裹",
        codeInfo: "内核对齐: 浴室全景 (0, 0)",
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
      // 8: 素股A
      {
        id: "sumataA",
        title: "🏇 浴室骑乘素股 A 动作",
        desc: "妹妹跨坐在腿上，湿漉漉的肌肤紧密贴合滑动",
        codeInfo: "内核对齐: 地板坐姿 (0, 0)",
        fps: 14,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: Array.from({length: 12}, (_, i) => `./19_浴室素股亲密(96帧)/bathroom_sumata_ridingA${i+1}.png`),
        hasSteam: true
      },
      // 9: 素股B
      {
        id: "sumataB",
        title: "🏇 浴室骑乘素股 B 动作",
        desc: "更深频率的摩擦，水花与体温交织的急促呼吸",
        codeInfo: "内核对齐: 地板坐姿 (0, 0)",
        fps: 14,
        bg: "./07_浴室沐浴与擦背动态(131帧)/[NSFW]bathroom_helpWashImouto_background.png",
        frames: Array.from({length: 12}, (_, i) => `./19_浴室素股亲密(96帧)/bathroom_sumata_ridingB${i+1}.png`),
        hasSteam: true
      },
      // 10: 心动侍奉 (101帧超长连贯)
      {
        id: "blowjob",
        title: "💋 浴室心动侍奉 (101帧超高清)",
        desc: "在浴室地板上妹妹全心全意的温暖侍奉，极致的连贯帧数",
        codeInfo: "内核对齐: 动作原点 (180, 0)",
        fps: 16,
        bg: "./15_浴室心动奉仕(175帧)/bathroom_blowjob_oniichan_background.png",
        fg: "./15_浴室心动奉仕(175帧)/bathroom_blowjob_oniichan_foreground.png",
        frames: Array.from({length: 101}, (_, i) => `./15_浴室心动奉仕(175帧)/bathroom_blowjob${i}.png`),
        hasSteam: false
      },
      // 11: 黄昏开灯
      {
        id: "dusk",
        title: "🌇 黄昏 · 浴室开灯全景",
        desc: "窗外是晚霞渐隐的暖红，浴室吊灯已点亮，泛着柔和水光",
        codeInfo: "环境大图 (0, 0)",
        fps: 1,
        frames: ["./06_浴室场景与光影(8张)/bathroom_dusk_lightOn.png"],
        hasSteam: false
      },
      // 12: 深夜开灯开浴缸盖
      {
        id: "night",
        title: "🌃 深夜 · 浴室开灯 (开浴缸盖)",
        desc: "深夜无人的浴室，浴缸热气腾腾，等待着疲惫归来的旅人",
        codeInfo: "环境大图 (0, 0)",
        fps: 1,
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
    let cutawayActive = true;
    let semenActive = false;
    let kaoMode = 'kaoA'; // kaoA, kaoB, kaoC

    const canvas = document.getElementById('stage-canvas');
    const ctx = canvas.getContext('2d');

    function initScene(idx) {
      currentSceneIdx = idx;
      currentFrameIdx = 0;
      const sc = SCENES[idx];

      // 更新标题和描述
      document.getElementById('meta-title').innerText = sc.title;
      document.getElementById('meta-desc').innerText = sc.desc;
      document.getElementById('code-meta').innerText = sc.codeInfo || '游戏内核对齐';

      // 更新按钮高亮
      const btns = document.querySelectorAll('.nav-btn');
      btns.forEach((b, i) => {
        if (i === idx) b.classList.add('active');
        else b.classList.remove('active');
      });

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
      }

      // 射精精液按钮控制 (站立后入)
      const semenBtn = document.getElementById('btn-semen');
      if (sc.hasSemen) {
        semenBtn.style.display = 'flex';
      } else {
        semenBtn.style.display = 'none';
      }

      // 表情切换按钮控制 (站立后入)
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

      // 预加载当前场景的所有图片
      preloadCurrentScene();

      renderFrame();
      restartLoop();
    }

    function preloadCurrentScene() {
      const sc = SCENES[currentSceneIdx];
      if (sc.bg) getImage(sc.bg);
      if (sc.fg) getImage(sc.fg);
      if (sc.head) getImage(sc.head);
      sc.frames.forEach(f => getImage(f));
      if (sc.heads) {
        ['kaoA', 'kaoB', 'kaoC'].forEach(mode => {
          sc.heads.forEach(h => getImage(h.replace('kaoA', mode)));
        });
      }
      if (sc.cutaways) sc.cutaways.forEach(c => getImage(c));
      if (sc.semens) sc.semens.forEach(s => getImage(s));
    }

    function switchScene(idx) {
      initScene(idx);
    }

    function renderFrame() {
      const sc = SCENES[currentSceneIdx];
      
      // 清空画布 (1920x1080)
      ctx.clearRect(0, 0, 1920, 1080);

      // 1. 渲染背景
      if (sc.bg) {
        const bgImg = getImage(sc.bg);
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, 1920, 1080);
        }
      }

      // 2. 渲染主动作主体与各场景专有对齐坐标
      const bodySrc = sc.frames[currentFrameIdx];
      const bodyImg = getImage(bodySrc);

      if (sc.id === 'tachiBakku') {
        // --- 镜前站立后入本番 (完美吻合游戏原版 RPG Maker 插件代码) ---
        // 游戏源码：$gameScreen.showPicture(6, IMG, 0, posX, posY, 100, 100, 255, 0); 身体位于 (0, 0)，原图宽1400高1080
        if (bodyImg && bodyImg.complete && bodyImg.naturalWidth > 0) {
          ctx.drawImage(bodyImg, 0, 0, 1400, 1080);
        }

        // 头部：$gameScreen.showPicture(10, kao, 0, posX + 860, posY + 70, 100, 100, 255, 0); 头部位于 (860, 70)，原图宽540高700
        if (sc.heads && sc.heads[currentFrameIdx]) {
          const headSrc = sc.heads[currentFrameIdx].replace('kaoA', kaoMode);
          const headImg = getImage(headSrc);
          if (headImg && headImg.complete && headImg.naturalWidth > 0) {
            ctx.drawImage(headImg, 860, 70, 540, 700);
          }
        }

        // 剖面透视：$gameScreen.showPicture(7, xrayVision, 0, posX + 450, posY + 800, 100, 100, opacity, 0);
        if (cutawayActive && sc.cutaways && sc.cutaways[currentFrameIdx]) {
          const cutawayImg = getImage(sc.cutaways[currentFrameIdx]);
          if (cutawayImg && cutawayImg.complete && cutawayImg.naturalWidth > 0) {
            ctx.drawImage(cutawayImg, 450, 800, 350, 210);
          }
        }

        // 精液注入：$gameScreen.showPicture(8, seieki, 0, posX + 200, posY + 700, 100, 100, 255, 0);
        if (semenActive && sc.semens && sc.semens[currentFrameIdx]) {
          const semenImg = getImage(sc.semens[currentFrameIdx]);
          if (semenImg && semenImg.complete && semenImg.naturalWidth > 0) {
            ctx.drawImage(semenImg, 200, 700, 360, 380);
          }
        }

        // 前景镜框置物架：$gameScreen.showPictureFromPath(9, path, 'bathroom_homban_mirrorViewForeground', 0, 0, 0, 100, 100, 255, 0);
        if (sc.fg) {
          const fgImg = getImage(sc.fg);
          if (fgImg && fgImg.complete && fgImg.naturalWidth > 0) {
            ctx.drawImage(fgImg, 0, 0, 1920, 1080);
          }
        }

      } else if (sc.id === 'udeTsukamiBakku') {
        // --- 镜前抓手后入本番 ---
        // 游戏源码：posX = 150; posY = -80; scale = 110;
        if (bodyImg && bodyImg.complete && bodyImg.naturalWidth > 0) {
          ctx.drawImage(bodyImg, 150, -80, 1120 * 1.1, 1080 * 1.1);
        }

        // 剖面透视：xrayPosX = 370; xrayPosY = 690; scale = 110;
        if (cutawayActive && sc.cutaways && sc.cutaways[currentFrameIdx]) {
          const cutawayImg = getImage(sc.cutaways[currentFrameIdx]);
          if (cutawayImg && cutawayImg.complete && cutawayImg.naturalWidth > 0) {
            ctx.drawImage(cutawayImg, 370, 690, 720 * 1.1, 380 * 1.1);
          }
        }

        // 前景镜框
        if (sc.fg) {
          const fgImg = getImage(sc.fg);
          if (fgImg && fgImg.complete && fgImg.naturalWidth > 0) {
            ctx.drawImage(fgImg, 0, 0, 1920, 1080);
          }
        }

      } else if (sc.id === 'blowjob') {
        // 侍奉动作：游戏源码 posX = 180, posY = 0
        if (bodyImg && bodyImg.complete && bodyImg.naturalWidth > 0) {
          ctx.drawImage(bodyImg, 180, 0, 1920, 1080);
        }
        if (sc.fg) {
          const fgImg = getImage(sc.fg);
          if (fgImg && fgImg.complete && fgImg.naturalWidth > 0) {
            ctx.drawImage(fgImg, 0, 0, 1920, 1080);
          }
        }

      } else {
        // 其它全景/浴缸场景 (0, 0)
        if (bodyImg && bodyImg.complete && bodyImg.naturalWidth > 0) {
          ctx.drawImage(bodyImg, 0, 0, 1920, 1080);
        }
        if (sc.head) {
          const headImg = getImage(sc.head);
          if (headImg && headImg.complete && headImg.naturalWidth > 0) {
            ctx.drawImage(headImg, 0, 0, 1920, 1080);
          }
        }
        if (sc.fg) {
          const fgImg = getImage(sc.fg);
          if (fgImg && fgImg.complete && fgImg.naturalWidth > 0) {
            ctx.drawImage(fgImg, 0, 0, 1920, 1080);
          }
        }
      }

      // 更新进度条与信息
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
      if (isPlaying) togglePlay();
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
      document.querySelectorAll('.btn-group button').forEach(b => {
        if (b.innerText.endsWith('x')) {
          if (b.innerText === `${scale.toFixed(1)}x`) b.classList.add('active');
          else b.classList.remove('active');
        }
      });
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
      cutawayActive = !cutawayActive;
      const cutawayBtn = document.getElementById('btn-cutaway');
      if (cutawayActive) cutawayBtn.classList.add('active');
      else cutawayBtn.classList.remove('active');
      renderFrame();
    }

    function toggleSemen() {
      semenActive = !semenActive;
      const semenBtn = document.getElementById('btn-semen');
      if (semenActive) semenBtn.classList.add('active');
      else semenBtn.classList.remove('active');
      renderFrame();
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
      const labels = {
        'kaoA': '😊 表情: 娇羞A',
        'kaoB': '😍 表情: 恍惚B',
        'kaoC': '🤤 表情: 失神C'
      };
      kaoBtn.innerText = labels[kaoMode] || '😊 表情切换';
    }

    function toggleFullscreen() {
      const box = document.querySelector('.stage-canvas-box');
      if (!document.fullscreenElement) {
        box.requestFullscreen().catch(err => alert(`全屏错误: ${err.message}`));
      } else {
        document.exitFullscreen();
      }
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

    // 启动初始场景 (默认第一场景：镜前站立后入)
    initScene(0);
  </script>
</body>
</html>
"""

with open(target, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully generated: {target}")
