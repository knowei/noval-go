# 🚀 Noval-Go 生产部署指南 (Next.js + PostgreSQL)

本项目已全面升级至 **PostgreSQL (Pagesql)** 数据库架构，并提供 **一键 Docker Compose 生产化部署**。

---

## 🌟 架构亮点
1. **全容器化部署**：包含 `noval-go`（Next.js 16 前端 + Python API 核心）与 `noval-postgres`（PostgreSQL 16 Alpine 独立数据库容器）。
2. **零端口冲突**：PostgreSQL 容器仅在 Docker 内部网络（`postgres:5432`）通信，**不占用宿主机 5432 端口**（即使宿主机已安装 PostgreSQL 也绝不冲突）。
3. **开箱即用自动导入**：挂载 `init_postgres.sql`，首次启动自动完成建表并灌入全部 60 部剧本与 38 张广场大作，无需手动迁移。
4. **数据持久化**：数据库全部数据持久化保存在宿主机根目录 `./pgdata`，容器升级、重建数据永不丢失。
5. **多账号安全隔离**：完整独立用户鉴权（Argon2/SHA256 密码哈希、独立 Token、会话私有存储），杜绝多用户串号。

---

## 📋 快速部署步骤 (Ubuntu / Debian / CentOS / Linux)

### 1. 登录服务器并拉取代码
```bash
# 进入部署目录 (例如 ~ 或 /opt)
cd ~

# 克隆仓库 (如果尚未克隆)
git clone https://github.com/knowei/noval-go.git
cd noval-go

# 如果已有仓库，直接拉取最新代码
git pull origin refactor/nextjs-rewrite
```

---

### 2. 一键启动全套服务 (Web + PostgreSQL)
在项目根目录下直接执行：

```bash
docker compose up -d --build
```
*(如果使用的是旧版 docker-compose，执行 `docker-compose up -d --build`)*

Docker Compose 会自动：
1. 启动 `noval-postgres` 数据库容器，并通过健康检查检测就绪。
2. 自动运行 `init_postgres.sql` 初始化数据库表与所有官方剧本和卡片。
3. 构建并启动 `noval-go` 应用容器，自动连接到内部 PostgreSQL。

---

### 3. 查看运行状态与日志

```bash
# 查看所有运行容器
docker compose ps

# 查看主应用日志
docker compose logs -f noval-go

# 查看数据库日志
docker compose logs -f postgres
```

看到类似以下输出即代表一切正常：
```text
==========================================
   🚀 Starting Noval-Go Production Server
==========================================
[1/2] Starting Python API backend on port 5173...
[2/2] Starting Next.js frontend on port 3000...
   ▲ Next.js 16.3.5
   - Local:        http://0.0.0.0:3000
   - Network:      http://0.0.0.0:3000
 ✓ Ready in 450ms
```

---

### 4. 访问系统
在浏览器中打开：
```text
http://<您的服务器公网IP>:3000
```

> ⚠️ **云服务器安全组提醒**：
> 请确保腾讯云 / 阿里云 / 华为云等控制台的 **安全组规则** 已放行 **TCP 3000** 端口。

---

## ⚙️ 进阶配置说明

### 1. 自定义端口
若需将访问端口改为 3001 或其他端口，编辑 `docker-compose.yml` 中的端口映射：
```yaml
    ports:
      - "3001:3000"   # 主机端口:容器端口
```

### 2. 连接外部/云端数据库 (如 Supabase / 宿主机现有 PG)
默认已自带内嵌 PostgreSQL 容器。如果您希望直连云端 Supabase 或宿主机现有的 PostgreSQL，只需修改 `docker-compose.yml` 中 `noval-go` 的 `DATABASE_URL`：
```yaml
    environment:
      # 云端 Supabase 示例:
      - DATABASE_URL=postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
      # 或宿主机现有 PG (宿主机 IP 通常为 172.17.0.1):
      # - DATABASE_URL=postgresql://username:password@172.17.0.1:5432/noval_db
```

---

## 🔄 日常升级维护

当代码更新后，只需在服务器执行：
```bash
cd ~/noval-go
git pull
docker compose up -d --build
```
持久化数据保留在 `./pgdata`，代码更新平滑热生效。
