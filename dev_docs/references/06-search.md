# 六、搜索

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[五、i18n](./05-i18n.md) · **下一章**：[七、已知坑](./07-pitfalls.md)

搜索是**纯静态 Orama**：构建期把所有文档烤成一个 JSON 索引，浏览器下载后在本地查询（无后端）。
中文 / 日文需要**专用分词器**，这是最容易出问题的地方。本章讲它怎么工作、怎么改、踩过哪些坑。

## 6.1 两端 + 必须一致的分词器

| 端 | 文件 | 干什么 |
|----|------|--------|
| 服务端（构建期建索引） | `app/api/search/route.ts` | `createFromSource(source, { localeMap })` 导出 `staticGET`，生成 `out/api/search`（一个大 JSON） |
| 客户端（运行期查询） | `components/SearchDialog.tsx` | `oramaStaticClient({ from:'/api/search', locale, initOrama })` 下载索引并本地查询 |
| 接线 | `components/Providers.tsx` | `RootProvider search={{ SearchDialog: 自定义弹窗 }}` |

> **铁律：建索引的分词器与查询的分词器必须完全一致**，否则同一个词被切成不同 token，搜不到。
> zh-CN 两端都用 `@orama/tokenizers/mandarin`，ja 用 `/japanese`，en 用 `'english'`。

## 6.2 服务端：`app/api/search/route.ts`

```ts
export const { staticGET: GET } = createFromSource(source, {
  localeMap: {
    'zh-CN': { components: { tokenizer: createMandarinTokenizer() } },
    ja:      { components: { tokenizer: createJapaneseTokenizer() } },
    en:      'english',
  },
})
```

## 6.3 客户端：自定义搜索弹窗

**为什么要自定义**：Fumadocs 默认搜索弹窗的 static client **不支持自定义分词器 / `initOrama`**，
所以中文搜不到。官方建议自行重建弹窗（https://fumadocs.dev/docs/search/orama）。

`components/SearchDialog.tsx` 关键点：

```ts
async function initOrama(locale) {
  if (locale === 'zh-CN') {
    const { createTokenizer } = await import('@orama/tokenizers/mandarin')
    return create({ schema: { _: 'string' }, components: { tokenizer: createTokenizer() } })
  }
  if (locale === 'ja') { /* 同理 japanese */ }
  return create({ schema: { _: 'string' }, language: 'english' })
}

const client = oramaStaticClient({ from: '/api/search', locale, initOrama })
const { search, setSearch, query } = useDocsSearch({ client })
// 用 SearchDialog* 原语拼出弹窗，<SearchDialogList items={query.data !== 'empty' ? query.data : null} />
```

**为什么放在 client 包裹（`Providers.tsx`）**：`initOrama` 是函数，无法从 server component
跨 RSC 边界传给 `RootProvider`，所以 `RootProvider` 整体下沉到 client 组件 `Providers.tsx` 里。

## 6.4 关键参数：不要设 `threshold: 0`

- Orama `threshold`：`0` = 要求查询的**所有 token 都命中**（AND）；越大越偏 OR（召回多）。
- 对中文这种会被切成多 token 的查询，`threshold: 0` 太苛刻——多词查询（如"如何编写插件"）会**直接 0 结果**。
- **现状：不传 `search` 选项，用 Fumadocs 默认**（有排序的召回）。具体词（"网页控制台"/"触发器"）
  排第一，多词查询也有结果。改这里前先用 §6.6 的脚本回归测试。

## 6.5 代码块内容搜不到（预期行为）

Fumadocs 索引**只收标题与正文，不收代码块**。所以只出现在 ```` ``` ```` 代码示例里的词
（例如某条 `bot.send('开始多步会话测试')` 里的"多步会话"）**搜不到是正常的**，不是分词器坏了。
要让它可搜，就把该词也写进正文 / 标题。

## 6.6 怎么验证搜索（无界面回归）

构建后起静态服务器，用 Node 直接跑真实 client：

```js
// 放在项目根目录跑（要能解析 node_modules）
import { create } from '@orama/orama'
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static'
async function initOrama(locale){ /* 同 SearchDialog.tsx */ }
const client = oramaStaticClient({ from:'http://localhost:PORT/api/search', locale:'zh-CN', initOrama })
console.log((await client.search('触发器')).length)   // 期望 > 0
```

> 索引体积参考：英文分词约 7.9MB，换中文分词后约 10.8MB（中文切词更多 token，正常）。

## 6.7 排错速查

| 现象 | 多半原因 |
|------|---------|
| `items?.map is not a function` | 用了默认 fetch client 拿到的是整份索引而非结果数组——必须用 static client |
| 中文搜啥都 0 结果 | 两端分词器不一致 / 仍是 english 分词 |
| 多词中文查询 0 结果 | 设了 `threshold: 0`，去掉 |
| 某个词搜不到但它"明明有" | 它只在代码块里（§6.5） |
| 新语言搜不到 | 没在 route.ts + SearchDialog.tsx 配该 locale 的分词器 |
