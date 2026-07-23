# 九、首页 PPT 式硬翻页 + 真实控制台内嵌

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[八、字体切片](./08-font-slice.md) · **下一章**：[十、实时聊天室](./10-chat-route.md)

本章是**首页交互与主页控制台演示**的交接文档。覆盖：

- `HomePager`：一滚一页的硬翻页 + 右下角回顶
- `HomeShowcase`：6 张面板 + 同源 iframe 内嵌真实 Demo SPA
- `HomeHero`：鼠标视差背景（回顶不卡手）
- `public/hub/`：入库的控制台 Demo 产物（**无 submodule**）
- Features 区 lucide 图标、错落入场、横幅常转、防白屏、防滚动链、性能边界

**源码永远是事实源**。改完行为后请同步本章与 [七、已知坑](./07-pitfalls.md) 中相关条目。

---

## 9.1 设计目标（产品约束）

| 目标 | 说明 |
|------|------|
| PPT 硬翻页 | 一滚 / 一键 = 一页；不出现两页夹缝的中间态 |
| 严格满屏 | 每页 `min-height: calc(100svh - 56px)`，**不露邻页一角** |
| 真实控制台 | 展示与原 gsuid_hub **完全一致**的可交互 SPA，**禁止**手绘抽象 Mock |
| 无白屏等待 | 用户滚到某屏时，iframe 应已 paint 过；翻页过程中**不得** `display:none` / 卸载已画过的 frame |
| 入场动画 | 文字错落（stagger）+ live 框与 title 同节奏（`--stagger: 2`） |
| 标题横幅 | 「强大，且易于上手」页上下 marquee **永远在动** |
| 回顶顺滑 | 滚/点回首屏后 Hero 背景**立刻**跟鼠标，不「卡一帧再跟手」 |
| Features 图标 | lucide 线型，**无** emoji、**无**矩形 icon 底；左上角贴齐 |
| 无 submodule | 不挂 `external/gsuid_hub`，CI / `pnpm dev|build` 不编译 hub |

### 无法同时 100% 的三角（务必告知接手者）

在「**6 个重 SPA 常驻** + **满 blur 入场** + **接近 120fps 滚动**」之间存在硬权衡：

| 若坚持… | 会牺牲… |
|---------|---------|
| 零白屏 | 必须会话内挂住 iframe，内存与合成层成本上升 |
| 满 blur 全程 | 翻页中滤镜卷积易掉帧 |
| 极致帧率 | 只能在翻页时关掉**部分**大块 blur，并 postMessage 让 hub 暂停内部动画 |

**当前策略（可承诺）**：

1. **不白屏**：iframe 会话内挂上后永不卸载；翻页只禁 pointer-events，不改 opacity / 不 `content-visibility:hidden` 藏 frame。
2. **动画可见**：`homepager:goto` 时立刻打 `.is-in`，与滚动同步；文案保留 stagger；大 shot 框翻页中关 blur 减负，停滚后仍可走完整过渡。
3. **卡顿「明显减轻」**：`home-scrolling` 减负**有选择**（见 §9.4 / §9.7）；**禁止**为减负而开关顶栏 `backdrop-filter` 或 Hero `transform:none`（回顶会卡）。hub 非 active 时 `postMessage` 降活。**不能**保证在低端机上恒定 120fps。

---

## 9.2 「PPT 页」清单

由 `.home-snap-point` 标记，`HomePager` 扫描 `offsetTop` 做吸附：

1. `HomeHero`（首屏）
2. Showcase 标题页（`.home-showcase__head`）— 含上下 `MarqueeRow alwaysRun`
3. 6 × `.showcase-panel`（各一深链 iframe）
4. `#features`
5. `#community`（可能高于一屏 → 页内先滚，到底再切页）

挂载入口：`app/[lang]/page.tsx` 引入 `<HomePager />` + 首页 section。

---

## 9.3 为什么不能用 CSS `scroll-snap`

`scroll-snap-type: mandatory` 只在**手势结束后**吸附，wheel 过程中仍可停在两页之间，观感是无极滚动。  
**结论**：硬切换必须由 `HomePager` 接管 `wheel / keydown / touch` 并 `preventDefault`。

`app/global.css` 对首页只保留：

```css
html:has(.home-page) {
  scroll-padding-top: 4.5rem;
}
```

**红线**：不要再写 `scroll-snap-type` / `scroll-snap-align`，会和脚本抢主。

---

## 9.4 HomePager（`components/HomePager.tsx`）

`'use client'`。主逻辑在 effect；UI 仅 **右下角回顶钮**（`createPortal` → `document.body`）。

### 核心参数（以源码为准）

| 常量 | 当前值 | 含义 |
|------|--------|------|
| `ANIM_MS_BASE` | **520** | 邻页翻页基准时长（ms） |
| `ANIM_MS_MAX` | **900** | 远距（如回顶）上限；`base + (dist/viewH)*120` |
| 缓动 | `1-(1-t)^4` | ease-out 感 |
| `WHEEL_THRESHOLD` | 10 | 忽略微抖 |
| `TOUCH_THRESHOLD` | 40 | 触控判定 |
| `HEADER` | 56 | 与 fixed 顶栏对齐 |

### 滚动路径设计（性能）

- 动画循环内**只写** `scrollTop`，不读 layout、不 `setState`、不触发 React。
- 页顶坐标在首次 `snapshotPages()` 时缓存；`resize` 才 `invalidate`。
- 翻页开始：立刻打 `html.home-scrolling`（CSS 减负 + 禁 iframe 点）。
- **落点收尾 `finishScroll`（关键）**：
  1. 先把 `scrollTop` 钉在目标；
  2. **双 `rAF`** 后再卸 `home-scrolling` 并派发 `homepager:done`；
  3. 避免「落点 + 卸 class + React 更新」挤在同一帧 → 回顶背景假死。
- 动画中**不** `setState` 回顶钮；结束后 `setShowBackTop` 且值不变则跳过。

### 自定义事件（与 HomeShowcase 协作）

| 事件 | 时机 | payload |
|------|------|---------|
| `homepager:goto` | 动画**起步瞬间**（已 `home-scrolling`） | `{ scrollY: number }` 目标滚动位置 |
| `homepager:done` | **双 rAF 之后**（已卸 `home-scrolling`） | 无 |

Showcase 在 `goto` 时用 **纯 DOM** 给目标页加 `.is-in`（**禁止 setState**）。  
`scrollY < 48`（回顶到 Hero）时只清 showcase 的 `is-in`，**不**批量重开入场（避免 6 面板同时 blur 过渡）。  
在 `done` 后再延一帧 `setActiveIdx`。

### 交互过滤

`isInteractiveTarget` 命中时不拦截翻页，包括：

- `input` / `textarea` / `select` / contentEditable
- 搜索弹窗、dialog
- `.marquee`
- **`iframe` / `.showcase-panel-embed` / `.showcase-shot__media|__frame`**
- **`.home-back-top`**

### 回到顶部（右下角）

- **portal 到 `document.body`**，避免 HomeLayout 的 transform 把 `fixed` 锚错容器（曾表现为「写了 right 仍贴左下」）。
- CSS：`left: auto !important; right: max(1rem, safe-area) !important; bottom: …; z-index: 60`
- 显示：snap 索引 ≥ 1 或滚过约半屏 / 120px
- 点击：同一套 `animateScrollTo` 到首个 snap，**可打断**进行中的翻页
- 文案：`lib/home-content.ts` → `backToTop`（zh/en/ja）→ `page.tsx` 传入
- 样式：`.home-back-top` / `.is-visible`；窄屏仅图标 + `aria-label`

### 高页处理

`pageH > viewH + 48`（如 community）时：向下先页内滚 `viewH * 0.9`，到底再切下一 snap；向上先回页顶再切上一页。

---

## 9.5 HomeShowcase（`components/HomeShowcase.tsx`）

### 数据

来自 `lib/home-content.ts`：

- `showcase.items[]`：`eyebrow` / `title` / `desc` / `points` / `embedSrc`（等）
- `hubEmbed(route)` → `/hub/index.html?embed=1#/${route}`
- 三语 6 条深链固定为：`dashboard` · `database` · `plugins` · `themes` · `ai-memory` · `ai-meme`
- `liveBadge`：右下角「● 实时演示」类文案

> 历史字段 `img` / `playLabel` 可能仍在类型或文案里残留；**当前 UI 不再用截图蒙层**，画面只有 live iframe（或挂载前的占位底色）。

### 架构总览

```
HomeShowcase
├── head (snap) + MarqueeRow alwaysRun ×2
└── list
    └── panel ×6 (snap)
        ├── copy（showcase-fade + --stagger 0..n）
        └── shot（showcase-fade --stagger:2）
            └── PanelEmbed（独立 iframe，src=hubSrc）
```

### 挂载策略（防白屏的核心）

| 规则 | 实现 |
|------|------|
| 会话内挂上即不卸 | `mounted: Set<number>` 只增不减 |
| 首屏第 0 项立即挂 | `useState` 初始化含 `0` |
| 其余错峰挂 | `400 + i * 450` ms，避免 6 份 SPA 同时 parse |
| 资源预热 | `prefetchHubAssets()`：`modulepreload` / `preload` hub 主包 |
| **禁止** | 按「当前+相邻」卸载远处 iframe；`display:none`；对 iframe 用 `content-visibility:hidden` |

曾试过「仅当前+下一屏」卸载远处：回滚时**每次约 1s 白屏**。结论：**不白屏只能常驻已 paint 的 iframe**。

### PanelEmbed

- 逻辑分辨率 **1440×900**；`ResizeObserver` 写 `--embed-scale` 与 **居中偏移** `--embed-ox` / `--embed-oy`（`translate3d` + `scale`，`transform-origin: top left`）。仅 top-left scale 会在信箱留白时显得「偏上」。
- `painted`：**只升不降**。`isHubPainted` 查 iframe 内 `#root` 有子节点；超时 2s 兜底。
- 一旦 `data-painted="true"`，frame `opacity:1`，翻页也不改回 0。
- `postMessage`：`{ source:'gshub-docs', type:'embed-visibility', visible: painted && active && !scrolling }`  
  **`scrolling` 直接读 `html.home-scrolling`**（`MutationObserver` 只 postMessage，**禁止**再引入 `pageScrolling` React state——曾在回顶瞬间重渲 6 iframe）。
- **滚动链密封** `sealIframeOverscroll`：注入 `overscroll-behavior` 到 iframe 文档。

### 入场动画

- 类名：`.showcase-fade` + 父级 `.is-in`
- 默认态：`opacity:0; translateY(28px); blur(6px)`；时长约 **1s / 1.05s**
- 错落：`transition-delay: calc(var(--stagger) * 95ms)`
- 文案 stagger：`0` index → `1` eyebrow → `2` **title** → `3` desc → `4+` points
- **live 框与 title 同步**：shot 也是 `--stagger: 2`
- 触发：
  1. **`homepager:goto`** → `playEnterForScrollY` 纯 DOM（回顶 `scrollY<48` 只清 `is-in`）
  2. 静止时 **IntersectionObserver**（`threshold: 0.4`）补双向进出
- 翻页中：`.home-scrolling .showcase-shot.showcase-fade { filter: none }` 只卸大框 blur。

### active 语义

- `activeIdx`：当前面板；驱动 `data-active`、`tabIndex`、live 徽章、`embed-visibility`。
- 滚动中只更新 `pendingIdxRef`；**`homepager:done` 后再延一帧** `setActiveIdx`。

---

## 9.6 Marquee（`components/Marquee.tsx`）

| 模式 | 驱动 | 用途 |
|------|------|------|
| 默认 | CSS `@keyframes` | 页面中部独立大 marquee（若有） |
| **`alwaysRun`** | rAF 写 `translate3d` | Showcase 标题页上下两行 |

`alwaysRun` 原因：

1. `.home-scrolling .marquee__track { animation-play-state: paused }` 会冻 CSS 动画
2. 浏览器对**屏外 / 后台** CSS 动画会节流，用户滚回标题页时像「停了」

实现要点：关 CSS animation；按 track 半宽与 40s/52s 算速度；`dt` 封顶 64ms 防切后台大跳。  
CSS：`.marquee__row--always .marquee__track { animation: none !important; will-change: transform }`  
翻页时对 `.home-showcase__marquee` 强制 `animation-play-state: running`（双保险；rAF 路径本就不依赖它）。

---

## 9.7 CSS 关键钩子（`app/global.css`）

| 选择器 / 类 | 作用 |
|-------------|------|
| `.home-scrolling …` | **有选择**减负：暂停普通 marquee、shot 辉光、大 shot/reveal 的 blur、iframe `pointer-events:none` |
| （**不要**在 home-scrolling 里做的） | ❌ 关/开 `.glass-header` 的 `backdrop-filter`；❌ Hero `transform:none` / orb `filter:none` |
| `.home-snap-point` | Pager 吸附点 |
| `.home-showcase__head.home-snap-point` | 满一屏 + 负 margin 抵消 section padding |
| `.showcase-panel` | 满一屏 `100svh/dvh - 56px`，`gap:0` 列表 |
| `.showcase-fade` / `.is-in` | 错落入场 |
| `.showcase-panel-embed` / `__frame` | 1440×900 + `--embed-ox/oy` 居中；`data-painted` → opacity |
| `.showcase-shot__live` | ● 实时演示徽章 |
| `.home-showcase__marquee` | 标题页横幅 + always 行 |
| `.home-back-top` | 右下角回顶（portal body） |
| `.feature-card` / `__icon` | Features：lucide 左上角大图标，无矩形底 |

**红线回顾**：

- ❌ 对 iframe 使用 `display:none` / `content-visibility: hidden`
- ❌ 面板 `min-height: 88vh` / 列表 `gap` 非 0
- ❌ 翻页动画里 `setState` 打 is-in / `pageScrolling` 驱动 6 iframe 重渲
- ❌ 为「减负」开关顶栏 backdrop 或 Hero transform/filter（回顶卡顿，见坑 #41）

---

## 9.8 `public/hub/` 真实 Demo SPA

### 架构

```
public/hub/                          ← 入库静态产物（~数 MB）
  index.html                         ← HashRouter，base=/hub/
  assets/js/*.js + assets/*.css
  demo-memes/  demo-plugin-icons/  ICON.png  ...
        │
        ▼  同源 iframe
  /hub/index.html?embed=1#/dashboard
  /hub/index.html?embed=1#/database
  ...
```

| 项 | 状态 |
|----|------|
| `external/gsuid_hub` submodule | **已删除**，勿恢复 |
| `scripts/hub.mjs` | **已删除** |
| `pnpm dev` / `pnpm build` | **仅 Next**，不编 hub |
| CI（`deploy-next.yml`） | 注释写明无需 submodule |
| Demo 能力 | 内置 Mock `fetch`、假 admin、种子数据；**免登录** |
| `?embed=1` | 嵌入锁定：侧边栏可见但不可点等 |

### URL 构造

```ts
// lib/home-content.ts
export const HUB_DEMO_BASE = process.env.NEXT_PUBLIC_HUB_BASE || '/hub';
const hubEmbed = (route: string) =>
  `${HUB_DEMO_BASE}/index.html?embed=1#/${route}`;
```

`HomeShowcase.hubSrc` 兼容：完整 `index.html?...` 或仅 hash 路径。

### 如何更新 Demo 产物

1. 在 **gsuid_hub** 仓库（含 demo 构建的分支，如 `feat/demo-mode`）执行：  
   `yarn build:demo`（`base=/hub/`，`outDir=dist-demo`）
2. 将 `dist-demo/**` **整目录覆盖**到本仓库 `public/hub/`
3. 若主包 hash 变了，同步改 `HomeShowcase.tsx` 里 `HUB_ASSETS` 预热列表文件名
4. `pnpm dev` 冒烟 6 个深链：无登录墙、有 Mock 数据、无 `localhost:8080`
5. 提交 `public/hub/`（+ 如有预热列表变更）

### 历史方案（勿回退）

| 阶段 | 做法 | 结果 |
|------|------|------|
| v1–v8 | submodule + 构建时烤 hub | CI 重、依赖 yarn、卡顿需堆优化 |
| 失败尝试 | 本仓库手绘 `HubMock` 抽象 UI | **视觉不可接受**，已整目录删除 |
| 截图 → 再 live | 先静图再点进 iframe | 用户反馈割裂；已弃用 |
| 延迟到「滚到才挂」 | 白屏等待 | 已弃用 |
| 当前+邻屏卸载 | 回滚白屏 ~1s | 已弃用 |
| **当前** | `public/hub/` 入库 + 会话常驻 iframe + 错峰挂载 | 完全复刻 + 可接受性能 |

更细的 Mock / API 对照与早期迭代：`plans/interactive-hub-showcase.md`（**历史计划**，以本章 + 源码为准）。

---

## 9.9 HomeHero

- **只**用鼠标视差写 `--mx/--my`（`.hero-px__eyes` / grid / orb / logo 等用 `translate3d` 跟变量），**不**跟滚动做 transform。
- 视差**全程运行**（含 `home-scrolling`）：`mousemove` 同步推进一段 + rAF 补帧；不因翻页停写变量。
- CSS **禁止**在 `.home-scrolling` 下对 Hero 层 `transform: none` / orb `filter: none`（回顶会跳变 + 重开 blur，见坑 #41）。
- 眼睛：`public/home/eyes.png`；**无** CSS 眨眼。

---

## 9.9.1 Features「开发优势」图标

- 数据：`lib/home-content.ts` 的 `features[].icon` 为 **字符串键**（非 emoji）：  
  `platforms | bots | protocol | console | plugins | database | docs | opensource`
- 渲染：`components/FeatureIcon.tsx` → lucide（`Layers2` / `Bot` / `Share2` / `LayoutDashboard` / `Puzzle` / `Database` / `BookOpen` / `GitBranch`）
- 布局：`.feature-card` `align-items: flex-start`；图标 class **`feature-card__icon`**（勿用泛名 `.icon`），约 2.15rem，**无矩形背景**，文档流第一项贴左上
- 页面：`app/[lang]/page.tsx` 的 `#features` 网格

---

## 9.10 文件清单

| 文件 | 作用 |
|------|------|
| `components/HomePager.tsx` | 硬翻页 + 双 rAF 收尾 + portal 回顶钮 |
| `components/HomeShowcase.tsx` | 标题页 / 6 面板 / 常驻 iframe / 入场 |
| `components/Marquee.tsx` | `MarqueeRow` + `alwaysRun` rAF |
| `components/HomeHero.tsx` | 首屏 + 全程鼠标视差 |
| `components/FeatureIcon.tsx` | Features lucide 映射 |
| `lib/home-content.ts` | 三语文案 + `hubEmbed` / `embedSrc` / `liveBadge` / `backToTop` / feature icon 键 |
| `public/hub/**` | Demo SPA 静态产物 |
| `app/[lang]/page.tsx` | 组装首页 |
| `app/global.css` | snap / showcase / embed / home-scrolling / back-top / feature-card |
| `package.json` | `dev`/`build` = 纯 next |
| `deploy-next.yml` | 无 submodule |
| `plans/interactive-hub-showcase.md` | 历史方案（非现行规范） |

---

## 9.11 测试清单（接手验收）

### 翻页

- [ ] 滚一格 / 触控板轻扫 / ↓ / PageDown / 空格 → 整页切走，**无**两页夹缝
- [ ] 邻页不露出约 10% 一角（满 `100svh - 56px`）
- [ ] community 页内可滚，到底再切下一 snap
- [ ] 搜索弹窗 / iframe 内操作时不误触发翻页
- [ ] 键盘 Home / End 到首尾 snap

### 控制台

- [ ] 6 屏均为真实 SPA（非手绘卡），深链正确
- [ ] 无登录页、有 Mock 数据
- [ ] 请求同源 `/hub/...`，无 `localhost:8080`
- [ ] `?embed=1` 侧栏可见不可点
- [ ] 主题改动不跨面板串台（demo 侧隔离）

### 白屏 / 动画 / 横幅 / 回顶

- [ ] 首次进入后错峰加载；**再次滚回**已访问屏**不出现 ~1s 白屏**
- [ ] 切页时文字错落可见；live 框与 title 同时起步
- [ ] 标题页上下大字横幅在翻页前后、停留时都在动
- [ ] 内嵌列表滚到底**不会**把外层 HomePager 带走（overscroll 密封）
- [ ] 离开 Hero 后**右下角**出现回顶钮；点/滚回顶后 Hero 背景**立刻**跟鼠标，无明显「卡一下」
- [ ] Features 卡片左上角为 lucide 线型图标（无 emoji、无方底）

### 构建

- [ ] `pnpm build` 成功；`out/hub/index.html` 存在
- [ ] 仓库无 `.gitmodules` / `external/gsuid_hub` / `scripts/hub.mjs`

---

## 9.12 改动指南（常见任务）

| 想做… | 改哪里 | 注意 |
|-------|--------|------|
| 改展示文案 / 深链 | `lib/home-content.ts` | 三语同步；深链只改 hash 路由名 |
| 改翻页手感 | `HomePager` 的 `ANIM_MS_BASE/MAX` / ease | 远距回顶会自动加长 |
| 改入场时长 / 错落 | `.showcase-fade` + `--stagger` 乘子 | 别在 goto 路径加 setState |
| 更新控制台 UI | 覆盖 `public/hub/` | 同步 `HUB_ASSETS` hash |
| 减内存 | **不要**卸载 iframe 除非接受白屏 | 可降 hub 包体积 / mock 资源 |
| 加第 7 屏 | home-content items + 可选预热 | 常驻 +1 SPA |
| 换 Features 图标 | `FeatureIcon.tsx` 映射 + home-content 键 | 勿回退 emoji / 矩形底 |
| 回顶钮位置/文案 | `.home-back-top` / `backToTop` | 必须 portal body + 物理 right |

---

## 9.13 相关坑

见 [七、坑 #36–#43](./07-pitfalls.md)：

| # | 主题 |
|---|------|
| 36 | iframe 白屏 |
| 37 | 邻页露边 |
| 38 | 横幅停转 |
| 39 | 滚动链 |
| 40 | 禁 HubMock / submodule |
| 41 | **回顶背景卡顿**（header backdrop / Hero transform / pageScrolling 重渲） |
| 42 | 回顶钮写了 right 仍贴左下（需 portal body） |
| 43 | Features 图标：lucide + `feature-card__icon`，禁 emoji/方底 |
