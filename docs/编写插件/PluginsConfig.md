# 插件配置项(config.json)<Badge type="tip" text="简单" />

[参考](https://github.com/qwerdvd/StarRailUID/blob/master/StarRailUID/starrailuid_config/config_default.py)

```python
# 先导入基础配置模型
from gsuid_core.utils.plugins_config.models import (
    GSC,
    GsStrConfig,
    GsBoolConfig,
    GsListStrConfig,
)

# 建立自己插件的CONFIG_DEFAULT
# 名字无所谓, 类型一定是Dict[str, GSC]，以下为示例，可以添加无数个配置
CONIFG_DEFAULT: Dict[str, GSC] = {
    'SignTime': GsListStrConfig('每晚签到时间设置', '每晚米游社签到时间设置（时，分）', ['0', '38']),
    'SignReportSimple': GsBoolConfig(
        '简洁签到报告',
        '开启后可以大大减少每日签到报告字数',
        True,
    )
}

# 设定一个配置文件（json）保存文件路径
from gsuid_core.data_store import get_res_path # get_res_path的用法可参考上一节

CONFIG_PATH = get_res_path() / 'StarRailUID' / 'config.json'

# 然后添加到GsCore网页控制台中
from gsuid_core.utils.plugins_config.gs_config import StringConfig

from .config_default import CONIFG_DEFAULT

# 分别传入 配置总名称（不要和其他插件重复），配置路径，以及配置模型
srconfig = StringConfig('StarRailUID', CONFIG_PATH, CONIFG_DEFAULT)
```

