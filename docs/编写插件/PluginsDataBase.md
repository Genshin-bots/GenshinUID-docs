### 插件获取/调用/建立数据库(GsData.db)

> [!TIP]
>
> **强烈推荐**使用该方法去写数据库，基类提供了大部分较为常用的数据库方法（增删改查）
> 
> 继承已经写好的基类，可以在较少代码量的前提下，生成专属插件的表并共享所有基类方法
>
> 有非常多额外的扩展方法（实现bot_id管理、多uid绑定、随机调用CK等等）

##### 第一步、继承基类，建立自己的表

[参考](https://github.com/KimigaiiWuyi/WzryUID/blob/main/WzryUID/utils/database/models.py)

```python
from gsuid_core.utils.database.base_models import Bind, User

class WzryBind(Bind, table=True):
    # 注意，这里的列名无需新增id等基类已经有的列，只需要根据自己实际需求新增列名即可
    # 具体基类有什么列可以点进Bind类去查看
    uid: Optional[str] = Field(default=None, title='王者荣耀UID')


class WzryUser(User, table=True):
    uid: Optional[str] = Field(default=None, title='王者荣耀UID')
```

##### 第二步、调用方法

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

##### 第三步、（可选）映射数据库到网页控制台

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

