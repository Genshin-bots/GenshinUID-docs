---
name: gsuid-docs-development
description: >
  当用户要求"维护 / 开发 早柚核心文档站（GenshinUID-docs，Fumadocs 版）"、
  "文档站主题 / 配色怎么改"、"磨砂玻璃质感是怎么做的"、"怎么新增一个文档页面 / 章节"、
  "MDX 怎么写 / 中文加粗不生效 / 大括号报错"、"卡片 / 提示框 / 代码块 / 聊天示例样式"、
  "插件市场卡片怎么来的"、"i18n / 多语言 / 导航栏怎么配"、"搜索为什么搜不到中文 / 搜索怎么工作"、
  "顶部导航栏为什么是全宽 / 侧边栏宽度"、"VitePress → Fumadocs 迁移遗留问题"、
  "构建 / 部署 / 静态导出" 时触发此 SKILL。
  凡是改动 `GenshinUID-docs`（早柚核心文档站本身，非 gsuid_core 框架）的任务都应优先读取此 SKILL。

  面向 **早柚核心文档站（GenshinUID-docs）的维护者**的开发指南。讲的是这个 **Fumadocs
  (Next.js 16 + Tailwind v4 + MDX) 静态文档站**自身的结构与约束：主题 / 磨砂玻璃样式系统、
  自定义 MDX 组件、如何写文档、卡片样式、三语 i18n、静态 Orama 搜索（含中文分词），
  以及一份从 VitePress 迁移过来踩过的坑清单。
---

# 早柚核心文档站 开发与维护指南（核心入口）

> 本 SKILL 面向 **GenshinUID-docs 文档站本身**的开发者 / 维护者，描述其技术栈、目录结构、
> 主题与样式系统、自定义组件、写作规范、i18n、搜索实现，以及后续开发必须注意的坑。
> 目标：让不熟悉本项目的人也能安全地改文档站，不重复踩 VitePress→Fumadocs 迁移时踩过的坑。
>
> 内容按「主入口 + `references/` 子文档」拆分。需要某专题细节时，顺着下表的相对路径**按需**
> `Read` 对应文件，不要一次性全部读入上下文。**源码 / 官方文档永远是唯一事实源**，本 SKILL 是
> 导航与设计意图说明；改动后请同步更新对应章节。

## 这是什么项目

- **早柚核心文档站（GenshinUID-docs）**：GsCore / 早柚核心（gsuid_core）框架的官方文档。
- 技术栈：**Fumadocs UI 16 + fumadocs-core 16 + fumadocs-mdx 15** 跑在 **Next.js 16 (App Router, Turbopack)**，
  样式用 **Tailwind CSS v4**，内容用 **MDX**。
- 输出：`output: 'export'` **纯静态站点**（`out/`），部署到 GitHub Pages（带 `CNAME`）。
- 历史：由 **VitePress 迁移而来**（commit `dff4b913`）。很多坑源于 VitePress(markdown-it) 与
  MDX(micromark) 的行为差异，集中记录在 [第七章](./references/07-pitfalls.md)。
- 设计风格：**中性石墨（Slate）浅色磨砂玻璃 + 大量留白**，浅色为默认，深色为优雅深石墨玻璃，**无红色品牌色**。

## 目录索引

| 章节 | 主题 | 链接 |
|------|------|------|
| 一 | 架构与目录结构（技术栈、关键文件、路由、布局网格、构建 / 部署） | [references/01-architecture-and-structure.md](./references/01-architecture-and-structure.md) |
| 二 | 主题与样式系统（Slate 配色令牌、light/dark、玻璃辅助变量、布局宽度、全宽 Header、如何换配色、prose 行高 / 网格透明度、侧边栏 / 顶栏多彩 icon、玻璃下拉） | [references/02-theme-and-styling.md](./references/02-theme-and-styling.md) |
| 三 | 自定义组件（MDX 组件清单、Badge / Card / ChatPanel / Callout…、如何新增一个组件） | [references/03-components.md](./references/03-components.md) |
| 四 | 怎么写文档（frontmatter、标题 / description、提示框、聊天示例、徽章、CJK 加粗 / 大括号注意、leaf icon 多元化脚本） | [references/04-writing-mdx.md](./references/04-writing-mdx.md) |
| 五 | i18n 多语言（语言配置、导航栏 nav-config、首页 home-content、UI 文案、如何加一门语言） | [references/05-i18n.md](./references/05-i18n.md) |
| 六 | 搜索（静态 Orama 索引、中文 / 日文分词、自定义搜索弹窗、为什么默认搜不到中文） | [references/06-search.md](./references/06-search.md) |
| 七 | 已知坑（…、首页 iframe 白屏 / 邻页露边 / 横幅 / 滚动链 / **回顶卡顿** 等见坑 #36–#43） | [references/07-pitfalls.md](./references/07-pitfalls.md) |
| 八 | 字体切片（MiSans VF + unicode-range，源文件位置、重新生成、VF 轴校验） | [references/08-font-slice.md](./references/08-font-slice.md) |
| 九 | 首页 PPT 硬翻页 + 控制台内嵌 + 回顶 + Features 图标 + 回顶性能（`HomePager` / `HomeShowcase` / `HomeHero` / `public/hub/`） | [references/09-home-ppt-pager.md](./references/09-home-ppt-pager.md) |
| 十 | 实时聊天室路由（`/chat` 独立全页路由 vs `/sp/chat` 文档内嵌、HomeLayout 复用、ChatInterface 与 ChatLayout / ChatStandalone 关系、WebSocket 状态机、滚动策略） | [references/10-chat-route.md](./references/10-chat-route.md) |

## 推荐阅读顺序

1. **第一次接触**：先看 [一、架构与目录结构](./references/01-architecture-and-structure.md)，建立"文件都在哪、页面怎么来的"心智模型。
2. **改外观 / 配色 / 间距**：看 [二、主题与样式](./references/02-theme-and-styling.md)。
3. **写 / 改文档内容**：看 [四、怎么写文档](./references/04-writing-mdx.md)；遇到组件看 [三、组件](./references/03-components.md)。
4. **加语言 / 改导航**：看 [五、i18n](./references/05-i18n.md)。
5. **搜索相关**：看 [六、搜索](./references/06-search.md)。
6. **任何"奇怪现象"先翻** [七、已知坑](./references/07-pitfalls.md)，大概率已经记录。
7. **调整字体 / 重新切片**：看 [八、字体切片](./references/08-font-slice.md)；关键注意项见坑 #15。
8. **改首页翻页 / 控制台 / 回顶 / Features 图标**：看 [九](./references/09-home-ppt-pager.md)；白屏与回顶卡顿见坑 #36–#43。

## 最关键的几条（先记住）

> - **改完一定要 `pnpm build`**：很多问题（MDX 语法、TS 类型、搜索索引）只有构建期才暴露。
> - **顶栏 Header 是 `position: fixed` 脱离 docs 网格的**，不是 Fumadocs 默认行为，别"顺手改回"。见 [二](./references/02-theme-and-styling.md) / [七](./references/07-pitfalls.md)。
> - **中文搜索依赖 Mandarin 分词器**，服务端建索引与客户端查询必须用同一套，见 [六](./references/06-search.md)。
> - **MDX 里中文加粗、`{ }`、HTML 注释都有坑**，写文档前务必读 [四](./references/04-writing-mdx.md)。
> - **配色全部是 CSS 变量**（`--color-fd-*` / `--fd-glass-*`），改主题改变量即可，别到处硬编码颜色。
> - **正文字体是 MiSans VF（可变字体，wght 150~700）+ 97 个 unicode-range 切片**，
>   不是 4 套静态字重。CSS 写 `font-weight: 600` 浏览器会沿 wght 轴插值，不需要切换字体文件。
>   **inline code / pre 也走 MiSans VF**（inline code 把 MiSans VF 提到 mono 之前；pre 块直接用 MiSans VF 并关闭 `liga/clig/calt`）。
>   见 [八](./references/08-font-slice.md) / 坑 #15 / 坑 #17。
> - **首页是 PPT 式硬翻页**（`HomePager` 接管 wheel/keydown/touch；邻页约 520ms，远距回顶可至 900ms）。
>   CSS 里**不要**再启用 `scroll-snap-*`。落点用**双 rAF** 再卸 `home-scrolling`。见 [九](./references/09-home-ppt-pager.md)。
> - **主页控制台 = 真实 Demo SPA**（`public/hub/` 入库，同源 iframe），与原控制台完全一致。
>   **无** `gsuid_hub` submodule、**无** 构建期烤 hub、**禁止**手绘 HubMock。
>   更新演示 = 上游 `yarn build:demo` 后覆盖 `public/hub/`（并核对 `HUB_ASSETS` hash）。
> - **防白屏铁律**：iframe 会话内挂上后**永不卸载**；翻页**禁止** `display:none` /
>   `content-visibility:hidden` 藏 frame。见 [九 §9.5](./references/09-home-ppt-pager.md) / 坑 #36。
> - **入场与翻页协作**：`homepager:goto` 时纯 DOM 打 `.is-in`（禁止滚动中 setState）；
>   文案 `--stagger` 错落；live 框与 title 同为 stagger 2。标题横幅用 `MarqueeRow alwaysRun`（rAF）。
> - **回顶 / 性能红线**：**不要**在 `.home-scrolling` 开关顶栏 `backdrop-filter` 或 Hero `transform/filter`；
>   **不要**用 `pageScrolling` React state 重渲 6 iframe。回顶钮 **portal 到 body** + 物理 `right`。
>   Features 用 lucide 键 + `.feature-card__icon`（无 emoji 方底）。见坑 #41–#43 / [九 §9.4 §9.9](./references/09-home-ppt-pager.md)。
> - **性能三角**：6 重 SPA + 满 blur + 120fps **无法同时 100%**；当前承诺是「不白屏 + 动画可见 + 卡顿明显减轻」。见 [九 §9.1](./references/09-home-ppt-pager.md)。
> - **侧边栏在 fumadocs v16 之后已经不用 `<ul>/<li>`**——整个树是 `<div data-radix-scroll-area-viewport>` 内的一组 `<div data-state="open/closed">`。
>   想给 folder icon 着色或定位"页"位置，先看坑 #16 再写 selector。
> - **lucide-react 的 `icons` map 不等于 `lucide-react` 命名导出**。`Home` / `Train` 等少数 icon
>   在 `icons` map 里**不存在**，写进 frontmatter 会被 `lucideIconsPlugin` 报 `Unknown icon detected`，见坑 #19。
> - **MDX 在 `{...}` 表达式内不解析 markdown**。fenced code block、表格、列表全不识别。
>   设计「包装 JSX」组件时**不要让用户把内容塞进 `options[i].content` 这类数组 prop**，
>   必须用 **children + `data-xxx` 属性**的 compound component 模式（参考 `PkgManager`）。
>   否则 Shiki 高亮、复制按钮、Callout 玻璃样式全失效。见 [三、§3.7](./references/03-components.md) / [七、坑 #28](./references/07-pitfalls.md)。
> - **MDX 把 `>>>` / `<<<` 等连续 `>` `<` 字符当 JSX 闭合标签解析**，即便它们在 fenced code
>   block 内。Python REPL 提示符、MySQL CLI 等场景会触发。**用 JS 模板字面量构造**：
>   `` `${'>'.repeat(3)} Python 3.x.x` ``，让 acorn-jsx 源码里看不到连续 `>`。见坑 #29。
> - **Next.js + Turbopack dev server 缓存 CSS**：HMR 不能保证把新加的 CSS 类刷新到
>   dev bundle。dev 页面表现与 `pnpm build` 产物不一致时（HTTP 200 + 新类不生效），
>   固定流程是 `taskkill` 杀 dev server → `rm -rf .next/dev` → `pnpm dev:docs` 重启。
>   验证命令：`curl -s http://localhost:3000/_next/static/chunks/<chunk>.css | grep <新类名>`。
>   见坑 #30。
> - **项目自定义 Callout 玻璃样式只覆盖 4 个具体选择器**（`.prose.prose >` / `.prose details >` /
>   `.fd-checkitem__body >` / `.fd-faq-a-content >`），都用 `>` 直接子选择器，**不支持后代**。
>   新组件要承载 Callout，必须在 4 个容器内（直接子级），或修改 `app/global.css` 9 条规则
>   各加一条新选择器（孙级用后代选择器 ` `）。见 [三、§3.7](./references/03-components.md) / [七、坑 #31](./references/07-pitfalls.md)。
> - **自定义 JSX 标题组件会让 TOC 丢失**——fumadocs TOC 由 `remark-heading` 在构建期扫 markdown
>   heading 节点 + `rehypeToc` 在 HAST 上扫 h1~h6 元素生成，JSX 对两条路径都不可见。
>   想让主 H2 有页头级视觉（TitleArcs + 渐变）必须走 **H2 映射 + frontmatter 开关**，
>   MDX 里仍然写 `## 标题`，渲染时才映射到 `<SectionTitleHeading>`。见 [三](./references/03-components.md) /
>   [七、坑 #32](./references/07-pitfalls.md)。
