# 多步回话 <Badge type="warning" text="普通" />

> 有时候我们希望某用户在触发机器人命令之后
>
> 还需要再接收**一次或多次**来自**该用户或不同用户**的消息
>
> 才会继续执行业务逻辑和事件流程
>
> 那么该怎么处理呢？

## 单用户

<ChatPanel title="聊天界面">
<ChatMessage nickname="Wuyi无疑">开始测试</ChatMessage>
<ChatMessage nickname="GsCore">开始多步会话测试</ChatMessage>
<ChatMessage nickname="GsCore">接下来你说的话我都会提取出来噢？</ChatMessage>
<ChatMessage nickname="干扰用户" type="danger" tag="用户">你们在说什么呢？</ChatMessage>
<ChatMessage nickname="Wuyi无疑">我爱你</ChatMessage>
<ChatMessage nickname="GsCore">你说的是 我爱你 吧？</ChatMessage>
</ChatPanel>

### 代码示例
```python
from gsuid_core.bot import Bot
from gsuid_core.sv import SL, SV
from gsuid_core.models import Event

sv_switch = SV('测试开关')

@sv_switch.on_fullmatch('开始测试')
async def get_resp_msg(bot: Bot, ev: Event):
    await bot.send('开始多步会话测试')
    resp = await bot.receive_resp(
        '接下来你说的话我都会提取出来噢？',
    )
    if resp is not None:
        await bot.send(f'你说的是 {resp.text} 吧？')
```

## 多用户
<ChatPanel title="聊天界面">
<ChatMessage nickname="Wuyi无疑">开始多用户测试</ChatMessage>
<ChatMessage nickname="GsCore">开始多步会话测试</ChatMessage>
<ChatMessage nickname="GsCore">接下来开始游戏！？所有人的会话我都会收集起来的哦！</ChatMessage>
<ChatMessage nickname="群友A" type="danger" tag="用户">你们在说什么呢？</ChatMessage>
<ChatMessage nickname="GsCore">你说的是 你们在说什么呢？ 吧？</ChatMessage>
<ChatMessage nickname="Wuyi无疑">我爱你</ChatMessage>
<ChatMessage nickname="GsCore">你说的是 我爱你 吧？</ChatMessage>
</ChatPanel>

### 代码示例
```python
from gsuid_core.bot import Bot
from gsuid_core.sv import SL, SV
from gsuid_core.models import Event

sv_switch = SV('测试开关')

@sv_switch.on_fullmatch('开始多用户测试')
async def get_resp_msg(bot: Bot, ev: Event):
    await bot.send('开始多步会话测试')
    await bot.send('接下来开始游戏！？所有人的会话我都会收集起来的哦！')
    while True:
        resp = await bot.receive_mutiply_resp()
        if resp is not None:
            await bot.send(f'你说的是 {resp.text} 吧？')
```

## 总结

::: tip

可以看到`Bot.receive_resp()`后续**只会接受触发该命令的用户**的消息

但是`Bot.receive_mutiply_resp()`会接受后续**全部用户的信息**

:::

注意到`Bot.send_option()`和`Bot.receive_mutiply_resp()`均会调用`Bot.receive_resp()`

他们三个的参数都差不多，实际使用，功能区别如下：

- `Bot.send_option()`只会发送按钮（仅在QQGroup）或者在`unsuported_platform`参数为`True`的的情况下，为所有不适配按钮的发送多选消息。

- `Bot.receive_resp()`在上面这个方法的基础上，还会等待**触发命令用户**的**下一条回复**。

- `Bot.receive_mutiply_resp()`则是在上面方法的基础上，还会等待该群**接下来所有用户**的回复

### 参数

- `reply`参数可以填入`Bot.send()`内可填入的任何值，会让Bot发送一次消息，然后继续执行流程

- `option_list`参数可以填入类型`List[str], List[Button]`
  - 会按照列表，每行两个，发送按钮（仅在QQGroup ）
  - 该参数也可以填入`List[List[str]], List[List[Button]]`，代表每行几个按钮

