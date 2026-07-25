import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 阅读/操作耗时徽章——新手预期管理
 * <TimeEstimate minutes={15} level="easy" />
 */

export interface TimeEstimateProps {
  minutes: number;
  /** 难度文案 */
  level?: 'easy' | 'medium' | 'hard';
  /** 自定义难度文字 */
  levelText?: string;
  className?: string;
  /** 前缀，如「预计耗时」 */
  prefix?: string;
}

const LEVEL_ZH = {
  easy: '简单',
  medium: '一般',
  hard: '稍难',
} as const;

export function TimeEstimate({
  minutes,
  level = 'easy',
  levelText,
  className,
  prefix = '预计',
}: TimeEstimateProps) {
  return (
    <div className={cn('not-prose fd-timeest', className)} data-level={level}>
      <Clock className="h-3.5 w-3.5" aria-hidden />
      <span>
        {prefix} <strong>{minutes} 分钟</strong>
      </span>
      <span className="fd-timeest__dot" aria-hidden>
        ·
      </span>
      <span className="fd-timeest__level">{levelText ?? LEVEL_ZH[level]}</span>
    </div>
  );
}
