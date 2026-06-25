import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Callout } from 'fumadocs-ui/components/callout'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { NavCard } from '@/components/NavCard'
import { DataPanel } from '@/components/DataPanel'
import { PageInfo } from '@/components/PageInfo'
import { VideoLink } from '@/components/VideoLink'
import { CopyRight } from '@/components/CopyRight'
import { Contact } from '@/components/Contact'
import { ChatLayout } from '@/components/chat/ChatLayout'
import { ChatPanel, ChatMessage } from '@/components/ChatPanel'
import { FaqList } from '@/components/FaqList'
import type { MDXComponents } from 'mdx/types'

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
  }
}

