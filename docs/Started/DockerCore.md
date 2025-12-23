# 使用 Docker 运行 Core<Badge type="danger" text="稍难" />

::: warning

下面提供了*两种方式*进行 Docker 部署, **二选一**即可！

如果你对两种方式的区别不了解，请使用**选择 1**

:::

## 镜像特性

1. 轻量高效：原始镜像使用 `astral/uv:python3.12-bookworm-slim`，该镜像支持 `linux/amd64`, `linux/arm64`。
2. 环境完备：镜像使用 uv 构建 `虚拟环境` 默认已包含：`pip`, `setuptools`, `wheel` 等工具以及 `Playwright & Chromium 浏览器`环境，开箱即用。
3. 灵活配置：支持网络代理配置、python 包镜像源替换 等，可参考 [环境设置](https://github.com/Genshin-bots/gsuid_core/blob/master/.env.example) 进行设置。

## 选择 1、使用 Docker 镜像部署

`请先安装好 Docker`

---

可通过如下指令拉取镜像并运行：

```shell
docker run -d \
  --name gsuid_core \
  --restart always \
  -p 8765:8765 \
  -v /opt/gscore_data:/gsuid_core/data \
  -v /opt/gscore_plugins:/gsuid_core/gsuid_core/plugins \
  -v gsuid_core_venv:/venv \
  docker.cnb.cool/gscore-mirror/gsuid_core:latest
```

在本地按照以上指令容器运行后，可直接进入`localhost:8765/genshinuid`进入核心的后台管理界面
相关文档见：

**镜像参数说明：**

| **参数**                                                | **功能**                                                                                     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `-d`                                                    | 后台运行：容器在后台持续执行。                                                               |
| `--name gsuid_core`                                     | 容器命名：方便后续通过名字进行停止或重启。                                                   |
| `-p 8765:8765`                                          | 端口映射：`宿主机端口:容器端口`，映射后方可访问后台。                                        |
| `-v /opt/gscore_data:/gsuid_core/data`                  | 数据持久化：重要!!! 存放玩家账号、数据库等核心资产，容器重建后数据不丢失。                   |
| `-v /opt/gscore_plugins:/gsuid_core/gsuid_core/plugins` | 插件持久化：可在宿主机直接管理插件文件。                                                     |
| `-v gsuid_core_venv:/venv`                              | python 虚拟环境：使用命名卷来持久化存储容器内的 Python 虚拟环境。                            |
| `--add-host host.docker.internal:host-gateway`          | 映射宿主机 IP：这能让容器内部通过 host.docker.internal 这个域名直接访问宿主机的网络          |
| `-e UV_INDEX=`                                          | Python 镜像源: 如 `https://pypi.org/simple/`                                                 |
| `-e UV_NO_CONFIG=0`                                     | UV 配置读取开关：设为 1 可忽略自带配置，强制使用环境变量中的`UV_INDEX`镜像源。               |
| `-e http_proxy=`                                        | HTTP 代理：如 http://host.docker.internal:7890（需开启代理软件 LAN 共享）。                  |
| `-e https_proxy=`                                       | HTTPS 代理：同上。（git 代理需要单独设置，在`高级操作指南`下面有介绍）                       |
| `-e no_proxy=`                                          | 代理白名单：指定哪些地址不走代理。通常包含 localhost,127.0.0.1,cnb.cool 以及国内镜像源地址。 |

> 部分参数没有完全列出，有需要可参考[环境设置](https://github.com/Genshin-bots/gsuid_core/blob/master/.env.example) 、 [docker-compose](https://github.com/Genshin-bots/gsuid_core/blob/master/docker-compose.bundle.yml)进行设置。

## 选择 2、使用 Docker compose 从代码构建 docker 容器

**特点**：挂载本地代码到容器，无需等待镜像更新，直接使用 git:`手动拉取` or 命令: `core全部更新`, 即可同步更新。

1. **拉取代码**

```shell
# 方法一：从 GitHub 拉取
git clone https://github.com/Genshin-bots/gsuid_core.git

# 方法二：从 cnb.cool 拉取（国内镜像更快）
git clone https://cnb.cool/gscore-mirror/gsuid_core.git

cd gsuid_core
```

2. 创建配置文件（可选）

```shell
cp .env.example .env
```

> 💡 如需自定义配置，请编辑 .env 文件并取消注释相应配置

3. **启动服务**

```shell
docker-compose up -d --build
```

4. **管理**
   - 服务运行在端口 `8765`。
   - 启动后可通过 `localhost:8765/genshinuid` 进入核心的后台管理界面

---

## 高级操作指南

### 1. 网络代理配置

_(注意：请确保代理软件开启了 "允许局域网连接/LAN" 模式)_

**容器内的全局代理（不包括 Git 代理）**
docker-compose 模式可在 `.env` 中添加：

```yaml
GSCORE_HTTP_PROXY=http://host.docker.internal:7890
GSCORE_HTTPS_PROXY=http://host.docker.internal:7890
```

docker run 模式可增加 -e 参数

```
-e http_proxy=http://host.docker.internal:7890
-e https_proxy=http://host.docker.internal:7890
```

**容器内设置 Git 代理**

```shell
docker exec -it gsuid_core git config --global http.proxy http://host.docker.internal:7890
```

### 2. 安装额外的 Python 包

如果你安装了第三方插件需要额外依赖：

```shell
docker exec -it gsuid_core uv pip install <包名>
```

### 3. python 环境重置 (解决依赖冲突)

如果更新镜像后报错，请执行以下命令**彻底清理**旧环境：

```shell
# docker-compose 模式
docker-compose down -v
docker-compose up -d --build

# docker run 模式
docker stop gsuid_core && docker rm gsuid_core
docker volume rm gsuid_core_venv
# 然后重新执行前面的 docker run 命令
```

_(警告：这将删除 `venv-data` pypi 环境卷，所有手动安装的包需要重新安装，但 `data` 游戏数据不会丢失)_
