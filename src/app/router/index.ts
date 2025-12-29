import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '@/app/layout/AppShell.vue'
import { buildToolsRoutes } from '@/tools/tools.routes.ts'
import { registerAllTools } from '@/app/bootstrap/register.ts'
import type { App } from 'vue'
import globalSettings from '@/settings/routes.ts'
import AboutMe from '@/app/pages/AboutMe.vue'

let router

export const setupRoute = async (app: App<Element>): Promise<void> => {
  await registerAllTools()
  router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/',
        component: AppShell,
        children: [
          { path: '', redirect: '/tools' },
          // 把 tools 路由树挂进来
          buildToolsRoutes(),
          ...globalSettings(),
        ],
      },
      {
        path: '/about',
        name: 'about',
        component: AboutMe,
      },
      // 兜底：未知路由跳回工具首页
      { path: '/:pathMatch(.*)*', redirect: '/tools' },
    ],
  })
  app.use(router)
  await router.isReady()
}

export default router
