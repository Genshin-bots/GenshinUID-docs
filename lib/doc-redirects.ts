/**
 * 旧文档路径 → 新信息架构路径（不含语言前缀、不含 /docs 前缀）。
 * postbuild 会为每种语言生成静态 HTML 兼容页。
 *
 * 例：started/install-core → getting-started/install
 * 最终 URL：/<lang>/docs/started/install-core/  → 跳转到 /<lang>/docs/getting-started/install/
 */
export const DOC_REDIRECTS: Record<string, string> = {
  // started
  'started/install-core': 'getting-started/install',
  'started/docker-core': 'getting-started/docker',
  'started/web-console': 'getting-started/webconsole',
  'started/env-check': 'getting-started/environment',

  // link-bots
  'link-bots/adapter-list': 'getting-started/link-bot',
  'link-bots/none-bot2': 'getting-started/nonebot2',
  'link-bots/hoshino-bot': 'getting-started/link-bot',

  // install-plugins
  'install-plugins/install-plugins': 'getting-started/install-plugins',
  'install-plugins/plugins-list': 'guide/plugins-catalog',

  // advance → operators / getting-started
  'advance/base-info': 'getting-started/concepts',
  'advance/core-config': 'operators/core-config-json',
  'advance/ai-config': 'getting-started/enable-ai',
  'advance/database': 'operators/database',
  'advance/data-struct': 'developers/adapters/data-structures',
  'advance/bind-device': 'operators/troubleshooting',
  'advance/trans-url': 'operators/core-config-json',
  'advance/markdown-template': 'developers/adapters/buttons-markdown',
  'advance/http-call': 'operators/config-json',
  'advance/export-and-import': 'operators/upgrade',

  // ai-features → developers/ai-api + guide
  'ai-features': 'developers/ai-api/import-cheatsheet',
  'ai-features/index': 'developers/ai-api/import-cheatsheet',
  'ai-features/ai-core-api-for-plugins': 'developers/ai-api/import-cheatsheet',
  'ai-features/trigger-bridge': 'developers/ai-api/trigger-bridge',
  'ai-features/tools': 'developers/ai-api/ai-tools',
  'ai-features/knowledge-base': 'developers/ai-api/knowledge',
  'ai-features/agent': 'developers/ai-api/create-agent',
  'ai-features/alias': 'developers/ai-api/knowledge',
  'ai-features/mcp': 'developers/ai-api/mcp-search-meme',
  'ai-features/builtin-tools': 'developers/ai-api/builtin-tools',
  'ai-features/skills': 'developers/plugins/ai/skills',
  'ai-features/examples': 'developers/ai-api/examples-faq',

  // code-plugins
  'code-plugins/start': 'developers/plugins/overview',
  'code-plugins/simple': 'developers/plugins/structure',
  'code-plugins/exsample': 'developers/plugins/full-example',
  'code-plugins/cook-book': 'developers/plugins/full-example',
  'code-plugins/env': 'developers/plugins/structure',
  'code-plugins/trigger': 'developers/plugins/triggers',
  'code-plugins/bot-call': 'developers/plugins/messaging',
  'code-plugins/resp': 'developers/plugins/messaging',
  'code-plugins/plugins-config': 'developers/plugins/config',
  'code-plugins/get-plugins-config': 'developers/plugins/config',
  'code-plugins/plugins-data-base': 'developers/plugins/database',
  'code-plugins/scheduler': 'developers/plugins/scheduler',
  'code-plugins/subscribe': 'developers/plugins/scheduler',
  'code-plugins/plugins-help': 'developers/plugins/help',
  'code-plugins/plugins-prefix': 'developers/plugins/structure',
  'code-plugins/get-data-path': 'developers/plugins/utilities',
  'code-plugins/send-to-master': 'developers/plugins/utilities',
  'code-plugins/class': 'developers/plugins/structure',
  'code-plugins/buttons': 'developers/adapters/buttons-markdown',

  // code-adapter
  'code-adapter/protocol': 'developers/adapters/protocol',
  'code-adapter/pack': 'developers/adapters/data-structures',

  // plugins-help stays (guide/plugins-help/*) — optional later remap
  'plugins-help/genshin-uid': 'guide/plugins-help/genshin-uid',
  'plugins-help/star-rail-uid': 'guide/plugins-help/star-rail-uid',
  'plugins-help/arknights-uid': 'guide/plugins-help/arknights-uid',
  'plugins-help/blue-archive-uid': 'guide/plugins-help/blue-archive-uid',
  'plugins-help/wzry-uid': 'guide/plugins-help/wzry-uid',
  'plugins-help/majsoul-uid': 'guide/plugins-help/majsoul-uid',
  'plugins-help/lo-legends-uid': 'guide/plugins-help/lo-legends-uid',
  'plugins-help/zz-zero-uid': 'guide/plugins-help/zz-zero-uid',
  'plugins-help/cs2-uid': 'guide/plugins-help/cs2-uid',
  'plugins-help/delta-uid': 'guide/plugins-help/delta-uid',
  'plugins-help/vauid': 'guide/plugins-help/vauid',
};
