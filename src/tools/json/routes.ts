import type { RouteRecordRaw } from 'vue-router'
import ToolsLayout from '@/app/layout/ToolsLayout.vue'

const routes = (): RouteRecordRaw[] => [
  {
    path: 'json',
    name: 'tool.json',
    component: ToolsLayout,
    redirect: { name: 'tool.json-parsing' },
    children: [
      {
        path: 'json-parsing',
        name: 'tool.json-parsing',
        meta: {
          toolId: 'json',
          title: 'Json 解析',
        },
        component: () => import('@/tools/json/pages/JsonParsing.vue'),
      },
      {
        path: 'json-editor',
        name: 'tool.json-editor',
        meta: {
          toolId: 'json',
          title: 'Json 编辑器',
        },
        component: () => import('@/tools/json/pages/JsonEditor.vue'),
      },
    ],
  },
]

export default routes
