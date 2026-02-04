# 安装Core<Badge type="danger" text="普通" />


## 下载/克隆仓库

- 在`Bot目录`的上级（例如你的bot目录为`./Wuyi/nb2`,则cd至`./Wuyi`处）

- 输入安装core命令

```sh
git clone https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch
```
- 进入文件夹内


```sh
cd gsuid_core
```

## 安装依赖
::: tip

可以根据你的喜好，自行选择`uv`, `pdm`, `poetry`等环境工具安装Core

或使用裸环境`python`&`pip`安装

:::

::: details 【🥳 推荐】uv
```sh
# uv安装依赖方式
uv python install 3.13
uv sync --python 3.13
uv run python -m ensurepip
```
:::

::: details poetry
```sh
# poetry安装依赖方式
poetry install
```
:::

::: details pdm

```sh
# pdm安装依赖方式
pdm install
pdm run python -m ensurepip
```

:::

::: details 【😡 不推荐】直接使用python

```sh
# 不推荐该方式
python -m pip install -r requirements.txt
```

:::

## 安装所需插件<Badge type="tip" text="可选" />

```sh
cd gsuid_core
cd plugins
# 安装v4 GenshinUID
git clone -b v4 https://github.com/KimigaiiWuyi/GenshinUID.git --depth=1 --single-branch
```

##  🎉你已经成功安装GsCore

 ▶ [启动Core](./StartCore)

