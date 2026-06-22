'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroAction {
  text: string
  link: string
  primary?: boolean
}

interface HomeHeroProps {
  lang: string
  eyebrow: string
  name: string
  text: string
  tagline: string
  actions: HeroAction[]
  scrollHint: string
}

/**
 * 首屏 Hero —— 视差滚动 + 滚动驱动动画。
 *
 * 通过一个轻量的 rAF 循环，把「滚动进度」与「鼠标位置」写入 CSS 自定义属性
 * （--sy / --p / --mx / --my），真正的位移、缩放、淡出都交给 CSS 处理，
 * 既流畅又零依赖。无 JS / reduced-motion 时退化为静态首屏，内容始终可见。
 */
export function HomeHero({ lang, eyebrow, name, text, tagline, actions, scrollHint }: HomeHeroProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el)
      return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return

    // —— 滚动驱动 ——
    let scrollRaf = 0
    const onScroll = () => {
      if (scrollRaf)
        return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        const rect = el.getBoundingClientRect()
        const h = rect.height || 1
        const scrolled = Math.max(-rect.top, 0)
        const progress = Math.min(scrolled / h, 1)
        el.style.setProperty('--sy', scrolled.toFixed(1))
        el.style.setProperty('--p', progress.toFixed(4))
      })
    }

    // —— 鼠标视差（带缓动惯性）——
    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0
    let mouseRaf = 0
    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2
      targetY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const tick = () => {
      curX += (targetX - curX) * 0.05
      curY += (targetY - curY) * 0.05
      el.style.setProperty('--mx', curX.toFixed(4))
      el.style.setProperty('--my', curY.toFixed(4))
      mouseRaf = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    mouseRaf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(scrollRaf)
      cancelAnimationFrame(mouseRaf)
    }
  }, [])

  return (
    <section ref={ref} className="hero-px">
      {/* 视差背景层（不响应指针） */}
      <div className="hero-px__bg" aria-hidden>
        <div className="hero-px__grid" />
        <div className="hero-px__orb hero-px__orb--1" />
        <div className="hero-px__orb hero-px__orb--2" />
        <div className="hero-px__orb hero-px__orb--3" />
        <div className="hero-px__beam" />
      </div>

      {/* 前景内容（随滚动上浮、缩放并淡出） */}
      <div className="hero-px__content">
        <div className="hero-px__logo">
          <img src="/icon.png" alt={name} width={120} height={120} />
        </div>

        <div className="home-hero-eyebrow">
          <Sparkles className="size-3.5" />
          <span>{eyebrow}</span>
        </div>

        <h1 className="hero-px__title">{name}</h1>
        <p className="hero-px__subtitle">{text}</p>
        <p className="hero-px__tagline">{tagline}</p>

        <div className="hero-px__actions">
          {actions.map((action) => {
            const isExternal = action.link.startsWith('http')
            const className = action.primary ? 'btn-primary' : 'btn-ghost'
            if (isExternal) {
              return (
                <a
                  key={action.text}
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {action.text}
                  <ArrowRight className="size-4" />
                </a>
              )
            }
            return (
              <Link key={action.text} href={`/${lang}${action.link}`} className={className}>
                {action.text}
                <ArrowRight className="size-4" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* 滚动提示（随滚动迅速淡出） */}
      <div className="hero-px__cue" aria-hidden>
        <span>{scrollHint}</span>
        <div className="hero-px__mouse">
          <span />
        </div>
      </div>
    </section>
  )
}
