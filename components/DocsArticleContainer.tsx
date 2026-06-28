'use client';

import { useDocsPage } from 'fumadocs-ui/layouts/docs/page';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = HTMLAttributes<HTMLElement> & { children?: ReactNode };

/**
 * 自定义 DocsPage 容器：替代 Fumadocs 默认的 max-w-[900px] 容器，
 * 让 article 撑满 main 整列宽，使 title banner 可以真正占满整个 main 列。
 *
 * · 默认（非 full）= `fd-docs-article`，居中限宽 54rem，左右留白；
 * · full = true 时（页面 frontmatter 写 `full: true`）= 撑满整个 main 列，
 *   常用于实时聊天室等需要横跨主列的页面。
 */
export function DocsArticleContainer({ children, className, ...props }: Props) {
  const { full } = useDocsPage();
  return (
    <article
      id="nd-page"
      data-full={full}
      {...props}
      className={cn(
        'flex flex-col',
        '[grid-area:main]',
        // 非 full：保留居中限宽 54rem
        !full && 'fd-docs-article',
        // full：撑满主列 + 与头部 banner 同样的左右 padding
        full && 'fd-docs-article-full',
        className,
      )}
    >
      {children}
    </article>
  );
}
