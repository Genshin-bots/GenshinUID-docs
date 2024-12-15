# 订阅消息<Badge type="tip" text="简单" />

::: tip

想象一下以下场景，为了制作一个公告推送（或者是签到）功能，你需要制作一个命令，触发时用于先持久化保存该群/用户的信息（group_id/user_id）等，定时轮询信息源，有消息的时候就按照该群/用户的信息进行推送。

在这个场景下，因为GsCore的自带多平台/多账号适配，为了解决消息发送的问题，需要持久化的内容很多

例如：BOT，Bot平台ID（多平台），Bot自身ID（同平台多账号），user_id/group_id

而在发送的时候，需要传递的参数/代码量也过于繁琐，详见[定时任务](./Scheduler.md)

此时则需要一个封装好的方法，可以高效的处理该类场景，下面为你介绍。

:::

### Interface

[代码位置](https://github.com/Genshin-bots/gsuid_core/blob/2dda8aa0bb16c418bf008a281915be1a54119021/gsuid_core/subscribe.py)
[测试示例](https://github.com/Genshin-bots/gsuid_core/blob/2dda8aa0bb16c418bf008a281915be1a54119021/gsuid_core/plugins/gs_test.py#L158)

### 流程概览

```python
from gsuid_core.utils.database.models import Subscribe

# 订阅公告
GsCoreSubscribe.add_task("鸣朝公告", event)
# 订阅推送
GsCoreSubscribe.add_task("鸣朝推送", event)

# 发送主动消息
all_push_task: Optional[List[Subscribe]] = GsCoreSubscribe.get_task("鸣朝推送")
for subscribe in all_push_task:
    user_id = subscribe.user_id
    group_id = subscribe.group_id
    msg = process(user_id, group_id)  # 处理业务逻辑，并拿到消息
    subscribe.send(msg)  # 发送消息
```

### 一些重要的传参信息

```python
async def add_subscribe(
        self,
        subscribe_type: Literal['session', 'single'],
        task_name: str,
        event: Event,
        extra_message: Optional[str] = None,
    ):
        '''📝简单介绍:

            该方法允许向数据库添加一个订阅信息的持久化保存
            注意`subscribe_type`参数必须为`session`或`single`
            `session`模式下, 订阅都将在每个有效的session(group或direct)内独立存在 (公告推送)
            `single`模式下, 同个session(group)可能同时存在多个订阅 (签到任务)

        🌱参数:

            🔹subscribe_type (`Literal['session', 'single']`):
                    'session'模式: 同个group/user下只存在一条订阅
                    'single'模式: 同个group下存在多条订阅, 同个user只存在一条订阅

            🔹task_name (`str`):
                    订阅名称

            🔹event (`Event`):
                    事件Event

            🔹extra_message (`Optional[str]`, 默认是 `None`):
                    额外想要保存的信息, 例如推送信息或者数值阈值

        🚀使用范例:

            `await GsCoreSubscribe.add_subscribe('single', '签到', event)`
        '''
        pass
```

### 订阅消息

```python
from gsuid_core.subscribe import gs_subscribe
from gsuid_core.models import Event
from gsuid_core.bot import Bot
from gsuid_core.logger import logger

async def handle_subscribe(bot: Bot, ev: Event):
    await gs_subscribe.add_subscribe(
        'single',
        '订阅测试',
        ev,
        extra_message='测试',
    )
    data = await gs_subscribe.get_subscribe('订阅测试')
    logger.info(data)
    await bot.send('订阅成功！')
```

### 获取订阅角色/群聊&发送消息

```python
from gsuid_core.subscribe import gs_subscribe
from gsuid_core.models import Event
from gsuid_core.bot import Bot
from gsuid_core.logger import logger

async def handle_get_subscribe(bot: Bot, ev: Event):
    # 可以拿到所有该类命名的订阅信息
    datas = await gs_subscribe.get_subscribe('订阅测试')
    # 进行循环
    if datas:
        # 发送
        for subscribe in datas:
            await subscribe.send(f'[订阅] {subscribe.extra_message}')
    await bot.send('查看订阅成功！')
```

### 删除订阅

```python
from gsuid_core.subscribe import gs_subscribe
from gsuid_core.models import Event
from gsuid_core.bot import Bot
from gsuid_core.logger import logger

async def handle_unsubscribe(bot: Bot, ev: Event):
    # 执行删除
    await gs_subscribe.delete_subscribe('single', '订阅测试', ev)
    # 检查是否存在
    data = await gs_subscribe.get_subscribe('订阅测试')
    logger.info(data)
    await bot.send('取消订阅成功！')
```

