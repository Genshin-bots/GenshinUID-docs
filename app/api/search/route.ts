import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin'
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese'
import '@/lib/mdx-globals'

// 静态搜索：构建时生成 JSON 索引
export const revalidate = false

// CJK 需要专用分词器，否则中文/日文整段被当成一个 token，搜不到任何东西。
// 服务端（建索引）与客户端（分词查询）必须使用同一套分词器，详见 lib/search-config.ts。
export const { staticGET: GET } = createFromSource(source, {
  localeMap: {
    'zh-CN': { components: { tokenizer: createMandarinTokenizer() } },
    ja: { components: { tokenizer: createJapaneseTokenizer() } },
    en: 'english',
  },
})
