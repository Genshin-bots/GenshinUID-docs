'use client';

import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  type LucideIcon,
  Shield,
  Wrench,
} from 'lucide-react';
import {
  Children,
  isValidElement,
  type ReactNode,
  useId,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * 决策 / 症状树选择器（Compound Component）
 *
 * 用法（MDX）：
 * <DecisionTree
 *   label="你的部署场景"
 *   options={[
 *     { id: 'local', name: '仅本机', desc: 'Bot 与 Core 同机', icon: 'shield', recommended: true },
 *     { id: 'public', name: '公网', desc: '需要 WS_TOKEN', icon: 'alert' },
 *   ]}
 * >
 *   <div data-branch="local">...</div>
 *   <div data-branch="public">...</div>
 * </DecisionTree>
 *
 * 内容必须放在 children + data-branch 上，保证 fenced code / Callout 走 MDX 管线。
 */

export interface DecisionTreeOption {
  id: string;
  name: string;
  desc?: string;
  recommended?: boolean;
  /** lucide 键：shield / alert / wrench / check / help / lightbulb / box */
  icon?: string;
}

interface DecisionTreeProps {
  options: DecisionTreeOption[];
  /** 顶部说明，默认「选择一项查看说明」 */
  label?: string;
  children: ReactNode;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  alert: AlertTriangle,
  wrench: Wrench,
  check: CheckCircle2,
  help: HelpCircle,
  lightbulb: Lightbulb,
  box: Box,
};

function BranchIcon({ iconKey }: { iconKey?: string }) {
  const Icon = (iconKey && ICON_MAP[iconKey]) || HelpCircle;
  return <Icon className="h-4 w-4" aria-hidden />;
}

export function DecisionTree({
  options,
  label = '选择一项查看说明',
  children,
  className,
}: DecisionTreeProps) {
  const baseId = useId();
  const initialId =
    options.find((o) => o.recommended)?.id ?? options[0]?.id ?? '';
  const [activeId, setActiveId] = useState(initialId);

  const grouped = new Map<string, ReactNode>();
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const branch =
      (child.props as { 'data-branch'?: string })['data-branch'] ??
      (child.props as { 'data-pkg'?: string })['data-pkg'];
    if (!branch) return;
    grouped.set(branch, child);
  });

  const panel = grouped.get(activeId);

  return (
    <div className={cn('not-prose fd-decision', className)}>
      <div className="fd-decision__label">{label}</div>
      <div className="fd-decision__list" role="tablist" aria-label={label}>
        {options.map((opt) => {
          const selected = opt.id === activeId;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${opt.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${opt.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                'fd-decision__option',
                selected && 'is-active',
                opt.recommended && 'is-recommended',
              )}
              onClick={() => setActiveId(opt.id)}
            >
              <span className="fd-decision__option-icon">
                <BranchIcon iconKey={opt.icon} />
              </span>
              <span className="fd-decision__option-text">
                <span className="fd-decision__option-name">
                  {opt.name}
                  {opt.recommended && (
                    <span className="fd-decision__rec">推荐</span>
                  )}
                </span>
                {opt.desc && (
                  <span className="fd-decision__option-desc">{opt.desc}</span>
                )}
              </span>
              <ChevronRight
                className={cn('fd-decision__chevron', selected && 'is-active')}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      <div
        key={activeId}
        role="tabpanel"
        id={`${baseId}-panel-${activeId}`}
        aria-labelledby={`${baseId}-tab-${activeId}`}
        className="fd-decision__panel"
      >
        {panel}
      </div>
    </div>
  );
}
