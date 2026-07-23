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
 * 现在：取消滚动驱动的 rAF；只保留鼠标视差的 rAF（缓动跟随光标，纯位移）。
 * 翻页（home-scrolling）期间仍持续更新 --mx/--my，避免回顶时背景「卡一下再跟手」。
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

    // —— 鼠标视差 ——
    // mousemove 同步推进一段 + rAF 补帧；回顶主线程尖峰时仍能在下次移动立刻跟手，
    // 不依赖「动画结束后 rAF 才恢复」的一帧空窗。
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let mouseRaf = 0;
    let lastMx = '';
    let lastMy = '';
    let running = true;

    const write = () => {
      const mx = curX.toFixed(4);
      const my = curY.toFixed(4);
      if (mx !== lastMx) {
        lastMx = mx;
        el.style.setProperty('--mx', mx);
      }
      if (my !== lastMy) {
        lastMy = my;
        el.style.setProperty('--my', my);
      }
    };

    const stepToward = (k: number) => {
      curX += (targetX - curX) * k;
      curY += (targetY - curY) * k;
      if (Math.abs(targetX - curX) < 0.0008) curX = targetX;
      if (Math.abs(targetY - curY) < 0.0008) curY = targetY;
      write();
    };

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      // 同步跟一截，避免 rAF 被长任务挤掉时「背景假死」
      stepToward(0.35);
    };

    const tick = () => {
      if (!running) return;
      stepToward(0.14);
      mouseRaf = requestAnimationFrame(tick);
    };

    mouseRaf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      running = false;
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
