import type { ReactNode } from 'react';
import { Badge, type BadgeType } from '@/components/Badge';
import { cn } from '@/lib/utils';

/**
 * 配置字段卡片（Server Component）——把配置表「墙」拆成可扫卡片。
 *
 * <ConfigField
 *   name="WS_TOKEN"
 *   defaultValue='""'
 *   file="config.json"
 *   risk="high"
 *   when="公网部署 / 远程 Bot 连接时必填"
 * >
 *   Core 与 Bot 必须一致的 WebSocket 鉴权令牌。
 * </ConfigField>
 */

export type ConfigFieldRisk = 'low' | 'medium' | 'high';

export interface ConfigFieldProps {
  name: string;
  /** 默认值展示（字符串） */
  defaultValue?: string;
  /** 所属配置文件，如 config.json */
  file?: string;
  /** 何时需要改 */
  when?: string;
  risk?: ConfigFieldRisk;
  children?: ReactNode;
  className?: string;
}

const RISK_BADGE: Record<ConfigFieldRisk, { text: string; type: BadgeType }> = {
  low: { text: '低风险', type: 'info' },
  medium: { text: '注意', type: 'warning' },
  high: { text: '安全关键', type: 'danger' },
};

export function ConfigField({
  name,
  defaultValue,
  file,
  when,
  risk = 'low',
  children,
  className,
}: ConfigFieldProps) {
  const badge = RISK_BADGE[risk];
  return (
    <div className={cn('not-prose fd-configfield', className)} data-risk={risk}>
      <div className="fd-configfield__head">
        <code className="fd-configfield__name">{name}</code>
        <Badge type={badge.type} text={badge.text} />
      </div>
      {(defaultValue !== undefined || file || when) && (
        <dl className="fd-configfield__meta">
          {defaultValue !== undefined && (
            <div>
              <dt>默认</dt>
              <dd>
                <code>{defaultValue}</code>
              </dd>
            </div>
          )}
          {file && (
            <div>
              <dt>文件</dt>
              <dd>
                <code>{file}</code>
              </dd>
            </div>
          )}
          {when && (
            <div className="fd-configfield__when">
              <dt>何时改</dt>
              <dd>{when}</dd>
            </div>
          )}
        </dl>
      )}
      {children && <div className="fd-configfield__body">{children}</div>}
    </div>
  );
}

interface ConfigFieldGridProps {
  children: ReactNode;
  className?: string;
}

/** 多字段网格容器 */
export function ConfigFieldGrid({ children, className }: ConfigFieldGridProps) {
  return (
    <div className={cn('not-prose fd-configfield-grid', className)}>
      {children}
    </div>
  );
}
