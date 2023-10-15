# 数据结构<Badge type="warning" text="稍难" />

### gsuid_core.models

```python
class Message(Struct):
    type: Optional[str] = None
    data: Optional[Any] = None


class MessageReceive(Struct):
    bot_id: str = 'Bot'
    bot_self_id: str = ''
    msg_id: str = ''
    user_type: Literal['group', 'direct', 'channel', 'sub_channel'] = 'group'
    group_id: Optional[str] = None
    user_id: str = ''
    user_pm: int = 3
    content: List[Message] = []


class Event(MessageReceive):
    real_bot_id: str = ''
    raw_text: str = ''
    command: str = ''
    text: str = ''
    image: Optional[str] = None
    at: Optional[str] = None
    image_list: List[Any] = []
    at_list: List[Any] = []
    is_tome: bool = False
    reply: Optional[str] = None
    file_name: Optional[str] = None
    file: Optional[str] = None
    file_type: Optional[Literal['url', 'base64']] = None


class MessageSend(Struct):
    bot_id: str = 'Bot'
    bot_self_id: str = ''
    msg_id: str = ''
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    content: Optional[List[Message]] = None
```

### gsuid_core.message_models

```python
class Button(Struct):
    text: str
    data: str  # 具体数据
    pressed_text: Optional[str] = None  # 按下之后显示的值
    style: Literal[0, 1] = 1  # 0灰色线框，1蓝色线框
    action: Literal[0, 1, 2] = 2  # 0跳转按钮，1回调按钮，2命令按钮
    permisson: Literal[0, 1, 2, 3] = 2  # 0指定用户，1管理者，2所有人可按，3指定身份组
    specify_role_ids: List[str] = []  # 仅限频道可用
    specify_user_ids: List[str] = []  # 指定用户
    unsupport_tips: str = '您的客户端暂不支持该功能, 请升级后适配...'
```

