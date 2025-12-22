import jsonPlugin from '@/tools/json'
import { registerTool } from '@/core/toolkit/tool.registry.ts'
export function registerAllTools() {
  return new Promise((resolve) => {
    ;[jsonPlugin].forEach(registerTool)
    resolve('注册成功')
  })
}
