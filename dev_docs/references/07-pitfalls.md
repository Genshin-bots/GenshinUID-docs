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

---

## 坑 #22：独立全页路由 `/chat` 套 `HomeLayout` 后被 fixed Header 盖住首行

- **现象**：新建一条独立全页路由 `/[lang]/chat`，沿用首页套路包了
  `<HomeLayout nav={{ component: <DocsNav /> }}>`，但打开后聊天卡顶部被 `.glass-header`
  盖住第一行（输入框 / 状态条）。
- **根因**：
  - `.glass-header` 是 `position: fixed; top: 0; height: 3.5rem`，文档页靠
    `#nd-docs-layout { padding-top: 3.5rem }` 把内容下移。
  - 但 `HomeLayout` 渲染的容器是 `<main id="nd-home-layout" class="flex flex-1 flex-col [--fd-layout-width:1400px]">`，
    **没有 `padding-top`**——首页的 hero 自己有 `padding: 7rem 1.5rem 6rem` 兜底，但
    我们的聊天卡是 `100%` 高 + `margin: 0`，没有内部 padding 顶替，所以首行被遮。
  - 另一个连带问题：`--fd-layout-width` 默认 `1400px` 会让聊天卡在宽屏两侧空出大量留白。
- **解法**（`app/[lang]/chat/layout.tsx` + `app/global.css`）：
  - 在 `HomeLayout` 的 `className` 上挂一个标识类（如 `fd-chat-standalone`），让 CSS 精确命中：
    ```tsx
    <HomeLayout className="fd-default-layout fd-chat-standalone" ...>
    ```
  - 加一条专用规则（**不要**直接改 `#nd-home-layout`，否则会污染首页）：
    ```css
    #nd-home-layout.fd-chat-standalone {
      --fd-banner-height: 3.5rem;
      --fd-layout-width: 100%;
      padding-top: 3.5rem;
    }
    ```
  - 同样地，聊天卡本身的外边距要按场景区分：文档内嵌（`/sp/chat`）有 `margin: 0.75rem 0` 即可；
    独立全页想贴到 main 边缘就单独覆盖（`.fd-chat-page-container--standalone > .fd-chat-container { margin: 0.5~0.75rem }`）。
- **诊断方法**：开 Chrome DevTools → Elements，看 `<main id="nd-home-layout">` 的 `padding-top` 是不是 `0`；
  聊天卡顶部的 `.fd-chat-header` 第一行像素是不是被压在 header 阴影下面。
- **红线**：
  - **别**给 `.glass-header` 改成非 fixed 来"让位"——它脱离了 docs 网格是全站行为（见坑 #1），
    改了首页 / 其它页全跟着坏。
  - **别**给聊天卡加固定 `margin-top: 3.5rem` 来补偿——移动端顶栏会折叠，桌面端又会和真 padding 叠加。
  - **别**用 `100vh` 算高度。手机浏览器地址栏出现/收起会让视口高度跳变；
    聊天卡的 `height: calc(100vh - 3.5rem)` 在 vh 收缩时会被裁掉下半段。
    真要写，要么用 JS 测 `dvh` + 顶栏高度，要么只对桌面端用 `100vh`，移动端让它自然滚动。

## 坑 #23：WebSocket 状态变化连刷两条「已连接到 X」

- **现象**：用户改一次 WebSocket URL 之后，消息列表里出现两次「已连接到 ws://...」
  （旧连接断开的提示 + 新连接成功的提示连着来），或者从「正在连接」点「取消」后
  又出现一次「已连接到 ...」（旧 hook 的关闭事件触发了错误状态）。
- **根因**：
  旧实现用 `useEffect([connectionStatus, wsUrl])` 直接读 `connectionStatus` 后 push 系统消息。
  WS URL 改一下会触发「旧 ws.close → 新 ws.connect → connecting → connected」连续两步，
  任何一步都满足 `status === 'connected'`，于是连刷。
- **解法**（`components/chat/ChatInterface.tsx`）：
  - 用一个 `useRef<ConnectionStatus | null>(null)` 记录上一态，只有 `prev !== 'connected' && cur === 'connected'`
    才 push「已连接到 ...」；同理 disconnect / error 也只刷一次。
  - **别**直接把依赖数组换成 `[connectionStatus]`——WS URL 变化也会刷一次。
  - **别**用 `useEffect` + 内部 `if (status !== prev)` 状态机改在 hook 里——hook 应该只负责「把 ws 事件翻译成状态」，**业务层语义（要不要刷系统消息）应该留在组件里**。
- **关联**：[十、§10.4 WebSocket 状态机](./10-chat-route.md) 给出完整的状态转换表。

## 坑 #24：新消息强制 scrollToBottom 把用户从历史里拽回来

- **现象**：用户向上滚聊天记录看历史消息，对方这时发来一条新消息，
  聊天卡自动跳到最底部，用户被打断、要重新滚回去找位置。
- **根因**：原 `ChatMessageList` 监听 `messages.length`，每来一条新消息就
  `containerRef.scrollTop = containerRef.scrollHeight`，没判断用户当前是否在底部。
- **解法**（`components/chat/ChatMessageList.tsx`）：
  - 维护一个 `stuckToBottomRef`（默认 `true`），
    监听 `scroll` 事件，距底 < 16px 视为「贴底」置 `true`，否则 `false`。
  - 渲染后只在 `stuckToBottomRef.current === true` 时才自动滚到底。
- **红线**：**别**改成「距离底部超过 N px 才不滚」这种**绝对阈值**——
  消息条目高度不固定，N 选大了会过早抓回，N 选小了用户小幅翻动就会触发。
  16px 是个经验值，相当于「用户的视觉容差」，再小就挑剔了。
- **关联**：[十、§10.5 智能滚动](./10-chat-route.md)。

---

## 坑 #25：`output: 'export'` 下访问 `/chat/`（无 lang 前缀）直接 500

- **现象**：用户（或外部链接）直接访问 `/chat/`（不带 `/zh-CN/` `/en/` `/ja/`），
  dev server 报：
  ```
  Error: Page "/[lang]/page" is missing param "/[lang]" in "generateStaticParams()",
         which is required with "output: export" config.
  GET /chat/ 500
  ```
  三语版（`/zh-CN/chat/` `/en/chat/` `/ja/chat/`）都 200，只有裸 `/chat/` 挂。
- **根因**：
  - 我们的聊天主路由是 `app/[lang]/chat/page.tsx`，其 `generateStaticParams`
    只为已知 lang 列表生成（`/zh-CN/chat/` `/en/chat/` `/ja/chat/`）。
  - 用户敲 `/chat/` 时，Next.js 兜底匹配到 `app/[lang]/page.tsx`（首页），
    但 `lang = undefined` 不在 `i18n.languages` 里，生成阶段报缺参数，
    静态导出把这个 URL 当成未配置路由 → 500。
  - `output: 'export'` 模式下**任何不在 generateStaticParams 列表里的路径都会这样**，
    不只是聊天页；这是 Next.js 静态导出的硬约束。
- **解法**（`app/chat/page.tsx`）：
  - 在 `app/` 下加一条**与 `[lang]` 同级的 `/chat` 路由**，做 0 秒 meta-refresh 跳到 `/zh-CN/chat/`：
    ```tsx
    export const dynamic = 'force-static'

    export default function ChatRootRedirect() {
      return (
        <html lang="zh-CN">
          <head>
            <meta charSet="utf-8" />
            <meta httpEquiv="refresh" content="0; url=/zh-CN/chat/" />
            <title>正在跳转到在线聊天室…</title>
          </head>
          <body>
            <p>正在跳转到 <a href="/zh-CN/chat/">在线聊天室</a>…</p>
          </body>
        </html>
      )
    }
    ```
  - 这条路由会被 Next.js 当成纯静态页生成 `out/chat/index.html`，
    浏览器访问 `/chat/` 收到 200 + meta refresh，零延迟跳到 `/zh-CN/chat/`。
  - `<a href>` 是兜底——某些浏览器 / 隐私插件会禁用 meta refresh，仍能点链接走。
- **为什么不用 server redirect**：`output: 'export'` 不支持运行时 server redirect
  （`redirect()` 必须在请求时由 server 执行，但导出后没有 server），
  只能用静态 HTML 级别的手段（meta refresh / `<a>` / JS `location.replace`）。
- **为什么不在 `[lang]/chat` 内部做**：那样会进入「`lang = ''` → notFound → 500」
  的死循环（同样是 generateStaticParams 问题）。必须有一层在 `[lang]` 之上的独立路由。
- **关联**：
  - [十、§10.3 `/chat` 路由实现](./10-chat-route.md) 列了两条入口的边界。
  - 坑 #13 是 `[[...slug]]` 上的同类问题，解法 `dynamicParams = false` 同样适用
    任意 catch-all 路由；本坑则是固定路由（`[lang]/chat`）上的同类问题，必须靠
    **提供同名的实际静态路由**解决。
- **红线**：
  - **别**尝试在 `app/[lang]/chat/page.tsx` 里 `if (lang === '') redirect('/zh-CN/chat/')`——
    `lang` 永远不会是 `''`，Next.js 在路由匹配阶段就已经把空段拒了。
  - **别**把 `lang` 默认值兜底成 `'zh-CN'`——那会让所有未知前缀都静默跳到中文版，
    SEO 重复内容 + 隐式行为。
  - **别**用 JS 跳转（`useEffect(() => location.replace(...))`）替代 meta refresh——
    静态页 JS 关掉或 404 就会卡在白屏；meta refresh 是 HTML 协议级、关不掉。

---

## 坑 #26：WebSocket 失败时 `console.error` 触发 Next.js dev error overlay 红屏

- **现象**：聊天页里 WebSocket 默认连 `ws://localhost:8765/ws/web`，dev 模式下用户没起本地服务，
  连不上是「预期」——但浏览器下方弹出 Next.js 红色 error overlay，控制台报：
  ```
  WebSocket 错误: Event {}
  at useWebSocket.useCallback[connect] (hooks/useWebSocket.ts:84:15)
  ```
  同时 React 19 在控制台反复刷：
  ```
  Warning: Can't perform a React state update on an unmounted component
  ```
- **根因（双坑叠加）**：
  1. **`console.error` 在 React 19 / Next.js 16 dev mode 被 Next 拦截**，触发红屏 overlay。
     实际上 `console.error('WebSocket 错误:', error)` 不是「程序 bug」而是「网络层错误」，
     但 Next 不知道这层语义，一律当 fatal error 处理。
  2. **异步回调里 setState**：组件卸载（`useEffect` cleanup → `disconnect()`）时，旧 ws 的
     `onerror` / `onclose` 仍可能在微任务里 fire，回调里调 `setConnectionStatus(...)` 就会撞上
     React 19 的 "state update on unmounted component" 检查。
  3. **多实例竞态**：用户连点「重新连接」/ 改 URL 触发自动重连时，旧 ws 的事件可能在
     新 ws 创建后才 fire，把新 ws 的状态搅乱（旧 onerror 把 `connectionStatus` 改成 'error'）。
- **解法**（`hooks/useWebSocket.ts`，三处配套修改）：
  1. **挂载守卫 `mountedRef`**：组件卸载时置 `false`，所有 `setState` 之前先看一眼。
     ```ts
     const mountedRef = useRef(true)
     useEffect(() => () => { mountedRef.current = false }, [])
     // 在所有 setState 前：
     if (!mountedRef.current) return
     ```
  2. **实例版本号 `wsInstanceIdRef`**：每次 `new WebSocket` 自增；所有 handler
     入口先比对自己捕获的 `instanceId` 与 `wsInstanceIdRef.current`，
     不一致直接 `return`。这样旧 ws 的事件永远不会污染新 ws 的状态。
  3. **`console.error` → `console.warn`**：网络层 / 解析层错误是「已知非致命问题」，
     用 warn 而不是 error，避免被 Next dev overlay 当成红屏 bug 显示。
- **额外收尾**：
  - `disconnect` / `cancelConnection` / cleanup 里**主动摘掉所有 handler**（`onopen = null` 等），
    再 `close()`；这样即便 ws 关闭是个异步过程，回调 fire 也会被上面的 `instanceId` 检查挡掉。
  - `setTimeout(connect, 100)` 之后 `return () => clearTimeout(timer)` 清理掉，
    避免 URL 频繁改动时排队的 connect 把已经断开的 ws 复活。
- **诊断方法**：
  - DevTools → Console：`grep` `WebSocket 错误`；如果出现红屏 overlay 是 dev-only，
    production build 不会拦截 `console.error`，但 React 19 的「unmounted setState」仍会刷警告。
  - 频繁改 URL 时观察 `wsInstanceIdRef.current` 是否每次都 +1（DevTools 里加个 watch 表达式）。
- **关联**：[十、§10.4 WebSocket 状态机](./10-chat-route.md) 与本坑配合读。
- **红线**：
  - **别**直接删掉 `console.error`——连接失败时还要在 dev 控制台给出可见信息，
    否则真出 bug 时排查不到。改成 `console.warn('[useWebSocket] ...')` 并加 `[useWebSocket]`
    前缀方便 grep。
  - **别**只挂 `mountedRef` 不挂 `wsInstanceIdRef`——前者只防「卸载后 setState」，
    后者还防「同生命周期内多 ws 串扰」。两个都加才完整。

---

## 坑 #27：聊天收到的图片只显示 broken image —— `base64://` 协议没翻译

- **现象**：用户发图片（base64）→ 自己的消息气泡里**图片能正常显示**（因为 `useFileUpload`
  走 `FileReader.readAsDataURL` 输出的是标准 `data:image/jpeg;base64,...`），但**收到的 /
  echo 回来的消息里图片是 broken image**。DevTools 打开气泡 div 看 HTML：
  ```html
  <img src="base64:///9j/4AAQSkZJRgAB..." class="chat-image" ... />
  ```
  浏览器不认 `base64://` 协议，所以渲染失败。
- **根因**：
  - 服务端下行的图片数据是 GsCore 自定义协议 `base64://<payload>`（payload 是裸 base64，
    无 `data:` 前缀）——这是协议层约定，便于统一传输。
  - 浏览器只认 `data:image/...;base64,xxx` 或 `https://...`。
  - **`base64://` → `data:<mime>;base64,xxx` 的翻译，原本只在 `NodeMessagePanel`
    （合并转发面板）里**——`useMessageRenderer` 漏了。主消息气泡里图片就 broken。
  - 类似的 `link://https://...` 协议也是：原本只在 NodeMessagePanel 翻译。
- **解法**（`lib/media.ts` + `hooks/useMessageRenderer.ts` + `components/chat/NodeMessagePanel.tsx`）：
  - 抽出共享工具 `resolveMediaUrl(raw, kind)`，翻译规则按顺序匹配：
    1. 已经是 `data:` / `http(s):` / `blob:` → 原样返回（自己上传的、已经格式化好的不动）
    2. `link://xxx` → `xxx`
    3. `base64://xxx` → `data:<mime>;base64,xxx`，MIME 通过 base64 前 12 字符嗅探
    4. 纯 base64（无前缀）→ `data:<mime>;base64,xxx`
    5. 其它 → 原样兜底
  - `sniffMimeFromBase64` 识别 JPEG (`/9j/`)、PNG (`iVBORw0KGgo`)、GIF (`R0lGOD`)、
    WebP (`UklGRg`)、BMP、ICO、MP3 (`SUQz`)、WAV、OGG、MP4 (`AAAA` = ftyp box 头部)。
    识别失败按 kind 兜底（image→jpeg / audio→mpeg / video→mp4），与原 VitePress 时代行为一致。
  - **两处渲染都改用同一个 `resolveMediaUrl`**：`useMessageRenderer.renderImage / Audio / Video`
    + `NodeMessagePanel.renderMessage` 都从 `lib/media` import，协议规则一处定义两处生效。
- **诊断方法**：
  - DevTools → Elements → 选中消息气泡的 `<img>` → 看 `src` 属性是不是 `base64://` 开头。
  - 切到 Network → 找 `data:image` 请求；如果 `<img>` 确实在尝试加载但 404 / 不识别 src，
    才会触发 broken image。
- **关联**：
  - [十、§10.7 输入区交互细节](./10-chat-route.md) 提到附件预览与发送。
  - [十、§10.8 图片 / 合并转发](./10-chat-route.md) 提到 lightbox 与 NodeMessagePanel。
- **红线**：
  - **别**在每个调用点重复翻译逻辑——`NodeMessagePanel` 里旧实现就是复制粘贴，半年后
    一边加了 `link://` 翻译另一边忘了，bug 就藏在分叉里。**只在一处（`lib/media.ts`）维护**。
  - **别**直接把 `data:` URL 用正则 filter 一次然后让浏览器自己识别——`base64://` /
    `data:` 是两套不同前缀，正则匹配要按「开头」锚定，不然像 `link://https://...`
    这种会被误处理。
  - **别**硬编码 MIME 为 `image/jpeg`——很多插件吐的是 PNG / WebP，硬编码 JPEG
    会让 Chrome 拒绝解码（`ERR_INVALID_IMAGE_TYPE` 之类）依然 broken image。
    一定要走嗅探。

