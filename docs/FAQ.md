# 常见问题

> Q: 安装`gsuid_core`的时候，输入命令`poetry install`出现报错`DBusErrorResponse`
>
> A: 输入命令`export PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring`之后再次尝试`poetry install`

> Q: 使用命令中报错`No such file or directory`
>
> A: 缺少相关资源文件夹，可尝试使用命令`gs重启`或者`下载全部资源`，如仍然报错，请提供错误日志并反馈

> Q: 启动出现报错`SSLCertVerificationError`，但是Bot可以正常使用
>
> A: 涉及功能`深渊概览`，缺少SSL证书，进入[虚空数据库](https://akashadata.feixiaoqiu.com/static/data/abyss_total.js)后点击左上角、链接左边的小锁，`链接是安全的 -> 证书有效 -> 详细信息 -> 导出证书`, 然后文件名随便写一个，后缀改为`.crt`，双击安装证书即可

> Q: 启动出现报错`Httpx AsyncClient Timeout Error`等，但是Bot可以正常使用
>
> A: 涉及功能`版本深渊`, 网络无法连接内鬼网

> Q: `签到`、`每日`等功能出现报错、或者错误码1034
>
> A: 米游社采取全域验证码校验，需要手动上米游社解除验证码风控（我的 -> 我的角色），**目前暂无公开解决方法**