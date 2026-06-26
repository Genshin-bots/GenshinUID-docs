# 主页截图「活化」方案：可交互的 gsuid_hub 演示

> 状态：方案设计（待实施）
> 涉及项目：`GenshinUID-docs`（本仓库，Next.js 静态站）+ `gsuid_hub`（Vite + React SPA 控制台）
> 目标读者：同时掌控两个仓库的维护者

---

## 1. 背景与目标

主页 `HomeShowcase` 区目前用 6 张**静态截图**展示 gsuid_hub 控制台的运行效果（看板 / 插件 / 主题 / AI 记忆 / 表情包）。截图无法点击、不能交互，且控制台一旦改版截图就会过期。

**目标**：让这些「截图」变成**真·可点击、可交互**的控制台页面，且：

- 不复制 hub 的组件到 docs（两边技术栈不同，复制必然 drift）；
- 不需要运行真实后端、不需要真实鉴权（访客无账号、也不应暴露真实数据）；
- hub 保持**单一数据源**，docs 只负责「嵌入 / 链接」。

**核心思路**：给 gsuid_hub 增加一个**免登录 + Mock 数据**的「Demo 静态构建」，产物是纯静态 SPA（零后端依赖）。docs 用 **click-to-activate iframe**（默认仍显示截图当占位图，点击后挂载实时 iframe，深链到对应页面）嵌入它。

---

## 2. 总体架构

```
gsuid_hub 仓库
  └─ npm run build:demo   (VITE_DEMO=1, base=/hub/)
        │  · AuthContext 注入假 admin，跳过登录
        │  · ApiClient 的 fetch 被 Mock Router 接管，返回 {status:0,...}
        ▼
     dist-demo/  (纯静态：index.html + assets, HashRouter)
        │
        │  ① 独立部署到 demo.xxx / GitHub Pages          ← 推荐
        │  ② 或 submodule + 构建期拷贝到 docs/public/hub/  ← 单域名备选
        ▼
GenshinUID-docs 仓库
  └─ HomeShowcase.tsx
        · item 增加 embedSrc: "/hub/#/dashboard"
        · 默认渲染截图(poster)，点击 → 挂载 <iframe src=embedSrc>
```

两边都是**纯静态**（docs 是 `output: 'export'`，hub demo 用 HashRouter），所以无论独立部署还是同域托管都不需要服务器 rewrite。

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

所有方法内部都是 `fetch(\`${this.baseUrl}${endpoint}\`, ...)`。**只要在这一层接管 `fetch`，就能 Mock 任意接口。**

> ⚠️ 例外：极少数 API（如 `authApi.uploadAvatar`、`assetsApi` 的部分上传）直接内联调用了 `fetch` 而没走 `ApiClient`。这些是写操作，Demo 模式下不需要支持，Mock Router 命中后直接返回成功封套即可。

### 3.2 响应封套是统一的

```ts
interface ApiResponse<T> { status: number; msg: string; data: T }
// request() 内部：response.json() → 若 status !== 0 抛错 → 否则返回 data.data
```

**所有 Mock 返回值都必须包成 `{ status: 0, msg: 'ok', data: <真正的数据> }`**，否则页面会报错。

### 3.3 启动时必须满足的 3 个上下文（否则白屏/报错）

App 挂载时这几个 Provider 会立即打 API，Demo 必须把它们「喂饱」：

| Context | 启动调用 | Demo 处理 |
|---|---|---|
| `AuthContext` | `authApi.getCurrentUser()` → `GET /api/auth/me` | 返回假 admin User，`isAuthenticated=true`，**跳过登录页** |
| `BrandContext` | `brandApi.getBrand()` → `GET /api/brand` | 返回站点标题/副标题假数据 |
| `AIStatusContext` | `aiWizardApi.getStatus()` → `GET /api/ai/wizard/status` | 返回「已配置」状态假数据 |
| 顶部布局 | `versionApi.*` → `GET /api/version`、`/api/version/bots` | 返回版本号、在线 bot 数 |

`User` 类型：`{ id, email, name, role: 'admin'|'user', avatar? }`。

### 3.4 路由表（HashRouter，截图直达对应页）

hub 用 `HashRouter`，所有页面在 `/` 下，`src/App.tsx` 路由如：
`dashboard / plugins / database / themes / logs / traces / ai-meme / ai-memory / ai-statistics / ai-kanban / ai-budget / plugin-store / persona-config / ...`（共 30+ 页）。

HashRouter 的深链形如 `…/hub/#/dashboard`，**纯静态托管开箱即用**，无需 server rewrite——这正是嵌入/深链的理想形态。

### 3.5 `mockData.ts` 已存在，看板几乎现成

`src/lib/mockData.ts`（439 行）已经有一批生成器，但目前**只有 `Dashboard.tsx` 引用了其中的 `commandColors`**，生成器本身尚未接入 API。已具备：

`mockBotList`、`generateKeyMetrics`、`generateMonthlyCommandData`、`generateMonthlyUserGroupData`、`generateDailyCommandUsage`、`generateDailyGroupCommandTriggers`、`generateDailyPersonalCommandTriggers`、`generateDailyActiveUsers`、`generateMonthlyHeatmap`、`generateStats`、`generateRecentActivity`、`generateMockDatabaseData`、`generatePluginConfigs`、`generateLogs`、`generateFileTree`、`generateBackupList`。

**这意味着「看板页」的 Mock 基本已经写好，只差接到 Router 上。**

---

## 4. Mock 方案设计（如何写出「数据尽可能丰富」的 Mock）

### 4.1 开关：`VITE_DEMO`

新增构建模式，用 Vite 的 `import.meta.env` 注入：

- `vite.config.ts` 增加 `define`：当 `mode === 'demo'` 时 `import.meta.env.VITE_DEMO = true`、`base = '/hub/'`、`build.outDir = 'dist-demo'`。
- `package.json` 增加脚本：`"build:demo": "vite build --mode demo"`、`"dev:demo": "vite --mode demo"`（本地预览 Mock 效果）。

所有 Demo 专属逻辑都用 `if (import.meta.env.VITE_DEMO)` 包裹，**对生产构建零影响**（构建期被 tree-shake 掉）。

### 4.2 接管点：注入式 `fetch`（改动最小、最稳）

不要去改 40 个 `xxxApi`，只在 `ApiClient` 这一层动刀：

1. 在 `ApiClient` 里把裸 `fetch(...)` 全部替换为 `this.fetchImpl(...)`，默认 `this.fetchImpl = fetch`（行为完全不变）。
2. 新建 `src/lib/mockServer.ts`，导出 `mockFetch(url, init): Promise<Response>`。
3. 在应用入口（见 4.5）当 `VITE_DEMO` 为真时执行 `api.setFetchImpl(mockFetch)`。

`mockServer.ts` 的形态——一张「路由表」，按 `method + 路径正则` 匹配，统一包封套：

```ts
type Handler = (ctx: { url: URL; method: string; body?: any }) => unknown   // 返回 data 部分
const routes: Array<{ m: string; re: RegExp; h: Handler }> = [
  { m: 'GET',  re: /\/api\/auth\/me$/,            h: () => DEMO_USER },
  { m: 'GET',  re: /\/api\/dashboard\/metrics/,    h: ({url}) => generateKeyMetrics(url.searchParams.get('bot_id') ?? 'all') },
  // ... 见 4.4
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
| `plugins.png` 插件库 | `#/plugins` | `/api/plugins/list`、`/api/plugins/{name}` | 新增 `generatePluginList()`（含 icon、enabled、status、commit） |
| `plugins_config.png` 插件配置 | `#/plugins`（展开配置）| 同上 + `/api/plugins/{name}`（详情含 config 项） | 扩展 `generatePluginConfigs()`（已有）覆盖多种控件类型 |
| `theme.png` 主题 | `#/themes` | 主题配置 `/api/theme/config`、预设 `/api/theme/presets` | 新增 `generateThemePresets()`（多套配色预览） |
| `ai-memory.png` AI 记忆图谱 | `#/ai-memory` | `/api/agent_debug/memory/edges`、`/memory/conflicts` | 新增 `generateMemoryGraph()`（节点+边，喂给 graphology 力导图） |
| `ai-meme.png` 智能表情包 | `#/ai-meme` | `/api/meme/list`、`/api/meme/personas`、`/api/meme/stats` | 新增 `generateMemeList()` / `generateMemeStats()` |

> 提示：每个生成器的返回**形状**以 `src/lib/api.ts` 里对应的 `interface`（如 `KeyMetrics`、`PluginListItem`、`StorePlugin`、`MemeListResponse`、`AgentDebugMemoryEdge`）为准，照抄字段即可，TypeScript 会帮你对齐。

### 4.5 入口与鉴权改造

- **入口**：新建 `src/main.demo.tsx`（或在 `main.tsx` 顶部 `if (import.meta.env.VITE_DEMO)`）——挂载前先 `api.setFetchImpl(mockFetch)`、`setAuthToken('demo')`，再渲染 `<App/>`。
- **AuthContext**：`if (VITE_DEMO)` 时跳过 `getCurrentUser` 的真实请求路径（实际上 Mock 已经接管 `/api/auth/me`，所以**甚至可以不改 AuthContext**，靠 Mock 返回假 user 即可——更干净，零侵入）。
- **登录页**：`App.tsx` 里 `isAuthenticated` 在 Demo 下恒为真 → 自动 `Navigate` 到 `#/home`，访客看不到登录页。
- **写操作**：Demo 下所有 POST/PUT/DELETE 命中 Mock 后返回成功封套，并可在 UI 用一个全局 toast 提示「演示模式，修改不会保存」（可选，用 `sonner` 已有的 Toaster）。

### 4.6 「让数据尽可能丰富」的具体技巧

这是用户最关心的点，落到生成器写法上：

1. **时间序列要长、要有趋势**：看板的 `commands`/`users-groups` 生成**近 30 天**数据，叠加缓慢上升趋势 + 周末波动 + 少量随机噪声，折线图才好看（`generateMonthlyCommandData` 已是这个套路，保持）。
2. **固定随机种子**：生成器用可复现的伪随机（如基于 index 的 `Math.sin` 或简单 LCG），保证每次刷新数字稳定、截图/录屏一致，也利于 docs 端做视觉回归。
3. **真实感命名**：插件用真实生态名字（`GenshinUID`、`StarRailUID`、`ZZZeroUID`、`gsuid_core` 等），bot 用 `QQ / Telegram / Discord` 等平台名，user/group 用脱敏假名。避免 `test1/test2`。
4. **覆盖各种 UI 控件**：插件配置 Mock 要包含 `bool / int / str / select / list` 等多种 `option_type`，把配置面板的丰富度撑起来。
5. **图标资源自带**：插件 icon、表情包缩略图等若依赖后端图片接口，Demo 下要么 Mock 成内置的几张占位图（打包进 `public/`），要么让 `/api/plugins/icon/...` 命中 Mock 返回 data-URI，避免一堆裂图。
6. **图谱类数据成规模**：AI 记忆图谱给 20–40 个节点、若干社群聚类，力导图才有「网络感」。
7. **状态多样性**：插件列表混合 `enabled/disabled`、`has update`、`installed/not_installed`，让徽章和按钮状态都亮起来。

---

## 5. docs 侧实操

### 5.1 集成方式（二选一）

**方式 ①（推荐）独立部署 + 跨域嵌入**
hub 仓库单独把 `dist-demo/` 发布到一个公开地址（GitHub Pages 或子域名，如 `https://hub-demo.<domain>/`）。docs 只引用该 URL。

- 优点：两边部署**完全解耦**，docs CI 不需要装 bun/yarn、不需要构建 hub；hub 改版后自动反映到 docs。
- 注意：iframe 跨域嵌入需要 hub demo 部署端**不要设** `X-Frame-Options: DENY`（GitHub Pages 默认允许）；若要更严，用 `Content-Security-Policy: frame-ancestors <docs域名>`。

**方式 ②（备选）submodule + 同域托管**
把 `gsuid_hub` 作为 git submodule 加入 docs，docs 构建脚本里先 `cd gsuid_hub && bun install && bun run build:demo`，再把 `dist-demo/` 拷到 `docs/public/hub/`。

- 优点：单域名、无跨域问题、版本随 submodule 锁定。
- 缺点：docs CI 变重（要构建整个 hub）；需固定 submodule commit 防止意外更新。
- 关键：hub demo 构建的 `base` 必须等于 `/hub/`（与 `public/hub/` 对应）；docs 是 `output:'export'`，`public/` 下文件原样进入导出产物，iframe 引用 `/hub/index.html#/dashboard` 即可。

> 建议先用 ① 跑通，后续若要「全部自托管在一个域名」再切 ②。

### 5.2 `HomeShowcase.tsx` 改造（click-to-activate）

当前面板内是 `<img src={item.img}>`，外层已有「浏览器窗口」边框 `showcase-shot__frame` 和 `IntersectionObserver`。改造点：

1. `ShowcaseItem` 接口新增可选字段：`embedSrc?: string`（实时演示地址）。
2. 渲染逻辑：
   - 默认仍渲染**截图当占位图（poster）**——保证首屏轻、SEO 友好、无 JS 也能看。
   - poster 上叠一个「▶ 点击体验实时演示」蒙层按钮。
   - 点击后 `setActive(i)`，把该面板的 `<img>` 换成 `<iframe src={embedSrc} loading="lazy" sandbox="allow-scripts allow-same-origin">`。
   - 可选：用已有的 `IntersectionObserver`，仅当面板进入视口才允许激活，离开视口卸载 iframe，控制内存（多个重型 SPA iframe 不能同时常驻）。
3. **深链映射**（在 `lib/home-content.ts` 的 showcase items 上补 `embedSrc`）：

   | item.img | embedSrc |
   |---|---|
   | `/home/dashboard.png` | `<HUB>/#/dashboard` |
   | `/home/plugins.png` | `<HUB>/#/plugins` |
   | `/home/plugins_config.png` | `<HUB>/#/plugins` |
   | `/home/theme.png` | `<HUB>/#/themes` |
   | `/home/ai-memory.png` | `<HUB>/#/ai-memory` |
   | `/home/ai-meme.png` | `<HUB>/#/ai-meme` |

   `<HUB>` = 方式①的外部域名，或方式②的 `/hub`。建议抽成 `lib/home-content.ts` 顶部常量 `HUB_DEMO_BASE`，多语言三处共用。

4. **样式**：iframe 用 `width:100%；height:100%；border:0`，套进现有 `showcase-shot__media`；保持 16:10 左右的宽高比（看板页设计宽度通常 ≥1280，iframe 内可让 hub demo 用响应式或 `transform: scale()` 适配缩略框）。

### 5.3 实施分期

- **Phase 1（半天，快速见效）**：hub 加 `VITE_DEMO` + Tier 0/Tier 1 Mock（看板优先，已有生成器）→ 部署 demo → docs 把截图改成「点击在**新标签页**打开 `embedSrc`」。几乎不改 docs 逻辑，先把「可点击」交付。
- **Phase 2（1–2 天，完整交互）**：docs 实现 click-to-activate 内嵌 iframe + 按需挂载/卸载；hub 把 Tier 1 其余页面（插件/主题/记忆/表情）Mock 数据补齐撑满。
- **Phase 3（可选）**：把更多页面纳入 Demo（统计、看板 kanban、预算），做成一个「完整可逛的演示控制台」，docs 顶部加一个「在线体验」入口直接打开 `<HUB>/#/home`。

---

## 6. 关键改动文件清单

**gsuid_hub**
- `vite.config.ts` — 新增 `demo` mode 分支（`base`/`outDir`/`define`）
- `package.json` — `build:demo` / `dev:demo` 脚本
- `src/lib/api.ts` — `ApiClient` 增加 `fetchImpl` 注入点（裸 `fetch` → `this.fetchImpl`）
- `src/lib/mockServer.ts` — **新增**，Mock 路由 + 封套 + 兜底
- `src/lib/mockData.ts` — 扩充生成器（plugins / themes / memory / meme），复用已有看板生成器
- `src/main.tsx`（或新增 `main.demo.tsx`）— Demo 下注入 `mockFetch` + 假 token
- 部署配置（GitHub Pages workflow 或子域名）

**GenshinUID-docs**
- `components/HomeShowcase.tsx` — 新增 `embedSrc` 字段 + click-to-activate iframe 逻辑
- `lib/home-content.ts` — showcase items 补 `embedSrc`，新增 `HUB_DEMO_BASE` 常量（zh/en/ja 共用）
- `app/global.css` — `.showcase-shot__media iframe` 与激活蒙层样式
- （方式②时）`.gitmodules` + CI 构建脚本 + `public/hub/`（构建产物，建议 `.gitignore`）

---

## 7. 验证方式

1. **hub 本地 Mock 预览**：`bun run dev:demo` → 浏览器开 `http://localhost:5173/#/dashboard`，确认**不弹登录页**、看板图表/KPI 全部有数据、切换 `#/plugins`、`#/themes`、`#/ai-meme`、`#/ai-memory` 均有内容、控制台无 401/报错。
2. **hub 静态产物**：`bun run build:demo` → `npx serve dist-demo`（或任意静态服务器），验证 HashRouter 深链 `/#/dashboard` 直接可达、刷新不 404。
3. **生产构建未受污染**：`bun run build`（普通 mode）→ 确认 `VITE_DEMO` 分支被剔除、仍连真实后端。
4. **docs 集成**：`pnpm dev`（或项目脚本）开主页 → 滚动到 showcase → 点击某面板 → iframe 加载出对应实时页面、可在 iframe 内点击交互；滚走再滚回不卡顿。
5. **docs 静态导出**：`next build`（`output:'export'`）→ 用静态服务器开导出产物，确认 iframe 的 `embedSrc` 可达（方式②下 `/hub/` 随产物一起导出）。
6. **回归**：截图作为 poster 仍在、无 JS 时面板可见（渐进增强）。

---

## 8. 风险与注意事项

- **性能**：hub 是重型 SPA（echarts / graphology 等），多个 iframe 同时加载会卡。**必须**用 click-to-activate + 视口外卸载，不能一上来就挂 6 个 iframe。
- **跨域 iframe**：方式①需确认部署端允许被 `<docs域名>` 嵌入（`frame-ancestors`）。
- **资源体积**：hub demo 产物可能较大；可在 demo 构建里关掉用不到的重页面（路由懒加载本就分包），或仅打包 Tier 1 页面。
- **Mock 真实性边界**：Demo 数据是假的，注意脱敏、避免误导（建议全局 toast/水印标注「演示模式」）。
- **维护**：hub 改了接口形状，Mock 可能过期 → 让生成器返回值直接复用 `api.ts` 的 `interface`，靠 TS 编译报错来提醒同步。
- **submodule 漂移（方式②）**：固定 submodule commit，避免 docs 构建拉到未测试的 hub 版本。
```
