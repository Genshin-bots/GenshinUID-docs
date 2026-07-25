'use client';

import {
  Bot,
  Boxes,
  Cpu,
  type LucideIcon,
  MessageSquare,
  Puzzle,
  Server,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 可点击的架构流程图——新手理解 Core / Bot / 适配器 / 插件
 *
 * <FlowDiagram
 *   nodes={[
 *     { id: 'platform', name: '聊天平台', desc: 'QQ / TG / Discord…', icon: 'message' },
 *     ...
 *   ]}
 *   edges={[['platform','bot'],['bot','core'],...]}
 * />
 */

export interface FlowNode {
  id: string;
  name: string;
  /** 简短副标题 */
  short?: string;
  /** 点选后右侧/下方展开的详细说明 */
  detail: string;
  icon?: 'message' | 'bot' | 'server' | 'puzzle' | 'boxes' | 'cpu';
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  /** 可选：节点 id 的从左到右顺序（默认用 nodes 顺序） */
  order?: string[];
  label?: string;
  className?: string;
  hint?: string;
}

const ICONS: Record<string, LucideIcon> = {
  message: MessageSquare,
  bot: Bot,
  server: Server,
  puzzle: Puzzle,
  boxes: Boxes,
  cpu: Cpu,
};

export function FlowDiagram({
  nodes,
  order,
  label = '点击方块，了解每一层在干什么',
  className,
  hint = '点选查看说明',
}: FlowDiagramProps) {
  const sequence = order
    ? (order
        .map((id) => nodes.find((n) => n.id === id))
        .filter(Boolean) as FlowNode[])
    : nodes;
  const [activeId, setActiveId] = useState(sequence[0]?.id ?? '');
  const active = nodes.find((n) => n.id === activeId) ?? sequence[0];

  return (
    <div className={cn('not-prose fd-flow', className)}>
      <div className="fd-flow__label">{label}</div>
      <div className="fd-flow__track" role="list">
        {sequence.map((node, i) => {
          const Icon = ICONS[node.icon ?? 'boxes'] ?? Boxes;
          const selected = node.id === activeId;
          return (
            <div key={node.id} className="fd-flow__item" role="listitem">
              {i > 0 && (
                <div className="fd-flow__arrow" aria-hidden>
                  <span />
                </div>
              )}
              <button
                type="button"
                className={cn('fd-flow__node', selected && 'is-active')}
                onClick={() => setActiveId(node.id)}
                aria-pressed={selected}
              >
                <span className="fd-flow__node-icon">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="fd-flow__node-name">{node.name}</span>
                {node.short && (
                  <span className="fd-flow__node-short">{node.short}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {active && (
        <div key={active.id} className="fd-flow__detail">
          <div className="fd-flow__detail-title">
            {active.name}
            <span className="fd-flow__detail-hint">{hint}</span>
          </div>
          <p className="fd-flow__detail-body">{active.detail}</p>
        </div>
      )}
    </div>
  );
}
