import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import { i18n, type Language } from '@/lib/i18n'
import { DocsNav } from '@/components/DocsNav'

interface DocsLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default async function Layout({ children, params }: DocsLayoutProps) {
  const { lang } = await params

  if (!i18n.languages.includes(lang as Language)) {
    notFound()
  }

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        component: <DocsNav lang={lang as Language} />,
      }}
      sidebar={{
        collapsible: true,
      }}
      searchToggle={{ enabled: true }}
      themeSwitch={{ enabled: true }}
    >
      {children}
    </DocsLayout>
  )
}
