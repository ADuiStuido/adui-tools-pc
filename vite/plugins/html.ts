import type { PluginOption } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'

export default function createHTMLPlugin(env: Record<string, string>): PluginOption {
  return createHtmlPlugin({
    minify: true,
    inject: {
      data: {
        title: env.VITE_APP_TITLE,
      },
    },
  })
}
