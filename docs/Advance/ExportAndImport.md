# 迁移数据至v4<Badge type="tip" text="简单" />

### 导出`GenshinUID v3`数据

::: tip

无论是NoneBot2 & HoshinoBot，在导出数据时，**务必是最新版本**`GenshinUID v3`

并且以下命令**均需**`SUPERUSER`权限

:::

- 使用`gs更新`升级到最新版本

- 使用命令`导出v3数据`（时间可能比较长，等待Bot回复...）

- 备份{Bot目录}/data/GenshinUID这个文件夹(`HoshinoBot`对应目录为res/GenshinUID)

### 导入`GenshinUID v3`数据至`GenshinUID v4`

::: tip

导入数据应该在安装完成`gsuid_core`、`GenshinUID v4`之后执行

如果你还没有安装`gsuid_core` -> [安装教程](../快速开始/InstallCore)

如果是自动安装Core的话，`Core目录`应该和`Bot目录`同级

:::

- 将[导出v3数据](#导出`GenshinUID v3`数据)中第三步的文件夹，拷贝到`{Core目录}/data/GenshinUID`内

- **删除**该文件夹`/data/GenshinUID`内`config.json`文件（如有需要可以备份）

- 正确启动`gsuid_core`和`bot`之后，使用命令`导入v3数据`

