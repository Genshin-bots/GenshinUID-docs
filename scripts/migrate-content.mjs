// Content migration script: VitePress markdown → Fumadocs MDX
// Usage: node scripts/migrate-content.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs'
import { resolve, join, relative, dirname, basename, extname } from 'node:path'

const SOURCE_DIR = resolve(process.cwd(), 'docs')
const TARGET_DIR = resolve(process.cwd(), 'content/docs')

// Section titles for meta.json
const SECTION_META = {
  'Started': { title: '快速开始', icon: 'Rocket', pages: ['env-check', 'install-core', 'start-core', 'docker-core', 'core-config', 'secure', 'web-console'] },
  'LinkBots': { title: '链接支持 Bot', icon: 'Bot', pages: ['none-bot2', 'hoshino-bot', 'adapter-list'] },
  'InstallPlugins': { title: '安装插件', icon: 'Package', pages: ['install-plugins', 'plugins-list'] },
  'FAQ': { title: '常见问题', icon: 'HelpCircle', pages: ['index'] },
  'Extra': { title: '额外', icon: 'Plus', pages: ['add-ck', 'faq', 'resource-download'] },
  'Advance': { title: '进阶介绍', icon: 'TrendingUp', pages: ['ai-config', 'base-info', 'bind-device', 'core-config', 'data-struct', 'database', 'export-and-import', 'http-call', 'markdown-template', 'trans-url'] },
  'AIFeatures': { title: 'AI 功能', icon: 'Sparkles', pages: ['index', 'ai-core-api-for-plugins', 'trigger-bridge', 'tools', 'knowledge-base', 'agent', 'alias', 'mcp', 'builtin-tools', 'skills', 'examples'] },
  'CodePlugins': { title: '编写插件', icon: 'Code', pages: ['start', 'cook-book', 'env', 'simple', 'exsample', 'scheduler', 'plugins-prefix', 'get-data-path', 'plugins-config', 'get-plugins-config', 'plugins-data-base', 'resp', 'plugins-help', 'subscribe', 'trigger', 'bot-call', 'send-to-master', 'buttons', 'class'] },
  'CodeAdapter': { title: '编写适配器', icon: 'Plug', pages: ['protocol', 'pack'] },
  'PluginsHelp': { title: '插件帮助', icon: 'Puzzle', pages: ['genshinuid', 'star-rail-uid', 'arknights-uid', 'blue-archive-uid', 'wzry-uid', 'majsoul-uid', 'lo-legends-uid', 'zz-zero-uid', 'cs2-uid', 'delta-uid', 'va-uid'] },
  'SP': { title: '特别', icon: 'Star', pages: ['chat'] },
}

// PascalCase → kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

// Extract H1 title from markdown
function extractTitle(content) {
  const match = content.match(/^#\s+(.+?)(?:\s*<.+)?$/m)
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim()
  }
  return null
}

// Extract description (first paragraph after H1)
function extractDescription(content) {
  const lines = content.split('\n')
  let foundH1 = false
  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundH1 = true
      continue
    }
    if (foundH1 && line.trim() && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('<')) {
      return line.trim().slice(0, 200)
    }
  }
  return ''
}

// Convert Vue-style components to MDX/React
function convertVueToReact(content) {
  let result = content

  // <Component :prop="value" /> → <Component prop="value" /> or <Component prop={value} />
  // Simple :text="literal" → text="literal"
  result = result.replace(/<(\w+)\s+:([\w-]+)="([^"]+)"\s*\/>/g, '<$1 $2="$3" />')
  result = result.replace(/<(\w+)\s+:([\w-]+)="([^"]+)"\s*>/g, '<$1 $2="$3">')

  // <Contact/> - these are registered in mdx.tsx, should work

  // ::: tip → <Callout type="info">
  result = result.replace(/^:::\s*tip\s*$/gm, '<Callout type="info">')
  result = result.replace(/^:::\s*warning\s*$/gm, '<Callout type="warn">')
  result = result.replace(/^:::\s*danger\s*$/gm, '<Callout type="error">')
  result = result.replace(/^:::\s*info\s*$/gm, '<Callout type="info">')
  result = result.replace(/^:::\s*success\s*$/gm, '<Callout type="success">')
  result = result.replace(/^:::\s*idea\s*$/gm, '<Callout type="idea">')

  // ::: details Title (multi-line block) - convert to details/summary
  result = result.replace(/^:::\s*details\s+(.+)$/gm, '<details><summary>$1</summary>')
  // Or ::: details (no title)
  result = result.replace(/^:::\s*details\s*$/gm, '<details>')

  // :::  → </details> or </Callout>
  result = result.replace(/^:::\s*$/gm, function (match, offset, str) {
    // Determine if it's closing a callout or details
    // Heuristic: check what's the last opened tag
    const before = str.substring(0, offset)
    if (before.match(/<details>\s*$/)) {
      return '</details>'
    }
    if (before.match(/<Callout[^>]*>\s*$/)) {
      return '</Callout>'
    }
    return ':::'
  })

  return result
}

// Add frontmatter to a markdown file
function addFrontmatter(content, title, description, icon) {
  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `icon: ${icon || 'FileText'}`,
    '---',
    '',
  ].join('\n')
  return fm + content
}

function migrateFile(srcPath, destPath, icon) {
  let content = readFileSync(srcPath, 'utf-8')
  const title = extractTitle(content) || basename(srcPath, '.md')
  const description = extractDescription(content)

  content = convertVueToReact(content)
  content = addFrontmatter(content, title, description, icon)

  mkdirSync(dirname(destPath), { recursive: true })
  writeFileSync(destPath, content, 'utf-8')
  console.log(`✓ ${relative(process.cwd(), srcPath)} → ${relative(process.cwd(), destPath)}`)
}

function createMetaJson(folderPath, sectionName) {
  const meta = SECTION_META[sectionName]
  if (!meta) {
    console.warn(`No meta for section: ${sectionName}`)
    return
  }
  const metaPath = join(folderPath, 'meta.json')
  writeFileSync(
    metaPath,
    JSON.stringify({ title: meta.title, icon: meta.icon, pages: meta.pages }, null, 2) + '\n',
    'utf-8',
  )
  console.log(`✓ ${relative(process.cwd(), metaPath)}`)
}

function processDirectory(srcFolder, destFolder, sectionName) {
  if (!existsSync(srcFolder)) return

  mkdirSync(destFolder, { recursive: true })
  createMetaJson(destFolder, sectionName)

  const items = readdirSync(srcFolder)
  for (const item of items) {
    const srcPath = join(srcFolder, item)
    const stat = statSync(srcPath)
    if (stat.isFile() && item.endsWith('.md')) {
      const baseName = basename(item, '.md')
      let newName
      // Map specific filenames
      if (baseName === 'index') {
        newName = 'index.mdx'
      }
      else {
        newName = `${toKebabCase(baseName)}.mdx`
      }
      const destPath = join(destFolder, newName)
      migrateFile(srcPath, destPath)
    }
  }
}

function main() {
  console.log('🚀 开始迁移内容...\n')

  if (existsSync(TARGET_DIR)) {
    console.log(`清理 ${relative(process.cwd(), TARGET_DIR)} ...`)
    rmSync(TARGET_DIR, { recursive: true, force: true })
  }
  mkdirSync(TARGET_DIR, { recursive: true })

  // Process each section
  for (const [sectionName, meta] of Object.entries(SECTION_META)) {
    const srcFolder = join(SOURCE_DIR, sectionName)
    const destFolder = join(TARGET_DIR, toKebabCase(sectionName))
    console.log(`\n📁 ${sectionName} → ${relative(process.cwd(), destFolder)}/`)
    processDirectory(srcFolder, destFolder, sectionName)
  }

  // Root meta.json
  const rootMeta = {
    title: '早柚核心文档',
    description: '安装早柚核心、了解早柚协议、编写GsCore插件',
    icon: 'Home',
    pages: [
      'index',
      ...Object.keys(SECTION_META).map(s => toKebabCase(s)),
    ],
  }
  writeFileSync(
    join(TARGET_DIR, 'meta.json'),
    JSON.stringify(rootMeta, null, 2) + '\n',
    'utf-8',
  )
  console.log(`\n✓ ${relative(process.cwd(), join(TARGET_DIR, 'meta.json'))}`)

  console.log('\n✅ 迁移完成!')
}

main()
