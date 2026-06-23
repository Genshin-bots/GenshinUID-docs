# 一、架构与目录结构

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **下一章**：[二、主题与样式系统](./02-theme-and-styling.md)

本章给出文档站的整体心智模型：技术栈、目录在哪、一个文档页面是怎么从 `.mdx` 变成 HTML 的、
布局网格长什么样、怎么构建与部署。

## 1.1 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 框架 | **Next.js 16**（App Router, Turbopack） | `output: 'export'` 纯静态导出 |
| 文档 UI | **fumadocs-ui 16** / **fumadocs-core 16** | 布局、侧边栏、TOC、搜索 context |
| 内容编译 | **fumadocs-mdx 15** | 把 `content/docs/**/*.mdx` 编译成可导入的页面 |
| 样式 | **Tailwind CSS v4** + 自定义 `app/global.css` | 主题用 CSS 变量 + `@theme` |
| 搜索 | **@orama/orama** + **@orama/tokenizers**（静态索引） | 构建期生成 JSON 索引，浏览器端查询 |
| 包管理 | **pnpm**（`packageManager` 锁定） | `node >= 22` |

## 1.2 顶层目录速览

```
GenshinUID-docs/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 根布局（几乎空，把 <html>/<body> 交给 [lang]）
│   ├── page.tsx              # 根路径 / → redirect 到 /zh-CN/
│   ├── global.css            # ★ 全部主题 + 样式（最重要的样式文件）
│   ├── [lang]/
│   │   ├── layout.tsx        # 语言级布局：<html><body> + <Providers>（client）
│   │   ├── page.tsx          # 首页（Hero + 特性卡片 + 团队），不走 docs 布局
│   │   ├── chat/             # ★ 独立全页聊天路由：HomeLayout + DocsNav，无 sidebar / TOC
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── docs/
│   │       ├── layout.tsx    # DocsLayout（侧边栏 + 自定义 DocsNav 顶栏）
│   │       └── [[...slug]]/page.tsx  # ★ 文档页渲染（DocsPage + MDX）
│   └── api/search/route.ts   # ★ 静态搜索索引（staticGET），含 CJK 分词器
├── components/               # React 组件（含 MDX 组件）
│   ├── Providers.tsx         # client：RootProvider + 自定义搜索弹窗
│   ├── DocsNav.tsx           # 自定义全宽顶部导航栏
│   ├── SearchDialog.tsx      # 自定义搜索弹窗（带 CJK 分词）
│   ├── mdx.tsx               # ★ MDX 组件映射表（注册所有自定义组件）
│   ├── Badge / Card / NavCard / ChatPanel / DataPanel / ...
│   └── chat/                 # ★ 实时聊天室核心（ChatInterface）+ 两条入口的外壳
│                              #   ChatLayout（/sp/chat 用） / ChatStandalone（/chat 用）
├── content/docs/**/*.mdx     # ★ 文档内容（按目录组织 URL）
├── lib/
│   ├── i18n.ts               # 语言定义（zh-CN / en / ja）
│   ├── layout.shared.ts      # i18nUI：UI 文案三语翻译
│   ├── nav-config.ts         # 顶栏下拉菜单 / 版本 / 语言项（聊天入口写在这里）
│   ├── home-content.ts       # 首页文案（三语）
│   └── source.ts             # fumadocs loader（把 docs 接入）
├── assets/                   # ★ 构建期资源（不会被部署到 out/）
│   └── fonts/MiSansVF.ttf    #   正文字体源文件（20MB，可变字体 wght 150~700）
│                              #   喂给 scripts/font-slice.mjs 切到 public/font/MiSans-VF/
├── public/font/              # → out/font/ 的静态字体（含 VF woff2 切片 + FiraCode）
│   └── MiSans-VF/            #   font.css（97 @font-face）+ MiSansVF.{1..97}.woff2
├── scripts/
│   ├── font-slice.mjs        # 重新生成 VF 切片的脚本（详见 dev_docs §8）
│   └── postbuild.mjs         # 构建后复制 CNAME 等
├── source.config.ts          # ★ fumadocs-mdx 配置（remark 插件等）
├── next.config.mjs           # output:export / trailingSlash / images.unoptimized
└── dev_docs/                 # ← 你正在读的开发文档
```

> **`★` 是最常改的文件**。绝大多数维护任务集中在：`app/global.css`（样式）、
> `content/docs/**`（内容）、`components/mdx.tsx` + 具体组件（功能）、`lib/*`（配置）。
>
> **字体资源分两个地方**：源 `.ttf` 在 `assets/fonts/`（**不进 out/**），
> 切片 `.woff2` + `font.css` 在 `public/font/MiSans-VF/`（**进 out/**）。
> 别把源 ttf 误放到 public/，会无意义地膨胀部署体积。详见 [§8](./08-font-slice.md) / 坑 #15。

## 1.3 一个文档页面是怎么来的

1. 作者写 `content/docs/started/install-core.mdx`（带 frontmatter：`title` / `description` / `icon`）。
2. `fumadocs-mdx`（`source.config.ts` + 自动生成的 `collections/server`）把它编译成可导入模块。
3. `lib/source.ts` 的 `loader()` 把所有文档聚合成一棵 page tree（带 i18n）。
4. `app/[lang]/docs/[[...slug]]/page.tsx` 用 `source.getPage(slug, lang)` 取到页面，
   用 `<DocsPage>` + `page.data.body`（MDX 组件）渲染，自定义组件来自 `components/mdx.tsx`。
5. `generateStaticParams` 为每个 `(lang, slug)` 预渲染出静态 HTML。

> URL 规则：`content/docs/started/install-core.mdx` → `/<lang>/docs/started/install-core/`
> （`trailingSlash: true`，所以**站内链接都要带结尾 `/`**）。

## 1.4 布局网格（理解全宽 Header 的关键）

文档页用 Fumadocs 的 `DocsLayout`，其容器 `#nd-docs-layout` 是一个 **CSS Grid**：

```
列： [左留白 1fr] [sidebar] [main] [toc] [右留白 1fr]
```

- 整块（sidebar+main+toc）由两侧 `1fr` 留白居中；`--fd-layout-width` 控制最大宽度。
- 关键变量（在 `app/global.css` 覆盖）：`--fd-sidebar-width`、`--fd-toc-width`、`--fd-layout-width`。
- **顶部导航栏 `DocsNav` 默认会被塞进 grid 的 `header` 槽，而该槽只占 main 这一列宽** ——
  这就是迁移初期"顶栏没占满整宽"的根因。解决办法见 [二、主题与样式 §2.5](./02-theme-and-styling.md) 与 [七、坑 #1](./07-pitfalls.md)：
  把 `.glass-header` 设成 `position: fixed` 脱离网格，再用 `padding-top + --fd-banner-height` 把内容下移。
- 自定义 article 容器 `components/DocsArticleContainer.tsx`（`#nd-page.fd-docs-article`）在 main 列内**居中**，
  最大宽 `54rem`，留出呼吸感。

## 1.5 构建与部署

```bash
pnpm install
pnpm dev          # 本地开发（:3000）
pnpm build        # 生产构建 → out/（含 postbuild：复制 CNAME）
pnpm typecheck    # tsc --noEmit
```

- **静态预览**：`out/` 是纯静态。用 `python -m http.server` 或 `npx serve out` 起一个静态服务器看效果
  （`trailingSlash` 目录会回退到 `index.html`）。
- **部署**：GitHub Pages，根域名（`out/CNAME`）。`pnpm build` 后把 `out/` 发布即可。
- **截图自查**（CI 无界面时）：可用本机 Chrome `--headless=new --screenshot=...` 对静态服务器截图，
  暗色模式可写一个 `localStorage.setItem('theme','dark')` 的中转页再跳转。

> **构建坑**：若有静态服务器正占着 `out/`，`pnpm build` 末尾会 `EBUSY: rmdir 'out'` 失败
> （页面其实已生成）。先关掉占用进程再构建。见 [七、坑 #6](./07-pitfalls.md)。
