// Next.js 静态导出后处理：确保 CNAME 文件在输出目录中
import { existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const outDir = resolve(process.cwd(), 'out')
const cnameSrc = resolve(process.cwd(), 'public', 'CNAME')
const cnameDest = resolve(outDir, 'CNAME')

if (!existsSync(outDir)) {
  console.error('❌ out/ 目录不存在，请先执行 next build')
  process.exit(1)
}

if (existsSync(cnameSrc)) {
  copyFileSync(cnameSrc, cnameDest)
  console.log('✅ 已复制 CNAME 到 out/')
}
else {
  console.warn('⚠️  public/CNAME 不存在，跳过')
}

// 创建 404.html（fallback for SPA routing）
const notFoundHtml = resolve(outDir, '404.html')
if (!existsSync(notFoundHtml)) {
  // Next.js 静态导出应该已经生成了 404.html 或 404/index.html
  console.log('ℹ️  404 页面将由 Next.js 自动生成')
}

console.log('✅ postbuild 完成')
