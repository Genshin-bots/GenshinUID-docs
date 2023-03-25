## 你也想创建一个适用于`gsuid_core`的插件？

> [!TIP]
>
> 借助适配器、`gsuid_core`的插件将同时适配全平台
>
> 但是`gsuid_core`本身并不支持高级的`Bot`功能，例如缺失**分步对话**、戳一戳等消息类型的缺失

```python
import asyncio

from gsuid_core.sv import SL, SV
from gsuid_core.bot import Bot
from gsuid_core.models import Event
from gsuid_core.logger import logger

sv=SV(
    name='复杂的服务',  # 定义一组服务`开关`,
    pm=2, # 权限 0为master，1为superuser，2为群的群主&管理员，3为普通
    priority=5, # 整组服务的优先级
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

