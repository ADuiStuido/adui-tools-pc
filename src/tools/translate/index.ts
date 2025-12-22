import type { ToolPlugin } from '@/core/toolkit/tool.types.ts'
import routes from '@/tools/translate/routes.ts'

const plugin: ToolPlugin = {
  meta: {
    id: 'translate',
    name: '翻译',
    icon: 'translate',
    order: 2,
  },
  routes,
}

export default plugin
