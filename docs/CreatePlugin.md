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

### 插件获取/调用data目录（资源文件夹）

> [!TIP]
>
> 可以使用该方法快速的定位资源文件夹（gsuid_core/data）
>
> 如文件夹没有建立会自动建立，无需担心建立路径不存在
> 

```python
from gsuid_core.data_store import get_res_path

# 以GenshinUID为例
# path目录为gsuid_core/data/GenshinUID
path = get_res_path() / 'GenshinUID'
# 也可以直接传参，示例如下
path = get_res_path('GenshinUID')
# 参数支持传入列表，示例如下
path = get_res_path(['GenshinUID', 'res', 'font'])
# 该路径为gsuid_core/data/GenshinUID/res/font
```

### 插件配置并映射到网页控制台中(config.json)

```python
# 先导入基础配置模型
from gsuid_core.utils.plugins_config.models import (
    GSC,
    GsStrConfig,
    GsBoolConfig,
    GsListStrConfig,
)

# 建立自己插件的CONFIG_DEFAULT
# 名字无所谓, 类型一定是Dict[str, GSC]，以下为示例，可以添加无数个配置
CONIFG_DEFAULT: Dict[str, GSC] = {
    'SignTime': GsListStrConfig('每晚签到时间设置', '每晚米游社签到时间设置（时，分）', ['0', '38']),
    'SignReportSimple': GsBoolConfig(
        '简洁签到报告',
        '开启后可以大大减少每日签到报告字数',
        True,
    )
}

# 设定一个配置文件（json）保存文件路径
from gsuid_core.data_store import get_res_path # get_res_path的用法可参考上一节

CONFIG_PATH = get_res_path() / 'StarRailUID' / 'config.json'

# 然后添加到GsCore网页控制台中
from gsuid_core.utils.plugins_config.gs_config import StringConfig

from .config_default import CONIFG_DEFAULT

# 分别传入 配置总名称（不要和其他插件重复），配置路径，以及配置模型
srconfig = StringConfig('StarRailUID', CONFIG_PATH, CONIFG_DEFAULT)
```

### 插件获取/调用/建立数据库(GsData.db)

> [!TIP]
>
> **强烈推荐**使用该方法去写数据库，基类提供了大部分较为常用的数据库方法（增删改查）
> 
> 继承已经写好的基类，可以在较少代码量的前提下，生成专属插件的表并共享所有基类方法
>
> 有非常多额外的扩展方法（实现bot_id管理、多uid绑定、随机调用CK等等）

#### 第一步、继承基类，建立自己的表

```python
from gsuid_core.utils.database.base_models import Bind, User

class WzryBind(Bind, table=True):
    # 注意，这里的列名无需新增id等基类已经有的列，只需要根据自己实际需求新增列名即可
    # 具体基类有什么列可以点进Bind类去查看
    uid: Optional[str] = Field(default=None, title='王者荣耀UID')


class WzryUser(User, table=True):
    uid: Optional[str] = Field(default=None, title='王者荣耀UID')
```

#### 第二步、调用方法

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

