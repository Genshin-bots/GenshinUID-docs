# NoneBot2<Badge type="tip" text="简单" />

::: info

**以下【用户模式安装插件】和【开发者模式安装插件】二选一即可**

:::

## 安装插件<Badge type="tip" text="用户模式" />

- 进入机器人项目文件夹内，输入命令安装本插件

```sh
nb plugin install nonebot-plugin-genshinuid
```

- 使用`nb run`启动你的bot

## 安装插件<Badge type="danger" text="开发者模式" />

::: warning

需要配置好`.env`文件（SUPERUSER等）

插件开发者可选此模式，对应nb创建项目模板`simple`

:::

- cd至插件文件夹内，一般位于`{Bot目录}/src/plugins`下
- 输入安装命令（前提安装过git）

```sh
git clone -b v4-nonebot2 https://github.com/KimigaiiWuyi/GenshinUID.git --depth=1 --single-branch
```

- 使用命令`cd GenshinUID`进入插件文件夹
- 安装依赖`pip install -r requirements.txt`(如果你的`Nonebot2`运行在虚拟环境，需要进入虚拟环境安装依赖)
- 回到`Bot目录`下，使用命令`nb run`启动Bot
