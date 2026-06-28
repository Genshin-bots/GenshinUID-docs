import { pageSchema } from 'fumadocs-core/source/schema';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkCjkFriendly from 'remark-cjk-friendly';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // 在内置 pageSchema 上扩展一个开关：
    //   sectionTitles: true → 该页所有 H2 由 `SectionTitleHeading` 渲染
    //                       （左侧浮动光团 + 磨砂玻璃渐变文字）。
    //   之所以用 H2 映射而不是另起一个 <SectionTitle> 组件：
    //     - fumadocs TOC 由 remark-heading 在构建期扫 H2/H3 节点生成，
    //       JSX 自定义组件对它是不可见的；
    //     - 用 H2 映射后 `## 标题` 仍能被 TOC 识别、保留锚点跳转，
    //       同时在视觉上获得与页头 DocsTitle 同款的浮动光团 + 渐变。
    //   默认 false——普通 H2 仍走 fumadocs-ui 的默认 <Heading as="h2"> 渲染，
    //   避免在 H2 密集的页面（如 web-console / advance/core-config）里视觉过载。
    schema: pageSchema.extend({
      sectionTitles: pageSchema.shape.full.optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    providerImportSource: '@/mdx-components',
    // CommonMark 的强调（**bold**）在 CJK 字符相邻时不生效（如 `你**【没有】**执行`）。
    // remark-cjk-friendly 把 CJK 字符当作可参与 flanking 的字符，修复中文加粗/斜体。
    remarkPlugins: (v) => [...v, remarkCjkFriendly],
  },
});
