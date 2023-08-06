# NoneBot2

## 安装插件（用户模式，建议）

- 进入机器人项目文件夹内，输入`nb plugin install nonebot-plugin-genshinuid`安装本插件

## 安装插件（开发者模式）

> [!WARNING]
>
> 需要配置好`.env`文件（SUPERUSER等）
> 
> 插件开发者可选此模式，对应nb创建项目模板`simple`
> 
- cd至插件文件夹内，一般位于`{Bot目录}/src/plugins`下
- 输入安装命令（前提安装过git）

```sh
git clone -b v4-nonebot2 https://ghproxy.com/https://github.com/KimigaiiWuyi/GenshinUID.git --depth=1 --single-branch
```

- 使用命令`cd GenshinUID`进入插件文件夹
- 安装依赖`pip install -r requirements.txt`(如果你的`Nonebot2`运行在虚拟环境，需要进入虚拟环境安装依赖)
- 回到`Bot目录`下，使用命令`nb run`启动Bot

## 安装、启动Core

> [!TIP]
>
> 此为自动安装模式、已手动安装、启动完成**可跳过**
>
> **推荐**[手动安装模式](InstallCore)
>
> **以下命令均需要Bot的SU权限**

- 确保Bot正常启动，使用命令`gs一键安装`

- 等待安装完成后使用命令`启动core`

