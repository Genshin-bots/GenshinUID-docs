'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * PPT 硬翻页 — 滚动路径零杂活：
 *  - 动画循环内只 scrollTo，不读 layout、不触发 React。
 *  - 页顶坐标在起步时缓存；resize 才失效。
 *  - home-scrolling 让全站在 CSS 层卸掉 blur / iframe / IO 监听。
 *  - 离开首屏后右下角「回到顶部」走同一套 animateScrollTo。
 */
export function HomePager({
  backToTopLabel = '回到顶部',
}: {
  backToTopLabel?: string;
}) {
  const [showBackTop, setShowBackTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const goTopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ANIM_MS_BASE = 520;
    const ANIM_MS_MAX = 900;
    const WHEEL_THRESHOLD = 10;
    const TOUCH_THRESHOLD = 40;
    const HEADER = 56;

    let isAnimating = false;
    let animId = 0;
    let settleGen = 0;

    // 缓存 snap 几何，避免每次 wheel 都 query + offsetTop
    let cache: { tops: number[]; bottoms: number[]; count: number } | null =
      null;

    const invalidate = () => {
      cache = null;
    };

    const snapshotPages = () => {
      if (cache) return cache;
      const nodes = document.querySelectorAll<HTMLElement>('.home-snap-point');
      const tops: number[] = [];
      const bottoms: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        const top = el.offsetTop;
        tops.push(top);
        bottoms.push(top + el.offsetHeight);
      }
      cache = { tops, bottoms, count: tops.length };
      return cache;
    };

    const setScrollingClass = (on: boolean) => {
      document.documentElement.classList.toggle('home-scrolling', on);
    };

    const setAnimating = (v: boolean) => {
      if (isAnimating === v) return;
      isAnimating = v;
      if (v) {
        settleGen += 1; // 作废进行中的 settle
        setScrollingClass(true);
      }
      // 关闭时不在这里卸 class——见 finishScroll，延后避免与落点同帧重绘
    };

    const ease = (t: number) => 1 - (1 - t) ** 4;

    /** 滚动到位后：先稳住像素，再卸 home-scrolling + 发 done，错开主线程尖峰 */
    const finishScroll = (end: number) => {
      animId = 0;
      document.documentElement.scrollTop = end;
      document.body.scrollTop = end;
      const gen = ++settleGen;
      // 双 rAF：等浏览器画完落点帧，再卸 class / 发事件
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (gen !== settleGen) return;
          isAnimating = false;
          setScrollingClass(false);
          window.dispatchEvent(new CustomEvent('homepager:done'));
        });
      });
    };

    const animateScrollTo = (target: number) => {
      if (animId) cancelAnimationFrame(animId);
      settleGen += 1;
      const start = window.scrollY || document.documentElement.scrollTop;
      const end = Math.round(Math.max(0, target));
      const delta = end - start;
      if (Math.abs(delta) < 1) {
        isAnimating = false;
        setScrollingClass(false);
        return;
      }

      // 远距（回顶）略拉长，降低末段速度 + 给浏览器合成时间
      const dist = Math.abs(delta);
      const viewH = Math.max(1, window.innerHeight);
      const animMs = Math.min(
        ANIM_MS_MAX,
        Math.round(ANIM_MS_BASE + (dist / viewH) * 120),
      );

      setAnimating(true);
      window.dispatchEvent(
        new CustomEvent('homepager:goto', { detail: { scrollY: end } }),
      );

      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / animMs);
        const y = Math.round(start + delta * ease(p));
        document.documentElement.scrollTop = y;
        document.body.scrollTop = y;
        if (p < 1) {
          animId = requestAnimationFrame(step);
        } else {
          finishScroll(end);
        }
      };
      animId = requestAnimationFrame(step);
    };

    const contentViewH = () => window.innerHeight - HEADER;

    const currentIndex = (tops: number[]) => {
      const probe =
        (window.scrollY || document.documentElement.scrollTop) +
        HEADER +
        contentViewH() * 0.5;
      let idx = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] <= probe) idx = i;
        else break;
      }
      return idx;
    };

    const goToPage = (pageTop: number) => {
      animateScrollTo(Math.max(0, pageTop - HEADER));
    };

    // 回顶：可打断进行中的翻页动画
    goTopRef.current = () => {
      const { tops } = snapshotPages();
      if (tops.length) goToPage(tops[0]);
      else animateScrollTo(0);
    };

    /** 离开首屏即显示回顶钮；动画中不 setState，结束再更新 */
    const updateBackTop = () => {
      if (isAnimating) return;
      const y = window.scrollY || document.documentElement.scrollTop;
      const { tops } = snapshotPages();
      const idx = tops.length ? currentIndex(tops) : 0;
      const pastHero = idx >= 1 || y > Math.min(120, contentViewH() * 0.35);
      setShowBackTop((prev) => (prev === pastHero ? prev : pastHero));
    };

    const step = (direction: 1 | -1) => {
      if (isAnimating) return;
      const { tops, bottoms, count } = snapshotPages();
      if (!count) return;

      const idx = currentIndex(tops);
      const pageTop = tops[idx];
      const pageBottom = bottoms[idx];
      const pageH = pageBottom - pageTop;
      const viewH = contentViewH();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const alignedTop = Math.max(0, pageTop - HEADER);
      const isTallPage = pageH > viewH + 48;

      if (isTallPage) {
        if (direction === 1) {
          const visibleBottom = scrollY + window.innerHeight;
          if (pageBottom - visibleBottom > 12) {
            animateScrollTo(
              Math.min(pageBottom - viewH - HEADER, scrollY + viewH * 0.9),
            );
            return;
          }
        } else if (scrollY - alignedTop > 12) {
          goToPage(pageTop);
          return;
        }
      } else if (direction === -1 && Math.abs(scrollY - alignedTop) > 4) {
        goToPage(pageTop);
        return;
      }

      const next = idx + direction;
      if (next < 0 || next > count - 1) return;
      goToPage(tops[next]);
    };

    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
        return true;
      if (target.isContentEditable) return true;
      if (
        target.closest(
          '[data-search-dialog], [role="dialog"], .fd-search-dialog, .marquee, iframe, .showcase-panel-embed, .showcase-shot__media, .showcase-shot__frame, .home-back-top',
        )
      )
        return true;
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (isInteractiveTarget(e.target)) return;
      if (isAnimating) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      e.preventDefault();
      step(e.deltaY > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isInteractiveTarget(e.target)) return;
      if (isAnimating) {
        e.preventDefault();
        return;
      }
      switch (e.key) {
        case 'PageDown':
        case 'ArrowDown':
          e.preventDefault();
          step(1);
          break;
        case 'PageUp':
        case 'ArrowUp':
          e.preventDefault();
          step(-1);
          break;
        case ' ':
          e.preventDefault();
          step(e.shiftKey ? -1 : 1);
          break;
        case 'Home': {
          e.preventDefault();
          const { tops } = snapshotPages();
          if (tops.length) goToPage(tops[0]);
          break;
        }
        case 'End': {
          e.preventDefault();
          const { tops } = snapshotPages();
          if (tops.length) goToPage(tops[tops.length - 1]);
          break;
        }
      }
    };

    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (isInteractiveTarget(e.target)) return;
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY == null || isAnimating) return;
      const endY = e.changedTouches[0]?.clientY ?? null;
      if (endY == null) return;
      const delta = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;
      step(delta > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });
    window.addEventListener('scroll', updateBackTop, { passive: true });
    window.addEventListener('homepager:done', updateBackTop);
    window.addEventListener('homepager:goto', updateBackTop);
    updateBackTop();

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('scroll', updateBackTop);
      window.removeEventListener('homepager:done', updateBackTop);
      window.removeEventListener('homepager:goto', updateBackTop);
      if (animId) cancelAnimationFrame(animId);
      settleGen += 1;
      document.documentElement.classList.remove('home-scrolling');
      goTopRef.current = null;
    };
  }, []);

  // portal 到 body：避免 HomeLayout / 玻璃层 transform 把 fixed 锚到错误容器
  // （曾表现为 right 写了仍贴在「布局盒」左下）
  if (!mounted) return null;

  return createPortal(
    <button
      type="button"
      className={`home-back-top${showBackTop ? ' is-visible' : ''}`}
      aria-label={backToTopLabel}
      title={backToTopLabel}
      tabIndex={showBackTop ? 0 : -1}
      aria-hidden={!showBackTop}
      onClick={() => goTopRef.current?.()}
    >
      <ChevronUp className="home-back-top__icon" aria-hidden />
      <span className="home-back-top__label">{backToTopLabel}</span>
    </button>,
    document.body,
  );
}
