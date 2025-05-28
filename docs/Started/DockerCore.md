# 使用 Docker 运行 Core<Badge type="danger" text="稍难" />

## 下载/克隆仓库

- 首先在你喜欢的地方创建一个目录作为工作目录，并 cd 进入。

- 使用命令克隆仓库到 `./app`：

  ```sh
  git clone https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch ./app
  ```

## 准备工作

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

## 启动

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
