import type { PluginOption } from 'vite'
import UnoCSS from 'unocss/vite'

export default function createUnocss(): PluginOption {
  return UnoCSS()
}
