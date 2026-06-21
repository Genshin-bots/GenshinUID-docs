// 转义 MDX 文件中的 {xxx} 文本占位符（不是真正的 JSX 表达式）
// MDX 会把 {xxx} 当成 JSX 表达式解析，但很多文件里只是文本

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

// 已知的代码块边界
function isInCodeBlock(lines, lineIdx) {
  let inFence = false
  for (let i = 0; i < lineIdx; i++) {
    const t = lines[i].trim()
    if (t.startsWith('```')) {
      inFence = !inFence
    }
  }
  return inFence
}

// 已知的导入语句边界
function isInImport(lines, lineIdx) {
  let inImport = false
  for (let i = 0; i <= lineIdx; i++) {
    if (lines[i].startsWith('import ')) return true
  }
  return false
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
  const lines = content.split('\n')
  let changed = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // 跳过代码块
    if (isInCodeBlock(lines, i)) continue
    // 跳过 import 语句行
    if (line.trim().startsWith('import ')) continue
    // 跳过纯 JSX 行（开头有 <）
    if (line.trim().startsWith('<')) continue

    // 匹配 {xxx} 模式（包含中文、字母、数字、下划线、点）
    if (line.match(/\{[a-zA-Z_一-龥][\w.一-龥]*\}/)) {
      // 转义为 `{}`
      const newLine = line.replace(/\{([a-zA-Z_一-龥][\w.一-龥]*)\}/g, '`{$1}`')
      if (newLine !== line) {
        lines[i] = newLine
        changed = true
      }
    }
  }

  if (changed) {
    writeFileSync(file, lines.join('\n'), 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ 转义 ${count} 个文件`)
