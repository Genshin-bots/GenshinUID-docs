// 将 <details><summary>...</summary>...</details> 块转换为加粗的列表项
// 避免 MDX 严格解析问题

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

function convertDetails(content) {
  // 匹配 <details><summary>TITLE</summary>CONTENT</details>（单行或多行）
  // 使用非贪婪匹配
  return content.replace(
    /<details><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,
    (_, summary, inner) => {
      // 清理内部内容：去除首尾空白
      const trimmedInner = inner.replace(/^\s*\n/, '').replace(/\n\s*$/, '').trim()
      if (!trimmedInner) {
        return `**${summary}**`
      }
      return `**${summary}**\n\n${trimmedInner}`
    },
  )
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
  if (!content.includes('<details>')) continue

  const fixed = convertDetails(content)
  if (fixed !== content) {
    writeFileSync(file, fixed, 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ 转换 ${count} 个文件中的 <details> 块`)
