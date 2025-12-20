import type { PluginOption } from 'vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default function createComponentsPlugin(): PluginOption {
  return Components({
    dirs: ['src/components'],
    extensions: ['vue', 'tsx'],
    dts: 'src/types/components.d.ts',
    resolvers: [NaiveUiResolver()],
  })
}
