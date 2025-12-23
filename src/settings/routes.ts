import type { RouteRecordRaw } from 'vue-router'
import GlobalSettings from '@/settings/GlobalSettings.vue'

const routes = (): RouteRecordRaw[] => [
  {
    path: 'settings',
    name: 'settings',
    meta: {
      title: '设置',
    },
    component: GlobalSettings,
  },
]

export default routes
