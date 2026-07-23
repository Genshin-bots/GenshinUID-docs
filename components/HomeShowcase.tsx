'use client';

import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MarqueeRow } from '@/components/Marquee';

interface ShowcaseItem {
  img?: string;
  alt: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  embedSrc?: string;
}

interface HomeShowcaseProps {
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
  liveBadge?: string;
  marqueeItems?: string[];
}

const LOGICAL_W = 1440;
const LOGICAL_H = 900;
const HEADER = 56;

const HUB_ASSETS = [
  '/hub/index.html',
  '/hub/assets/js/index-CiyVuPib.js',
  '/hub/assets/js/react-vendor-DrPrjvB5.js',
  '/hub/assets/js/ui-vendor-ByQNKk_Z.js',
  '/hub/assets/js/thesvg-icons-v6NyTZFP.js',
  '/hub/assets/js/virtual-1HIzeT1K.js',
  '/hub/assets/index-DokQj0kQ.css',
] as const;

function hubSrc(embedSrc?: string): string {
  if (!embedSrc) return '/hub/index.html?embed=1#/dashboard';
  if (embedSrc.includes('index.html')) return embedSrc;
  const i = embedSrc.indexOf('#');
  const hash = i >= 0 ? embedSrc.slice(i) : `#/${embedSrc}`;
  return `/hub/index.html?embed=1${hash}`;
}

function prefetchHubAssets() {
  if (typeof document === 'undefined') return;
  for (const href of HUB_ASSETS) {
    if (document.head.querySelector(`link[data-hub-warm="${href}"]`)) continue;
    const link = document.createElement('link');
    link.dataset.hubWarm = href;
    if (href.endsWith('.js')) {
      link.rel = 'modulepreload';
      link.crossOrigin = 'anonymous';
    } else if (href.endsWith('.css')) {
      link.rel = 'preload';
      link.as = 'style';
    } else {
      link.rel = 'prefetch';
    }
    link.href = href;
    document.head.appendChild(link);
  }
}

function isHubPainted(iframe: HTMLIFrameElement): boolean {
  try {
    const doc = iframe.contentDocument;
    if (!doc || doc.readyState !== 'complete') return false;
    const root = doc.getElementById('root');
    return Boolean(root && root.childElementCount > 0);
  } catch {
    return false;
  }
}

function sealIframeOverscroll(iframe: HTMLIFrameElement) {
  try {
    const doc = iframe.contentDocument;
    if (!doc?.head || doc.getElementById('gshub-overscroll-seal')) return;
    const style = doc.createElement('style');
    style.id = 'gshub-overscroll-seal';
    style.textContent = `
      html, body { overscroll-behavior: none !important; overscroll-behavior-y: none !important; }
      [data-radix-scroll-area-viewport], [data-slot="scroll-area-viewport"],
      .overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll {
        overscroll-behavior: contain !important; overscroll-behavior-y: contain !important;
      }
    `;
    doc.head.appendChild(style);
    doc.documentElement.style.overscrollBehavior = 'none';
    doc.body?.style.setProperty('overscroll-behavior', 'none');
  } catch {
    // ignore
  }
}

function PanelEmbed({
  src,
  alt,
  liveBadge,
  active,
}: {
  src: string;
  alt: string;
  liveBadge?: string;
  active: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const apply = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (w <= 0 || h <= 0) return;
      // contain 缩放后居中：top-left origin 会在剩余高度上留白 → 视觉偏上
      const scale = Math.min(w / LOGICAL_W, h / LOGICAL_H);
      const ox = (w - LOGICAL_W * scale) / 2;
      const oy = (h - LOGICAL_H * scale) / 2;
      box.style.setProperty('--embed-scale', String(scale));
      box.style.setProperty('--embed-ox', `${ox}px`);
      box.style.setProperty('--embed-oy', `${oy}px`);
    };
    apply();
    // 只在尺寸变化时测，翻页中不额外 setState
    const ro = new ResizeObserver(apply);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // 注意：不在此把 painted 设回 false —— 同实例永不白屏
    const iframe = frameRef.current;
    if (!iframe) return;
    let done = painted;
    const mark = () => {
      if (done) return;
      sealIframeOverscroll(iframe);
      if (!isHubPainted(iframe)) return;
      done = true;
      setPainted(true);
    };
    const onLoad = () => {
      sealIframeOverscroll(iframe);
      window.setTimeout(mark, 30);
      window.setTimeout(mark, 150);
      window.setTimeout(mark, 400);
      window.setTimeout(() => {
        if (!done) {
          done = true;
          setPainted(true);
          sealIframeOverscroll(iframe);
        }
      }, 2000);
    };
    iframe.addEventListener('load', onLoad);
    const poll = window.setInterval(mark, 200);
    const stop = window.setTimeout(() => window.clearInterval(poll), 10000);
    try {
      if (iframe.contentDocument?.readyState === 'complete') onLoad();
    } catch {
      // ignore
    }
    return () => {
      iframe.removeEventListener('load', onLoad);
      window.clearInterval(poll);
      window.clearTimeout(stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- painted 只升不降
  }, [src]);

  // 翻页时暂停 hub 内部动画：直接读 html.home-scrolling，**不**经 React setState
  // （旧 MutationObserver → pageScrolling 会在回顶瞬间重渲 6 个 iframe，主线程尖峰）
  useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) return;
    const post = () => {
      const scrolling =
        document.documentElement.classList.contains('home-scrolling');
      iframe.contentWindow?.postMessage(
        {
          source: 'gshub-docs',
          type: 'embed-visibility',
          visible: painted && active && !scrolling,
        },
        '*',
      );
    };
    post();
    const mo = new MutationObserver(post);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    window.addEventListener('homepager:done', post);
    return () => {
      mo.disconnect();
      window.removeEventListener('homepager:done', post);
    };
  }, [active, painted]);

  return (
    <div
      ref={boxRef}
      className="showcase-panel-embed"
      data-active={active ? 'true' : 'false'}
      data-painted={painted ? 'true' : 'false'}
    >
      <iframe
        ref={frameRef}
        className="showcase-panel-embed__frame"
        src={src}
        title={alt}
        loading="eager"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        tabIndex={active ? 0 : -1}
      />
      {painted && active && (
        <span className="showcase-shot__live">● {liveBadge ?? '实时演示'}</span>
      )}
    </div>
  );
}

/**
 * 可承诺：
 *  - 不白屏：iframe 一旦挂上会话内永不卸载；翻页不用 display:none
 *  - 动画：goto 时 is-in + 错落；翻页中保留 opacity/位移（blur 翻页中关掉防掉帧，停后仍有）
 *  - 卡顿：只能「明显减轻」，无法在「6 个重 SPA + 满 blur + 满帧滚动」上三者同时 100%
 */
export function HomeShowcase({
  title,
  subtitle,
  items,
  liveBadge,
  marqueeItems,
}: HomeShowcaseProps) {
  const rootRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const pendingIdxRef = useRef(0);

  const [activeIdx, setActiveIdx] = useState(0);

  // 全部带 embed 的屏：首页错峰挂上，之后永不卸 —— 这是「不再次白屏」的唯一可靠办法
  const [mounted, setMounted] = useState<Set<number>>(() => {
    const s = new Set<number>();
    if (items[0]?.embedSrc) s.add(0);
    return s;
  });

  activeRef.current = activeIdx;

  useEffect(() => {
    prefetchHubAssets();
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((item, i) => {
      if (!item.embedSrc || i === 0) return;
      // 错峰：避免首屏同时 parse 6 份 SPA
      timers.push(
        setTimeout(
          () => {
            setMounted((prev) => {
              if (prev.has(i)) return prev;
              const next = new Set(prev);
              next.add(i);
              return next;
            });
          },
          400 + i * 450,
        ),
      );
    });
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [items]);

  /** 纯 DOM 入场，与滚动同时开始；禁止 setState */
  const playEnterForScrollY = useCallback((scrollY: number) => {
    const root = rootRef.current;
    if (!root) return;

    // 回顶（Hero）：不要对 showcase 整批 is-in 进出，避免 6 面板同时开 blur 过渡
    if (scrollY < 48) {
      const all = root.querySelectorAll<HTMLElement>(
        '.showcase-panel, .home-showcase__head',
      );
      for (const el of all) el.classList.remove('is-in');
      return;
    }

    const snaps = root.querySelectorAll<HTMLElement>(
      '.showcase-panel.home-snap-point, .home-showcase__head.home-snap-point',
    );
    let best: HTMLElement | null = null;
    let bestDist = Infinity;
    for (const el of snaps) {
      const targetY = Math.max(0, el.offsetTop - HEADER);
      const d = Math.abs(targetY - scrollY);
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    }
    const all = root.querySelectorAll<HTMLElement>(
      '.showcase-panel, .home-showcase__head',
    );
    for (const el of all) {
      if (el !== best) el.classList.remove('is-in');
    }
    if (best && bestDist < 200) {
      if (best.classList.contains('is-in')) {
        best.classList.remove('is-in');
        requestAnimationFrame(() => best?.classList.add('is-in'));
      } else {
        best.classList.add('is-in');
      }
      if (best.classList.contains('showcase-panel')) {
        const idx = Number(best.dataset.index);
        if (!Number.isNaN(idx)) pendingIdxRef.current = idx;
      }
    }
  }, []);

  useEffect(() => {
    const onGoto = (e: Event) => {
      const y = (e as CustomEvent<{ scrollY: number }>).detail?.scrollY;
      if (typeof y === 'number') playEnterForScrollY(y);
    };
    const onDone = () => {
      // 延后一帧再 setActiveIdx，避开卸 home-scrolling 的同一帧
      requestAnimationFrame(() => {
        const idx = pendingIdxRef.current;
        if (idx !== activeRef.current) setActiveIdx(idx);
      });
    };

    window.addEventListener('homepager:goto', onGoto);
    window.addEventListener('homepager:done', onDone);
    return () => {
      window.removeEventListener('homepager:goto', onGoto);
      window.removeEventListener('homepager:done', onDone);
    };
  }, [playEnterForScrollY]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>(
        '.showcase-panel, .home-showcase__head',
      ),
    );
    const io = new IntersectionObserver(
      (entries) => {
        if (document.documentElement.classList.contains('home-scrolling')) {
          return;
        }
        for (const entry of entries) {
          entry.target.classList.toggle('is-in', entry.isIntersecting);
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && el.classList.contains('showcase-panel')) {
            const idx = Number(el.dataset.index);
            if (!Number.isNaN(idx) && idx !== activeRef.current) {
              setActiveIdx(idx);
            }
          }
        }
      },
      { threshold: 0.4, rootMargin: '0px 0px -12% 0px' },
    );
    for (const el of targets) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={rootRef} id="showcase" className="home-showcase">
      <div className="home-showcase__head home-snap-point">
        {marqueeItems && marqueeItems.length > 0 && (
          <div className="home-showcase__marquee">
            <MarqueeRow items={marqueeItems} rowKey="head-top" alwaysRun />
          </div>
        )}
        <div className="home-showcase__head-copy">
          <h2
            className="home-showcase__title showcase-fade"
            style={{ '--stagger': 0 } as CSSProperties}
          >
            {title}
          </h2>
          <p
            className="home-showcase__subtitle showcase-fade"
            style={{ '--stagger': 1 } as CSSProperties}
          >
            {subtitle}
          </p>
        </div>
        {marqueeItems && marqueeItems.length > 0 && (
          <div className="home-showcase__marquee">
            <MarqueeRow
              items={marqueeItems}
              rowKey="head-bottom"
              reverse
              alwaysRun
            />
          </div>
        )}
      </div>

      <div className="home-showcase__list">
        {items.map((item, i) => {
          const show = Boolean(item.embedSrc) && mounted.has(i);
          return (
            <article
              key={item.alt + i}
              className="showcase-panel home-snap-point"
              data-index={i}
              data-side={i % 2 === 0 ? 'left' : 'right'}
              data-active={activeIdx === i ? 'true' : 'false'}
            >
              <div className="showcase-copy">
                <span
                  className="showcase-index showcase-fade"
                  style={{ '--stagger': 0 } as CSSProperties}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="showcase-eyebrow showcase-fade"
                  style={{ '--stagger': 1 } as CSSProperties}
                >
                  {item.eyebrow}
                </span>
                <h3
                  className="showcase-heading showcase-fade"
                  style={{ '--stagger': 2 } as CSSProperties}
                >
                  {item.title}
                </h3>
                <p
                  className="showcase-desc showcase-fade"
                  style={{ '--stagger': 3 } as CSSProperties}
                >
                  {item.desc}
                </p>
                <ul className="showcase-points">
                  {item.points.map((point, pi) => (
                    <li
                      key={point}
                      className="showcase-fade"
                      style={{ '--stagger': 4 + pi } as CSSProperties}
                    >
                      <Check className="size-4" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="showcase-shot showcase-fade"
                style={{ '--stagger': 2 } as CSSProperties}
              >
                <div className="showcase-shot__frame">
                  <span className="showcase-shot__bar" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <div className="showcase-shot__media">
                    {show ? (
                      <PanelEmbed
                        src={hubSrc(item.embedSrc)}
                        alt={item.alt}
                        liveBadge={liveBadge}
                        active={activeIdx === i}
                      />
                    ) : (
                      <div className="showcase-shot__placeholder" aria-hidden />
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
