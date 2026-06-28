# 四、怎么写文档（MDX 写作规范）

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[三、自定义组件](./03-components.md) · **下一章**：[五、i18n 多语言](./05-i18n.md)

文档内容是 **MDX**（Markdown + JSX），不是 VitePress 的 markdown-it。两者行为有差异，本章是
写 / 改文档页时必须遵守的规范与避坑要点。

## 4.1 新建一个文档页

1. 在 `content/docs/<分类>/<slug>.mdx` 新建文件。目录即 URL：
   `content/docs/started/foo.mdx` → `/<lang>/docs/started/foo/`。
2. 写 frontmatter（见 §4.2）。
3. 用 `## 标题` 组织小节（H2/H3 会自动进右侧 TOC）。
4. 侧边栏顺序 / 分组由 `meta.json`（若存在）或文件结构决定；需要时在该目录加 `meta.json`。
5. `pnpm build` 验证。

## 4.2 frontmatter 规范

```yaml
---
title: "安装Core"          # 必填，显示为页面大标题
description: "一句话简介"   # 可选，显示为标题下的副标题
icon: FileText            # 可选，侧边栏图标（lucide 图标名）
---
```

> **`description` 必须是"人写的一句话简介"，不要塞正文片段**。
> 迁移脚本曾把每页正文第一行（常是 `- 列表项`/```` ```代码 ````/`> 引用`）误填进 `description`，
> 导致标题下出现一坨奇怪副标题。已批量清理。新增页时：要么写一句真正的简介，要么干脆不写。
> 见 [七、坑 #2](./07-pitfalls.md)。
>
> **支持两类内联 Markdown 语法**：`[text](url)` 链接 + `**text**` 加粗。
> 由 `components/MarkdownDescription.tsx` 在 `page.tsx` 替换 fumadocs 的
> `DocsDescription`（后者只把 children 当纯文本，不会解析任何 Markdown），
> 否则写 `[commit f903e3](https://...)` 会原样输出 `[commit f903e3](https://...)`。
> 只支持这两种语法；图片 / 标题 / 列表等都不要塞进 description，仍按"一句话简介"原则写。

### 4.2.1 `icon` 字段：让侧边栏不再「全是 FileText」

`icon` 字段是可选的字符串，渲染成 sidebar 里该页前面的 svg。解析由 `lib/source.ts` 的
`lucideIconsPlugin()` 完成——它把字符串映射到 `lucide-react` 的 `icons` map。

**坑**：**`icons` map 与命名导出不完全一致**——`Home`、`Train` 等少数 icon 在命名导出里有，
但 `icons['Home']` 返回 `undefined`，会被插件报 `Unknown icon detected`（坑 #19）。
写之前验证：

```bash
node -e "const {icons} = require('lucide-react'); console.log('<NAME>' in icons)"
```

输出 `true` 才能用。

**leaf icon 多元化**：项目侧边栏每个文档页面都对应一个 `icon`，**默认写 `FileText` 会让所有
页面共享同一个灰色文档图标**——视觉同质化严重。批量改用脚本 `scripts/update-doc-icons.mjs`，
按文件名 / folder 语义映射到 lucide 图标（详见 §4.7）。

folder 入口（`content/docs/<folder>/index.mdx`）通常**不写 `icon`**——folder meta.json 里的
`icon` 会被自动用作 folder 入口页的图标（见 §4.2.2）。

## 4.3 标题与正文

- 文件里第一个 `# H1` **不会渲染**（标题由 frontmatter `title` 在 banner 区显示）。正文从 `## H2` 开始。
- 标题后可挂徽章：`## 三、绑定设备<Badge type="warning" text="实验" />`。
- 链接**带结尾 `/`**（`trailingSlash: true`）：`[安装](../started/install-core/)`。

## 4.4 提示框 / 代码块 / 聊天示例

```mdx
<Callout type="info" title="">这是信息提示</Callout>
<Callout type="warn" title="">这是警告</Callout>
```

- `type`：`info` / `warn`(=warning) / `error` / `success`。会渲染成对应语义色的**彩色磨砂玻璃**。
- **最左侧 lucide 图标已隐藏**（三角形 / 圆形 / 正方形等），只保留边框色 + 标题色作为
  语义识别。文本起始位置与正文对齐，更干净。若需恢复图标显示，去掉
  `app/global.css` 里 `.prose.prose > div[style*="--callout-color"] > svg` 的 `display: none` 即可。
- 代码块用普通 ```` ```python ```` 围栏，自动 shiki 高亮 + 冷色玻璃外框。
- 聊天示例用 `<ChatPanel>/<ChatMessage>`，用法见 [三、组件 §3.3](./03-components.md)。

## 4.5 MDX 三大坑（务必记住）

### (1) 中文加粗 / 斜体可能不生效

CommonMark 的 `**` 在**与中文标点相邻**时不构成强调，例如 `即你**【没有】**执行` 会原样输出星号。
**已通过 `remark-cjk-friendly` 修复**（`source.config.ts` 里挂了该 remark 插件），现在中文加粗正常。
若你新加 remark/rehype 插件，注意别覆盖掉它（用 `(v) => [...v, plugin]` 追加，别整体替换）。

### (2) `{ }` 会被当作 JS 表达式

MDX 里 `{...}` 是 JS 表达式。正文/组件里出现字面大括号（如 JSON 示例 `{"oaid":"x"}`）会报错
"Objects are not valid as a React child"。三种解法：

- 包成行内代码：`` `{"oaid":"x"}` ``（推荐用于命令 / 代码片段）。
- 包成 JS 字符串：`{'mys设备登录{"oaid":"x"}'}`（用于组件 children，如 ChatMessage）。
- 转义单个括号：`{'{'}` / `{'}'}`（少用）。

### (3) HTML 注释 / 裸 `<` `>`

- `<!-- -->` 在 MDX 里**不是注释**，会报错。要注释用 `{/* ... */}`。
- 裸的 `<`、`>`（如 `版本 > 3.9`）可能被当成 JSX 起始。安全做法：包进行内代码 `` `>3.9` ``，
  或写成实体 `&gt;`。

## 4.6 提交前自查清单

- [ ] frontmatter 有 `title`；`description`（若写）是一句人话。
- [ ] 没有裸 `{ }` / `<!-- -->` / 可疑裸 `<` `>`。
- [ ] 站内链接带结尾 `/`。
- [ ] 用到的组件都在 `components/mdx.tsx` 注册过。
- [ ] `pnpm build` 通过（MDX 语法错误只有构建期报）。
- [ ] 涉及多语言的改动，三语 `content/docs/*` / `*.en.mdx` / `*.ja.mdx` 同步（见 [五](./05-i18n.md)）。
- [ ] 若新增 leaf `icon`，先在 Node 验证 `'IconName' in require('lucide-react').icons`（坑 #19）。

## 4.7 leaf icon 多元化：批量映射脚本

`scripts/update-doc-icons.mjs` 一次性把 `content/docs/**/*.mdx` 的 frontmatter `icon: FileText`
按文件名 / folder 语义替换为不同的 lucide icon。运行：

```bash
node scripts/update-doc-icons.mjs
```

脚本逻辑：

1. 维护一个 `MAP` 表：`relative/path.mdx -> lucide-icon-name`。
2. 读每个 mdx → 用 `/^icon:[ \t]+\S+[ \t]*$/m` 精确匹配 frontmatter 里的 `icon:` 行 → 替换为映射目标。
3. 跳过没有 `icon:` 行的文件（如 `ai-features/index.mdx` / `faq/index.mdx` 这些 folder 入口页）。
4. 输出 `updated: N` + 每条更新的明细；找不到 `icon:` 行时打 `NO ICON LINE` warning。

**当前映射覆盖 68 个 mdx**，分配约 64 种不同 lucide icon。节选：

| folder | 文件名 | 新 icon |
|--------|--------|---------|
| started | install-core（合并：env-check + install + start + config + secure） / docker-core / web-console | Wrench / Container / Monitor |
| link-bots | adapter-list / hoshino-bot / none-bot2 | List / Bot / PlugZap |
| code-plugins | bot-call / buttons / scheduler / plugins-data-base / subscribe / start | Phone / MousePointerClick / Clock / Database / Bell / Rocket |
| plugins-help | arknights-uid / blue-archive-uid / cs2-uid / genshin-uid / star-rail-uid | Swords / GraduationCap / Crosshair / Mountain / **TrainFront**（不是 Train） |
| ai-features | agent / builtin-tools / knowledge-base / skills / trigger-bridge | UserCog / Wrench / Library / Lightbulb / GitMerge |

**新增页面时怎么选 icon**：

1. 优先看 [lucide-icons.com](https://lucide-icons.com) 找语义接近的图标。
2. 验证名是否在 `icons` map：`node -e "const {icons} = require('lucide-react'); console.log('<NAME>' in icons)"`。
3. 直接在 mdx frontmatter 里写 `icon: <NAME>`；不需要改脚本。
4. 不想自己挑 → 写 `FileText` 占位也行（视觉同质但功能正常）。等以后需要多元时再批量改。

**关联**：folder 入口（`index.mdx`）由 meta.json 决定图标——见 §4.2.2 与 §5 i18n。
