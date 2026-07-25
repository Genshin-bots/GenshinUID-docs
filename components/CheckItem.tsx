'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Badge, type BadgeType } from '@/components/Badge';
import { cn } from '@/lib/utils';

/**
 * 引导式检查步骤卡（Client Component，支持本地勾选进度）
 *
 * <CheckItem
 *   step={1}
 *   title="确保安装 Python"
 *   subtitle="≥3.11，建议 3.12"
 *   badge={{ text: "必装", type: "warning" }}
 *   checkable
 *   storageKey="gs-env-python"
 * >
 *   ...
 * </CheckItem>
 */

export interface CheckItemProps {
  step: number;
  title: string;
  subtitle?: string;
  badge?: { text: string; type?: BadgeType };
  children: ReactNode;
  className?: string;
  /**
   * 是否显示「我完成了」勾选。进度写入 localStorage（若提供 storageKey）。
   * 默认 true——新手文档推荐开启。
   */
  checkable?: boolean;
  /** localStorage 键，跨刷新保留进度；不设则仅会话内 state */
  storageKey?: string;
  /** 勾选按钮文案 */
  checkLabel?: string;
  checkedLabel?: string;
}

const CHECK_EVENT = 'fd-checkitem-change';

export function dispatchCheckChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHECK_EVENT));
}

export function CheckItem({
  step,
  title,
  subtitle,
  badge,
  children,
  className,
  checkable = true,
  storageKey,
  checkLabel = '我完成了这步',
  checkedLabel = '已完成',
}: CheckItemProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      setDone(localStorage.getItem(storageKey) === '1');
    } catch {
      /* private mode */
    }
  }, [storageKey]);

  const toggle = useCallback(() => {
    setDone((prev) => {
      const next = !prev;
      if (storageKey && typeof window !== 'undefined') {
        try {
          if (next) localStorage.setItem(storageKey, '1');
          else localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        dispatchCheckChange();
      }
      return next;
    });
  }, [storageKey]);

  return (
    <div
      className={cn('not-prose fd-checkitem', done && 'is-done', className)}
      data-done={done ? 'true' : 'false'}
    >
      <div className="fd-checkitem__step" aria-hidden>
        {done ? <Check className="h-4 w-4" strokeWidth={3} /> : step}
      </div>
      <div className="fd-checkitem__main">
        <div className="fd-checkitem__title-row">
          <h3 className="fd-checkitem__title">{title}</h3>
          {badge && <Badge type={badge.type} text={badge.text} />}
        </div>
        {subtitle && <p className="fd-checkitem__subtitle">{subtitle}</p>}
        <div className="fd-checkitem__body">{children}</div>
        {checkable && (
          <button
            type="button"
            className={cn('fd-checkitem__mark', done && 'is-checked')}
            onClick={toggle}
            aria-pressed={done}
          >
            <span className="fd-checkitem__mark-box" aria-hidden>
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            {done ? checkedLabel : checkLabel}
          </button>
        )}
      </div>
    </div>
  );
}

interface CheckProgressProps {
  /** 与各 CheckItem 的 storageKey 列表对应 */
  keys: string[];
  label?: string;
  className?: string;
  /** 全部完成时的鼓励文案 */
  doneText?: string;
}

/** 页面顶部进度条：统计多个 CheckItem 的 localStorage 进度 */
export function CheckProgress({
  keys,
  label = '本页进度',
  className,
  doneText = '太棒了，本页步骤已全部完成！可以继续下一章。',
}: CheckProgressProps) {
  const [count, setCount] = useState(0);

  const keysSig = keys.join('\0');

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    let n = 0;
    for (const k of keysSig.split('\0')) {
      if (!k) continue;
      try {
        if (localStorage.getItem(k) === '1') n += 1;
      } catch {
        /* ignore */
      }
    }
    setCount(n);
  }, [keysSig]);

  useEffect(() => {
    refresh();
    window.addEventListener(CHECK_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHECK_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const total = keys.length;
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  const allDone = total > 0 && count === total;

  return (
    <div
      className={cn(
        'not-prose fd-checkprogress',
        allDone && 'is-complete',
        className,
      )}
    >
      <div className="fd-checkprogress__row">
        <span className="fd-checkprogress__label">{label}</span>
        <span className="fd-checkprogress__count">
          {count} / {total}
        </span>
      </div>
      <div
        className="fd-checkprogress__bar"
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
      >
        <div className="fd-checkprogress__fill" style={{ width: `${pct}%` }} />
      </div>
      {allDone && <p className="fd-checkprogress__done">{doneText}</p>}
    </div>
  );
}
