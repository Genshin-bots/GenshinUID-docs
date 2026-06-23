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
