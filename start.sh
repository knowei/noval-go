#!/bin/sh
set -e

echo "=========================================="
echo "   🚀 Starting Noval-Go Production Server"
echo "=========================================="

mkdir -p /app/data

# 启动 Python 核心后端服务 (PostgreSQL / Database Engine)
echo "[1/2] Starting Python API backend on port ${NOVAL_PORT:-5173}..."
cd /app/backend
python3 scripts/auto_seed.py || true
python3 server.py &
BACKEND_PID=$!

# 等待后端准备就绪
sleep 1

# 启动 Next.js 前端应用
echo "[2/2] Starting Next.js frontend on port ${PORT:-3000}..."
cd /app/frontend
exec node server.js
