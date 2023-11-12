---
layout: home

title: 早柚核心Docs
titleTemplate: 安装早柚核心、了解早柚协议、编写插件的相关文档

hero:
  name: "早柚核心"
  text: ""
  tagline: |
    💖GsCore
  image:
    src: /favicon.ico
    alt: GsCore
  actions:
    - theme: brand
      text: 快速开始
      link: /Started/InstallCore
    - theme: alt
      text: 编写插件
      link: /CodePlugins/Start
    - theme: alt
      text: 简单介绍
      link: /Advance/BaseInfo
features:
  - icon: 💻
    title: 支持多种平台
    details: 适配QQ、QQ频道、微信、Telegram、Discord、飞书、KOOK、DoDo、米游社...
    link: /LinkBots/AdapterList
    linkText: 支持平台
  - icon: 🤖
    title: 适配多种Bot
    details: 适配NoneBot2、HoshinoBot、ZeroBot、Koishi、YunzaiBot...
    link: /LinkBots/AdapterList
    linkText: 支持Bot
  - icon: 🤝
    title: 连接多种协议
    details: 通过简单的早柚协议可以分发给OneBotV11、V12、Red等（需Bot支持）
    link: /CodeAdapter/Protocol
    linkText: 早柚协议
  - icon: 🌎
    title: 网页控制台
    details: 任何插件均可通过简单继承，令插件配置项直接在网页控制台上修改生效
    link: /CodePlugins/PluginsConfig
    linkText: 如何使用
  - icon: 🔌
    title: 插件统一
    details: 高度统一集成的插件，令你不需要为某种功能装很多插件，或者为了某种功能装重复插件
    link: /InstallPlugins/PluginsList
    linkText: 插件列表
  - icon: 🗄
    title: 统一数据库支持
    details: 通过简单的继承重写，可直接适配基础多账号方法、网页控制台增删改查以及更多
    link: /CodePlugins/PluginsDataBase
    linkText: 简单示例
  - icon: 📄
    title: 文档完善
    details: 安装、配置、安装插件、编写插件、编写适配器，文档一应俱全
    link: /Started/EnvCheck
    linkText: 查阅文档
  - icon: 🚩
    title: 拥抱开源
    details: GsCore和支持GsCore的插件均开源
    link: https://github.com/Genshin-bots/gsuid_core
    linkText: 欢迎 ⭐
---

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      核心成员介绍
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>

<HomeContributors/>
