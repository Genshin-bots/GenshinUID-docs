# 调用插件配置项<Badge type="tip" text="简单" />

在上一节配置完[插件配置项](./PluginsConfig)之后，代码中可以调用、读取插件配置项。

```python
from .srconfig import srconfig

# 读取配置项的数据
SignTime: List[str] = srconfig.get_config('SignTime').data
SignReportSimple: bool = srconfig.get_config('SignReportSimple').data

# 读取配置项的标题和详情(内容由之前定义的代码决定)
srconfig.get_config('SignReportSimple').title
srconfig.get_config('SignReportSimple').desc
```

