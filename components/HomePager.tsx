'use client';

import { useEffect } from 'react';

/**
 * 首页 PPT 式硬翻页控制器 —— 接管 wheel / keydown / touchmove，
 * 「鼠标一滚 = 切下一页」，不再依赖 CSS scroll-snap 的「吸附式无极滚动」。
 *
 * 设计要点：
 *  - 只在 <html> 上含 `.home-page` 的语义 main 渲染时挂载（由 HomePage 包一层）。
 *  - 通过 `.home-snap-point` 选择器枚举页面里的「页」，按 DOM 顺序作为页序列。
 *  - wheel：preventDefault，以「方向」翻一页；翻页期间 lock（默认 700ms），
 *    避免高灵敏滚轮 / 触摸板惯性把页跳过两屏。
 *  - 键盘：PageDown/PageUp/Space/Arrow 也走同一路径。
 *  - 触屏：单指竖向 swipe，向上滑 = 下一页。
 *  - 任何输入框 / 文本可编辑区聚焦时禁用，避免与表单滚动冲突。
 *
 * 注意：原 CSS 里的 scroll-snap 已删除（见 global.css），否则浏览器原生 snap
 *       会与我们的 scrollTo 抢主，出现「跳一下又被拉回」的诡异回弹。
 */
export function HomePager() {
  useEffect(() => {
    const ANIM_MS = 700;
    const WHEEL_THRESHOLD = 12;
    const TOUCH_THRESHOLD = 40;
    const SCROLL_PADDING_TOP = 56;

    // 自实现 rAF 缓动取代原生 scrollTo({behavior:'smooth'})——
    // 原因：Chrome/Edge 原生 smooth 时长不可控（与距离非线性，400–800ms 波动），
    // 与我们 700ms 的翻页节奏 / 1000ms showcase-panel 入场动画错拍 → 上滚回 Hero
    // 出现「啪一下跳回」的违和感。改用统一时长 + 与入场过渡同款 cubic-bezier
    // (0.16,1,0.3,1) 缓动后，翻页节奏与入场曲线同源，每一帧都受控。
    let isAnimating = false;
    let animId = 0;
    // 翻页期间给 <html> 打标记：CSS 据此临时关掉固定顶栏的 backdrop-filter
    // （大面积 blur 每帧重算是滚动卡顿主因之一），停下即恢复磨砂玻璃。
    const setAnimating = (v: boolean) => {
      isAnimating = v;
      document.documentElement.classList.toggle('home-scrolling', v);
    };
    // cubic-bezier(0.16, 1, 0.3, 1) 的近似实现：先用 ease-out 强减速曲线
    // y = 1 - (1 - t)^4 极好地近似该 bezier，且无需 newton 迭代，cheap。
    const ease = (t: number) => 1 - (1 - t) ** 4;
    const animateScrollTo = (target: number) => {
      if (animId) cancelAnimationFrame(animId);
      const start = window.scrollY;
      const delta = target - start;
      if (Math.abs(delta) < 1) {
        setAnimating(false);
        return;
      }
      const t0 = performance.now();
      setAnimating(true);
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ANIM_MS);
        window.scrollTo(0, start + delta * ease(p));
        if (p < 1) {
          animId = requestAnimationFrame(step);
        } else {
          animId = 0;
          setAnimating(false);
        }
      };
      animId = requestAnimationFrame(step);
    };

    const getPages = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.home-snap-point'));

    const currentIndex = (pages: HTMLElement[]) => {
      const probe = window.scrollY + SCROLL_PADDING_TOP + 4;
      let idx = 0;
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].offsetTop <= probe) idx = i;
        else break;
      }
      return idx;
    };

    const goTo = (idx: number) => {
      const pages = getPages();
      if (!pages.length) return;
      const clamped = Math.max(0, Math.min(pages.length - 1, idx));
      const target = pages[clamped];
      const top = Math.max(0, target.offsetTop - SCROLL_PADDING_TOP);
      animateScrollTo(top);
    };

    const step = (direction: 1 | -1) => {
      if (isAnimating) return;
      const pages = getPages();
      if (!pages.length) return;
      const idx = currentIndex(pages);
      const page = pages[idx];
      const viewport = window.innerHeight;
      const pageTop = page.offsetTop;
      const pageBottom = pageTop + page.offsetHeight;
      const scrollY = window.scrollY;

      // 当前「页」本身高于视口时，先在页内部继续滚动，到达边界后再切页。
      // 这样长内容（如 community section）不会被硬翻页跳过。
      if (direction === 1) {
        const visibleBottom = scrollY + viewport;
        if (pageBottom - visibleBottom > 8) {
          animateScrollTo(
            Math.min(pageBottom - viewport, scrollY + viewport * 0.85),
          );
          return;
        }
      } else {
        if (scrollY - (pageTop - SCROLL_PADDING_TOP) > 8) {
          goTo(idx);
          return;
        }
      }

      const next = idx + direction;
      if (next < 0 || next > pages.length - 1) return;
      goTo(next);
    };

    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
        return true;
      if (target.isContentEditable) return true;
      // 允许搜索弹窗 / 折叠面板内的滚动行为
      if (
        target.closest(
          '[data-search-dialog], [role="dialog"], .fd-search-dialog, .marquee',
        )
      )
        return true;
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (isInteractiveTarget(e.target)) return;
      const dy = e.deltaY;
      if (Math.abs(dy) < WHEEL_THRESHOLD) return;
      e.preventDefault();
      step(dy > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (isInteractiveTarget(e.target)) return;
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
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(getPages().length - 1);
          break;
      }
    };

    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (isInteractiveTarget(e.target)) return;
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY == null) return;
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

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      if (animId) cancelAnimationFrame(animId);
      document.documentElement.classList.remove('home-scrolling');
    };
  }, []);

  return null;
}
