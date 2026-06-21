// 修复 ::: 容器的栈式闭合问题
// 用栈式匹配确保 ::: 块正确闭合

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

function fixContainers(content) {
  const lines = content.split('\n')
  const result = []
  const stack = [] // 'callout' | 'details'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    const calloutMatch = trimmed.match(/^:::\s*(tip|warning|danger|info|success|idea)(?:\s+(.+))?\s*$/)
    const detailsMatch = trimmed.match(/^:::\s*details(?:\s+(.+))?\s*$/)
    const closeMatch = trimmed.match(/^:::\s*$/)

    if (calloutMatch) {
      const type = calloutMatch[1]
      const title = calloutMatch[2]
      const map = { tip: 'info', warning: 'warn', danger: 'error', info: 'info', success: 'success', idea: 'idea' }
      result.push(`<Callout type="${map[type] || type}" title=${JSON.stringify(title || '')}>`)
      stack.push('callout')
    }
    else if (detailsMatch) {
      const title = detailsMatch[1]
      result.push('<details>')
      if (title) result.push(`<summary>${title}</summary>`)
      stack.push('details')
    }
    else if (closeMatch) {
      const top = stack.pop()
      if (top === 'callout') result.push('</Callout>')
      else if (top === 'details') result.push('</details>')
      else result.push(':::')
    }
    else {
      result.push(line)
    }
  }

  while (stack.length > 0) {
    const top = stack.pop()
    if (top === 'callout') result.push('</Callout>')
    else if (top === 'details') result.push('</details>')
  }

  return result.join('\n')
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
  if (!content.includes(':::')) continue

  const fixed = fixContainers(content)
  if (fixed !== content) {
    writeFileSync(file, fixed, 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ 修复 ${count} 个文件`)
