'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Languages, Moon, Sun, Search, Github } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import type { Language } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { getNavItems, getVersionNavItems, getLanguageOptions } from '@/lib/nav-config'
import packageJson from '@/package.json'

interface DocsNavProps {
  lang: Language
}

export function DocsNav({ lang }: DocsNavProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const version = packageJson.version

  const navItems = getNavItems(lang)
  const versionItems = getVersionNavItems(version, lang)
  const languageOptions = getLanguageOptions()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-fd-border bg-fd-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6 max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link
          href={`/${lang}/`}
          className="flex items-center gap-2 font-semibold text-fd-foreground"
        >
          <img src="/favicon.ico" alt="Logo" className="h-7 w-7" />
          <span className="hidden sm:inline-block">早柚核心Docs</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-1 items-center justify-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(item.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button
                type="button"
                className={cn(
                  'flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium',
                  'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
                  'transition-colors',
                )}
              >
                {item.label}
              </button>
              {openMenu === item.label && item.items && (
                <div className="absolute left-0 top-full pt-1">
                  <div className="min-w-[200px] rounded-md border border-fd-border bg-fd-popover p-1 shadow-lg">
                    {item.items.map(sub => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        target={sub.external ? '_blank' : undefined}
                        rel={sub.external ? 'noopener noreferrer' : undefined}
                        className={cn(
                          'block rounded-sm px-3 py-2 text-sm',
                          'text-fd-foreground hover:bg-fd-accent',
                          pathname === sub.href && 'bg-fd-accent',
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Version dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu('version')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              className={cn(
                'flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium',
                'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
                'transition-colors',
              )}
            >
              v{version}
            </button>
            {openMenu === 'version' && (
              <div className="absolute right-0 top-full pt-1">
                <div className="min-w-[200px] rounded-md border border-fd-border bg-fd-popover p-1 shadow-lg">
                  {versionItems.map(sub => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      target={sub.external ? '_blank' : undefined}
                      rel={sub.external ? 'noopener noreferrer' : undefined}
                      className="block rounded-sm px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right side: Search, Theme, Language, GitHub */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground md:w-auto md:gap-2 md:px-3"
            aria-label="搜索"
            onClick={() => {
              // 触发搜索对话框 - Fumadocs SearchDialog 自带
              const event = new CustomEvent('open-fd-search')
              window.dispatchEvent(event)
            }}
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline text-sm">搜索</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
            aria-label="切换主题"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
              aria-label="切换语言"
            >
              <Languages className="h-4 w-4" />
            </button>
            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 top-full z-40 pt-1">
                  <div className="min-w-[140px] rounded-md border border-fd-border bg-fd-popover p-1 shadow-lg">
                    {languageOptions.map(opt => (
                      <Link
                        key={opt.code}
                        href={opt.href(pathname)}
                        className={cn(
                          'block rounded-sm px-3 py-2 text-sm',
                          'text-fd-foreground hover:bg-fd-accent',
                          lang === opt.code && 'bg-fd-accent',
                        )}
                      >
                        {opt.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Link
            href="https://github.com/Genshin-bots/GenshinUID-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
