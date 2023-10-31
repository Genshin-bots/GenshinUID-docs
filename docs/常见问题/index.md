# 常见问题<Badge type="warning" text="检索" />

##### Q: 安装`gsuid_core`的时候，输入命令`poetry install`出现报错`DBusErrorResponse`

> 输入命令`export PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring`之后再次尝试`poetry install`

##### Q: 使用命令中报错`No such file or directory`

> 缺少相关资源文件夹，可尝试使用命令`gs重启`或者`下载全部资源`，如仍然报错，请提供错误日志并反馈

##### Q: 启动出现报错`SSLCertVerificationError`，但是Bot可以正常使用

> 涉及功能`深渊概览`，缺少SSL证书，进入[虚空数据库](https://akashadata.feixiaoqiu.com/static/data/abyss_total.js)后点击左上角、链接左边的小锁，`链接是安全的 -> 证书有效 -> 详细信息 -> 导出证书`, 然后文件名随便写一个，后缀改为`.crt`，双击安装证书即可

##### 启动出现报错`Httpx AsyncClient Timeout Error`等，但是Bot可以正常使用

> 涉及功能`版本深渊`, 网络无法连接内鬼网

##### Q: `签到`、`每日`等功能出现报错、或者错误码1034

> 米游社采取全域验证码校验，需要手动上米游社解除验证码风控（我的 -> 我的角色），**目前暂无公开解决方法**

##### Q: 群友使用命令无反馈、仅自己可用

> 使用`重置core配置`后重启

##### Q: 使用`gs帮助`无反应，其他命令有效

> 使用`gs重启`重新加载帮助图（大概率是由于更新后不重启导致的）

##### Q: 能不能一次性更新`GenshinUID v4`和`gsuid-core（早柚核心）`

> 使用`gs全部更新`，如遇v4更新报错，可进一步使用`gs强制更新`
> （注意无法强制更新core、也不推荐在core目录下使用`git rm`、`git clean`等高危命令）

##### Q: 启动资源下载过慢，有没有离线资源包

> 前往[资源包](ResourceDownload)下载最新文件覆盖

##### Q: Nonebot2的配置、添加适配器的教程

> 请自行前往对应文档查看，例如[NoneBot2文档](https://nb2.baka.icu/)、以及各个适配器的文档，善用[GitHub](https://github.com)的搜索功能

##### Q: `ValueError: the greenlet library is required to use this function. DLL load failed while importing _greenlet: 找不到指定的模块。`

> 安装依赖`greenlet`（如果你是windows，还需要额外安装`msvc-runtime`）
>
> 视环境使用`poetry run pip install greenlet`或者`pip install greenlet``
>
> 安装``msvc-runtime`同理

##### Q: 能不能添加某个功能

> 在GenshinUID的项目里提issuse，如果合理并且有余力，会加入`todo list`

##### Q: 能不能修改`v4-nonebot2`连接到`core`的端口

> 在nb2的环境文件中（例如`.env`）添加`gsuid_core_host="127.0.0.1"`和`gsuid_core_port="9527"`，IP地址和端口改成你需要的就可以

##### Q: 能不能修改`core`接受链接的端口

> 在`gsuid_core/gsuid_core/config.json`中，调整IP和PORT后重启core