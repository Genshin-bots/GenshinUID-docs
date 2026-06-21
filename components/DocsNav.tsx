'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Languages, Moon, Sun, Search, Github, ChevronDown, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { useSearchContext } from 'fumadocs-ui/contexts/search'
import { useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar'
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
  const [mounted, setMounted] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const { setOpenSearch } = useSearchContext()
  const { setOpen: setSidebarOpen } = useSidebar()

  // Hydration safety
  useEffect(() => setMounted(true), [])

  // Click outside closes menus
  useEffect(() => {
    if (!openMenu) return
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openMenu])

  const version = packageJson.version
  const navItems = getNavItems(lang)
  const versionItems = getVersionNavItems(version, lang)
  const languageOptions = getLanguageOptions()

  const toggle = (key: string) => setOpenMenu(openMenu === key ? null : key)
  const close = () => setOpenMenu(null)

  return (
    <header className="glass-header">
      <div
        ref={navRef}
        className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8 max-w-[96rem] mx-auto"
      >
        {/* Mobile sidebar trigger */}
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground transition-colors"
          aria-label="打开侧边栏"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link
          href={`/${lang}/`}
          className="group flex items-center gap-2.5 font-semibold text-fd-foreground shrink-0"
        >
          <img
            src="/favicon.ico"
            alt=""
            className="h-7 w-7 shrink-0 transition-transform group-hover:scale-105"
          />
          <span className="hidden sm:inline-block tracking-tight">早柚核心Docs</span>
        </Link>

        {/* Nav Items */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5 min-w-0">
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              <button
                type="button"
                onClick={() => toggle(item.label)}
                className={cn(
                  'flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors',
                  'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
                  openMenu === item.label && 'bg-fd-accent text-fd-foreground',
                )}
              >
                <span className="truncate max-w-[12rem]">{item.label}</span>
                <ChevronDown
                  className={cn(
                    'size-3.5 transition-transform duration-200',
                    openMenu === item.label && 'rotate-180',
                  )}
                />
              </button>
              {openMenu === item.label && item.items && (
                <div
                  className="absolute left-0 top-full mt-1.5 min-w-[220px] rounded-lg border border-fd-border bg-fd-popover/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2"
                  style={{ animationDuration: '150ms' }}
                >
                  {item.items.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      target={sub.external ? '_blank' : undefined}
                      rel={sub.external ? 'noopener noreferrer' : undefined}
                      onClick={close}
                      className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors',
                        'text-fd-foreground hover:bg-fd-accent',
                        pathname === sub.href && 'bg-fd-accent font-medium',
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Version dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle('version')}
              className={cn(
                'flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors',
                'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
                openMenu === 'version' && 'bg-fd-accent text-fd-foreground',
              )}
            >
              v{version}
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  openMenu === 'version' && 'rotate-180',
                )}
              />
            </button>
            {openMenu === 'version' && (
              <div
                className="absolute right-0 top-full mt-1.5 min-w-[200px] rounded-lg border border-fd-border bg-fd-popover/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2"
                style={{ animationDuration: '150ms' }}
              >
                {versionItems.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    target={sub.external ? '_blank' : undefined}
                    rel={sub.external ? 'noopener noreferrer' : undefined}
                    onClick={close}
                    className="block rounded-md px-3 py-2 text-sm text-fd-foreground hover:bg-fd-accent transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setOpenSearch(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground transition-colors"
            aria-label="搜索"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">搜索</span>
            <kbd className="hidden md:inline-flex h-5 items-center rounded border border-fd-border bg-fd-muted/50 px-1.5 text-[10px] font-mono text-fd-muted-foreground">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground transition-colors"
            aria-label="切换主题"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle('lang')}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors',
                'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground',
                openMenu === 'lang' && 'bg-fd-accent text-fd-foreground',
              )}
              aria-label="切换语言"
            >
              <Languages className="h-4 w-4" />
            </button>
            {openMenu === 'lang' && (
              <div
                className="absolute right-0 top-full mt-1.5 min-w-[160px] rounded-lg border border-fd-border bg-fd-popover/95 backdrop-blur-md p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2"
                style={{ animationDuration: '150ms' }}
              >
                {languageOptions.map((opt) => (
                  <Link
                    key={opt.code}
                    href={opt.href(pathname)}
                    onClick={close}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                      'text-fd-foreground hover:bg-fd-accent',
                      lang === opt.code && 'bg-fd-accent font-medium',
                    )}
                  >
                    {opt.name}
                    {lang === opt.code && (
                      <span className="size-1.5 rounded-full bg-fd-primary" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="https://github.com/Genshin-bots/GenshinUID-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}