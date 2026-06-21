import { cn } from '@/lib/utils'

export interface NavItem {
  id: string | number
  text: string
  desc?: string
  link: string
}

interface NavCardProps {
  navData: NavItem[]
  className?: string
}

export function NavCard({ navData, className }: NavCardProps) {
  return (
    <div className={cn('grid auto-rows-auto grid-cols-2 gap-3', className)}>
      {navData.map(item => (
        <a
          key={item.id}
          href={item.link}
          rel="noreferrer"
          target="_blank"
          className="group block"
        >
          <section className="flex h-full flex-col rounded-lg border border-solid border-fd-border/55 px-6 py-3 leading-6 transition-shadow group-hover:shadow-md">
            <span className="text-fd-muted-foreground group-hover:text-fd-foreground">
              {item.text}
            </span>
            <span className="mb-auto text-sm text-fd-muted-foreground/60 min-h-5">
              {item.desc ?? item.text}
            </span>
          </section>
        </a>
      ))}
    </div>
  )
}
