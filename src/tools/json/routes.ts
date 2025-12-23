import type { RouteRecordRaw } from 'vue-router'
import ToolsLayout from '@/app/layout/ToolsLayout.vue'

const routes = (): RouteRecordRaw[] => [
  {
    path: 'json',
    name: 'tool.json',
    meta: {
      toolId: 'json',
      title: 'JSON工具',
      icon: 'json',
    },
    component: ToolsLayout,
    redirect: { name: 'tool.json-parsing' },
    children: [
      {
        path: 'json-parsing',
        name: 'tool.json-parsing',
        meta: {
          toolId: 'json',
          title: 'JSON解析',
          icon: 'json-parsing',
          order: 1,
        },
        component: () => import('@/tools/json/pages/JsonParsing.vue'),
      },
      {
        path: 'json-editor',
        name: 'tool.json-editor',
        meta: {
          toolId: 'json',
          title: 'JSON编辑器',
          icon: 'json-editor',
          order: 2,
        },
        component: () => import('@/tools/json/pages/JsonEditor.vue'),
      },
      {
        path: 'json-to-sql',
        name: 'tool.json-to-sql',
        meta: {
          toolId: 'json',
          title: 'JSON转SQL',
          icon: 'json-to-sql',
          order: 3,
        },
        component: () => import('@/tools/json/pages/JsonToSql.vue'),
      },
    ],
  },
]

export default routes
