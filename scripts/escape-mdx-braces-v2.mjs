// 全面转义 MDX 中的 {xxx} 占位符（包括变体）
// 处理：{var}、{x.y}、{X}、{中文}、{bot目录} 等

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (entry.endsWith('.mdx')) yield p
  }
}

// 检测一行是否在代码块内
function detectCodeRanges(lines) {
  const inCode = new Array(lines.length).fill(false)
  let inFence = false
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t.startsWith('```') || t.startsWith('~~~')) {
      inFence = !inFence
      inCode[i] = true
      continue
    }
    if (inFence) inCode[i] = true
  }
  return inCode
}

// 转义 Markdown 行内的 {xxx} 占位符（不在代码块内）
// 把 {xxx} 替换为 `xxx`（去掉花括号）
function escapeLine(line) {
  // 匹配 {xxx} 其中 xxx 不含 { } [ ]  =
  return line.replace(/\{([a-zA-Z_一-龥][\w.一-龥]*)\}/g, '`$1`')
}

let count = 0
for (const file of walk(TARGET_DIR)) {
  const content = readFileSync(file, 'utf-8')
  const lines = content.split('\n')
  const inCode = detectCodeRanges(lines)
  let changed = false

  for (let i = 0; i < lines.length; i++) {
    if (inCode[i]) continue
    const line = lines[i]
    // 跳过 import 语句
    if (line.trim().startsWith('import ')) continue
    // 跳过 JSX 开头行
    if (line.trim().startsWith('<')) continue

    // 检查是否包含 {xxx} 模式
    if (line.match(/\{[a-zA-Z_一-龥][\w.一-龥]*\}/)) {
      const newLine = escapeLine(line)
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
