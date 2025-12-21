import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import AppShell from '@/app/layout/AppShell.vue'
import { buildToolsRoutes } from '@/tools/tools.routes.ts'
import { registerAllTools } from '@/app/bootstrap/register.ts'

registerAllTools()

/**
 * 应用路由构建
 *
 * - AppShell：应用壳（侧边栏/顶部栏/内容区）
 * - /tools：工具容器（ToolsLayout）+ 各工具子路由
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', redirect: '/tools' },
      // 把 tools 路由树挂进来
      buildToolsRoutes(),
    ],
  },

  // 兜底：未知路由跳回工具首页
  { path: '/:pathMatch(.*)*', redirect: '/tools' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
