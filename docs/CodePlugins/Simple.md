# 简单示例<Badge type="tip" text="简单" />

[参考](https://github.com/Genshin-bots/gsuid_core/blob/master/gsuid_core/plugins/gs_test.py)

```python
import asyncio

from gsuid_core.sv import SL, SV
from gsuid_core.bot import Bot
from gsuid_core.models import Event
from gsuid_core.logger import logger

sv=SV(
    name='复杂的服务',  # 定义一组服务`开关`，代表这一组功能的统称
    pm=2, # 权限 0为master，1为superuser，2为群的群主, 3为管理员，6为普通，具体可见文档
    priority=5, # 整组服务的优先级，数字越小越先执行
    enabled=True, # 是否启用
    black_list=[], # 黑名单
    area='ALL' # 作用范围，可选'GROUP', 'DIRECT', 'ALL'
)

@sv.on_prefix('测试')
async def get_msg(bot: Bot, ev: Event): # 必须携带两个入参
    name = ev.text         # 获取消息除了命令之外的文字
    command = ev.command   # 获取消息中的命令部分
    im = await process(name)  # 自己的业务逻辑
    await bot.logger.info('正在进行[关闭/开启开关]')  # 发送loger给Bot端
    logger.info('正在进行[关闭/开启开关]') # gsuid_core自己的log
    await bot.send(im)   # 发送消息
```

### SV 参数速查

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `str` | 必填 | 服务名称，和插件名不同，代表这一组功能的统称 |
| `pm` | `int` | `6` | 权限等级（0=主人，2=群主，3=管理员，6=普通） |
| `priority` | `int` | `5` | 优先级，数字越小越先执行 |
| `enabled` | `bool` | `True` | 是否启用 |
| `area` | `str` | `'ALL'` | 作用范围：`GROUP` / `DIRECT` / `ALL` |
| `black_list` | `list` | `[]` | 用户 ID 黑名单 |
| `white_list` | `list` | `[]` | 用户 ID 白名单 |

同一 `name` 的 SV 是单例，多次创建会返回同一个实例，可跨文件共享。

###