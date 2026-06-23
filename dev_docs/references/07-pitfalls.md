# 七、已知坑与开发注意事项

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[六、搜索](./06-search.md)

这是一份**踩坑复盘**：每条都是迁移 / 维护中真实遇到过的问题、根因、解法、以及"不要顺手改回"的红线。
遇到奇怪现象先在这里查。

---

## 坑 #1：顶部导航栏没占满整宽（全宽 Header）

- **现象**：顶栏只占中间文档列宽，两侧空着。
- **根因**：自定义 `DocsNav` 作为 `nav.component` 渲染进 `DocsLayout` 的 grid `header` 槽，
  而该槽宽度只等于 main 列。
- **解法**（`app/global.css` + `app/[lang]/docs/layout.tsx`）：
  - `.glass-header { position: fixed; top:0; left:0; right:0; height:3.5rem; z-index:50 }` 脱离网格、横跨整屏。
  - `#nd-docs-layout { --fd-banner-height:3.5rem; padding-top:3.5rem }` 把 sticky 的 sidebar/toc 落到 Header 下、内容整体下移。
- **红线**：别把 Header 改回 sticky/grid 内布局；`DocsNav` 必须留在 `SidebarProvider` 内（它用 `useSidebar()` 控制移动端抽屉）。

## 坑 #2：标题下出现奇怪副标题（description 误填）

- **现象**：页面标题下方副标题是一条 `- 列表项` / 代码 / 引用。
- **根因**：迁移脚本把正文第一行塞进了 frontmatter 的 `description`。
- **解法**：已批量清理掉以 `-`/`*`/`` ` ``/`>`/`[`/```` ``` ````开头或为空的 `description`。
- **红线**：新增页时 `description` 只写"人写的一句简介"，否则不写。见 [四、§4.2](./04-writing-mdx.md)。

## 坑 #3：首页按钮 404

- **现象**：点首页"快速开始"跳到 `/<lang>/started/...` 报 404。
- **根因**：`lib/home-content.ts` 里 `link` 漏了 `/docs` 前缀（首页组件只补 `/<lang>`）。
- **解法**：home-content 的 `link` 一律写 `/docs/...`（如 `/docs/started/install-core/`）。
- **注意**：如果你看到的 404 来自旧构建产物，重新 `pnpm build` 并重新部署即可。

## 坑 #4：同时 import 两个 CSS preset 冲突

- **现象**：迁移初期样式错乱。
- **根因**：`global.css` 同时 `@import` 了 `vitepress.css` 和 `preset.css`，颜色令牌互相打架。
- **解法**：只 import `preset.css`（布局 / 排版）+ `lib/default-colors.css`（补全 `--color-fd-*` 令牌），
  再用 `@theme` / `.dark` 覆盖颜色。**注意 `preset.css` 本身不含颜色令牌**。见 [二、§2.2](./02-theme-and-styling.md)。

## 坑 #5：插件卡片徽章竖排 / 图标偏下

- **现象**：插件市场里"停止维护"徽章被挤成一列单字、图标不居中。
- **根因**：徽章在 flex 容器里被压缩换行；标题没截断把徽章挤没空间。
- **解法**（`app/global.css`）：`.fd-badge { white-space:nowrap; flex-shrink:0 }`；
  `.fd-plugin-title > span:first-child` 用省略号截断；卡片 `align-items:center`。

## 坑 #6：`pnpm build` 末尾 `EBUSY: rmdir 'out'`

- **现象**：页面已生成（"Generating static pages 220/220"），但末尾报 `EBUSY` 失败。
- **根因**：有静态服务器（`python -m http.server` / `serve`）正占着 `out/` 目录。
- **解法**：先关掉占用 `out/` 的进程（按端口或进程名杀），再 `pnpm build`。

## 坑 #7：中文搜索 / 搜索崩溃

- 见 [六、搜索](./06-search.md) 完整说明。要点：
  - `items?.map is not a function` → 用了默认 fetch client，必须用 static client。
  - 中文搜不到 → 两端分词器要一致（mandarin），且不要设 `threshold: 0`。
  - 只在代码块出现的词搜不到 → 预期行为（索引不收代码块）。

## 坑 #8：MDX 与 markdown-it 行为差异（写作期）

- 中文加粗 `**【没有】**` 失效 → 已用 `remark-cjk-friendly` 修（`source.config.ts`，用追加方式别覆盖默认插件）。
- 正文 / 组件 children 里的字面 `{ }` 被当 JS 表达式 → 包成行内代码或 `{'...'}` 字符串。
- `<!-- -->` 不是注释（用 `{/* */}`）；裸 `<` `>` 可能被当 JSX（包进行内代码或写实体）。
- 详见 [四、§4.5](./04-writing-mdx.md)。

## 坑 #9：从 server component 给 RootProvider 传函数

- **现象**：给 `RootProvider search.options.initOrama` 传函数时 TS / RSC 报错。
- **根因**：函数无法跨 server→client 边界序列化。
- **解法**：把 `RootProvider` 放进 client 组件 `components/Providers.tsx`，函数在 client 侧定义。

## 坑 #10：颜色硬编码导致深色 / 主题不跟随

- **现象**：某组件在深色模式下颜色不对、或换主题没变。
- **根因**：组件里写了 `bg-blue-500` / `#xxxxxx` / 裸 `oklch(...)`。
- **解法**：一律用 `--color-fd-*` / `--fd-glass-*` 变量或 `*-fd-*` 工具类。见 [二、§2.6 红线](./02-theme-and-styling.md)。

---

## 坑 #11：Tailwind v4 `@theme` 把自定义语义色 token 静默 tree-shake 掉

- **现象**：`callout` 警告卡背景总是灰白，icon 颜色看起来对，但卡片像一张白纸。
- **根因**：Tailwind v4 的 `@theme { --color-fd-warning: oklch(...) }` 只在「被当作 utility class 用」时才把 CSS 变量写进 `@layer theme`。本项目里这些 token **只在 `color-mix()` / 自定义 CSS 中以 `var()` 引用**（没有 `bg-warning` 这种 utility），于是整块被 tree-shake 掉。最终输出的 `:root,:host` 里只剩 `default-colors.css` 的默认 `--color-fd-warning: oklch(76.9% 0.188 70.08)`（amber-500 那一档），而该默认在 light 模式下根本没定义，解析失败后 fall back 到 `var(--color-fd-muted)`（≈白色）。
- **解法**（`app/global.css`）：所有 `--color-fd-*` token **不要写进 `@theme`**，改用**普通 CSS `:root` / `.dark { ... }` 定义**——完全绕过 Tailwind 的 tree-shake。`:root` 是 unlayered 规则，自然胜过 `@layer theme` 里的默认。
  - 顺便把语义色加深到 L≈0.6（默认 L=0.77 那个 amber 实在太浅，混 30% 也是近乎白纸）。
- **红线**：别再用 `@theme static` 之类的小聪明——只要不动 `@theme`，全部走普通 CSS 最稳。结构性 token（`--color-fd-background` / `--color-fd-card` 等）同理迁移，否则暗色 `.dark` 块永远不生效（页面一直在用 fumadocs 的默认灰底）。
- **诊断方法**：构建后 `grep '\-\-color-fd-warning:' .next/static/chunks/*.css`，如果只看到 `#f99c00` / `#ebb25f`（默认 amber-500）而看不到自己的 oklch 值，就是被 tree-shake 了。

## 坑 #12：MDX 图片引用别改成相对路径

- **现象**：批量修 MDX 链接时，把 `![alt](/WebConsole/foo.png)` 改成 `../web-console/foo.png`，构建报 `Module not found: Can't resolve '../web-console/foo.png'`（几十条）。
- **根因**：MDX 把 `![alt](相对路径)` 当作 ES module `import` 语法处理，编译期尝试 import 该文件作为 JS module。`public/WebConsole/foo.png` 是静态资源，不是模块，import 失败。
- **解法**：图片语法 `![alt](url)` 和链接语法 `[text](url)` 必须分开处理。脚本里只用 `(?<!!)\[text\]\(url\)` 匹配（即 `[` 之前不能是 `!`），**不要用 `(?<!!)\(url\)` 匹配**——中间隔着 `[alt]`，负向 lookbehind 失效，图片会被一起改。
- **图片 URL 永远是绝对 `/Foo/file.ext`**，由 Next.js 从 `public/` 提供，写作期就不该改。

## 坑 #13：`[[...slug]]` + `output: 'export'` 在 dev mode 一直吐 `generateStaticParams` 错误

- **现象**：dev server 控制台狂刷 `⨯ Failed to generate static paths for /[lang]/docs/[[...slug]]: Page is missing param ... in "generateStaticParams()"`。
- **根因**：`output: 'export'` 要求所有路由参数都在 `generateStaticParams` 中显式列出。但 dev mode 仍会按需尝试编译路由（包括用户点错链接进入的 404 路径），一遇到不在 params 里的就报错。
- **解法**（`app/[lang]/docs/[[...slug]]/page.tsx`）：在 page 顶部加 `export const dynamicParams = false`。这样未列出的 slug 直接 404，**不报错、不崩溃**。404 URL 仍然能在 log 看到「Failed to generate static paths」，但 server 本身不挂、后续请求继续 200。
- **注意**：`dynamicParams = false` 在 production build 时是必需配置；在 dev mode 它只压制 panic，错误 log 仍会刷（这是 Next.js 已知行为）。如果 log 太吵，可以加 `console.error` 过滤或换 `standalone` output 模式。
- **诊断方法**：`grep "Failed to generate static paths" /tmp/dev.log`——如果连着出现但 HTTP 状态码仍是 200/404，说明只是噪音，不是真崩。

## 坑 #14：内部 MDX 链接大小写敏感

- **现象**：MDX 写了 `[NoneBot2](../LinkBots/NoneBot2)`，build 通过，但点链接跳到 `/<lang>/docs/started/LinkBots/NoneBot2/` 直接 404。
- **根因**：
  1. 文件系统实际是 `content/docs/link-bots/none-bot2.mdx`（kebab-case）。
  2. `createRelativeLink(source, page)` 用 `source.resolveHref()` 只把 `./` / `../` 相对路径解析成正确 URL（基于文件路径查 source loader）；绝对 `/Foo/Bar` 则原样透传。
  3. 文件系统大小写敏感（特别是 Linux 部署），`LinkBots/NoneBot2` 在 macOS dev 上能 build，但运行时找不到文件 → 404。
- **解法**：
  - 写 MDX 时一律用**实际文件系统中的 kebab-case 路径**，如 `../link-bots/none-bot2`。
  - 绝对路径 `/Foo/Bar`（不带 `/docs/` 前缀）会被透传、不解析，要么改成相对路径，要么加 `/docs/` 前缀并在路由里再加一层 rewrite。
  - 已写好的迁移脚本 `scripts/fix-links.mjs` 可一键批量修正 22 个文件的全部路径（含 light/dark 双方向）；**但它会误改图片**，使用前看坑 #12。
- **检查命令**（CI 里可加）：`grep -rE '\]\([^)]*[A-Z]' content/docs/ --include='*.mdx' | grep -v 'http' | grep -v '!\\['`，命中即坏链接。

## 坑 #15：字体切片·可变字体（VF） + unicode-range

> 完整设计见 [八、字体切片](./08-font-slice.md)。本条只列**踩过的具体雷**。

- **不要用 `font-slice`（voderl 那个 npm 包）做 VF**。它底层用 `fontmin` + `fonteditor-core`，
  只能处理静态字体，传 VF 进去会被削平（fvar / gvar 丢失），CSS 里的 `font-weight: 600`
  会回退到默认 weight 而不是沿 wght 轴插值。本项目改用 `pyftsubset`（fonttools），
  它原生支持 VF 切片。
- **`pyftsubset` 处理 VF 时千万别 `--no-subset-tables+=gvar`**。
  gvar 表里逐字形引用了字体里所有字形；如果你只 `--unicodes=U+4e00-4fff` 切一个 CJK 段
  又强制保留完整 gvar，序列化时会 `KeyError: 'A'` 之类的字形找不到崩溃。
  正确做法：让 gvar 跟着 glyf 一起被裁（默认行为），只把 `STAT / HVAR / VVAR / MVAR / cvar`
  这些**轴元数据**加进 `--no-subset-tables+=`。
- **CSS 里的 `font-weight` 必须写范围**，不是离散值：
  `font-weight: 150 700;` 而不是 `font-weight: 400;` 或 `font-weight: bold;`。
  离散值当然也能工作（浏览器会 snap），但范围写法才是 W3C VF 推荐 + 最不易出错。
- **`font-family` 用 VF 在 `name` 表里的真实 family**，不要沿用旧静态字体的名字。
  MiSans 静态字体里 family 是 `MiSans`，VF 里 family 是 `MiSans VF`。
  写错名字不会报错，但 wght 轴不会被激活——表现就是 font-weight: 600 看起来跟 400 一样。
- **源 .ttf 一定要放 `assets/fonts/`，不要放 `public/`**。
  `public/` 下任何文件都会被 Next.js 静态导出原样塞进 `out/`，20MB 的 VF 源文件
  会无意义地膨胀部署体积，并被浏览器访问到（虽然没人会去访问 `/font/MiSans-VF/MiSansVF.ttf`，
  但还是会出现在站点地图里）。
- **不要在 `app/global.css` 里给 `--font-sans` 写 `font-feature-settings` 里的 `wght` opt-in**。
  MiSans VF 不需要 `font-optical-sizing`/`font-variation-settings` 来启用 wght，
  现代浏览器读到 `font-weight: 150 700;` 就会自动沿轴插值。多此一举反而会绑定 weight。
- **删旧文件**：迁移到 VF 后要立刻删 `public/font/MiSans-{Medium,Bold,Demibold,Heavy}/`
  四个目录 + `public/font/MiSans-*.ttf` 四个静态 ttf（合计 ~30MB），否则 `pnpm build` 会
  全部复制进 `out/`——坑 #6 EBUSY 时还会在末尾报资源未释放。

---

## 坑 #16：fumadocs v16 sidebar 不再用 `<ul>/<li>`，旧 selector 全失效

- **现象**：给 sidebar folder 图标写按 `ul[role="list"] > li:nth-of-type(6n+k)` 染色，**所有 folder icon 仍是灰色**——CSS 编译产物完全正确，但 selector 命中数 = 0。
- **根因**（用 headless Chrome 抓实际 DOM 验证）：
  旧版 fumadocs（v15 及更早）sidebar 是：
  ```html
  <ul role="list">
    <li><a>root leaf</a></li>
    <li><button>folder</button>
      <ul role="list"><li><a>leaf</a></li>...</ul>
    </li>
  </ul>
  ```
  **fumadocs v16 把整个树重写为 div 结构**——`createPageTreeRenderer` 内部不再生成 `<ul>`，渲染产物是：
  ```html
  <div data-radix-scroll-area-viewport>
    <div style="min-width:100%;display:table">           ← tree container
      <a>root leaf</a>
      <div data-state="open|closed">                    ← folder wrapper
        <button><svg folder-icon>name<svg chevron data-icon="true"></button>
        <div data-radix-collapsible-content>
          <a><svg leaf-icon>name</a>
        </div>
      </div>
    </div>
  </div>
  ```
  因此所有 `ul[...] > li:nth-of-type(...)` selector **零命中**。`--folder-accent` 永远 undefined → fallback 到 `var(--color-fd-primary)`（紫色），又被 button 的 `text-fd-muted-foreground` 颜色继承盖住 → 视觉上"全是灰色"。
- **解法**（`app/global.css` 当前实现）：
  1. **tree container 的稳定 hook**：`[data-radix-scroll-area-viewport]` 是 Radix 内层 attr，sidebar 内只此一处。用它当"页树根"选择器：
     ```css
     #nd-sidebar [data-radix-scroll-area-viewport] > div > :nth-child(6n+k) {
       --folder-accent: oklch(0.62 0.16 200);
     }
     ```
     子级 leaf 自动通过 CSS 变量继承拿到父 folder 的色相。
  2. **folder icon 选择器**：folder trigger button 内 element children 只有 2 个 svg（folder-icon + chevron），`:first-child` 精确指向 folder-icon；chevron 是第二个、不受影响。leaf `<a>` 内只有 1 个 svg，命中即着色：
     ```css
     #nd-sidebar button > svg:first-child,
     #nd-sidebar a > svg:first-child {
       color: var(--folder-accent, var(--color-fd-primary));
     }
     ```
- **诊断方法**（避免再被 selector 骗）：
  ```bash
  # 1. 抓实际 HTML，看 ul/li 还在不在
  curl -sL http://localhost:3000/<lang>/docs/<any> | grep -c '<ul\b'
  # 2. 用 Chrome DevTools Protocol 跑真实浏览器，看 querySelectorAll('你的 selector').length
  # 3. 看 sidebar 内 #nd-sidebar ul[role="list"] 这种 selector 在 .next/static/chunks/*.css 里
  #    有没有命中数（用 grep -c '<selector>' .next/static/chunks/*.css 不准，因为编译产物会被
  #    lightningcss 改写；要以浏览器实测为准）
  ```
- **红线**：**别再用 `ul[role="list"] > li` 这种 selector 给 sidebar 染色**，升级 fumadocs 后务必
  重新检查。`data-radix-scroll-area-viewport` 也属于 Radix 实现细节，将来可能换，但目前是唯一稳定的 hook。

---

## 坑 #17：inline code 与 `pre code` 字体各走各的链；MiSans VF 必须置顶

- **现象**：文档正文里 `` `代码` `` 里的中文看着与正文笔触 / 宽度不一致；切到代码块里中英文字体又不同。
- **根因**：原始 `app/global.css`：
  ```css
  code, pre, kbd { font-family: var(--font-mono); }
  ```
  `--font-mono` 是 `Fira Code`，**没有中文字形**。inline code 与 pre code 都被强制走 Fira Code → 中文 fallback 到系统中文字体（PingFang / 微软雅黑），与正文 MiSans VF 不一致。
- **解法**（`app/global.css` 当前实现，规则分三段）：
  1. **行内 code（` :not(pre) > code`）**：MiSans VF 在前 → Fira Code 兜底英文等宽 → 系统 mono。
     ```css
     pre, pre code, kbd {
       font-family: 'MiSans VF', ui-monospace, ...;
       font-variant-ligatures: none;
       font-feature-settings: 'liga' 0, 'clig' 0, 'calt' 0;
     }
     :not(pre) > code {
       font-family: 'MiSans VF', 'Fira Code', ui-monospace, ...;
     }
     ```
     注意 **inline code 不能用 `var(--font-mono)`**——`--font-mono` 把 Fira Code 置顶，中文跌落到系统字体。
  2. **代码块（`pre, pre code`）**：选择与 inline code 不同的权衡：
     - **保留英文连字（`=>` / `!=` 等 ligatures 美观）** → 字体链 `Fira Code, MiSans VF, monospace`，但中英文割裂。
     - **纯 MiSans VF（中英文统一）** → 字体链 `MiSans VF, monospace` + 关闭 `liga/clig/calt`。本项目选这条，理由是中文文档里**保持中英文字体一致**比英文连字更重要。注意 MiSans 是 proportional 字体，所以代码块严格等宽属性会消失——这是权衡。
  3. **切片生效验证**：`MiSans-VF/font.css` 里 97 个 `@font-face` 已经按 `unicode-range` 切分（详见 §8），浏览器只下载命中字符的 woff2——切到代码块时浏览器自动加载对应 unicode 区间的 slice，内存不会爆炸。
- **诊断方法**：
  - DevTools → Network → 找带 `MiSansVF.*\.woff2` 的请求，记录下载了哪些 slice。
  - 视觉上：英文 `===` 是不是看上去一样粗细（VF 沿 wght 轴插值生效）；中文是不是与正文同款。
- **关联**：本坑与 §8 / 坑 #15 同根——都依赖「单一 VF + unicode-range 切片」这套字体基础设施。

---

## 坑 #18：文档页 banner 重排（关面包屑 + 把动作按钮移到 banner 右下）

- **现象**：原本 `<DocsPage breadcrumb={...}>` 把章节路径自动塞在 article 顶部一行（占满整列），与 `<h1>` 视觉重复；复制 / GitHub 编辑按钮也在 article 内单独占一行，下面留 1.75rem (`mb-7`) 空白。
- **新设计**（`app/[lang]/docs/[[...slug]]/page.tsx`）：
  ```tsx
  <DocsPage breadcrumb={{ enabled: false }} ...>
    <div className="fd-doc-banner">
      <div className="fd-doc-banner__main">
        <div className="fd-doc-title-row">
          <TitleArcs />
          <DocsTitle>{page.data.title}</DocsTitle>
        </div>
        <DocsDescription>{page.data.description}</DocsDescription>
      </div>
      <div className="fd-doc-banner__actions">
        <LLMCopyButton ... />
        <ViewOptions ... />
      </div>
    </div>
    {/* 原来 banner 下方的按钮行已删 */}
    <DocsBody>...</DocsBody>
  </DocsPage>
  ```
- **CSS**（`app/global.css`）：`.fd-doc-banner` 改成 `display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end;`，左列 `__main`（title + description），右列 `__actions` 贴底与 description 行底对齐。`@media (max-width: 40rem)` 切回单列堆叠，按钮组 `order: 2` 排在主列下方。
- **历史决策**：曾经试过把面包屑移到 banner 右下（与 description 底对齐），但用户最终决定「**完全不显示面包屑**」——所以源码里没有再 import `PageBreadcrumb`。如果以后想恢复，把 `breadcrumb={{ enabled: true }}` 改回即可，但别再用 :has 自渲染到 grid 里，**与 fumadocs 的 `<PageBreadcrumb>` 组件重复**会让 button 与 breadcrumb 文本撞色。
- **红线**：改了 banner grid 后**别**把 `.fd-doc-banner__actions` 改成 `flex-end` 与左列基线硬贴——`align-self: end + padding-bottom: 0.1rem` 才能让按钮组与 description 行底视觉对齐（description 的 `line-height: 1.4` 让行底略低于基线）。

---

## 坑 #19：lucide-react 的 `icons` map ≠ 命名导出；少数 icon 名不在 map 里

- **现象**：`pnpm build` 时控制台刷 `[lucide-icons-plugin] Unknown icon detected: Home.` 与 `Unknown icon detected: Train.`，对应页面找不到 sidebar 图标 / 图标 fallback 成默认。
- **根因**（实测）：
  ```bash
  node -e "const {icons} = require('lucide-react'); console.log('Home' in icons, 'Train' in icons, 'House' in icons, 'TrainFront' in icons)"
  # 输出：false false true true
  ```
  `lucide-react` v0.460 里 **`icons` map（keyed export）与 `* as lucide` 命名导出的成员不完全一致**——少数 icon（`Home` / `Train` 等）只通过命名导出提供，`icons['Home']` 返回 `undefined`，`lucideIconsPlugin` 在 `lib/source.ts` 里 `if (!Icon) console.warn('Unknown icon detected: ' + icon)`。
  - **本项目**：`lucideIconsPlugin()` 在 `lib/source.ts` 里只读取 `meta.json` 与 `frontmatter` 里的 `icon` 字符串 → 它用的是 `icons` map（不是命名导出），所以 `Home` / `Train` 这类字符串**会被拒**。
- **解法**：
  - 写 frontmatter 时**避开不在 `icons` map 里的 icon 名**。本项目已踩过的坑对应替换：
    | 含义 | ❌ 不在 icons map | ✅ 在 icons map |
    |------|----------------|----------------|
    | 房子（首页 / 文档首页） | `Home` | `House` |
    | 火车（崩铁插件页） | `Train` | `TrainFront` |
    | 其它常见的等价替代 | `RefreshCcw`（不确认） | `RotateCcw` |
  - 想确认某个 icon 名是否安全：
    ```bash
    node -e "const {icons} = require('lucide-react'); console.log('<NAME>' in icons)"
    ```
    输出 `true` 才能写进 `meta.json` 或 `frontmatter.icon`。
- **自动化**：项目里 `scripts/update-doc-icons.mjs` 一次性重映射了 68 个 mdx 的 leaf icon（含 `Home → House`、`Train → TrainFront`）；脚本里有完整映射表，新增 icon 前先查表。

---

## 坑 #20：frontmatter `description` 里的 `[text](url)` / `**text**` 不渲染

- **现象**：在 `description` 里写
  `在 [commit f903e3](https://github.com/...) 之后，将启用**全新的网页控制台**。`
  渲染出来是一坨原文：`在 [commit f903e3](https://...) 之后，将启用**全新的网页控制台**。`，
  链接没变成 `<a>`、加粗没变成 `<strong>`。
- **根因**：fumadocs 的 `DocsDescription` 组件只把 children 当纯文本塞进 `<p>`，**不解析任何 Markdown**。
  它接受 `ComponentProps<'p'>`，没有 remark / rehype 流水线。
- **解法**（`app/[lang]/docs/[[...slug]]/page.tsx` + `components/MarkdownDescription.tsx`）：
  - 用自写的 `MarkdownDescription` 替换 `DocsDescription`；
  - 它是个**轻量级 inline parser**，只识别 `[text](url)` 与 `**text**` 两类语法，
    避免把整个 remark 流水线拉进来（保持 `description` 始终是"一句话简介"，符合 §4.2 红线）。
  - 链接：外链（`http(s)://`）自动 `target="_blank" rel="noreferrer noopener"`；站内 `/...` 走普通 `<a>`。
  - 样式：`.fd-doc-description` 用 `--color-fd-muted-foreground` + 0.8rem + 1.6 行高。
  - **不要把图片 / 标题 / 列表 / 代码块塞进 description**——只支持两种 inline 语法。
- **新增/调整规则时**：如果以后需要支持更多 inline 语法（如 `*italic*` / `code`），改 `components/MarkdownDescription.tsx`
  里的 `parseInline` / `pushBold` 即可，**不要在 page.tsx 塞一个 client-side remark**。

## 坑 #21：标题 banner 与正文之间的间隙过长且不一致

- **现象**：
  - 旧值：`.fd-doc-banner { margin-bottom: 1.25rem }` + `.prose h2 { margin-top: 2.5rem }`
    + `.prose.prose > div[style*="--callout-color"] { margin: 1.5rem 0 !important }`。
  - 首元素是 H2 → 间隙 1.25 + 2.5 = 3.75rem（≈ 60px）。
  - 首元素是 Callout → 间隙 1.25 + 1.5 = 2.75rem，但 callout 自身还有 1rem padding-top，
    **视觉**实际是 3.75rem + callout box-shadow / border 感知，更大。
  - 两种首元素之间还会跳变（h2 / callout / p 各有不同 margin-top）。
- **解法**（`app/global.css`，3 处配套调整）：
  1. `.fd-doc-banner` 的 `margin-bottom` 从 `1.25rem` 压到 `0.75rem`，**padding-bottom** 保留 `0.5rem`
     （让 border-bottom 与 description 行底留点呼吸）。
  2. 给 `.prose > :first-child` 统一覆盖 `margin-top: 1.25rem !important`。
  3. 另加 `.prose.prose > div[style*="--callout-color"]:first-child`（特异性 0,3,1）压过 callout 自身的
     `margin: 1.5rem 0 !important`，让 callout 作为首元素时也只占 1.25rem。
  - 三处叠加后：banner margin-bottom (0.75) + first-child margin-top (1.25) = **2rem**（与 H2 文本基线齐）；
    callout 内部还有 1rem padding-top，所以 callout 文本基线比 H2 文本基线再低约 0.6rem——两者的视觉起点
    接近一致，差距明显小于旧值。
- **红线**：不要把 `padding-bottom: 0.5rem` 也清掉——border-bottom 与 description 行底需要一点距离
  否则线会贴在文字上。也不要给 `h2:first-child` 单独写规则，**用 `:first-child` 统一管**——
  否则下次加新首元素类型（H3 / ul / figure）又得维护一长串。

---

## 通用注意事项

> - **改完必 `pnpm build`**：MDX 语法 / TS 类型 / 搜索索引的问题只有构建期暴露。
> - **站内链接带结尾 `/`**（`trailingSlash: true`）。
> - **`@orama/orama` 与 `@orama/tokenizers` 是 dependencies**（运行期 import），不是 devDependencies，别挪回去。
> - **三语同步**：改 UI 文案（`layout.shared.ts`）/ 导航（`nav-config.ts`）/ 首页（`home-content.ts`）时别只改一种语言。
> - **源码 / Fumadocs 官方文档是唯一事实源**；升级 fumadocs 大版本后，回归本清单里的
>   #1 / #4 / #7 / #9 / #11 / #13 / #16 / #17（都依赖 fumadocs 内部结构或 Next.js 行为）。
>   - **#16 sidebar DOM 迁移**：v16 之后基本稳定，但若 fumadocs 再换 Radix 实现细节
>     （比如 `data-radix-scroll-area-viewport` 改名），folder icon 着色会静默失效。
>   - **#17 字体链**：`pre / pre code / kbd` 当前走 `MiSans VF` 而非 Fira Code；如果你
>     想恢复英文连字，把字体链最前面换成 `Fira Code` 即可，但 inline code 必须保持
>     MiSans VF 在前。
