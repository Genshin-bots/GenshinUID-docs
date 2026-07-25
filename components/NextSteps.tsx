import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * 文末「接下来」导航卡——降低新手「看完了去哪」的迷茫
 *
 * <NextSteps
 *   items={[
 *     { title: '环境检查', href: './environment/', desc: '确认 Python 与 git', primary: true },
 *     { title: 'Docker', href: './docker/', desc: '不想装 Python？' },
 *   ]}
 * />
 */

export interface NextStepItem {
  title: string;
  href: string;
  desc?: string;
  primary?: boolean;
}

interface NextStepsProps {
  items: NextStepItem[];
  label?: string;
  className?: string;
}

export function NextSteps({
  items,
  label = '接下来做什么？',
  className,
}: NextStepsProps) {
  return (
    <nav className={cn('not-prose fd-nextsteps', className)} aria-label={label}>
      <div className="fd-nextsteps__label">{label}</div>
      <div className="fd-nextsteps__grid">
        {items.map((item) => (
          <Link
            key={item.href + item.title}
            href={item.href}
            className={cn('fd-nextsteps__card', item.primary && 'is-primary')}
          >
            <span className="fd-nextsteps__card-title">
              {item.title}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
            {item.desc && (
              <span className="fd-nextsteps__card-desc">{item.desc}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
