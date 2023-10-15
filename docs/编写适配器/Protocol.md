# 早柚协议<Badge type="warning" text="稍难" />

` GenshinUID-core `（下简称 GsCore）使用 WebSocket 与各 Bot 平台的插件（下简称插件）进行通信。

WebSocket 消息均使用 text 类型的 UTF-8 编码的 JSON，数据包结构请参阅[下一节](./Pack)。

## 建立连接

插件通过连接 GsCore 的 ` /ws/{bot_id} ` 路由建立连接。其中 ` bot_id ` 应替换为 Bot 平台的名称，如 ` NoneBot2 `。

## 消息类型 `Message`

消息由 `type` 和 `data` 两部分组成

`type` 标识此消息的类型，目前有如下类型：

* `text` 纯文本消息
* `markdown` MD消息
* `buttons` 按钮消息
* `image` 图片
* `image_size` 图片大小
* `file` 文件
* `at` 提及
* `reply` 回复
* `record` 音频
* `node` 合并转发

此外，还有一种特殊的 `log_{level}` 类型，此类型仅存在于 `MessageSend` 包中，插件收到此消息，应按照 `level` 输出 `data` 中的内容

`data` 为任意类型，上方列出的类型对应的 `data` 如下：

* `text` 为文本内容
* `markdown`同样为文本内容（内容带MD格式）
* `buttons`是一个列表，里面可能的值为`Button[]`或为`Button`
* `image` 为一个 `map`，内容如下
  * `type` (url|file|b64) 该图片的 `content` 类型：url/本地文件/base64
  * `content` (string) 该图片内容 -->
* `image`
  * 在 `MessageReceive` 中，一般为 url
  * 在 `MessageSend` 中，为 base64
* `file` 为 `string`，内容为 `{文件名}|{文件base64}`
* `node` 为 `Message[]`（不允许嵌套 `node`）
* `reply` 为消息 id
* `at` 为被提及人的 id

## 上报消息

Bot 平台接收到消息时，插件应向 core 发送 `MessageReceive` 包进行上报。

`MessageReceive` 包内容如下：

* `bot_id` (string) 聊天平台的 id，请与路由的 `bot_id` 进行区分
* `bot_self_id` (string) 机器人 id，对应聊天平台的机器人 id
* `msg_id` (string) 消息 id，对应聊天平台的消息 id
* `user_type` (`group`/`direct`/`channel`/`sub_channel`) 当前消息所属类型：群/私聊/频道/子频道
* `group_id` (string)
  * 当 `user_type` 为 `group` 时，此字段为群号
  * 当 `user_type` 为 `channel` 时，此字段为频道号
  * 当 `user_type` 为 `sub_channel` 时，此字段为子频道号
* `user_id` (string) 用户 id
* `user_pm` (integer) 用户权限，越小越高
* `content` (Message[]) 消息正文

:::tip 对 `user_pm` 的建议
`user_pm` 建议 `>=1`；

* 对于聊天平台身份与 Bot 框架的权限有联系的（如各聊天平台的 SDK），建议遵循下面的聊天平台身份与 `user_pm` 的映射关系：

  * 对于 `group`：
    * 群主为 `2`
    * 群管理员为 `3`
    * 普通群员为 `6`
    * 如果存在更低的身份，则使用更低的 `user_pm`
  * 对于 `channel` 和 `sub_channel`：
    * 频道主为 `2`
    * 当前频道的频道主为 `3`
    * 频道管理员为 `4`
    * 当前频道的管理员为 `5`
    * 普通成员为 `6`
    * 如果存在更低的身份，则使用更低的 `user_pm`
  * 对于 `direct`，非超级用户始终为 `6`
  * 超级用户始终为 `1`

* 对于无直接联系的（如 Koishi.js），由高到低安排 `user_pm`，但有以下两条规定

  * 最高权限使用 `1`
  * 普通权限使用 `6`

:::

## 发送消息

当插件接收到 core 发送的 `MessageSend` 包时，需通过 Bot 平台提供的接口，向聊天平台发送消息。

* `bot_id` (string) 聊天平台的 id，请与路由的 `bot_id` 进行区分
* `bot_self_id` (string) 机器人 id，对应聊天平台的机器人 id
* `msg_id` (string) 消息 id，对应聊天平台的消息 id
* `target_type` (string/null) 当前消息所属类型：群/私聊/频道/子频道
* `target_id` (string/null) 目标 id
* `content` (Message[]) 消息正文

`content` 中第 1 个元素为 `log` 类型的消息，则仅输出 log 即可