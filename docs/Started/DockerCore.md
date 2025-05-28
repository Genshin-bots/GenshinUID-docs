# 使用 Docker 运行 Core<Badge type="danger" text="稍难" />

::: warning

下面提供了*两种方式*进行Docker部署, **二选一**即可！

如果你对两种方式的区别不了解，请使用**选择1**

:::

## 选择1、使用Docker镜像部署

> 此镜像使用下文的 Github Actions 自动构建，每 12 小时更新

`请先安装好 Docker`


- 镜像地址（docker hub）：https://hub.docker.com/r/lilixxs666/gsuid-core

  docker hub 网站需要注册账号，并至少选择 Free Plan 才能访问

- 镜像名称：`lilixxs666/gsuid-core:dev`

- 免费用户有 1 小时 10 次拉取的限制😂

---

可通过如下指令拉取镜像并运行：
```bash
docker run -d \
--name gsuidcore \
-e TZ=Asia/Shanghai \
-e GSCORE_HOST=0.0.0.0 \
-p 18765:8765 \
-v /opt/gscore_data:/gsuid_core/data \
-v /opt/gscore_plugins:/gsuid_core/gsuid_core/plugins \
lilixxs666/gsuid-core:dev
```
在本地按照以上指令容器运行后，可直接进入`localhost:18965/genshinuid`进入核心的后台管理界面
相关文档见：

**镜像参数说明：**

| **参数**  | **功能**  |
|--------------------------------------|----------------------------------------------------------|
| `-d`                                                    | 服务后台运行                                                   |
| `--name gsuidcore`                                      | 生成的容器名称，可选，这里指定为 gsuidcore，若不写则系统给随机名称         |
| `-p 18765:8765`                                         | 端口映射，可选，默认不做映射，只有映射的端口才能被外部访问<br/>这里设置为容器内 8765 端口 → 外部 18765 端口                       |
| `-e TZ=Asia/Shanghai`                                   | 时区，可选，默认值=Asia/Shanghai                                  |
| `-e GSCORE_HOST=0.0.0.0`                                | 服务监听地址：可选，默认值=localhost                                  |
| `-v /opt/gscore_data:/gsuid_core/data `                 | 文件映射，可选，只有映射的路径内的文件才能直接从外部读写：原软件的 data 文件夹<br/>可从外部的  /opt/gscore_data 位置访问      |
| `-v /opt/gscore_plugins:/gsuid_core/gsuid_core/plugins` | 文件映射，可选，只有映射的路径内的文件才能直接从外部读写：原软件的 plugins 文件夹<br/>可从外部的 /opt/gscore_plugins 位置访问 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; |

**一些容器部署的常见问题**
详见下文【5. 容器部署的相关使用说明】


**镜像构建整体流程：**

- 主分支同步（Github Actions 每 12 小时执行一次）：项目主分支（gsuid-core:master） --> fork 的分支 (gsuid-core-prci:master)

- 镜像构建（Github Actions 每 12 小时执行一次）：fork 的分支 (gsuid-core-prci:master) --> 编译 --> 发布到 dockerhub


**用于实现以上构建流程的 fork 库地址：**

- 同步分支（master）：https://github.com/lilixxs/gsuid_core-prci/tree/master

- Github Action 构建分支（docker-autobuild）：https://github.com/lilixxs/gsuid_core-prci/tree/docker-autobuild


**Github Action 配置文件：**

- master 分支自动同步：./github/workflows/master-autosync.yaml
- docker 镜像自动构建：./github/workflows/docker-autobuild.yaml


## 选择2、使用 Docker compose 从代码构建 docker 容器

### 下载/克隆仓库

- 首先在你喜欢的地方创建一个目录作为工作目录，并 cd 进入。

- 使用命令克隆仓库到 `./app`：

  ```sh
  git clone https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch ./app
  ```

### 准备工作

- 创建必要文件夹：

  ```sh
  mkdir -p ./cache ./data ./plugins
  ```

- 创建启动脚本 `./start`，内容如下：

  ```sh
  #!/bin/bash
  
  set -e
  
  poetry run core
  ```

### 启动

::: details docker

使用以下命令启动：

```shell
docker run -d \
  --name gsuid-core \
  --restart always \
  -p 8765:8765 \
  -v "./app:/app" \
  -v "./data:/app/data" \
  -v "./start:/start" \
  -v "./cache:/.cache" \
  -v "./plugins:/app/gsuid_core/plugins" \
  -e AUTO_VENV=1 \
  -e AUTO_VENV_NAME=gsuid_core \
  -e AUTO_PIP_INSTALL=1 \
  mhmzx/poetry-runner:3.11-bookworm
```
::: 

::: details docker-compose

- 创建文件 `./docker-compose.yaml`：

  ```yaml
  services:
    gsuid-core:
      image: mhmzx/poetry-runner:3.11-bookworm
      restart: always
      volumes:
        - ./app:/app
        - ./data:/app/data
        - ./start:/start
        - ./cache:/.cache
        - ./plugins:/app/gsuid_core/plugins
      ports:
        - 8765:8765
      environment:
        AUTO_VENV: 1
        AUTO_VENV_NAME: gsuid_core
        AUTO_PIP_INSTALL: 1
  ```

- 使用以下命令启动：

  ```shell
  docker compose up -d
  ```
::: 
