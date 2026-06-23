# 八、字体切片（MiSans VF · unicode-range 按需加载）

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[七、已知坑](./07-pitfalls.md)

本章讲项目当前在用的**小米可变字体**怎么切片、怎么挂上去、坑在哪。
读完本章应该能：知道 font.css 怎么被 layout 引入、为什么只引一份而不是四份、
怎么重新生成切片，以及 VF + unicode-range 切片的关键注意项（坑 #15）。

## 8.1 全貌：4 套静态 → 1 套可变 + 97 个 slice

```
assets/fonts/
└── MiSansVF.ttf          ← 构建期源文件，20MB，wght 150~700
                            不在 public/，不会被部署到 out/

public/font/MiSans-VF/
├── font.css               ← 单个 CSS，97 个 @font-face，
│                            由 app/[lang]/layout.tsx <link> 进来
├── MiSansVF.1.woff2       ← 11KB   (ASCII 标点 / 全角符号)
├── MiSansVF.2.woff2       ← 10KB
├── ...
├── MiSansVF.4.woff2       ← 88KB   (CJK 常用 4E00-5104)
├── ...
└── MiSansVF.97.woff2      ← 27KB   (拉丁扩展 / 平假名)

public/font/                ← 部署到 out/ 的最终产物，5.9MB（其中 VF 5.7MB + FiraCode 240KB）
├── FiraCode-Regular.woff
├── FiraCode-Regular.woff2
└── MiSans-VF/
```

**收益对比**：

| 方案 | 部署大小 | 浏览器首屏实际下载 |
|------|---------|------------------|
| **旧**：4 套静态 (Medium/Bold/Demibold/Heavy) × 97 切片 | ~32 MB | 4 套 slice 全部都要，~3MB |
| **新**：1 套 VF × 97 切片 | **5.9 MB** | 仅当前页面用到的 unicode 区间的 slice，~50KB |

> 旧方案已彻底删除（`MiSans-*.ttf` + `MiSans-{Medium,Bold,Demibold,Heavy}/` 子目录）。

## 8.2 三处接线

### 1. `<link>` 加载

`app/[lang]/layout.tsx`：

```tsx
<html lang={lang} suppressHydrationWarning className={inter.className}>
  <head>
    {/* MiSans VF + unicode-range 切片：详见 dev_docs §8 / 坑 #15 */}
    <link rel="stylesheet" href="/font/MiSans-VF/font.css" />
  </head>
```

—— 只引**一份** font.css，里面包含 97 个 `@font-face`，每个 woff2 自身已经覆盖 wght 150~700。
旧的 4 个 `MiSans-Medium/font.css` 等 `<link>` 已全部删除。

### 2. CSS 变量指向 VF 字体族

`app/global.css`：

```css
:root {
  /* 'MiSans VF' 是 VF 的真实 family name（见 font.name 表 id=1），
     wght 轴在每个 woff2 内部生效，所以 CSS 里写 font-weight: 600 即可
     让浏览器沿 wght 轴插值，无需切换不同 font 文件。 */
  --font-sans: 'MiSans VF', 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
}
```

### 3. 切片工具

`scripts/font-slice.mjs`：详见 §8.3。

## 8.3 切片脚本（`scripts/font-slice.mjs`）

```bash
node scripts/font-slice.mjs
```

会做三件事：

1. **读参考** —— 从 `public/font/MiSans-Medium/font.css` 里抠出 97 个 `unicode-range`。
   用现有的静态字体 CSS 当参考，是为了**复用 Google Fonts Noto Sans SC 风格的划分**，
   保证与历史方案覆盖区间一致，避免某天发现某个罕见字符突然渲染成 fallback。
2. **逐 slice 调 `pyftsubset`**：
   - `--unicodes=<range>` 指定该 slice 保留的字符；
   - `--flavor=woff2` 输出 woff2；
   - `--no-subset-tables+=STAT,HVAR,VVAR,MVAR,cvar` 保留**轴元数据表**；
     `fvar / gvar` **不**加进 no-subset，让 pyftsubset 跟着 glyf 一起裁，否则
     gvar 里引用的字形被裁掉后会报 `KeyError: 'X'`（坑 #15 详述）。
   - `--drop-tables+=DSIG`（数字签名，浏览器用不上）；
   - `--notdef-glyph --notdef-outline --recommended-glyphs --glyph-names` 等
     "Google Fonts 风格" 推荐选项。
3. **写 font.css** —— 97 个 `@font-face`，全部指向同一 family `'MiSans VF'`、
   `font-weight: 150 700`，`src` 同时给 `woff2-variations` 和 `woff2` 两种 format
   （前者是 W3C VF 标准 mime，旧浏览器回退到 woff2；这里两个 src 都指向同一文件）。

**前置依赖**：`pip install fonttools brotli`。

**输出**：`public/font/MiSans-VF/{MiSansVF.{1..97}.woff2, font.css}`。

## 8.4 验证 VF 没被切片"削平"

```bash
python -c "
from fontTools.ttLib import TTFont
f = TTFont('public/font/MiSans-VF/MiSansVF.4.woff2')
print('fvar axes:', [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in f['fvar'].axes])
"
# 应输出: fvar axes: [('wght', 150.0, 330.0, 700.0)]
```

如果 fvar 没出现，说明 slice 被削平成静态字体了，需要查 `pyftsubset` 选项。

## 8.5 怎么增减 / 重新划分 slice

一般**不要改划分**。Google Fonts Noto Sans SC 这套划分已经过千万级页面验证，
覆盖了 90% 中文文档站字符。若确有特殊需求：

- 加 slice：往 `assets/fonts/MiSansVF.ttf` 增加字符 → 重新跑脚本 → 自已在 font.css 里加新 @font-face。
- 调权重：CSS 里直接写 `font-weight: 600`，浏览器沿 wght 轴插值；**不要**为了让某个页面用 700
  而额外引入一份静态字重，会破坏单文件原则。

## 8.6 已知坑

详见 [七、坑 #15](./07-pitfalls.md#坑-15字体切片可变字体-vf--unicoderange)。

> **核心记忆点**：VF 切片 ≠ 静态字体切片。
> - `--no-subset-tables+=gvar` 是**反模式**，会让 gvar 引用已裁掉的字形，pyftsubset 报 `KeyError`。
> - CSS 用 `font-weight: 150 700;` 表示范围（**两数字**，不是 400 / 700 这种离散值）。
> - font-family 必须用 VF 在 `name` 表里登记的真实 family（这里是 `'MiSans VF'`），别用历史名 `'MiSans'`，
>   否则 wght 轴不会被触发，浏览器回退到默认 weight。