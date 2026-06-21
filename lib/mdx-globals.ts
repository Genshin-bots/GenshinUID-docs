// 将 MDX 使用的组件注册为全局变量
// 用于在 MDX 编译输出中引用未导入的组件

import type { ComponentType, ReactNode } from 'react'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { NavCard } from '@/components/NavCard'
import { DataPanel } from '@/components/DataPanel'
import { PageInfo } from '@/components/PageInfo'
import { VideoLink } from '@/components/VideoLink'
import { CopyRight } from '@/components/CopyRight'
import { Contact } from '@/components/Contact'
import { ChatLayout } from '@/components/chat/ChatLayout'

declare global {
  // eslint-disable-next-line no-var
  var Badge: ComponentType<any>
  // eslint-disable-next-line no-var
  var Card: ComponentType<any>
  // eslint-disable-next-line no-var
  var NavCard: ComponentType<any>
  // eslint-disable-next-line no-var
  var DataPanel: ComponentType<any>
  // eslint-disable-next-line no-var
  var PageInfo: ComponentType<any>
  // eslint-disable-next-line no-var
  var VideoLink: ComponentType<any>
  // eslint-disable-next-line no-var
  var CopyRight: ComponentType<any>
  // eslint-disable-next-line no-var
  var Contact: ComponentType<any>
  // eslint-disable-next-line no-var
  var ChatLayout: ComponentType<any>
}

if (typeof globalThis !== 'undefined') {
  ;(globalThis as any).Badge = Badge
  ;(globalThis as any).Card = Card
  ;(globalThis as any).NavCard = NavCard
  ;(globalThis as any).DataPanel = DataPanel
  ;(globalThis as any).PageInfo = PageInfo
  ;(globalThis as any).VideoLink = VideoLink
  ;(globalThis as any).CopyRight = CopyRight
  ;(globalThis as any).Contact = Contact
  ;(globalThis as any).ChatLayout = ChatLayout
}

export {}
