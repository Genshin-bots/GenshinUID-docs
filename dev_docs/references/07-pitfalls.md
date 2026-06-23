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

## 通用注意事项

> - **改完必 `pnpm build`**：MDX 语法 / TS 类型 / 搜索索引的问题只有构建期暴露。
> - **站内链接带结尾 `/`**（`trailingSlash: true`）。
> - **`@orama/orama` 与 `@orama/tokenizers` 是 dependencies**（运行期 import），不是 devDependencies，别挪回去。
> - **三语同步**：改 UI 文案（`layout.shared.ts`）/ 导航（`nav-config.ts`）/ 首页（`home-content.ts`）时别只改一种语言。
> - **源码 / Fumadocs 官方文档是唯一事实源**；升级 fumadocs 大版本后，回归本清单里的 #1/#4/#7/#9/#11/#13（都依赖 fumadocs 内部结构或 Next.js 行为）。
