# 二、主题与样式系统

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[一、架构与目录结构](./01-architecture-and-structure.md) · **下一章**：[三、自定义组件](./03-components.md)

所有样式都在 **`app/global.css`** 一个文件里。本章讲：配色令牌怎么组织、浅 / 深色怎么切、
磨砂玻璃怎么做、布局宽度在哪调、全宽 Header 的原理，以及**怎么换一套配色**。

## 2.1 设计基调

- **中性石墨（Slate）** 近乎无彩的灰蓝，靠"玻璃 + 边框 + 留白"分层，不是靠高饱和色。
- **浅色为默认**（`defaultTheme: 'light'`，`enableSystem: false`，在 `components/Providers.tsx`）。
- **无红色品牌色**（旧的"早柚红"已移除）。红色只保留在"错误"语义（callout error / 断开状态）。
- 提示框 / 代码块 / 聊天示例 = **带语义色 / 冷色的磨砂玻璃**（半透明 + `backdrop-filter` + 细边）。

## 2.2 CSS 文件结构（`app/global.css` 从上到下）

```
@import 'tailwindcss';
@import 'fumadocs-ui/css/preset.css';          # 布局 / 排版 / shiki（不含颜色令牌）
@import 'fumadocs-ui/css/lib/default-colors.css'; # 提供完整 --color-fd-* 默认（overlay/idea/diff…）
@source ...                                      # Tailwind v4 源扫描
/* @theme {} 块留空 —— 详见下面"为什么不用 @theme" */
.dark { ...深色令牌覆盖... }
:root { ...亮色令牌 + 玻璃辅助变量... }        # ★ 所有 --color-fd-* 都搬到这里
.dark { ...玻璃辅助变量（深色版）... }
... 布局宽度、滚动条、背景、glass-header、sidebar、toc、article、
    prose、代码块、details、callout、badge、plugin-card、chatpanel、首页 hero、聊天室 ...
```

> **为什么要 import 两个 css**：`preset.css` **不含**颜色令牌（颜色来自主题文件）。
> 迁移初期同时 import 了 `vitepress.css` + `preset.css` 造成冲突。现在只 import `preset.css`
> （布局）+ `default-colors.css`（补全 `--color-fd-overlay/idea/diff-*` 等令牌），再用 `:root` / `.dark` 覆盖想改的颜色。
> 见 [七、坑 #4](./07-pitfalls.md)。

> **★ 为什么所有 `--color-fd-*` 都搬出 `@theme` 改用普通 `:root { ... }`**：
> Tailwind v4 的 `@theme` 会 tree-shake 那些**没被用作 utility class 的 token**。
> 本项目里这些 token 只在 `color-mix()` / 自定义 CSS 中以 `var()` 引用（没有 `bg-warning` 这种 utility），
> 于是整块被静默丢弃，最终 `default-colors.css` 的默认 `--color-fd-warning`（light 模式根本没定义）
> 接管 → callout 卡片渲染成灰白色。改成普通 CSS `:root` 后是 unlayered 规则，自然胜过 `@layer theme`
> 里的默认值。详见 [七、坑 #11](./07-pitfalls.md)。

## 2.3 配色令牌（改配色只动这里）

亮色在 `:root { ... }`，深色在 `.dark { ... }`（都是**普通 CSS**，不要写进 `@theme`）。
常用令牌：

| 令牌 | 含义 | 亮色 | 深色 |
|------|------|------|------|
| `--color-fd-background` | 页面背景 | 近白冷灰 | 深石墨 `oklch(0.205…)` |
| `--color-fd-foreground` | 正文色 | 深石墨 | 近白 |
| `--color-fd-card` | 卡片底 | 白 | 深石墨偏亮 |
| `--color-fd-muted(-foreground)` | 次要底 / 次要字 | 浅灰 / 中灰 | 深灰 / 浅灰 |
| `--color-fd-border` | 边框 | 浅冷灰 | 中深灰 |
| `--color-fd-primary` | 点缀（链接 / 按钮 / 选中） | `oklch(0.45 0.03 255)` 石墨 | `oklch(0.82 0.028 255)` 亮石墨 |
| `--color-fd-accent-1/2/3` | 渐变 / 装饰阶 | 石墨阶 | 亮石墨阶 |
| `--color-fd-info/success/warning/error` | callout 语义色 | L≈0.6 中等饱和蓝 / 绿 / 琥珀 / 红 | L≈0.7 提亮版 |

> **深色里 primary 要"反过来"调亮**（浅色 0.45 → 深色 0.82），否则深底上看不见。
>
> **语义色 L≈0.6**：fumadocs 默认 `oklch(0.769 0.188 70)` 太浅，30% color-mix 出来近乎白纸。
> 改成 L≈0.6 后混出来才是清晰可辨的浅色块（蓝 #add6ef / 绿 #addcc5 / 琥珀 #edcfad / 红 #f0c2c2）。

## 2.4 玻璃辅助变量（磨砂玻璃的来源）

定义在 `:root`（亮）/ `.dark`（暗）：

| 变量 | 用途 |
|------|------|
| `--fd-border-soft` | 比 `--color-fd-border` 更柔的玻璃边框 |
| `--fd-glass-bg` | Header / sidebar 用的较透玻璃底 |
| `--fd-glass-bg-strong` | 卡片 / 代码块 / callout 用的较实玻璃底 |
| `--fd-glass-shadow` | 玻璃投影 |

**玻璃做法套路**（所有卡片类组件都这样）：

```css
.some-card {
  background: var(--fd-glass-bg-strong);            /* 半透明底 */
  backdrop-filter: blur(14px) saturate(170%);       /* 关键：磨砂 */
  -webkit-backdrop-filter: blur(14px) saturate(170%);
  border: 1px solid var(--fd-border-soft);
  box-shadow: var(--fd-glass-shadow);
  border-radius: 14px;
}
```

**彩色玻璃**（callout / 聊天）= 用 `color-mix` 把语义色掺进玻璃底：

```css
background: color-mix(in oklch, var(--callout-color) 15%, var(--fd-glass-bg-strong));
border-color: color-mix(in oklch, var(--callout-color) 34%, transparent);
```

- callout 命中方式：`.prose [style*="--callout-color"]`（Fumadocs callout 容器带内联 `--callout-color`）。
- **callout 隐藏最左侧 lucide 图标**（Info / TriangleAlert / CircleX / CircleCheck
  等三角形 / 圆形 / 正方形）：在 `.prose.prose > div[style*="--callout-color"] > svg`
  上 `display: none !important`。语义由边框色 + 标题色承担，文本起始位置更整齐。
  同时把容器的 `gap` 重置为 0，避免图标位置留下空白。
- 代码块用 `--color-fd-accent-2` 掺一丝冷色（不宜过浓，影响可读性）。

## 2.5 布局宽度与全宽 Header（重点）

在 `#nd-docs-layout, #nd-notebook-layout` 上用媒体查询设置：

```css
--fd-sidebar-width: 17.5rem;   /* ≥md */
--fd-toc-width: 16rem;         /* ≥xl */
--fd-layout-width: 88rem;      /* ≥xl，大屏留白；≥2xl 92rem */
```

**全宽 Header 的实现**（不要"改回" Fumadocs 默认，否则顶栏只占中间一列）：

```css
.glass-header { position: fixed; top:0; left:0; right:0; height:3.5rem; z-index:50; }
#nd-docs-layout {
  --fd-banner-height: 3.5rem;  /* 让 sticky 的 sidebar/toc 落在 Header 下方 */
  padding-top: 3.5rem;         /* 把内容整体下移，避免被 Header 盖住 */
}
```

原理：`DocsNav` 作为 `nav.component` 渲染在 grid 里，默认只占 main 列宽。把 `.glass-header`
设成 `fixed` 让它脱离网格、横跨整屏；再用 `--fd-banner-height` + `padding-top` 把网格内容下移
3.5rem。`DocsNav` 仍留在 `SidebarProvider` 内，所以移动端汉堡按钮能用 `useSidebar()`。详见 [七、坑 #1](./07-pitfalls.md)。

## 2.6 怎么换一套配色（最常见需求）

1. 改 `@theme {}` 里的亮色令牌（尤其 `--color-fd-primary` 和 `--color-fd-accent-1/2/3`）。
2. 对应改 `.dark {}` 里的深色版（primary 记得调亮）。
3. 想改语义色（提示框颜色）改 `--color-fd-info/success/warning/error`。
4. 玻璃浓淡改 `--fd-glass-bg(-strong)` 的 `color-mix` 百分比。
5. `pnpm build` 后截图自查浅 / 深两套。

> **红线**：不要在组件 `.tsx` 里硬编码颜色（如 `bg-blue-500`、`#xxxxxx`、`oklch(...)`）。
> 一律用 `--color-fd-*` / `--fd-glass-*` 变量或 `text-fd-*` / `bg-fd-*` 工具类，才能跟随主题与深浅色。

---

## 2.7 排版微调：prose 行高 / 背景网格 / 侧边栏 folder icon 多彩

这一节列三个「不算换配色，但改了就要心里有数」的小调整。

### 2.7.1 prose 行高 1.75 → 1.4

Tailwind Typography 默认正文 `line-height: 1.75` 配合 MiSans VF 中等 x-height 看起来偏松。
项目里把 `.prose` 与 `.prose :where(p, ul, ol, li, dd, dt, blockquote, table, figure)` 都压到 1.4。
heading 不动（它们各自有更紧的 1.1–1.3）。

调整位置：`app/global.css` `.prose { ... line-height: 1.4 }`。

### 2.7.2 文档页背景网格 alpha 5% → 3%

`#nd-docs-layout::before` 画 56×56px 网格 + 椭圆遮罩淡出。原色是
`color-mix(in oklch, var(--color-fd-foreground) 5%, transparent)`——5% 在浅色磨砂玻璃背景上
**仍显扎眼**，调成 3% 后是淡淡的"若有似无"。

调整位置：`app/global.css` 的 `#nd-docs-layout::before / #nd-notebook-layout::before` + `.dark` 同位。
**记得亮暗两处一起改**——只改亮色会被暗色覆盖。

### 2.7.3 侧边栏 folder icon 多彩（青/靛/紫/蔚蓝/青绿/蓝紫轮转）

实现思路与坑 #16 强耦合（**先读坑 #16 再动这里**）。三个要点：

1. **hook**：用 `[data-radix-scroll-area-viewport]` 作为页树根（不要用 ul/li，v16 已经废弃）。
2. **轮转变量**：
   ```css
   #nd-sidebar [data-radix-scroll-area-viewport] > div > :nth-child(6n+k) {
     --folder-accent: oklch(...);
   }
   ```
   子级 leaf 自动通过 CSS 变量继承拿到父 folder 的色相。暗色版用 `oklch(... 0.78 ...)` 提亮。
3. **上色**：`#nd-sidebar button > svg:first-child, #nd-sidebar a > svg:first-child { color: var(--folder-accent); }`。
   folder trigger button 内 element children 只有 2 个 svg（folder-icon + chevron），`:first-child`
   精确指向 folder-icon；chevron 是第二个、不受影响。leaf `<a>` 内只有 1 个 svg，命中即着色。

色板与 `HomeShowcase` 面板的 `nth-child(6n+k)` accent 完全一致，整体视觉有连续性：

| nth | hue | 色相 |
|-----|-----|------|
| 6n+1 | 200 | 青 |
| 6n+2 | 250 | 靛 |
| 6n+3 | 300 | 紫 |
| 6n+4 | 220 | 蔚蓝 |
| 6n+5 | 165 | 青绿 |
| 6n+6 | 275 | 蓝紫 |

调整位置：`app/global.css`「侧边栏 folder / leaf icon 多彩着色」段。
**红线**：写新 selector 之前**先用 Chrome DevTools Protocol 抓真实 DOM**，确认 `[data-radix-scroll-area-viewport]` 仍是 sidebar 唯一 hook；别凭印象沿用旧 `ul[role="list"]`（坑 #16）。

### 2.7.4 顶部导航中心三按钮 · 多彩 ICON + 玻璃下拉

顶部 `.glass-header` 中央三个下拉按钮（Quick Start / Plugin Series / Version）原本用
emoji（如 🎉 / 💖）做 icon——emoji 在不同 OS / 浏览器下渲染不稳定、粗细不一致，
与侧边栏 lucide 多彩 icon 的设计语言完全脱节。改成 lucide + 与侧边栏**完全同源**的
6 色板，整体视觉就连续了。

**两个改动**：

1. **`.glass-popover` 玻璃下拉面板**（旧 `bg-fd-popover/95 backdrop-blur-md`）：
   磨砂玻璃感太弱、和 `.glass-header` 不在一个层级。**改成显式 `oklch(0.99 0.003 250)`**
   （亮色，约 99% 不透明度的近白冷灰）+ `saturate(180%) blur(20px)`，暗色版用
   `oklch(0.26 0.014 262)`。`var(--fd-border-soft)` 仍复用做边框，drop shadow
   用 `color-mix(in oklch, var(--color-fd-foreground) 38%, transparent)` 增强层次。

   **不要**用 `var(--fd-glass-bg-strong)` —— 它是 `color-mix(in oklch, white 72%, transparent)`，
   28% 透明度在浅色页面上几乎"看不见"（之前第一版踩过这坑，用户反馈「完全透明」）。
   玻璃感来自 `backdrop-filter: saturate(180%) blur(20px)`，底色**必须**实，
   否则磨砂效果会"透"过页背景把面板稀释掉。

   所有下拉面板（Quick Start / Plugin Series / Version / Language）一律走
   `.glass-popover`，不要再回退到 fumadocs 默认 popover。

2. **多彩 ICON（必须用 inline `style={{ color }}`）**：
   - 三个主按钮各分一色：`Quick Start → 蔚蓝` / `Plugin Series → 紫` / `Version → 靛`。
   - 下拉子项按 6 色循环（青 / 靛 / 紫 / 蔚蓝 / 青绿 / 蓝紫），与侧边栏 folder / leaf
     完全同套色板。
   - **颜色通过组件的 `style={{ color: 'oklch(...)' }}` 直接写到 svg 的 `color` 属性上**。
     不要走 CSS 变量继承 + 工具类的方案（`.nav-trigger__icon { color: var(--nav-accent) }`）
     —— 之前试过这套，被父级 `text-fd-muted-foreground` 等高优先级 utility class
     覆盖，icon 全显示成灰色。inline style 在所有 utility class 之上，**稳**。
   - 数据来源是 `lib/nav-config.ts` 的 `color` / `colorDark` 字段（不是 CSS 变量），
     渲染端 `pickColor(color, colorDark)` 根据 `isDark` 选一个，写到 `style` 上。

**icon 渲染约定**：

- `lib/nav-config.ts` 的 `NavItem.icon` / `NavSubItem.icon` 是 lucide-react **命名导出字符串**。
- 渲染端（`components/DocsNav.tsx` 的 `getIcon`）走
  `(LucideIcons as Record<string, LucideIcon>)[name] ?? null`，
  找不到就 null 静默跳过，不报错。
- 任何新加的 icon 名称**必须**先经
  `node -e "const {icons} = require('lucide-react'); console.log('<NAME>' in icons)"`
  验证为 `true`（见 [七、坑 #19](./07-pitfalls.md)）。
- 当前 nav 用到的所有 icon 名称都已在
  `dev_docs/references/02-theme-and-styling.md` §2.7.4 注释里列出，详见 `lib/nav-config.ts` 顶部注释。

**三个主按钮的 popover 全部靠左向下展开**（Quick Start / Plugin Series / Version）：

- 早期实现里前两个 popover 用 `absolute left-0`（popover 左边缘对齐按钮左边缘 → 向**右**展开），
  Version 单独用 `absolute right-0`（向**左**展开）——三个按钮展开方向**不一致**，视觉上很乱。
- 改为统一**靠左展开**：popover **左边缘**对齐按钮**左边缘**，popover 从按钮左边缘**向右**展开。
  三个主按钮统一 className 为
  `glass-popover absolute left-0 top-full mt-1.5 min-w-[...] p-1.5 animate-in fade-in slide-in-from-top-2`。
  `left-0` 是定位属性（不是 `transform`），不与 animate-in keyframe 的
  `transform: translate3d(0, var(--tw-enter-translate-y, 0), 0)` 冲突，
  所以**可以保持 flat 结构**，不需要再套 wrapper。
- **右侧的 Language Switcher popover 仍用 `right-0`**——它是右上角按钮，
  靠左展开反而会让 popover 越出左边界；不要为了"统一"把它也改成 `left-0`。
- 调整位置：`components/DocsNav.tsx` 三个主按钮的 popover 块（map 里两个 + Version 一个）。

**Dev server 缓存陷阱**：global.css 改动后 Next.js 16 + Turbopack 的 dev server
偶尔不重打 CSS bundle，需要：
- `touch app/global.css` 触发 HMR（不一定有效）
- 或直接 `taskkill /F /PID <next dev>` 重启 dev server（最稳）

调整位置：
- `.glass-popover` 段：`app/global.css`「DocsNav 下拉面板 · 玻璃质感」段。
- 主按钮 / 子项配色：已迁到组件 inline style，不再依赖 CSS 变量。
- 渲染逻辑：`components/DocsNav.tsx`。

**下拉面板子项 stagger 错开进入（短平快）**：

- 整块 popover 走 `animate-in fade-in slide-in-from-top-3` —— **Tailwind v4 默认 150ms**
  （`var(--tw-duration, .15s)`），所以原来组件里 `style={{ animationDuration: '150ms' }}`
  是冗余 no-op，**新版组件已删**。`slide-in-from-top-3` = -0.75rem，比 `slide-in-from-top-2`
  的 -0.5rem 更明显。
- 每条子项 `.nav-link` 再走自定义 `navLinkEnter`（200ms，Y 轴 **6px→0**），
  `animation-delay: calc(var(--i, 0) * 30ms)` 错开。
  `--i` 由组件 `style={{ '--i': i } as CSSProperties}` 注入（map 索引）。
- 12 项 Plugin Series 总时长 = 150 + 11×30 + 200 ≈ 680ms，
  体感是"列表一条条快速滑入"，不是瀑布。
- 6px 起步（4px 在 4K 屏上几乎看不出来）+ 200ms 时长（180ms 偏快瞥一眼看不到），
  加大幅度后即使瞥一眼也能感知到 stagger。
- 模式与 `components/Contributors.tsx` + `app/global.css` `.contrib__item` 走完全一致的
  `style={{ '--i': i }}` + CSS 变量方案 —— **项目惯用模式，别用 `style={{ animationDelay: ... }}` 替代**。
- `animation-fill-mode: backwards` 写进 `navLinkEnter` 的 shorthand 里：
  delay 期间 from 状态就生效，前几条子项在未开始动画前是隐藏的（避免"先出现再缩回去"的跳变）。
- **🆕 项目动画策略：所有动画在所有设备上完整显示，不响应 `prefers-reduced-motion: reduce`**。
  这是产品决策（与 `.fd-title-arcs__orb--1/2/3` 的 `orbFlow1/2/3`、`HomeHero` 鼠标视差、
  `Reveal` 模糊入场、`contrib__item` 弹跳、`TitleArcs` 装饰动画保持一致）。
  - **不要**给 popover 子项、整块 popover、文档页背景装饰等任何动画加
    `@media (prefers-reduced-motion: reduce) { animation: none }` 降级块。
  - 项目里**唯一保留**的 reduce 媒体查询是 orb 动画的 `!important` 强制开启块
    （`app/global.css` 第 3186 行附近），作用是覆盖 UA 兜底
    （某些浏览器在 reduce 模式下默认禁 CSS 动画），与"不响应 reduce"策略一致。
  - 如未来需要为前庭敏感用户提供 a11y 降级，应在 `#nd-docs-layout` 顶层加
    一个全局 reduce 块统一处理，而不是每个动画单独加。
- **冲突检查**：`.nav-link` 当前**没有 `transform` 相关的 transition**（只有 `color 0.18s`、`filter 0.18s`），
  所以 keyframe 与 hover 状态不冲突。`.nav-link__icon` 的 `transform 0.2s` 是子元素独立规则，也不冲突。
- **红线**：
  - **不要**在 `.nav-link` 上额外加 `transform` 相关的 `transition`（hover/active）—— 会和 keyframe 打架。
  - **不要**把 stagger 间隔调到 >40ms 或子项动画时长 >250ms —— 偏离"短平快"语义。
  - **不要**改用 `style={{ animationDelay: '${i * 30}ms' }}` 直接写 —— 项目惯用 CSS 变量 `calc(var(--i) * Nms)` 模式。
  - **不要**重新加回 `style={{ animationDuration: '150ms' }}` —— 是 no-op 冗余。
  - **不要**给 popover 动画新增 `prefers-reduced-motion` 降级块 —— 违反项目策略。

调整位置：
- `.nav-link` 动画规则与 `@keyframes navLinkEnter`：`app/global.css`「下拉面板内 nav-link」段之后。
- 组件 `--i` 注入、冗余 `animationDuration` 删除、整块 `slide-in-from-top-2` → `slide-in-from-top-3`：`components/DocsNav.tsx` 三处 popover。

---

## 2.8 文档页 banner 网格重排（关面包屑 + 按钮移到右下）

文档页大标题区（`.fd-doc-banner`）是 grid：

```
[左列: title + description][右列: LLMCopyButton + ViewOptions]
```

左列 `align-items: end` 让按钮组贴右列底部，与 description 行底视觉对齐。`@media (max-width: 40rem)` 切回单列堆叠。

- **`breadcrumb={{ enabled: false }}`**：完全关掉 fumadocs 默认面包屑（用户决定不在文档页显示章节小字）。
- 原来 banner 下方的 `LLMCopyButton + ViewOptions` 一整行 `<div className="flex flex-row items-center gap-2 mb-7">` 已删除，按钮搬进 `.fd-doc-banner__actions`。
- 边框 `border-bottom: 1px solid var(--fd-border-soft)` 与 `.fd-doc-banner` 自身的 `margin-bottom: 0.75rem` 给正文留出**收敛**的呼吸（旧值 1.25rem 偏长）。
- 配合 `.prose > :first-child { margin-top: 1.25rem !important }` + `.prose.prose > div[style*="--callout-color"]:first-child` 高特异覆盖，
  banner 与正文首元素（H2 / Callout / p 等）之间的可见距离统一收敛到约 2rem，
  避免 h2 / callout 各自不同 margin-top 造成的跳变。详见 [七、坑 #21](./07-pitfalls.md)。

详见 [七、坑 #18](./07-pitfalls.md)。
