import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'
import '@/lib/mdx-globals'

// 静态搜索：构建时生成 JSON 索引
export const revalidate = false

// 使用默认 english 分词（覆盖 CJK 语言的默认 tokenizer）
export const { staticGET: GET } = createFromSource(source, {
  localeMap: {
    'zh-CN': 'english',
    en: 'english',
    ja: 'english',
  },
})
