# 定时任务<Badge type="tip" text="普通" />

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
