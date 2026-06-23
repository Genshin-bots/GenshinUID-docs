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
}

const API = 'https://api.github.com/repos/Genshin-bots/gsuid_core/contributors?per_page=100'

/** 每行堆叠几个头像——24 个，溢出换行 */
const ROW_SIZE = 24

/**
 * 贡献者「堆叠紧凑 · 多行」展示。
 * 保留原 VitePress 风的「重叠圆形」堆叠样式，一行 24 个，
 * 多余的换到下一行继续堆叠，展示**全部**贡献者（不再 +N 折叠）。
 *
 * 数据优先用构建期预取（杜绝访客侧 GitHub API 限流导致的「无法加载」），
 * 为空才在客户端兜底拉取；再失败则优雅降级为一个跳转链接，绝不显示报错。
 */
export function Contributors({ initial, repoUrl, label, viewAllText }: ContributorsProps) {
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

  // 按 ROW_SIZE 切片，每片即一行
  const rows: Contributor[][] = []
  for (let i = 0; i < people.length; i += ROW_SIZE) {
    rows.push(people.slice(i, i + ROW_SIZE))
  }

  return (
    <div className="contrib">
      <div className="contrib__rows">
        {rows.map((row, rowIndex) => (
          // 每一行独立堆叠：从新一行开始重置 margin-left，避免重叠把首项顶出容器
          <div key={rowIndex} className="contrib__stack">
            {row.map((c, i) => (
              <a
                key={c.login}
                className="contrib__item"
                style={{ '--i': i, zIndex: ROW_SIZE - i } as CSSProperties}
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${c.login} · ${c.contributions} commits`}
              >
                <img src={c.avatar_url} alt={c.login} width={52} height={52} loading="lazy" />
              </a>
            ))}
          </div>
        ))}
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