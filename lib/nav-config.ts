import type { Language } from '@/lib/i18n';

/**
 * 顶部导航的图标设计要点：
 * · 每个 navItem / subItem 必带 `color: string`，是 oklch 字符串
 *   （不是 CSS 变量），由组件直接通过 `style={{ color }}` 写到 svg 上。
 *   走 inline style 是为了**绕过任何 CSS specificity / cascade 问题**
 *   —— 之前试过用 CSS 变量继承 + 工具类，被父级 `text-fd-muted-foreground`
 *   之类更高优先级规则覆盖，icon 全显示成灰色。
 * · 主按钮（Quick Start / Plugin Series / Version）各分一色；
 *   下拉子项按 6 色板循环（与侧边栏 folder/leaf 共享同一套色板）。
 * · icon 名称（`icon` 字段）必须都在 lucide-react `icons` map 里
 *   （见坑 #19）。新增前先 `node -e "console.log('<NAME>' in require('lucide-react').icons)"`
 *   验证为 `true`。
 */

// 6 色板：与侧边栏 folder/leaf 多彩完全一致（见 §2.7.3 / §2.7.4）。
// 亮色 L≈0.58-0.64；暗色 L≈0.74-0.78 提亮（见下方的 DARK_*）。
export const NAV_ACCENT_LIGHT = {
  cyan: 'oklch(0.62 0.16 200)', // 青
  indigo: 'oklch(0.58 0.18 250)', // 靛
  purple: 'oklch(0.60 0.19 300)', // 紫
  azure: 'oklch(0.62 0.14 220)', // 蔚蓝
  teal: 'oklch(0.64 0.13 165)', // 青绿
  violet: 'oklch(0.58 0.18 275)', // 蓝紫
} as const;

export const NAV_ACCENT_DARK = {
  cyan: 'oklch(0.78 0.14 200)',
  indigo: 'oklch(0.74 0.16 250)',
  purple: 'oklch(0.76 0.16 300)',
  azure: 'oklch(0.78 0.13 220)',
  teal: 'oklch(0.78 0.13 165)',
  violet: 'oklch(0.74 0.16 275)',
} as const;

export interface NavSubItem {
  label: string;
  href: string;
  external?: boolean;
  icon: string;
  color: string;
  colorDark: string;
}

export interface NavItem {
  label: string;
  icon: string;
  color: string;
  colorDark: string;
  items: NavSubItem[];
}

export function getNavItems(lang: Language): NavItem[] {
  if (lang === 'en') {
    return [
      {
        label: 'Quick Start',
        icon: 'Rocket',
        color: NAV_ACCENT_LIGHT.azure,
        colorDark: NAV_ACCENT_DARK.azure,
        items: [
          {
            label: 'Install Core',
            href: '/en/docs/getting-started/install/',
            icon: 'Download',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'Docker',
            href: '/en/docs/getting-started/docker/',
            icon: 'Container',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'Link Bot',
            href: '/en/docs/getting-started/link-bot/',
            icon: 'Bot',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
          {
            label: 'NoneBot2 Guide',
            href: '/en/docs/getting-started/nonebot2/',
            icon: 'PlugZap',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'Install Plugins',
            href: '/en/docs/getting-started/install-plugins/',
            icon: 'PackagePlus',
            color: NAV_ACCENT_LIGHT.azure,
            colorDark: NAV_ACCENT_DARK.azure,
          },
          {
            label: 'Bind Account',
            href: '/en/docs/advance/bind-device/',
            icon: 'Smartphone',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'FAQ',
            href: '/en/docs/faq/',
            icon: 'MessageCircleQuestion',
            color: NAV_ACCENT_LIGHT.violet,
            colorDark: NAV_ACCENT_DARK.violet,
          },
          {
            label: 'Write Plugin',
            href: '/en/docs/developers/plugins/overview/',
            icon: 'CodeXml',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'Write Adapter',
            href: '/en/docs/developers/adapters/protocol/',
            icon: 'Cable',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'Online Chat',
            href: '/en/chat/',
            icon: 'MessageSquare',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
        ],
      },
      {
        label: 'Plugin Series',
        icon: 'Sparkles',
        color: NAV_ACCENT_LIGHT.purple,
        colorDark: NAV_ACCENT_DARK.purple,
        items: [
          {
            label: 'GenshinUID',
            href: 'https://github.com/KimigaiiWuyi/GenshinUID',
            external: true,
            icon: 'Mountain',
            color: NAV_ACCENT_LIGHT.azure,
            colorDark: NAV_ACCENT_DARK.azure,
          },
          {
            label: 'StarRailUID',
            href: 'https://github.com/baiqwerdvd/StarRailUID',
            external: true,
            icon: 'TrainFront',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'WzryUID',
            href: 'https://github.com/KimigaiiWuyi/WzryUID',
            external: true,
            icon: 'Gamepad2',
            color: NAV_ACCENT_LIGHT.violet,
            colorDark: NAV_ACCENT_DARK.violet,
          },
          {
            label: 'ArknightsUID',
            href: 'https://github.com/baiqwerdvd/ArknightsUID/',
            external: true,
            icon: 'Swords',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'BlueArchiveUID',
            href: 'https://github.com/KimigaiiWuyi/BlueArchiveUID',
            external: true,
            icon: 'GraduationCap',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'MajsoulUID',
            href: 'https://github.com/KimigaiiWuyi/MajsoulUID',
            external: true,
            icon: 'Dice5',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
          {
            label: 'LOLegendsUID',
            href: 'https://github.com/KimigaiiWuyi/LOLegendsUID',
            external: true,
            icon: 'Joystick',
            color: NAV_ACCENT_LIGHT.azure,
            colorDark: NAV_ACCENT_DARK.azure,
          },
          {
            label: 'ZZZeroUID',
            href: 'https://github.com/ZZZure/ZZZeroUID',
            external: true,
            icon: 'Zap',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'CS2UID',
            href: 'https://github.com/Agnes4m/CS2UID',
            external: true,
            icon: 'Crosshair',
            color: NAV_ACCENT_LIGHT.violet,
            colorDark: NAV_ACCENT_DARK.violet,
          },
          {
            label: 'DeltaUID',
            href: 'https://github.com/Agnes4m/DeltaUID',
            external: true,
            icon: 'Crosshair',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'VAUID',
            href: 'https://github.com/Agnes4m/VAUID',
            external: true,
            icon: 'Music',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'More Plugins',
            href: '/en/docs/guide/plugins-catalog/',
            icon: 'LayoutList',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
        ],
      },
    ];
  }

  if (lang === 'ja') {
    return [
      {
        label: 'クイックスタート',
        icon: 'Rocket',
        color: NAV_ACCENT_LIGHT.azure,
        colorDark: NAV_ACCENT_DARK.azure,
        items: [
          {
            label: 'Coreインストール',
            href: '/ja/docs/getting-started/install/',
            icon: 'Download',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'Docker',
            href: '/ja/docs/getting-started/docker/',
            icon: 'Container',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'Bot連携',
            href: '/ja/docs/getting-started/link-bot/',
            icon: 'Bot',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
          {
            label: 'NoneBot2 ガイド',
            href: '/ja/docs/getting-started/nonebot2/',
            icon: 'PlugZap',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'プラグイン',
            href: '/ja/docs/getting-started/install-plugins/',
            icon: 'PackagePlus',
            color: NAV_ACCENT_LIGHT.azure,
            colorDark: NAV_ACCENT_DARK.azure,
          },
          {
            label: 'アカウント連携',
            href: '/ja/docs/advance/bind-device/',
            icon: 'Smartphone',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'よくある質問',
            href: '/ja/docs/faq/',
            icon: 'MessageCircleQuestion',
            color: NAV_ACCENT_LIGHT.violet,
            colorDark: NAV_ACCENT_DARK.violet,
          },
          {
            label: 'プラグイン開発',
            href: '/ja/docs/developers/plugins/overview/',
            icon: 'CodeXml',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'アダプタ開発',
            href: '/ja/docs/developers/adapters/protocol/',
            icon: 'Cable',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'オンラインチャット',
            href: '/ja/chat/',
            icon: 'MessageSquare',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
        ],
      },
      {
        label: 'プラグインシリーズ',
        icon: 'Sparkles',
        color: NAV_ACCENT_LIGHT.purple,
        colorDark: NAV_ACCENT_DARK.purple,
        items: [
          {
            label: 'GenshinUID',
            href: 'https://github.com/KimigaiiWuyi/GenshinUID',
            external: true,
            icon: 'Mountain',
            color: NAV_ACCENT_LIGHT.azure,
            colorDark: NAV_ACCENT_DARK.azure,
          },
          {
            label: 'StarRailUID',
            href: 'https://github.com/baiqwerdvd/StarRailUID',
            external: true,
            icon: 'TrainFront',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'WzryUID',
            href: 'https://github.com/KimigaiiWuyi/WzryUID',
            external: true,
            icon: 'Gamepad2',
            color: NAV_ACCENT_LIGHT.violet,
            colorDark: NAV_ACCENT_DARK.violet,
          },
          {
            label: 'ArknightsUID',
            href: 'https://github.com/baiqwerdvd/ArknightsUID/',
            external: true,
            icon: 'Swords',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'BlueArchiveUID',
            href: 'https://github.com/KimigaiiWuyi/BlueArchiveUID',
            external: true,
            icon: 'GraduationCap',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'MajsoulUID',
            href: 'https://github.com/KimigaiiWuyi/MajsoulUID',
            external: true,
            icon: 'Dice5',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
          {
            label: 'LOLegendsUID',
            href: 'https://github.com/KimigaiiWuyi/LOLegendsUID',
            external: true,
            icon: 'Joystick',
            color: NAV_ACCENT_LIGHT.azure,
            colorDark: NAV_ACCENT_DARK.azure,
          },
          {
            label: 'ZZZeroUID',
            href: 'https://github.com/ZZZure/ZZZeroUID',
            external: true,
            icon: 'Zap',
            color: NAV_ACCENT_LIGHT.teal,
            colorDark: NAV_ACCENT_DARK.teal,
          },
          {
            label: 'CS2UID',
            href: 'https://github.com/Agnes4m/CS2UID',
            external: true,
            icon: 'Crosshair',
            color: NAV_ACCENT_LIGHT.violet,
            colorDark: NAV_ACCENT_DARK.violet,
          },
          {
            label: 'DeltaUID',
            href: 'https://github.com/Agnes4m/DeltaUID',
            external: true,
            icon: 'Crosshair',
            color: NAV_ACCENT_LIGHT.cyan,
            colorDark: NAV_ACCENT_DARK.cyan,
          },
          {
            label: 'VAUID',
            href: 'https://github.com/Agnes4m/VAUID',
            external: true,
            icon: 'Music',
            color: NAV_ACCENT_LIGHT.indigo,
            colorDark: NAV_ACCENT_DARK.indigo,
          },
          {
            label: 'その他のプラグイン',
            href: '/ja/docs/guide/plugins-catalog/',
            icon: 'LayoutList',
            color: NAV_ACCENT_LIGHT.purple,
            colorDark: NAV_ACCENT_DARK.purple,
          },
        ],
      },
    ];
  }

  // zh-CN
  return [
    {
      label: '快速开始',
      icon: 'Rocket',
      color: NAV_ACCENT_LIGHT.azure,
      colorDark: NAV_ACCENT_DARK.azure,
      items: [
        {
          label: '安装Core',
          href: '/zh-CN/docs/getting-started/install/',
          icon: 'Download',
          color: NAV_ACCENT_LIGHT.cyan,
          colorDark: NAV_ACCENT_DARK.cyan,
        },
        {
          label: '使用Docker运行Core',
          href: '/zh-CN/docs/getting-started/docker/',
          icon: 'Container',
          color: NAV_ACCENT_LIGHT.indigo,
          colorDark: NAV_ACCENT_DARK.indigo,
        },
        {
          label: '链接Bot',
          href: '/zh-CN/docs/getting-started/link-bot/',
          icon: 'Bot',
          color: NAV_ACCENT_LIGHT.purple,
          colorDark: NAV_ACCENT_DARK.purple,
        },
        {
          label: 'NoneBot2 保姆级',
          href: '/zh-CN/docs/getting-started/nonebot2/',
          icon: 'PlugZap',
          color: NAV_ACCENT_LIGHT.teal,
          colorDark: NAV_ACCENT_DARK.teal,
        },
        {
          label: '安装插件',
          href: '/zh-CN/docs/getting-started/install-plugins/',
          icon: 'PackagePlus',
          color: NAV_ACCENT_LIGHT.azure,
          colorDark: NAV_ACCENT_DARK.azure,
        },
        {
          label: '故障排查',
          href: '/zh-CN/docs/operators/troubleshooting/',
          icon: 'LifeBuoy',
          color: NAV_ACCENT_LIGHT.violet,
          colorDark: NAV_ACCENT_DARK.violet,
        },
        {
          label: '绑定账号',
          href: '/zh-CN/docs/advance/bind-device/',
          icon: 'Smartphone',
          color: NAV_ACCENT_LIGHT.teal,
          colorDark: NAV_ACCENT_DARK.teal,
        },
        {
          label: '常见问题',
          href: '/zh-CN/docs/faq/',
          icon: 'MessageCircleQuestion',
          color: NAV_ACCENT_LIGHT.violet,
          colorDark: NAV_ACCENT_DARK.violet,
        },
        {
          label: '编写插件',
          href: '/zh-CN/docs/developers/plugins/overview/',
          icon: 'CodeXml',
          color: NAV_ACCENT_LIGHT.cyan,
          colorDark: NAV_ACCENT_DARK.cyan,
        },
        {
          label: '编写适配器',
          href: '/zh-CN/docs/developers/adapters/protocol/',
          icon: 'Cable',
          color: NAV_ACCENT_LIGHT.indigo,
          colorDark: NAV_ACCENT_DARK.indigo,
        },
        {
          label: '在线聊天室',
          href: '/zh-CN/chat/',
          icon: 'MessageSquare',
          color: NAV_ACCENT_LIGHT.purple,
          colorDark: NAV_ACCENT_DARK.purple,
        },
      ],
    },
    {
      label: '系列插件',
      icon: 'Sparkles',
      color: NAV_ACCENT_LIGHT.purple,
      colorDark: NAV_ACCENT_DARK.purple,
      items: [
        {
          label: 'GenshinUID',
          href: 'https://github.com/KimigaiiWuyi/GenshinUID',
          external: true,
          icon: 'Mountain',
          color: NAV_ACCENT_LIGHT.azure,
          colorDark: NAV_ACCENT_DARK.azure,
        },
        {
          label: 'StarRailUID',
          href: 'https://github.com/baiqwerdvd/StarRailUID',
          external: true,
          icon: 'TrainFront',
          color: NAV_ACCENT_LIGHT.teal,
          colorDark: NAV_ACCENT_DARK.teal,
        },
        {
          label: 'WzryUID',
          href: 'https://github.com/KimigaiiWuyi/WzryUID',
          external: true,
          icon: 'Gamepad2',
          color: NAV_ACCENT_LIGHT.violet,
          colorDark: NAV_ACCENT_DARK.violet,
        },
        {
          label: 'ArknightsUID',
          href: 'https://github.com/baiqwerdvd/ArknightsUID/',
          external: true,
          icon: 'Swords',
          color: NAV_ACCENT_LIGHT.cyan,
          colorDark: NAV_ACCENT_DARK.cyan,
        },
        {
          label: 'BlueArchiveUID',
          href: 'https://github.com/KimigaiiWuyi/BlueArchiveUID',
          external: true,
          icon: 'GraduationCap',
          color: NAV_ACCENT_LIGHT.indigo,
          colorDark: NAV_ACCENT_DARK.indigo,
        },
        {
          label: 'MajsoulUID',
          href: 'https://github.com/KimigaiiWuyi/MajsoulUID',
          external: true,
          icon: 'Dice5',
          color: NAV_ACCENT_LIGHT.purple,
          colorDark: NAV_ACCENT_DARK.purple,
        },
        {
          label: 'LOLegendsUID',
          href: 'https://github.com/KimigaiiWuyi/LOLegendsUID',
          external: true,
          icon: 'Joystick',
          color: NAV_ACCENT_LIGHT.azure,
          colorDark: NAV_ACCENT_DARK.azure,
        },
        {
          label: 'ZZZeroUID',
          href: 'https://github.com/ZZZure/ZZZeroUID',
          external: true,
          icon: 'Zap',
          color: NAV_ACCENT_LIGHT.teal,
          colorDark: NAV_ACCENT_DARK.teal,
        },
        {
          label: 'CS2UID',
          href: 'https://github.com/Agnes4m/CS2UID',
          external: true,
          icon: 'Crosshair',
          color: NAV_ACCENT_LIGHT.violet,
          colorDark: NAV_ACCENT_DARK.violet,
        },
        {
          label: 'DeltaUID',
          href: 'https://github.com/Agnes4m/DeltaUID',
          external: true,
          icon: 'Crosshair',
          color: NAV_ACCENT_LIGHT.cyan,
          colorDark: NAV_ACCENT_DARK.cyan,
        },
        {
          label: 'VAUID',
          href: 'https://github.com/Agnes4m/VAUID',
          external: true,
          icon: 'Music',
          color: NAV_ACCENT_LIGHT.indigo,
          colorDark: NAV_ACCENT_DARK.indigo,
        },
        {
          label: '更多插件',
          href: '/zh-CN/docs/guide/plugins-catalog/',
          icon: 'LayoutList',
          color: NAV_ACCENT_LIGHT.purple,
          colorDark: NAV_ACCENT_DARK.purple,
        },
      ],
    },
  ];
}

export function getVersionNavItems(
  version: string,
  lang: Language,
): NavSubItem[] {
  if (lang === 'en') {
    return [
      {
        label: 'Docs Repo',
        href: 'https://github.com/Genshin-bots/GenshinUID-docs',
        external: true,
        icon: 'BookOpen',
        color: NAV_ACCENT_LIGHT.cyan,
        colorDark: NAV_ACCENT_DARK.cyan,
      },
      {
        label: 'GsCore Repo',
        href: 'https://github.com/Genshin-bots/gsuid_core',
        external: true,
        icon: 'Box',
        color: NAV_ACCENT_LIGHT.indigo,
        colorDark: NAV_ACCENT_DARK.indigo,
      },
      {
        label: 'QQ Group: Mihomo Group',
        href: 'https://qm.qq.com/cgi-bin/qm/qr?k=d1oNQ1wePPbCkhPbP3vZN-DsXDD0hG61&authKey=0PdxKz%2BMbWgy7kwcF9OB%2B%2BrgOWKuREFG6tgJuWpr%2BzN8gtBTlGR6wDbk6N0W3bL1&noverify=0&group_code=929275476',
        external: true,
        icon: 'MessagesSquare',
        color: NAV_ACCENT_LIGHT.purple,
        colorDark: NAV_ACCENT_DARK.purple,
      },
    ];
  }
  if (lang === 'ja') {
    return [
      {
        label: 'ドキュメント',
        href: 'https://github.com/Genshin-bots/GenshinUID-docs',
        external: true,
        icon: 'BookOpen',
        color: NAV_ACCENT_LIGHT.cyan,
        colorDark: NAV_ACCENT_DARK.cyan,
      },
      {
        label: 'GsCore',
        href: 'https://github.com/Genshin-bots/gsuid_core',
        external: true,
        icon: 'Box',
        color: NAV_ACCENT_LIGHT.indigo,
        colorDark: NAV_ACCENT_DARK.indigo,
      },
      {
        label: 'QQグループ: Mihomo Group',
        href: 'https://qm.qq.com/cgi-bin/qm/qr?k=d1oNQ1wePPbCkhPbP3vZN-DsXDD0hG61&authKey=0PdxKz%2BMbWgy7kwcF9OB%2B%2BrgOWKuREFG6tgJuWpr%2BzN8gtBTlGR6wDbk6N0W3bL1&noverify=0&group_code=929275476',
        external: true,
        icon: 'MessagesSquare',
        color: NAV_ACCENT_LIGHT.purple,
        colorDark: NAV_ACCENT_DARK.purple,
      },
    ];
  }
  return [
    {
      label: '文档地址',
      href: 'https://github.com/Genshin-bots/GenshinUID-docs',
      external: true,
      icon: 'BookOpen',
      color: NAV_ACCENT_LIGHT.cyan,
      colorDark: NAV_ACCENT_DARK.cyan,
    },
    {
      label: 'GsCore地址',
      href: 'https://github.com/Genshin-bots/gsuid_core',
      external: true,
      icon: 'Box',
      color: NAV_ACCENT_LIGHT.indigo,
      colorDark: NAV_ACCENT_DARK.indigo,
    },
    {
      label: 'QQ群: Mihomo Group',
      href: 'https://qm.qq.com/cgi-bin/qm/qr?k=d1oNQ1wePPbCkhPbP3vZN-DsXDD0hG61&authKey=0PdxKz%2BMbWgy7kwcF9OB%2B%2BrgOWKuREFG6tgJuWpr%2BzN8gtBTlGR6wDbk6N0W3bL1&noverify=0&group_code=929275476',
      external: true,
      icon: 'MessagesSquare',
      color: NAV_ACCENT_LIGHT.purple,
      colorDark: NAV_ACCENT_DARK.purple,
    },
  ];
}

export interface LanguageOption {
  code: Language;
  name: string;
  href: (pathname: string) => string;
}

export function getLanguageOptions(): LanguageOption[] {
  return [
    {
      code: 'zh-CN',
      name: '简体中文',
      href: (pathname) => {
        // 替换 /zh-CN/、/en/、/ja/ 为 /zh-CN/
        return pathname.replace(/^\/(zh-CN|en|ja)/, '/zh-CN') || '/zh-CN/';
      },
    },
    {
      code: 'en',
      name: 'English',
      href: (pathname) => {
        return pathname.replace(/^\/(zh-CN|en|ja)/, '/en') || '/en/';
      },
    },
    {
      code: 'ja',
      name: '日本語',
      href: (pathname) => {
        return pathname.replace(/^\/(zh-CN|en|ja)/, '/ja') || '/ja/';
      },
    },
  ];
}
