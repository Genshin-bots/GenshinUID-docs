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
import type { MDXComponents } from 'mdx/types'

/**
 * MDX 组件映射：将自定义组件注册到 MDX
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
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
    ...components,
  }
}
