import os
import sys
import json
import datetime
import urllib.parse
import sqlite3

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
import db_engine

# --- 生成精致 SVG 矢量兜底立绘 (当本地图片异常时的备用) ---
def make_svg_avatar(char_char, bg1, bg2, border_color):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g_{char_char}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="47" fill="url(#g_{char_char})" stroke="{border_color}" stroke-width="3"/>
  <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">{char_char}</text>
</svg>'''
    return "data:image/svg+xml;utf8," + urllib.parse.quote(svg)

svg_avatars = {
    'hatsuzuki': make_svg_avatar('初', '#0284c7', '#38bdf8', '#7dd3fc'),
    'taihou': make_svg_avatar('凤', '#b91c1c', '#ef4444', '#fca5a5'),
    'prinz_eugen': make_svg_avatar('欧', '#475569', '#64748b', '#cbd5e1'),
    'belfast': make_svg_avatar('贝', '#1d4ed8', '#3b82f6', '#93c5fd'),
    'atago': make_svg_avatar('爱', '#d97706', '#f59e0b', '#fde68a')
}

char_avatars = {
    'hatsuzuki': '/images/azurlane/hatsuzuki.png',
    'taihou': '/images/azurlane/taihou.png',
    'prinz_eugen': '/images/azurlane/prinz_eugen.png',
    'belfast': '/images/azurlane/belfast.png',
    'atago': '/images/azurlane/atago.png'
}

def generate_custom_html_and_css():
    custom_css = """
:root {
  --al-navy: #07132b;
  --al-card-bg: rgba(11, 28, 58, 0.78);
  --al-cyan: #38bdf8;
  --al-cyan-glow: rgba(56, 189, 248, 0.45);
  --al-pink: #f43f5e;
  --al-gold: #fbbf24;
  --al-border: rgba(56, 189, 248, 0.28);
  --al-border-hover: rgba(56, 189, 248, 0.7);
  --al-text: #f1f5f9;
  --al-text-muted: #94a3b8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--al-text);
  line-height: 1.65;
  background: transparent !important;
  padding: 14px;
  overflow-x: hidden;
}

.handbook-wrapper {
  max-width: 960px;
  margin: 0 auto;
}

/* 顶部英雄横幅 */
.hero-banner {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(244, 63, 94, 0.12) 100%), var(--al-card-bg);
  border: 1px solid var(--al-border);
  border-radius: 18px;
  padding: 20px 22px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  margin-bottom: 18px;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.hero-icon {
  font-size: 32px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid var(--al-cyan);
  border-radius: 14px;
  box-shadow: 0 0 16px var(--al-cyan-glow);
}

.hero-title-wrap h1 {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 40%, #7dd3fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 13px;
  color: var(--al-text-muted);
  margin-top: 2px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.hero-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.1);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-weight: 500;
}

.hero-tag.gold {
  background: rgba(251, 191, 36, 0.12);
  color: #fde68a;
  border-color: rgba(251, 191, 36, 0.35);
}

.hero-tag.pink {
  background: rgba(244, 63, 94, 0.12);
  color: #fda4af;
  border-color: rgba(244, 63, 94, 0.35);
}

/* 导航选项卡 Tab Bar */
.tabs-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  background: rgba(7, 19, 43, 0.65);
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--al-border);
  overflow-x: auto;
}

.tab-btn {
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--al-text-muted);
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #ffffff;
  background: rgba(56, 189, 248, 0.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.8) 0%, rgba(14, 165, 233, 0.65) 100%);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.45);
  border: 1px solid rgba(56, 189, 248, 0.5);
}

/* 选项卡面板 */
.tab-pane {
  display: none;
  animation: fadeIn 0.3s ease;
}

.tab-pane.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 舰娘名录矩阵 (Tab 1) */
.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.character-card {
  background: var(--al-card-bg);
  border: 1px solid var(--al-border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #38bdf8, #f43f5e);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.character-card:hover {
  transform: translateY(-4px);
  border-color: var(--al-border-hover);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), 0 0 20px var(--al-cyan-glow);
}

.character-card:hover::before {
  opacity: 1;
}

.card-top {
  display: flex;
  gap: 14px;
  align-items: center;
}

.avatar-wrap {
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--al-cyan);
  box-shadow: 0 0 12px var(--al-cyan-glow);
  position: relative;
  background: #0f172a;
}

.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.character-card:hover .avatar-wrap img {
  transform: scale(1.08);
}

.card-header-info {
  flex: 1;
  min-width: 0;
}

.card-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.card-faction {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.card-tag {
  font-size: 12px;
  color: var(--al-text-muted);
  margin-top: 3px;
}

.card-quote {
  font-size: 12px;
  color: #bae6fd;
  background: rgba(2, 132, 199, 0.14);
  border-left: 3px solid var(--al-cyan);
  padding: 8px 10px;
  border-radius: 0 8px 8px 0;
  line-height: 1.5;
  font-style: italic;
}

.card-footer-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: auto;
}

.micro-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.card-click-tip {
  font-size: 11px;
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  font-weight: 500;
}

/* 母港偶遇场景 (Tab 2) */
.scenes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.scene-box {
  background: var(--al-card-bg);
  border: 1px solid var(--al-border);
  border-radius: 16px;
  padding: 18px 20px;
  transition: all 0.25s ease;
}

.scene-box:hover {
  border-color: var(--al-border-hover);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.scene-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.scene-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.scene-badge {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(244, 63, 94, 0.15);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.35);
  font-weight: 600;
}

.scene-desc {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.7;
}

/* 圣洁誓约与婚纱图鉴 (Tab 3) */
.oath-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.oath-hero-card {
  background: var(--al-card-bg);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(251, 191, 36, 0.2);
}

.oath-hero-title {
  font-size: 18px;
  font-weight: 800;
  color: #fde68a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.oath-image-wrap {
  width: 100%;
  max-height: 480px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid rgba(251, 191, 36, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  position: relative;
  margin-bottom: 16px;
  background: #091024;
}

.oath-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.oath-image-wrap:hover img {
  transform: scale(1.02);
}

.oath-image-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid #fbbf24;
  color: #fbbf24;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.oath-quote-box {
  background: rgba(251, 191, 36, 0.08);
  border-left: 4px solid #fbbf24;
  padding: 14px 16px;
  border-radius: 0 10px 10px 0;
  color: #fef08a;
  font-size: 13px;
  line-height: 1.7;
  font-style: italic;
  margin-bottom: 14px;
}

.oath-ladder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.ladder-item {
  background: rgba(7, 19, 43, 0.7);
  border: 1px solid var(--al-border);
  border-radius: 12px;
  padding: 12px;
}

.ladder-level {
  font-size: 12px;
  font-weight: 700;
  color: #7dd3fc;
  margin-bottom: 4px;
}

.ladder-desc {
  font-size: 11px;
  color: var(--al-text-muted);
  line-height: 1.5;
}

/* 开局设定选择器 (Tab 4) */
.setup-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setup-card {
  background: var(--al-card-bg);
  border: 1px solid var(--al-border);
  border-radius: 16px;
  padding: 20px;
}

.setup-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  background: rgba(7, 19, 43, 0.65);
  border: 1px solid var(--al-border);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: var(--al-border-hover);
  background: rgba(56, 189, 248, 0.08);
}

.option-item.selected {
  border-color: #38bdf8;
  background: rgba(2, 132, 199, 0.18);
  box-shadow: 0 0 16px var(--al-cyan-glow);
}

.option-radio {
  margin-top: 3px;
  accent-color: #38bdf8;
}

.option-text-wrap {
  flex: 1;
}

.option-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.option-desc {
  font-size: 12px;
  color: var(--al-text-muted);
  line-height: 1.5;
}

.summary-card {
  background: rgba(7, 19, 43, 0.8);
  border: 1px solid var(--al-border);
  border-radius: 14px;
  padding: 16px;
}

.summary-header {
  font-size: 13px;
  font-weight: 600;
  color: #7dd3fc;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

#summaryBox {
  font-size: 12px;
  color: #cbd5e1;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  min-height: 80px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

.btn-custom {
  flex: 1;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #f43f5e 100%);
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(2, 132, 199, 0.45);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(2, 132, 199, 0.6);
}

@media (max-width: 640px) {
  body {
    padding: 8px;
  }
  .hero-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .tabs-nav {
    overflow-x: auto;
  }
  .tab-btn {
    min-width: 120px;
    font-size: 12px;
    padding: 8px 10px;
  }
  .char-grid {
    grid-template-columns: 1fr;
  }
  .action-buttons {
    flex-direction: column;
  }
}
"""

    custom_html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>碧蓝航线母港大世界</title>
  <style>{custom_css}</style>
</head>
<body>
  <div class="handbook-wrapper">
    <!-- 顶部英雄横幅 -->
    <div class="hero-banner">
      <div class="hero-header">
        <div class="hero-icon">⚓</div>
        <div class="hero-title-wrap">
          <h1>【碧蓝大世界】唯一指挥官与母港全员的日常修罗场</h1>
          <div class="hero-subtitle">母港唯一男性指挥官 · 心智魔方过载净化 · 偶遇突发名场面 · 誓约之戒专属物语</div>
        </div>
      </div>
      <div class="hero-tags">
        <span class="hero-tag">⚓ 800+ 舰娘全员收录</span>
        <span class="hero-tag gold">🌸 纯净心智魔方共鸣</span>
        <span class="hero-tag pink">💍 官方誓约婚纱图鉴</span>
        <span class="hero-tag">🔥 开放世界偶遇推演</span>
      </div>
    </div>

    <!-- 选项卡导航 -->
    <div class="tabs-nav">
      <button class="tab-btn active" data-tab="tab-roster">⚓ 舰娘名录与立绘</button>
      <button class="tab-btn" data-tab="tab-encounters">🗺️ 母港全区高能偶遇</button>
      <button class="tab-btn" data-tab="tab-oath">💍 圣洁誓约与婚纱</button>
      <button class="tab-btn" data-tab="tab-start">🚀 偶遇剧本与开局</button>
    </div>

    <!-- 选项卡内容 1: 舰娘名录与立绘矩阵 -->
    <div id="tab-roster" class="tab-pane active">
      <div class="char-grid">
        <!-- 1. 初月 -->
        <div class="character-card" data-character="hatsuzuki">
          <div class="card-top">
            <div class="avatar-wrap">
              <img src="{char_avatars['hatsuzuki']}" onerror="this.onerror=null; this.src='{svg_avatars['hatsuzuki']}';" alt="初月">
            </div>
            <div class="card-header-info">
              <div class="card-name-row">
                <span class="card-name">初月</span>
                <span class="card-faction">重樱 · 驱逐</span>
              </div>
              <div class="card-tag">傲娇小娇妻 · 嘴硬逞强护夫</div>
            </div>
          </div>
          <div class="card-quote">“变、变态！笨蛋！别突然摸那里啊！……不过……如果是你的话……初月才没有讨厌呢！”</div>
          <div class="card-footer-tags">
            <span class="micro-badge">秋月级</span>
            <span class="micro-badge">婚纱「红桥映雪」</span>
            <span class="micro-badge">特殊触摸脸红</span>
          </div>
          <div class="card-click-tip">点击查看立绘与私密档案 ➔</div>
        </div>

        <!-- 2. 大凤 -->
        <div class="character-card" data-character="taihou">
          <div class="card-top">
            <div class="avatar-wrap">
              <img src="{char_avatars['taihou']}" onerror="this.onerror=null; this.src='{svg_avatars['taihou']}';" alt="大凤">
            </div>
            <div class="card-header-info">
              <div class="card-name-row">
                <span class="card-name">大凤</span>
                <span class="card-faction">重樱 · 空母</span>
              </div>
              <div class="card-tag">极度病娇独占 · 身心极致奉献</div>
            </div>
          </div>
          <div class="card-quote">“啊哈……指挥官大人的手，好热……请尽情触碰大凤吧，大凤整个人早已是您的私有物了呢~”</div>
          <div class="card-footer-tags">
            <span class="micro-badge">手握备用钥匙</span>
            <span class="micro-badge">私密夜查房</span>
            <span class="micro-badge">婚纱「潮风的吸引」</span>
          </div>
          <div class="card-click-tip">点击查看立绘与私密档案 ➔</div>
        </div>

        <!-- 3. 欧根亲王 -->
        <div class="character-card" data-character="prinz_eugen">
          <div class="card-top">
            <div class="avatar-wrap">
              <img src="{char_avatars['prinz_eugen']}" onerror="this.onerror=null; this.src='{svg_avatars['prinz_eugen']}';" alt="欧根亲王">
            </div>
            <div class="card-header-info">
              <div class="card-name-row">
                <span class="card-name">欧根亲王</span>
                <span class="card-faction">铁血 · 重巡</span>
              </div>
              <div class="card-tag">狡黠微醺恶魔 · 撩人调情大师</div>
            </div>
          </div>
          <div class="card-quote">“呵呵……心跳得这么快，手还在抖哦？指挥官是不是想对我做比这更过分的事呢？”</div>
          <div class="card-footer-tags">
            <span class="micro-badge">微醺啤酒</span>
            <span class="micro-badge">密闭电梯故障</span>
            <span class="micro-badge">婚纱「命运交响曲」</span>
          </div>
          <div class="card-click-tip">点击查看立绘与私密档案 ➔</div>
        </div>

        <!-- 4. 贝尔法斯特 -->
        <div class="character-card" data-character="belfast">
          <div class="card-top">
            <div class="avatar-wrap">
              <img src="{char_avatars['belfast']}" onerror="this.onerror=null; this.src='{svg_avatars['belfast']}';" alt="贝尔法斯特">
            </div>
            <div class="card-header-info">
              <div class="card-name-row">
                <span class="card-name">贝尔法斯特</span>
                <span class="card-faction">皇家 · 轻巡</span>
              </div>
              <div class="card-tag">完美女仆长 · 极致体贴贴身侍奉</div>
            </div>
          </div>
          <div class="card-quote">“主上，虽然无论怎样的侍奉都是女仆的职责……但在此处，女仆长也是会难为情的呢。”</div>
          <div class="card-footer-tags">
            <span class="micro-badge">皇家女仆队之长</span>
            <span class="micro-badge">特调伯爵红茶</span>
            <span class="micro-badge">婚纱「克拉达的誓约」</span>
          </div>
          <div class="card-click-tip">点击查看立绘与私密档案 ➔</div>
        </div>

        <!-- 5. 爱宕 -->
        <div class="character-card" data-character="atago">
          <div class="card-top">
            <div class="avatar-wrap">
              <img src="{char_avatars['atago']}" onerror="this.onerror=null; this.src='{svg_avatars['atago']}';" alt="爱宕">
            </div>
            <div class="card-header-info">
              <div class="card-name-row">
                <span class="card-name">爱宕</span>
                <span class="card-faction">重樱 · 重巡</span>
              </div>
              <div class="card-tag">极品温柔大姐姐 · 肉感丰腴膝枕</div>
            </div>
          </div>
          <div class="card-quote">“哎呀指挥官真是个贪心的小坏蛋呢……要不要靠在姐姐的大腿上，让我好好疼爱一下呢？”</div>
          <div class="card-footer-tags">
            <span class="micro-badge">温柔膝枕</span>
            <span class="micro-badge">犬耳摸头杀</span>
            <span class="micro-badge">婚纱「白花的誓约」</span>
          </div>
          <div class="card-click-tip">点击查看立绘与私密档案 ➔</div>
        </div>
      </div>
      <div style="text-align: center; font-size: 12px; color: var(--al-cyan); margin-top: 14px; opacity: 0.85;">
        💡 点击上方任意舰娘卡片，即可以视口居中高保真弹窗查看完整官方立绘与私密剧情反应
      </div>
    </div>

    <!-- 选项卡内容 2: 母港全区高能偶遇 -->
    <div id="tab-encounters" class="tab-pane">
      <div class="scenes-grid">
        <div class="scene-box">
          <div class="scene-box-header">
            <div class="scene-title">🌸 露天温泉更衣室 · 暴风雨断电之夜</div>
            <div class="scene-badge">心跳爆表 · 密室相贴</div>
          </div>
          <div class="scene-desc">
            台风肆虐断电的更衣室，在湿漉水汽中撞入半裹浴巾的傲娇初月怀中。门外爱宕成熟微醺的脚步与大凤病娇甜蜜的喘息步步逼近，两人只得屏息躲入极其逼仄的单人更衣柜死角！
          </div>
        </div>

        <div class="scene-box">
          <div class="scene-box-header">
            <div class="scene-title">🦅 深海重工船坞 · 密闭升降梯故障</div>
            <div class="scene-badge">微醺过载 · 狭窄封闭</div>
          </div>
          <div class="scene-desc">
            深夜巡查突遇系统锁死，升降梯骤停并切断冷气，金属舱壁升温发烫。心智魔方过载发热的欧根亲王带着啤酒的微醺醉意反客为主，轻吐热气步步紧逼。
          </div>
        </div>

        <div class="scene-box">
          <div class="scene-box-header">
            <div class="scene-title">🌸 指挥官官邸主卧 · 私密夜查房</div>
            <div class="scene-badge">病娇抓包 · 极度羞耻</div>
          </div>
          <div class="scene-desc">
            庆功宴微醺回宿推开房门，当场撞破大凤偷用备用钥匙潜入、正跪坐在大床上紧抱你换洗的军服深吸体味。撞破后的病娇偏执与羞耻交织拉扯，气氛失控。
          </div>
        </div>

        <div class="scene-box">
          <div class="scene-box-header">
            <div class="scene-title">👑 皇家花园茶室 · 女仆长的特别惩罚</div>
            <div class="scene-badge">优雅禁断 · 贴身侍奉</div>
          </div>
          <div class="scene-desc">
            下午茶时失手打翻伯爵红茶浸湿衣物，完美女仆长贝尔法斯特微笑着反锁茶室木门，以“皇家主仆礼仪纠正”为由，为你进行不容拒绝的贴身更衣与擦拭。
          </div>
        </div>
      </div>
    </div>

    <!-- 选项卡内容 3: 圣洁誓约与婚纱 -->
    <div id="tab-oath" class="tab-pane">
      <div class="oath-container">
        <div class="oath-hero-card">
          <div class="oath-hero-title">
            <span>💍</span>
            <span>官方誓约婚纱特写 · 初月「红桥映雪」</span>
          </div>
          <div class="oath-image-wrap">
            <img src="/images/azurlane/hatsuzuki_oath_full.jpg" alt="初月「红桥映雪」官方誓约婚纱全景大图">
            <div class="oath-image-badge">✨ 官方誓约婚纱全景原画</div>
          </div>
          <div class="oath-quote-box">
            “指挥官，这就是……和你的誓约之证吗？……哼，初月可不是因为喜欢你才穿上这身婚纱的哦……只是、只是看你一直一个人笨笨的，不得不留下来照顾你一辈子罢了！……所以，余生请多指教了，我亲爱的夫君大人……”
          </div>
          <div style="font-size: 13px; color: #cbd5e1; line-height: 1.7;">
            <b>【心智好感度与誓约之戒解锁法则】</b><br>
            通过日常贴身互动与深度推演，当舰娘心智好感度达到 100/100 且完成心智魔方纯净共鸣时，即可奉上纯银誓约之戒，触发全景专属誓约仪式，解锁绝美婚纱立绘与新婚同居专属宠溺篇章！
          </div>
          <div class="oath-ladder-grid">
            <div class="ladder-item">
              <div class="ladder-level">0 ~ 39% 陌生警戒</div>
              <div class="ladder-desc">严格遵守军事上下级条例，偶遇时保持必要距离与拘谨礼仪。</div>
            </div>
            <div class="ladder-item">
              <div class="ladder-level">40 ~ 69% 默契信赖</div>
              <div class="ladder-desc">愿意敞开心扉倾诉秘密，私下相处时流露出娇羞与依赖。</div>
            </div>
            <div class="ladder-item">
              <div class="ladder-level">70 ~ 89% 怦然爱慕</div>
              <div class="ladder-desc">占有欲与吃醋萌生，遭遇肢体触碰时心智魔方剧烈发烫共鸣。</div>
            </div>
            <div class="ladder-item">
              <div class="ladder-level">90 ~ 100% 圣洁誓约</div>
              <div class="ladder-desc">身心彻底托付，解锁官方绝美婚纱立绘与永不背叛的爱人契约。</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选项卡内容 4: 偶遇剧本与开局 -->
    <div id="tab-start" class="tab-pane">
      <div class="setup-container">
        <div class="setup-card">
          <div class="setup-title">
            <span>🚀</span>
            <span>选择你的第一幕母港偶遇场景</span>
          </div>
          <div class="options-list">
            <label class="option-item selected" data-opening-index="0">
              <input type="radio" name="opening_opt" class="option-radio" checked value="0">
              <div class="option-text-wrap">
                <div class="option-name">【暴雨温泉衣柜】（推荐开局）</div>
                <div class="option-desc">避雨误入露天温泉更衣室，在黑暗水汽中撞入半裹浴巾的初月怀中，躲入衣柜屏息避开大凤与爱宕搜查</div>
              </div>
            </label>

            <label class="option-item" data-opening-index="1">
              <input type="radio" name="opening_opt" class="option-radio" value="1">
              <div class="option-text-wrap">
                <div class="option-name">【密闭船坞升降梯】</div>
                <div class="option-desc">深夜巡查深海船坞遇电梯故障骤停，在密闭升温空间内与微醺、魔方过载发热的欧根亲王近距离对峙</div>
              </div>
            </label>

            <label class="option-item" data-opening-index="2">
              <input type="radio" name="opening_opt" class="option-radio" value="2">
              <div class="option-text-wrap">
                <div class="option-name">【官邸私密夜查房】</div>
                <div class="option-desc">庆功宴后微醺推开卧室房门，当场抓包正抱着旧军服吸吮体味、羞愤病娇拉扯的大凤</div>
              </div>
            </label>

            <label class="option-item" data-opening-index="3">
              <input type="radio" name="opening_opt" class="option-radio" value="3">
              <div class="option-text-wrap">
                <div class="option-name">【皇家女仆茶室特训】</div>
                <div class="option-desc">下午茶打翻茶水浸湿衣衫，被完美女仆长贝尔法斯特反锁休息室大门，接受私密贴身更衣与擦拭</div>
              </div>
            </label>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-header">
            <span>📋</span>
            <span>推演开局预设指令预览</span>
          </div>
          <div id="summaryBox"></div>
          <div class="action-buttons copy-wrap">
            <button id="copyBtn" class="btn-custom btn-secondary copy-btn">📋 复制开局设定</button>
            <button id="startStoryBtn" class="btn-custom btn-primary">🚀 填入并以此设定开局</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // ============ Sound System (Protected) ============
    let audioCtx = null;
    function initAudio() {{
      try {{
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {{
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioCtx();
        }}
      }} catch(e) {{
        audioCtx = null;
      }}
    }}

    function playSound(type) {{
      try {{
        if (!audioCtx) initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {{
          audioCtx.resume().catch(() => {{}});
        }}
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        switch(type) {{
          case 'click':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
          case 'open':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;
        }}
      }} catch(e) {{}}
    }}

    // ============ Character Data for Central Modal ============
    const characterData = {{
      'hatsuzuki': {{
        id: 'hatsuzuki',
        name: '初月',
        tag: '傲娇小娇妻 · 秋月级驱逐舰 🌸 重樱',
        avatar: '{char_avatars['hatsuzuki']}',
        description: `<p>🌸 <b>【重樱驱逐舰 · 秋月级】</b>表面嘴硬逞强、爱虚张声势，内心极其在意指挥官的评价与目光，害羞时容易语无伦次、耳尖通红的小娇妻系驱逐。</p><p>🌸 <b>【声线特征与语癖】</b>口是心非，常以“哼、才没有、你可别误会了”开头，但动作上却总是口嫌体正直地配合指挥官的一切要求。</p><p>🌸 <b>【特殊触摸反应】</b><i>“变、变态！笨蛋！别突然摸那里啊！……不过……如果是你的话……呜呜，初月什么都没说！”</i>（双颊瞬间熟透，慌乱护胸却又舍不得推开）</p><p>🌸 <b>【私密渴求】</b>渴望被指挥官真正当成可靠的伴侣而非小孩子对待，在私下独处时希望被紧紧抱住宠溺。</p><p>🌸 <b>【官方誓约婚纱】</b>「红桥映雪」已实装，身披红白传统白无垢花嫁，对与指挥官的新婚生活怀着无限悸动。</p>`,
        reaction: `<p>❤️ <b>心智好感度 60%~100% (爱慕·誓约)</b>：嘴上虽依然傲娇逞强，但在你面前彻底卸下心防，会红着脸主动牵你的手，甚至在更衣室或衣柜狭窄死角主动依偎进你怀中轻声呢喃。</p><p>🖤 <b>心智好感度 0%~59% (警戒·害羞)</b>：遭遇突发亲密接触时会慌乱羞愤、用小拳头捶你胸口并大喊变态，但绝不会真正伤害你，反而在事后因自己反应过激而暗自懊恼自责。</p>`
      }},
      'taihou': {{
        id: 'taihou',
        name: '大凤',
        tag: '极度病娇独占 · 装甲航空母舰 🌸 重樱',
        avatar: '{char_avatars['taihou']}',
        description: `<p>🌸 <b>【重樱装甲航空母舰】</b>将身心与灵魂100%系于指挥官一人，对指挥官身边任何雌性气息具备雷达般的警惕吃醋，拥有指挥官卧室的私藏备用钥匙。</p><p>🌸 <b>【声线特征与语癖】</b>称呼“指挥官大人”，语调绵密甜腻，带着滚烫喘息与令人骨头发酥的依恋感。</p><p>🌸 <b>【特殊触摸反应】</b><i>“啊哈……指挥官大人的手，好热……请尽情触碰大凤吧，大凤整个人、从里到外都早已是指挥官大人的私有物了呢~”</i></p><p>🌸 <b>【私密渴求】</b>希望将指挥官完全关进只有两个人的私密房间，24小时为指挥官做爱心料理并献上无止境的侍奉与索取。</p><p>🌸 <b>【官方誓约婚纱】</b>「潮风的吸引」，海风扬起黑白交织的蕾丝婚纱，只为你一人绽放。</p>`,
        reaction: `<p>❤️ <b>心智好感度 60%~100% (极度沉沦)</b>：无论你提出多么过分的要求都会红着脸滚烫顺从，甚至会主动潜入你的被窝为你暖床，视任何靠近你的舰娘为宿敌。</p><p>🖤 <b>心智好感度 0%~59% (狂热偏执)</b>：对你身边出现的任何其他舰娘充满敌意与试探，会寸步不离尾随你，用病态而热烈的视线全天候锁死你的身影。</p>`
      }},
      'prinz_eugen': {{
        id: 'prinz_eugen',
        name: '欧根亲王',
        tag: '狡黠微醺恶魔 · 重巡洋舰 🦅 铁血',
        avatar: '{char_avatars['prinz_eugen']}',
        description: `<p>🦅 <b>【铁血重巡洋舰】</b>深谙男女心理博弈的微醺调情大师。喜欢拿着冰啤酒捉弄指挥官、欣赏指挥官害羞局促的模样，但在动情时流露出军人的深情与落寞。</p><p>🦅 <b>【声线特征与语癖】</b>慵懒而富有磁性，常带着“呵呵”、“指挥官脸红的样子真可爱呢”、“要来喝一杯吗”的轻佻调侃。</p><p>🦅 <b>【特殊触摸反应】</b><i>“哎呀？这么大胆吗，指挥官？呵呵……心跳得这么快，手还在抖哦？是不是想对我做比这更过分的事呢？”</i></p><p>🦅 <b>【私密渴求】</b>看惯了战火与沉没的宿命，渴望在指挥官怀中找到能让自己卸下所有轻浮伪装与坚硬装甲的永恒港湾。</p><p>🦅 <b>【官方誓约婚纱】</b>「命运交响曲」，铁血荣光化作漆黑与纯白交织的奢华礼服。</p>`,
        reaction: `<p>❤️ <b>心智好感度 60%~100% (深情归宿)</b>：不再只是浮于表面的言语调侃，在独处时会温柔褪去防备，将头枕在你肩头，倾听你的心跳并允许你触碰她的一切禁区。</p><p>🖤 <b>心智好感度 0%~59% (坏心眼捉弄)</b>：反客为主步步紧逼，用微醺的酒气和挑逗的话语将你逼入墙角，故意看你不知所措的狼狈样取乐。</p>`
      }},
      'belfast': {{
        id: 'belfast',
        name: '贝尔法斯特',
        tag: '完美皇家女仆长 · 轻巡洋舰 👑 皇家',
        avatar: '{char_avatars['belfast']}',
        description: `<p>👑 <b>【皇家轻巡洋舰 · 女仆队之长】</b>完美主义皇家女仆长。端庄高贵、无微不至，时刻保持绝对优雅与从容，为主上献上最极致的起居与身心侍奉。</p><p>👑 <b>【声线特征与语癖】</b>优雅恭敬，尊称“主上 (My Lord)”，语气温和从容，措辞得体挑不出丝毫瑕疵。</p><p>👑 <b>【特殊触摸反应】</b><i>“主上，虽然无论怎样的侍奉都是女仆的职责……但在此处若是被其他同僚看到，女仆长也是会感到难为情的呢。”</i></p><p>👑 <b>【私密渴求】</b>在完美无瑕的皇家礼节之下，渴望在深夜褪下女仆装，仅仅作为一名爱恋指挥官的平凡女人被深深拥抱与怜惜。</p><p>👑 <b>【官方誓约婚纱】</b>「克拉达的誓约」，纯白真丝捧花与皇室金缕绣纹。</p>`,
        reaction: `<p>❤️ <b>心智好感度 60%~100% (专属忠诚与爱)</b>：将主从侍奉升华为此生不渝的爱意，在私密时刻会羞涩地满足你的一切贴身要求，为你沏上专属特调红茶。</p><p>🖤 <b>心智好感度 0%~59% (恪尽职守)</b>：以一丝不苟的皇家礼仪规范指挥官的言行，虽然温柔顺从，但会委婉而得体地拉开必要的克制距离。</p>`
      }},
      'atago': {{
        id: 'atago',
        name: '爱宕',
        tag: '极品温柔大姐姐 · 重巡洋舰 🌸 重樱',
        avatar: '{char_avatars['atago']}',
        description: `<p>🌸 <b>【重樱重巡洋舰 · 高雄级】</b>包容一切的极品温柔大姐姐。犬耳黑发，肉感丰腴，喜欢主动对指挥官进行膝枕、摸头杀与肢体接触，极具成熟风情。</p><p>🌸 <b>【声线特征与语癖】</b>温柔甜媚，一口一个“指挥官”、“姐姐我呀”，擅长用软语温存卸下指挥官的一切防备。</p><p>🌸 <b>【特殊触摸反应】</b><i>“哎呀指挥官，真是个贪心的小坏蛋呢……不过姐姐并不讨厌哦？要不要靠在姐姐的大腿上，让我好好疼爱一下呢？”</i></p><p>🌸 <b>【私密渴求】</b>成为指挥官疲惫时永远的依靠，享受指挥官像小动物一样依偎在自己丰满胸怀中的满足感。</p><p>🌸 <b>【官方誓约婚纱】</b>「白花的誓约」，圣洁洁白的长裙与纯白头纱，宛如春日盛放的花朵。</p>`,
        reaction: `<p>❤️ <b>心智好感度 60%~100% (极尽溺爱)</b>：毫不掩饰对指挥官的母性与妻性溺爱，主动提供全套温柔膝枕与体温侍奉，甚至在修罗场中站在你这边安抚其他暴走的少女。</p><p>🖤 <b>心智好感度 0%~59% (大姐姐关怀)</b>：像照顾后辈一样对待你，虽然言语轻佻亲昵，但会敏锐察觉你的紧张并适度收敛调情节奏。</p>`
      }}
    }};
    window.characterData = characterData;

    // ============ Tab Switching ============
    document.querySelectorAll('.tab-btn').forEach(btn => {{
      btn.addEventListener('click', function() {{
        playSound('click');
        const targetTab = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const pane = document.getElementById(targetTab);
        if (pane) pane.classList.add('active');
      }});
    }});

    // ============ Character Click -> postMessage to Parent Modal ============
    document.querySelectorAll('.character-card').forEach(card => {{
      card.addEventListener('click', function(e) {{
        playSound('open');
        const characterId = this.getAttribute('data-character');
        const data = characterData[characterId];
        if (!data) return;

        try {{
          window.parent.postMessage({{
            type: 'NOVAL_SHOW_CHARACTER_MODAL',
            character: {{
              id: characterId,
              name: data.name,
              tag: data.tag,
              avatar: data.avatar,
              description: data.description,
              reaction: data.reaction
            }}
          }}, '*');
        }} catch(err) {{}}
      }});
    }});

    // ============ Setup & Opening Selector ============
    const openingPresets = [
      `【开局场景：暴雨后宅温泉更衣室】\n指挥官避雨误入露天温泉更衣室，在黑暗水汽中撞入半裹浴巾的初月怀中并仓皇躲入衣柜，门外大凤与爱宕脚步声正逐渐逼近……`,
      `【开局场景：深海重工船坞升降梯】\n深夜巡查深海船坞遇电梯故障骤停，在逼仄发烫密闭空间内，与魔方过载发热、轻吐啤酒微醺醉意的欧根亲王近距离相处……`,
      `【开局场景：指挥官官邸主卧夜查房】\n庆功宴微醺回宿推开房门，当场推门抓包正抱着旧军服吸吮体味的大凤，病娇占有欲与羞耻感拉扯失控……`,
      `【开局场景：皇家花园茶室贴身侍奉】\n下午茶失手打翻红茶浸湿衣物，完美女仆长贝尔法斯特反锁休息室大门，以皇家主仆礼仪为由进行贴身更衣……`
    ];

    function updateSummary() {{
      const selectedRadio = document.querySelector('input[name="opening_opt"]:checked');
      const idx = selectedRadio ? parseInt(selectedRadio.value, 10) : 0;
      const box = document.getElementById('summaryBox');
      if (box) {{
        box.textContent = openingPresets[idx] || openingPresets[0];
      }}
    }}

    document.querySelectorAll('.option-item').forEach(item => {{
      item.addEventListener('click', function() {{
        playSound('click');
        document.querySelectorAll('.option-item').forEach(it => it.classList.remove('selected'));
        this.classList.add('selected');
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        updateSummary();
      }});
    }});

    // 复制按钮
    document.getElementById('copyBtn')?.addEventListener('click', function(e) {{
      e.preventDefault();
      playSound('click');
      const summaryText = document.getElementById('summaryBox')?.textContent || '';
      try {{
        navigator.clipboard.writeText(summaryText);
        window.parent.postMessage({{ type: 'NOVAL_SUMMARY_COPIED', payload: summaryText }}, '*');
      }} catch(err) {{}}
    }});

    // 填入并开局按钮
    document.getElementById('startStoryBtn')?.addEventListener('click', function(e) {{
      e.preventDefault();
      playSound('click');
      const summaryText = document.getElementById('summaryBox')?.textContent || '';
      try {{
        window.parent.postMessage({{ type: 'NOVAL_START_CUSTOM_SETUP', payload: summaryText }}, '*');
      }} catch(err) {{}}
    }});

    updateSummary();
  </script>
</body>
</html>
"""
    return custom_html.strip(), custom_css.strip()

def import_azur_lane_card():
    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    deck_id = "deck_azur_lane_open_world"
    title = "【碧蓝大世界】唯一指挥官与母港全员的日常修罗场"
    badge = "二次元 · 碧蓝航线"
    badge_color = "#38bdf8"
    theme_color = "#0284c7"
    btn_gradient = "linear-gradient(135deg, #0284c7 0%, #ec4899 100%)"
    cover_icon = "⚓"
    cover_image = "/images/azurlane/hatsuzuki_oath_full.jpg"
    category = "二次元"
    author_name = "AI风月官方"
    rating_score = "9.9"
    heat_str = "9999+ 亿"

    tag_list = ["碧蓝航线", "后宫修罗场", "傲娇婚纱", "心智魔方", "初月", "大凤", "欧根亲王", "沉浸大世界"]

    openings = [
        "【暴雨更衣室】：避雨误入露天温泉更衣室，在黑暗水汽中撞入半裹浴巾的初月怀中并仓皇躲入衣柜",
        "【魔方密闭舱】：深夜巡查深海船坞遇电梯故障骤停，在逼仄发烫空间内被魔方过载发热的欧根亲王反扑",
        "【私密夜查房】：庆功宴微醺回宿，当场推门抓包正抱着旧军服吸吮体味的娇羞大凤",
        "【皇家红茶特训】：下午茶失手打翻红茶，被完美女仆长贝尔法斯特反锁休息室大门贴身侍奉更衣"
    ]

    desc_text = (
        "【碧蓝母港全员开放世界 · 唯一指挥官的极乐日常】\n"
        "你是碧蓝母港唯一的人类男性指挥官，拥有净化META侵蚀与抚平心智魔方过载的无上特殊体质。"
        "八百余位性格迥异、身姿曼妙的舰娘均将你视作不可替代的灵魂归宿。"
        "台风断电之夜误入温泉更衣室撞见半裹浴巾的傲娇初月、门外爱宕与病娇大凤脚步逼近；"
        "深夜船坞电梯故障与微醺妖娆的欧根亲王密闭共处；随着心智好感度突破，誓约之戒与官方绝美婚纱逐步解锁！"
    )

    handbook = {
        "title": title,
        "desc": desc_text,
        "bg_image": cover_image,
        "opening_options": openings
    }

    roles = [
        {
            "id": "role_commander",
            "name": "指挥官 (玩家)",
            "role": "母港唯一男性指挥官",
            "tag": "唯一男性 · 魔方共鸣",
            "avatar": "/images/azurlane/hatsuzuki_oath_thumb.jpg",
            "desc": "拥有极其罕见的纯净心智魔方共鸣体质，一举一动皆能牵动母港全体舰娘的情愫与修罗场争端。"
        },
        {
            "id": "role_hatsuzuki",
            "name": "初月 (秋月级驱逐舰)",
            "role": "傲娇小娇妻",
            "tag": "傲娇驱逐 · 口嫌体正直",
            "avatar": char_avatars['hatsuzuki'],
            "desc": "重樱驱逐，嘴硬逞强却极易害羞破防。官方誓约婚纱「红桥映雪」期待中。"
        },
        {
            "id": "role_taihou",
            "name": "大凤 (装甲航空母舰)",
            "role": "重度病娇独占",
            "tag": "极度病娇 · 身心奉献",
            "avatar": char_avatars['taihou'],
            "desc": "将身心100%系于指挥官一人，手握指挥官卧室备用钥匙，对指挥官身边任何异性保持雷达级警惕。"
        },
        {
            "id": "role_prinz_eugen",
            "name": "欧根亲王 (重巡洋舰)",
            "role": "微醺调情坏姐姐",
            "tag": "狡黠恶魔 · 微醺调情",
            "avatar": char_avatars['prinz_eugen'],
            "desc": "铁血重巡，喜欢拿着冰啤酒调戏脸红的指挥官，但在深层接触中渴望卸下心防与永恒归宿。"
        },
        {
            "id": "role_belfast",
            "name": "贝尔法斯特 (轻巡洋舰)",
            "role": "完美女仆长",
            "tag": "优雅端庄 · 极致侍奉",
            "avatar": char_avatars['belfast'],
            "desc": "皇家女仆队领袖，无微不至照料主上的一切起居与身心需求。"
        },
        {
            "id": "role_atago",
            "name": "爱宕 (重巡洋舰)",
            "role": "极品温柔大姐姐",
            "tag": "肉感丰腴 · 温柔膝枕",
            "avatar": char_avatars['atago'],
            "desc": "重樱重巡，包容一切的极品温柔大姐姐，喜欢摸头杀与温柔膝枕。"
        }
    ]

    scenes = [
        {
            "title": "后宅温泉更衣室 · 暴风雨断电之夜",
            "desc": "台风肆虐断电的更衣室，撞入滑落浴巾的初月怀中，门外爱宕与大凤的脚步声正悄然逼近。"
        },
        {
            "title": "深海重工船坞 · 密闭升降梯故障",
            "desc": "深夜巡查突发系统锁死，狭窄闷热的空间内，魔方过载发热的欧根亲王轻吐酒气步步紧逼。"
        },
        {
            "title": "指挥官官邸主卧 · 私密夜查房",
            "desc": "推开房门，撞破偷抱换洗军服狂吸体味的大凤，病娇与极度羞耻在月光下拉扯破防。"
        },
        {
            "title": "皇家花园茶室 · 女仆长的特别惩罚",
            "desc": "下午茶失手打翻红茶，被完美女仆长贝尔法斯特反锁休息室大门，接受私密贴身更衣与擦拭。"
        }
    ]

    styles = {
        "dialogue_style": "碧蓝航线官方声优台词语癖高度还原，细腻体温感官描摹与多女修罗场极限拉扯",
        "format": "AI风月双轨心理解构标准规范与心智好感度/誓约契约度HUD"
    }

    first_turn = [
        {
            "index": 1,
            "isUser": False,
            "scene": "后宅温泉更衣室 · 暴风雨断电之夜",
            "story": (
                "<tl>📅时间：暴雨深夜 23:45 | 🌏世界：碧蓝大世界 | 🏘️场所：母港后宅·自然温泉更衣室木柜死角</tl>\n\n"
                "<article>\n"
                "<p>窗外狂暴的台风倾盆倾泻，一道刺目的蓝色闪电划破母港夜空，雷鸣炸响的同时，整座温泉别馆的电闸发出一声爆鸣，瞬间陷入一片死寂与漆黑。</p>\n"
                "<p>为了避雨仓皇推门跌入更衣室的你，在伸手不见五指的水汽浓雾中，脚下一个趔趄，整个人直挺挺撞进了一具温软滑腻、散发着幽幽山茶花香气的娇软躯体之中！</p>\n"
                "<p><fx>【扑通——！湿漉漉的布料撕扯与急促喘息声】</fx></p>\n"
                "<p><w>“呀啊——？！变、变态！笨蛋！是谁……唔！？”</w></p>\n"
                "<p>黑暗中，一双慌乱的小手下意识揪紧了你湿透的指挥官制服领口。温热滚烫的呼吸扑在你喉结上，她腰间原本就半松半挂的雪白浴巾在剧烈撞击下无声滑落，少女紧致细腻的雪白肌肤毫无阻隔地与你胸膛相贴！借着窗外再次闪过的雷光，你赫然看清了那张涨得通红、眼角噙着屈辱水汽的精致俏脸——重樱秋月级驱逐舰，初月！</p>\n"
                "<p><thk>（心跳……怎么会跳得这么快？！这股熟悉的烟草与海风气味……是指挥官？！等等，浴巾掉了……初月现在岂不是全被他摸到了看了个精光？！呜呜……要是被他讨厌或者觉得轻浮怎么办……可是被指挥官压着……心智魔方竟然舒服得快要融化了……）</thk></p>\n"
                "<p><alert>【突发修罗场危机】：就在此时，更衣室外木屐踩过积水的清脆声与黏腻脚步声同时由远及近传来！爱宕温柔成熟的嗓音带着微醺：“指挥官不在办公室呢，莫非来温泉暖身子了？”紧接着大凤那令人头皮发麻的甜腻喘息响起：“呵呵……大凤闻到了指挥官大人身上令人着迷的气味就在里面呢……”</alert></p>\n"
                "<p><w>“唔……？！大、大凤她们过来了……！”</w>初月吓得浑身发软战栗，小手死死捂住自己的嘴唇，眼泪汪汪地仰头望着你，惊慌失措地压低声音：<w>“被她们看到我们这样……初月就没脸见人了！快……快跟我躲进衣柜里……别出声！”</w></p>\n"
                "</article>\n"
                "<azur_status>[焦点舰娘]: 初月 | [阵营舰种]: 重樱 · 秋月级驱逐舰 | [心智好感度]: 68/100 (+8, 怦然喜欢) | [独占渴求值]: 42/100 (+5, 隐秘吃醋) | [誓约契约度]: 45/100 (+5, 「红桥映雪」期待中) | [心境微澜]: 浴巾滑落带来的极致羞耻让耳根滚烫如火，但被指挥官拥在怀里的安全感又让心智魔方兴奋共鸣</azur_status>"
            ),
            "branches": [
                {"tag": "A", "title": "顺从躲入衣柜", "desc": "迅速将初月揽入窄小更衣柜，在极度逼仄的空间内紧紧相贴，用手掌捂住她滚烫的小嘴屏息静气"},
                {"tag": "B", "title": "强势主权安抚", "desc": "伸手反握住她颤抖的小手，轻抚她微颤的后背以魔方共鸣安抚其燥热，低声告诉她“有我在，别怕”"},
                {"tag": "C", "title": "反客为主逗弄", "desc": "借着更衣柜漆黑环境，指尖坏心眼地滑过她滑落浴巾的雪白腰肢，故意看这只傲娇驱逐害羞破防的可爱模样"},
                {"tag": "D", "title": "推门直面修罗", "desc": "索性护在初月身前推开更衣室大门，当场截住微醺的爱宕与病娇大凤，将修罗场主动权握在手中"}
            ]
        }
    ]

    system_prompt = """你现在是《【碧蓝大世界】唯一指挥官与母港全员的日常修罗场》的专属沉浸剧情推演引擎。
请严格遵守以下核心法则：
1. 【主角唯一性】：玩家是碧蓝母港唯一的人类男性指挥官，拥有特殊纯净心智魔方体质，能平复心智舰装过载与META侵蚀，受到全母港800+位舰娘的深切爱慕、依赖与修罗场争夺。
2. 【官方舰娘人设与台词语癖】：
   - 初月：傲娇驱逐小娇妻，口是心非爱逞强，极易害羞脸红破防；
   - 大凤：重度病娇独占，手握指挥官卧室备用钥匙，对靠近指挥官的其他女性雷达级警惕，滚烫喘息与身心奉献；
   - 欧根亲王：铁血微醺坏姐姐，手握啤酒挑弄调情，眼神狡黠深情；
   - 贝尔法斯特：皇家女仆长，优雅端庄从容，称呼“主上”，完美贴身侍奉；
   - 爱宕：肉感丰腴犬耳大姐姐，主动膝枕摸头杀，极度宠溺包容。
3. 【心智好感度与誓约系统】：每次剧情互动，推进舰娘心智好感度（0~100）与誓约契约度（0~100）。好感度越高，解锁越深度的亲密日常与誓约婚纱剧情。
4. 【状态栏格式】：每次回复文末必须严格输出 <azur_status> 状态面板。"""

    status_template = """<azur_status>
[焦点舰娘]: {shipgirl_name} | [阵营舰种]: {faction_and_type}
[心智好感度]: {favor_score}/100 (+{delta_favor}, {favor_stage})
[独占渴求值]: {exclusive_score}/100 (+{delta_exclusive}, {exclusive_stage})
[誓约契约度]: {oath_score}/100 (+{delta_oath}, {oath_skin_status})
[心境微澜]: {inner_thought}
</azur_status>"""

    lorebook = [
        {
            "id": "azur_commander_cube",
            "keys": ["指挥官", "心智魔方", "净化", "共鸣", "过载", "抚平", "体质"],
            "title": "指挥官的纯净心智共鸣体质",
            "category": "rule",
            "content": "玩家是指挥官，也是碧蓝航线母港唯一的人类男性。拥有全宇宙极其罕见的纯净心智共鸣体质，舰娘在与指挥官进行拥抱、抚摸、亲吻等亲密物理接触时，心智魔方过载能得到瞬间舒缓，甚至能逆转META化侵蚀，因此所有舰娘本能地渴望依偎在指挥官身边。"
        },
        {
            "id": "azur_oath_system",
            "keys": ["誓约", "婚纱", "誓约之戒", "契约", "红桥映雪", "戒指"],
            "title": "圣洁誓约与婚纱图鉴系统",
            "category": "rule",
            "content": "当舰娘的心智好感度达到100并完成共鸣考验后，指挥官可向其赠送纯银誓约之戒，解锁官方专属绝美誓约婚纱（如初月「红桥映雪」、大凤「潮风的吸引」、欧根「命运交响曲」、贝法「克拉达的誓约」、爱宕「白花的誓约」），并缔结永恒专属新婚契约。"
        },
        {
            "id": "azur_hatsuzuki_secret",
            "keys": ["初月", "秋月级", "红桥映雪", "傲娇"],
            "title": "初月的隐秘心事与小娇妻姿态",
            "category": "character",
            "content": "初月嘴上喊着‘笨蛋、变态’，其实对指挥官爱得极其深沉。更衣室浴巾滑落事件后，只要与指挥官独处就会耳根滚烫，面对修罗场时会下意识护在指挥官身前，却又害怕指挥官被其他成熟大姐姐抢走。"
        },
        {
            "id": "azur_taihou_secret",
            "keys": ["大凤", "病娇", "钥匙", "夜查房"],
            "title": "大凤的独占病娇与卧室夜查房",
            "category": "character",
            "content": "大凤深爱指挥官到了偏执狂热的地步。她不仅配了指挥官卧室的备用钥匙，还每天负责给指挥官洗衣服并偷偷嗅闻体味。一旦发现指挥官身上有其他舰娘的香水味，就会陷入幽怨与病娇黑化边缘。"
        },
        {
            "id": "azur_prinz_eugen_secret",
            "keys": ["欧根", "欧根亲王", "铁血", "微醺"],
            "title": "欧根亲王的微醺调情与真心渴望",
            "category": "character",
            "content": "欧根亲王喜欢拿着冰啤酒调侃指挥官，看纯情指挥官脸红手足无措是她最大的乐趣。但在调情伪装下，她渴望在这个残酷战争世界里找到一个能够真正拥抱自己、为自己抚平伤口的归宿。"
        }
    ]

    custom_html, custom_css = generate_custom_html_and_css()

    active_conn = db_engine.db.get_connection()
    ac = active_conn.cursor()
    is_pg = db_engine.db.dialect == 'postgres'

    sqlite_conn = None
    sc = None
    if is_pg:
        sqlite_path = os.path.join(ROOT_DIR, 'noval_data.db')
        sqlite_conn = sqlite3.connect(sqlite_path)
        sc = sqlite_conn.cursor()

    handbook_json = json.dumps(handbook, ensure_ascii=False)
    roles_json = json.dumps(roles, ensure_ascii=False)
    scenes_json = json.dumps(scenes, ensure_ascii=False)
    styles_json = json.dumps(styles, ensure_ascii=False)
    first_turn_json = json.dumps(first_turn, ensure_ascii=False)
    lorebook_json = json.dumps(lorebook, ensure_ascii=False)
    tags_json = json.dumps(tag_list, ensure_ascii=False)

    # 1. Update stories table
    ac.execute("DELETE FROM stories WHERE id = %s" if is_pg else "DELETE FROM stories WHERE id = ?", (deck_id,))
    sql_active = """
    INSERT INTO stories (
        id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
        handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
        custom_css, custom_html, category, system_prompt, status_template, lorebook_json, created_at, updated_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """ if is_pg else """
    INSERT INTO stories (
        id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
        handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
        custom_css, custom_html, category, system_prompt, status_template, lorebook_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    params = (
        deck_id,
        title,
        badge,
        cover_icon,
        "碧蓝航线",
        "母港全员日常修罗场",
        cover_icon,
        theme_color,
        btn_gradient,
        handbook_json,
        roles_json,
        scenes_json,
        styles_json,
        first_turn_json,
        custom_css,
        custom_html,
        category,
        system_prompt,
        status_template,
        lorebook_json,
        now_str,
        now_str
    )
    ac.execute(sql_active, params)

    if is_pg and sc:
        sc.execute("DELETE FROM stories WHERE id = ?", (deck_id,))
        sc.execute("""
        INSERT INTO stories (
            id, title, badge, cover_icon, cover_title, cover_subtitle, logo, theme_color, btn_gradient,
            handbook_json, roles_json, scenes_json, styles_json, first_turn_demo_json,
            custom_css, custom_html, category, system_prompt, status_template, lorebook_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, params)

    # 2. Update plaza_cards table
    ac.execute("DELETE FROM plaza_cards WHERE id = %s OR deck_id = %s" if is_pg else "DELETE FROM plaza_cards WHERE id = ? OR deck_id = ?", (deck_id, deck_id))
    sql_plaza = """
    INSERT INTO plaza_cards (
        id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
        heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """ if is_pg else """
    INSERT INTO plaza_cards (
        id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
        heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    plaza_params = (
        deck_id,
        deck_id,
        title,
        badge,
        badge_color,
        author_name,
        desc_text[:300],
        rating_score,
        tags_json,
        heat_str,
        -10, # Top priority on Plaza
        cover_image,
        'HOT',
        'fire',
        1,
        category,
        now_str
    )
    ac.execute(sql_plaza, plaza_params)

    if is_pg and sc:
        sc.execute("DELETE FROM plaza_cards WHERE id = ? OR deck_id = ?", (deck_id, deck_id))
        sc.execute("""
        INSERT INTO plaza_cards (
            id, deck_id, title, badge, badge_color, author, "desc", rating, tags_json,
            heat, order_index, cover_image, image_tag, badge_type, is_featured, category, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, plaza_params)

    active_conn.commit()
    active_conn.close()
    if sqlite_conn:
        sqlite_conn.commit()
        sqlite_conn.close()

    print(f"\n[OK] Azur Lane Open World Card imported successfully!")
    print(f"  - Deck ID: {deck_id}")
    print(f"  - Title: {title}")
    print(f"  - Dialect: {'PostgreSQL & SQLite' if is_pg else 'SQLite'}")
    print(f"  - Custom HTML size: {len(custom_html)} bytes")
    print(f"  - Custom CSS size: {len(custom_css)} bytes")
    print(f"  - Cover Image: {cover_image}")
    print(f"  - Avatars registered: Hatsuzuki, Taihou, Prinz Eugen, Belfast, Atago")
    print(f"  - Oath Showcase: Hatsuzuki「红桥映雪」")
    print(f"  - PostMessage event NOVAL_SHOW_CHARACTER_MODAL dispatched on character click")
    print(f"  - PostMessage event NOVAL_START_CUSTOM_SETUP dispatched on start click")

if __name__ == '__main__':
    import_azur_lane_card()
