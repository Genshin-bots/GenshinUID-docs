import type { Language } from '@/lib/i18n'

export interface NavSubItem {
  label: string
  href: string
  external?: boolean
}

export interface NavItem {
  label: string
  items: NavSubItem[]
}

export function getNavItems(lang: Language): NavItem[] {
  if (lang === 'en') {
    return [
      {
        label: '🎉 Quick Start',
        items: [
          { label: '⭐ Install Core', href: '/en/docs/started/install-core/' },
          { label: '🐳 Docker', href: '/en/docs/started/docker-core/' },
          { label: '🤖 Link Bot', href: '/en/docs/link-bots/adapter-list/' },
          { label: '🔧 Install Plugins', href: '/en/docs/install-plugins/install-plugins/' },
          { label: '✅ Bind Account', href: '/en/docs/advance/bind-device/' },
          { label: '💫 FAQ', href: '/en/docs/faq/' },
          { label: '💻 Write Plugin', href: '/en/docs/code-plugins/start/' },
          { label: '🧐 Write Adapter', href: '/en/docs/code-adapter/pack/' },
          { label: '🔰 Online Chat', href: '/en/chat/' },
        ],
      },
      {
        label: '💖 Plugin Series',
        items: [
          { label: '✨ GenshinUID', href: 'https://github.com/KimigaiiWuyi/GenshinUID', external: true },
          { label: '🚅 StarRailUID', href: 'https://github.com/baiqwerdvd/StarRailUID', external: true },
          { label: '🎮 WzryUID', href: 'https://github.com/KimigaiiWuyi/WzryUID', external: true },
          { label: '🛶 ArknightsUID', href: 'https://github.com/baiqwerdvd/ArknightsUID/', external: true },
          { label: '🏫 BlueArchiveUID', href: 'https://github.com/KimigaiiWuyi/BlueArchiveUID', external: true },
          { label: '🀄 MajsoulUID', href: 'https://github.com/KimigaiiWuyi/MajsoulUID', external: true },
          { label: '🦸‍♂️ LOLegendsUID', href: 'https://github.com/KimigaiiWuyi/LOLegendsUID', external: true },
          { label: '🧿 ZZZeroUID', href: 'https://github.com/ZZZure/ZZZeroUID', external: true },
          { label: '🎯 CS2UID', href: 'https://github.com/Agnes4m/CS2UID', external: true },
          { label: '🪂 DeltaUID', href: 'https://github.com/Agnes4m/DeltaUID', external: true },
          { label: '🇻🇦 VAUID', href: 'https://github.com/Agnes4m/VAUID', external: true },
          { label: '⏩ More Plugins', href: '/en/docs/install-plugins/plugins-list/' },
        ],
      },
    ]
  }

  if (lang === 'ja') {
    return [
      {
        label: '🎉 クイックスタート',
        items: [
          { label: '⭐ Coreインストール', href: '/ja/docs/started/install-core/' },
          { label: '🐳 Docker', href: '/ja/docs/started/docker-core/' },
          { label: '🤖 Bot連携', href: '/ja/docs/link-bots/adapter-list/' },
          { label: '🔧 プラグイン', href: '/ja/docs/install-plugins/install-plugins/' },
          { label: '✅ アカウント連携', href: '/ja/docs/advance/bind-device/' },
          { label: '💫 よくある質問', href: '/ja/docs/faq/' },
          { label: '💻 プラグイン開発', href: '/ja/docs/code-plugins/start/' },
          { label: '🧐 アダプタ開発', href: '/ja/docs/code-adapter/pack/' },
          { label: '🔰 オンラインチャット', href: '/ja/chat/' },
        ],
      },
      {
        label: '💖 プラグインシリーズ',
        items: [
          { label: '✨ GenshinUID', href: 'https://github.com/KimigaiiWuyi/GenshinUID', external: true },
          { label: '🚅 StarRailUID', href: 'https://github.com/baiqwerdvd/StarRailUID', external: true },
          { label: '🎮 WzryUID', href: 'https://github.com/KimigaiiWuyi/WzryUID', external: true },
          { label: '🛶 ArknightsUID', href: 'https://github.com/baiqwerdvd/ArknightsUID/', external: true },
          { label: '🏫 BlueArchiveUID', href: 'https://github.com/KimigaiiWuyi/BlueArchiveUID', external: true },
          { label: '🀄 MajsoulUID', href: 'https://github.com/KimigaiiWuyi/MajsoulUID', external: true },
          { label: '🦸‍♂️ LOLegendsUID', href: 'https://github.com/KimigaiiWuyi/LOLegendsUID', external: true },
          { label: '🧿 ZZZeroUID', href: 'https://github.com/ZZZure/ZZZeroUID', external: true },
          { label: '🎯 CS2UID', href: 'https://github.com/Agnes4m/CS2UID', external: true },
          { label: '🪂 DeltaUID', href: 'https://github.com/Agnes4m/DeltaUID', external: true },
          { label: '🇻🇦 VAUID', href: 'https://github.com/Agnes4m/VAUID', external: true },
          { label: '⏩ その他のプラグイン', href: '/ja/docs/install-plugins/plugins-list/' },
        ],
      },
    ]
  }

  // zh-CN
  return [
    {
      label: '🎉 快速开始',
      items: [
        { label: '⭐ 安装Core', href: '/zh-CN/docs/started/install-core/' },
        { label: '🐳 使用Docker运行Core', href: '/zh-CN/docs/started/docker-core/' },
        { label: '🤖 链接Bot', href: '/zh-CN/docs/link-bots/adapter-list/' },
        { label: '🔧 安装插件', href: '/zh-CN/docs/install-plugins/install-plugins/' },
        { label: '✅ 绑定账号', href: '/zh-CN/docs/advance/bind-device/' },
        { label: '💫 常见问题', href: '/zh-CN/docs/faq/' },
        { label: '💻 编写插件', href: '/zh-CN/docs/code-plugins/start/' },
        { label: '🧐 编写适配器', href: '/zh-CN/docs/code-adapter/pack/' },
        { label: '🔰 在线聊天室', href: '/zh-CN/chat/' },
      ],
    },
    {
      label: '💖 系列插件',
      items: [
        { label: '✨ GenshinUID', href: 'https://github.com/KimigaiiWuyi/GenshinUID', external: true },
        { label: '🚅 StarRailUID', href: 'https://github.com/baiqwerdvd/StarRailUID', external: true },
        { label: '🎮 WzryUID', href: 'https://github.com/KimigaiiWuyi/WzryUID', external: true },
        { label: '🛶 ArknightsUID', href: 'https://github.com/baiqwerdvd/ArknightsUID/', external: true },
        { label: '🏫 BlueArchiveUID', href: 'https://github.com/KimigaiiWuyi/BlueArchiveUID', external: true },
        { label: '🀄 MajsoulUID', href: 'https://github.com/KimigaiiWuyi/MajsoulUID', external: true },
        { label: '🦸‍♂️ LOLegendsUID', href: 'https://github.com/KimigaiiWuyi/LOLegendsUID', external: true },
        { label: '🧿 ZZZeroUID', href: 'https://github.com/ZZZure/ZZZeroUID', external: true },
        { label: '🎯 CS2UID', href: 'https://github.com/Agnes4m/CS2UID', external: true },
        { label: '🪂 DeltaUID', href: 'https://github.com/Agnes4m/DeltaUID', external: true },
        { label: '🇻🇦 VAUID', href: 'https://github.com/Agnes4m/VAUID', external: true },
        { label: '⏩ 更多插件', href: '/zh-CN/docs/install-plugins/plugins-list/' },
      ],
    },
  ]
}

export function getVersionNavItems(version: string, lang: Language): NavSubItem[] {
  if (lang === 'en') {
    return [
      { label: '📝 Docs Repo', href: 'https://github.com/Genshin-bots/GenshinUID-docs', external: true },
      { label: '📦️ GsCore Repo', href: 'https://github.com/Genshin-bots/gsuid_core', external: true },
      { label: '🐧 QQ Group: Mihomo Group', href: 'https://qm.qq.com/cgi-bin/qm/qr?k=d1oNQ1wePPbCkhPbP3vZN-DsXDD0hG61&authKey=0PdxKz%2BMbWgy7kwcF9OB%2B%2BrgOWKuREFG6tgJuWpr%2BzN8gtBTlGR6wDbk6N0W3bL1&noverify=0&group_code=929275476', external: true },
    ]
  }
  if (lang === 'ja') {
    return [
      { label: '📝 ドキュメント', href: 'https://github.com/Genshin-bots/GenshinUID-docs', external: true },
      { label: '📦️ GsCore', href: 'https://github.com/Genshin-bots/gsuid_core', external: true },
      { label: '🐧 QQグループ: Mihomo Group', href: 'https://qm.qq.com/cgi-bin/qm/qr?k=d1oNQ1wePPbCkhPbP3vZN-DsXDD0hG61&authKey=0PdxKz%2BMbWgy7kwcF9OB%2B%2BrgOWKuREFG6tgJuWpr%2BzN8gtBTlGR6wDbk6N0W3bL1&noverify=0&group_code=929275476', external: true },
    ]
  }
  return [
    { label: '📝 文档地址', href: 'https://github.com/Genshin-bots/GenshinUID-docs', external: true },
    { label: '📦️ GsCore地址', href: 'https://github.com/Genshin-bots/gsuid_core', external: true },
    { label: '🐧 QQ群: Mihomo Group', href: 'https://qm.qq.com/cgi-bin/qm/qr?k=d1oNQ1wePPbCkhPbP3vZN-DsXDD0hG61&authKey=0PdxKz%2BMbWgy7kwcF9OB%2B%2BrgOWKuREFG6tgJuWpr%2BzN8gtBTlGR6wDbk6N0W3bL1&noverify=0&group_code=929275476', external: true },
  ]
}

export interface LanguageOption {
  code: Language
  name: string
  href: (pathname: string) => string
}

export function getLanguageOptions(): LanguageOption[] {
  return [
    {
      code: 'zh-CN',
      name: '简体中文',
      href: pathname => {
        // 替换 /zh-CN/、/en/、/ja/ 为 /zh-CN/
        return pathname.replace(/^\/(zh-CN|en|ja)/, '/zh-CN') || '/zh-CN/'
      },
    },
    {
      code: 'en',
      name: 'English',
      href: pathname => {
        return pathname.replace(/^\/(zh-CN|en|ja)/, '/en') || '/en/'
      },
    },
    {
      code: 'ja',
      name: '日本語',
      href: pathname => {
        return pathname.replace(/^\/(zh-CN|en|ja)/, '/ja') || '/ja/'
      },
    },
  ]
}
