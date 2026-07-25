import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { SectionTitleHeading } from '@/components/SectionTitleHeading';
import { customMdxComponents } from '@/lib/mdx-components-shared';

interface MDXComponentOptions {
  /**
   * 是否将该页所有 H2 渲染为「带浮动光团 + 渐变文字」的
   * `<SectionTitleHeading />`。详见 `components/SectionTitleHeading.tsx`。
   * 默认 false——普通页面继续走 fumadocs-ui 的默认 <Heading as="h2">，
   * 避免在 H2 密集的页面里视觉过载。
   * 由 page.tsx 从 frontmatter `sectionTitles` 字段透传过来。
   */
  sectionTitles?: boolean;
}

/**
 * MDX 组件映射：将自定义组件注册到 MDX
 *
 * - `h1`: 已在 banner 中通过 DocsTitle 渲染，MDX 内首个 h1 不再显示
 * - `h2`: 当 `options.sectionTitles === true` 时，映射到 SectionTitleHeading
 */
export function getMDXComponents(
  components?: MDXComponents,
  options: MDXComponentOptions = {},
): MDXComponents {
  const h2 = options.sectionTitles
    ? SectionTitleHeading
    : defaultMdxComponents.h2;

  return {
    ...defaultMdxComponents,
    h1: () => null,
    h2,
    ...customMdxComponents,
    ...components,
  };
}
