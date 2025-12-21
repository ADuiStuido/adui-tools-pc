import type { ToolPlugin } from './tool.types'

const tools: ToolPlugin[] = []

export function registerTool(tool: ToolPlugin) {
  tools.push(tool)
}

export function getTools() {
  return [...tools].sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0))
}
