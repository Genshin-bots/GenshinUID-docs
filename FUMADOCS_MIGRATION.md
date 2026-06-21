# VitePress → Fumadocs (Next.js) 迁移指南

本文档记录从 VitePress 1.6.4 重构到 [Fumadocs](https://fumadocs.dev)（基于 Next.js 静态导出）的完整方案。

> 📅 **当前状态**：已完成迁移，部署到 GitHub Pages（分支 `fumadocs`）
> 🌐 **生产地址**：https://docs.sayu-bot.com

---

## 目录

- [为什么迁移](#为什么迁移)
- [架构对比](#架构对比)
- [目录结构](#目录结构)
- [本地开发](#本地开发)
- [i18n 三语支持](#i18n-三语支持)
- [主题与样式](#主题与样式)
- [搜索](#搜索)
- [自定义组件](#自定义组件)
- [部署](#部署)
- [内容迁移](#内容迁移)
- [已知问题与注意事项](#已知问题与注意事项)
- [后续工作](#后续工作)

---

## 为什么迁移

| 维度 | VitePress | Fumadocs (Next.js) |
|------|-----------|-------------------|
| 框架 | Vue 3 | React 19 |
| 主题 | VitePress 默认 + 自定义 | Fumadocs UI（`vitepress` 颜色预设） |
| 搜索 | 内置 mini-search | Orama 静态（支持 CJK） |
| i18n | `locales` 配置 | 文件名后缀 + `[lang]` 路由 |
| 生态 | 较小 | 庞大（React 组件可直接使用） |
| 部署 | 静态文件 | Next.js 静态导出到 `out/` |
| 组件系统 | Vue SFC | React JSX（MDX 原生） |

---

## 架构对比

```
VitePress (旧)                          Fumadocs (新)
─────────────────                       ─────────────────
docs/.vitepress/config.ts          →     next.config.mjs
docs/.vitepress/theme/*.vue        →     components/*.tsx
docs/.vitepress/sidebar.ts         →     content/docs/<section>/meta.json
docs/<Section>/<Page>.md           →     content/docs/<section>/<page>.mdx
docs/index.md (home)               →     app/[lang]/page.tsx (React)
docs/.vitepress/composables        →     hooks/*.ts
docs/CNAME                         →     public/CNAME
.github/workflows/deploy.yml       →     .github/workflows/deploy-next.yml
```

---

## 目录结构

```
GenshinUID-docs/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 根布局（透传 children）
│   ├── page.tsx                      # 根路径 → /zh-CN/
│   ├── global.css                    # 全局样式（Tailwind v4 + Fumadocs）
│   ├── [lang]/                       # 多语言路由段
│   │   ├── layout.tsx                # 语言感知布局（I18nProvider + RootProvider）
│   │   ├── page.tsx                  # 首页（hero + features + contributors）
│   │   └── docs/
│   │       ├── layout.tsx            # 文档布局（侧边栏 + 顶栏）
│   │       └── [[...slug]]/
│   │           └── page.tsx          # 文档动态路由
│   └── api/
│       └── search/
│           └── route.ts              # 搜索 API（Orama 静态）
│
├── components/                       # 自定义 React 组件
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── NavCard.tsx
│   ├── DataPanel.tsx
│   ├── PageInfo.tsx
│   ├── VideoLink.tsx
│   ├── CopyRight.tsx
│   ├── Contact.tsx
│   ├── HomeContributors.tsx          # GitHub 贡献者
│   ├── Members.tsx                   # 团队成员
│   ├── DocsNav.tsx                   # 顶栏（含语言切换、主题切换）
│   ├── mdx.tsx                       # MDX 组件注册
│   ├── page-actions.tsx              # LLM Copy / Edit on GitHub
│   ├── Analytics.tsx                 # Umami 统计
│   └── chat/                         # 聊天室组件
│       ├── ChatInterface.tsx
│       ├── ChatLayout.tsx
│       ├── ChatHeader.tsx
│       ├── ChatInputArea.tsx
│       ├── ChatMessageItem.tsx
│       ├── ChatMessageList.tsx
│       ├── ImageLightbox.tsx
│       ├── NodeMessagePanel.tsx
│       └── types.ts
│
├── hooks/                            # React Hooks（对应 Vue composables）
│   ├── useWebSocket.ts
│   ├── useLightbox.ts
│   ├── useFileUpload.ts
│   ├── useContentItems.ts
│   ├── useChatMode.ts
│   └── useMessageRenderer.ts
│
├── content/
│   └── docs/                         # MDX 内容（替代原 docs/）
│       ├── meta.json                 # 根元数据（章节列表）
│       ├── index.mdx                 # 默认语言（zh-CN）文档首页
│       ├── index.en.mdx              # 英文文档首页
│       ├── index.ja.mdx              # 日文文档首页
│       ├── started/                  # 快速开始
│       │   ├── meta.json
│       │   ├── env-check.mdx
│       │   ├── install-core.mdx
│       │   └── ...
│       ├── link-bots/                # 链接 Bot
│       ├── install-plugins/          # 安装插件
│       ├── advance/                  # 进阶介绍
│       ├── ai-features/              # AI 功能
│       ├── code-plugins/             # 编写插件
│       ├── code-adapter/             # 编写适配器
│       ├── plugins-help/             # 插件帮助
│       ├── extra/                    # 额外
│       ├── faq/                      # 常见问题
│       └── sp/                       # 特别
│
├── lib/
│   ├── i18n.ts                       # 语言定义（zh-CN / en / ja）
│   ├── source.ts                     # Fumadocs source loader
│   ├── layout.shared.ts              # UI 字符串三语翻译
│   ├── nav-config.ts                 # 导航菜单配置
│   ├── home-content.ts               # 首页内容
│   └── utils.ts                      # cn() 等工具
│
├── public/                           # 静态资源（替代原 docs/public/）
│   ├── favicon.ico
│   ├── icon.png
│   ├── grid.svg
│   ├── it.svg
│   ├── bg.png
│   ├── plugin_list.json
│   ├── CNAME                         # GitHub Pages 自定义域名
│   ├── font/                         # MiSans / Fira Code
│   ├── AIConfig/, Config/, ...       # 文档配图
│
├── scripts/
│   ├── migrate-content.mjs           # 内容迁移脚本（VitePress → MDX）
│   └── postbuild.mjs                 # 构建后处理（CNAME 复制）
│
├── source.config.ts                  # Fumadocs MDX 配置
├── next.config.mjs                   # Next.js 配置（output: 'export'）
├── postcss.config.mjs                # Tailwind v4 PostCSS
├── tsconfig.json                     # TypeScript 配置（路径别名）
├── package.json                      # 同时保留 VitePress + Next.js 依赖
└── .github/
    └── workflows/
        ├── deploy.yml                # VitePress 部署（vp 分支）
        └── deploy-next.yml           # Fumadocs 部署（fumadocs 分支）
```

---

## 本地开发

```bash
# 1. 安装依赖（首次）
yarn install

# 2. 启动 VitePress（旧版，仍保留在 vp 分支）
yarn dev          # http://localhost:8080

# 3. 启动 Fumadocs（新版，推荐）
yarn dev:next     # http://localhost:3000

# 4. 构建 Fumadocs 静态站
yarn build:next

# 5. 预览构建产物
yarn serve:next   # http://localhost:3000 (out/)
```

**Node.js 要求**：`>= 22`

---

## i18n 三语支持

### 路由结构

```
/                              → 重定向到 /zh-CN/
/zh-CN/                        → 默认语言（中文）首页
/zh-CN/docs/started/install-core/
/en/                           → 英文首页
/en/docs/started/install-core/
/ja/                           → 日文首页
/ja/docs/started/install-core/
```

### 文件命名约定（Fumadocs i18n）

```
content/docs/started/install-core.mdx        # 默认（zh-CN）
content/docs/started/install-core.en.mdx     # 英文
content/docs/started/install-core.ja.mdx     # 日文
```

如未提供翻译，会回退到默认语言（zh-CN）。

### 翻译位置

| 内容 | 文件 |
|------|------|
| UI 字符串（搜索/导航/侧边栏） | `lib/layout.shared.ts` |
| 导航菜单（快速开始/系列插件） | `lib/nav-config.ts` |
| 首页内容（hero/features/团队） | `lib/home-content.ts` |
| 文档内容 | `content/docs/**/*.mdx` |

### 添加新语言

```ts
// lib/i18n.ts
export const i18n = defineI18n({
  defaultLanguage: 'zh-CN',
  languages: ['zh-CN', 'en', 'ja'], // 添加新语言
})
```

---

## 主题与样式

### Fumadocs VitePress 颜色预设

`app/global.css` 顶部引入：

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/vitepress.css'; /* 视觉与原 VitePress 一致 */
@import 'fumadocs-ui/css/preset.css';
```

### 品牌色（早柚红）

```css
@theme {
  --color-fd-primary: oklch(0.55 0.2 25);
  --color-fd-primary-foreground: oklch(0.98 0.005 25);
  --color-fd-ring: oklch(0.55 0.2 25);
}
```

### 字体

MiSans + Fira Code 通过 `@font-face` 加载（`public/font/`），设置在 `:root`：

```css
:root {
  --font-sans: 'MiSans', 'Inter', system-ui, ...;
  --font-mono: 'Fira Code', ui-monospace, ...;
}
```

### 暗色主题

由 `next-themes` 通过 `RootProvider` 提供，在 `DocsNav` 中提供切换按钮。

---

## 搜索

使用 Fumadocs 内置 **Orama 静态索引**：

```ts
// app/api/search/route.ts
export const { staticGET: GET } = createFromSource(source, {
  language: 'english',
  localeMap: {
    'zh-CN': { /* @orama/tokenizers Chinese */ },
    en: { /* default */ },
    ja: { /* Japanese */ },
  },
})
```

构建时生成 `out/api/search.json`，前端 `SearchDialog` 加载此文件。

---

## 自定义组件

### 原 VitePress → Fumadocs 映射

| 旧 (Vue) | 新 (React) | 位置 |
|----------|-----------|------|
| `Badge.vue` | `Badge.tsx` | `components/Badge.tsx` |
| `Card.vue` | `Card.tsx` | `components/Card.tsx` |
| `NavCard.vue` | `NavCard.tsx` | `components/NavCard.tsx` |
| `DataPanel.vue` | `DataPanel.tsx` | `components/DataPanel.tsx` |
| `PageInfo.vue` | `PageInfo.tsx` | `components/PageInfo.tsx` |
| `VideoLink.vue` | `VideoLink.tsx` | `components/VideoLink.tsx` |
| `CopyRight.vue` | `CopyRight.tsx` | `components/CopyRight.tsx` |
| `Contact.vue` | `Contact.tsx` | `components/Contact.tsx` |
| `HomeContributors.vue` | `HomeContributors.tsx` | `components/HomeContributors.tsx` |
| `ChatLayout.vue` | `ChatLayout.tsx` | `components/chat/ChatLayout.tsx` |
| `ChatInterface.vue` | `ChatInterface.tsx` | `components/chat/ChatInterface.tsx` |
| `chat/ChatHeader.vue` | `ChatHeader.tsx` | `components/chat/ChatHeader.tsx` |
| `chat/ChatInputArea.vue` | `ChatInputArea.tsx` | `components/chat/ChatInputArea.tsx` |
| `chat/ChatMessageItem.vue` | `ChatMessageItem.tsx` | `components/chat/ChatMessageItem.tsx` |
| `chat/ChatMessageList.vue` | `ChatMessageList.tsx` | `components/chat/ChatMessageList.tsx` |
| `chat/ImageLightbox.vue` | `ImageLightbox.tsx` | `components/chat/ImageLightbox.tsx` |
| `chat/NodeMessagePanel.vue` | `NodeMessagePanel.tsx` | `components/chat/NodeMessagePanel.tsx` |
| `composables/chat/useWebSocket.ts` | `hooks/useWebSocket.ts` | `hooks/useWebSocket.ts` |
| `composables/chat/useLightbox.ts` | `hooks/useLightbox.ts` | `hooks/useLightbox.ts` |
| `composables/chat/useFileUpload.ts` | `hooks/useFileUpload.ts` | `hooks/useFileUpload.ts` |
| `composables/chat/useContentItems.ts` | `hooks/useContentItems.ts` | `hooks/useContentItems.ts` |
| `composables/chat/useChatMode.ts` | `hooks/useChatMode.ts` | `hooks/useChatMode.ts` |
| `composables/chat/useMessageRenderer.ts` | `hooks/useMessageRenderer.ts` | `hooks/useMessageRenderer.ts` |

### 聊天室功能

`/sp/chat/` 路由 → `<ChatLayout />` → `<ChatInterface />`

保留原 VitePress 的所有功能：
- WebSocket 实时通信
- 私聊/群聊切换
- 文件上传（图片/音频/视频）
- Markdown 渲染
- 图片灯箱（缩放/拖动/切换）
- 合并转发消息面板
- 消息按钮回调
- 重新发送

### 在 MDX 中使用

所有自定义组件通过 `getMDXComponents()` 在 `components/mdx.tsx` 中注册：

```mdx
---
title: 我的页面
---

import { Badge } from '@/components/Badge'

# 我的标题<Badge type="tip" text="新" />

<Callout type="info">提示信息</Callout>
```

---

## 部署

### GitHub Actions

`.github/workflows/deploy-next.yml`：

```yaml
name: Fumadocs (Next.js) Deployment
on:
  push:
    branches: [fumadocs]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: yarn install --frozen-lockfile
      - run: yarn build:next
      - run: yarn postbuild:next
      - uses: peaceiris/actions-gh-pages@v4
        with:
          publish_dir: ./out
          cname: docs.sayu-bot.com
```

### 自定义域名

`public/CNAME` → 构建时由 `scripts/postbuild.mjs` 复制到 `out/CNAME`。

### 部署到 GitHub Pages 设置

1. Settings → Pages → Source: `gh-pages` branch
2. 自定义域：`docs.sayu-bot.com`
3. 推送 `fumadocs` 分支即可触发部署

### 旧版 VitePress 部署

保留 `.github/workflows/deploy.yml`（在 `vp` 分支），旧的 VitePress 站点仍可访问。

---

## 内容迁移

### 自动迁移

```bash
node scripts/migrate-content.mjs
```

脚本会：
1. 遍历 `docs/<Section>/<Page>.md`
2. 转换为 kebab-case：`InstallCore.md` → `install-core.mdx`
3. 提取 H1 作为 `title`
4. 提取第一段作为 `description`
5. 转换 Vue 组件语法：
   - `<Badge type="x" text="y" />` → `<Badge type="x" text="y" />`（兼容）
   - `:::tip` → `<Callout type="info">`
   - `:::warning` → `<Callout type="warn">`
   - `:::details Title` → `<details><summary>Title</summary>`
6. 为每个章节创建 `meta.json`

### 手动调整

迁移后可能需要手动调整：
- 描述（description）可能提取不准确
- 复杂表格、HTML 块可能需要重新格式化
- 部分图片路径可能需要调整

---

## 已知问题与注意事项

### 1. 静态导出限制

- ✅ 支持：静态页面、布局、客户端组件、静态搜索
- ❌ 不支持：middleware、ISR、SSR、动态 API

由于 `output: 'export'`，**Next.js middleware 不工作**。i18n 路由通过 `app/[lang]/` 目录结构 + `app/page.tsx` 重定向实现，而非 middleware。

### 2. 描述提取

迁移脚本提取的 `description` 可能不准确。`scripts/migrate-content.mjs` 中的 `extractDescription()` 函数会取 H1 后第一段，但许多文件的 H1 后是列表或空行。建议手动调整重要页面的 frontmatter。

### 3. Vue 自定义容器

`:::tip` 等 VitePress 自定义容器已转换为 `<Callout>` JSX。如果原文档中有其他自定义语法（如 `::: code-group`），需要手动调整。

### 4. 相对链接

VitePress 中的相对链接如 `[text](./StartCore)` 在 Fumadocs 中需要：
- 使用 `createRelativeLink(source, page)` 处理
- 或手动改为绝对路径

当前实现中，链接处理通过 `app/[lang]/docs/[[...slug]]/page.tsx` 中的：
```tsx
<MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
```
自动处理相对链接。

### 5. Umami 统计

通过环境变量配置：

```bash
# .env.local
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-id
NEXT_PUBLIC_UMAMI_ENDPOINT=https://umami.example.com/script.js
```

GitHub Actions 部署时需要在仓库 Secrets 中配置（参考 `deploy-next.yml`）。

### 6. PWA

当前未实现 PWA。如需支持，可使用 `@ducanh2912/next-pwa`（支持静态导出）。

---

## 后续工作

### 待办

- [ ] **英文/日文翻译**：为 `content/docs/**/*.mdx` 添加 `.en.mdx` 和 `.ja.mdx` 版本
- [ ] **PWA 支持**：安装 `@ducanh2912/next-pwa` 并配置
- [ ] **优化 description**：手动调整重要页面的描述
- [ ] **修复断链**：构建时检查 `generateStaticParams` 输出
- [ ] **测试图片**：验证所有图片在移动端的显示
- [ ] **性能优化**：图片懒加载、代码分割

### 维护建议

- 新增章节：在 `content/docs/` 下创建新目录 + `meta.json`
- 新增页面：在对应章节目录添加 `.mdx` 文件 + 更新 `meta.json` 的 `pages`
- 修改导航：编辑 `lib/nav-config.ts`
- 修改主题色：编辑 `app/global.css` 中的 `@theme` 块

---

## 相关链接

- **Fumadocs 官方文档**：https://fumadocs.dev
- **Next.js 静态导出**：https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Orama 搜索**：https://oramasearch.com
- **原 VitePress 仓库**：本仓库 `vp` 分支

---

**迁移完成时间**：2026-06-21
**迁移工具**：Claude (MiniMax-M3)
