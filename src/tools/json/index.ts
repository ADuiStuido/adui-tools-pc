import type { ToolPlugin } from '@/core/toolkit/tool.types.ts'
import routes from '@/tools/json/routes.ts'

const plugin: ToolPlugin = {
  meta: {
    id: 'json',
    name: 'JSON',
    icon: 'json',
    order: 1,
  },
  routes,
}

export default plugin
