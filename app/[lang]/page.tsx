import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { HomeContributors } from '@/components/HomeContributors'
import { Members } from '@/components/Members'
import { i18n, type Language } from '@/lib/i18n'
import { getHomeContent } from '@/lib/home-content'

interface HomeProps {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { lang } = await params

  if (!i18n.languages.includes(lang as Language)) {
    notFound()
  }

  const content = getHomeContent(lang as Language)

  return (
    <main className="fd-default-layout">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="mx-auto max-w-6xl px-6">
          <div className="home-hero-eyebrow">
            <Sparkles className="size-3.5" />
            <span>{content.hero.eyebrow ?? 'GsCore · 一个 Python Bot 框架'}</span>
          </div>
          <h1>{content.hero.name}</h1>
          <p className="text-2xl">{content.hero.text}</p>
          <p className="tagline">{content.hero.tagline}</p>
          <div className="actions">
            {content.hero.actions.map((action) => {
              const isExternal = action.link.startsWith('http')
              const className = action.primary ? 'btn-primary' : 'btn-ghost'
              if (isExternal) {
                return (
                  <a
                    key={action.text}
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {action.text}
                    <ArrowRight className="size-4" />
                  </a>
                )
              }
              return (
                <Link key={action.text} href={`/${lang}${action.link}`} className={className}>
                  {action.text}
                  <ArrowRight className="size-4" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 features-section">
        <h2 className="features-section-title">
          {content.featuresTitle ?? '为什么选择 GsCore'}
        </h2>
        <div className="features-grid">
          {content.features.map((feature) => (
            <div key={feature.title} className="feature-card">
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
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="mx-auto max-w-6xl px-6 section-block">
        <h2 className="section-title">{content.teamTitle ?? '核心团队'}</h2>
        <Members members={content.teamMembers} />

        <h2 className="section-title" style={{ marginTop: '3rem' }}>
          <Star className="size-5 inline-block -mt-1 mr-1.5 text-fd-primary" />
          {content.contributorsTitle}
        </h2>
        <HomeContributors />

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
      </section>
    </main>
  )
}