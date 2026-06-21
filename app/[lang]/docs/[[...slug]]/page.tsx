import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { source } from '@/lib/source'
import { i18n, type Language } from '@/lib/i18n'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { getMDXComponents } from '@/components/mdx'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { LLMCopyButton, ViewOptions } from '@/components/page-actions'

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string[] }[] = []

  for (const lang of i18n.languages) {
    const pages = source.getPages(lang)
    for (const page of pages) {
      params.push({
        lang,
        slug: page.slugs,
      })
    }
  }

  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const page = source.getPage(slug ?? [], lang)
  if (!page) return {}

  return {
    title: page.data.title,
    description: page.data.description,
  }
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = await params

  // 验证语言
  if (!i18n.languages.includes(lang as Language)) {
    notFound()
  }

  const page = source.getPage(slug ?? [], lang)
  if (!page) {
    notFound()
  }

  const MDX = page.data.body
  const githubUrl = process.env.GITHUB_URL || 'https://github.com/Genshin-bots/GenshinUID-docs'
  const editUrl = `${githubUrl}/edit/fumadocs/content/docs/${page.path}`

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        single: false,
      }}
      breadcrumb={{ enabled: true }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-4">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions markdownUrl={`${page.url}.mdx`} githubUrl={editUrl} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}
