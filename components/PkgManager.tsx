'use client';

import {
  Box,
  Boxes,
  Check,
  FileJson,
  type LucideIcon,
  Monitor,
  Package,
  Settings,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import { Children, isValidElement, type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 「三选一」包管理器选择器（Compound Component 模式）
 *
 * 设计要点（也是本组件能拿到 Shiki 高亮的**根源**）：
 * · 内容用 **children** 传入，而不是塞进 `options[i].content`。
 *   这样 3 个 `<details>` 直接写在 MDX 里，fenced code block ``` 走 MDX 解析器
 *   → rehype-pretty-code → Shiki，拿到与正文其他位置完全一致的高亮 + 复制按钮。
 *   旧版把 JSX 写在 `{[...]}` 数组表达式里，MDX 不会在 JSX 里解析 markdown，
 *   导致 code block 退化成纯 `<pre><code>`、没有高亮、没有复制按钮。
 * · 每个 child 必须带 `data-pkg="xxx"` 标记归属哪个 option（与 option.id 一致），
 *   PkgManager 根据当前 `activeId` 过滤出对应的那一个渲染。
 *   其余两份**完全不出现在 DOM 里**（不是 `display:none`），避免无意义渲染。
 * · 点卡片 → setState → key 变化 → 整块面板重挂载 + fade-in 动画。
 *
 * 用法（MDX）：
 * <PkgManager options={[...]}>
 *   <details data-pkg="poetry">
 *     <summary>检查Poetry</summary>
 *     ```shell
 *     # ...
 *     ```
 *   </details>
 *   <details data-pkg="uv">...</details>
 *   <details data-pkg="pdm">...</details>
 * </PkgManager>
 *
 * a11y：grid = `role="tablist"`，每张卡 = `role="tab"`，面板 = `role="tabpanel"`。
 */

export interface PkgManagerOption {
  /** 唯一 id，匹配 children 上 `<element data-pkg="xxx">` */
  id: string;
  /** 名称（poetry / uv / pdm / pip …） */
  name: string;
  /** 简短描述（一行副标题） */
  desc: string;
  /** 最低版本要求，可选 */
  minVersion?: string;
  /** 是否推荐（仅一张被高亮 + 显示「推荐」徽章） */
  recommended?: boolean;
  /**
   * 自定义图标键名（lucide-react 名称）。缺省时按 id 自动选：
   *   uv → Sparkles / pdm → Package / poetry → Boxes / pip → Terminal /
   *   monitor → Monitor / file / fileJson → FileJson /
   *   settings → Settings / wrench → Wrench / 其他 → Box
   *
   * 注意：必须是**字符串**而不是直接 import 的组件——
   * PkgManager 是 Client Component，从 MDX（Server Component）传函数 prop
   * 会被 Next.js 序列化检查拒掉（'use client' 边界）。把字符串键传过来，
   * 由本组件内部用 map 解析为 lucide 组件即可。
   */
  icon?: keyof typeof ICON_MAP | string;
}

interface PkgManagerProps {
  options: PkgManagerOption[];
  /** 顶部左侧的小标题，默认 "三选一即可" */
  label?: string;
  /** 每个 child 必须带 `data-pkg` 标记归属哪个 option */
  children: ReactNode;
  className?: string;
}

/** 图标字符串 → lucide-react 组件 的映射表。
 *  MDX 里 `options[i].icon` 只能传字符串（不能直接传组件，Client 边界序列化
 *  会炸），所以这里把字符串集中解析为组件。 */
const ICON_MAP: Record<string, LucideIcon> = {
  uv: Sparkles,
  pdm: Package,
  poetry: Boxes,
  pip: Terminal,
  monitor: Monitor,
  monitorSmartphone: Monitor,
  fileJson: FileJson,
  settings: Settings,
  wrench: Wrench,
  box: Box,
};

/** 每张卡片左上角的图标。优先用 option.icon（字符串键），否则按 id 兜底。 */
function PkgIcon({ id, iconKey }: { id: string; iconKey?: string }) {
  const fromIconKey = iconKey ? ICON_MAP[iconKey] : undefined;
  const fromId = ICON_MAP[id];
  const Resolved = fromIconKey ?? fromId ?? Box;
  return <Resolved className="h-4 w-4" />;
}

export function PkgManager({
  options,
  label = '三选一即可',
  children,
  className,
}: PkgManagerProps) {
  // 默认选中 recommended 的那张（无则选第一张）
  const initialId =
    options.find((o) => o.recommended)?.id ?? options[0]?.id ?? '';
  const [activeId, setActiveId] = useState(initialId);

  // 把 children 拍平，按 `data-pkg` 属性归类（只保留合法 ReactElement）
  const grouped = new Map<string, ReactNode>();
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const pkg = (child.props as { 'data-pkg'?: string })['data-pkg'];
    if (pkg) grouped.set(pkg, child);
  });
  const activeContent = grouped.get(activeId);

  return (
    <div className={cn('not-prose fd-pkgmgr', className)}>
      <div className="fd-pkgmgr__head">
        <span className="fd-pkgmgr__label">{label}</span>
        <span className="fd-pkgmgr__hint">
          点击切换，下方只显示该工具的指南
        </span>
      </div>
      <div className="fd-pkgmgr__grid" role="tablist" aria-label={label}>
        {options.map((opt) => {
          const isActive = opt.id === activeId;
          const tabId = `fd-pkgmgr-tab-${opt.id}`;
          const panelId = `fd-pkgmgr-panel-${opt.id}`;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(opt.id)}
              className={cn(
                'fd-pkgmgr__card',
                opt.recommended && 'fd-pkgmgr__card--recommended',
                isActive && 'fd-pkgmgr__card--active',
              )}
            >
              {opt.recommended && (
                <span className="fd-pkgmgr__badge">推荐</span>
              )}
              <span className="fd-pkgmgr__check" aria-hidden>
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="fd-pkgmgr__icon" aria-hidden>
                <PkgIcon id={opt.id} iconKey={opt.icon} />
              </span>
              <span className="fd-pkgmgr__body">
                <span className="fd-pkgmgr__title-row">
                  <span className="fd-pkgmgr__name">{opt.name}</span>
                  {opt.minVersion && (
                    <span className="fd-pkgmgr__version-badge">
                      {opt.minVersion}
                    </span>
                  )}
                </span>
                <span className="fd-pkgmgr__desc">{opt.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        key={activeId /* key 切换让 fade-in 动画重放 */}
        className="fd-pkgmgr__panel prose"
        role="tabpanel"
        id={`fd-pkgmgr-panel-${activeId}`}
        aria-labelledby={`fd-pkgmgr-tab-${activeId}`}
      >
        {activeContent}
      </div>
    </div>
  );
}
