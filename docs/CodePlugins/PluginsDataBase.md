---
author: "Wuyi无疑"
contributors: ["Wuyi无疑"]
---

# 插件获取/调用/建立数据库(GsData.db)<Badge type="tip" text="简单" />


::: tip

💡**强烈推荐**使用该方法去写数据库，基类提供了大部分较为常用的数据库方法（增删改查）

继承已经写好的基类，可以在较少代码量的前提下，生成专属插件的表并共享所有基类方法

有非常多额外的扩展方法（实现bot_id管理、多uid绑定、随机调用CK等等）

:::

#### 第一步、继承基类，建立自己的表

[参考](https://github.com/KimigaiiWuyi/WzryUID/blob/main/WzryUID/utils/database/models.py)

```python
from typing import Optional
from sqlmodel import Field

from gsuid_core.utils.database.base_models import Bind, User

class WzryBind(Bind, table=True):
    # 注意，这里的列名无需新增id等基类已经有的列，只需要根据自己实际需求新增列名即可
    # 具体基类有什么列可以点进Bind类去查看
    uid: Optional[str] = Field(default=None, title='王者荣耀UID')


class WzryUser(User, table=True):
    uid: Optional[str] = Field(default=None, title='王者荣耀UID')
```

#### 第二步、调用方法

[参考](https://github.com/KimigaiiWuyi/WzryUID/blob/main/WzryUID/wzryuid_user/__init__.py)

```python
import asyncio
from ..utils.database.models import WzryBind

async def main():
    # 注意，继承不同基类的表，方法可能不同，建议使用VSC查看所有方法，以及所有入参
    # GsCore完全使用TypeHint进行类型判断，如果VSC中代码用红线标注，务必查看函数入参，确保修改正确
	await WzryBind.insert_uid(qid, ev.bot_id, uid, ev.group_id)

asyncio.run(main())
```

#### 第三步、（可选）映射数据库到网页控制台

[参考](https://github.com/KimigaiiWuyi/WzryUID/blob/main/WzryUID/utils/database/models.py)

```python
from gsuid_core.webconsole.mount_app import PageSchema, GsAdminModel, site

# 注意，管理模型【一定】要携带@site.register_admin
# 否则【无需管理员账户】也能在网页控制台中【看到该表并修改】
@site.register_admin
class WzryBindadmin(GsAdminModel): # 一定要继承自GsAdminModel
    pk_name = 'id' # 一般无需修改，代表主键映射
    #label自定义，icon可参考https://fontawesome.com/v4/icons/
    page_schema = PageSchema(label='王者绑定管理', icon='fa fa-users')

    # 配置管理模型
    model = WzryBind # 填入第一步中继承的模型即可


@site.register_admin
class WzryUseradmin(GsAdminModel):
    pk_name = 'id'
    page_schema = PageSchema(label='王者CK管理', icon='fa fa-database')

    # 配置管理模型
    model = WzryUser
```

#### 额外、继承BaseModel（推荐）

::: tip

💡在上面从`gsuid_core.utils.database.base_models` 继承基础的 `Bind`,  `User`，`Push`，`Cache`表时，你可能会注意到一丝命名风格不舒服， 比如：

- 默认会有几列预设的列名，例如`uid`, `cookie`等等。
- 默认的方法名称为`select_data_by_uid`等等。

这是由于预设的四大表是基于游戏工具的视角设计，包含了大多数游戏工具应有的列和方法，但如果你写的插件和游戏类无关，那么这些列和默认方法就会比较碍眼。

GsCore当然也提供了更上游的基类以供继承，下面是具体代码。

:::

![image-20240818182411857](./../public/PluginsDataBase/image-20240818182411857.png)

##### 三级基类

GsCore 使用 SQLModel 作为 ORM，提供三级基类：

| 基类 | 字段 | 适用场景 |
|------|------|----------|
| `BaseIDModel` | 仅 `id`（自增主键） | 不需要 bot_id 和 user_id 的通用数据表 |
| `BaseBotIDModel` | `id` + `bot_id` | 需要区分 Bot 来源的数据表 |
| `BaseModel` | `id` + `bot_id` + `user_id` | 用户级数据表（最常用） |

##### `@with_session` 装饰器规则

所有数据库操作方法**必须**使用 `@with_session` 装饰器：

- **必须是 `classmethod`** 且 **`async def`**
- `session: AsyncSession` 必须是第二个参数（紧跟 `cls`）
- 装饰器自动 commit，异常自动回滚
- **不要**在方法内手动 `await session.commit()`

##### 完整示例

```python
from typing import Optional
from sqlmodel import Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from gsuid_core.utils.database.base_models import BaseModel, with_session


class GameBind(BaseModel, table=True):
    """游戏账号绑定表"""
    uid: str = Field(title="游戏 UID")
    region: str = Field(default="cn", title="大区")
    cookie: Optional[str] = Field(default=None, title="Cookie")

    @classmethod
    @with_session
    async def get_bind(
        cls, session: AsyncSession, user_id: str, bot_id: str
    ) -> Optional["GameBind"]:
        """根据用户 ID 查询绑定"""
        stmt = (
            select(cls)
            .where(cls.user_id == user_id)
            .where(cls.bot_id == bot_id)
        )
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    @with_session
    async def bind_uid(
        cls,
        session: AsyncSession,
        user_id: str,
        bot_id: str,
        uid: str,
        region: str = "cn",
    ) -> "GameBind":
        """绑定或更新 UID"""
        existing = await cls.get_bind(user_id, bot_id)
        if existing:
            existing.uid = uid
            existing.region = region
            session.add(existing)
            return existing
        bind = cls(user_id=user_id, bot_id=bot_id, uid=uid, region=region)
        session.add(bind)
        return bind

    @classmethod
    @with_session
    async def get_uid_list(
        cls, session: AsyncSession, user_id: str, bot_id: str
    ) -> list[str]:
        """获取用户所有绑定的 UID 列表"""
        stmt = (
            select(cls.uid)
            .where(cls.user_id == user_id)
            .where(cls.bot_id == bot_id)
        )
        result = await session.execute(stmt)
        return list(result.scalars().all())

    @classmethod
    @with_session
    async def delete_bind(
        cls, session: AsyncSession, user_id: str, bot_id: str, uid: str
    ) -> bool:
        """删除绑定"""
        stmt = (
            select(cls)
            .where(cls.user_id == user_id)
            .where(cls.bot_id == bot_id)
            .where(cls.uid == uid)
        )
        result = await session.execute(stmt)
        bind = result.scalar_one_or_none()
        if bind is None:
            return False
        await session.delete(bind)
        return True
```

##### 在触发器中使用数据库

```python
from gsuid_core.sv import SV
from gsuid_core.bot import Bot
from gsuid_core.models import Event

sv = SV("游戏查询")

@sv.on_command(("绑定", "bind"))
async def bind_uid(bot: Bot, ev: Event) -> None:
    uid = ev.text.strip()
    if not uid or not uid.isdigit():
        return await bot.send("请输入正确的 UID（纯数字）")
    await GameBind.bind_uid(ev.user_id, ev.bot_id, uid)
    await bot.send(f"✅ 已绑定 UID: {uid}")

@sv.on_fullmatch("我的UID")
async def show_uid(bot: Bot, ev: Event) -> None:
    uid_list = await GameBind.get_uid_list(ev.user_id, ev.bot_id)
    if not uid_list:
        return await bot.send("您还没有绑定 UID，发送 '绑定 您的UID' 进行绑定")
    await bot.send("您绑定的 UID：\n" + "\n".join(uid_list))
```

[实例参考](https://github.com/KimigaiiWuyi/MajsoulUID/blob/main/MajsoulUID/utils/database/models.py) ⬇

```python
class MajsPaipu(BaseIDModel, table=True):
    account_id: str = Field(default="", title="雀魂账号ID")
    uuid: str = Field(default="", title="牌谱UUID")
    paipu_type: int = Field(default=-1, title="牌谱类型")
    paipu_type_name: str = Field(default="", title="牌谱类型名称")

    @classmethod
    @with_session
    async def insert_data(
        cls: Type[T_MajsPaipu],
        session: AsyncSession,
        uuid: str,
        account_id: str,
        paipu_type: int,
        paipu_type_name: str,
    ) -> int:
        return await cls.full_insert_data(
            uuid=uuid,
            account_id=account_id,
            paipu_type=paipu_type,
            paipu_type_name=paipu_type_name,
        )

    @classmethod
    @with_session
    async def data_exist(
        cls: Type[T_MajsPaipu], session: AsyncSession, uuid: str
    ) -> bool:
        stmt = select(cls).where(cls.uuid == uuid)
        result = await session.execute(stmt)
        data = result.scalars().all()
        return bool(data)
```



#### 额外、为定好的表添加列

有时候可能需要为已经写好的表添加额外的列，对于开发者可以迁移表，但对于部署者可能没有这种能力。

所以我们需要一个方法，通过该方法可以无痕的在部署者启动Bot的时候，自动添加列。

::: tip

`exec_list` 中的 SQL 语句会在 `on_core_start_before` 阶段（WS 服务启动之前）执行，确保数据库 Schema 变更在消息处理前完成。

:::

方法如下：

1. 修改模型
2. 为`exec_list`添加SQL语句

[参考](https://github.com/tyql688/WutheringWavesUID/blob/fafebd2893b32742f1d930cb04df92795c59e054/WutheringWavesUID/utils/database/models.py)

```python
from gsuid_core.utils.database.startup import exec_list

# 先修改模型
class WavesUser(User, table=True):
    __table_args__: Dict[str, Any] = {"extend_existing": True}
    cookie: str = Field(default="", title="Cookie")
    uid: str = Field(default=None, title="鸣潮UID")
    record_id: Optional[str] = Field(default=None, title="鸣潮记录ID")
    platform: str = Field(default="", title="ck平台")
    stamina_bg_value: str = Field(default="", title="体力背景")
    bbs_sign_switch: str = Field(default="off", title="自动社区签到")
    bat: str = Field(default="", title="bat")
    did: str = Field(default="", title="did")
    
# 添加SQL语句
exec_list.extend(
    [
        'ALTER TABLE WavesUser ADD COLUMN platform TEXT DEFAULT ""',
        'ALTER TABLE WavesUser ADD COLUMN stamina_bg_value TEXT DEFAULT ""',
        'ALTER TABLE WavesUser ADD COLUMN bbs_sign_switch TEXT DEFAULT "off"',
        'ALTER TABLE WavesUser ADD COLUMN bat TEXT DEFAULT ""',
        'ALTER TABLE WavesUser ADD COLUMN did TEXT DEFAULT ""',
    ]
)

## 注意上面这个地方类型一定要填对
# 例如 TEXT 对应python的str; DEFAULT后面跟的是默认值
# 如果不理解、对SQL不熟悉的，可以让AI帮你写SQL语句
```

---

## 基类详情

GsCore 使用 SQLModel 作为 ORM，提供三级基类：

| 基类 | 字段 | 适用场景 |
|------|------|----------|
| `BaseIDModel` | 仅 `id` | 不需要 bot_id 和 user_id 的通用数据表 |
| `BaseBotIDModel` | `id` + `bot_id` | 需要区分 Bot 来源的数据表 |
| `BaseModel` | `id` + `bot_id` + `user_id` | 用户级数据表（最常用） |

### `@with_session` 装饰器

所有数据库操作方法必须使用 `@with_session` 装饰器：

```python
from gsuid_core.utils.database.base_models import with_session
from sqlalchemy.ext.asyncio import AsyncSession

class UserData(BaseModel, table=True):
    name: str = Field(title="名称")
    level: int = Field(default=1, title="等级")

    @classmethod
    @with_session
    async def get_user_by_name(cls, session: AsyncSession, name: str) -> 'UserData | None':
        """根据名称查询用户"""
        from sqlalchemy import select
        stmt = select(cls).where(cls.name == name)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    @with_session
    async def create_user(cls, session: AsyncSession, name: str, level: int = 1) -> 'UserData':
        """创建新用户"""
        user = cls(name=name, level=level)
        session.add(user)
        # @with_session 会自动 commit
        return user
```

**注意**：
- 方法签名必须包含 `session: AsyncSession` 参数
- `@with_session` 会自动处理 commit 和异常回滚
- 方法必须是 `async def`

### `async_maker` — 手动管理 Session

当需要在类方法外手动管理 session 时（例如批量操作、定时任务中的数据库清理等）：

```python
from gsuid_core.utils.database.base_models import async_maker

async def batch_cleanup():
    async with async_maker() as session:
        from sqlalchemy import delete
        stmt = delete(GameBind).where(GameBind.cookie == None)
        await session.execute(stmt)
        await session.commit()
```

::: warning

使用 `async_maker` 时需要**手动调用** `await session.commit()`，这与 `@with_session` 装饰器自动 commit 不同。

:::
