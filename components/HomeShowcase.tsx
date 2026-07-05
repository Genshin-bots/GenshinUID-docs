'use client';

import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { MarqueeRow } from '@/components/Marquee';

interface ShowcaseItem {
  img: string;
  alt: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  /** 实时演示深链（hub Demo 对应页）。有值时该面板默认内嵌实时 iframe。 */
  embedSrc?: string;
}

interface HomeShowcaseProps {
  title: string;
  subtitle: string;
  items: ShowcaseItem[];
  /** 内嵌后右下角徽章文案（i18n，缺省中文）。 */
  liveBadge?: string;
  /** 标题页上下两侧滚动展示的「平台 / Bot」大字 token 列表 */
  marqueeItems?: string[];
}

/** 内嵌「桌面站缩略图」的两个关键参数：
 *  - TARGET_SCALE：iframe 在面板里的**固定**显示比例。固定比例（而非固定逻辑宽度）能让内嵌
 *    控制台在任何视口宽度下都呈现**一致的、足够小**的尺寸——逻辑视口随容器宽度反推
 *    （logicalW = 容器宽 / TARGET_SCALE），宽屏上 hub 渲染得更宽、元素相对更小，避免
 *    「在宽屏上几乎 1:1、UI 过大压缩空间」（修用户反馈「缩放还是太大」）。
 *  - RATIO：逻辑视口宽高比，必须与 .showcase-shot__media 的 aspect-ratio 一致（16:10）。 */
const TARGET_SCALE = 0.75;
const RATIO = 1.6;
/** 逻辑视口宽度的钳制区间：
 *  - 下限 MIN：容器窄时（小屏/窄列）若按比例反推出 <768 的逻辑宽，hub 会切到移动布局、侧边栏收起。
 *    钳到 MIN 后改用 scale=容器宽/MIN（比 TARGET 略小）→ 始终保住桌面布局 + 侧边栏。
 *  - 上限 MAX：超宽屏避免反推出巨大 iframe（合成层显存随面积线性增长），钳到 MAX → scale 略大。 */
const MIN_LOGICAL_W = 1100;
const MAX_LOGICAL_W = 2400;
/** 滚入视口后延迟挂载 iframe 的毫秒数：盖过 HomePager 的 700ms 翻页动画，
 *  让 ~3.3MB 的重型 SPA 在**滚动停下后**才加载，不在翻页途中阻塞主线程（修「滚动卡顿」）。
 *  若用户在延迟内又翻走，挂载会被取消——快速划过的页面根本不加载。 */
const MOUNT_DELAY_MS = 500;
/** 离屏后延迟卸载 iframe 的毫秒数：只保留视口附近(当前±1)的重型 SPA 处于挂载态，
 *  远处面板卸载以省下合成层显存与后台动画开销（修「滚动卡顿」）。延迟够久以免
 *  「划过又划回」时刚卸载又重挂载造成抖动；资源已被浏览器缓存，重挂载很快。 */
const UNMOUNT_DELAY_MS = 1200;

/**
 * 单个内嵌面板：把 hub Demo 以「容器宽 / 固定比例」反推的逻辑尺寸渲染，再等比缩放进缩略框。
 *  - ResizeObserver 实时测量容器宽度，反推逻辑视口宽高写入 iframe（缩放比例固定 = TARGET_SCALE）。
 *  - iframe 加载完成前显示截图 poster 作为占位，加载完淡出。
 */
function EmbedFrame({
  item,
  liveBadge,
  active,
}: {
  item: ShowcaseItem;
  liveBadge?: string;
  /** 面板当前是否在视口内。离屏时通知 iframe 暂停其内部动画（见下方 postMessage）。 */
  active: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  // 把「是否在视口」同步给 iframe：hub(demo) 据此暂停离屏面板的 CSS 动画 / 力导图，
  // 避免离屏 SPA 的动画抢主线程拖累在屏面板的滚动。loaded 变化时也补发一次，确保初值同步。
  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { source: 'gshub-docs', type: 'embed-visibility', visible: active },
      '*',
    );
  }, [active, loaded]);

  // 强制每次挂载都从「干净的初始状态」启动：
  //   · 主页内嵌的 6 个 iframe 都同源（/hub/...），正常情况下会共享 localStorage /
  //     sessionStorage，用户上一次手动改的皮肤/主题等会被持久化并跨刷新「阴魂不散」。
  //     这里在 iframe onLoad 后主动 clear 掉它的 storage（same-origin 允许
  //     iframe.contentWindow.localStorage 直接访问），让访客看到的永远是 demo 的
  //     默认配置 + Mock 提供的网络数据，不会被旧的本地状态污染。
  //   · **不要在 src 上拼 `_=<nonce>`**：那样会让 iframe 的 URL 与 embedSrc 不一致，
  //     6 个 iframe 的「面板挂载节奏」也是 IntersectionObserver 触发卸载/重挂，每次
  //     panel 重挂时 URL 里再加不同 nonce 会把同一 iframe 反复销毁重建，反而会触发
  //     主页的「demo SPA 重启」、「hash 路由被视作新 URL」等意外（曾导致首次进入
  //     6 个面板全显 hub 的 NotFound 页 —— 404 / Oops! Page not found）。
  //   · 真正复位 iframe 状态靠 HomeShowcase 自己 IntersectionObserver 的
  //     mounted/unmounted 调度：滚出视口 1.2s 后卸掉，再次滚回会重新挂载、重新
  //     触发 onLoad → 清 storage → 自然落到 Mock 的默认配置上。
  // docs 自身不使用 localStorage / sessionStorage，所以从父页面 clear 与
  // iframe 是同一份 storage 也不会误伤其它功能。
  const handleIframeLoad = () => {
    setLoaded(true);
    try {
      const win = frameRef.current?.contentWindow;
      if (!win) return;
      win.localStorage?.clear();
      win.sessionStorage?.clear();
    } catch {
      // ignore — 同源策略等异常情况，放弃 reset，不影响主流程
    }
  };

  // 逻辑视口尺寸：随容器宽度反推（保持 TARGET_SCALE 固定显示比例）
  const [dims, setDims] = useState({ w: 1600, h: Math.round(1600 / RATIO) });

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const apply = () => {
      const boxW = box.clientWidth;
      if (boxW <= 0) return;
      // 先按目标比例反推逻辑宽，再钳到 [MIN, MAX]；钳制时用实际 scale=容器宽/逻辑宽 保证铺满。
      let logicalW = Math.round(boxW / TARGET_SCALE);
      logicalW = Math.max(MIN_LOGICAL_W, Math.min(MAX_LOGICAL_W, logicalW));
      const scale = boxW / logicalW;
      setDims({ w: logicalW, h: Math.round(logicalW / RATIO) });
      box.style.setProperty('--embed-scale', String(scale));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

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
        ref={frameRef}
        className="showcase-embed__frame"
        style={{ width: dims.w, height: dims.h }}
        src={item.embedSrc}
        title={item.alt}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={handleIframeLoad}
      />
      <span className="showcase-shot__live">● {liveBadge ?? '实时演示'}</span>
    </div>
  );
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
export function HomeShowcase({
  title,
  subtitle,
  items,
  liveBadge,
  marqueeItems,
}: HomeShowcaseProps) {
  const rootRef = useRef<HTMLElement>(null);
  // 已挂载实时 iframe 的面板下标。一旦加入不再移除（保持挂载，避免来回滚动重载）。
  // 但挂载本身是**延迟**的：滚停后才加载，快速划过的面板不会触发加载（见下方 timers）。
  const [mounted, setMounted] = useState<Set<number>>(() => new Set());
  // 当前在视口内的面板下标集合：驱动「向 iframe 通报可见性」（离屏暂停其内部动画）。
  const [visible, setVisible] = useState<Set<number>>(() => new Set());
  // 每个面板「待挂载」/「待卸载」的延迟计时器；翻页途中互相取消，避免抖动。
  const mountTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const unmountTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  // 用 ref 镜像 mounted，供 observer 回调内读取最新值（不必把 mounted 放进依赖重建 observer）。
  const mountedRef = useRef(mounted);
  mountedRef.current = mounted;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('.showcase-panel'),
    );
    const mountTimers = mountTimersRef.current;
    const unmountTimers = unmountTimersRef.current;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.index);
          const inView = entry.isIntersecting;
          // 入场/离场动效（立即响应，不受挂载延迟影响）
          entry.target.classList.toggle('is-in', inView);

          // 同步可见性集合 → EmbedFrame 据此 postMessage 给 iframe 暂停/恢复动画
          setVisible((prev) => {
            if (prev.has(idx) === inView) return prev;
            const next = new Set(prev);
            if (inView) next.add(idx);
            else next.delete(idx);
            return next;
          });

          if (inView) {
            // 进入视口：取消待卸载，并延迟挂载（盖过 700ms 翻页动画，避免加载阻塞主线程）。
            const pendingUnmount = unmountTimers.get(idx);
            if (pendingUnmount) {
              clearTimeout(pendingUnmount);
              unmountTimers.delete(idx);
            }
            if (!mountedRef.current.has(idx) && !mountTimers.has(idx)) {
              const id = setTimeout(() => {
                mountTimers.delete(idx);
                setMounted((prev) => {
                  if (prev.has(idx)) return prev;
                  const next = new Set(prev);
                  next.add(idx);
                  return next;
                });
              }, MOUNT_DELAY_MS);
              mountTimers.set(idx, id);
            }
          } else {
            // 离开视口：取消待挂载；已挂载的则延迟卸载，只保留视口附近的重型 iframe。
            const pendingMount = mountTimers.get(idx);
            if (pendingMount) {
              clearTimeout(pendingMount);
              mountTimers.delete(idx);
            }
            if (mountedRef.current.has(idx) && !unmountTimers.has(idx)) {
              const id = setTimeout(() => {
                unmountTimers.delete(idx);
                setMounted((prev) => {
                  if (!prev.has(idx)) return prev;
                  const next = new Set(prev);
                  next.delete(idx);
                  return next;
                });
              }, UNMOUNT_DELAY_MS);
              unmountTimers.set(idx, id);
            }
          }
        }
      },
      // 提前一点（视口下方 25%）开始计时，让滚停后尽快就绪
      { threshold: 0.2, rootMargin: '0px 0px 25% 0px' },
    );
    for (const panel of panels) io.observe(panel);

    return () => {
      io.disconnect();
      for (const id of mountTimers.values()) clearTimeout(id);
      for (const id of unmountTimers.values()) clearTimeout(id);
      mountTimers.clear();
      unmountTimers.clear();
    };
  }, []);

  return (
    <section ref={rootRef} id="showcase" className="home-showcase">
      {/* 「强大，且易于上手」标题页 —— 单独作为 PPT 一页，让 HomePager 滚到此处时
         真的停一屏。`.home-snap-point` 由父级 HomePager 用作「页」选择器
         （见 components/HomePager.tsx）。把原来放在 Hero 与 Showcase 之间的
         大字滚动条（QQ / Discord / Telegram …）拆成两行嵌入到标题上下，
         既保住了「多平台支持」的视觉传达，又让翻页节奏里「标题页」真正成一页。 */}
      <div className="home-showcase__head home-snap-point">
        {marqueeItems && marqueeItems.length > 0 && (
          <div className="home-showcase__marquee">
            <MarqueeRow items={marqueeItems} rowKey="head-top" />
          </div>
        )}
        <div className="home-showcase__head-copy">
          <h2 className="home-showcase__title">{title}</h2>
          <p className="home-showcase__subtitle">{subtitle}</p>
        </div>
        {marqueeItems && marqueeItems.length > 0 && (
          <div className="home-showcase__marquee">
            <MarqueeRow items={marqueeItems} rowKey="head-bottom" reverse />
          </div>
        )}
      </div>

      <div className="home-showcase__list">
        {items.map((item, i) => {
          const showEmbed = Boolean(item.embedSrc) && mounted.has(i);
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
                    {showEmbed ? (
                      <EmbedFrame
                        item={item}
                        liveBadge={liveBadge}
                        active={visible.has(i)}
                      />
                    ) : (
                      // 挂载前（延迟挂载期间）显示轻量骨架，而非旧截图占位
                      <div className="showcase-shot__skeleton" aria-hidden>
                        <span className="showcase-shot__spinner" />
                      </div>
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
