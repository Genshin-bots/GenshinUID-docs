import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { SidebarProvider } from 'fumadocs-ui/layouts/docs/slots/sidebar'
import { DocsNav } from '@/components/DocsNav'
import { i18n, type Language } from '@/lib/i18n'

interface ChatRouteLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

/**
 * 实时聊天室（/chat）独立全页布局
 * --------------------------------------------------------------------------
 * · 用 `HomeLayout` 取代 `DocsLayout` —— 没有侧边栏 / TOC，聊天卡片全屏铺开；
 * · 但顶部仍复用 `DocsNav`（磨砂玻璃 Header），与其它页面保持一致；
 * · 复用 `SidebarProvider` 仅是为了让 `DocsNav` 里的 `useSidebar()` /
 *   `useSearchContext()` 拿到上下文，不再渲染任何侧边栏。
 * · `fd-default-layout` 关掉 HomeLayout 自带的浅色背景，透出全局渐变 / 网格。
 */
export default async function ChatRouteLayout({
  children,
  params,
}: ChatRouteLayoutProps) {
  const { lang } = await params

  if (!i18n.languages.includes(lang as Language)) {
    notFound()
  }

  return (
    <SidebarProvider>
      <HomeLayout
        nav={{
          component: <DocsNav lang={lang as Language} />,
        }}
        // 顶部导航栏的搜索 / 主题 / 语言切换已由 DocsNav 自己提供，
        // 关闭 HomeLayout 默认注入的同类控件以避免重复。
        searchToggle={{ enabled: false }}
        themeSwitch={{ enabled: false }}
        i18n={false}
        // 标识全屏聊天页面：给 body 根容器一个 class，用于把 home-page PPT
        // 翻页脚本 / home 装饰排除掉，并让 chat 内部高度计算与全局一致。
        className="fd-default-layout fd-chat-standalone"
      >
        {children}
      </HomeLayout>
    </SidebarProvider>
  )
}
