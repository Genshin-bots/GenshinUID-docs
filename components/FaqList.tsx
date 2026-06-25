'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, CircleHelp, MessagesSquare, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 常见问题列表（FaqList）
 *
 * 设计要点：
 * · 每条 Q&A = 独立可折叠卡片（默认收起），点击展开/收起，互不影响。
 * · 顶部 toolbar：左侧「共 N 个问题」+ 搜索时的「找到 N 个匹配」计数；
 *   右侧搜索框（带 lucide Search icon + 有内容时显示 X 清除按钮）。
 * · 搜索：实时过滤 + 关键词高亮（`<mark>`）；匹配字段 = 问题文本 + 可选
 *   `keywords` 字段，命中即显示、否则隐藏；空查询时显示全部。
 * · 平滑高度过渡：CSS `grid-template-rows: 0fr → 1fr` 自动测量真实高度，
 *   不需要写死 max-height，也不需要 framer-motion。
 * · 玻璃质感：背景走 `var(--fd-glass-bg-strong)` + `backdrop-filter: blur + saturate`，
 *   与项目里其它卡片（`.fd-plugin-card` / `.fd-chatpanel`）同套玻璃变量。
 * · 配色 / 语义色全部来自 `--color-fd-*`，无任何硬编码颜色，跟随主题与浅/深色。
 * · 左侧 3px 渐变条只在展开时显示，呼应项目里「章节标题渐变 + glass-popover」的
 *   设计语言；带 `tag` 的条目展开时渐变色随 tag 切换。
 *
 * a11y：搜索框 `aria-label`、问题按钮 `aria-expanded` + `aria-controls`
 * 指向对应 body；body 容器带 `id` + `role="region"`。
 */

export type FaqTag = 'info' | 'tip' | 'warning' | 'danger'

export interface FaqItem {
  /** 问题文本（必填，也是搜索的主要匹配字段） */
  q: string
  /** 答案内容（任意 ReactNode：可放链接 / 行内 code / 列表 / 段落） */
  a: ReactNode
  /** 语义色：决定展开后左侧渐变条 + 头部小徽章颜色（可选） */
  tag?: FaqTag
  /** 自定义徽章文字（不填则用 tag 默认名，如 'warning' → '注意'） */
  tagText?: string
  /** 额外的可搜索关键词，命中时也算匹配（不显示在 UI 上） */
  keywords?: string
}

interface FaqListProps {
  items: FaqItem[]
  /** 搜索框占位文案 */
  searchPlaceholder?: string
}

const DEFAULT_TAG_TEXT: Record<FaqTag, string> = {
  info: '说明',
  tip: '已解决',
  warning: '注意',
  danger: '暂未解决',
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 把命中的查询片段包成 <mark>，其余部分用普通 span 包裹。
 * - 命中判定忽略大小写
 * - 多次匹配都高亮
 * - 空查询 / 仅空白时原样返回
 */
function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim()
  if (!q) return text
  // 拆分时保留分隔符：用捕获组 + split，分隔符（命中段）会出现在结果数组中
  const re = new RegExp(`(${escapeRegExp(q)})`, 'gi')
  const parts = text.split(re)
  const lowerQ = q.toLowerCase()
  return parts.map((part, i) =>
    part.toLowerCase() === lowerQ ? (
      <mark key={i} className="fd-faq-highlight">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export function FaqList({
  items,
  searchPlaceholder = '搜索常见问题…',
}: FaqListProps) {
  const [query, setQuery] = useState('')
  // 默认全部展开：用 Set 记录展开条目的原始索引，允许多个同时展开。
  // FAQ 内容本身就是常见问题的解答，默认全展开能让用户一眼看到全部答案。
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(items.map((_, i) => i)),
  )

  // 过滤结果：query 为空时显示全部；否则按 question + keywords 模糊匹配
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return items.map((item, idx) => ({ item, originalIndex: idx }))
    }
    return items
      .map((item, idx) => ({ item, originalIndex: idx }))
      .filter(({ item }) => {
        const haystack = `${item.q}\n${item.keywords ?? ''}`.toLowerCase()
        return haystack.includes(q)
      })
  }, [items, query])

  const isFiltering = query.trim().length > 0

  const toggle = (originalIndex: number) => {
    setOpenSet(prev => {
      const next = new Set(prev)
      if (next.has(originalIndex)) next.delete(originalIndex)
      else next.add(originalIndex)
      return next
    })
  }

  const clearSearch = () => setQuery('')

  return (
    <div className="fd-faq">
      {/* 顶部工具栏：左侧统计 / 右侧搜索 */}
      <div className="fd-faq-toolbar">
        <div className="fd-faq-toolbar-info">
          <CircleHelp className="h-4 w-4" aria-hidden />
          <span>共 {items.length} 个常见问题</span>
          {isFiltering && (
            <span className="fd-faq-toolbar-count">
              找到 {filtered.length} 个匹配
            </span>
          )}
        </div>
        <div className="fd-faq-search" role="search">
          <Search className="fd-faq-search__icon" aria-hidden />
          <input
            type="text"
            className="fd-faq-search__input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="搜索常见问题"
          />
          {query && (
            <button
              type="button"
              className="fd-faq-search__clear"
              onClick={clearSearch}
              aria-label="清除搜索"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 列表 / 空状态 */}
      {filtered.length === 0 ? (
        <div className="fd-faq-empty" role="status">
          <MessagesSquare className="h-8 w-8" aria-hidden />
          <p>
            没有找到匹配 "<strong>{query}</strong>" 的问题
          </p>
          <button
            type="button"
            className="fd-faq-empty__reset"
            onClick={clearSearch}
          >
            清除搜索
          </button>
        </div>
      ) : (
        <div className="fd-faq-list">
          {filtered.map(({ item, originalIndex }) => {
            const isOpen = openSet.has(originalIndex)
            const bodyId = `fd-faq-body-${originalIndex}`
            const tagText = item.tagText ?? (item.tag ? DEFAULT_TAG_TEXT[item.tag] : undefined)
            return (
              <div
                key={originalIndex}
                className={cn(
                  'fd-faq-item',
                  isOpen && 'is-open',
                  item.tag && `is-tag-${item.tag}`,
                )}
                data-state={isOpen ? 'open' : 'closed'}
              >
                <button
                  type="button"
                  className="fd-faq-question"
                  onClick={() => toggle(originalIndex)}
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                >
                  <span className="fd-faq-q-prefix" aria-hidden>
                    Q
                  </span>
                  <span className="fd-faq-q-text">
                    {highlightMatch(item.q, query)}
                  </span>
                  {tagText && item.tag && (
                    <span
                      className={cn('fd-faq-tag', `fd-faq-tag--${item.tag}`)}
                    >
                      {tagText}
                    </span>
                  )}
                  <ChevronDown className="fd-faq-chevron" aria-hidden />
                </button>
                <div
                  className="fd-faq-body"
                  id={bodyId}
                  role="region"
                  aria-hidden={!isOpen}
                >
                  <div className="fd-faq-answer">
                    <span className="fd-faq-a-prefix" aria-hidden>
                      A
                    </span>
                    <div className="fd-faq-a-content">{item.a}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
