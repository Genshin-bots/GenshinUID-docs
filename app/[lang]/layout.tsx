import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { i18n, type Language } from '@/lib/i18n'
import { i18nUI } from '@/lib/layout.shared'
import { Inter } from 'next/font/google'
import { Analytics } from '@/components/Analytics'
import '@/app/global.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: {
    default: '早柚核心Docs',
    template: '%s | 早柚核心Docs',
  },
  description: '安装早柚核心、了解早柚协议、编写GsCore插件，早柚核心，一个可以连接多个Bot和适配多个平台的Python Bot框架。',
  keywords: 'Dcos，GsCore，早柚核心，GenshinUID，机器人插件，NoneBot2，onebot，HoshinoBot，YunzaiBot，Koishi，ZeroBot，Plugins，Bot，原神机器人，星铁机器人，方舟机器人，游戏机器人，蔚蓝档案机器人，QQ群，QQ频道，KOOK，Telegram，Discord，飞书。',
  authors: [{ name: 'Wuyi' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/images/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'article',
    title: '早柚核心Docs',
    description: '安装早柚核心、了解早柚协议、编写GsCore插件',
    locale: 'zh_CN',
    siteName: '早柚核心Docs',
  },
}

export function generateStaticParams() {
  return i18n.languages.map(lang => ({ lang }))
}

interface LangLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params

  // 验证语言是否支持
  if (!i18n.languages.includes(lang as Language)) {
    notFound()
  }

  return (
    <html lang={lang} suppressHydrationWarning className={inter.className}>
      <body className="flex min-h-screen flex-col">
        <RootProvider i18n={i18nUI.provider(lang as Language)}>
          {children}
          <Analytics />
        </RootProvider>
      </body>
    </html>
  )
}
