'use client';

import { AppWindow, type LucideIcon, Monitor, Terminal } from 'lucide-react';
import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * 操作系统切换（Windows / Linux / macOS）
 * children 用 data-os="windows|linux|macos"
 */

export interface OsTabsOption {
  id: 'windows' | 'linux' | 'macos' | string;
  name: string;
  recommended?: boolean;
}

interface OsTabsProps {
  options?: OsTabsOption[];
  label?: string;
  children: ReactNode;
  className?: string;
}

const DEFAULT_OPTIONS: OsTabsOption[] = [
  { id: 'windows', name: 'Windows' },
  { id: 'linux', name: 'Linux' },
  { id: 'macos', name: 'macOS' },
];

const ICONS: Record<string, LucideIcon> = {
  windows: AppWindow,
  linux: Terminal,
  macos: Monitor,
};

export function OsTabs({
  options = DEFAULT_OPTIONS,
  label = '选择你的操作系统',
  children,
  className,
}: OsTabsProps) {
  const baseId = useId();
  const fallback =
    options.find((o) => o.recommended)?.id ?? options[0]?.id ?? 'windows';
  const [activeId, setActiveId] = useState(fallback);

  useEffect(() => {
    const ua = navigator.userAgent;
    const guess = /Mac/i.test(ua)
      ? 'macos'
      : /Linux/i.test(ua)
        ? 'linux'
        : 'windows';
    if (options.some((o) => o.id === guess)) setActiveId(guess);
  }, [options]);

  const grouped = new Map<string, ReactNode>();
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const os = (child.props as { 'data-os'?: string })['data-os'];
    if (os) grouped.set(os, child);
  });

  const panel = grouped.get(activeId);

  return (
    <div className={cn('not-prose fd-ostabs', className)}>
      <div className="fd-ostabs__label">{label}</div>
      <div className="fd-ostabs__list" role="tablist" aria-label={label}>
        {options.map((opt) => {
          const Icon = ICONS[opt.id] ?? Terminal;
          const selected = opt.id === activeId;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${opt.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${opt.id}`}
              className={cn('fd-ostabs__tab', selected && 'is-active')}
              onClick={() => setActiveId(opt.id)}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {opt.name}
            </button>
          );
        })}
      </div>
      <div
        key={activeId}
        role="tabpanel"
        id={`${baseId}-panel-${activeId}`}
        aria-labelledby={`${baseId}-tab-${activeId}`}
        className="fd-ostabs__panel prose"
      >
        {panel}
      </div>
    </div>
  );
}
