import type { ReactNode } from 'react';
import { Badge, type BadgeType } from '@/components/Badge';
import { cn } from '@/lib/utils';

/**
 * 引导式检查步骤卡（Server Component）
 *
 * 用于环境检查、安装等「按步骤走」的章节，每张卡 = 一个独立步骤：
 *   - 左侧：圆形渐变步骤号（视觉锚点 + 顺序感）
 *   - 右侧：标题行（标题 + 徽章）、副标题、内容（code 块 / Callout / 嵌套组件等）
 *   - 多张连续使用时，卡之间会自动出现 2px 渐变连接线（CSS 伪元素，无需手动配）
 *
 * 设计原则：
 *   - 内容**默认全部展开**——用户不再需要"点开 detail"，所有检查命令常显
 *   - 步骤号 + 标题 + 徽章 三件套承担"我现在到哪一步、要做什么、是必装还是可选"的语义
 *   - 标题与正文走 MiSans VF（项目字体规范），版本/数字才用 mono
 *
 * 用法（MDX）：
 * <CheckItem
 *   step={1}
 *   title="确保安装 Python 环境"
 *   subtitle="版本须 >3.9，建议 >=3.12"
 *   badge={{ text: "必装", type: "warning" }}
 * >
 *   ```shell
 *   python -V
 *   ```
 * </CheckItem>
 */
export interface CheckItemProps {
  /** 步骤序号（1, 2, 3...） */
  step: number;
  /** 步骤标题 */
  title: string;
  /** 副标题/说明（标题下一行灰色文字，可选） */
  subtitle?: string;
  /** 标题右侧徽章（如「必装」「推荐」），可选 */
  badge?: { text: string; type?: BadgeType };
  /** 步骤内容——code 块、Callout、嵌套 CheckItem / PkgManager 都能塞 */
  children: ReactNode;
  className?: string;
}

export function CheckItem({
  step,
  title,
  subtitle,
  badge,
  children,
  className,
}: CheckItemProps) {
  return (
    <div className={cn('not-prose fd-checkitem', className)}>
      <div className="fd-checkitem__step" aria-hidden>
        {step}
      </div>
      <div className="fd-checkitem__main">
        <div className="fd-checkitem__title-row">
          <h3 className="fd-checkitem__title">{title}</h3>
          {badge && <Badge type={badge.type} text={badge.text} />}
        </div>
        {subtitle && <p className="fd-checkitem__subtitle">{subtitle}</p>}
        <div className="fd-checkitem__body">{children}</div>
      </div>
    </div>
  );
}
