# 九、首页 PPT 式硬翻页

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[八、字体切片](./08-font-slice.md)

本章讲首页「鼠标一滚 = 切下一页」效果是怎么做出来的、踩过哪些坑、为什么不能用浏览器原生
`scroll-snap` 凑合。涉及三个文件：`components/HomePager.tsx`、`components/HomeShowcase.tsx`、
`app/[lang]/page.tsx`、以及 `app/global.css` 里 `.home-snap-point` 系列规则。

## 9.1 设计目标与最终形态

- 用户进入首页后，每次滚动鼠标一格 / 触控板两指滑一下 / PageDown / 空格，**直接**切换到下一个 / 上一个「PPT 页」；
- 页与页之间不留"中间态"——上一页被切出视口的瞬间，下一页完全接管；
- 同一页内容比一屏高时（community / features），页内仍可逐段滚动，到底后再切下一页。

「PPT 页」由 `.home-snap-point` 标记的 5 个 DOM 节点定义（`app/[lang]/page.tsx`）：
1. `HomeHero`（首屏）
2. `Marquee`（不算 snap 点，纯装饰横滚，不占页位）
3. 4 张 `HomeShowcase` 面板
4. `#features`
5. `#community`

## 9.2 为什么不能用 CSS `scroll-snap-type: mandatory`

最初版本用过纯 CSS 方案：

```css
html:has(.home-page) { scroll-snap-type: y mandatory; }
.home-snap-point { scroll-snap-align: start; scroll-snap-stop: always; }
```

但 `mandatory` 只是「**手势结束后**吸附」——wheel 滚动过程中页面照样能滑到两屏之间的任意位置。
用户看到的是：

1. 滚轮往下转一点点，页面立刻滚到 Hero 与第一张 showcase 之间那片空白；
2. IntersectionObserver 触发展示面板的入场动画（`opacity/blur/transform` 渐变）；
3. 浏览器判断手势结束 → 吸附回最近的 snap 点。

中间那段"在两屏之间滑过" + 模糊入场动画 = 用户眼里就是「**无极滚动 + 视差乱跳**」，
与 PPT 翻页的"硬切换"观感彻底冲突。

**结论**：snap 不能解决"翻页离散感"。要硬切换，必须接管原生滚动。

## 9.3 HomePager：自己 rAF + 自定义 cubic-bezier 缓动

`components/HomePager.tsx` 是一个挂载在 `<HomeLayout>` 内的 `'use client'` 组件，
**渲染 null**，仅在 effect 里接管 `wheel / keydown / touchstart+end`，并自己写 `animateScrollTo`：

```ts
const ANIM_MS = 700;
const ease = (t: number) => 1 - Math.pow(1 - t, 4); // ≈ cubic-bezier(0.16,1,0.3,1)

const animateScrollTo = (target: number) => {
  // 用 rAF 插值，全程 isAnimating=true 拦截连跳 wheel，
  // 不依赖浏览器原生 smooth scroll（时长不可控）。
  const start = window.scrollY;
  const delta = target - start;
  if (Math.abs(delta) < 1) return;
  const t0 = performance.now();
  isAnimating = true;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / ANIM_MS);
    window.scrollTo(0, start + delta * ease(p));
    if (p < 1) animId = requestAnimationFrame(step);
    else { animId = 0; isAnimating = false; }
  };
  animId = requestAnimationFrame(step);
};
```

几个关键设计选择：

### ① 固定 700ms，比 showcase 入场动画 1000ms 短

`HomeShowcase` 面板的入场动画时长是：
- `opacity 0.9s` + `transform 1s` + `filter 0.9s`，曲线 `cubic-bezier(0.16, 1, 0.3, 1)`
- 初始态 `translateY(56px) scale(0.985) blur(14px) opacity: 0`

翻页 700ms 结束时面板的 blur 还有约 200ms 没播完——但 IntersectionObserver 已经在
`threshold: 0.25 + rootMargin: '0px 0px -12% 0px'` 触发点上把 `.is-in` 加上了，
CSS 过渡开始跑 → 视觉上"翻页到位的同时面板也开始入场"，**两组动画接力而非打架**。

翻页缓动用 `1 - (1-t)^4` 近似 `cubic-bezier(0.16, 1, 0.3, 1)`（强 ease-out），
与 showcase 入场曲线**同源**——这是"回 Hero 不再像突然跳回"的根因：

> 旧版用浏览器原生 `scrollTo({behavior:'smooth'})` 时长不可控（400–800ms 抖动，与距离非线性），
> 偶尔比 showcase 入场动画还短 → 页面先停稳，入场动画才从中间状态开始播 → "跳一下又开始模糊飘"。
> 自实现 700ms + 同步曲线后，每一帧时序都在掌控之中。

### ② `isAnimating` 标志取代 `setTimeout` 软锁

旧版用 `LOCK_MS=700` 的 setTimeout 解锁。问题：smooth 滚到 800ms 时锁已经解开，下一次
wheel 在原 scroll 还在动时进来，`currentIndex()` 读的是实时 scrollY（动画中间值），
被误判为「已在 idx-1」或「仍在 idx」→ 二段跳 / 跳两页。

新版的 `isAnimating` 在 `requestAnimationFrame` 里和 `scrollTo` **同步更新**，整个
700ms 期间收到的 wheel 全部丢进 `step()` 的早 return，物理上不可能误判。

### ③ 同一页内部仍可滚动（不要 hard-cap）

社区页（`#community`）内容比一屏高，硬切会把中段砍掉。所以 `step(direction)` 的逻辑是：

```ts
if (direction === 1) {
  const visibleBottom = scrollY + viewport;
  if (pageBottom - visibleBottom > 8) {
    // 当前页还有内容没看完 → 在页内继续滚一段（85vh），不切下一页
    animateScrollTo(Math.min(pageBottom - viewport, scrollY + viewport * 0.85));
    return;
  }
}
// 否则真正切页
```

向上同理：当前页顶部还没对齐 → 先回页顶，再来一次 wheel 才切上一页。

### ④ 避开 input / dialog / Marquee

`isInteractiveTarget()` 过滤：

- `<input>` / `<textarea>` / `<select>`
- `isContentEditable` 元素
- `[data-search-dialog]` / `[role="dialog"]` / `.fd-search-dialog`（搜索弹窗内的滚动不应被打断）
- `.marquee`（装饰横滚，本身就不该被翻页拦截）

## 9.4 不要让 CSS scroll-snap 复活

**坑**：用 JS 接管滚动后，`html { scroll-snap-type: y mandatory }` 必须从 CSS 里删掉。
否则脚本 `scrollTo` 把页面推到 snap 候选区附近时，浏览器会**抢主**把它"修正"回最近的
snap 点 → 出现"跳一下又被吸回去"的诡异回弹。`app/global.css` 里只剩：

```css
html:has(.home-page) {
  /* scroll-padding-top 仅给键盘 PageDown 兜底；
     不再启用 scroll-snap-type（与脚本抢主）。 */
  scroll-padding-top: 4.5rem;
}
```

`.home-snap-point` 也只剩几何意义（脚本用它枚举"页"），不再挂 `scroll-snap-align`。

## 9.5 HomeShowcase：每张面板是一页

`components/HomeShowcase.tsx` 的设计要点（与 §9.3 的 700ms 时序对齐）：

- 每个 `<article class="showcase-panel home-snap-point">` `min-height: 88vh`，配合 `align-items: center` → 翻到这一页时**视觉居中**，像翻到一页幻灯片。
- 入场动画仅由 IntersectionObserver 双向触发（`.is-in`）：进入视口模糊淡入上浮、离开反向 → 来回滚不丢动效。
- 初始态有 `filter: blur(14px)`。**这里 blur 不是问题**——因为脚本不会让面板"出现在视口中间位置"，只有 IO 触发 `.is-in` 后 blur 才解除，时序完全可控。CSS 里这条说明放在注释里给后续维护者看：

```css
/* 初始态：模糊 + 下沉 + 轻微缩小 + 透明。
   进入视口由 JS 加 .is-in 触发下方过渡；离开时 .is-in 被移除，过渡反向。 */
opacity: 0;
transform: translateY(56px) scale(0.985);
filter: blur(14px);
```

## 9.6 HomeHero：只跟随鼠标，不跟随滚动

`HomeHero` 不再做 `onScroll` rAF 写 `--sy / --p`（曾经实现过，取消）——理由是滚动驱动的 transform
会与 scroll-snap 抢合成层，导致面板在翻页瞬间"抖一下"。现在只剩鼠标视差的 rAF，
**纯位移**写 `--mx/--my`，完全不动 `filter`，跨页时无副作用。

详见 `components/HomeHero.tsx` 顶部注释。

## 9.7 完整文件清单

| 文件 | 作用 |
|------|------|
| `components/HomePager.tsx` | 翻页控制器（client component，渲染 null） |
| `components/HomeShowcase.tsx` | 4 张框架运行效果面板，IO 触发动画 |
| `components/HomeHero.tsx` | 首屏 Hero（仅鼠标视差，不跟随滚动） |
| `app/[lang]/page.tsx` | 在 `<HomeLayout>` 内挂 `<HomePager />` + 5 个 `.home-snap-point` |
| `app/global.css` | `.home-snap-point` 与 scroll-snap 全部移除；详见本节 #9.4 |

## 9.8 Hero 动漫眼睛眨眼层

为提升首页"动漫感"，Hero 背景层新增一个**纯 CSS 驱动**的眨眼动画：

- 资源：`public/home/eyes.png`（1672×941，16:9，从项目根移入）。SVG / Spine 都被排除（位图保真度差 / 运行时与静态导出冲突）。
- 实现：在 `.hero-px__bg` 内放 `<img class="hero-px__eyes-img">` + 两个 `<span class="hero-px__lid">`（左/右眼睑），眼睑用同肤色 `oklch(92% 0.04 54)` 径向渐变 + 软阴影，闭合时与原图肤色无缝融合。
- 动画：`@keyframes heroBlink`（5s 一周期，92% 睁开 → 94% 完全闭合 → 96.5% 打开 → 100% 继续睁开），**只动 `transform: scaleY()`（GPU 合成层）**，零 JS、零额外请求。
- 软化边缘：img 用 `mask-image: radial-gradient(ellipse 78% 72% at 50% 50%, black 28%, transparent 82%)`，让原 orbs / grid / beam 在边缘自然显出，不抢戏。
- 可读性：`.hero-px__scrim` 在 content 区域轻微压暗 ~24%（`--color-fd-background`），让 logo / 标题 / 按钮在人脸上仍清晰。
- 鼠标视差：眼睑层跟随 `--mx/--my` 反向位移（-8px / -6px），与 orbs 同一坐标系。
- 关键 CSS 钩子：`.hero-px__eyes` / `.hero-px__lid` / `@keyframes heroBlink` / `.hero-px__scrim`。
- **沿用项目"不响应 `prefers-reduced-motion`"策略**——动画在所有设备上完整播放，不加 reduce-motion 降级块。
- 源图眼睛位置探测：左 22.5% / 右 77.5%、垂直 53.5%，对应 `left` / `top` 百分比。CSS 注释里记下探测过程，方便后续换图时校对。

## 9.9 测试要点

`pnpm build` 通过后，本地起 `pnpm dev` 用桌面浏览器自测：

- ✅ Hero ↔ Showcase-01 之间上下滚：滚一格直接到页顶 / 页底，**不卡顿、不出现中间模糊态**。
- ✅ Showcase 长页面（community）：在 community 内上下滚多次，不会突然跳到 features / contributors；
  滚到页底后再滚一次才切到下一页。
- ✅ 键盘 PageDown / Space / ArrowDown：单次按一次切一页；连按也不会漏页（被 `isAnimating` 拦）。
- ✅ 触屏：单指竖向 swipe 超过 40px 切页。
- ✅ 搜索弹窗打开时滚动：不会切页（被 `isInteractiveTarget` 拦）。
- ✅ Hero 动漫眼睛：每 ~5s 看到一次完整眨眼（~250ms），眼睑肤色与原图无缝；移动鼠标整张脸轻微反方向视差跟随；滚走时眼睛层随 snap 一起退出视口，无残留 / 撕裂。