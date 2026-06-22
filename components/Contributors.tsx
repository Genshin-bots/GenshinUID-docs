'use client'

import { useEffect, useState, type CSSProperties } from 'react'

export interface Contributor {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

interface ContributorsProps {
  /** 构建期预取的数据；为空时客户端兜底再拉一次 */
  initial: Contributor[]
  repoUrl: string
  /** "位贡献者" / "contributors" */
  label: string
  /** "在 GitHub 查看全部" */
  viewAllText: string
  /** 堆叠中最多展示多少个头像，其余折叠成 +N */
  max?: number
}

const API = 'https://api.github.com/repos/Genshin-bots/gsuid_core/contributors?per_page=40'

/**
 * 贡献者「堆叠紧凑」展示。
 * 数据优先用构建期预取（杜绝访客侧 GitHub API 限流导致的「无法加载」），
 * 为空才在客户端兜底拉取；再失败则优雅降级为一个跳转链接，绝不显示报错。
 */
export function Contributors({ initial, repoUrl, label, viewAllText, max = 18 }: ContributorsProps) {
  const [list, setList] = useState<Contributor[]>(initial)

  useEffect(() => {
    if (initial.length)
      return
    let cancelled = false
    fetch(API)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled && Array.isArray(data))
          setList(data as Contributor[])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [initial])

  const graphUrl = `${repoUrl}/graphs/contributors`

  // 优雅降级：没有任何数据时只给一个跳转，不暴露错误
  if (!list.length) {
    return (
      <div className="contrib contrib--empty">
        <a className="contrib__viewall" href={graphUrl} target="_blank" rel="noopener noreferrer">
          {viewAllText}
          <span aria-hidden>→</span>
        </a>
      </div>
    )
  }

  const people = list.filter(c => !c.login.endsWith('[bot]'))
  const shown = people.slice(0, max)
  const remaining = people.length - shown.length

  return (
    <div className="contrib">
      <div className="contrib__stack">
        {shown.map((c, i) => (
          <a
            key={c.login}
            className="contrib__item"
            style={{ '--i': i, zIndex: shown.length - i } as CSSProperties}
            href={c.html_url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${c.login} · ${c.contributions} commits`}
          >
            <img src={c.avatar_url} alt={c.login} width={56} height={56} loading="lazy" />
          </a>
        ))}
        {remaining > 0 && (
          <a
            className="contrib__more"
            style={{ '--i': shown.length } as CSSProperties}
            href={graphUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={viewAllText}
          >
            +{remaining}
          </a>
        )}
      </div>

      <a className="contrib__meta" href={graphUrl} target="_blank" rel="noopener noreferrer">
        <strong>{people.length}</strong>
        {' '}
        {label}
        <span className="contrib__dot">·</span>
        {viewAllText}
        <span aria-hidden>→</span>
      </a>
    </div>
  )
}
