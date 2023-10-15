# 手动安装Core<Badge type="danger" text="普通" />

::: tip

如需选择`自动安装Core`、可**直接跳转**至对应Bot的安装文档

**推荐使用本方法安装Core**

:::

- 在`Bot目录`的上级（例如你的bot目录为`./Wuyi/nb2`,则cd至`./Wuyi`处）

- 输入安装core命令

```sh
git clone https://ghproxy.com/https://github.com/Genshin-bots/gsuid_core.git --depth=1 --single-branch
```
- 进入文件夹内


```sh
cd gsuid_core
```

- 执行`poetry install`安装依赖


```sh
poetry install
```

- 安装所需插件<Badge type="tip" text="可选" />

```sh
cd gsuid_core
cd plugins
# 安装v4 GenshinUID
git clone -b v4 https://ghproxy.com/https://github.com/KimigaiiWuyi/GenshinUID.git --depth=1 --single-branch
```

-  🎉你已经成功安装GsCore
