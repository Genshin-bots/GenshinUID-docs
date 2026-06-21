// 修复剩余问题：ChatMessage/ChatPanel、env 语言、协议列表

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

function fixAll(content) {
  let result = content

  // 移除 <ChatMessage ...>...</ChatMessage> 和 <ChatPanel>...</ChatPanel>
  result = result.replace(/<ChatMessage[^>]*>[\s\S]*?<\/ChatMessage>/g, '')
  result = result.replace(/<ChatPanel[^>]*>/g, '')
  result = result.replace(/<\/ChatPanel>/g, '')

  // 修复 ```env 代码块为 ```dotenv
  result = result.replace(/^```env\s*$/gm, '```dotenv')

  // 修复 protocol.mdx 列表：{...},  → {...} \n
  // 把这种 dict 列表项结束逗号后的换行处理
  result = result.replace(/^(\s*\*\s+\{[^}]+\}),\s*$/gm, '$1')

  return result
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
  const fixed = fixAll(content)
  if (fixed !== content) {
    writeFileSync(file, fixed, 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ 修复 ${count} 个文件`)
