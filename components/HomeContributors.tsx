'use client'

import { useEffect, useState } from 'react'

interface Contributor {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export function HomeContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadContributors() {
      try {
        const res = await fetch('https://api.github.com/repos/Genshin-bots/gsuid_core/contributors?per_page=30')
        if (!res.ok) throw new Error('Failed to fetch contributors')
        const data = await res.json()
        setContributors(data)
      }
      catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
      finally {
        setLoading(false)
      }
    }
    loadContributors()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2em', textAlign: 'center', color: 'var(--color-fd-muted-foreground)' }}>
        加载中…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2em', textAlign: 'center', color: 'var(--color-fd-muted-foreground)' }}>
        无法加载贡献者列表
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1em',
        marginTop: '1em',
      }}
    >
      {contributors.map(contributor => (
        <a
          key={contributor.login}
          href={contributor.html_url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${contributor.login} (${contributor.contributions} contributions)`}
          style={{
            display: 'block',
            transition: 'transform 0.2s',
          }}
        >
          <img
            src={contributor.avatar_url}
            alt={contributor.login}
            width={64}
            height={64}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid var(--color-fd-border)',
            }}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  )
}
