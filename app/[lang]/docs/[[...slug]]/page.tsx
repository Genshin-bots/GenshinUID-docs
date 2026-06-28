import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsArticleContainer } from '@/components/DocsArticleContainer';
import { MarkdownDescription } from '@/components/MarkdownDescription';
import { getMDXComponents } from '@/components/mdx';
import { LLMCopyButton, ViewOptions } from '@/components/page-actions';
import { TitleArcs } from '@/components/TitleArcs';
import { i18n, type Language } from '@/lib/i18n';
import { source } from '@/lib/source';

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>;
}

// output: export 模式下, [[...slug]] 路由必须在 generateStaticParams 列出所有合法 slug,
// 遇到未列出的 slug 应该直接 404,而不是尝试动态渲染。
// 不加这一行,任何指向不存在 MDX 的链接都会让 dev server 报:
//   "Page ... is missing param ... in generateStaticParams()"
export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { lang: string; slug: string[] }[] = [];

  for (const lang of i18n.languages) {
    const pages = source.getPages(lang);
    for (const page of pages) {
      params.push({
        lang,
        slug: page.slugs,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = source.getPage(slug ?? [], lang);
  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = await params;

  // 验证语言
  if (!i18n.languages.includes(lang as Language)) {
    notFound();
  }

  const page = source.getPage(slug ?? [], lang);
  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const githubUrl =
    process.env.GITHUB_URL || 'https://github.com/Genshin-bots/GenshinUID-docs';
  const editUrl = `${githubUrl}/edit/fumadocs/content/docs/${page.path}`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        single: false,
      }}
      // 完全关掉面包屑渲染（默认 fumadocs 会把章节小字插在 article 顶部）——
      // 用户不希望它出现，无论是顶部还是右下角都不显示。
      breadcrumb={{ enabled: false }}
      footer={{ className: 'mt-12 fd-doc-footer' }}
      slots={{
        container: DocsArticleContainer,
      }}
    >
      <div className="fd-doc-banner">
        <div className="fd-doc-banner__main">
          <div className="fd-doc-title-row">
            <TitleArcs />
            <DocsTitle>{page.data.title}</DocsTitle>
          </div>
          <MarkdownDescription>{page.data.description}</MarkdownDescription>
        </div>
        {/* 两个按钮（复制 Markdown / GitHub 编辑）移到 banner 右下角，
            与 description 行底贴齐——替代之前右下的面包屑位置。 */}
        <div className="fd-doc-banner__actions">
          <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
          <ViewOptions markdownUrl={`${page.url}.mdx`} githubUrl={editUrl} />
        </div>
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}
