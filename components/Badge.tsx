import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeType = 'info' | 'tip' | 'warning' | 'danger'

interface BadgeProps {
  text?: string
  type?: BadgeType
  children?: ReactNode
}

export function Badge({ text, type = 'tip', children }: BadgeProps) {
  return (
    <span className={cn('fd-badge', `fd-badge-${type}`)}>
      {children ?? text}
    </span>
  )
}
