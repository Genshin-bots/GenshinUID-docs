import process from 'node:process'
import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { description, docsVersion, github, keywords, name, site } from './meta'
import { pwa } from './plugins/pwa'
import sidebar from './sidebar'

export default withPwa(defineConfig({
  pwa,
  outDir: '../dist',
  title: name,
  description,
  appearance: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  useWebFonts: false,
  markdown: {
    lineNumbers: true,
  },
  locales: {
    root: { label: '简体中文', lang: 'zh-CN' },
  },
  themeConfig: {
    logo: '/favicon.ico',
    outline: 2,
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    returnToTopLabel: '返回顶部',
    outlineTitle: '导航栏',
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '归档',
    /*
    editLink: {
      pattern: `${github}/tree/main/docs/:path`,
      text: '在 GitHub 上编辑此页',
    },
    lastUpdatedText: '最后一次更新于',
    */
    footer: {
      message: `支持多个Bot框架和多种平台的微服务，欢迎 <a target="_blank" style="color: var(--vp-c-brand)" href="${github}">star ⭐</a> 让更多人发现`,
      copyright: `<a target="_blank" href="${github}/blob/main/LICENSE">GPL v3 License</a> | Theme by <a target="_blank" href="https://github.com/Genshin-bots/gsuid_core">GsCore</a>`,
    },
    nav: [
      {
        text: '🎉 快速开始',
        items: [
          { text: '⭐ 安装Core', link: '/Started/InstallCore' },
          { text: '🤖 链接Bot', link: '/LinkBots/AdapterList' },
          { text: '🔧 安装插件', link: '/InstallPlugins/InstallPlugins' },
          { text: '✅ 绑定账号', link: '/Advance/BindDevice' },
          { text: '💫 常见问题', link: '/FAQ/' },
          { text: '💻 编写插件', link: '/CodePlugins/Start' },
          { text: '🧐 编写适配器', link: '/CodeAdapter/Pack' },
        ],
      },
      {
        text: '💖 系列插件',
        items: [
          { text: '✨ GenshinUID', link: 'https://github.com/KimigaiiWuyi/GenshinUID' },
          { text: '🚅 StarRailUID', link: 'https://github.com/baiqwerdvd/StarRailUID' },
          { text: '🎮 WzryUID', link: 'https://github.com/KimigaiiWuyi/WzryUID' },
          { text: '🛶 ArknightsUID', link: 'https://github.com/baiqwerdvd/ArknightsUID/' },
          { text: '🏫 BlueArchiveUID', link: 'https://github.com/KimigaiiWuyi/BlueArchiveUID' },
          { text: '🀄 MajsoulUID', link: 'https://github.com/KimigaiiWuyi/MajsoulUID' },
          { text: '🦸‍♂️ LOLegendsUID', link: 'https://github.com/KimigaiiWuyi/LOLegendsUID' },
        ],
      },
      {
        text: `v${docsVersion}`,
        items: [
          { text: '📝 文档地址', link: 'https://github.com/Genshin-bots/GenshinUID-docs' },
          { text: '📦️ GsCore地址', link: 'https://github.com/Genshin-bots/gsuid_core' },
        ],
      },
    ],
    sidebar,
  },
  head: [
    ['meta', { name: 'referrer', content: 'no-referrer-when-downgrade' }],
    ['meta', { name: 'keywords', content: keywords }],
    ['meta', { name: 'author', content: 'Wuyi' }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { name: 'application-name', content: name }],
    ['meta', { name: 'apple-mobile-web-app-title', content: name }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],

    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'mask-icon', href: '/favicon.ico', color: '#06f' }],
    ['meta', { name: 'theme-color', content: '#06f' }],

    ['link', { rel: 'apple-touch-icon', sizes: '120x120', href: '/images/icons/apple-touch-icon.png' }],

    // webfont
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }],
    ['link', { rel: 'preconnect', crossorigin: 'anonymous', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', crossorigin: 'anonymous', href: 'https://fonts.gstatic.com' }],
    // og
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: site }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    // analytics
    ['script', { 'async': '', 'defer': '', 'data-website-id': `${process.env.UMAMI_WEBSITE_ID || ''}`, 'src': `${process.env.UMAMI_ENDPOINT || ''}` }],
  ],
}))
