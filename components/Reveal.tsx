'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** 进入视口后的延迟（毫秒），用于做 stagger 错落动画 */
  delay?: number
  /** 额外 class，会与 .reveal 合并 */
  className?: string
}

/**
 * 滚动驱动的「进入/离开视口淡入上浮」包裹层。
 * 用 IntersectionObserver 实现，全浏览器可用。
 *
 * 双向触发：
 *  - 进入视口 → 加 .reveal--in（CSS 过渡把 opacity 0→1、translateY 32→0、blur 8→0）
 *  - 离开视口 → 移除 .reveal--in（同一组过渡反向播放，元素再次模糊下沉淡出）
 * 这样滚回页面也能看到一致的「离场」动效，不会出现「来回滚效果消失」。
 *
 * 动效始终开启——应需求不因 prefers-reduced-motion / 省电模式而关闭。
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el)
      return

    const io = new IntersectionObserver(
      ([entry]) => {
        // 双向：进入加类、离开去类。CSS 过渡同一组，进退都丝滑。
        el.classList.toggle('reveal--in', entry.isIntersecting)
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
