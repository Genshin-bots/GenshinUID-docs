'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import * as LucideIcons from 'lucide-react';
import {
  ChevronDown,
  Github,
  Languages,
  type LucideIcon,
  Menu,
  Moon,
  Package,
  Search,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import type { Language } from '@/lib/i18n';
import {
  getLanguageOptions,
  getNavItems,
  getVersionNavItems,
} from '@/lib/nav-config';
import { cn } from '@/lib/utils';
import packageJson from '@/package.json';

interface DocsNavProps {
  lang: Language;
}

/**
 * 顶部导航：3 个下拉按钮 + 右侧主题 / 语言 / GitHub。
 *
 * 设计：
 * · 三个主按钮（Quick Start / Plugin Series / Version）均带 lucide 彩色 icon。
 *   颜色直接通过 inline `style={{ color }}` 写到 svg 上（不是 CSS 变量继承）——
 *   之前用变量继承被父级 `text-fd-muted-foreground` 等高优先级规则覆盖，
 *   icon 全显示成灰色。inline style 在所有 utility class 之上，稳。
 * · 下拉面板用 `.glass-popover` 玻璃质感，与 `.glass-header` 共享同一组玻璃变量，
 *   但**显式把透明度从 28% 压到 5% 以下**——28% 在浅色页面上几乎"看不见"。
 * · 下拉子项按 6 色板循环（与侧边栏 folder / leaf 共享色板）。
 * · 全部 icon 都来自 `lucide-react` 命名导出，**先** `node -e "console.log('<NAME>' in require('lucide-react').icons)"`
 *   校验过再写进 nav-config（坑 #19）。
 */
export function DocsNav({ lang }: DocsNavProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { setOpenSearch } = useSearchContext();
  const { setOpen: setSidebarOpen } = useSidebar();

  // Hydration safety
  useEffect(() => setMounted(true), []);

  // Click outside closes menus
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openMenu]);

  const version = packageJson.version;
  const navItems = getNavItems(lang);
  const versionItems = getVersionNavItems(version, lang);
  const languageOptions = getLanguageOptions();
  const isDark = mounted && theme === 'dark';

  const toggle = (key: string) => setOpenMenu(openMenu === key ? null : key);
  const close = () => setOpenMenu(null);

  /**
   * 根据字符串名取 lucide icon。空 / 找不到时返回 null，调用方自行 fallback。
   * 字符串来源是 `nav-config.ts` 的 `icon` 字段，已在 SKILL 文档要求做存在性校验。
   */
  const getIcon = (name?: string): LucideIcon | null => {
    if (!name) return null;
    const Icon = (
      LucideIcons as unknown as Record<string, LucideIcon | undefined>
    )[name];
    return Icon ?? null;
  };

  /**
   * 浅 / 暗色各一个 oklch 颜色。inline style 直接写进 svg 的 `color` 属性，
   * 优先级高于任何 utility class。
   */
  const pickColor = (color: string, colorDark: string) =>
    isDark ? colorDark : color;

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
          <span className="hidden sm:inline-block tracking-tight">
            早柚核心Docs
          </span>
        </Link>

        {/* Nav Items */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5 min-w-0">
          {navItems.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => toggle(item.label)}
                  className={cn(
                    'nav-trigger flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                    'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
                    openMenu === item.label &&
                      'bg-fd-accent text-fd-foreground',
                  )}
                >
                  {Icon && (
                    <Icon
                      className="nav-trigger__icon size-4 shrink-0"
                      style={{ color: pickColor(item.color, item.colorDark) }}
                      aria-hidden
                    />
                  )}
                  <span className="truncate max-w-[12rem]">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform duration-200',
                      openMenu === item.label && 'rotate-180',
                    )}
                  />
                </button>
                {openMenu === item.label && item.items && (
                  // 三个主按钮的 popover 全部靠左展开：popover 左边缘对齐按钮左边缘，
                  // popover 从左向右展开。`left-0` 是定位属性（不是 transform），
                  // 不与 animate-in 的 keyframe `transform: translate3d(...)` 冲突，
                  // 保持 flat 结构即可。
                  // 整块走 Tailwind 默认 150ms 的 fade+slide-in-from-top-3；
                  // 子项 stagger 由 `.nav-link` 的 navLinkEnter 动画 + `--i` 注入驱动。
                  <div className="glass-popover absolute left-0 top-full mt-1.5 min-w-[240px] p-1.5 animate-in fade-in slide-in-from-top-3">
                    {item.items.map((sub, i) => {
                      const SubIcon = getIcon(sub.icon);
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          target={sub.external ? '_blank' : undefined}
                          rel={sub.external ? 'noopener noreferrer' : undefined}
                          onClick={close}
                          style={{ '--i': i } as CSSProperties}
                          className={cn(
                            'nav-link group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                            'text-fd-foreground hover:bg-fd-accent',
                            pathname === sub.href && 'bg-fd-accent font-medium',
                          )}
                        >
                          {SubIcon && (
                            <SubIcon
                              className="nav-link__icon size-4 shrink-0"
                              style={{
                                color: pickColor(sub.color, sub.colorDark),
                              }}
                              aria-hidden
                            />
                          )}
                          <span className="flex-1 truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Version dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle('version')}
              className={cn(
                'nav-trigger flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                'text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent',
                openMenu === 'version' && 'bg-fd-accent text-fd-foreground',
              )}
            >
              <Package
                className="nav-trigger__icon size-4 shrink-0"
                style={{
                  color: isDark
                    ? 'oklch(0.74 0.16 250)'
                    : 'oklch(0.58 0.18 250)',
                }}
                aria-hidden
              />
              <span>v{version}</span>
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  openMenu === 'version' && 'rotate-180',
                )}
              />
            </button>
            {openMenu === 'version' && (
              // 三个主按钮的 popover 全部统一为靠左展开（见上面 map 块内的注释）。
              <div className="glass-popover absolute left-0 top-full mt-1.5 min-w-[220px] p-1.5 animate-in fade-in slide-in-from-top-3">
                {versionItems.map((sub, i) => {
                  const SubIcon = getIcon(sub.icon);
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      target={sub.external ? '_blank' : undefined}
                      rel={sub.external ? 'noopener noreferrer' : undefined}
                      onClick={close}
                      style={{ '--i': i } as CSSProperties}
                      className="nav-link group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fd-foreground hover:bg-fd-accent transition-colors"
                    >
                      {SubIcon && (
                        <SubIcon
                          className="nav-link__icon size-4 shrink-0"
                          style={{ color: pickColor(sub.color, sub.colorDark) }}
                          aria-hidden
                        />
                      )}
                      <span className="flex-1 truncate">{sub.label}</span>
                    </Link>
                  );
                })}
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
              <div className="glass-popover absolute right-0 top-full mt-1.5 min-w-[160px] p-1.5 animate-in fade-in slide-in-from-top-3">
                {languageOptions.map((opt, i) => (
                  <Link
                    key={opt.code}
                    href={opt.href(pathname)}
                    onClick={close}
                    style={{ '--i': i } as CSSProperties}
                    className={cn(
                      'nav-link flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
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
  );
}
