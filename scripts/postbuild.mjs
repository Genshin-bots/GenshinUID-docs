// Next.js 静态导出后处理：
// 1) 复制 CNAME
// 2) 为旧文档路径生成 HTML 兼容跳转页（纯静态 export 无服务端 redirect）
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve(process.cwd(), 'out');
const cnameSrc = resolve(process.cwd(), 'public', 'CNAME');
const cnameDest = resolve(outDir, 'CNAME');

if (!existsSync(outDir)) {
  console.error('❌ out/ 目录不存在，请先执行 next build');
  process.exit(1);
}

if (existsSync(cnameSrc)) {
  copyFileSync(cnameSrc, cnameDest);
  console.log('✅ 已复制 CNAME 到 out/');
} else {
  console.warn('⚠️  public/CNAME 不存在，跳过');
}

// lib/doc-redirects.json 与 lib/doc-redirects.ts 保持同步（postbuild 不依赖 tsc）
const redirectsPath = resolve(process.cwd(), 'lib/doc-redirects.json');
let DOC_REDIRECTS = {};
if (existsSync(redirectsPath)) {
  DOC_REDIRECTS = JSON.parse(readFileSync(redirectsPath, 'utf8'));
} else {
  console.warn('⚠️  lib/doc-redirects.json 不存在，跳过旧路径兼容页生成。');
}

const LANGUAGES = ['zh-CN', 'en', 'ja'];

function redirectHtml(targetPath) {
  // targetPath like /zh-CN/docs/getting-started/install/
  const safe = targetPath.replace(/"/g, '&quot;');
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${safe}" />
  <link rel="canonical" href="${safe}" />
  <title>Redirecting…</title>
  <script>location.replace(${JSON.stringify(targetPath)})</script>
</head>
<body>
  <p>文档已迁移，正在跳转到 <a href="${safe}">${safe}</a>…</p>
</body>
</html>
`;
}

let count = 0;
for (const [from, to] of Object.entries(DOC_REDIRECTS)) {
  for (const lang of LANGUAGES) {
    const fromDir = resolve(outDir, lang, 'docs', ...from.split('/'));
    const target = `/${lang}/docs/${to}/`;
    const indexFile = resolve(fromDir, 'index.html');
    // 仅在目标页不存在或我们强制覆盖 stub 时写入；
    // 若旧内容仍在构建产物中（未删源），不覆盖真实页面。
    // Wave 1 删旧目录后，这里会补上兼容页。
    if (existsSync(indexFile)) {
      continue;
    }
    mkdirSync(fromDir, { recursive: true });
    writeFileSync(indexFile, redirectHtml(target), 'utf8');
    count += 1;
  }
}

if (count > 0) {
  console.log(`✅ 已生成 ${count} 个旧路径兼容跳转页`);
} else {
  console.log('ℹ️  无需生成兼容跳转页（旧页仍存在或无映射）');
}

console.log('✅ postbuild 完成');
