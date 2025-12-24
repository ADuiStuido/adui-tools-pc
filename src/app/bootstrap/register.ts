import jsonPlugin from '@/tools/json'
import translatePlugin from '@/tools/translate'
import { registerTool } from '@/core/toolkit/tool.registry.ts'
import { listen } from '@tauri-apps/api/event'
import { isTauri } from '@tauri-apps/api/core'
import type { Router } from 'vue-router'

export function registerAllTools() {
  return new Promise((resolve) => {
    ;[translatePlugin, jsonPlugin].forEach(registerTool)
    resolve('注册成功')
  })
}

export async function registerAllMenuListen(router: Router) {
  // Avoid crashing when running in the browser (npm run dev in Chrome)
  if (!isTauri()) return

  return await listen('menu:settings', () => {
    void router.push('/settings')
  })
}
