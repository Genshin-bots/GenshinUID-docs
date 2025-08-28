import 'uno.css'
import { inBrowser, useRoute } from 'vitepress'
import type { EnhanceAppContext, Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { nextTick, onMounted, watch } from 'vue'
import mediumZoom from 'medium-zoom'
import ChatLayout from './ChatLayout.vue'
import TestLayout from './TestLayout.vue'
import './styles/main.css'
import './styles/global.css'
import './styles/demo.css'
import './styles/utils.css'
import './styles/vars.css'
import './styles/custom-block.css'
import './styles/scrollBar.scss'

if (inBrowser)
  import('./plugins/pwa')

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.component('ChatLayout', ChatLayout)
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' }) // Should there be a new?
    }
    onMounted(() => {
      initZoom()
    })
    watch(
      () => route.path,
      () => nextTick(() => initZoom()),
    )
  },
}

export default theme
