import { FileText, Clock } from 'lucide-react'

interface PageInfoProps {
  readTime: string
  words: string
}

export function PageInfo({ readTime, words }: PageInfoProps) {
  return (
    <div className="mt-6 max-w-[85%]">
      <section className="flex flex-wrap gap-3 border-b border-fd-border pb-3 mb-3 w-full">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          字数统计:<span>{words} 字</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          阅读时长:<span>{readTime} 分钟</span>
        </div>
      </section>
    </div>
  )
}
