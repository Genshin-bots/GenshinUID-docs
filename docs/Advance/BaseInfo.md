# 理解概念<Badge type="tip" text="稍难" />

::: tip

该部分仅为帮助理解插件结构和逻辑, **可跳过**

:::

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