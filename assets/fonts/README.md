# Fonts（构建期源文件）

> 这里放**不会被部署到生产**的字体源文件，仅供 `scripts/font-slice.mjs`
> 在构建 / 维护时读取并切成 `public/font/MiSans-VF/*.woff2` + `font.css`。
>
> `public/` 下任何东西都会被 Next.js 静态导出原样塞进 `out/`，所以源 `.ttf`
> 不能放在 `public/`（20MB / 字体，会无意义地膨胀部署体积）。

## 当前包含

| 文件 | 用途 |
|------|------|
| `MiSansVF.ttf` | 小米可变字体源文件（20MB），wght 轴 150~700。喂给 `scripts/font-slice.mjs` |

## 重新生成 woff2 切片

```bash
node scripts/font-slice.mjs
```

输出位置：`public/font/MiSans-VF/MiSansVF.{1..97}.woff2` + `font.css`。