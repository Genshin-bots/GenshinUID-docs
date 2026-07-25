// 将 MDX 使用的组件注册为全局变量
// 与 components/mdx.tsx 共享同一清单

import { customMdxComponents } from '@/lib/mdx-components-shared';

if (typeof globalThis !== 'undefined') {
  for (const [name, component] of Object.entries(customMdxComponents)) {
    (globalThis as Record<string, unknown>)[name] = component;
  }
}
