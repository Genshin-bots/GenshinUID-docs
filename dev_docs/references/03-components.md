# 三、自定义组件

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[二、主题与样式](./02-theme-and-styling.md) · **下一章**：[四、怎么写文档](./04-writing-mdx.md)

本章列出文档里可用的自定义组件、它们对应的源码与样式钩子，以及**怎么新增一个组件**。

## 3.1 组件注册表：`components/mdx.tsx`

所有能在 `.mdx` 里直接用的组件，都在 `getMDXComponents()` 里注册：

```ts
return {
  ...defaultMdxComponents,   // Fumadocs 默认（pre/code/table/...）
  h1: () => null,            // 首个 H1 不渲染（标题已在 banner 用 DocsTitle 显示）
  Badge, Card, NavCard, DataPanel, PageInfo, VideoLink, CopyRight, Contact,
  ChatLayout,                // /sp/chat 实时聊天室
  ChatPanel, ChatMessage,    // 文档内静态聊天示例
  Callout,                   // Fumadocs 提示框
  ...components,
}
```

> 新组件**必须**在这里注册，否则 MDX 里写 `<Foo>` 会被当成未知 JSX 报错。

## 3.2 组件清单

| 组件 | 文件 | 用途 | 样式钩子（global.css） |
|------|------|------|----------------------|
| `Badge` | `components/Badge.tsx` | 标题 / 卡片旁的小胶囊（`type=info/tip/warning/danger`） | `.fd-badge`, `.fd-badge-*` |
| `Card` | `components/Card.tsx` | **插件市场**：拉 `/plugin_list.json` 渲染插件卡片网格 | `.fd-plugin-list`, `.fd-plugin-card*` |
| `NavCard` | `components/NavCard.tsx` | 两列导航卡片 | 内联 Tailwind |
| `MarkdownDescription` | `components/MarkdownDescription.tsx` | 文档页 banner 副标题：在 frontmatter `description` 字符串里识别 `[text](url)` 链接 + `**text**` 加粗。**替代** fumadocs `DocsDescription`（后者不解析 Markdown）。 | `.fd-doc-description` |
| `ChatPanel` / `ChatMessage` | `components/ChatPanel.tsx` | **静态聊天示例**（复刻 VitePress） | `.fd-chatpanel*`, `.fd-chatmsg*` |
| `CheckItem` | `components/CheckItem.tsx` | **引导式步骤卡**（server component）：左侧圆形渐变步骤号 + 标题行（标题 + Badge）+ 副标题 + 内容。多张连续使用自动出现 2px 渐变连接线。**默认所有内容展开**（不再用 `<details>` 折叠），适合「按步骤走」的章节（环境检查 / 安装流程）。 | `.fd-checkitem*` |
| `PkgManager` | `components/PkgManager.tsx` | **「N 选一」Tabs 选择器**（client component）：玻璃卡片横向并排，默认选中 `recommended: true` 的那张，点击切换下方内容。**支持 N 选项**（grid 用 `auto-fit minmax(220px,1fr)`），4 卡也优雅排版。**子节点用 `data-pkg` 属性关联**（不是 props.content），保证 fenced code block 走 MDX → Shiki 完整流程。`options[i].icon` 必须是**字符串键名**（`'monitor'` / `'fileJson'` / `'uv'` / `'pip'` 等，由组件内 `ICON_MAP` 解析），不能直接传 lucide 组件——跨 `use client` 边界传函数会爆（坑 #34）。**`PkgManager` 同时承担「包管理器选择」与「配置方式二选一」两种场景**——前者选 uv/poetry/pdm/pip，后者可选 网页控制台/改配置文件 等；视觉是同一种"挑一个看下面"卡片，避免被 `CheckItem` 的"序号 + 连接线"误读为强制顺序（坑 #35）。 | `.fd-pkgmgr*` |
| `SectionTitleHeading` | `components/SectionTitleHeading.tsx` | **小节标题 H2 渲染器**（不是 JSX 组件，是 `getMDXComponents().h2` 的映射目标）。MDX 里仍写 `## 标题`——`remark-heading` 能识别并加进 TOC；通过 `sectionTitles: true` 开关把它映射到本组件后，渲染时套上 `TitleArcs` + 磨砂玻璃渐变文字，与页头 DocsTitle 同款。**不能用 `<SectionTitleHeading>` JSX 写法**——JSX 对 TOC 是不可见的，会丢右下角"On this page"。 | `.fd-section-title`, `.fd-section-title__text` |
| `Callout` | fumadocs-ui | 提示 / 警告框（`type=info/warn/error/success`） | `.prose [style*="--callout-color"]` |
| `Contributors` | `components/Contributors.tsx` | 首页「感谢成员贡献」：拉 GitHub `/contributors` 渲染**堆叠圆形头像**（一行 24 个，多行堆叠，展示全部） | `.contrib__rows`, `.contrib__stack`, `.contrib__item` |
| `DataPanel` | `components/DataPanel.tsx` | 不蒜子访问量统计 | 内联 Tailwind |
| `PageInfo` | `components/PageInfo.tsx` | 字数 / 阅读时长 | 内联 Tailwind |
| `VideoLink` | `components/VideoLink.tsx` | B 站视频链接卡片 | 内联 Tailwind |
| `Contact` / `CopyRight` | 同名文件 | 联系方式 / 版权 | 内联 Tailwind |
| `ChatLayout` | `components/chat/ChatLayout.tsx` | `/sp/chat` 的 **WebSocket 实时聊天室**外壳（与 ChatPanel 无关） | `.fd-chat-*` |
| `ChatStandalone` | `components/chat/ChatStandalone.tsx` | `/chat` 独立全页路由外壳（脱离 docs 网格，聊天卡铺满整屏） | `.fd-chat-page-container--standalone` |
| `ChatInterface` | `components/chat/ChatInterface.tsx` | 实时聊天室核心（WebSocket / 消息 / 输入 / Lightbox / 节点面板） | `.fd-chat-*` |

### 首页专用组件（不在 MDX 注册表里）

| 组件 | 文件 | 用途 | 样式钩子 |
|------|------|------|---------|
| `HomeHero` | `components/HomeHero.tsx` | 首页首屏：渐变标题 + 鼠标视差光球 + scrollHint | `.hero-px`, `.hero-px__*` |
| `Marquee` | `components/Marquee.tsx` | 大字无限滚动条（haoqi 式大胆排版），两行反向滚动 | `.marquee`, `.marquee__*` |
| `HomeShowcase` | `components/HomeShowcase.tsx` | 「框架运行效果」展示区：左右交错超大截图面板，逐屏「一页一页」 | `.home-showcase`, `.showcase-panel`, `.showcase-shot*` |
| `HomePager` | `components/HomePager.tsx` | 首页 PPT 式硬翻页控制器（接管 wheel/keydown/touch，一滚一页） | 渲染 `null`，仅 JS 拦截 |
| `Reveal` | `components/Reveal.tsx` | 通用滚动入场（IntersectionObserver 触发 `.reveal--in`，模糊淡入上浮） | `.reveal`, `.reveal--in` |

这些组件 **只在首页使用**，由 `app/[lang]/page.tsx` 直接 import 渲染，**不进 MDX 注册表**。
如果以后想给 MDX 文档页用某个首页组件，把它加进 `components/mdx.tsx` 即可。

> **完整 PPT 翻页设计**（为什么不用 scroll-snap、动画时序与入场曲线对齐、键盘 / 触屏交互）见
> [九、首页 PPT 式硬翻页](./09-home-ppt-pager.md)。

## 3.3 重点：ChatPanel / ChatMessage（静态聊天示例）

复刻自 VitePress 的 `<ChatPanel>/<ChatMessage>`，用于展示"向 Bot 发 xxx → Bot 回 yyy"。

```mdx
<ChatPanel title="绑定UID">
<ChatMessage nickname="Wuyi无疑">绑定uid100740568</ChatMessage>
<ChatMessage nickname="GsCore">绑定UID100740568成功！</ChatMessage>
<ChatMessage nickname="群友A" tag="用户">你们在说什么呢？</ChatMessage>
</ChatPanel>
```

- **左右分边**：昵称含 `core`/`bot`/`gsuid`（不分大小写）→ 机器人，**左侧**灰气泡；
  其余 → 用户「你」，**右侧** primary 气泡。
- `tag="用户"`：群聊里的"其他人"，显示在**左侧**并带一个小标签 chip（区别于"你"）。
- `bot` 属性可显式指定是否机器人气泡。
- **含 `{ }` 的消息必须包成 JS 字符串**：`{'mys设备登录{"oaid":"..."}'}`，否则 MDX 把 `{...}`
  当表达式求值报错。见 [四、写文档 §4.5](./04-writing-mdx.md)。

## 3.4 重点：插件市场卡片（Card）

- `components/Card.tsx` 在客户端 `fetch('/plugin_list.json')`，按 `fun_plugins` / `tool_plugins`
  分组渲染 `.fd-plugin-card`。
- `content === '停止维护'` 或 `type === 'danger'` → `isDeprecated` → 卡片置灰（`.fd-plugin-card-deprecated`）。
- **样式 `.fd-plugin-*` 全部在 `app/global.css`**（迁移初期这些类完全没样式，是后来补的）。
- 卡片里的徽章必须 `white-space: nowrap; flex-shrink: 0`，标题用省略号截断，否则长徽章（如"停止维护"）
  会被挤成竖排。见 [七、坑 #5](./07-pitfalls.md)。
- 增删插件条目改 `public/plugin_list.json`（不是改组件）。

## 3.5 怎么新增一个 MDX 组件

1. 在 `components/` 新建 `Foo.tsx`。**默认是 Server Component**；用到 `useState`/`useEffect`/事件 /
   浏览器 API 时在文件首行加 `'use client'`。
2. 颜色 / 间距用主题变量或 `*-fd-*` 工具类（见 [二](./02-theme-and-styling.md)），需要玻璃质感就套
   §2.4 的玻璃套路；专属样式加到 `app/global.css`（用 `fd-foo-*` 前缀避免冲突）。
3. 在 `components/mdx.tsx` 的 `getMDXComponents()` 里 `import` 并加入返回对象。
4. 在某个 `.mdx` 里 `<Foo />` 使用（无需额外 import，MDX 自动用映射表）。
5. `pnpm build` 验证（组件类型 / MDX 解析错误此时才暴露）。

> **可序列化注意**：`Providers.tsx` 是 client component，因为搜索弹窗里有函数（`initOrama`）
> 无法从 server component 跨边界传递。若你的组件需要给 `RootProvider` 传函数 / 组件 prop，
> 同理要放在 client 包裹里。见 [六、搜索](./06-search.md)。

## 3.6 重点：CheckItem（引导式步骤卡）

复刻 VitePress 时代「按步骤走」的视觉，但**默认所有内容展开**，不再让用户点 `<details>`：

```mdx
<CheckItem
  step={1}
  title="确保安装 Python 环境"
  subtitle="版本须 >3.9，建议 >=3.12"
  badge={{ text: "必装", type: "warning" }}
>
  ```shell
  python -V
  ```
</CheckItem>

<CheckItem step={2} title="...">...</CheckItem>
<CheckItem step={3} title="...">...</CheckItem>
```

- `step`（必填）：左侧圆形渐变步骤号（MiSans VF 数字 + 主题色渐变背景）。
- `title`（必填）：卡片标题。
- `subtitle`（可选）：标题下灰色说明。
- `badge`（可选）：`{ text, type }` —— type 走 `Badge` 组件的 4 档（`info`/`tip`/`warning`/`danger`）。
- `children`：任意 MDX 内容（code 块、Callout、嵌套 PkgManager 都能塞）。
- 多张卡连续出现时，CSS 伪元素自动画 2px 渐变连接线（`step 1` 底 → `step 2` 顶）。
- **实现约束**：内容**不能放在 `options[i].content` 这种数组 prop 里**——MDX 在
  `{...}` 表达式内不解析 markdown，code 块会退化成 inline code（见 [七、坑 #28](./07-pitfalls.md)）。

## 3.7 重点：PkgManager（三选一 Tabs）

适合「互斥三选一」的场景（包管理器 / 数据库 / 主题等），点击卡片切换下方内容：

```mdx
<PkgManager
  options={[
    { id: 'uv',     name: 'uv',     desc: '...', minVersion: '>= 0.5.0', recommended: true },
    { id: 'poetry', name: 'poetry', desc: '...' },
    { id: 'pdm',    name: 'pdm',    desc: '...' },
  ]}
>
  <div data-pkg="uv">
    ```shell
    uv -V
    ```
    <Callout type="info" title="">未安装时: `pip install uv`</Callout>
  </div>
  <div data-pkg="poetry">...</div>
  <div data-pkg="pdm">...</div>
</PkgManager>
```

- **`options` prop** 只放元数据（id / name / desc / minVersion / recommended），**不放** JSX 内容。
- **`children` + `data-pkg` 属性**承载内容：组件内部用 `Children.forEach` 按 `data-pkg` 过滤
  出当前激活那张渲染。**这是必须的**——直接放 `options[i].content: <JSX>` 会让 Shiki / fenced
  code / Callout 玻璃样式全部失效（见 [七、坑 #28](./07-pitfalls.md) / [坑 #31](./07-pitfalls.md)）。
- `recommended: true` 的那张会被默认选中 + 高亮（实色描边 + 左上角对勾）。
- `minVersion` 会作为 mono 字体的 inline badge 紧贴 name 右侧（`uv ≥ 0.5.0` 风格）。
- a11y：grid = `role="tablist"`，每张卡 = `role="tab"`（用 `<button>` 而非 `<a>`），面板 = `role="tabpanel"`。
- **嵌套 Callout 时**确认外层 `data-pkg` div 没有其他兄弟节点挡住——参考 install-core.mdx
  「确认环境有无缺失」一节中 `PkgManager` 当前用法。
