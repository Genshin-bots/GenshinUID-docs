// Next.js 会在启动时执行此文件
// 用于在所有模块加载前设置全局 MDX 组件

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/mdx-globals')
  }
}
