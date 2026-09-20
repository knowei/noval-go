import os
import sys
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db_engine

DARK_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}

:root{
  --pink:#f43f5e;
  --pink-soft:rgba(244,63,94,0.22);
  --purple:#a855f7;
  --purple-soft:rgba(168,85,247,0.22);
  --gold:#fbbf24;
  --ink:#f8fafc;
  --ink-soft:#94a3b8;
  --card:rgba(18, 17, 28, 0.88);
  --card-solid:#131220;
  --line:rgba(244,63,94,0.2);
  --shadow:0 12px 42px rgba(0,0,0,0.75);
  --shadow-sm:0 4px 18px rgba(0,0,0,0.55);
}

html,body{height:100%;}

body{
  font-family:'Noto Serif SC',serif;
  color:var(--ink);
  font-size:15px;
  line-height:1.85;
  background:
    radial-gradient(circle at 15% 10%, rgba(244,63,94,0.18), transparent 45%),
    radial-gradient(circle at 85% 15%, rgba(168,85,247,0.16), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(244,63,94,0.14), transparent 55%),
    linear-gradient(165deg, #09090f 0%, #12101b 45%, #181326 75%, #0b0a12 100%);
  background-attachment:fixed;
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}

/* ====== 顶层容器 ====== */
.app{
  max-width:740px;
  margin:0 auto;
  padding:24px 16px 80px;
}

/* ====== 封面头图 ====== */
.hero{
  position:relative;
  border-radius:26px;
  overflow:hidden;
  padding:42px 24px 34px;
  text-align:center;
  background:
    radial-gradient(circle at 80% 25%, rgba(255,220,235,0.15), transparent 50%),
    linear-gradient(135deg, rgba(38,12,32,0.95) 0%, rgba(26,16,46,0.95) 55%, rgba(16,13,32,0.98) 100%);
  border:1px solid rgba(244,63,94,0.35);
  box-shadow:0 14px 44px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12);
  color:#fff;
}
.hero::before{
  content:"";
  position:absolute;inset:0;
  background-image:
    radial-gradient(circle at 20% 30%,rgba(255,255,255,.25) 1.2px,transparent 1.5px),
    radial-gradient(circle at 60% 70%,rgba(244,63,94,.3) 1.2px,transparent 1.5px),
    radial-gradient(circle at 85% 25%,rgba(168,85,247,.3) 1.2px,transparent 1.5px),
    radial-gradient(circle at 40% 85%,rgba(255,255,255,.15) 1.2px,transparent 1.5px);
  background-size:180px 180px,220px 220px,200px 200px,260px 260px;
  opacity:.7;
  pointer-events:none;
}
.hero .moon{
  position:absolute;
  top:20px;right:24px;
  width:48px;height:48px;
  border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #fffdfa, #fce7f3 40%, #e879f9 85%);
  box-shadow:0 0 28px rgba(244,63,94,0.55), 0 0 10px rgba(255,255,255,0.8);
  opacity:.95;
}

.hero h1{
  position:relative;
  font-family:'Noto Serif SC',serif;
  font-weight:700;
  font-size:28px;
  letter-spacing:2px;
  background:linear-gradient(135deg, #ffffff 0%, #ffe4e6 50%, #f43f5e 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  text-shadow:0 4px 20px rgba(244,63,94,0.4);
  margin-bottom:8px;
}
.hero .sub{
  position:relative;
  font-size:12px;
  letter-spacing:4px;
  color:#fda4af;
  margin-bottom:16px;
  text-shadow:0 2px 10px rgba(0,0,0,0.5);
}
.hero .tagline{
  position:relative;
  display:inline-block;
  padding:6px 20px;
  border-radius:999px;
  font-size:12.5px;
  letter-spacing:1.5px;
  background:rgba(244,63,94,0.16);
  border:1px solid rgba(244,63,94,0.38);
  color:#fecdd3;
  backdrop-filter:blur(6px);
  box-shadow:0 4px 16px rgba(0,0,0,0.4);
}

/* ====== 通用卡片 ====== */
.card{
  background:var(--card);
  border:1px solid rgba(255,255,255,0.08);
  border-top:1px solid rgba(244,63,94,0.3);
  border-radius:20px;
  padding:22px 20px;
  margin-top:20px;
  backdrop-filter:blur(14px);
  box-shadow:var(--shadow);
  animation:rise .5s ease both;
}
@keyframes rise{
  from{opacity:0;transform:translateY(14px);}
  to{opacity:1;transform:translateY(0);}
}

.sec-title{
  display:flex;
  align-items:center;
  gap:10px;
  font-size:17px;
  font-weight:700;
  color:#f8fafc;
  margin-bottom:16px;
  letter-spacing:0.5px;
}
.sec-title .icon{
  display:inline-flex;
  align-items:center;justify-content:center;
  width:32px;height:32px;
  border-radius:10px;
  font-size:15px;
  background:linear-gradient(135deg,#f43f5e,#a855f7);
  color:#fff;
  box-shadow:0 4px 14px rgba(244,63,94,0.45);
  flex:none;
}
.sec-title::after{
  content:"";
  flex:1;
  height:1px;
  background:linear-gradient(90deg,var(--line),transparent);
}

/* ====== 背景故事 ====== */
.story p{
  font-size:14.5px;
  color:#cbd5e1;
  text-indent:2em;
  margin-bottom:12px;
  text-align:justify;
  line-height:1.9;
}
.story p:last-child{margin-bottom:0;}
.story .hl{
  color:#fb7185;
  font-weight:600;
  background:rgba(244,63,94,0.18);
  padding:2px 6px;
  border-radius:6px;
  border:1px solid rgba(244,63,94,0.25);
}

/* ====== 人物介绍 ====== */
.char-head{
  display:flex;
  gap:16px;
  align-items:center;
  margin-bottom:18px;
}
.avatar{
  width:64px;height:64px;
  border-radius:18px;
  flex:none;
  display:flex;align-items:center;justify-content:center;
  font-family:'Noto Serif SC',serif;
  font-size:26px;
  font-weight:700;
  color:#fff;
  background:linear-gradient(140deg,#f43f5e,#7c3aed);
  box-shadow:0 6px 22px rgba(244,63,94,0.45);
  position:relative;
  border:1px solid rgba(255,255,255,0.2);
}
.avatar::after{
  content:"✦";
  position:absolute;bottom:-6px;right:-6px;
  width:22px;height:22px;
  border-radius:50%;
  background:#1a1324;
  color:#f43f5e;
  border:1px solid rgba(244,63,94,0.5);
  font-size:11px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 3px 10px rgba(0,0,0,0.6);
}
.char-name{font-size:20px;font-weight:700;color:#f8fafc;}
.char-name small{
  font-size:11.5px;
  font-weight:400;
  color:#94a3b8;
  margin-left:10px;
  letter-spacing:1px;
}
.char-tags{
  display:flex;flex-wrap:wrap;gap:8px;
  margin-top:8px;
}
.tag{
  font-size:11.5px;
  padding:3px 12px;
  border-radius:999px;
  color:#c084fc;
  background:rgba(168,85,247,0.15);
  border:1px solid rgba(168,85,247,0.3);
}
.tag.pink{
  color:#fb7185;
  background:rgba(244,63,94,0.15);
  border-color:rgba(244,63,94,0.35);
}

.profile-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-top:8px;
}
.profile-item{
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07);
  border-radius:14px;
  padding:12px 14px;
}
.profile-item .k{
  font-size:11px;
  color:#94a3b8;
  letter-spacing:1px;
  margin-bottom:3px;
  display:block;
}
.profile-item .v{
  font-size:13.5px;
  color:#f1f5f9;
  font-weight:600;
  line-height:1.6;
}
.profile-item.wide{grid-column:1 / -1;}

.desc-block{
  margin-top:16px;
  padding:14px 16px;
  border-radius:14px;
  background:linear-gradient(135deg,rgba(244,63,94,0.12),rgba(168,85,247,0.1));
  border:1px solid rgba(244,63,94,0.25);
  font-size:13.5px;
  color:#e2e8f0;
  text-align:justify;
  line-height:1.9;
}
.desc-block b{color:#fb7185;}

/* ====== 玩法 ====== */
.rules{display:flex;flex-direction:column;gap:11px;}
.rule{
  display:flex;gap:12px;
  padding:13px 15px;
  border-radius:14px;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07);
}
.rule .num{
  flex:none;
  width:26px;height:26px;
  border-radius:9px;
  font-size:12.5px;
  font-weight:700;
  color:#fff;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#f43f5e,#a855f7);
  box-shadow:0 3px 10px rgba(244,63,94,0.35);
}
.rule .txt{font-size:13.5px;color:#cbd5e1;line-height:1.8;}
.rule .txt b{color:#c084fc;}

/* ====== 开场白 ====== */
.opening-list{
  display:flex;flex-direction:column;gap:12px;
}
.opening{
  position:relative;
  padding:15px 16px 15px 48px;
  border-radius:16px;
  cursor:pointer;
  font-size:13.5px;
  line-height:1.85;
  color:#cbd5e1;
  background:rgba(255,255,255,0.03);
  border:1.5px solid rgba(255,255,255,0.08);
  transition:.25s ease;
  user-select:none;
  text-align:justify;
}
.opening:hover{
  background:rgba(244,63,94,0.08);
  border-color:rgba(244,63,94,0.35);
  transform:translateY(-2px);
  color:#f8fafc;
}
.opening.sel{
  background:linear-gradient(135deg,rgba(244,63,94,0.2),rgba(168,85,247,0.15));
  border-color:#f43f5e;
  box-shadow:0 0 24px rgba(244,63,94,0.35);
  color:#fff;
}
.opening .idx{
  position:absolute;
  left:14px;top:15px;
  width:24px;height:24px;
  border-radius:8px;
  font-size:12px;
  font-weight:700;
  color:#fb7185;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(244,63,94,0.3);
  transition:.25s ease;
}
.opening.sel .idx{
  background:#f43f5e;
  color:#fff;
  border-color:#f43f5e;
  box-shadow:0 0 10px rgba(244,63,94,0.6);
}

/* ====== 表单控件 ====== */
.form-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}
.form-item{
  display:flex;flex-direction:column;gap:6px;
}
.form-item.wide{grid-column:1 / -1;}
.form-item label{
  font-size:12px;
  font-weight:600;
  color:#94a3b8;
  letter-spacing:0.5px;
}
.form-item input,
.form-item textarea{
  background:rgba(255,255,255,0.04) !important;
  border:1px solid rgba(255,255,255,0.12) !important;
  border-radius:12px !important;
  padding:10px 14px !important;
  color:#f8fafc !important;
  font-size:13.5px !important;
  font-family:inherit !important;
  outline:none !important;
  transition:border-color .2s, box-shadow .2s;
}
.form-item input:focus,
.form-item textarea:focus{
  border-color:#f43f5e !important;
  box-shadow:0 0 14px rgba(244,63,94,0.35) !important;
  background:rgba(244,63,94,0.05) !important;
}
.custom-opening textarea{
  width:100%;
  min-height:90px;
  margin-top:12px;
}

/* ====== 总结与行动按钮 ====== */
.gen-wrap{
  margin-top:18px;
  text-align:center;
}
.gen-btn, .copy-btn{
  width:100%;
  padding:14px 20px;
  border-radius:14px;
  border:none;
  font-size:15px;
  font-weight:700;
  color:#fff;
  background:linear-gradient(135deg,#f43f5e,#a855f7);
  box-shadow:0 10px 30px rgba(244,63,94,0.45);
  cursor:pointer;
  transition:transform .2s, box-shadow .2s;
  letter-spacing:1px;
}
.gen-btn:hover, .copy-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 14px 38px rgba(244,63,94,0.65);
}
.gen-btn:active, .copy-btn:active{
  transform:translateY(0);
}

.summary-card{
  margin-top:20px;
}
.summary-box{
  background:#09090e;
  border:1px solid rgba(244,63,94,0.3);
  border-radius:14px;
  padding:16px;
  font-size:13px;
  line-height:1.8;
  color:#e2e8f0;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  white-space:pre-wrap;
  word-break:break-word;
  max-height:280px;
  overflow-y:auto;
}
.copy-wrap{
  margin-top:14px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.sum-empty{
  color:#94a3b8;
  font-style:italic;
  text-align:center;
  padding:20px;
}
"""

def update_story():
    with open('scripts/white_tiger_original.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Replace <style>...</style> with DARK_CSS
    new_html = re.sub(r'<style>.*?</style>', f'<style>{DARK_CSS}</style>', html, flags=re.DOTALL)

    conn = db_engine.db.get_connection()
    c = conn.cursor()
    target_ids = ['deck_white_tiger_sister_night', 'e2cb7a3e-dbaa-40a7-831c-2961508083b0']
    for tid in target_ids:
        c.execute("UPDATE stories SET custom_html = %s WHERE id = %s", (new_html, tid))
        print(f"Updated custom_html for {tid}")

    # Also update init_postgres.sql so that next seed dump has the updated styling
    conn.commit()
    conn.close()
    print("Database updated successfully!")

if __name__ == '__main__':
    update_story()
