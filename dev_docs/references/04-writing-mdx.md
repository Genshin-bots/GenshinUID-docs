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
