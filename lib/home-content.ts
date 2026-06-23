import type { Language } from '@/lib/i18n'

interface HeroAction {
  text: string
  link: string
  primary?: boolean
}

interface Feature {
  icon: string
  title: string
  details: string
  link: string
  linkText?: string
}

interface TeamMember {
  name: string
  title: string
  avatar: string
  link: string
}

interface SupportLink {
  icon: string
  label: string
  href: string
}

interface HomeContent {
  hero: {
    name: string
    text: string
    tagline: string
    eyebrow?: string
    actions: HeroAction[]
  }
  scrollHint?: string
  featuresTitle?: string
  features: Feature[]
  teamTitle?: string
  teamMembers: TeamMember[]
  contributorsTitle: string
  contributorsLabel: string
  contributorsViewAll: string
  supportTitle: string
  supportLinks: SupportLink[]
  marquee: string[]
}

/** 平台 / Bot 名称——跨语言通用，用作 hero 下方的大字滚动条 */
const marqueeTokens: string[] = [
  'NoneBot2', 'QQ', 'Telegram', 'Discord', 'KOOK', '微信', 'OneBot', '飞书',
  'Koishi', 'YunzaiBot', 'DoDo', '米游社', 'HoshinoBot', 'QQ频道', 'ZeroBot',
]

const zhFeatures: Feature[] = [
  { icon: '💻', title: '支持多种平台', details: '适配QQ、QQ频道、微信、Telegram、Discord、飞书、KOOK、DoDo、米游社...', link: '/docs/link-bots/adapter-list/', linkText: '支持平台' },
  { icon: '🤖', title: '适配多种Bot', details: '适配NoneBot2、HoshinoBot、ZeroBot、Koishi、YunzaiBot...', link: '/docs/link-bots/adapter-list/', linkText: '支持Bot' },
  { icon: '🤝', title: '连接多种协议', details: '通过简单的早柚协议可以分发给OneBotV11、V12、Red等（需Bot支持）', link: '/docs/code-adapter/protocol/', linkText: '早柚协议' },
  { icon: '🌎', title: '网页控制台', details: '任何插件均可通过简单继承，令插件配置项直接在网页控制台上修改生效', link: '/docs/started/web-console/', linkText: '如何使用' },
  { icon: '🔌', title: '插件统一', details: '高度统一集成的插件，令你不需要为某种功能装很多插件，或者为了某种功能装重复插件', link: '/docs/install-plugins/plugins-list/', linkText: '插件列表' },
  { icon: '🗄', title: '统一数据库支持', details: '通过简单的继承重写，可直接适配基础多账号方法、网页控制台增删改查以及更多', link: '/docs/code-plugins/plugins-data-base/', linkText: '简单示例' },
  { icon: '📄', title: '文档完善', details: '安装、配置、安装插件、编写插件、编写适配器，文档一应俱全', link: '/docs/started/env-check/', linkText: '查阅文档' },
  { icon: '🚩', title: '拥抱开源', details: 'GsCore和支持GsCore的插件均开源', link: 'https://github.com/Genshin-bots/gsuid_core', linkText: '欢迎 ⭐' },
]

const enFeatures: Feature[] = [
  { icon: '💻', title: 'Multi-platform', details: 'Supports QQ, QQ Guild, WeChat, Telegram, Discord, Feishu, KOOK, DoDo, Miyoushe...', link: '/docs/link-bots/adapter-list/', linkText: 'Platforms' },
  { icon: '🤖', title: 'Multi-bot', details: 'Compatible with NoneBot2, HoshinoBot, ZeroBot, Koishi, YunzaiBot...', link: '/docs/link-bots/adapter-list/', linkText: 'Bots' },
  { icon: '🤝', title: 'Sayu Protocol', details: 'Distribute to OneBotV11, V12, Red, etc. via the simple Sayu protocol', link: '/docs/code-adapter/protocol/', linkText: 'Protocol' },
  { icon: '🌎', title: 'Web Console', details: 'Any plugin can expose its config to the web console with a simple inheritance', link: '/docs/started/web-console/', linkText: 'How to use' },
  { icon: '🔌', title: 'Unified Plugins', details: 'Highly unified plugins so you do not need many plugins or duplicated ones', link: '/docs/install-plugins/plugins-list/', linkText: 'Plugin list' },
  { icon: '🗄', title: 'Unified Database', details: 'Inherit to get multi-account methods, web console CRUD and more', link: '/docs/code-plugins/plugins-data-base/', linkText: 'Example' },
  { icon: '📄', title: 'Complete Docs', details: 'Installation, configuration, plugins, development — all covered', link: '/docs/started/env-check/', linkText: 'Read docs' },
  { icon: '🚩', title: 'Open Source', details: 'GsCore and supported plugins are open source', link: 'https://github.com/Genshin-bots/gsuid_core', linkText: 'Star ⭐' },
]

const jaFeatures: Feature[] = [
  { icon: '💻', title: 'マルチプラットフォーム', details: 'QQ、QQギルド、WeChat、Telegram、Discord、Feishu、KOOK、DoDo、米游社...', link: '/docs/link-bots/adapter-list/', linkText: 'プラットフォーム' },
  { icon: '🤖', title: 'マルチBot', details: 'NoneBot2、HoshinoBot、ZeroBot、Koishi、YunzaiBot に対応', link: '/docs/link-bots/adapter-list/', linkText: 'Bot' },
  { icon: '🤝', title: 'Sayuプロトコル', details: 'Sayuプロトコル経由でOneBotV11、V12、Red等に配信', link: '/docs/code-adapter/protocol/', linkText: 'プロトコル' },
  { icon: '🌎', title: 'Webコンソール', details: '簡単な継承でプラグイン設定をWebコンソールで管理', link: '/docs/started/web-console/', linkText: '使い方' },
  { icon: '🔌', title: '統一プラグイン', details: '重複や乱立しない、高度に統合されたプラグイン', link: '/docs/install-plugins/plugins-list/', linkText: '一覧' },
  { icon: '🗄', title: '統一データベース', details: '継承でマルチアカウントやCRUD機能を即座に獲得', link: '/docs/code-plugins/plugins-data-base/', linkText: '例' },
  { icon: '📄', title: '完全なドキュメント', details: 'インストール、設定、プラグイン、開発まですべて網羅', link: '/docs/started/env-check/', linkText: '読む' },
  { icon: '🚩', title: 'オープンソース', details: 'GsCoreおよび対応プラグインはオープンソース', link: 'https://github.com/Genshin-bots/gsuid_core', linkText: 'Star ⭐' },
]

const teamMembers: TeamMember[] = [
  { name: 'Wuyi', title: 'Author', avatar: 'https://avatars.githubusercontent.com/u/55526518?v=4', link: 'https://github.com/KimigaiiWuyi' },
  { name: 'baiqwerdvd', title: 'Developer', avatar: 'https://avatars.githubusercontent.com/u/158065462?v=4', link: 'https://github.com/baiqwerdvd' },
  { name: 'Agnes4m', title: 'Developer', avatar: 'https://avatars.githubusercontent.com/u/70925546?v=4', link: 'https://github.com/Agnes4m' },
]

const supportLinks: SupportLink[] = [
  { icon: '🐛', label: 'GitHub Issues', href: 'https://github.com/Genshin-bots/gsuid_core/issues' },
  { icon: '🐧', label: 'Mihomo Bot Group', href: 'https://qm.qq.com/q/zLghD5ENva' },
]

export function getHomeContent(lang: Language): HomeContent {
  if (lang === 'en') {
    return {
      hero: {
        name: 'Sayu Core',
        text: 'GsCore',
        eyebrow: 'A modern Python Bot framework',
        tagline: '💖 One business logic, multiple platforms — write once, run everywhere.',
        actions: [
          { text: 'Quick Start', link: '/docs/started/install-core/', primary: true },
          { text: 'Write Plugin', link: '/docs/code-plugins/start/' },
          { text: 'Introduction', link: '/docs/advance/base-info/' },
        ],
      },
      scrollHint: 'Scroll to explore',
      featuresTitle: 'Why GsCore',
      features: enFeatures,
      teamTitle: 'Core Team',
      teamMembers,
      contributorsTitle: 'Thanks to contributors',
      contributorsLabel: 'contributors',
      contributorsViewAll: 'View all on GitHub',
      supportTitle: 'Get help / support',
      supportLinks,
      marquee: marqueeTokens,
    }
  }

  if (lang === 'ja') {
    return {
      hero: {
        name: 'さゆコア',
        text: 'GsCore',
        eyebrow: 'モダンな Python Bot フレームワーク',
        tagline: '💖 一つのビジネスロジック、複数のプラットフォーム — 一度書けば、どこでも動く。',
        actions: [
          { text: 'クイックスタート', link: '/docs/started/install-core/', primary: true },
          { text: 'プラグイン開発', link: '/docs/code-plugins/start/' },
          { text: 'はじめに', link: '/docs/advance/base-info/' },
        ],
      },
      scrollHint: 'スクロールして探索',
      featuresTitle: 'GsCore を選ぶ理由',
      features: jaFeatures,
      teamTitle: 'コアチーム',
      teamMembers,
      contributorsTitle: '貢献者に感謝',
      contributorsLabel: '人の貢献者',
      contributorsViewAll: 'GitHub で全員を見る',
      supportTitle: 'ヘルプ / サポート',
      supportLinks,
      marquee: marqueeTokens,
    }
  }

  // zh-CN (default)
  return {
    hero: {
      name: '早柚核心',
      text: 'GsCore',
      eyebrow: '现代化的 Python Bot 框架',
      tagline: '💖 一套业务逻辑，多个平台支持——一次编写，到处运行。',
      actions: [
        { text: '快速开始', link: '/docs/started/install-core/', primary: true },
        { text: '编写插件', link: '/docs/code-plugins/start/' },
        { text: '简单介绍', link: '/docs/advance/base-info/' },
      ],
    },
    scrollHint: '向下滚动 · 探索更多',
    featuresTitle: '为什么选择 GsCore',
    features: zhFeatures,
    teamTitle: '核心团队',
    teamMembers,
    contributorsTitle: '感谢成员贡献',
    contributorsLabel: '位贡献者',
    contributorsViewAll: '在 GitHub 查看全部',
    supportTitle: '获得帮助/支持',
    supportLinks,
    marquee: marqueeTokens,
  }
}
