// scripts/update-doc-icons.mjs
// 一次性把 content/docs 下所有 mdx 的 frontmatter `icon:` 字段从 FileText/Home
// 替换为按文件名语义选择的 lucide 图标名。
// 设计原则：
//   · 精确字符串替换 `^icon: FileText$` -> `^icon: <NewIcon>$`，只动这一行；
//   · 跳过没有 icon 字段的 index.mdx（folder 入口页，由 meta.json 提供 icon）；
//   · 映射表写死，缺失的文件会被高亮报告，避免静默漏改。
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('content/docs')

// 完整映射表：相对 content/docs 的 posix 路径 -> 目标 lucide 图标名。
// 顶层 index.* 保留原 Home。
const MAP = {
  // started
  'started/env-check.mdx': 'ListChecks',
  'started/install-core.mdx': 'Download',
  'started/start-core.mdx': 'Play',
  'started/docker-core.mdx': 'Container',
  'started/core-config.mdx': 'Settings2',
  'started/secure.mdx': 'ShieldCheck',
  'started/web-console.mdx': 'Monitor',
  // link-bots
  'link-bots/adapter-list.mdx': 'List',
  'link-bots/hoshino-bot.mdx': 'Bot',
  'link-bots/none-bot2.mdx': 'PlugZap',
  // install-plugins
  'install-plugins/install-plugins.mdx': 'PackagePlus',
  'install-plugins/plugins-list.mdx': 'LayoutList',
  // faq
  // (faq/index.mdx 无 icon，跳过)
  // advance
  'advance/ai-config.mdx': 'Brain',
  'advance/base-info.mdx': 'Info',
  'advance/bind-device.mdx': 'Smartphone',
  'advance/core-config.mdx': 'SlidersHorizontal',
  'advance/data-struct.mdx': 'Boxes',
  'advance/database.mdx': 'Database',
  'advance/export-and-import.mdx': 'ArrowRightLeft',
  'advance/http-call.mdx': 'Globe',
  'advance/markdown-template.mdx': 'FileCode',
  'advance/trans-url.mdx': 'Link2',
  // ai-features
  'ai-features/agent.mdx': 'UserCog',
  'ai-features/ai-core-api-for-plugins.mdx': 'Workflow',
  'ai-features/alias.mdx': 'Tags',
  'ai-features/builtin-tools.mdx': 'Wrench',
  'ai-features/examples.mdx': 'BookOpen',
  // ai-features/index.mdx 无 icon，跳过
  'ai-features/knowledge-base.mdx': 'Library',
  'ai-features/mcp.mdx': 'Network',
  'ai-features/skills.mdx': 'Lightbulb',
  'ai-features/tools.mdx': 'Hammer',
  'ai-features/trigger-bridge.mdx': 'GitMerge',
  // code-adapter
  'code-adapter/pack.mdx': 'Boxes',
  'code-adapter/protocol.mdx': 'Cable',
  // code-plugins
  'code-plugins/bot-call.mdx': 'Phone',
  'code-plugins/buttons.mdx': 'MousePointerClick',
  'code-plugins/class.mdx': 'Component',
  'code-plugins/cook-book.mdx': 'ChefHat',
  'code-plugins/env.mdx': 'Variable',
  'code-plugins/exsample.mdx': 'FileCode2',
  'code-plugins/get-data-path.mdx': 'FolderOpen',
  'code-plugins/get-plugins-config.mdx': 'Cog',
  'code-plugins/plugins-config.mdx': 'Settings',
  'code-plugins/plugins-data-base.mdx': 'Database',
  'code-plugins/plugins-help.mdx': 'LifeBuoy',
  'code-plugins/plugins-prefix.mdx': 'Hash',
  'code-plugins/resp.mdx': 'Reply',
  'code-plugins/scheduler.mdx': 'Clock',
  'code-plugins/send-to-master.mdx': 'Send',
  'code-plugins/simple.mdx': 'Sprout',
  'code-plugins/start.mdx': 'Rocket',
  'code-plugins/subscribe.mdx': 'Bell',
  'code-plugins/trigger.mdx': 'Zap',
  // plugins-help
  'plugins-help/arknights-uid.mdx': 'Swords',
  'plugins-help/blue-archive-uid.mdx': 'GraduationCap',
  'plugins-help/cs2-uid.mdx': 'Crosshair',
  'plugins-help/delta-uid.mdx': 'Crosshair',
  'plugins-help/genshin-uid.mdx': 'Mountain',
  'plugins-help/lo-legends-uid.mdx': 'Gamepad2',
  'plugins-help/majsoul-uid.mdx': 'Dice5',
  'plugins-help/star-rail-uid.mdx': 'TrainFront',
  'plugins-help/vauid.mdx': 'Music',
  'plugins-help/wzry-uid.mdx': 'Swords',
  'plugins-help/zz-zero-uid.mdx': 'Zap',
  // sp
  'sp/chat.mdx': 'MessageSquare',
  // index.* 保留 Home（无须改动；脚本会跳过）
}

const updated = []
const skipped = []
const warned = []

for (const [rel, newIcon] of Object.entries(MAP)) {
  const abs = path.join(ROOT, rel)
  let src
  try {
    src = await fs.readFile(abs, 'utf8')
  }
  catch (e) {
    warned.push(`MISSING FILE: ${rel}`)
    continue
  }
  // 只动 frontmatter 内首个 `icon: ...` 行
  const before = src
  const next = src.replace(/^icon:[ \t]+\S+[ \t]*$/m, `icon: ${newIcon}`)
  if (next === before) {
    warned.push(`NO ICON LINE: ${rel}`)
    continue
  }
  await fs.writeFile(abs, next, 'utf8')
  updated.push(`${rel} -> ${newIcon}`)
}

// 报告
console.log(`updated: ${updated.length}`)
for (const u of updated) console.log('  ' + u)
if (warned.length) {
  console.log('\nwarnings:')
  for (const w of warned) console.log('  ' + w)
}
