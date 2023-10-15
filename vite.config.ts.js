import { defineConfig } from 'vite'
import vitepress from 'vitepress'

export default defineConfig({
  plugins: [vitepress()],
  build: {
    // 指定输出目录，默认为 .vitepress/dist
    outDir: 'dist',
    // 指定静态资源目录，默认为 dist/assets
    assetsDir: 'assets',
    // 指定静态资源的基础路径，默认为 /
    base: '/',
  },
})
