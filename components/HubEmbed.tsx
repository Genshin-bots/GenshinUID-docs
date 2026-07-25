'use client';

import { ExternalLink, MonitorPlay } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HUB_DEMO_BASE } from '@/lib/home-content';
import { cn } from '@/lib/utils';

/**
 * 文档内嵌 WebConsole Demo（public/hub）。
 *
 * 防白屏铁律：iframe 挂上后**永不卸载**（仅 opacity / pointer-events 切换可见性）。
 * 默认懒加载：进入视口或用户点击「加载演示」后再挂 iframe。
 *
 * <HubEmbed route="dashboard" title="控制台概览" height={420} />
 */

export interface HubEmbedProps {
  /** HashRouter 路由，如 dashboard / plugins / themes / ai-memory */
  route: string;
  title?: string;
  /** 像素高度，默认 400 */
  height?: number;
  /** 是否进入视口即自动加载（默认 true） */
  autoLoad?: boolean;
  className?: string;
  loadLabel?: string;
  openLabel?: string;
}

function embedSrc(route: string) {
  const clean = route.replace(/^\/+/, '');
  return `${HUB_DEMO_BASE}/index.html?embed=1#/${clean}`;
}

export function HubEmbed({
  route,
  title,
  height = 400,
  autoLoad = true,
  className,
  loadLabel = '加载实时演示',
  openLabel = '新窗口打开',
}: HubEmbedProps) {
  const src = embedSrc(route);
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!autoLoad || mounted) return;
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '120px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoLoad, mounted]);

  const load = () => {
    setMounted(true);
    setVisible(true);
  };

  return (
    <div
      ref={rootRef}
      className={cn('not-prose fd-hubembed', className)}
      style={{ ['--hub-h' as string]: `${height}px` }}
    >
      <div className="fd-hubembed__bar">
        <span className="fd-hubembed__title">
          <MonitorPlay className="h-3.5 w-3.5" aria-hidden />
          {title ?? `Demo · ${route}`}
        </span>
        <div className="fd-hubembed__actions">
          {!mounted && (
            <button type="button" className="fd-hubembed__btn" onClick={load}>
              {loadLabel}
            </button>
          )}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="fd-hubembed__btn fd-hubembed__btn--ghost"
          >
            {openLabel}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </div>

      <div className="fd-hubembed__frame-wrap">
        {!mounted && (
          <button
            type="button"
            className="fd-hubembed__placeholder"
            onClick={load}
          >
            <MonitorPlay className="h-8 w-8 opacity-60" aria-hidden />
            <span>{loadLabel}</span>
          </button>
        )}
        {/* 一旦 mounted，永不卸载 iframe */}
        {mounted && (
          <iframe
            title={title ?? `GsCore Hub · ${route}`}
            src={src}
            className={cn(
              'fd-hubembed__iframe',
              visible ? 'is-visible' : 'is-hidden',
            )}
            loading="lazy"
            // sandbox 保持与首页一致：同源 demo 需要脚本
            allow="clipboard-read; clipboard-write"
          />
        )}
      </div>
    </div>
  );
}
