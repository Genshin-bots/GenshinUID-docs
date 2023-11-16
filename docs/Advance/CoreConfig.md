# GsCore配置<Badge type="tip" text="简单" />

## proxy<Badge type="tip" text="GsStrConfig" />

> **标题** 设置代理
>
> **详情** 设置国际服的代理地址
>
> **备注** 米游社请求的代理
>
> **默认值** `""`

## _pass_API<Badge type="tip" text="GsStrConfig" />

> **标题** 神奇API
>
> **详情** 设置某种神奇的API
>
> **备注** 设置某种神奇的API
>
> **默认值** `""`

## restart_command<Badge type="tip" text="GsStrConfig" />

> **标题** 重启命令
>
> **详情** 自定义使用gs重启时触发的控制台命令(看不懂勿改)
>
> **备注** 可修改成python
>
> **默认值** `"poetry run python"`

## MhySSLVerify<Badge type="info" text="GsBoolConfig" />

> **标题** ssl校验
>
> **详情** 开启或关闭米游社请求验证是否使用ssl校验
>
> **备注** 如无必要无需更改
>
> **默认值** `true`

## CaptchaPass<Badge type="info" text="GsBoolConfig" />

> **标题** 失效项
>
> **详情** 该选项已经无效且可能有一定危险性...
>
> **备注** 你懂的
>
> **默认值** `false`

## MysPass<Badge type="info" text="GsBoolConfig" />

> **标题** 无效项
>
> **详情** 该选项已经无效且可能有一定危险性...
>
> **备注** 你懂的
>
> **默认值** `false`

## AutoUpdateCore<Badge type="info" text="GsBoolConfig" />

> **标题** 自动更新Core
>
> **详情** 每晚凌晨三点四十自动更新core本体, 但不会自动重启应用更新
>
> **备注** 可以修改时间，建议顺便把自动重启打开
>
> **默认值** `true`

## AutoUpdatePlugins<Badge type="info" text="GsBoolConfig" />

> **标题** 自动更新Core内所有插件
>
> **详情** 每晚凌晨四点十分自动更新全部插件, 但不会自动重启应用更新
>
> **备注** 可以修改时间，建议顺便把自动重启打开
>
> **默认值** `true`

## AutoRestartCore<Badge type="info" text="GsBoolConfig" />

> **标题** 自动重启Core
>
> **详情** 每晚凌晨四点四十自动重启core
>
> **备注** 为确保服务稳定性，默认为关
>
> **默认值** `false`

## AutoUpdateCoreTime<Badge type="warning" text="GsListStrConfig" />

> **标题** 自动更新Core时间设置
>
> **详情** 每晚自动更新Core时间设置(时, 分)
>
> **备注** 更新core的时间
>
> **默认值** `["3", "40"]`


## AutoUpdateCoreTime<Badge type="warning" text="GsListStrConfig" />

> **标题** 自动更新Core时间设置
>
> **详情** 每晚自动更新Core时间设置(时, 分)
>
> **备注** 更新core的时间
>
> **默认值** `["3", "40"]`

## AutoUpdatePluginsTime<Badge type="warning" text="GsListStrConfig" />

> **标题** 自动更新Core内所有插件时间设置
>
> **详情** 每晚自动更新Core内所有插件时间设置(时, 分)
>
> **备注** 更新core内**所有插件**的时间
>
> **默认值** `["4", "10"]`


## AutoRestartCoreTime<Badge type="warning" text="GsListStrConfig" />

> **标题** 自动重启Core时间设置
>
> **详情** 每晚自动重启Core时间设置(时, 分)
>
> **备注** 自动重启core的时间，有开启[自动重启core](##AutoRestartCore)才会失效
>
> **默认值** `["4", "40"]`

## AutoAddRandomText<Badge type="info" text="GsBoolConfig" />

> **标题** 自动加入随机字符串
>
> **详情** 自动加入随机字符串
>
> **备注** 为core发送的文字，开启加入随机字符串，以确保消息不完全一样避免风控
>
> **默认值** `false`

## RandomText<Badge type="tip" text="GsStrConfig" />

> **标题** 随机字符串列表
>
> **详情** 随机字符串列表
>
> **备注** 开启[自动加入随机字符串](#AutoAddRandomText)之后, 随机加入的字符串选取
>
> **默认值** `"abcdefghijklmnopqrstuvwxyz"`

## ChangeErrorToPic<Badge type="info" text="GsBoolConfig" />

> **标题** 错误提示转换为图片
>
> **详情** 将一部分报错提示转换为图片
>
> **备注** 一部分调用core接口统一报错的功能，将会把错误信息转为图片
>
> **默认值** `true`

## AutoTextToPic<Badge type="info" text="GsBoolConfig" />

> **标题** 自动文字转图
>
> **详情** 将所有发送的文字转图
>
> **备注** 文转图以避免风控，当平台为非QQ，则不存在风控时，不建议开启
>
> **默认值** `false`

## TextToPicThreshold<Badge type="tip" text="GsStrConfig" />

> **标题** 文转图阈值
>
> **详情** 开启自动转图后超过该阈值的文字会转成图片
>
> **备注** 开启自动转图后超过该阈值的文字会转成图片，设置阈值不建议过低
>
> **默认值** `"20"`

## EnableSpecificMsgId<Badge type="info" text="GsBoolConfig" />

> **标题** 启用回复特殊ID
>
> **详情** 如不知道请勿开启
>
> **备注** 在某些平台的主动消息受限时，可以添加魔法msgid，来发送主动消息无限制
>
> **默认值** `false`

## SpecificMsgId<Badge type="tip" text="GsStrConfig" />

> **标题** 特殊返回消息ID
>
> **详情** 如不知道请勿填写
>
> **备注** 在某些平台的主动消息受限时，可以添加魔法msgid，来发送主动消息无限制
>
> **默认值** `""`

## AutoUpdateDep<Badge type="info" text="GsBoolConfig" />

> **标题** 自动更新依赖
>
> **详情** 更新插件的同时将会自动更新依赖
>
> **备注** 更新插件的同时将会自动更新依赖，大部分情况下不建议打开
>
> **默认值** `false`

## EnablePicSrv<Badge type="info" text="GsBoolConfig" />

> **标题** 将图片转链接发送(需公网)
>
> **详情** 发送图片转链接
>
> **备注** 启用图片自动转公网链接（GsCore所在服务器）的功能
>
> **默认值** `false`

## PicSrv<Badge type="tip" text="GsStrConfig" />

> **标题** 将图片转链接发送(需公网)
>
> **详情** 发送图片转链接
>
> **备注** 填入域名前缀，如果启用`EnablePicSrv`，则必须填写，例如`http://100.10.54.21:8765`
>
> **默认值** `""`

## ProxyURL<Badge type="tip" text="GsStrConfig" />

> **标题** 安装插件时使用git代理地址
>
> **详情** git代理地址
>
> **备注** 在发送命令`core安装插件`安装任意插件时, 将该代理地址作为git代理，可填入例如`https://gh-proxy.com`
>
> **默认值** `""`

## SendMDPlatform<Badge type="warning" text="GsListStrConfig" />

> **标题** 发送MD的平台列表(用:连接)
>
> **详情** 发送MD的平台列表
>
> **备注** 为避免在没有Markdown权限的平台发送md类型消息，可以填入`["qqgroup", "qqguild", "villa"]`
>
> **默认值** `[]`