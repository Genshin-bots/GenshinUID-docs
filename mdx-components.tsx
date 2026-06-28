// 全局 MDX 组件注册 - 让所有 MDX 文件都可以使用自定义组件

import { Callout } from 'fumadocs-ui/components/callout';
import type { MDXComponents } from 'mdx/types';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Contact } from '@/components/Contact';
import { CopyRight } from '@/components/CopyRight';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { DataPanel } from '@/components/DataPanel';
import { NavCard } from '@/components/NavCard';
import { PageInfo } from '@/components/PageInfo';
import { VideoLink } from '@/components/VideoLink';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Badge,
    Card,
    NavCard,
    DataPanel,
    PageInfo,
    VideoLink,
    CopyRight,
    Contact,
    ChatLayout,
    Callout,
  };
}
