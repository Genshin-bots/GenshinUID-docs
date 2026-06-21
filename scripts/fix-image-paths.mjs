// Fix image paths in migrated MDX files
// Original VitePress uses: ../public/AIConfig/image.png → Next.js public/AIConfig/image.png
// Should be: /AIConfig/image.png (absolute, works with Next.js public/)

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const TARGET_DIR = resolve(process.cwd(), 'content/docs')

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) {
      yield* walk(p)
    }
    else if (entry.endsWith('.mdx')) {
      yield p
    }
  }
}

let count = 0
for (const file of walk(TARGET_DIR)) {
  let content = readFileSync(file, 'utf-8')
  const before = content

  // ![alt](./../public/AIConfig/foo.png) → ![alt](/AIConfig/foo.png)
  // ![alt](../public/AIConfig/foo.png) → ![alt](/AIConfig/foo.png)
  // ![alt](../../public/AIConfig/foo.png) → ![alt](/AIConfig/foo.png)
  content = content.replace(/(!\[[^\]]*\]\()(?:(?:\.\/)+)?(?:\.\.\/)+public\//g, '$1/')

  if (content !== before) {
    writeFileSync(file, content, 'utf-8')
    count++
    console.log(`✓ ${file.replace(process.cwd(), '').replace(/\\/g, '/')}`)
  }
}

console.log(`\n✅ Fixed ${count} files`)
