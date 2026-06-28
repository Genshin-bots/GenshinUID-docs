import { Callout } from 'fumadocs-ui/components/callout';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ChatMessage, ChatPanel } from '@/components/ChatPanel';
import { CheckItem } from '@/components/CheckItem';
import { Contact } from '@/components/Contact';
import { CopyRight } from '@/components/CopyRight';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { DataPanel } from '@/components/DataPanel';
import { FaqList } from '@/components/FaqList';
import { NavCard } from '@/components/NavCard';
import { PageInfo } from '@/components/PageInfo';
import { PkgManager } from '@/components/PkgManager';
import { SectionTitleHeading } from '@/components/SectionTitleHeading';
import { VideoLink } from '@/components/VideoLink';

interface MDXComponentOptions {
  /**
   * 是否将该页所有 H2 渲染为「带浮动光团 + 渐变文字」的
   * `<SectionTitleHeading />`。详见 `components/SectionTitleHeading.tsx`。
   * 默认 false——普通页面继续走 fumadocs-ui 的默认 <Heading as="h2">，
   * 避免在 H2 密集的页面（如 web-console）里视觉过载。
   * 由 page.tsx 从 frontmatter `sectionTitles` 字段透传过来。
   */
  sectionTitles?: boolean;
}

/**
 * MDX 组件映射：将自定义组件注册到 MDX
 *
 * - `h1`: 已在 banner 中通过 DocsTitle 渲染，MDX 内首个 h1 不再显示，
 *   保留 a11y 语义（不直接返回 null，便于复制/SEO）。
 * - `h2`: 当 `options.sectionTitles === true` 时，映射到 SectionTitleHeading
 *   —— 让该页所有 H2 获得与页头 DocsTitle 同款的视觉处理，同时仍能被
 *   remark-heading 扫到（→ TOC 正常显示）。
 */
export function getMDXComponents(
  components?: MDXComponents,
  options: MDXComponentOptions = {},
): MDXComponents {
  const h2 = options.sectionTitles
    ? SectionTitleHeading
    : defaultMdxComponents.h2;

  return {
    ...defaultMdxComponents,
    h1: () => null,
    h2,
    Badge,
    Card,
    CheckItem,
    NavCard,
    DataPanel,
    PageInfo,
    PkgManager,
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
