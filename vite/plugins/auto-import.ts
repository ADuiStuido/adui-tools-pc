import type { PluginOption } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'

export default function createAutoImportPlugin(): PluginOption {
  return AutoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      {
        'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
      },
    ],
    dts: 'src/types/auto-imports.d.ts',

    eslintrc: {
      enabled: true,
    },
  })
}
