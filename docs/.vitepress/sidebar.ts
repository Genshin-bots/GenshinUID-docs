export default {
  '/': [
    {
      text: '🚀 快速开始',
      collapsed: true,
      items: [
        { text: '确认环境', link: '/Started/EnvCheck' },
        { text: '安装GsCore', link: '/Started/InstallCore' },
        { text: '启动GsCore', link: '/Started/StartCore' },
        { text: '配置GsCore', link: '/Started/CoreConfig' },
      ],
    },
    {
      text: ' 🤖 链接支持Bot',
      collapsed: true,
      items: [
        { text: 'NoneBot2', link: '/LinkBots/NoneBot2' },
        { text: 'HoshinoBot', link: '/LinkBots/HoshinoBot' },
        { text: '适配Bot列表', link: '/LinkBots/AdapterList' },
      ],
    },
    {
      text: '🔧 安装插件',
      collapsed: true,
      items: [
        { text: '安装插件', link: '/InstallPlugins/InstallPlugins' },
        { text: '插件列表', link: '/InstallPlugins/PluginsList' },
      ],
    },
    {
      text: ' 🚀 进阶介绍',
      collapsed: true,
      items: [
        { text: '概念理解', link: '/Advance/BaseInfo' },
        { text: '数据存储结构', link: '/Advance/DataStruct' },
        { text: '网页控制台', link: '/Advance/WebConsole' },
        { text: '常见问题', link: '/FAQ/' },
        { text: '绑定账号', link: '/Advance/BindDevice' },
      ],
    },
    {
      text: ' 🔍️ 编写插件',
      collapsed: true,
      items: [
        { text: '简单介绍', link: '/CodePlugins/Start' },
        { text: 'VsCode配置', link: '/CodePlugins/Env' },
        { text: '简单示例', link: '/CodePlugins/Simple' },
        { text: '简单参考', link: '/CodePlugins/Exsample' },
        { text: '定时任务', link: '/CodePlugins/Scheduler' },
        { text: '调用资源目录', link: '/CodePlugins/GetDataPath' },
        { text: '提供配置项', link: '/CodePlugins/PluginsConfig' },
        { text: '调用数据库', link: '/CodePlugins/PluginsDataBase' },
        { text: '多步会话', link: '/CodePlugins/Resp' },
        { text: '模块方法', link: '/CodePlugins/Class' },
      ],
    },
    {
      text: ' 🧐 编写适配器',
      collapsed: true,
      items: [
        { text: '早柚协议', link: '/CodeAdapter/Protocol' },
        { text: '数据结构', link: '/CodeAdapter/Pack' },
      ],
    },
    {
      text: ' 📄 插件帮助',
      collapsed: true,
      items: [
        { text: 'GenshinUID', link: '/PluginsHelp/GenshinUID' },
        { text: 'StarRailUID', link: '/PluginsHelp/StarRailUID' },
        { text: 'ArknightsUID', link: '/PluginsHelp/ArknightsUID' },
        { text: 'BlueArchiveUID', link: '/PluginsHelp/BlueArchiveUID' },
        { text: 'WzryUID', link: '/PluginsHelp/WzryUID' },
      ],
    },
  ],
}
