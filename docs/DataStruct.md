## `gsuid_core`的数据存储

- 目录`gsuid_core/GsData.db`下保存着`GenshinUID`绑定的所有CK和UID数据
- 目录`gsuid_core/data`下保存着全部的插件数据
- 目录`gsuid_core/data/GenshinUID`下保存着`GenshinUID`的数据
- 其中`config.json`内可以调整功能开关，也可以在`网页控制台`中进行调整
- 其中`GsData_BAK_20xx_xx_xxx.db`为`GenshinUID`绑定的CK和UID数据的**备份文件**

- 其中`players`文件夹内保存着`GenshinUID`所有用户的**面板文件**和**抽卡记录**等
- 其中`bg`文件夹内**可以**存放部分功能的自定义背景图，重启Bot后随机调用，格式任意
- 其中`chbg`文件夹内可存放**面板查询**的自定义角色图
  - 例如创建`chbg/达达利亚`文件夹，并在文件夹下放置达达利亚的图，`gs开启随机图`就将调用该目录角色图

- 其中`resource`内存储着官方的图像资源、便于插件绘制图片(如缺失可用`下载全部资源`命令重新下载)
- 其中`wiki/guide`下存储着角色攻略图
- 其中`wiki/ref`下存储着角色参考面板图
- 其中`wiki/artifacts`下存储着绘制的圣遗物图片版资料

## 插件调用该目录

```python
from gsuid_core.data_store import get_res_path

# 以GenshinUID为例
# path目录为gsuid_core/data/GenshinUID
path = get_res_path() / 'GenshinUID'
```

