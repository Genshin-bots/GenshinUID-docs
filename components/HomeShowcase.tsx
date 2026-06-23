'use client'

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

interface ShowcaseItem {
  img: string
  alt: string
  eyebrow: string
  title: string
  desc: string
  points: string[]
}

interface HomeShowcaseProps {
  title: string
  subtitle: string
  items: ShowcaseItem[]
}

/**
 * 主页「框架运行效果」展示区——左右交错的超大截图面板，PPT 式逐屏呈现。
 *
 * 设计原则：
 *  - 取消之前「每帧 rAF 写 --p 做持续视差」的逻辑。
 *    旧实现里 onScroll → rAF → setProperty 在超大截图上每帧重排，再加上
 *    panel 上 1s 的 transform 过渡、translateY(--p) 与 will-change 抢占合成层，
 *    三者叠加就是用户看到的「图片抽搐抖动」。
 *  - 现在只剩一条「进入/离开视口」动效：IntersectionObserver 双向触发 .is-in，
 *    CSS 过渡（opacity + transform + filter）由浏览器 GPU 一次成像，
 *    进入时模糊淡入上浮、离开时反之；来回滚动效果不丢失。
 *  - 配合全局的 scroll-snap-proximity，每个面板天然变成一个 PPT 页。
 *
 * 动效始终开启——应需求不因 prefers-reduced-motion / 省电模式而关闭（与 Hero / 标题
 * 一致）。无 JS 时由 CSS 兜底（见下方说明）保证内容可见。
 */
export function HomeShowcase({ title, subtitle, items }: HomeShowcaseProps) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root)
      return

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('.showcase-panel'),
    )

    // 双向「模糊入场/离场」：进入视口加 .is-in，离开则移除。
    // CSS 用同一组过渡，进退对称 → 滚回去也能看到对应的退场动效。
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-in', entry.isIntersecting)
        }
      },
      // 面板进入视口约 1/4、且越过底部 12% 时触发 → 逐屏「一页一页」依次亮起
      { threshold: 0.25, rootMargin: '0px 0px -12% 0px' },
    )
    for (const panel of panels)
      io.observe(panel)

    return () => {
      io.disconnect()
    }
  }, [])

  return (
    <section ref={rootRef} id="showcase" className="home-showcase">
      <div className="home-showcase__head">
        <h2 className="home-showcase__title">{title}</h2>
        <p className="home-showcase__subtitle">{subtitle}</p>
      </div>

      <div className="home-showcase__list">
        {items.map((item, i) => (
          <article
            key={item.img}
            className="showcase-panel home-snap-point"
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
                  <img
                    src={item.img}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
