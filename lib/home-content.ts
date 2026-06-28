import type { Language } from '@/lib/i18n';

/**
 * 内嵌「可交互控制台」(gsuid_hub Demo) 的基址。
 * **始终同源** `/hub`：hub Demo 产物由 scripts/hub.mjs 烤进 public/hub/，开发(next dev)与
 * 生产(output:export) 都由 docs 自身托管 —— 不再依赖任何独立端口/服务，杜绝「localhost 拒绝连接」。
 * （仍可用 NEXT_PUBLIC_HUB_BASE 覆盖，一般无需。）
 *
 * embedSrc 用 `index.html` 显式入口（dev 下 next 直接命中静态文件，无目录索引歧义），
 * 并带 `?embed=1` 让 hub 进入「嵌入锁定」模式（侧边栏只展示不可点击）。HashRouter 深链跟在 `#` 后。
 */
export const HUB_DEMO_BASE = process.env.NEXT_PUBLIC_HUB_BASE || '/hub';
const hubEmbed = (route: string) =>
  `${HUB_DEMO_BASE}/index.html?embed=1#/${route}`;

interface HeroAction {
  text: string;
  link: string;
  primary?: boolean;
}

interface Feature {
  icon: string;
  title: string;
  details: string;
  link: string;
  linkText?: string;
}

interface TeamMember {
  name: string;
  title: string;
  avatar: string;
  link: string;
}

interface SupportLink {
  icon: string;
  label: string;
  href: string;
}

interface ShowcaseItem {
  /** public 下的图片路径，如 /home/dashboard.png */
  img: string;
  alt: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  /** 实时演示深链（hub Demo 对应页）。点击截图后挂载 iframe 加载此地址。 */
  embedSrc?: string;
}

interface Showcase {
  title: string;
  subtitle: string;
  /** 截图蒙层「点击体验实时演示」按钮文案 */
  playLabel: string;
  /** 激活后角标「实时演示」徽章文案 */
  liveBadge: string;
  items: ShowcaseItem[];
}

interface HomeContent {
  hero: {
    name: string;
    text: string;
    tagline: string;
    eyebrow?: string;
    actions: HeroAction[];
  };
  scrollHint?: string;
  showcase: Showcase;
  featuresTitle?: string;
  features: Feature[];
  teamTitle?: string;
  teamMembers: TeamMember[];
  contributorsTitle: string;
  contributorsLabel: string;
  contributorsViewAll: string;
  supportTitle: string;
  supportLinks: SupportLink[];
  marquee: string[];
}

/** 平台 / Bot 名称——跨语言通用，用作 hero 下方的大字滚动条 */
const marqueeTokens: string[] = [
  'NoneBot2',
  'QQ',
  'Telegram',
  'Discord',
  'KOOK',
  '微信',
  'OneBot',
  '飞书',
  'Koishi',
  'YunzaiBot',
  'DoDo',
  '米游社',
  'HoshinoBot',
  'QQ频道',
  'ZeroBot',
];

const zhFeatures: Feature[] = [
  {
    icon: '💻',
    title: '支持多种平台',
    details:
      '适配QQ、QQ频道、微信、Telegram、Discord、飞书、KOOK、DoDo、米游社...',
    link: '/docs/link-bots/adapter-list/',
    linkText: '支持平台',
  },
  {
    icon: '🤖',
    title: '适配多种Bot',
    details: '适配NoneBot2、HoshinoBot、ZeroBot、Koishi、YunzaiBot...',
    link: '/docs/link-bots/adapter-list/',
    linkText: '支持Bot',
  },
  {
    icon: '🤝',
    title: '连接多种协议',
    details: '通过简单的早柚协议可以分发给OneBotV11、V12、Red等（需Bot支持）',
    link: '/docs/code-adapter/protocol/',
    linkText: '早柚协议',
  },
  {
    icon: '🌎',
    title: '网页控制台',
    details: '任何插件均可通过简单继承，令插件配置项直接在网页控制台上修改生效',
    link: '/docs/started/web-console/',
    linkText: '如何使用',
  },
  {
    icon: '🔌',
    title: '插件统一',
    details:
      '高度统一集成的插件，令你不需要为某种功能装很多插件，或者为了某种功能装重复插件',
    link: '/docs/install-plugins/plugins-list/',
    linkText: '插件列表',
  },
  {
    icon: '🗄',
    title: '统一数据库支持',
    details:
      '通过简单的继承重写，可直接适配基础多账号方法、网页控制台增删改查以及更多',
    link: '/docs/code-plugins/plugins-data-base/',
    linkText: '简单示例',
  },
  {
    icon: '📄',
    title: '文档完善',
    details: '安装、配置、安装插件、编写插件、编写适配器，文档一应俱全',
    link: '/docs/started/env-check/',
    linkText: '查阅文档',
  },
  {
    icon: '🚩',
    title: '拥抱开源',
    details: 'GsCore和支持GsCore的插件均开源',
    link: 'https://github.com/Genshin-bots/gsuid_core',
    linkText: '欢迎 ⭐',
  },
];

const enFeatures: Feature[] = [
  {
    icon: '💻',
    title: 'Multi-platform',
    details:
      'Supports QQ, QQ Guild, WeChat, Telegram, Discord, Feishu, KOOK, DoDo, Miyoushe...',
    link: '/docs/link-bots/adapter-list/',
    linkText: 'Platforms',
  },
  {
    icon: '🤖',
    title: 'Multi-bot',
    details:
      'Compatible with NoneBot2, HoshinoBot, ZeroBot, Koishi, YunzaiBot...',
    link: '/docs/link-bots/adapter-list/',
    linkText: 'Bots',
  },
  {
    icon: '🤝',
    title: 'Sayu Protocol',
    details:
      'Distribute to OneBotV11, V12, Red, etc. via the simple Sayu protocol',
    link: '/docs/code-adapter/protocol/',
    linkText: 'Protocol',
  },
  {
    icon: '🌎',
    title: 'Web Console',
    details:
      'Any plugin can expose its config to the web console with a simple inheritance',
    link: '/docs/started/web-console/',
    linkText: 'How to use',
  },
  {
    icon: '🔌',
    title: 'Unified Plugins',
    details:
      'Highly unified plugins so you do not need many plugins or duplicated ones',
    link: '/docs/install-plugins/plugins-list/',
    linkText: 'Plugin list',
  },
  {
    icon: '🗄',
    title: 'Unified Database',
    details: 'Inherit to get multi-account methods, web console CRUD and more',
    link: '/docs/code-plugins/plugins-data-base/',
    linkText: 'Example',
  },
  {
    icon: '📄',
    title: 'Complete Docs',
    details: 'Installation, configuration, plugins, development — all covered',
    link: '/docs/started/env-check/',
    linkText: 'Read docs',
  },
  {
    icon: '🚩',
    title: 'Open Source',
    details: 'GsCore and supported plugins are open source',
    link: 'https://github.com/Genshin-bots/gsuid_core',
    linkText: 'Star ⭐',
  },
];

const jaFeatures: Feature[] = [
  {
    icon: '💻',
    title: 'マルチプラットフォーム',
    details:
      'QQ、QQギルド、WeChat、Telegram、Discord、Feishu、KOOK、DoDo、米游社...',
    link: '/docs/link-bots/adapter-list/',
    linkText: 'プラットフォーム',
  },
  {
    icon: '🤖',
    title: 'マルチBot',
    details: 'NoneBot2、HoshinoBot、ZeroBot、Koishi、YunzaiBot に対応',
    link: '/docs/link-bots/adapter-list/',
    linkText: 'Bot',
  },
  {
    icon: '🤝',
    title: 'Sayuプロトコル',
    details: 'Sayuプロトコル経由でOneBotV11、V12、Red等に配信',
    link: '/docs/code-adapter/protocol/',
    linkText: 'プロトコル',
  },
  {
    icon: '🌎',
    title: 'Webコンソール',
    details: '簡単な継承でプラグイン設定をWebコンソールで管理',
    link: '/docs/started/web-console/',
    linkText: '使い方',
  },
  {
    icon: '🔌',
    title: '統一プラグイン',
    details: '重複や乱立しない、高度に統合されたプラグイン',
    link: '/docs/install-plugins/plugins-list/',
    linkText: '一覧',
  },
  {
    icon: '🗄',
    title: '統一データベース',
    details: '継承でマルチアカウントやCRUD機能を即座に獲得',
    link: '/docs/code-plugins/plugins-data-base/',
    linkText: '例',
  },
  {
    icon: '📄',
    title: '完全なドキュメント',
    details: 'インストール、設定、プラグイン、開発まですべて網羅',
    link: '/docs/started/env-check/',
    linkText: '読む',
  },
  {
    icon: '🚩',
    title: 'オープンソース',
    details: 'GsCoreおよび対応プラグインはオープンソース',
    link: 'https://github.com/Genshin-bots/gsuid_core',
    linkText: 'Star ⭐',
  },
];

/** 主页「框架运行效果」视差展示——图片放在 public/home/ 下 */
const zhShowcase: Showcase = {
  title: '强大，且易于上手',
  subtitle:
    '几分钟即可部署上手——统一的接口与可视化控制台，让复杂的功能变得简单。',
  playLabel: '点击体验实时演示',
  liveBadge: '实时演示',
  items: [
    {
      img: '/home/dashboard.png',
      embedSrc: hubEmbed('dashboard'),
      alt: '数据看板',
      eyebrow: '数据统计',
      title: '完善的统计模块',
      desc: '内置数据看板，DAU / WAU / MAU、命令调用趋势、活跃用户一目了然，运营状况尽在掌握。',
      points: ['实时关键指标', '月度命令统计', '多维度用户分析'],
    },
    {
      img: '/home/plugins.png',
      embedSrc: hubEmbed('database'),
      alt: '插件数据库',
      eyebrow: '插件数据库',
      title: '统一的插件数据库接口',
      desc: '所有插件共享同一套数据库接口与管理后台，增删改查直接在网页控制台完成，无需各自造轮子。',
      points: ['统一数据访问层', '网页端增删改查', '多账号开箱即用'],
    },
    {
      img: '/home/plugins_config.png',
      embedSrc: hubEmbed('plugins'),
      alt: '插件配置',
      eyebrow: '插件配置',
      title: '统一的插件配置管理',
      desc: '任意插件只需简单继承，配置项即可在控制台集中管理、即改即生效，告别翻找配置文件。',
      points: ['集中式配置面板', '改动即时生效', '类型化配置项'],
    },
    {
      img: '/home/theme.png',
      embedSrc: hubEmbed('themes'),
      alt: '主题设置',
      eyebrow: '个性主题',
      title: '丰富的主题功能',
      desc: '内置多套精美主题，支持自定义背景与界面风格，一键切换，让你的控制台与众不同。',
      points: ['多套内置主题', '自定义背景', '一键切换'],
    },
    {
      img: '/home/ai-memory.png',
      embedSrc: hubEmbed('ai-memory'),
      alt: 'AI 记忆图谱',
      eyebrow: 'AI 能力',
      title: 'AI 记忆图谱',
      desc: '可视化的 AI 记忆系统，将对话、关系与知识沉淀为图谱，让你的 Bot 越用越懂你。',
      points: ['可视化记忆图谱', '长期上下文沉淀', '关系网络洞察'],
    },
    {
      img: '/home/ai-meme.png',
      embedSrc: hubEmbed('ai-meme'),
      alt: '表情管理',
      eyebrow: 'AI 能力',
      title: '智能表情包',
      desc: '内置表情包管理与 AI 表情能力，让对话更有温度，玩梗整活信手拈来。',
      points: ['海量表情管理', 'AI 智能配图', '分类检索'],
    },
  ],
};

const enShowcase: Showcase = {
  title: 'Powerful, yet easy to start',
  subtitle:
    'Up and running in minutes — unified interfaces and a visual console make complex features simple.',
  playLabel: 'Try the live demo',
  liveBadge: 'Live demo',
  items: [
    {
      img: '/home/dashboard.png',
      embedSrc: hubEmbed('dashboard'),
      alt: 'Dashboard',
      eyebrow: 'Analytics',
      title: 'A complete stats module',
      desc: 'A built-in dashboard surfaces DAU / WAU / MAU, command trends and active users at a glance.',
      points: [
        'Live key metrics',
        'Monthly command stats',
        'Multi-dimensional analysis',
      ],
    },
    {
      img: '/home/plugins.png',
      embedSrc: hubEmbed('database'),
      alt: 'Plugin database',
      eyebrow: 'Plugin Database',
      title: 'A unified plugin database API',
      desc: 'Every plugin shares one database interface and admin panel — full CRUD right from the web console.',
      points: [
        'Unified data layer',
        'CRUD from the web',
        'Multi-account out of the box',
      ],
    },
    {
      img: '/home/plugins_config.png',
      embedSrc: hubEmbed('plugins'),
      alt: 'Plugin config',
      eyebrow: 'Plugin Config',
      title: 'Unified plugin configuration',
      desc: "Inherit once and a plugin's settings are managed centrally in the console — edits take effect instantly.",
      points: ['Central config panel', 'Instant apply', 'Typed config items'],
    },
    {
      img: '/home/theme.png',
      embedSrc: hubEmbed('themes'),
      alt: 'Theme settings',
      eyebrow: 'Theming',
      title: 'Rich theming',
      desc: 'Multiple polished themes with custom backgrounds and styles — switch in one click to make the console yours.',
      points: ['Built-in themes', 'Custom backgrounds', 'One-click switch'],
    },
    {
      img: '/home/ai-memory.png',
      embedSrc: hubEmbed('ai-memory'),
      alt: 'AI memory graph',
      eyebrow: 'AI',
      title: 'AI memory graph',
      desc: 'A visual AI memory system distills conversations, relations and knowledge into a graph that grows with use.',
      points: [
        'Visual memory graph',
        'Long-term context',
        'Relationship insights',
      ],
    },
    {
      img: '/home/ai-meme.png',
      embedSrc: hubEmbed('ai-meme'),
      alt: 'Sticker management',
      eyebrow: 'AI',
      title: 'Smart stickers',
      desc: 'Built-in sticker management and AI imagery make conversations warmer and the memes effortless.',
      points: ['Bulk sticker management', 'AI image picks', 'Tag & search'],
    },
  ],
};

const jaShowcase: Showcase = {
  title: 'パワフル、それでいて簡単',
  subtitle:
    '数分でデプロイ完了——統一されたインターフェースと可視化コンソールで、複雑な機能もシンプルに。',
  playLabel: 'ライブデモを体験',
  liveBadge: 'ライブデモ',
  items: [
    {
      img: '/home/dashboard.png',
      embedSrc: hubEmbed('dashboard'),
      alt: 'ダッシュボード',
      eyebrow: '統計',
      title: '充実した統計モジュール',
      desc: 'ダッシュボードに DAU / WAU / MAU、コマンド推移、アクティブユーザーを一目で表示。',
      points: ['リアルタイム指標', '月次コマンド統計', '多次元ユーザー分析'],
    },
    {
      img: '/home/plugins.png',
      embedSrc: hubEmbed('database'),
      alt: 'プラグインデータベース',
      eyebrow: 'プラグインDB',
      title: '統一プラグインDB API',
      desc: '全プラグインが同一のDBインターフェースと管理画面を共有。Webコンソールから直接CRUD。',
      points: ['統一データ層', 'WebからCRUD', 'マルチアカウント対応'],
    },
    {
      img: '/home/plugins_config.png',
      embedSrc: hubEmbed('plugins'),
      alt: 'プラグイン設定',
      eyebrow: 'プラグイン設定',
      title: '統一プラグイン設定管理',
      desc: '簡単な継承で設定をコンソールに集約。変更は即時反映、設定ファイル探しから解放。',
      points: ['集中設定パネル', '即時反映', '型付き設定項目'],
    },
    {
      img: '/home/theme.png',
      embedSrc: hubEmbed('themes'),
      alt: 'テーマ設定',
      eyebrow: 'テーマ',
      title: '豊富なテーマ機能',
      desc: '美しいテーマを多数内蔵。背景やスタイルをカスタマイズし、ワンクリックで切替。',
      points: ['内蔵テーマ多数', 'カスタム背景', 'ワンクリック切替'],
    },
    {
      img: '/home/ai-memory.png',
      embedSrc: hubEmbed('ai-memory'),
      alt: 'AI 記憶グラフ',
      eyebrow: 'AI',
      title: 'AI 記憶グラフ',
      desc: '会話・関係・知識をグラフ化する可視化AI記憶。使うほどBotがあなたを理解。',
      points: ['可視化記憶グラフ', '長期コンテキスト', '関係性の洞察'],
    },
    {
      img: '/home/ai-meme.png',
      embedSrc: hubEmbed('ai-meme'),
      alt: 'スタンプ管理',
      eyebrow: 'AI',
      title: 'スマートスタンプ',
      desc: 'スタンプ管理とAI画像機能を内蔵。会話に温かみを、ネタ作りも思いのまま。',
      points: ['大量スタンプ管理', 'AI画像提案', 'タグ検索'],
    },
  ],
};

const teamMembers: TeamMember[] = [
  {
    name: 'Wuyi',
    title: 'Author',
    avatar: 'https://avatars.githubusercontent.com/u/55526518?v=4',
    link: 'https://github.com/KimigaiiWuyi',
  },
  {
    name: 'baiqwerdvd',
    title: 'Developer',
    avatar: 'https://avatars.githubusercontent.com/u/158065462?v=4',
    link: 'https://github.com/baiqwerdvd',
  },
  {
    name: 'Agnes4m',
    title: 'Developer',
    avatar: 'https://avatars.githubusercontent.com/u/70925546?v=4',
    link: 'https://github.com/Agnes4m',
  },
];

const supportLinks: SupportLink[] = [
  {
    icon: '🐛',
    label: 'GitHub Issues',
    href: 'https://github.com/Genshin-bots/gsuid_core/issues',
  },
  {
    icon: '🐧',
    label: 'Mihomo Bot Group',
    href: 'https://qm.qq.com/q/zLghD5ENva',
  },
];

export function getHomeContent(lang: Language): HomeContent {
  if (lang === 'en') {
    return {
      hero: {
        name: 'Sayu Core',
        text: 'GsCore',
        eyebrow: 'A modern Python Bot framework',
        tagline:
          '💖 One business logic, multiple platforms — write once, run everywhere.',
        actions: [
          {
            text: 'Quick Start',
            link: '/docs/started/install-core/',
            primary: true,
          },
          { text: 'Write Plugin', link: '/docs/code-plugins/start/' },
          { text: 'Introduction', link: '/docs/advance/base-info/' },
        ],
      },
      scrollHint: 'Scroll to explore',
      showcase: enShowcase,
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
    };
  }

  if (lang === 'ja') {
    return {
      hero: {
        name: 'さゆコア',
        text: 'GsCore',
        eyebrow: 'モダンな Python Bot フレームワーク',
        tagline:
          '💖 一つのビジネスロジック、複数のプラットフォーム — 一度書けば、どこでも動く。',
        actions: [
          {
            text: 'クイックスタート',
            link: '/docs/started/install-core/',
            primary: true,
          },
          { text: 'プラグイン開発', link: '/docs/code-plugins/start/' },
          { text: 'はじめに', link: '/docs/advance/base-info/' },
        ],
      },
      scrollHint: 'スクロールして探索',
      showcase: jaShowcase,
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
    };
  }

  // zh-CN (default)
  return {
    hero: {
      name: '早柚核心',
      text: 'GsCore',
      eyebrow: '现代化的 Python Bot 框架',
      tagline: '💖 一套业务逻辑，多个平台支持——一次编写，到处运行。',
      actions: [
        {
          text: '快速开始',
          link: '/docs/started/install-core/',
          primary: true,
        },
        { text: '编写插件', link: '/docs/code-plugins/start/' },
        { text: '简单介绍', link: '/docs/advance/base-info/' },
      ],
    },
    scrollHint: '向下滚动 · 探索更多',
    showcase: zhShowcase,
    featuresTitle: '早柚核心开发优势',
    features: zhFeatures,
    teamTitle: '核心团队',
    teamMembers,
    contributorsTitle: '感谢成员贡献',
    contributorsLabel: '位贡献者',
    contributorsViewAll: '在 GitHub 查看全部',
    supportTitle: '获得帮助/支持',
    supportLinks,
    marquee: marqueeTokens,
  };
}
