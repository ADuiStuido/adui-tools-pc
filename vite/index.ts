import type { PluginOption } from 'vite'
import createVuePlugin from './plugins/vue'
import createAutoImportPlugin from './plugins/auto-import'
import createComponentsPlugin from './plugins/components'
import createHTMLPlugin from './plugins/html'
import createUnocss from './plugins/unocss'

export default function createVitePlugin(env: Record<string, string>): PluginOption[] {
  return [
    createVuePlugin(),
    createAutoImportPlugin(),
    createComponentsPlugin(),
    createHTMLPlugin(env),
    createUnocss(),
  ]
}
