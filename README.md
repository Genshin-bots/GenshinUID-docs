# 简单介绍

## 理解概念

GenshinUID v4 将由以下部分组成。

- `Bot插件`（连接器、位于Bot插件文件夹内）
- `gsuid_core`（插件核心、单独文件夹）
- `core插件`（`genshinuid v4`插件、位于gsuid_core内）

接下来将以NoneBot2为载体，介绍插件运行原理，以便更好理解插件的安装方式

### 传统插件通信方法

`go-cqhttp <-> NoneBot2 <-> 插件(如genshinuid v3等)`

### v4采用的以Core为主体的通信模式

`go-cqhttp <-> NoneBot2 <-> 插件 <-> gsuid_core <-> GenshinUID v4`

### 这样做的好处

- 便于其他`Bot`同时调用`gsuid_core`，`core插件`一次编写、全平台通用
- 同个Bot可以同时使用多种适配器、支持开黑啦、微信、QQ、频道、Telegram
- 多平台共用一个数据库、共同连接一个`gsuid_core`

- 支持远端调用core内插件

## 快速开始

### 确认环境

- 确保安装`Python`环境（版本须`>=3.7`，不建议安装`>=3.11`的版本）

```shell
# 命令行内输入
python -V

# 以下为回复示例、无需输入
# 回复类似Python 3.10.10的信息，即为已经安装python环境
>>> Python 3.x.x
```

- 确保安装`git`环境

```shell
# 命令行内输入(注意v为小写)
git -v

# 以下为回复示例、无需输入
# 回复类似git version 2.38.1.windows.1的信息，即为已经安装Git环境
>>> git version xxxxx
```

- 确保安装`poetry`

```shell
# 命令行内输入
poetry -V

# 以下为回复示例、无需输入
# 回复类似Poetry (version 1.4.1)的信息，即为已经安装Git环境
>>> Poetry (version x.x.x)
```


## 安装Bot及其适配器

