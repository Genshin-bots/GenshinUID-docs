# 手动安装Core<Badge type="danger" text="普通" />

::: tip

如需选择`自动安装Core`、可**直接跳转**至对应Bot的安装文档

**推荐使用本方法安装Core**

:::

- 在`Bot目录`的上级（例如你的bot目录为`./Wuyi/nb2`,则cd至`./Wuyi`处）

- 输入安装core命令

```sh
git clone https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch
```
- 进入文件夹内


```sh
cd gsuid_core
```

- 安装依赖（以下两种二选一即可）
  - 执行`poetry install`安装依赖
  - 执行`pdm install`安装依赖
    - 然后执行`pdm run python -m ensurepip`

```sh
# poetry安装依赖方式
poetry install

# pdm安装依赖方式
pdm install
pdm run python -m ensurepip
```

- 安装所需插件<Badge type="tip" text="可选" />

```sh
cd gsuid_core
cd plugins
# 安装v4 GenshinUID
git clone -b v4 https://github.com/KimigaiiWuyi/GenshinUID.git --depth=1 --single-branch
```

-  🎉你已经成功安装GsCore
