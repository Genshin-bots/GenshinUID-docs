'use client';

import { useEffect, useRef } from 'react';

interface MarqueeProps {
  items: string[];
}

interface MarqueeRowProps {
  items: string[];
  /** 是否反向滚动（第二行用），默认 false */
  reverse?: boolean;
  /** 给到 list 的 React key 用，避免同时出现两个相同 key 的渲染问题 */
  rowKey: string;
  /**
   * 永远滚动：用 rAF 驱动 transform，不受 home-scrolling 暂停、
   * 也不被浏览器对「屏外 CSS 动画」的节流影响。
   */
  alwaysRun?: boolean;
}

/**
 * 单行大字无限滚动。
 * 默认纯 CSS；alwaysRun 时改 rAF，保证展示区标题横幅始终在动。
 */
export function MarqueeRow({
  items,
  reverse,
  rowKey,
  alwaysRun,
}: MarqueeRowProps) {
  const doubled = [...items, ...items];
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alwaysRun) return;
    const el = trackRef.current;
    if (!el) return;

    // 关掉 CSS animation，改由 rAF 接管
    el.style.animation = 'none';

    let x = 0;
    let raf = 0;
    let last = performance.now();
    // 与 CSS 40s / 52s 一圈对齐
    const durationMs = reverse ? 52000 : 40000;

    const tick = (now: number) => {
      const dt = Math.min(64, now - last); // 防切后台后大跳
      last = now;
      const half = el.scrollWidth / 2;
      if (half > 1) {
        const speed = half / durationMs; // px / ms
        x += reverse ? speed * dt : -speed * dt;
        // 归一化到 (-half, 0]
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.animation = '';
      el.style.transform = '';
    };
  }, [alwaysRun, reverse, items]);

  return (
    <div
      className={`marquee__row${reverse ? ' marquee__row--reverse' : ''}${alwaysRun ? ' marquee__row--always' : ''}`}
      aria-hidden
    >
      <div ref={trackRef} className="marquee__track">
        {doubled.map((t, i) => (
          <span key={`${rowKey}-${i}`} className="marquee__item">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * 全宽大字无限滚动条（haoqi 式大胆排版）—— 两行反向滚动。
 */
export function Marquee({ items }: MarqueeProps) {
  return (
    <div className="marquee" aria-hidden>
      <MarqueeRow items={items} rowKey="a" />
      <MarqueeRow items={items} rowKey="b" reverse />
    </div>
  );
}
