import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'

// 静态搜索：构建时生成 JSON 索引
export const revalidate = false

export const { staticGET: GET } = createFromSource(source, {
  // 默认分词
  language: 'english',
  // CJK 分词
  localeMap: {
    'zh-CN': {
      components: {
        tokenizer: {
          language: 'chinese',
        },
      } as any,
    } as any,
    ja: {
      components: {
        tokenizer: {
          language: 'japanese',
        },
      } as any,
    } as any,
  } as any,
})
