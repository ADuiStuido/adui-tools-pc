import type { RouteRecordRaw } from 'vue-router'
import ToolsLayout from '@/app/layout/ToolsLayout.vue'

const routes = (): RouteRecordRaw[] => [
  {
    path: 'translate',
    name: 'tool.translate',
    meta: {
      toolId: 'translate',
      title: '翻译工具',
      icon: 'translate',
    },
    component: ToolsLayout,
    redirect: { name: 'tool.translate-baidu' },
    children: [
      {
        path: 'translate-baidu',
        name: 'tool.translate-baidu',
        meta: {
          toolId: 'translate',
          title: '百度翻译',
          icon: 'translate-baidu',
          order: 1,
        },
        component: () => import('@/tools/translate/pages/BaiDu.vue'),
      },
      {
        path: 'translate-youdao',
        name: 'tool.translate-youdao',
        meta: {
          toolId: 'translate',
          title: '有道翻译',
          icon: 'translate-youdao',
          order: 2,
        },
        component: () => import('@/tools/translate/pages/YouDao.vue'),
      },
    ],
  },
]

export default routes
