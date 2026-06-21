// 修复 HTML 自闭合标签：<img src="..."> → <img src="..." />
// MDX/JSX 要求 void elements 自闭合

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

const VOID_ELEMENTS = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']

function fixSelfClose(content) {
  let result = content
  for (const tag of VOID_ELEMENTS) {
    // <img src="...">  →  <img src="..." />
    // 匹配 <tag ...> 但不是 />
    const re = new RegExp(`<${tag}(\\s+[^>]*[^/])?>`, 'g')
    result = result.replace(re, `<${tag}$1 />`)
  }
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
  const fixed = fixSelfClose(content)
  if (fixed !== content) {
    writeFileSync(file, fixed, 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ 修复 ${count} 个文件中的自闭合标签`)
