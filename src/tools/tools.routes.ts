import type { RouteRecordRaw } from 'vue-router'
import { getTools } from '@/core/toolkit/tool.registry.ts'

/**
 * 构建“工具路由树”
 *
 * 设计原则：
 * - 所有工具都挂到 /tools 下，避免污染全局路由空间
 * - 具体工具的子路由由工具插件自己提供（plugin.routes()）
 * - 聚合层只负责拼装，不写任何工具页面
 */
export function buildToolsRoutes(): RouteRecordRaw {
  // 收集所有工具的 routes
  const toolRoutes = getTools().flatMap((tool) => tool.routes())

  return {
    path: 'tools',
    children: [
      /**
       * 默认重定向：你可以根据“第一个启用工具”动态决定
       * 简化起见，这里默认跳 ai-chat
       */
      { path: '', redirect: { name: 'tool.json' } },

      /**
       * 挂载各工具路由（工具只关心自己的子路由）
       * 注意：每个工具的 routes.ts 里写的 path 必须是相对 /tools 的子路径
       * 例如：ai-chat 工具写 path: 'ai-chat'
       */
      ...toolRoutes,
    ],
  }
}
