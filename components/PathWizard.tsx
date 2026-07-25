'use client';

import {
  ArrowRight,
  Bot,
  Container,
  type LucideIcon,
  Rocket,
  Sparkles,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 上手路径向导：选场景 → 给出推荐阅读顺序（深链）。
 * 纯 client，不嵌 MDX children，适合首页 / 文档首页入口。
 */

export interface PathWizardStep {
  title: string;
  href: string;
  desc?: string;
}

export interface PathWizardPath {
  id: string;
  name: string;
  desc: string;
  /** lucide 键：rocket / terminal / container / bot / sparkles */
  icon?: string;
  recommended?: boolean;
  steps: PathWizardStep[];
}

interface PathWizardProps {
  paths: PathWizardPath[];
  label?: string;
  startLabel?: string;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  rocket: Rocket,
  terminal: Terminal,
  container: Container,
  bot: Bot,
  sparkles: Sparkles,
};

function PathIcon({ iconKey }: { iconKey?: string }) {
  const Icon = (iconKey && ICON_MAP[iconKey]) || Rocket;
  return <Icon className="h-5 w-5" aria-hidden />;
}

export function PathWizard({
  paths,
  label = '你想从哪条路开始？',
  startLabel = '开始阅读',
  className,
}: PathWizardProps) {
  const initial = paths.find((p) => p.recommended)?.id ?? paths[0]?.id ?? '';
  const [activeId, setActiveId] = useState(initial);
  const active = paths.find((p) => p.id === activeId) ?? paths[0];

  if (!active) return null;

  return (
    <div className={cn('not-prose fd-pathwiz', className)}>
      <div className="fd-pathwiz__label">{label}</div>
      <div className="fd-pathwiz__grid" role="tablist" aria-label={label}>
        {paths.map((p) => {
          const selected = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                'fd-pathwiz__card',
                selected && 'is-active',
                p.recommended && 'is-recommended',
              )}
              onClick={() => setActiveId(p.id)}
            >
              <span className="fd-pathwiz__card-icon">
                <PathIcon iconKey={p.icon} />
              </span>
              <span className="fd-pathwiz__card-name">
                {p.name}
                {p.recommended && <span className="fd-pathwiz__rec">推荐</span>}
              </span>
              <span className="fd-pathwiz__card-desc">{p.desc}</span>
            </button>
          );
        })}
      </div>

      <ol className="fd-pathwiz__steps">
        {active.steps.map((step, i) => (
          <li key={step.href} className="fd-pathwiz__step">
            <span className="fd-pathwiz__step-num" aria-hidden>
              {i + 1}
            </span>
            <div className="fd-pathwiz__step-body">
              <Link href={step.href} className="fd-pathwiz__step-link">
                {step.title}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              {step.desc && (
                <p className="fd-pathwiz__step-desc">{step.desc}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {active.steps[0] && (
        <Link href={active.steps[0].href} className="fd-pathwiz__cta">
          {startLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
