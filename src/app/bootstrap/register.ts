import jsonPlugin from '@/tools/json'
import { registerTool } from '@/core/toolkit/tool.registry.ts'
export function registerAllTools() {
  ;[jsonPlugin].forEach(registerTool)
}
