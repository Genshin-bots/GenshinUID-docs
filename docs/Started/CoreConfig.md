# 配置GsCore<Badge type="warning" text="普通" />

::: warning

`config.json`文件位于`gsuid_core/data/config.json`

`core_config.json`文件位于`gsuid_core/data/core_config.json`

本文关注的是`config.json`，而`core_config.json`请尽量通过[网页控制台](../Advance/WebConsole)去调整！

如想关注`core_config.json`，请检查[GsCore 选项](../Advance/CoreConfig)

首次安装GsCore时，两个文件均需要启动Core来进行生成

:::

### 一、使用网页控制台进行修改（推荐）

1. 启动GsCore
2. 进入[网页控制台](../Advance/WebConsole)
3. 在左侧【Core配置】页签中的**masters**选项中输入自己的QQ号（或其他平台号码）回车添加，然后点击确认修改
   1. 如果不清楚该填什么（其他平台）, 可以发一条消息，然后在GsCore后端查看你的`user_id`，填入那个即可
4. 重启GsCore
5. 发送消息，检查自己的PM在后端Log中是否显示pm=0

### 二、自行修改配置文件

::: tip

下面为详细配置，作为初次安装的萌新，只需要注意修改`masters`项为你自己的QQ号（或其他平台号码）即可，其他配置**可以完全不用动**, **别忘了双引号**。

如果不清楚该填什么（其他平台）, 可以发一条消息，然后在GsCore后端查看你的`user_id`，填入那个即可

:::

```json
{
  "HOST": "localhost", // 本机Host, 一般无需修改
  "PORT": "8765", // GsCore运行端口, 一般无需修改
  "masters": [
    "444835641" // master权限账号, 类型为List[string], 对应权限pm=0
  ],
  "superusers": [], // superuser权限账号, 类型为List[string], 对应权限pm=1
  "misfire_grace_time": 90, // 定时任务超时时间, 一般无需修改
  "log": {
    "level": "DEBUG" // 日志等级，一般为`INFO`且无需修改, 开发者和反馈Bug的时候开到`DEBUG`
  },
  "command_start": [
    "*" // 命令头, 类型为List[string], 默认为[], 填入此项后则所有命令必须带命令头触发
  ],
  "sv": { // 插件注册的全部服务列表, 均可通过网页控制台修改
    "Core管理": {
      "priority": 5, // 某个服务的优先级
      "enabled": true, // 某个服务是否启用
      "pm": 0, // 某个服务要求的权限等级
      "black_list": [], // 某个服务的黑名单, 类型为List[string]
      "area": "ALL", // 某个服务的响应范围, "ALL", "GROUP", "DIRECT"
      "white_list": [] // 某个服务的白名单, 类型为List[string]
    }
  }
}
```

