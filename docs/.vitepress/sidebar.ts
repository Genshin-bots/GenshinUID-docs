export default {
  '/': [
    {
      text: '🚀 快速开始',
      collapsed: true,
      items: [
        { text: '确认环境', link: '/快速开始/EnvCheck' },
        { text: '安装GsCore', link: '/快速开始/InstallCore' },
        { text: '启动GsCore', link: '/快速开始/StartCore' },
        { text: '配置GsCore', link: '/快速开始/CoreConfig' },
      ],
    },
    {
      text: ' 🤖 链接支持Bot',
      collapsed: true,
      items: [
        { text: 'NoneBot2', link: '/链接支持Bot/NoneBot2' },
        { text: 'HoshinoBot', link: '/链接支持Bot/HoshinoBot' },
        { text: '适配Bot列表', link: '/链接支持Bot/AdapterList' },
      ],
    },
    {
      text: '🔧 安装插件',
      collapsed: true,
      items: [
        { text: '安装插件', link: '/安装插件/InstallPlugins' },
        { text: '插件列表', link: '/安装插件/PluginsList' },
      ],
    },
    {
      text: ' 🚀 进阶介绍',
      collapsed: true,
      items: [
        { text: '概念理解', link: '/进阶介绍/BaseInfo' },
        { text: '数据存储结构', link: '/进阶介绍/DataStruct' },
        { text: '网页控制台', link: '/进阶介绍/WebConsole' },
      ],
    },
    {
      text: ' 🔍️ 编写插件',
      collapsed: true,
      items: [
        { text: '简单介绍', link: '/编写插件/Start' },
        { text: '简单示例', link: '/编写插件/Simple' },
        { text: '简单参考', link: '/编写插件/Exsample' },
        { text: '定时任务', link: '/编写插件/Scheduler' },
        { text: '调用资源目录', link: '/编写插件/GetDataPath' },
        { text: '提供配置项', link: '/编写插件/PluginsConfig' },
        { text: '调用数据库', link: '/编写插件/PluginsDataBase' },
        { text: '多步会话', link: '/编写插件/Resp' },
        { text: '模块方法', link: '/编写插件/Class' },
      ],
    },
    {
      text: ' 🧐 编写适配器',
      collapsed: true,
      items: [
        { text: '早柚协议', link: '/编写适配器/Protocol' },
        { text: '数据结构', link: '/编写适配器/Pack' },
      ],
    },
    {
      text: ' 📄 插件帮助',
      collapsed: true,
      items: [
        { text: 'GenshinUID', link: '/插件帮助/GenshinUID' },
        { text: 'StarRailUID', link: '/插件帮助/StarRailUID' },
      ],
    },
  ],
}
