# Core模块<Badge type="danger" text="困难" />

## `class` SVList

## `class` SV

服务注册器

```python
def __init__(
        self,
        name: str = '',
        pm: int = 6,
        priority: int = 5,
        enabled: bool = True,
        area: Literal['GROUP', 'DIRECT', 'ALL'] = 'ALL',
        black_list: List = [],
        white_list: List = [],
):
```

| 参数       | 类型                                | 默认值 | 注释       |
| ---------- | :---------------------------------- | ------ | ---------- |
| name       | `str`                               | 无     | 服务的名称 |
| pm         | `int`                               | `6`    | 用户权限   |
| priority   | `int`                               | `5`    | 响应优先级 |
| enabled    | `bool`                              | `True` | 启用状态   |
| area       | `Literal['GROUP', 'DIRECT', 'ALL']` | `ALL`  | 作用范围   |
| black_list | `list`                              | `[]`   | 黑名单列表 |
| white_list | `list`                              | `[]`   | 白名单列表 |

### `method` on_fullmatch

`def on_fullmatch(self, keyword: Union[str, Tuple[str, ...]], block: bool = False)`

| 参数      | 类型                            | 默认值     |
|---------|:------------------------------|---------|
| keyword | `Union[str, Tuple[str, ...]]` | 无       |
| block   | `bool`                        | `False` |

全字匹配消息。

### `method` on_prefix

`def on_fullmatch(self, keyword: Union[str, Tuple[str, ...]], block: bool = False)`

| 参数      | 类型                            | 默认值     |
|---------|:------------------------------|---------|
| keyword | `Union[str, Tuple[str, ...]]` | 无       |
| block   | `bool`                        | `False` |

匹配消息前缀。

### `method` on_suffix

`def on_fullmatch(self, keyword: Union[str, Tuple[str, ...]], block: bool = False)`

| 参数      | 类型                            | 默认值     |
|---------|:------------------------------|---------|
| keyword | `Union[str, Tuple[str, ...]]` | 无       |
| block   | `bool`                        | `False` |

全字消息后缀。

### `method` on_keyword

`def on_fullmatch(self, keyword: Union[str, Tuple[str, ...]], block: bool = False)`

| 参数      | 类型                            | 默认值     |
|---------|:------------------------------|---------|
| keyword | `Union[str, Tuple[str, ...]]` | 无       |
| block   | `bool`                        | `False` |

全字匹配消息关键字。

### `method` on_command

```python
def on_fullmatch(self, keyword: Union[str, Tuple[str, ...]], block: bool = False):
	...
```

| 参数      | 类型                            | 默认值     |
|---------|:------------------------------|---------|
| keyword | `Union[str, Tuple[str, ...]]` | 无       |
| block   | `bool`                        | `False` |

全字匹配消息命令。

## `value` SL

服务列表。是一个[SVList](#class-svlist)对象。