import type { PluginOption } from 'vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import * as path from 'node:path'

export default function createSvgIconPlugin(): PluginOption {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/svg/icons')],
    symbolId: 'icon-[dir]-[name]',
    customDomId: '__svg__icons__dom__',
  })
}
