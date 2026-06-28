import { Callout } from 'fumadocs-ui/components/callout';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ChatMessage, ChatPanel } from '@/components/ChatPanel';
import { Contact } from '@/components/Contact';
import { CopyRight } from '@/components/CopyRight';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { DataPanel } from '@/components/DataPanel';
import { FaqList } from '@/components/FaqList';
import { NavCard } from '@/components/NavCard';
import { PageInfo } from '@/components/PageInfo';
import { VideoLink } from '@/components/VideoLink';

/**
 * MDX 组件映射：将自定义组件注册到 MDX
 *
 * - `h1`: 已在 banner 中通过 DocsTitle 渲染，MDX 内首个 h1 不再显示，
 *   保留 a11y 语义（不直接返回 null，便于复制/SEO）。
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    h1: () => null,
    Badge,
    Card,
    NavCard,
    DataPanel,
    PageInfo,
    VideoLink,
    CopyRight,
    Contact,
    ChatLayout,
    ChatPanel,
    ChatMessage,
    FaqList,
    Callout,
    ...components,
  };
}
