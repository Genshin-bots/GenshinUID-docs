'use client'

import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLElement> & { children?: ReactNode }

/**
 * 自定义 DocsPage 容器：替代 Fumadocs 默认的 max-w-[900px] 容器，
 * 让 article 撑满 main 整列宽，使 title banner 可以真正占满整个 main 列。
 */
export function DocsArticleContainer({ children, className, ...props }: Props) {
  return (
    <article
      id="nd-page"
      {...props}
      className={cn(
        // 关键：[grid-area:main] 让 article 落在 grid 的 main 列
        'fd-docs-article',
        'flex flex-col',
        '[grid-area:main]',
        className,
      )}
    >
      {children}
    </article>
  )
}
