// 给所有使用自定义组件的 MDX 文件添加 import 语句
// 解决编译输出引用未定义全局变量的问题

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

const COMPONENTS = {
  Badge: '@/components/Badge',
  Card: '@/components/Card',
  NavCard: '@/components/NavCard',
  DataPanel: '@/components/DataPanel',
  PageInfo: '@/components/PageInfo',
  VideoLink: '@/components/VideoLink',
  CopyRight: '@/components/CopyRight',
  Contact: '@/components/Contact',
  ChatLayout: '@/components/chat/ChatLayout',
  HomeContributors: '@/components/HomeContributors',
  Members: '@/components/Members',
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (entry.endsWith('.mdx')) yield p
  }
}

let count = 0
for (const file of walk(TARGET_DIR)) {
  const content = readFileSync(file, 'utf-8')
  const used = []
  for (const [name] of Object.entries(COMPONENTS)) {
    // 匹配 <Name (后续内容)/>  或 <Name> 或 </Name>
    const re = new RegExp(`<${name}[\\s/>]|<\\/${name}>`, 'g')
    if (re.test(content)) used.push(name)
  }
  if (used.length === 0) continue

  // 检查是否已经有 import
  const lines = content.split('\n')
  let inFrontmatter = false
  let frontmatterEnd = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (!inFrontmatter) inFrontmatter = true
      else { frontmatterEnd = i; break }
    }
  }

  // 收集已有的 import
  const existingImports = new Set()
  for (const line of lines) {
    const m = line.match(/^import\s+\{([^}]+)\}\s+from\s+/)
    if (m) {
      for (const name of m[1].split(',')) {
        existingImports.add(name.trim())
      }
    }
  }

  const toAdd = used.filter(n => !existingImports.has(n))
  if (toAdd.length === 0) continue

  // 按名称分组（不同路径可能需要不同 import）
  const importLines = []
  for (const name of toAdd) {
    importLines.push(`import { ${name} } from '${COMPONENTS[name]}'`)
  }

  // 在 frontmatter 后插入 import
  const insertAt = frontmatterEnd + 1
  const newLines = [
    ...lines.slice(0, insertAt),
    '',
    ...importLines,
    '',
    ...lines.slice(insertAt),
  ]
  writeFileSync(file, newLines.join('\n'), 'utf-8')
  count++
  console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')} (added: ${toAdd.join(', ')})`)
}

console.log(`\n✅ 处理 ${count} 个文件`)
