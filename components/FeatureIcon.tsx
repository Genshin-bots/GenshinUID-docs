import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Bot,
  Database,
  GitBranch,
  Layers2,
  LayoutDashboard,
  Puzzle,
  Share2,
} from 'lucide-react';

/**
 * 首页「开发优势」卡片图标键 → lucide。
 * home-content 只存字符串键，避免跨边界传组件。
 */
const FEATURE_ICONS: Record<string, LucideIcon> = {
  platforms: Layers2,
  bots: Bot,
  protocol: Share2,
  console: LayoutDashboard,
  plugins: Puzzle,
  database: Database,
  docs: BookOpen,
  opensource: GitBranch,
};

export function FeatureIcon({
  name,
  className = 'feature-card__icon-svg',
}: {
  name: string;
  className?: string;
}) {
  const Icon = FEATURE_ICONS[name] ?? Layers2;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
