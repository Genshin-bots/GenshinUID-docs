import Link from 'next/link'
import { notFound } from 'next/navigation'
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
        <div className="mx-auto max-w-4xl px-4">
          <h1>{content.hero.name}</h1>
          <p className="text-2xl font-semibold text-fd-foreground/80 mb-2">{content.hero.text}</p>
          <p className="tagline">{content.hero.tagline}</p>
          <div className="actions">
            {content.hero.actions.map((action) => {
              const isExternal = action.link.startsWith('http')
              if (isExternal) {
                return (
                  <a
                    key={action.text}
                    href={action.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    {action.text}
                  </a>
                )
              }
              return (
                <Link
                  key={action.text}
                  href={`/${lang}${action.link}`}
                  className="inline-flex items-center justify-center rounded-md border border-fd-border bg-fd-background px-5 py-2.5 text-sm font-medium text-fd-foreground hover:bg-fd-accent transition-colors"
                >
                  {action.text}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="features-grid">
          {content.features.map(feature => (
            <div key={feature.title} className="feature-card">
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.details}</p>
              {feature.link && (
                <Link
                  href={feature.link.startsWith('http') ? feature.link : `/${lang}${feature.link}`}
                  target={feature.link.startsWith('http') ? '_blank' : undefined}
                  rel={feature.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {feature.linkText || '了解更多 →'}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="mx-auto max-w-6xl px-4">
          <Members members={content.teamMembers} />

          <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '2em 0 0.5em 0' }}>
            {content.contributorsTitle}
          </h2>
          <HomeContributors />

          <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '2em 0 1em 0' }}>
            {content.supportTitle}
          </h2>

          <div style={{ marginTop: '2em', display: 'flex', justifyContent: 'center', gap: '1.5em', flexWrap: 'wrap' }}>
            {content.supportLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  fontSize: '1.1em',
                  padding: '0.75em 1.5em',
                  border: '1px solid var(--color-fd-border)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--color-fd-foreground)',
                }}
              >
                <span style={{ fontSize: '1.5em' }}>{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
