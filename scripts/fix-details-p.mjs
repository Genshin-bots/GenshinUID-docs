// 修复 MDX 中 <details><summary>X</summary><p>\n...\n</p></details> 的 <p> 标签问题
// MDX 不喜欢裸 <p> 嵌套

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

function fixDetailsP(content) {
  // 模式 1: <summary>...</summary><p>\n  →  <summary>...</summary>\n
  content = content.replace(/(<\/summary>)<p>\s*\n/g, '$1\n')

  // 模式 2: \n</p></details>  →  \n</details>
  content = content.replace(/\n<\/p><\/details>/g, '\n</details>')

  // 模式 3: 任何孤立的 </p></details>  →  </details>
  content = content.replace(/<\/p>(<\/details>)/g, '$1')

  return content
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
  if (!content.includes('<p>') || !content.includes('</details>')) continue

  const fixed = fixDetailsP(content)
  if (fixed !== content) {
    writeFileSync(file, fixed, 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ 修复 ${count} 个文件`)
