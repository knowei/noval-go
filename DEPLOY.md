# 🚀 Noval-Go Docker 生产服务器部署指南

本项目已完成容器化适配，采用 **Next.js Standalone + Python SQLite 后端一体化轻量容器** 架构。

根据您服务器当前的运行状态：
- `8080` 端口已被 `koko-companion` 占用
- `8000` 端口已被 `sillytavern` 占用
- `5432` 端口已被 `postgres` 占用

因此，本项目默认推荐使用 **`3000` 端口**（或 `3001` / `8888`，可在配置中自由更改）。

---

## 📋 快速部署步骤 (Ubuntu 服务器)

### 1. 登录服务器并拉取代码
登录您的 Ubuntu 服务器（即截图中的 `VM-0-16-ubuntu`）：

```bash
# 进入部署目录 (例如 ~/workspace 或 /opt)
cd ~

# 克隆仓库
git clone https://github.com/knowei/noval-go.git

# 进入项目目录
cd noval-go

# 切换至最新的重构分支
git checkout refactor/nextjs-rewrite
```

> 💡 **提示**：如果后续合并到了 `main` 分支，直接留在 `main` 即可。

---

### 2. 检查或修改端口配置（可选）
项目根目录下已自带 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  noval-go:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: noval-go
    restart: unless-stopped
    ports:
      - "3000:3000"   # 主机端口:容器端口。如需改为 3001，写成 "3001:3000" 即可
    volumes:
      - ./data:/app/data
    environment:
      - PORT=3000
      - NOVAL_PORT=5173
      - NOVAL_DB_PATH=/app/data/noval_data.db
      - BACKEND_URL=http://127.0.0.1:5173
      - NODE_ENV=production
```

- 若需更改对外端口，直接编辑 `docker-compose.yml` 中的 `"3000:3000"`（例如改为 `"3001:3000"`）。

---

### 3. 一键构建并启动容器

在项目根目录下执行以下命令：

```bash
# 构建镜像并在后台启动
docker compose up -d --build
```

*(如果您的 Docker 较早，也可以使用 `docker-compose up -d --build`)*

---

### 4. 验证运行状态与日志

```bash
# 1. 查看容器是否正常运行
docker ps | grep noval-go

# 2. 查看容器实时运行日志
docker logs -f noval-go
```

看到类似以下输出即表示后端与前端均启动成功：
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

### 5. 访问系统

在浏览器中打开：
```text
http://<您的服务器公网IP>:3000
```
> ⚠️ **云服务器防火墙安全组提醒**：
> 请确保腾讯云/阿里云控制台中的 **安全组规则** 已放行对应端口（如 TCP `3000`）。

---

## 💾 数据持久化与安全

- 容器会自动将数据库保存在宿主机的 `./data/noval_data.db`。
- 初次启动时，系统会自动将项目预设的场景卡、开局设定与历史模板初始化到该数据库中。
- 即使未来执行 `docker compose down` 升级容器或重启服务器，**所有历史对话、自制角色卡、存档均完整保存在 `./data` 目录中，永不丢失**。

备份方法：
```bash
# 备份数据只需要复制 data 文件夹
cp -r ./data ./data_backup_$(date +%Y%m%d)
```

---

## 🔄 后续版本更新升级步骤

当本地代码有新功能推送到 GitHub 后，在服务器上执行以下命令即可平滑升级：

```bash
cd ~/noval-go

# 1. 拉取最新代码
git pull

# 2. 重新构建并平滑重启容器
docker compose up -d --build
```

---

## 🌐 进阶：配置 Nginx 反向代理与 SSL 域名（可选）

如果您需要绑定域名并开启 HTTPS：

```nginx
server {
    listen 80;
    server_name noval.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 开启 SSE 流式打字传输缓冲关闭
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}
```
配置完成后重载 Nginx：`sudo nginx -s reload`。
