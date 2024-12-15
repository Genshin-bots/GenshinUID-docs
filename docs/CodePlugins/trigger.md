# 触发器<Badge type="tip" text="普通" />

触发器是事件触发的核心，触发器的上层是**服务**，下层是**函数**。

在`GsCore`中一共提供了8种触发器，下面一一为你介绍。

### 创建服务

触发器的上层是服务，所以我们需要先创建一个服务，所有的触发器将被挂在该服务的下面

```python
from gsuid_core.sv import SV

# 随意命名, 不要和其他插件冲突即可
sv_switch = SV('测试开关')
```

---

### 全匹配触发器

`on_fullmatch`是全匹配触发器，将在**发送的消息内容**完全等于**预先设定的触发内容**时触发

在下面的例子中，只有当消息内容为`全匹配测试`时才触发

```python
@sv_switch.on_fullmatch('全匹配测试')
async def get_fullmatch_msg(bot: Bot, ev: Event):
    await bot.send('正在进行[全匹配测试]')
    await asyncio.sleep(2)
    await bot.send('[全匹配测试]校验成功！')
```

---

### 前缀触发器

`on_prefix`是前缀触发器，将在**消息内容的前面部分**等于**预先设定的触发内容**时触发

例如下面的例子，将会响应`关闭ABC`或`开启ABC`或`开启XX`等等....

和 命令触发器`on_command`不同的是，该命令必须存在后面的参数，

下面的例子中，消息`开启`**将不会触发**命令

```python
@sv_switch.on_prefix(('关闭', '开启'))
async def get_switch_msg(bot: Bot, ev: Event):
    name = ev.text
    if not name:
        return

    await bot.send('正在进行[关闭/开启开关]')

    if name in SL.lst:
        if ev.command == '关闭':
            SL.lst[name].disable()
            await bot.send('关闭成功！')
        else:
            SL.lst[name].enable()
            await bot.send('开启成功！')
    else:
        await bot.send('未找到该服务...')
```

---

### 命令触发器

`on_command`是命令触发器，将在**消息内容的前面部分**等于**预先设定的触发内容**时触发

和`on_prefix`不同的是, 即使后面没有跟任何信息，它也会成功触发

例如，在下面的例子中`命令测试`，`命令测试 ABC`，`命令测试AAA`都将被成功触发！

简单的理解下，`on_command` = `on_fullmatch` + `on_prefix`

```python
@sv_switch.on_command('命令测试')
async def get_command_msg(bot: Bot, ev: Event):
    await bot.send('正在进行[命令测试]')
    await asyncio.sleep(2)
    await bot.send('[命令测试]校验成功！')
```

---

### 关键词触发器

`on_keyword`是关键词触发器，将在**消息内容包含预设关键词**时触发。

例如，下面的例子中只要消息内容中包含`关键词测试`，即会触发：

```python
@sv_switch.on_keyword(('关键词测试', '触发关键词'))
async def get_keyword_msg(bot: Bot, ev: Event):
    await bot.send('检测到关键词，正在进行处理！')
    await asyncio.sleep(1)
    await bot.send('关键词触发成功！')
```

---

### 文件触发器

`on_file`是文件触发器，专用于检测用户是否上传了符合条件的文件。

例如，下面的代码将会在用户上传`.json`格式的文件时触发：

```python
@sv_switch.on_file('json')
async def handle_json_file(bot: Bot, ev: Event):
    await bot.send('检测到文本文件，正在处理...')
    # 添加文件处理逻辑
    await asyncio.sleep(1)
    await bot.send('文本文件处理完成！')
```

---

### 正则触发器

`on_regex`是正则表达式触发器，将在**消息内容符合正则表达式模式**时触发。

例如，下面的代码中会检测是否有以`测试`开头，后面跟数字的消息：

```python
@sv_switch.on_regex(r'^测试\d+$')
async def regex_trigger(bot: Bot, ev: Event):
    await bot.send('正则匹配成功，正在进行处理！')
    await asyncio.sleep(1)
    await bot.send(f'匹配内容：{ev.text}')
```

---

### 后缀触发器

`on_suffix`是后缀触发器，将在**消息内容以特定的后缀结尾**时触发。

例如，下面的代码会响应所有以`.jpg`或`.png`结尾的消息：

```python
@sv_switch.on_suffix(('.jpg', '.png'))
async def suffix_trigger(bot: Bot, ev: Event):
    await bot.send('检测到图片后缀，正在处理！')
    # 添加后续逻辑
    await asyncio.sleep(1)
    await bot.send(f'处理完成：{ev.text}')
```

---

### 消息触发器

`on_message`是消息触发器，将在**接收到任意消息时触发**，适合用作消息日志记录或全局处理。

例如，下面的代码会对所有消息进行简单响应：

```python
@sv_switch.on_message()
async def message_trigger(bot: Bot, ev: Event):
    await bot.send('收到消息，正在处理...')
    await asyncio.sleep(1)
    await bot.send(f'处理完成：{ev.text}')
```
