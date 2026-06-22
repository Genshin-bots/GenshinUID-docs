import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Star } from 'lucide-react'
import { HomeHero } from '@/components/HomeHero'
import { Reveal } from '@/components/Reveal'
import { Marquee } from '@/components/Marquee'
import { Contributors, type Contributor } from '@/components/Contributors'
import { Members } from '@/components/Members'
import { i18n, type Language } from '@/lib/i18n'
import { getHomeContent } from '@/lib/home-content'

interface HomeProps {
  params: Promise<{ lang: string }>
}

const REPO_URL = 'https://github.com/Genshin-bots/gsuid_core'

/** 构建期预取贡献者，烘焙进静态页面——避免访客侧 GitHub API 限流。失败则返回空数组由客户端兜底。 */
async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/Genshin-bots/gsuid_core/contributors?per_page=40',
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'gsuid-docs' } },
    )
    if (!res.ok)
      return []
    const data = await res.json()
    if (!Array.isArray(data))
      return []
    return data.map((c: Contributor) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      contributions: c.contributions,
    }))
  }
  catch {
    return []
  }
}

export default async function HomePage({ params }: HomeProps) {
  const { lang } = await params

  if (!i18n.languages.includes(lang as Language)) {
    notFound()
  }

  const content = getHomeContent(lang as Language)
  const contributors = await fetchContributors()

  return (
    <main className="fd-default-layout">
      {/* Hero Section · 视差滚动 / 滚动驱动动画 */}
      <HomeHero
        lang={lang}
        eyebrow={content.hero.eyebrow ?? 'GsCore · 一个 Python Bot 框架'}
        name={content.hero.name}
        text={content.hero.text}
        tagline={content.hero.tagline}
        actions={content.hero.actions}
        scrollHint={content.scrollHint ?? '向下滚动 · 探索更多'}
      />

      {/* 大字滚动条 · 平台 / Bot 生态 */}
      <Marquee items={content.marquee} />

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 features-section">
        <Reveal>
          <h2 className="features-section-title">
            {content.featuresTitle ?? '为什么选择 GsCore'}
          </h2>
        </Reveal>
        <div className="features-grid">
          {content.features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 70}>
              <div className="feature-card">
                <div className="icon" aria-hidden>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.details}</p>
                {feature.link && (
                  <Link
                    href={feature.link.startsWith('http') ? feature.link : `/${lang}${feature.link}`}
                    target={feature.link.startsWith('http') ? '_blank' : undefined}
                    rel={feature.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="feature-link"
                  >
                    {feature.linkText || '了解更多'}
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section id="community" className="mx-auto max-w-6xl px-6 section-block">
        <Reveal>
          <h2 className="section-title">{content.teamTitle ?? '核心团队'}</h2>
          <Members members={content.teamMembers} />
        </Reveal>

        <Reveal>
          <h2 className="section-title" style={{ marginTop: '3rem' }}>
            <Star className="size-5 inline-block -mt-1 mr-1.5 text-fd-primary" />
            {content.contributorsTitle}
          </h2>
          <Contributors
            initial={contributors}
            repoUrl={REPO_URL}
            label={content.contributorsLabel}
            viewAllText={content.contributorsViewAll}
          />
        </Reveal>

        <Reveal>
          <h2 className="section-title" style={{ marginTop: '3rem' }}>
            {content.supportTitle}
          </h2>
          <div className="support-links">
            {content.supportLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="support-link"
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  )
}
