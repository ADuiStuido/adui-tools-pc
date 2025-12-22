import jsonPlugin from '@/tools/json'
import translatePlugin from '@/tools/translate'
import { registerTool } from '@/core/toolkit/tool.registry.ts'
export function registerAllTools() {
  return new Promise((resolve) => {
    ;[jsonPlugin, translatePlugin].forEach(registerTool)
    resolve('注册成功')
  })
}
