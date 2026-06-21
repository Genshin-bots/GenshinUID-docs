import { loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/plugins/lucide-icons'
import { i18n } from '@/lib/i18n'
import { docs } from 'collections/server'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [lucideIconsPlugin()],
})