import { Info, Lightbulb, type LucideIcon, Sparkles, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 新手友好提示条（Server Component）
 *
 * <BeginnerTip title="这是什么意思？">
 *   Core 可以理解成「大脑」，Bot 是「嘴巴和耳朵」。
 * </BeginnerTip>
 */

type TipVariant = 'tip' | 'why' | 'remember' | 'info';

const VARIANT: Record<TipVariant, { Icon: LucideIcon; label: string }> = {
  tip: { Icon: Lightbulb, label: '新手提示' },
  why: { Icon: Sparkles, label: '为什么要做' },
  remember: { Icon: Star, label: '记住这一点' },
  info: { Icon: Info, label: '补充说明' },
};

export interface BeginnerTipProps {
  children: ReactNode;
  title?: string;
  variant?: TipVariant;
  className?: string;
}

export function BeginnerTip({
  children,
  title,
  variant = 'tip',
  className,
}: BeginnerTipProps) {
  const { Icon, label } = VARIANT[variant];
  return (
    <aside
      className={cn(
        'not-prose fd-begintip',
        `fd-begintip--${variant}`,
        className,
      )}
      data-variant={variant}
    >
      <div className="fd-begintip__head">
        <span className="fd-begintip__icon" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <span className="fd-begintip__label">{title ?? label}</span>
      </div>
      <div className="fd-begintip__body">{children}</div>
    </aside>
  );
}
