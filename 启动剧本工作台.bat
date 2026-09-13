@echo off
chcp 65001 >nul
cd /d "%~dp0"
set NOVAL_PORT=5174
echo 剧本工作台：http://127.0.0.1:5174/studio/
echo 保持此窗口打开。退出请按 Ctrl+C。
start "" http://127.0.0.1:5174/studio/
python server.py
pause
