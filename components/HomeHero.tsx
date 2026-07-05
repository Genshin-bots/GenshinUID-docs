'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface HeroAction {
  text: string;
  link: string;
  primary?: boolean;
}

interface HomeHeroProps {
  lang: string;
  eyebrow: string;
  name: string;
  text: string;
  tagline: string;
  actions: HeroAction[];
  scrollHint: string;
}

/**
 * 首屏 Hero —— PPT 式首页的「第一页」。
 *
 * 之前实现：onScroll rAF 把 --sy / --p 写入 CSS，content 随滚动上浮缩放淡出。
 * 问题：和无极滚动 + 滚动驱动 transform 叠加会引发超大截图区域的合成层抖动，
 *        而且与「逐页 snap」的目标相违背。
 * 现在：取消滚动驱动的 rAF；只保留鼠标视差的 rAF（缓动跟随光标，纯位移，绝不
 *        触碰 filter / 大面积重绘），让 Hero 在被 snap 锁住时表现稳定。
 *        「随滚动淡出」改为由 scroll-snap 自然过渡——离开视口就交给下一页接管。
 *
 * 鼠标视差始终开启（不因 prefers-reduced-motion 关闭）。
 */
export function HomeHero({
  lang,
  eyebrow,
  name,
  text,
  tagline,
  actions,
  scrollHint,
}: HomeHeroProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // —— 鼠标视差（带缓动惯性）——
    // 只写 --mx / --my，纯 transform 走 GPU 合成层，不触发 layout/paint，
    // 配合 scroll-snap 也只是静止时仍在做 5% lerp 的轻量位移。
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let mouseRaf = 0;
    /** 翻页期间（html 上挂 `.home-scrolling`）停止 rAF 与写 CSS 变量——
     *  滚轮事件在防跳过的 700ms lock 里每帧都在争主线程，再叠一个 60fps 的视差 rAF
     *  会让 wheel → scrollTo 之间的帧率掉到肉眼可感的卡顿。停下后若鼠标已移动，下次 tick 自动恢复。 */
    let isPaused = false;
    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      if (document.documentElement.classList.contains('home-scrolling')) {
        isPaused = true;
        mouseRaf = requestAnimationFrame(tick);
        return;
      }
      // 从暂停中恢复：把当前位置直接跳到目标，避免 lerp 从 0 平滑过渡产生「跳回原位」的违和感
      if (isPaused) {
        isPaused = false;
        curX = targetX;
        curY = targetY;
      } else {
        curX += (targetX - curX) * 0.05;
        curY += (targetY - curY) * 0.05;
      }
      el.style.setProperty('--mx', curX.toFixed(4));
      el.style.setProperty('--my', curY.toFixed(4));
      mouseRaf = requestAnimationFrame(tick);
    };

    mouseRaf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(mouseRaf);
    };
  }, []);

  return (
    <section ref={ref} className="hero-px home-snap-point">
      {/* 视差背景层（不响应指针） */}
      <div className="hero-px__bg" aria-hidden>
        {/* 动漫眼睛层：eyes.png 作主体，mask-image 软化边缘让原 orbs 在四周自然显出。
           （此前叠加的「眼睑」div + @keyframes heroBlink 眨眼效果与 PNG 不搭，已移除。） */}
        <div className="hero-px__eyes">
          <img src="/home/eyes.png" alt="" className="hero-px__eyes-img" />
        </div>
        <div className="hero-px__grid" />
        <div className="hero-px__orb hero-px__orb--1" />
        <div className="hero-px__orb hero-px__orb--2" />
        <div className="hero-px__orb hero-px__orb--3" />
        <div className="hero-px__beam" />
        {/* 内容可读性遮罩：content 区域轻微压暗，让 logo / 标题 / 按钮在人脸上仍可读 */}
        <div className="hero-px__scrim" />
      </div>

      {/* 前景内容（静态居中，snap 期间不再随滚动变形，避免与对齐动画打架） */}
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
            const isExternal = action.link.startsWith('http');
            const className = action.primary ? 'btn-primary' : 'btn-ghost';
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
              );
            }
            return (
              <Link
                key={action.text}
                href={`/${lang}${action.link}`}
                className={className}
              >
                {action.text}
                <ArrowRight className="size-4" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 滚动提示 */}
      <div className="hero-px__cue" aria-hidden>
        <span>{scrollHint}</span>
        <div className="hero-px__mouse">
          <span />
        </div>
      </div>
    </section>
  );
}
