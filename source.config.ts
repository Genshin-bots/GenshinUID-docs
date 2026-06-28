import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkCjkFriendly from 'remark-cjk-friendly';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    providerImportSource: '@/mdx-components',
    // CommonMark 的强调（**bold**）在 CJK 字符相邻时不生效（如 `你**【没有】**执行`）。
    // remark-cjk-friendly 把 CJK 字符当作可参与 flanking 的字符，修复中文加粗/斜体。
    remarkPlugins: (v) => [...v, remarkCjkFriendly],
  },
});
