import type { editor as MonacoEditor } from 'monaco-editor'
import * as monaco from 'monaco-editor'

/** JSON Schema 规则 */
export interface JsonSchemaRule {
  /** 唯一 URI，建议：app://schemas/xxx.json */
  uri: string
  /** 匹配模型路径/文件名：['*.json']、['inmemory://model/config.json'] 等 */
  fileMatch: readonly string[]
  /** schema 对象 */
  schema: Record<string, unknown>
}

/** 右键菜单 Action（也可绑定快捷键） */
export interface EditorMenuAction {
  /** 唯一 id */
  id: string
  /** 菜单显示名称 */
  label: string
  /** 右键菜单分组（可选） */
  contextMenuGroupId?: string
  /** 分组内排序（可选） */
  contextMenuOrder?: number
  /** 快捷键（monaco.KeyMod + monaco.KeyCode 组合） */
  keybinding?: number
  /** 执行函数 */
  run: (ctx: {
    editor: MonacoEditor.IStandaloneCodeEditor
    monaco: typeof monaco
  }) => void | Promise<void>
}

/** 自定义快捷键（不一定出现在菜单中） */
export interface EditorKeybinding {
  id: string
  keybinding: number
  run: (ctx: {
    editor: MonacoEditor.IStandaloneCodeEditor
    monaco: typeof monaco
  }) => void | Promise<void>
}

export type LineNumbersOption = 'on' | 'off'
export type WordWrapOption = 'on' | 'off'

export interface CodeEditorProps {
  /** v-model 为空时显示占位文案（覆盖层实现） */
  placeholder?: string

  /** Monaco language id（使用时传入需要的语言即可） */
  language?: string

  /** Monaco theme id */
  theme?: string

  /** 是否只读（只读仍可复制/查找/选择文本） */
  readOnly?: boolean

  /**
   * 只读模式行为：
   * - normal：只设置 readOnly（默认即可复制）
   * - review：更像“审阅模式”，禁用剪切/粘贴/删除等会改变内容的快捷键
   */
  readonlyMode?: 'normal' | 'review'

  /** 是否显示行号 */
  lineNumbers?: boolean

  /** 是否显示 minimap */
  minimap?: boolean

  /** 是否自动换行 */
  wordWrap?: boolean

  /** tab size */
  tabSize?: number

  /** 是否显示右上角 Copy 按钮 */
  showCopy?: boolean

  /** 是否启用格式化能力（会注册格式化快捷键/菜单） */
  enableFormat?: boolean

  /**
   * 是否在 Ctrl/Cmd+S 时自动格式化
   * 注意：此组件不会直接落盘保存（公共组件不应该做 IO），只会 emit('save')
   */
  formatOnSave?: boolean

  /** JSON Schema 校验规则（language = json 时传入即可） */
  jsonSchemas?: readonly JsonSchemaRule[]

  /**
   * model 的 URI（强烈建议传入，尤其是 JSON schema fileMatch 需要精准匹配时）
   * 示例：inmemory://model/config.json
   */
  modelUri?: string

  /** 外部追加右键菜单 action（追加，不破坏内置菜单） */
  menuActions?: readonly EditorMenuAction[]

  /** 外部追加快捷键（追加，不破坏内置） */
  keybindings?: readonly EditorKeybinding[]

  /**
   * 额外 Monaco options（同名字段以此处为准，优先级最高）
   * 注意：建议只传你需要覆盖的字段
   */
  options?: Readonly<MonacoEditor.IStandaloneEditorConstructionOptions>

  /** 是否开启自动布局（同时我们也会用 ResizeObserver 兜底 layout） */
  automaticLayout?: boolean
}
