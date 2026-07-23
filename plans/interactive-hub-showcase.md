# 主页截图「活化」方案与落地：可交互的 gsuid_hub 演示

> 状态：⚠️ **历史方案文档** — v1 → v8 描述 iframe + **submodule 构建时烤产物**。
> **当前形态（2026-07）**：仍用 **真实 Demo SPA iframe**（完全复刻原控制台），但产物
> **固定入库** `public/hub/`，**已删除** `external/gsuid_hub` submodule 与 `scripts/hub.mjs`。
> 另有会话常驻 iframe / 防白屏 / 错落入场 / alwaysRun 横幅等，**一律以**
> `dev_docs/references/09-home-ppt-pager.md`（整章）+ `dev_docs/references/07-pitfalls.md` 坑 #36–#40 为准。
> 本文档只保留 Mock/API 对照与早期迭代记录；更新演示 = 上游 `yarn build:demo` 后覆盖 `public/hub/`。
>
> 涉及项目：`GenshinUID-docs`（本仓库）+ 历史上的 `gsuid_hub` Demo 构建
> 目标读者：同时了解控制台与文档站的维护者

---

## 目录

1. [背景与目标](#1-背景与目标)
2. [总体架构（最终：单仓库 / 单命令 / 单部署）](#2-总体架构最终-单仓库--单命令--单部署)
3. [gsuid_hub 结构分析（关键发现）](#3-gsuid_hub-结构分析关键发现)
4. [Mock 方案设计](#4-mock-方案设计)
5. [gsuid_hub 仓库改动](#5-gsuid_hub-仓库改动)
6. [GenshinUID-docs 仓库改动](#6-genshinuid-docs-仓库改动)
7. [如何使用](#7-如何使用)
8. [关键改动文件清单](#8-关键改动文件清单)
9. [验证方式](#9-验证方式)
10. [风险与注意事项 / 已知限制](#10-风险与注意事项--已知限制)
11. [收尾：你需要手动完成的步骤](#11-收尾你需要手动完成的步骤)
12. [修订记录（v1 → v8）](#12-修订记录v1--v8)

---

## 1. 背景与目标

主页 `HomeShowcase` 区目前用 6 张**静态截图**展示 gsuid_hub 控制台的运行效果（看板 / 插件 / 主题 / AI 记忆 / 表情包）。截图无法点击、不能交互，且控制台一旦改版截图就会过期。

**目标**：让这些「截图」变成**真·可点击、可交互**的控制台页面，且：

- 不复制 hub 的组件到 docs（两边技术栈不同，复制必然 drift）；
- 不需要运行真实后端、不需要真实鉴权（访客无账号、也不应暴露真实数据）；
- hub 保持**单一数据源**，docs 只负责「嵌入 / 链接」。

**核心思路**：给 gsuid_hub 增加一个**免登录 + Mock 数据**的「Demo 静态构建」，产物是纯静态 SPA（零后端依赖）。docs 把 Demo 烤进 `/hub/`，主页 6 张面板**滚入视口即自动内嵌实时 iframe**（默认内嵌、桌面逻辑缩放、侧边栏锁定），深链到对应页面，访客可直接在框内点击交互。

---

## 2. 总体架构（最终：单仓库 / 单命令 / 单部署）

```
GenshinUID-docs 仓库（umbrella，唯一发布单元）
  ├─ external/gsuid_hub/                    ← git submodule（pin 一个 commit）
  │     └─ yarn build:demo  (mode=demo, base=/hub/)
  │           · main.tsx 在 VITE_DEMO 下用 mockServer 覆写 window.fetch
  │           · /api/auth/me 返回假 admin → 跳过登录页
  │           · 所有 /api/* 命中 Mock 路由表，统一 {status:0,...} 封套
  │           · ?embed=1 时给 <html> 加 demo-embed 类，CSS 锁住侧边栏
  │           · demo 下用内存版 localStorage 顶替，避免 iframe 间串台
  │           ▼
  │        external/gsuid_hub/dist-demo/  (纯静态 SPA, HashRouter)
  │
  ├─ scripts/hub.mjs  ── 把 dist-demo/ 拷进 ──▶ public/hub/
  │
  └─ next build (output:'export')  ──▶  out/  （含 out/hub/）
        └─ HomeShowcase.tsx：滚入视口即懒挂载 <iframe src="/hub/index.html?embed=1#/dashboard">
        ▼
   一次性发布到 GitHub Pages：docs 在 https://docs.sayu-bot.com/ ，
                              可交互控制台在 https://docs.sayu-bot.com/hub/
```

- **本地开发（单命令、同源）**：`pnpm dev` = `node scripts/hub.mjs build && next dev --port 3000`。
  先把 hub Demo 烤进 `public/hub/`，再由 `next dev`(:3000) **同源**托管。iframe 走 `/hub/index.html?embed=1#/…`，
  **不再起独立 :8080 开发服**（那是早期「localhost 拒绝连接」的根源）。改了 hub 重跑 `pnpm dev` / `pnpm build:hub` 即可。
- **生产构建（单命令）**：`pnpm build` → 先 `node scripts/hub.mjs build`（在 submodule 内 `yarn build:demo` → 拷到 `public/hub/`），再 `next build` 导出。iframe 同样走同源 `/hub/index.html?embed=1#/…`。

两边都是**纯静态**（docs 是 `output:'export'`，hub demo 用 HashRouter + `base=/hub/`），同源托管、**无需任何服务器 rewrite / 跨域配置**。

---

## 3. gsuid_hub 结构分析（关键发现）

实施前需要知道的几件事，都已核实：

### 3.1 所有 API 经过同一个「瓶颈」——这是 Mock 的关键

`src/lib/api.ts`（4731 行，约 40 个 `xxxApi` 命名空间）里**每一个请求**最终都走 `ApiClient` 这个类。它的请求方法集中在：

| 方法 | 用途 |
|---|---|
| `request<T>()` | `get/post/put/patch/delete` 的底层，覆盖绝大多数调用 |
| `postFormData<T>()` | 表单 / 文件上传 |
| `postBlob()` / `downloadBlob()` | 文件下载（返回 Blob） |
| `getRaw<T>()` / `postRaw<T>()` | 需要完整 `{status,msg,data}` 封套的场景（如主题预设覆盖确认） |

所有方法内部都是 `fetch(\`${this.baseUrl}${endpoint}\`, ...)`。**只要在 Demo 入口覆写全局 `fetch`，就能一次性罩住所有 `/api/*` 请求**——比改 `ApiClient` 注入更稳，且能拦到内联 fetch。

> ⚠️ 例外：`api.ts` 里除了 `ApiClient` 的 7 处 `fetch`，还有 ~7 处**内联 fetch**（`authApi.uploadAvatar`、`brandApi.uploadIcon`、`memeApi.upload/import`、`ai/images` 上传等）绕过了 `ApiClient`。覆写全局 `fetch` 能一次性罩住**所有** `/api/*` 请求，零侵入 `api.ts`（4731 行不动），且只在 Demo 入口生效、对生产零影响。
>
> 另有 `<img src="/api/meme/image/…">`、`/api/brand/icon` 是 `<img>` 标签、**不走 fetch**，覆写拦不到。
> 故 Demo 下另把 `memeApi.getImageUrl` / `getBrandIconUrl` 两个 URL 构造函数加 `VITE_DEMO` 守卫，
> 直接返回内置 SVG `data:` 占位图 / `public/demo-memes/` 真实图，避免一墙裂图。

### 3.2 响应封套是统一的

```ts
interface ApiResponse<T> { status: number; msg: string; data: T }
// request() 内部：response.json() → 若 status !== 0 抛错 → 否则返回 data.data
```

**所有 Mock 返回值都必须包成 `{ status: 0, msg: 'ok', data: <真正的数据> }`**，否则页面会报错。

### 3.3 启动时必须满足的 4 个上下文（否则白屏/报错）

App 挂载时这几个 Provider 会立即打 API，Demo 必须把它们「喂饱」：

| Context | 启动调用 | Demo 处理 |
|---|---|---|
| `AuthContext` | `authApi.getCurrentUser()` → `GET /api/auth/me` | 返回假 admin User，`isAuthenticated=true`，**跳过登录页** |
| `BrandContext` | `brandApi.getBrand()` → `GET /api/brand` | 返回站点标题/副标题假数据（副标题短至「演示模式」，避免侧边栏品牌按钮过宽裁切「收起」按钮） |
| `AIStatusContext` | `aiWizardApi.getStatus()` → `GET /api/ai/wizard/status` | 返回「已配置」状态假数据 |
| 顶部布局 | `versionApi.*` → `GET /api/version`、`/api/version/bots` | 返回版本号、在线 bot 数 |

`User` 类型：`{ id, email, name, role: 'admin'|'user', avatar? }`，`avatar` 用 `/hub/ICON.png`。

### 3.4 路由表（HashRouter，截图直达对应页）

hub 用 `HashRouter`，所有页面在 `/` 下，`src/App.tsx` 路由如：
`dashboard / plugins / database / themes / logs / traces / ai-meme / ai-memory / ai-statistics / ai-kanban / ai-budget / plugin-store / persona-config / ...`（共 30+ 页）。

HashRouter 的深链形如 `…/hub/#/dashboard`，**纯静态托管开箱即用**，无需 server rewrite——这正是嵌入/深链的理想形态。

### 3.5 `mockData.ts` 已存在，看板几乎现成

`src/lib/mockData.ts`（439 行）已经有一批生成器，但目前**只有 `Dashboard.tsx` 引用了其中的 `commandColors`**，生成器本身尚未接入 API。已具备：

`mockBotList`、`generateKeyMetrics`、`generateMonthlyCommandData`、`generateMonthlyUserGroupData`、`generateDailyCommandUsage`、`generateDailyGroupCommandTriggers`、`generateDailyPersonalCommandTriggers`、`generateDailyActiveUsers`、`generateMonthlyHeatmap`、`generateStats`、`generateRecentActivity`、`generateMockDatabaseData`、`generatePluginConfigs`、`generateLogs`、`generateFileTree`、`generateBackupList`。

**这意味着「看板页」的 Mock 基本已经写好，只差接到 Router 上。**

---

## 4. Mock 方案设计

### 4.1 开关：`VITE_DEMO`

新增 `demo` 构建模式，用 Vite 的 `define` 注入编译期常量：

- `vite.config.ts` 在 `mode === 'demo'` 时：
  - `define`：`'import.meta.env.VITE_DEMO': JSON.stringify(true)`；
  - `base`：**按 `command` 区分**——`vite build --mode demo` 用 `'/hub/'`（同源烤进 docs `/hub/`）；
    `vite --mode demo`（dev serve）用 `'/'`（开发服根路径，便于 iframe 直连 `http://localhost:8080/#/…`）；
  - `build.outDir = 'dist-demo'`、`emptyOutDir = true`。
- `package.json` 增加脚本：`"build:demo": "vite build --mode demo"`、`"dev:demo": "vite --mode demo --port 8080 --strictPort"`。

所有 Demo 专属逻辑都用 `if (import.meta.env.VITE_DEMO)` 包裹，**对生产构建零影响**（普通 `build`/`build:dev` 下该常量为 `undefined`，分支被 tree-shake）。

### 4.2 接管点：Demo 入口处覆写 `window.fetch`（比注入更稳、且能罩住内联 fetch）

> 早期方案是在 `ApiClient` 内加 `fetchImpl` 注入点。落地时改为**在 Demo 入口覆写全局 `window.fetch`**，
> 原因如 §3.1 所述，覆写全局 `fetch` 能一次性罩住**所有** `/api/*` 请求，零侵入 `api.ts`（4731 行不动），且只在 Demo 入口生效、对生产零影响。

1. 新建 `src/lib/mockServer.ts`，导出 `installMockServer()`：保存原生 `fetch`，再把 `window.fetch` 换成 `mockFetch`。
2. `mockFetch` 只拦截 `/api/*`（命中路由表→Mock；未命中→成功空封套兜底）；**非 `/api` 请求透传给原生 fetch**（静态资源、`version.json` 等不受影响）。
3. 在 `main.tsx` 当 `VITE_DEMO` 为真时，渲染 `<App/>` 之前调用 `installMockServer()`；**早于 React Query 任何请求**。

`mockServer.ts` 的形态——一张「路由表」，按 `method + 路径正则` 匹配，统一包封套：

```ts
type Handler = (ctx: { url: URL; method: string; body?: any }) => unknown   // 返回 data 部分
const routes: Array<{ m: string; re: RegExp; h: Handler }> = [
  { m: 'GET',  re: /\/api\/auth\/me$/,            h: () => DEMO_USER },
  { m: 'GET',  re: /\/api\/dashboard\/metrics/,    h: ({url}) => generateKeyMetrics(url.searchParams.get('bot_id') ?? 'all') },
  // ...
]
export async function mockFetch(input, init) {
  const url = new URL(input, location.origin)
  const method = (init?.method ?? 'GET').toUpperCase()
  const route = routes.find(r => r.m === method && r.re.test(url.pathname))
  const data = route ? route.h({ url, method, body: safeJson(init?.body) }) : null
  // 兜底：未命中的接口一律返回成功空封套，保证页面不崩、只显示空态
  const payload = route ? { status: 0, msg: 'ok', data } : { status: 0, msg: 'demo: not mocked', data: emptyFor(url, method) }
  await delay(120 + Math.random()*200)   // 模拟网络延迟，让骨架屏/loading 自然过渡
  return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
```

> 备选实现：用 **MSW (Mock Service Worker)**。它在网络层拦截、对 TanStack Query 完全透明，可读性更好；代价是要在 `/hub/` 下放 `mockServiceWorker.js` 并处理 SW scope。鉴于已有 `mockData.ts` 且团队自有仓库，**手写 Router 更轻、依赖更少，推荐手写**；若后续 Mock 规模膨胀再迁移到 MSW。

### 4.3 分三层覆盖，避免「写到天荒地老」

hub 有 40 个命名空间，全量 Mock 不现实也没必要。按优先级分层：

- **Tier 0 · 启动必备**（4–5 个接口）：见 §3.3。不写这些会白屏。
- **Tier 1 · 展示页**：docs 实际嵌入/深链的页面所需接口（见 §4.4 映射表）。**这是写 Mock 的主战场**。
- **兜底层**：所有未命中的接口由 `mockFetch` 统一返回 `{status:0, data: 空值}`（数组→`[]`，分页→`{items:[],total:0}`，对象→`{}`）。这样即便访客点进未精细 Mock 的页面，也只是「空态」而非报错崩溃。

`emptyFor(url, method)` 可按路径关键字猜测空值形态（含 `list`/`history` 返回 `[]`，其余返回 `{}`），把兜底做得体面些。

### 4.4 Tier 1 端点 → Mock 映射表

docs 主页 6 张截图对应的页面与接口（**重点把这几页喂满数据**）：

| 截图 / 展示页 | hub 路由 | 关键接口（GET 除非标注） | Mock 来源 |
|---|---|---|---|
| `dashboard.png` 看板 | `#/dashboard` | `/api/dashboard/bots`、`/metrics`、`/commands`、`/users-groups`、`/daily/commands`、`/daily/group-triggers`、`/daily/personal-triggers` | **已有**：`mockBotList` / `generateKeyMetrics` / `generateMonthlyCommandData` / `generateMonthlyUserGroupData` / `generateDailyCommandUsage` / `generateDailyGroupCommandTriggers` / `generateDailyPersonalCommandTriggers` |
| `plugins.png` 插件配置 | `#/plugins` | `/api/plugins/list`、`/api/plugins/{name}` | 新增 `generatePluginList()`（含 icon、enabled、status、commit）；`getPluginIconUrl` 返回真实 PNG（`/hub/demo-plugin-icons/<name>.png`）或字母占位 SVG |
| `plugins_config.png` 插件数据库 | `#/database` | `/api/database/plugins`、`/api/database/table/:n`、`/api/database/table/:n/data` | 新增 `generateDatabasePlugins/generateTableMetadata/generateTableData`（GenshinUID/StarRailUID/gsuid_core 共 5 张表、含脱敏种子数据） |
| `theme.png` 主题 | `#/themes` | 主题配置 `/api/theme/config`、预设 `/api/theme/presets`、应用 `POST /api/theme/presets/apply`、`/save` | 内联 **gsuid_core `themes_builtin/*.json`**（8 套，含「绫华」glassmorphism）到 `demoMock.BUILTIN_THEME_PRESETS`；新增 `applyThemePreset()` + Mock `POST /api/theme/presets/apply`（返回 `{name,config}`） |
| `ai-memory.png` AI 记忆图谱 | `#/ai-memory` | **实测**用的是 `/api/ai/memory/scopes`、`/stats`、`/entities`、`/edges`、`/categories`（非 `agent_debug`）| 新增 `generateMemoryGraph()`：先给 `scopes`（让页面自动选中首个 scope），再给 `entities`(节点 38 个)+`edges`(边/点 ≈3.4，含生成树与交叉边，去重)+`categories`，喂给 graphology/sigma 力导图 |
| `ai-meme.png` 智能表情包 | `#/ai-meme` | `/api/meme/list`、`/api/meme/personas`、`/api/meme/stats`、`/api/meme/{id}`（详情，避免白屏） | 用脚本把 `C:\…\memes_20260531_052811.meme`（zip：图片 + 打标信息）解包到 `public/demo-memes/`（24 张真实图片），元数据 → `demoMemeMeta.ts`；`buildMemeRecords` 重建记录，`demoMemeImageUrl` 返回真实图 |

> 提示：每个生成器的返回**形状**以 `src/lib/api.ts` 里对应的 `interface`（如 `KeyMetrics`、`PluginListItem`、`StorePlugin`、`MemeListResponse`、`AgentDebugMemoryEdge`）为准，照抄字段即可，TypeScript 会帮你对齐。

### 4.5 入口与鉴权改造

- **入口**：直接在 `main.tsx` 顶部 `if (import.meta.env.VITE_DEMO) { installMockServer(); setAuthToken('demo'); }`，再 `createRoot().render(<App/>)`。不新建 `main.demo.tsx`，保持单入口。
- **嵌入锁定（v2）**：`main.tsx` 读 `location.search.includes('embed=1')` → `document.documentElement.classList.add('demo-embed')`。`index.css` 里 `.demo-embed [data-sidebar="sidebar"]{pointer-events:none}`、`.demo-embed [data-sidebar="rail"]{display:none}` —— 侧边栏可见但不可点、收起 rail 直接隐藏（缩放后贴在边缘显得残缺）。
- **localStorage 隔离（v8）**：demo 下用 `Object.defineProperty(window,'localStorage', {value: 内存版})` 顶替（在 installMockServer 之前）。每个 iframe 各自独立、刷新即清空 → 主题始终由 Mock 默认（绫华）决定，改动不持久化、不串台。
- **AuthContext**：**完全不改**。Mock 已接管 `/api/auth/me` 返回假 admin → `isAuthenticated` 恒真 → `App.tsx` 自动 `Navigate` 到 `#/home`，访客看不到登录页。
- **写操作**：Demo 下所有 POST/PUT/DELETE 命中 Mock 后返回成功封套，并可在 UI 用一个全局 toast 提示「演示模式，修改不会保存」（可选，用 `sonner` 已有的 Toaster）。

### 4.6 「让数据尽可能丰富」的具体技巧

这是用户最关心的点，落到生成器写法上：

1. **时间序列要长、要有趋势**：看板的 `commands`/`users-groups` 生成**近 30 天**数据，叠加缓慢上升趋势 + 周末波动 + 少量随机噪声，折线图才好看（`generateMonthlyCommandData` 已是这个套路，保持）。
2. **固定随机种子**：生成器用可复现的伪随机（LCG），保证每次刷新数字稳定、截图/录屏一致，也利于 docs 端做视觉回归。
3. **真实感命名**：插件用真实生态名字（`GenshinUID`、`StarRailUID`、`ZZZeroUID`、`gsuid_core` 等），bot 用 `QQ / Telegram / Discord` 等平台名，user/group 用脱敏假名。避免 `test1/test2`。
4. **覆盖各种 UI 控件**：插件配置 Mock 要包含 `bool / int / str / select / list` 等多种 `option_type`，把配置面板的丰富度撑起来。
5. **图标资源自带**：插件 icon 来自 hub `public/demo-plugin-icons/<name>.png`（真实 PNG，从 `gsuid_core/plugins/*/ICON.png` 拷 10 个）；表情包缩略图来自 `public/demo-memes/<id>.<ext>`（24 张真实素材，从 `.meme` zip 解包）；头像走 `/hub/ICON.png`。
6. **图谱类数据成规模**：AI 记忆图谱给 38 个节点、交叉边补到「点数 × 2.4」（含生成树 + 去重交叉边，边/点 ≈3.4），力导图明显成网。
7. **状态多样性**：插件列表混合 `enabled/disabled`、`has update`、`installed/not_installed`，让徽章和按钮状态都亮起来。

---

## 5. gsuid_hub 仓库改动

> 已提交到分支 **`feat/demo-mode`**（v8 commit `a73b41b` 起持续迭代，**实际 push 由维护者完成**）。

| 文件 | 改动 |
|---|---|
| `vite.config.ts` | 新增 `demo` 模式分支：按 `command` 切 `base`（`serve`→`/`、`build`→`/hub/`）；`define` 注入 `import.meta.env.VITE_DEMO`；`outDir=dist-demo`；version.json 写到对应产物目录 |
| `package.json` | 新增脚本 `dev:demo`(`vite --mode demo --port 8080 --strictPort`) / `build:demo`(`vite build --mode demo`) |
| `src/lib/mockServer.ts` | **新增**。`installMockServer()` 覆写 `window.fetch`：拦截 `/api/*` 走路由表（Tier0 启动 + 看板 + 插件 + 数据库 + 主题 + 记忆图谱 + 表情包含详情），未命中走「万能空封套」兜底；非 `/api` 透传原生 fetch |
| `src/lib/demoMock.ts` | **新增**。种子化（LCG）Mock 生成器：假 admin（含 `/hub/ICON.png` 头像）、版本/在线 bot、品牌（副标题短「演示模式」）、AI 向导状态、看板 bots、插件列表/详情（含 bool/int/str/select/list 多控件，9 个有真实图标的插件）、数据库（5 张表）、主题配置（默认绫华）/预设（内联 gsuid_core `themes_builtin/*.json` 8 套）/应用、记忆图谱（scopes/stats/entities/edges/categories，成网）、表情包列表/详情/人设/统计；彩色 SVG `data:` 占位图、字母插件图标 SVG |
| `src/lib/demoMemeMeta.ts` | **(v6 新增，脚本生成)**。24 条真实表情包打标元数据；由 `buildMemeRecords` 重建记录 |
| `public/demo-memes/*` | **(v6 新增)**。24 张真实图片，从 `C:\…\memes_20260531_052811.meme` zip 解包（构建后 `/hub/demo-memes/`） |
| `public/demo-plugin-icons/*` | **(v7 新增)**。10 张真实插件图标 PNG，从 `F:\gsuid_core\gsuid_core\plugins\*\ICON.png` 拷入（构建后 `/hub/demo-plugin-icons/`） |
| `public/demo-themes/ayaka.jpg` | **(v7 新增)**。绫华预设壁纸，从该预设官方 URL 下载并内置（构建后 `/hub/demo-themes/ayaka.jpg`，399KB） |
| `src/lib/api.ts` | **仅若干处**加 `VITE_DEMO` 守卫：`memeApi.getImageUrl`（真实图 URL）/ `getBrandIconUrl`（`/hub/ICON.png`）/ `getPluginIconUrl`（真实图或字母占位） |
| `src/main.tsx` | demo 下 `installMockServer()` + `setAuthToken('demo-token')`；(v2) 读 `?embed=1` → 给 `<html>` 加 `demo-embed` 类；(v8) demo 下用内存版 localStorage 顶替（`Object.defineProperty`）；再渲染 `<App/>` |
| `src/index.css` | **(v2)** 新增 `.demo-embed [data-sidebar="sidebar"]{pointer-events:none}` 与 `.demo-embed [data-sidebar="rail"]{display:none}` —— 侧边栏可见但不可点击、rail 直接隐藏 |
| `src/vite-env.d.ts` | 补 `ImportMetaEnv.VITE_DEMO` 类型 |
| `.gitignore` | 加 `dist-demo` |

**对生产零影响**：普通 `build` / `build:dev` 下 `import.meta.env.VITE_DEMO` 为 `undefined`，所有 demo 分支
（含 `mockServer` / `demoMock` / `demoMemeMeta` 引用、`getImageUrl` 守卫）作为 dead code 被 Rollup tree-shake。
`AuthContext` / `App.tsx` **完全未改**——靠 Mock 返回假 user 让 `isAuthenticated` 恒真。

### Mock 覆盖的接口（Tier 0 + Tier 1）

- **Tier 0 启动**：`/api/auth/me`、`/api/auth/admin/exists`、`/api/brand`、`/api/ai/wizard/status`、`/api/version`、`/api/version/bots(/count|/names)`。
- **看板** `#/dashboard`：`/api/dashboard/bots|metrics|commands|users-groups|daily/commands|daily/group-triggers|daily/personal-triggers`（复用 `mockData.ts` 已有生成器）。
- **插件** `#/plugins`：`/api/plugins/list`、`/api/plugins/{name}`、`/api/plugins`。
- **数据库** `#/database`：`/api/database/plugins`、`/api/database/table/:n`、`/api/database/table/:n/data`。
- **主题** `#/themes`：`/api/theme/config`、`/api/theme/presets`、`POST /api/theme/presets/apply`、`/save`。
- **AI 记忆图谱** `#/ai-memory`：`/api/ai/memory/scopes|stats|config|hiergraph/status|entities|edges|categories|episodes|preferences`（**实测**用的是 `/api/ai/memory/*`，非方案早期写的 `agent_debug`）。
- **智能表情包** `#/ai-meme`：`/api/meme/list|personas|stats|{id}`（详情，避免点开白屏）。
- **兜底**：其余未精细 Mock 的页面，GET 返回空集合 / 空分页对象、写操作返回成功封套，**只显示空态、不崩**。

---

## 6. GenshinUID-docs 仓库改动

> 改动在工作树中（current branch `fuma`），**未提交**，留待你 review 后提交。

| 文件 | 改动 |
|---|---|
| `.gitmodules` + `external/gsuid_hub` | **新增 submodule**，URL `https://github.com/Genshin-bots/gsuid_hub.git`，gitlink 指向 demo 提交（v8 = `a73b41b`） |
| `scripts/hub.mjs` | **新增**。`build`：submodule 内（缺依赖才）`yarn install --frozen-lockfile` + `yarn build:demo` + 拷 `dist-demo`→`public/hub`。支持 `HUB_DIR` 覆盖 hub 目录。仅 `build` 模式（不再有独立开发服） |
| `package.json` | `dev`→`node scripts/hub.mjs build && next dev --port 3000`（同源、单进程）；`dev:docs`(仅 next) / `build:hub` / `build:docs`；`build`→`node scripts/hub.mjs build && next build`（`postbuild` 仍自动跑） |
| `.gitignore` | 忽略构建产物 `/public/hub`、`/external/gsuid_hub/dist-demo` |
| `lib/home-content.ts` | 新增 `HUB_DEMO_BASE`(`= NEXT_PUBLIC_HUB_BASE \|\| '/hub'`，恒同源) + `hubEmbed()`；`ShowcaseItem` 加 `embedSrc`；6 个 item 补深链（三语共用）：`#/dashboard` / `#/database` / `#/plugins` / `#/themes` / `#/ai-memory` / `#/ai-meme`；`Showcase` 加 `liveBadge`（三语文案） |
| `app/[lang]/page.tsx` | `<HomeShowcase>` 传 `liveBadge` |
| `components/HomeShowcase.tsx` | **默认内嵌**（不再 click-to-activate）：面板滚入视口后**延迟 500ms**（盖过 700ms 翻页动画）才懒挂载实时 `<iframe sandbox>`，快速划过的页面根本不加载；已挂载保持挂载（来回滚不重载）。`EmbedFrame` 子组件用 `ResizeObserver` 把 iframe 以**逻辑视口反推 + 固定显示比例 `TARGET_SCALE=0.75`** 渲染（容器宽 → `logicalW=容器宽/0.75` → 钳到 `[MIN_LOGICAL_W=1100, MAX_LOGICAL_W=2400]`），`transform:scale` 等比缩放进缩略框 → 完整展示含侧边栏的页面；加载前轻量**骨架 + 转圈**占位、`onLoad` 淡出；右下「● 实时演示」徽章 |
| `app/global.css` | `.showcase-shot__media` 宽高比 `1200/750`（16:10）；`.showcase-embed`(容器) / `__frame`(缩放 iframe) / `__skeleton`/`__spinner`（轻量占位） / `.showcase-shot__live`(徽章)；`.showcase-panel{--bleed:0; content-visibility:auto; contain-intrinsic-size:auto 88vh}` 离屏跳过绘制 + 不再冲出被裁 |
| `tsconfig.json` | `exclude` 加 `external`、`public/hub`（防止 Next 把 submodule 源码纳入类型检查报错） |
| `deploy-next.yml` | checkout 加 `submodules: recursive`（hub 构建已并入 `pnpm build`） |

---

## 7. 如何使用

### 本地开发（单命令、同源、无独立端口）

```bash
# 首次：拉取 submodule + 装依赖（hub.mjs 也会在 submodule 缺依赖时自动 yarn install）
git submodule update --init --recursive
pnpm install

pnpm dev          # = node scripts/hub.mjs build && next dev --port 3000
# 打开 http://localhost:3000 → 滚到「框架运行效果」→ 截图滚入视口即自动变实时控制台
```

- 改了 hub 源码：重跑 `pnpm dev` 或 `pnpm build:hub` 重新烤 `public/hub/`（hub 是 submodule，通常稳定）。
- 已装好 hub 依赖的本地检出可加速：`HUB_DIR=/path/to/gsuid_hub pnpm build:hub`。
- 仅调 docs（public/hub 已构建过）：`pnpm dev:docs`。

### 生产构建 / 本地验证

```bash
pnpm build        # hub.mjs build（烤进 public/hub）→ next build → out/（含 out/hub/）
pnpm serve        # 静态服 out/，开 http://localhost:3000/ 与 /hub/#/dashboard 验证
```

- 已装好 hub 依赖的本地检出可加速：`HUB_DIR=/path/to/gsuid_hub pnpm build:hub`。

---

## 8. 关键改动文件清单

**gsuid_hub**
- `vite.config.ts` — 新增 `demo` mode 分支（按 `command` 切 `base`、`define VITE_DEMO`、`outDir=dist-demo`）
- `package.json` — `build:demo` / `dev:demo` 脚本
- `src/lib/mockServer.ts` — **新增**，覆写 `window.fetch` 的 Mock 路由 + 封套 + 兜底
- `src/lib/demoMock.ts` — **新增**，种子化 Mock 生成器 + SVG 占位图 + 真实插件图标映射 + 内联 themes_builtin
- `src/lib/demoMemeMeta.ts` — **新增**（脚本生成），24 条表情包元数据
- `public/demo-memes/*` — **新增**，24 张真实图片
- `public/demo-plugin-icons/*` — **新增**，10 张真实插件图标 PNG
- `public/demo-themes/ayaka.jpg` — **新增**，绫华预设壁纸
- `src/lib/api.ts` — **若干处**加 `VITE_DEMO` 守卫（`getImageUrl` / `getBrandIconUrl` / `getPluginIconUrl` 返回占位图/真实图）
- `src/main.tsx` — Demo 下 `installMockServer()` + `setAuthToken('demo-token')` + `?embed=1` 类名 + 内存版 localStorage
- `src/index.css` — `.demo-embed` 侧边栏锁定 CSS
- `src/vite-env.d.ts` — 补 `VITE_DEMO` 类型
- `.gitignore` — `dist-demo`

**GenshinUID-docs**
- `.gitmodules` + `external/gsuid_hub`（submodule，gitlink 指向 v8 commit）
- `scripts/hub.mjs` — **新增**，submodule 内 `yarn install`(按需) + `build:demo` + 拷到 `public/hub/`
- `package.json` — `dev`(单进程同源) / `dev:docs` / `build:hub` / `build:docs` / `build` 脚本
- `.gitignore` — 忽略 `public/hub/`、`external/gsuid_hub/dist-demo/`
- `components/HomeShowcase.tsx` — 默认内嵌 + 延迟挂载 + EmbedFrame（固定显示比例 + ResizeObserver）
- `lib/home-content.ts` — showcase items 补 `embedSrc`，新增 `HUB_DEMO_BASE` / `hubEmbed()` / `liveBadge`（zh/en/ja 共用）
- `app/[lang]/page.tsx` — 传 `liveBadge`
- `app/global.css` — showcase 缩放/嵌入/骨架/徽章/`--bleed:0`/`content-visibility` 样式
- `tsconfig.json` — `exclude` 加 `external`、`public/hub`
- `deploy-next.yml` — checkout `submodules: recursive`（hub 构建已并入 `pnpm build`）

---

## 9. 验证方式

### 已验证（本地自动化可验证）

1. ✅ `yarn build:demo` 产物 base = `/hub/`，HashRouter 深链就绪。
2. ✅ `scripts/hub.mjs build` 正确把 `dist-demo/` 拷进 `public/hub/`。
3. ✅ `next build`（`output:export`）通过，`out/hub/` 随产物导出；三语主页 HTML 内嵌深链均为同源 `/hub/#/…`，**无 `localhost:8080` 泄漏**到生产包。
4. ✅ Mock 形状对照 `api.ts` interface 与 `AIMemoryPage` 内联类型逐一核对；记忆页启动调用均 `.catch(()=>null)`，不会白屏。
5. ✅ 普通构建 demo 分支被 tree-shake（守卫为 `import.meta.env.VITE_DEMO`）。
6. ✅ 静态服 `out/` 实测 `/hub/index.html?embed=1`、`/zh-CN/`、`/hub/version.json` 均 **200**。
7. ✅ 嵌入锁定 CSS/JS 已进 demo 包；三语主页 embedSrc 均为同源 `/hub/index.html?embed=1#/…`，无 `localhost` 泄漏。
8. ✅ `npx tsc --noEmit` 通过。
9. ✅ hub `tsc --noEmit` 我方文件 0 报错。
10. ✅ v8 内存版 localStorage shim 已入包；翻页骨架转圈占位；`content-visibility:auto` 离屏跳过渲染。

### 建议人工冒烟（需浏览器，本环境无法自动化执行）

`pnpm dev` 后开主页，逐个面板：

- 滚入视口即自动变实时控制台（无需点击），iframe 加载出对应页面。
- **不弹登录页**、看板/插件配置/插件数据库/主题/记忆图谱/表情包均有数据。
- 控制台无 401/报错；点开表情包详情不白屏。
- 改某面板主题预设后滚到别的面板**不串台**；硬刷新回到绫华默认。
- 侧边栏**可见但不可点**（点不会切走页面）；rail 不显示。
- 翻页顺滑（快速划过不触发加载，滚停后 500ms 才挂载）。
- 侧边栏左上 PNG 头像（`/hub/ICON.png`），插件按钮组彩色图标。
- 默认主题为绫华玻璃拟态（orchid + 绫华壁纸 + card_opacity 26）。
- 表情包为真实图片（`/hub/demo-memes/*`），非 emoji 占位。

---

## 10. 风险与注意事项 / 已知限制

- **演示数据是假的**：写操作（增删改）命中 Mock 返回成功封套但**不持久化**（msg 已标注「演示模式，修改不会保存」）。
- **非 6 张截图对应页**走兜底空封套：能进、显示空态，但非精细 Mock；如需「完整可逛」可继续在 `mockServer.ts` 加路由（Phase 3）。
- **submodule 漂移**：固定 gitlink，升级 hub = bump 指针并重新冒烟，避免拉到未测试版本。
- **包体积**：hub 是重型 SPA（demo 主 chunk ~3.3MB / gzip ~980KB）。已靠**延迟挂载**（面板滚入视口后等 500ms 才加载，配合 700ms 翻页动画）+ `content-visibility:auto`（离屏跳过绘制）+ 离屏 iframe `display:none` 控制首屏与翻页；若要更小可在 demo 构建里按需裁剪未展示的重页面。
- **同源 localStorage 共享（v8 已修）**：早期 6 个内嵌面板**同源**（都在 `/hub/`）共享同一份 localStorage → 一处改主题会跨面板串台 + 跨刷新残留。v8 起 demo 下用内存版 localStorage 顶替（`Object.defineProperty`），每个 iframe 各自独立、刷新即清空。如未来要拆分到子域名，需相应调整。
- **内嵌缩放参数**：固定显示比例 `TARGET_SCALE=0.75` 钳在 `[MIN_LOGICAL_W=1100, MAX_LOGICAL_W=2400]`。可按观感在 `HomeShowcase.tsx` 微调（0.7–0.85）。
- **资源体积**：hub demo 产物可能较大；可在 demo 构建里关掉用不到的重页面（路由懒加载本就分包），或仅打包 Tier 1 页面。
- **Mock 真实性边界**：Demo 数据是假的，注意脱敏、避免误导（建议全局 toast/水印标注「演示模式」）。
- **维护**：hub 改了接口形状，Mock 可能过期 → 让生成器返回值直接复用 `api.ts` 的 `interface`，靠 TS 编译报错来提醒同步。
- **submodule 漂移（方式②）**：固定 submodule commit，避免 docs 构建拉到未测试的 hub 版本。
- **CI 重**：docs CI 变重（要构建整个 hub）→ 用 `submodules: recursive` 拉取，CI 内构建。

---

## 11. 收尾：你需要手动完成的步骤

当前 hub 的 demo 改动只在**本地** `feat/demo-mode`（v8 commit `a73b41b`，含嵌入锁定 + 绫华主题 + 真实资产 + localStorage 隔离），docs 的 submodule gitlink 指向它。
要让 CI / 别人 clone 能复现，必须：

1. **推送 hub**：在 `gsuid_hub` 仓库把 `feat/demo-mode` push（或合并到 `master`）到 GitHub。
   - 若合并方式改变了 commit SHA（rebase/squash），需回到 docs：
     `cd external/gsuid_hub && git fetch && git checkout <新SHA> && cd ../.. && git add external/gsuid_hub`，
     让 gitlink 指向 GitHub 上真实存在的 commit。
2. **提交 docs**：review 工作树改动后提交（`.gitmodules` + `external/gsuid_hub` gitlink + scripts + 组件/样式/CI 等），
   push 到部署分支 `fumadocs` 触发 Pages 部署。

> CI（`deploy-next.yml`）已配 `submodules: recursive`；ubuntu-latest 自带 yarn，`pnpm build` 会在 CI 内
> 构建 hub Demo 并烤进 `public/hub/`，与 docs 一起导出到 `out/` 发布。

---

## 12. 修订记录（v1 → v8）

### v1（初版方案与首次落地）

> 需求拍板：单仓库 + 单命令 + 单部署。`gsuid_hub` 作为 submodule 烤进 docs `public/hub/`，整站只发一次 GitHub Pages。本地用 `concurrently` 同时拉 docs + hub 开发服（早期）。
>
> 落地：hub 新增 `demo` 模式 + `installMockServer`（覆写 `window.fetch`）+ Tier 0/Tier 1 Mock（看板复用已有生成器，插件/主题/记忆/表情新增生成器）；docs submodule + `scripts/hub.mjs` + `HomeShowcase` click-to-activate 内嵌 iframe（视口外卸载）+ `.env.development` + CI `submodules:recursive`。

### v2（同源托管 + 默认内嵌 + 桌面逻辑缩放 + 侧边栏锁定）

> 反馈：① localhost 拒绝连接；② 默认嵌入缩放不对、无法完整展示页面；③ 还要手点「开始演示」才能交互；
> ④ 不展示侧边栏；⑤ 希望侧边栏展示但**不可点击**（否则会切走到别的页面）。

| # | 问题 | 根因 | 修复（v2） |
|---|---|---|---|
| ① | `localhost` 拒绝连接 | dev 用独立 `:8080` 开发服，iframe 跨端口直连；该服未起/被占即连接失败 | **取消独立服**：dev 与 prod 都把 hub 烤进 `public/hub/` 由 docs **同源**托管；`pnpm dev` = `hub.mjs build && next dev`。iframe 走 `/hub/index.html?embed=1#/…`。删 `scripts/dev.mjs`、`.env.development` |
| ② | 缩放不全、页面展示不完整 | iframe 用 `width/height:100%`，等于把桌面站塞进窄框，要么响应式坍缩要么溢出裁切 | `EmbedFrame` 把 iframe 以 **1440×900 桌面逻辑视口**渲染，再 `transform:scale(容器宽/1440)` 等比缩放；`.showcase-shot__media` 宽高比改 `1440/900` → 缩放后正好铺满、不裁不漏 |
| ③ | 需手点「开始演示」 | 旧版 click-to-activate：默认显示截图，点 ▶ 才挂 iframe | **默认内嵌**：面板**滚入视口即自动懒挂载** iframe；移除 ▶ 蒙层与点击门槛。加载前截图 poster 占位、`onLoad` 淡出 |
| ④ | 不展示侧边栏 | iframe 实际渲染宽度窄（<768px 断点）→ hub 进移动布局、侧边栏收起 | 逻辑视口宽 **1440 > 768** → hub 走桌面布局，侧边栏默认展开（`SidebarProvider defaultOpen`） |
| ⑤ | 侧边栏可点会切走页面 | 侧边栏链接正常导航，内嵌面板被点到别页 | hub 新增**嵌入锁定**：iframe 带 `?embed=1` → main.tsx 给 `<html>` 加 `demo-embed` → index.css 把 `[data-sidebar=sidebar/rail/trigger]` 置 `pointer-events:none`。**侧边栏可见但不可点**；直接访问 `/hub/#/home` 的完整演示仍可自由导航 |

**v2 涉及文件**：hub `src/main.tsx`、`src/index.css`（+ 重新构建）；docs `lib/home-content.ts`、`components/HomeShowcase.tsx`、`app/[lang]/page.tsx`、`app/global.css`、`package.json`、`scripts/hub.mjs`；删 `scripts/dev.mjs`、`.env.development`。

### v3（缩放 + ICON PNG + 主题预设真实化 + 滚动优化 + 数据库页）

> 反馈：① 缩放仍不够；② 侧边栏左上角 ICON 是 emoji，应为 PNG 头像；③ 侧边栏被裁切、右侧「收起 rail」展示不完整；
> ④ 默认主题不对，演示应为 shadcn 风格（纯黑白、简洁现代）；⑤ 主题预设不存在（原调 gsuid_core 接口）；
> ⑥ 整页滚动卡顿；⑦ 第二页应是「插件数据库」却展示成「插件配置」。

| # | 问题 | 根因 | 修复（v3） |
|---|---|---|---|
| ① | 缩放仍不够 | 逻辑视口 1440×900 → 缩进窄框后内容偏小 | `HomeShowcase` 逻辑视口改 **1200×750**（仍 16:10、>768 保桌面侧边栏），内容放大约 20%；`.showcase-shot__media` aspect-ratio 同步改 `1200/750` |
| ② | ICON 是 emoji | demo 下 `getBrandIconUrl` / `generateBrandInfo` 返回 emoji SVG 占位图 | 改返回 hub 自带真实 PNG `${BASE_URL}ICON.png`（→ `/hub/ICON.png`）。`api.ts`、`demoMock.ts`（新增 `DEMO_BRAND_ICON`）各一处 |
| ③ | 侧边栏右侧 rail 展示不完整 | `?embed=1` 锁定态仅 `pointer-events:none`，半截 rail 把手贴在缩放边缘显得残缺 | `index.css` `.demo-embed [data-sidebar="rail"]{display:none}` —— 锁定态本就不可点，直接移除把手 |
| ④ | 默认主题不对 | demo `THEME_CONFIG` 是 glassmorphism + 非法 color `#6c8cff`（被忽略→回退红色） | 改为 **shadcn 预设**：`mode:light / style:solid / theme_preset:shadcn / color:blue / card_opacity:100 / 无背景` → 纯黑白简洁 |
| ⑤ | 主题预设不存在 | demo 用编造的 5 套假预设；且应用预设的 POST 未 Mock，点击会崩 | 内联 **gsuid_core `themes_builtin/*.json`**（8 套）到 `demoMock.BUILTIN_THEME_PRESETS`；新增 `applyThemePreset()` + Mock `POST /api/theme/presets/apply`（返回 `{name,config}`）→ 可一键真切换；`/save` 也补成功封套 |
| ⑥ | 整页滚动卡顿 | 首页是 rAF「硬翻页」，每帧重绘；6 个重型 SPA iframe 同时合成 | `app/global.css`：`.showcase-panel:not(.is-in) .showcase-embed{content-visibility:hidden}` 离屏跳过绘制（保留已加载状态不重载）；`.showcase-embed{contain:layout paint}` 隔离合成层 |
| ⑦ | 第二页展示成插件配置 | item#1（插件数据库）embedSrc 错指 `#/plugins` | `lib/home-content.ts` 三语 item#1 改 `#/database`；hub 新增数据库 Mock：`generateDatabasePlugins/generateTableMetadata/generateTableData`（GenshinUID/StarRailUID/gsuid_core 共 5 张表、含脱敏种子数据）+ mockServer 路由 `/api/database/plugins|table/:n|table/:n/data` |

**v3 涉及文件**：hub `src/lib/demoMock.ts`、`src/lib/mockServer.ts`、`src/lib/api.ts`、`src/index.css`（+ `node scripts/hub.mjs build` 重新烤进 `public/hub/`）；docs `components/HomeShowcase.tsx`、`lib/home-content.ts`、`app/global.css`。

### v4（缩放方向纠偏 + 裁切 + 滚动卡顿）

> 反馈：① 内嵌左右都被裁切，不好看；② 整体缩放**还是太大**、压缩 UI 空间；③ 滚动仍卡（是不是一次性渲染太多页面）。
> 关键纠偏：v1 把「缩放不够」误解为「太小」→ 反而调大（1440→1200）。实为**显示比例太大**：
> 旧逻辑 `scale = 容器宽 / 固定逻辑宽`，在宽屏上「1fr 截图列」比逻辑宽还宽 → **scale>1 把 UI 放大**到超过原生。

| # | 问题 | 根因 | 修复（v4，均 docs 侧） |
|---|---|---|---|
| ① | 内嵌左右被裁切 | 面板 `--bleed` 让「截图」负边距冲出视口、由 `overflow-x:clip` 裁掉——对装饰截图是构图，对**可交互控制台**却切掉了侧边栏/右侧内容 | `app/global.css` `.showcase-panel{--bleed:0}` —— iframe 完整落在内容区内，不再冲出被裁 |
| ② | 缩放还是太大 | 固定逻辑宽 + 变动容器宽 → 显示比例随视口漂移，宽屏上 `scale>1` 放大 UI | `HomeShowcase` 改为**固定显示比例** `TARGET_SCALE=0.5`：逻辑宽由容器宽反推（`logicalW=容器宽/0.5`），任何视口都稳定显示为半尺寸、元素更小更透气；`MAX_LOGICAL_W=2400` 给超宽屏封顶（防合成层显存爆涨） |
| ③ | 滚动卡顿 | 6 个 ~3.3MB 重型 SPA iframe 在翻页途中**逐个挂载/加载**，同源 iframe 与主文档共享主线程 → 加载即卡 | `HomeShowcase` 改**延迟挂载**：面板滚入视口后等 `MOUNT_DELAY_MS=500ms`（盖过 700ms 翻页动画）才挂载 iframe；若延迟内又翻走则**取消挂载**（快速划过的页根本不加载）。配合 v3 的 `content-visibility:hidden`（离屏不绘制），翻页途中主线程不被加载阻塞 |

**v4 涉及文件**：docs `components/HomeShowcase.tsx`、`app/global.css`（**纯 docs 侧，hub 产物不变，无需重烤**）。

### v5（比例回调 + 副标题截断）

> 反馈：① v4 的 0.5 又太小、内嵌文字看不清；② 侧边栏左上角副标题过长，把「收起」按钮挤出裁切。

| # | 问题 | 修复 |
|---|---|---|
| ① | 0.5 太小、文字看不清 | `HomeShowcase` `TARGET_SCALE` 0.5 → **0.75**；并新增**逻辑宽下限** `MIN_LOGICAL_W=1100`：窄容器按比例反推会 <768 触发移动布局，钳到下限后用 `scale=容器宽/逻辑宽`（略小于 0.75）→ 既放大可读、又始终保住桌面侧边栏。`MAX_LOGICAL_W=2400` 上限不变 |
| ② | 副标题过长挤掉收起按钮 | hub `demoMock.generateBrandInfo().subtitle` `'GsCore 网页控制台 · 演示模式'` → **`'演示模式'`**（侧边栏品牌按钮 `shrink-0`，副标题过长会撑宽按钮、把右侧 PanelLeftClose 顶出裁切）。+ `node scripts/hub.mjs build` 重烤 |

**v5 涉及文件**：docs `components/HomeShowcase.tsx`；hub `src/lib/demoMock.ts`（+ 重烤 `public/hub/`）。

### v6（真实表情包 + 详情白屏 + 插件图标 + 图谱密度 + 放大框）

> 反馈：① 插件配置页顶部按钮组没显示插件图标，发素；② 记忆图谱连线太少，要更密；③ 智能表情包不是真实素材，
> 用 `C:\…\memes_20260531_052811.meme`（zip：图片 + 打标信息）内置缓存；④ 点开任意表情**白屏**；⑤ 框略小，要放大。

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| ④ | 点表情白屏 | 点击调 `memeApi.getDetail`→`GET /api/meme/{id}`，demo 未 Mock → 命中「空对象兜底」→ 详情弹窗 `[...meme.emotion_tags]` 对 `undefined` 展开抛错崩整页 | hub 新增 `generateMemeDetail(id)` + mockServer 路由 `GET /api/meme/([^/]+)$`（置于 list/personas/stats 之后），返回完整记录 |
| ③ | 不是真实表情 | demo 图片走 `demoPlaceholderImage`（emoji 占位）；无真实素材 | 用脚本把 `.meme`（zip）解包：24 张真实图片 → hub `public/demo-memes/<id>.<ext>`（构建后 `/hub/demo-memes/`），打标元数据 → **新增** `src/lib/demoMemeMeta.ts`；`demoMock` 由真实元数据重建 `buildMemeRecords`，新增 `demoMemeImageUrl(id)`；`api.ts` `memeApi.getImageUrl` demo 改返回真实图 URL。状态按下标分散（图片/标签/描述均真实），让统计卡/筛选有内容 |
| ① | 按钮组图标发素 | 按钮组本就渲染 `<PluginIcon>`，但 demo 下 `getPluginIconUrl` 命中 `/api/plugins/icon/*`（`<img>` 拦不到）→ 404 → 回退灰 `Package` 图标 | `demoMock.demoPluginIcon(name)`：渐变底 + 名称首字母的「应用图标」SVG；`api.ts` `getPluginIconUrl` demo 返回它 → 按钮组/列表彩色不发素 |
| ② | 图谱太稀疏 | 实体 24、交叉边仅 18（边/点 ≈1.7） | `buildMemoryGraph`：实体扩到 38，交叉边去重后补到 `点数×2.4`（含生成树，边/点 ≈3.4），力导图明显成网 |
| ⑤ | 框略小 | 文案列 27rem + 较大左右留白/列间距挤占了右侧框宽 | `app/global.css` 文案列 27→**22rem**、`padding-inline` max 6→3.5rem、`column-gap` max 5→3.25rem → 框更大（固定 0.75 比例下内嵌内容也随之更大、更易读） |

**v6 涉及文件**：hub `src/lib/demoMemeMeta.ts`（新增，脚本生成）、`public/demo-memes/*`（24 图，脚本解包）、`src/lib/demoMock.ts`、`src/lib/mockServer.ts`、`src/lib/api.ts`（+ 重烤 `public/hub/`）；docs `app/global.css`。

### v7（真实插件图标 + 绫华默认主题 + 管理员头像）

> 反馈：① 插件图标不应用渐变占位，应匹配 `F:\gsuid_core\gsuid_core\plugins\<x>\ICON.png` 的真实 PNG；
> ② 主题功能页希望默认就加载「绫华」预设，而非 shadcn；③ 左下角「演示管理员」也应有图片头像。

| # | 修复 |
|---|---|
| ① 真实插件图标 | 从 `gsuid_core/plugins/*/ICON.png` 拷 10 个真实图标到 hub `public/demo-plugin-icons/<id>.png`；`demoPluginIcon` 改为：命中 `DEMO_PLUGIN_ICON_IDS` → 返回真实 PNG（`/hub/demo-plugin-icons/<name>.png`），否则才回退首字母占位。**插件列表重排为「有真实图标」的 9 个插件**（GenshinUID / ZZZeroUID / WutheringWavesUID / ArknightsUID / BlueArchiveUID / LOLegendsUID / MajsoulUID / SayuStock / WzryUID）；数据库页中 StarRailUID（无图标）→ ZZZeroUID（表名/标签同步改），gsuid_core 用核心 LOGO |
| ② 绫华默认主题 | `THEME_CONFIG` 由 shadcn 改为**绫华预设**（glassmorphism + orchid + 绫华壁纸 + card_opacity 26）；壁纸从该预设官方 URL 下载并内置到 `public/demo-themes/ayaka.jpg`（离线可靠）；预设页 `绫华` 标记 `is_active` → 显示「已应用」。整站演示随之统一为绫华玻璃拟态观感 |
| ③ 管理员头像 | `DEMO_USER.avatar` 由 emoji 占位改为真实 PNG（项目 LOGO `/hub/ICON.png`，即 `DEMO_BRAND_ICON`）→ 左下角显示图片头像 |

**v7 涉及文件**：hub `src/lib/demoMock.ts`（+ 新增 `public/demo-plugin-icons/*` 10 图、`public/demo-themes/ayaka.jpg`，+ 重烤 `public/hub/`）。
**注**：v7 起新增资产 `public/demo-plugin-icons/`、`public/demo-themes/ayaka.jpg` 需随 hub submodule 一并提交。绫华为 glassmorphism + 低卡片不透明度（26%），整站演示会带绫华壁纸；若觉过淡可调 `THEME_CONFIG.card_opacity`。

### v8（演示「有状态」问题 + 占位图 + 滚动再优化）

> 反馈：① 改了某面板的主题预设后，滚回其它面板发现主题都变了，且 Ctrl+Shift+R 硬刷新仍残留 → 演示「有状态」；
> ② 想去掉用旧截图当占位符；③ 滚动仍卡。

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| ① | 主题改动跨面板串台 + 跨刷新残留 | 6 个内嵌面板**同源**（都在 `/hub/`），共享同一份 **localStorage**；hub 把主题写进 localStorage → 一处改动落盘、跨刷新留存、并污染其它面板 | hub `src/main.tsx`：demo 下用 **内存版 localStorage** 顶替（`Object.defineProperty(window,'localStorage',…)`，在 installMockServer 之前）。每个 iframe 各自独立、刷新即清空 → 主题始终由 Mock 默认（绫华）决定，改动不持久化、不串台 |
| ② | 旧截图当占位符 | `EmbedFrame` 用 `item.img`（旧截图）做 poster + 挂载前回退也是该截图 | docs `HomeShowcase.tsx`：占位改为轻量**骨架 + 转圈**（`.showcase-shot__skeleton`/`__spinner`），不再渲染旧截图；顺带省 6 张大图解码/合成 |
| ③ | 滚动仍卡 | 离屏面板（含 iframe + 辉光 + 框）仍参与渲染/合成；首页是 rAF 硬翻页每帧重绘 | docs `app/global.css`：`.showcase-panel{content-visibility:auto;contain-intrinsic-size:auto 88vh}` 离屏整屏跳过渲染；辉光 `blur(80px)→56px`；去截图占位再省一笔 |

**v8 涉及文件**：hub `src/main.tsx`（+ 重烤 `public/hub/`）；docs `components/HomeShowcase.tsx`、`app/global.css`。

---

**最终 v8 验证**：hub 重烤通过、`main.tsx` `tsc` 0 报错、内存版 localStorage shim 已入包；docs `tsc --noEmit` 通过。建议冒烟：改主题后滚到别的面板不串台、硬刷新回到绫华；占位为骨架转圈；翻页更顺。
**v3 验证（补）**：`node scripts/hub.mjs build` 通过（vite 3779 模块）；产物 `public/hub/` 内 `ICON.png` 就位、bundle 含 `api/database/table`、`presets/apply`、`themes_builtin`、`ICON.png`、数据库种子数据。仍建议浏览器冒烟：开主页滚到展示区 → ① 内嵌更大更清晰；② 左上 PNG 图标；③ 无残缺 rail；④ 默认黑白 shadcn 外观（v7 起改为绫华）；⑤「主题→预设」可一键切换；⑥ 翻页顺滑；⑦ 第二页为可浏览的数据库表。
**hub 改动仍在 submodule 工作树未提交**：冒烟满意后，于 `gsuid_hub` 提交并 push（更新 docs 的 submodule gitlink 指向新 commit），再提交 docs。