import jsonPlugin from '@/tools/json'
import translatePlugin from '@/tools/translate'
import { registerTool } from '@/core/toolkit/tool.registry.ts'
import { listen } from '@tauri-apps/api/event'

export function registerAllTools() {
  return new Promise((resolve) => {
    ;[translatePlugin, jsonPlugin].forEach(registerTool)
    resolve('注册成功')
  })
}

export function registerAllMenuListen() {
  const router = useRouter()
  void listen('menu:settings', () => {
    router.push('/settings')
  })
}
