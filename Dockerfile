# ========================================================
# 阶段 1: 前端构建 (Next.js Standalone Build)
# ========================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# 使用国内高带宽镜像源加速 apk 与 npm
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    npm config set registry https://registry.npmmirror.com

# 安装依赖
COPY web/package.json web/package-lock.json* ./
RUN npm ci

# 编译生成 Next.js standalone 生产产物
COPY web/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ========================================================
# 阶段 2: 运行时镜像 (轻量 Alpine + Node.js + Python3)
# ========================================================
FROM node:20-alpine AS runner
WORKDIR /app

# 使用国内高带宽镜像源加速安装 Python3 与 pip
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache python3 py3-pip bash

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NOVAL_PORT=5173
ENV DATABASE_URL=postgresql://noval_user:noval_secret_2026@postgres:5432/noval_db
ENV BACKEND_URL=http://127.0.0.1:5173

# 1. 部署后端 Python 源码及资产库
WORKDIR /app/backend
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple --break-system-packages || true
COPY server.py db_engine.py studio_api.py stories_data.js dump_pc.json init_postgres.sql schema.sql ./
COPY scripts/ ./scripts/
COPY studio/ ./studio/

# 2. 部署前端 Next.js Standalone 生产产物
WORKDIR /app/frontend
COPY --from=frontend-builder /build/.next/standalone ./
COPY --from=frontend-builder /build/.next/static ./.next/static
COPY --from=frontend-builder /build/public ./public

# 3. 部署启动入口脚本
WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 暴露前端访问端口
EXPOSE 3000

# 挂载数据卷
VOLUME ["/app/data"]

CMD ["/app/start.sh"]
