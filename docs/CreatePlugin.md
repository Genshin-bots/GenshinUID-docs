## 你也想创建一个适用于`gsuid_core`的插件？

> [!TIP]
>
> 借助适配器、`gsuid_core`的插件将同时适配全平台
>
> 但是`gsuid_core`本身并不支持高级的`Bot`功能，例如缺失**分步对话**、戳一戳等消息类型的缺失


### 简单示例

```python
import asyncio

from gsuid_core.sv import SL, SV
from gsuid_core.bot import Bot
from gsuid_core.models import Event
from gsuid_core.logger import logger

sv=SV(
    name='复杂的服务',  # 定义一组服务`开关`,
    pm=2, # 权限 0为master，1为superuser，2为群的群主, 3为管理员，6为普通，具体可见文档
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

### 定时任务
```python
from gsuid_core.aps import scheduler
from gsuid_core.gss import gss

@scheduler.scheduled_job('cron', minute='*/30') #设定一个定时任务、每隔三十分钟执行一次
async def notice_job():
	im = await process(name)  # 自己的业务逻辑
	for BOT_ID in gss.active_bot: # 获取全部连接中的Bot，注意，这里的BOT_ID和bot_id并不等价
		bot = gss.active_bot[BOT_ID] # 拿到bot实例
		await bot.target_send(
            msg,       # 具体要发送的消息
            'direct',  # 发送方式group或者direct
            target_id, # 发送目标，群号或者用户id，str
            bot_id,    # 实际bot_id、和上面的BOT_id不同，例如onebot等等
            '',        # bot_self_id, 用于同平台多bot连接，例如bot自己的QQ号等，可空
            ''		   # msg_id,要回复的某一个msg的id，可空
            at_sender, # 是否要at发送者，默认False
            sender_id, # sender_id, 默认为空，主动发送时，不建议填写这两个选项
        )
```