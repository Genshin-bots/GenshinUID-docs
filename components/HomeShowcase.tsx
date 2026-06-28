'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Check } from 'lucide-react'

interface ShowcaseItem {
  img: string
  alt: string
  eyebrow: string
  title: string
  desc: string
  points: string[]
  /** 实时演示深链（hub Demo 对应页）。有值时该面板默认内嵌实时 iframe。 */
  embedSrc?: string
}

interface HomeShowcaseProps {
  title: string
  subtitle: string
  items: ShowcaseItem[]
  /** 内嵌后右下角徽章文案（i18n，缺省中文）。 */
  liveBadge?: string
}

/** 内嵌「桌面站缩略图」的两个关键参数：
 *  - TARGET_SCALE：iframe 在面板里的**固定**显示比例。固定比例（而非固定逻辑宽度）能让内嵌
 *    控制台在任何视口宽度下都呈现**一致的、足够小**的尺寸——逻辑视口随容器宽度反推
 *    （logicalW = 容器宽 / TARGET_SCALE），宽屏上 hub 渲染得更宽、元素相对更小，避免
 *    「在宽屏上几乎 1:1、UI 过大压缩空间」（修用户反馈「缩放还是太大」）。
 *  - RATIO：逻辑视口宽高比，必须与 .showcase-shot__media 的 aspect-ratio 一致（16:10）。 */
const TARGET_SCALE = 0.75
const RATIO = 1.6
/** 逻辑视口宽度的钳制区间：
 *  - 下限 MIN：容器窄时（小屏/窄列）若按比例反推出 <768 的逻辑宽，hub 会切到移动布局、侧边栏收起。
 *    钳到 MIN 后改用 scale=容器宽/MIN（比 TARGET 略小）→ 始终保住桌面布局 + 侧边栏。
 *  - 上限 MAX：超宽屏避免反推出巨大 iframe（合成层显存随面积线性增长），钳到 MAX → scale 略大。 */
const MIN_LOGICAL_W = 1100
const MAX_LOGICAL_W = 2400
/** 滚入视口后延迟挂载 iframe 的毫秒数：盖过 HomePager 的 700ms 翻页动画，
 *  让 ~3.3MB 的重型 SPA 在**滚动停下后**才加载，不在翻页途中阻塞主线程（修「滚动卡顿」）。
 *  若用户在延迟内又翻走，挂载会被取消——快速划过的页面根本不加载。 */
const MOUNT_DELAY_MS = 500

/**
 * 单个内嵌面板：把 hub Demo 以「容器宽 / 固定比例」反推的逻辑尺寸渲染，再等比缩放进缩略框。
 *  - ResizeObserver 实时测量容器宽度，反推逻辑视口宽高写入 iframe（缩放比例固定 = TARGET_SCALE）。
 *  - iframe 加载完成前显示截图 poster 作为占位，加载完淡出。
 */
function EmbedFrame({ item, liveBadge }: { item: ShowcaseItem; liveBadge?: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  // 逻辑视口尺寸：随容器宽度反推（保持 TARGET_SCALE 固定显示比例）
  const [dims, setDims] = useState({ w: 1600, h: Math.round(1600 / RATIO) })

  useEffect(() => {
    const box = boxRef.current
    if (!box)
      return
    const apply = () => {
      const boxW = box.clientWidth
      if (boxW <= 0)
        return
      // 先按目标比例反推逻辑宽，再钳到 [MIN, MAX]；钳制时用实际 scale=容器宽/逻辑宽 保证铺满。
      let logicalW = Math.round(boxW / TARGET_SCALE)
      logicalW = Math.max(MIN_LOGICAL_W, Math.min(MAX_LOGICAL_W, logicalW))
      const scale = boxW / logicalW
      setDims({ w: logicalW, h: Math.round(logicalW / RATIO) })
      box.style.setProperty('--embed-scale', String(scale))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={boxRef}
      className="showcase-embed"
      style={{ '--embed-scale': TARGET_SCALE } as CSSProperties}
    >
      {/* 加载占位：轻量骨架（不再用旧截图），iframe onLoad 后淡出。
          去掉截图占位还顺带省了 6 张大图的解码/合成开销，利于滚动流畅。 */}
      <div
        className="showcase-shot__skeleton"
        data-loaded={loaded ? 'true' : 'false'}
        aria-hidden
      >
        <span className="showcase-shot__spinner" />
      </div>
      <iframe
        className="showcase-embed__frame"
        style={{ width: dims.w, height: dims.h }}
        src={item.embedSrc}
        title={item.alt}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={() => setLoaded(true)}
      />
      <span className="showcase-shot__live">● {liveBadge ?? '实时演示'}</span>
    </div>
  )
}

/**
 * 主页「框架运行效果」展示区——左右交错的超大面板，PPT 式逐屏呈现。
 *
 * 入场动效：IntersectionObserver 双向触发 .is-in，CSS 过渡（opacity + transform + filter）一次成像。
 *
 * 截图「活化」（默认内嵌，无需点击）：
 *  - 每个面板**滚入视口即自动挂载** hub Demo 的实时 iframe（深链到对应页，`?embed=1` 锁定侧边栏），
 *    访客直接就能在框内点击交互——不再需要先点「开始演示」。
 *  - 首屏不一次性挂 6 个重型 SPA：用 IntersectionObserver 懒挂载，进过视口的面板才加载，
 *    且加载后保持挂载（来回滚动不重载、不闪）。未挂载前显示截图 poster。
 *  - iframe 以 1440px 桌面逻辑宽度渲染再等比缩放，从而**完整展示含侧边栏的页面**（解决缩放/侧边栏问题）。
 */
export function HomeShowcase({ title, subtitle, items, liveBadge }: HomeShowcaseProps) {
  const rootRef = useRef<HTMLElement>(null)
  // 已挂载实时 iframe 的面板下标。一旦加入不再移除（保持挂载，避免来回滚动重载）。
  // 但挂载本身是**延迟**的：滚停后才加载，快速划过的面板不会触发加载（见下方 timers）。
  const [mounted, setMounted] = useState<Set<number>>(() => new Set())
  // 每个面板「待挂载」的延迟计时器；离场时清掉，避免在翻页途中加载重型 SPA。
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  // 用 ref 镜像 mounted，供 observer 回调内读取最新值（不必把 mounted 放进依赖重建 observer）。
  const mountedRef = useRef(mounted)
  mountedRef.current = mounted

  useEffect(() => {
    const root = rootRef.current
    if (!root)
      return

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('.showcase-panel'),
    )
    const timers = timersRef.current

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.index)
          // 入场/离场动效（立即响应，不受挂载延迟影响）
          entry.target.classList.toggle('is-in', entry.isIntersecting)

          if (entry.isIntersecting) {
            // 滚入视口：延迟挂载——盖过 700ms 翻页动画，避免加载阻塞主线程造成卡顿。
            if (!mountedRef.current.has(idx) && !timers.has(idx)) {
              const id = setTimeout(() => {
                timers.delete(idx)
                setMounted((prev) => {
                  if (prev.has(idx))
                    return prev
                  const next = new Set(prev)
                  next.add(idx)
                  return next
                })
              }, MOUNT_DELAY_MS)
              timers.set(idx, id)
            }
          }
          else {
            // 在延迟内又翻走：取消挂载（这一页根本不加载）。已挂载的保持不变。
            const pending = timers.get(idx)
            if (pending) {
              clearTimeout(pending)
              timers.delete(idx)
            }
          }
        }
      },
      // 提前一点（视口下方 25%）开始计时，让滚停后尽快就绪
      { threshold: 0.2, rootMargin: '0px 0px 25% 0px' },
    )
    for (const panel of panels)
      io.observe(panel)

    return () => {
      io.disconnect()
      for (const id of timers.values())
        clearTimeout(id)
      timers.clear()
    }
  }, [])

  return (
    <section ref={rootRef} id="showcase" className="home-showcase">
      <div className="home-showcase__head">
        <h2 className="home-showcase__title">{title}</h2>
        <p className="home-showcase__subtitle">{subtitle}</p>
      </div>

      <div className="home-showcase__list">
        {items.map((item, i) => {
          const showEmbed = Boolean(item.embedSrc) && mounted.has(i)
          return (
            <article
              key={item.img}
              className="showcase-panel home-snap-point"
              data-index={i}
              data-side={i % 2 === 0 ? 'left' : 'right'}
            >
              <div className="showcase-copy">
                <span className="showcase-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="showcase-eyebrow">{item.eyebrow}</span>
                <h3 className="showcase-heading">{item.title}</h3>
                <p className="showcase-desc">{item.desc}</p>
                <ul className="showcase-points">
                  {item.points.map((point) => (
                    <li key={point}>
                      <Check className="size-4" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="showcase-shot">
                <div className="showcase-shot__frame">
                  <span className="showcase-shot__bar" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <div className="showcase-shot__media">
                    {showEmbed
                      ? <EmbedFrame item={item} liveBadge={liveBadge} />
                      : (
                          // 挂载前（延迟挂载期间）显示轻量骨架，而非旧截图占位
                          <div className="showcase-shot__skeleton" aria-hidden>
                            <span className="showcase-shot__spinner" />
                          </div>
                        )}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
