// 全局 MDX 组件注册 - 让所有 MDX 文件都可以使用自定义组件
// 与 components/mdx.tsx 共享同一清单，避免注册表漂移

import type { MDXComponents } from 'mdx/types';
import { customMdxComponents } from '@/lib/mdx-components-shared';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...customMdxComponents,
  };
}
