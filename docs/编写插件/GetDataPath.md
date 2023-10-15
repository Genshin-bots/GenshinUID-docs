# 插件获取/调用资源目录<Badge type="tip" text="简单" />

::: tip

可以使用该方法快速的定位资源文件夹（gsuid_core/data）

如文件夹没有建立,函数会自动建立，无需担心建立路径不存在

:::

```python
from gsuid_core.data_store import get_res_path

# 以GenshinUID为例
# path目录为gsuid_core/data/GenshinUID
path = get_res_path() / 'GenshinUID'
# 也可以直接传参，示例如下
path = get_res_path('GenshinUID')
# 参数支持传入列表，示例如下
path = get_res_path(['GenshinUID', 'res', 'font'])
# 该路径为gsuid_core/data/GenshinUID/res/font
```

