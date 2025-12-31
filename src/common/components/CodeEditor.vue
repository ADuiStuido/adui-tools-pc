<script setup lang="ts">
/**
 * CodeEditor.vue
 * 基于 monaco-editor 的通用代码编辑器组件（更像 IDE）
 *
 * 特性：
 * - v-model 双向绑定（避免无限循环）
 * - 支持动态 language/theme/readOnly/options
 * - placeholder（覆盖层实现，不污染内容）
 * - Copy 按钮（可关闭）
 * - 常用 IDE 快捷键兜底注册（格式化/保存/查找/替换/注释/跳行/缩进/移动行/复制行/折叠/命令面板等）
 * - 支持右键菜单扩展（menuActions）
 * - JSON Schema 校验（jsonSchemas）
 * - 只读审阅模式 readonlyMode="review"：可复制，但禁用剪切/粘贴/删除等编辑操作
 */

import * as monaco from 'monaco-editor'
import type { IDisposable } from 'monaco-editor'
import type { editor as MonacoEditor } from 'monaco-editor'

import { JETBRAINS_LIGHT, registerJetBrainsThemes } from '@/common/lib/themes/monaco-jetbrains.ts'
import { setLocaleData } from 'monaco-editor-nls'
import zhHans from 'monaco-editor-nls/locale/zh-hans.json'
import type { CodeEditorProps, LineNumbersOption, WordWrapOption } from '../types/common.types'

const props = withDefaults(defineProps<CodeEditorProps>(), {
  placeholder: '',
  language: 'plaintext',
  theme: JETBRAINS_LIGHT,
  readOnly: false,
  readonlyMode: 'normal',
  lineNumbers: true,
  minimap: true,
  wordWrap: true,
  tabSize: 2,
  showCopy: true,
  enableFormat: true,
  formatOnSave: true,
  jsonSchemas: undefined,
  modelUri: undefined,
  menuActions: undefined,
  keybindings: undefined,
  options: undefined,
  automaticLayout: true,
})

const emit = defineEmits<{
  /** 编辑器 ready */
  (e: 'ready', payload: { editor: MonacoEditor.IStandaloneCodeEditor; monaco: typeof monaco }): void
  /** 内容变化 */
  (e: 'change', value: string): void
  /** Copy 按钮点击 */
  (e: 'copy', value: string): void
  /** Ctrl/Cmd+S 触发（公共组件只负责通知，不做保存 IO） */
  (e: 'save', value: string): void
  /** 格式化触发（可用于外部埋点/提示） */
  (e: 'format', value: string): void
}>()

/** v-model */
const modelValue = defineModel<string>({ required: true })

/** ===================== Monaco 初始化（主题/中文） ===================== */
registerJetBrainsThemes(monaco)
/**
 * monaco-editor-nls：建议在创建 editor 前设置 locale（否则部分 UI 文案可能已初始化）
 */
setLocaleData(zhHans)

/** DOM 容器 */
const editorContainer = ref<HTMLElement | null>(null)
/** editor 实例 */
const editorInstance = shallowRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
/** model 实例（可带 URI，便于 JSON schema 精准匹配） */
const modelInstance = shallowRef<MonacoEditor.ITextModel | null>(null)

/** 统一管理 disposables，组件卸载时释放 */
const disposables: IDisposable[] = []
let resizeObserver: ResizeObserver | null = null

/** 把布尔 props 转成 Monaco option 需要的值 */
const lineNumbersOption = computed<LineNumbersOption>(() => (props.lineNumbers ? 'on' : 'off'))
const wordWrapOption = computed<WordWrapOption>(() => (props.wordWrap ? 'on' : 'off'))
const minimapOption = computed<MonacoEditor.IEditorMinimapOptions>(() => ({
  enabled: props.minimap,
}))

/** 合并后的 editor options（props.options 优先级最高） */
const mergedOptions = computed<MonacoEditor.IStandaloneEditorConstructionOptions>(() => {
  const base: MonacoEditor.IStandaloneEditorConstructionOptions = {
    // 注意：value/language/theme 只是创建时用，后面我们会用 watch 动态更新
    value: modelValue.value ?? '',
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,

    lineNumbers: lineNumbersOption.value,
    wordWrap: wordWrapOption.value,
    minimap: minimapOption.value,
    tabSize: props.tabSize,

    // 体验相关默认值
    scrollbar: { verticalScrollbarSize: 12, horizontalScrollbarSize: 12 },
    scrollBeyondLastLine: false,
    fontFamily:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontLigatures: false,
    fontSize: 14,
    lineHeight: 22,
    padding: { top: 0, bottom: 0 } as MonacoEditor.IEditorPaddingOptions,

    // 自动布局
    automaticLayout: props.automaticLayout,
  }

  return {
    ...base,
    ...((props.options as MonacoEditor.IStandaloneEditorConstructionOptions) ?? {}),
  }
})

/** placeholder：内容为空且 placeholder 非空时显示覆盖层 */
const showPlaceholder = computed<boolean>(() => {
  const v = modelValue.value ?? ''
  return v.length === 0 && (props.placeholder?.length ?? 0) > 0
})

/** ===================== 工具函数 ===================== */

/** 创建/复用 model（建议带 URI，便于 JSON schema 校验 fileMatch 精准命中） */
function ensureModel(): MonacoEditor.ITextModel {
  const existing = modelInstance.value
  if (existing) return existing

  const uri = props.modelUri ? monaco.Uri.parse(props.modelUri) : undefined
  const model = monaco.editor.createModel(modelValue.value ?? '', props.language, uri)
  modelInstance.value = model
  return model
}

/** 安全地执行 monaco 内置 action（存在才 run） */
async function runEditorAction(actionId: string): Promise<void> {
  const editor = editorInstance.value
  if (!editor) return
  const action = editor.getAction(actionId)
  if (!action) return
  await action.run()
}

/** 格式化文档（内置 formatter 依赖语言服务/formatter） */
async function formatDocument(): Promise<void> {
  await runEditorAction('editor.action.formatDocument')
  const v = editorInstance.value?.getValue() ?? modelValue.value ?? ''
  emit('format', v)
}

/** Copy 当前内容 */
async function handleCopy(): Promise<void> {
  const text = editorInstance.value?.getValue() ?? modelValue.value ?? ''
  await navigator.clipboard.writeText(text)
  emit('copy', text)
}

/** ===================== IDE 能力：JSON Schema 校验 ===================== */
// function applyJsonSchemas(): void {
//   const schemas = props.jsonSchemas
//   if (!schemas || schemas.length === 0) return
//
//   /**
//    * monaco JSON 校验配置（全局 defaults）
//    * 注意：这是全局设置，适合“应用级公共组件”
//    * 如果你想不同实例完全隔离，需要更复杂的 schema 管理策略（可以后续再扩展）
//    */
//   monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
//     validate: true,
//     allowComments: true,
//     enableSchemaRequest: false,
//     schemas: schemas.map((s) => ({
//       uri: s.uri,
//       fileMatch: [...s.fileMatch],
//       schema: s.schema,
//     })),
//   })
// }

/** ===================== IDE 能力：内置菜单与快捷键（兜底注册） ===================== */

/**
 * 用 addAction 注册快捷键/右键菜单的好处：
 * - 会返回 IDisposable，能在组件销毁时释放
 * - 既能绑定快捷键，也能选择是否出现在右键菜单
 */
function addActionSafe(action: {
  id: string
  label: string
  keybindings?: readonly number[]
  contextMenuGroupId?: string
  contextMenuOrder?: number
  run: () => void | Promise<void>
}): void {
  const editor = editorInstance.value
  if (!editor) return

  const disposable = editor.addAction({
    id: action.id,
    label: action.label,
    keybindings: action.keybindings ? [...action.keybindings] : undefined,
    contextMenuGroupId: action.contextMenuGroupId,
    contextMenuOrder: action.contextMenuOrder,
    run: async () => {
      await action.run()
    },
  })
  disposables.push(disposable)
}

/**
 * 注册一组常见 IDE 快捷键（注意：monaco 默认已有很多，这里是“兜底 + 统一体验”）
 * 你要求“正常编辑器有的快捷键就都加上”，这里选取主流编辑器最常用的一批。
 */
function registerBuiltinIdeActions(): void {
  const editor = editorInstance.value
  if (!editor) return

  /** ========== 保存（Ctrl/Cmd+S） ========== */
  addActionSafe({
    id: 'ide.save',
    label: '保存',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    contextMenuGroupId: '9_cutcopypaste',
    contextMenuOrder: 1,
    run: async () => {
      // 保存前可选格式化
      if (props.enableFormat && props.formatOnSave) {
        await formatDocument()
      }
      const v = editor.getValue()
      emit('save', v)
    },
  })

  /** ========== 格式化（Alt+Shift+F） ========== */
  addActionSafe({
    id: 'ide.format',
    label: '格式化文档',
    keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 1,
    run: async () => {
      if (!props.enableFormat) return
      await formatDocument()
    },
  })

  /** ========== 查找（Ctrl/Cmd+F）/ 替换（Ctrl/Cmd+H） ========== */
  addActionSafe({
    id: 'ide.find',
    label: '查找',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
    run: async () => {
      await runEditorAction('actions.find')
    },
  })
  addActionSafe({
    id: 'ide.replace',
    label: '替换',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH],
    run: async () => {
      await runEditorAction('editor.action.startFindReplaceAction')
    },
  })

  /** ========== 跳转行（Ctrl/Cmd+G） ========== */
  addActionSafe({
    id: 'ide.gotoLine',
    label: '跳转到行',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
    run: async () => {
      await runEditorAction('editor.action.gotoLine')
    },
  })

  /** ========== 命令面板（F1 / Ctrl/Cmd+Shift+P） ========== */
  addActionSafe({
    id: 'ide.commandPalette.f1',
    label: '命令面板（F1）',
    keybindings: [monaco.KeyCode.F1],
    run: async () => {
      await runEditorAction('editor.action.quickCommand')
    },
  })
  addActionSafe({
    id: 'ide.commandPalette.ctrlShiftP',
    label: '命令面板',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP],
    run: async () => {
      await runEditorAction('editor.action.quickCommand')
    },
  })

  /** ========== 注释（Ctrl/Cmd+/） ========== */
  addActionSafe({
    id: 'ide.toggleComment',
    label: '切换行注释',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 9,
    run: async () => {
      await runEditorAction('editor.action.commentLine')
    },
  })

  /** ========== 缩进 / 反缩进（Tab / Shift+Tab） ==========
   * 说明：Monaco 默认行为通常已包含；这里不强行覆盖 Tab，以免影响输入法/Tab 处理差异
   * 如果你想强制控制 Tab 行为，可通过 props.options 传 insertSpaces/tabSize 等
   */

  /** ========== 复制行 / 删除行 / 移动行（常见 IDE 行为） ========== */
  addActionSafe({
    id: 'ide.copyLineDown',
    label: '向下复制行',
    keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow],
    run: async () => {
      await runEditorAction('editor.action.copyLinesDownAction')
    },
  })
  addActionSafe({
    id: 'ide.copyLineUp',
    label: '向上复制行',
    keybindings: [monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow],
    run: async () => {
      await runEditorAction('editor.action.copyLinesUpAction')
    },
  })
  addActionSafe({
    id: 'ide.moveLineDown',
    label: '向下移动行',
    keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
    run: async () => {
      await runEditorAction('editor.action.moveLinesDownAction')
    },
  })
  addActionSafe({
    id: 'ide.moveLineUp',
    label: '向上移动行',
    keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.UpArrow],
    run: async () => {
      await runEditorAction('editor.action.moveLinesUpAction')
    },
  })
  addActionSafe({
    id: 'ide.deleteLine',
    label: '删除行',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],
    run: async () => {
      await runEditorAction('editor.action.deleteLines')
    },
  })

  /** ========== 折叠/展开（Ctrl/Cmd+Shift+[ / ]） ========== */
  addActionSafe({
    id: 'ide.fold',
    label: '折叠代码块',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft],
    run: async () => {
      await runEditorAction('editor.fold')
    },
  })
  addActionSafe({
    id: 'ide.unfold',
    label: '展开代码块',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight],
    run: async () => {
      await runEditorAction('editor.unfold')
    },
  })

  /** ========== 全选（Ctrl/Cmd+A）/ 复制（Ctrl/Cmd+C） ==========
   * 说明：这些通常是浏览器默认/Monaco 默认已有；这里不强制覆盖
   */
}

/** 注册外部传入的菜单 action（追加） */
function registerExternalMenuActions(): void {
  const actions = props.menuActions ?? []
  for (const a of actions) {
    addActionSafe({
      id: `ext.menu.${a.id}`,
      label: a.label,
      keybindings: a.keybinding ? [a.keybinding] : undefined,
      contextMenuGroupId: a.contextMenuGroupId,
      contextMenuOrder: a.contextMenuOrder,
      run: async () => {
        const editor = editorInstance.value
        if (!editor) return
        await a.run({ editor, monaco })
      },
    })
  }
}

/** 注册外部传入的快捷键（追加） */
function registerExternalKeybindings(): void {
  const keys = props.keybindings ?? []
  for (const k of keys) {
    // 用 addAction 注册快捷键（可 dispose）
    addActionSafe({
      id: `ext.kb.${k.id}`,
      label: `快捷键：${k.id}`,
      keybindings: [k.keybinding],
      run: async () => {
        const editor = editorInstance.value
        if (!editor) return
        await k.run({ editor, monaco })
      },
    })
  }
}

/** 只读审阅模式：可复制但尽可能禁止修改内容的快捷键 */
function applyReadonlyReviewMode(): void {
  const editor = editorInstance.value
  if (!editor) return
  if (!props.readOnly) return
  if (props.readonlyMode !== 'review') return

  /**
   * 思路：用 addAction 把关键“会改变内容”的快捷键抢占掉（run 空函数）
   * 说明：readOnly 本身就会阻止编辑，但审阅模式更像 IDE 的“只读预览”，用户不会误触发剪切/粘贴等
   */
  const block = (id: string, keybinding: number, label: string) => {
    addActionSafe({
      id: `ro.block.${id}`,
      label,
      keybindings: [keybinding],
      run: async () => {},
    })
  }

  block('cut', monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, '（只读）禁用剪切')
  block('paste', monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, '（只读）禁用粘贴')
  block('delete', monaco.KeyCode.Delete, '（只读）禁用删除')
  block('backspace', monaco.KeyCode.Backspace, '（只读）禁用退格')
}

/** ===================== 创建与销毁 editor ===================== */

function createEditor(): void {
  const el = editorContainer.value
  if (!el) return
  if (editorInstance.value) return

  // 1) 确保 model（带 URI 更像 IDE）
  const model = ensureModel()

  // 2) 创建 editor（用 model 而不是直接 value）
  const editor = monaco.editor.create(el, {
    ...mergedOptions.value,
    model,
  })
  editorInstance.value = editor

  // 3) 内容变化 => 同步 v-model（避免循环）
  disposables.push(
    editor.onDidChangeModelContent(() => {
      const v = editor.getValue()
      if (v !== modelValue.value) {
        modelValue.value = v
        emit('change', v)
      }
    }),
  )

  // 4) ResizeObserver：容器变化就 layout（避免白屏/错位）
  resizeObserver = new ResizeObserver(() => {
    editor.layout()
  })
  resizeObserver.observe(el)

  // 5) JSON Schema（如果传了就启用）
  // applyJsonSchemas()

  // 6) 注册 IDE 行为（内置 + 外部追加）
  registerBuiltinIdeActions()
  registerExternalMenuActions()
  registerExternalKeybindings()

  // 7) 只读审阅模式增强
  applyReadonlyReviewMode()

  emit('ready', { editor, monaco })
}

function destroyEditor(): void {
  resizeObserver?.disconnect()
  resizeObserver = null

  // 释放 addAction/onDidChange 等
  for (const d of disposables) d.dispose()
  disposables.length = 0

  // 释放 editor
  editorInstance.value?.dispose()
  editorInstance.value = null

  // 释放 model（避免内存泄漏）
  modelInstance.value?.dispose()
  modelInstance.value = null
}

/** ===================== v-model -> editor 同步（避免无限循环） ===================== */
watch(
  () => modelValue.value,
  (val) => {
    const editor = editorInstance.value
    if (!editor) return
    const nextVal = val ?? ''
    if (nextVal === editor.getValue()) return

    /**
     * 用 executeEdits 替换全文，能更好地保留 undo/redo 体验
     * 注意：getFullModelRange 一定要基于当前 model
     */
    editor.pushUndoStop()
    editor.executeEdits('v-model', [
      {
        range: editor.getModel()?.getFullModelRange() ?? new monaco.Range(1, 1, 1, 1),
        text: nextVal,
        forceMoveMarkers: true,
      },
    ])
    editor.pushUndoStop()
  },
)

/** ===================== props 动态更新 ===================== */

/** language 变化：更新 model language */
watch(
  () => props.language,
  (lang) => {
    const model = modelInstance.value
    if (!model) return
    monaco.editor.setModelLanguage(model, lang)
  },
)

/** theme 变化：设置全局主题 */
watch(
  () => props.theme,
  (theme) => {
    if (!editorInstance.value) return
    monaco.editor.setTheme(theme)
  },
)

/** readOnly 变化：更新 options */
watch(
  () => props.readOnly,
  (readOnly) => {
    editorInstance.value?.updateOptions({ readOnly })
  },
)

/** 行号/minimap/换行/tabSize 动态更新 */
watch(
  () => props.lineNumbers,
  (v) => editorInstance.value?.updateOptions({ lineNumbers: v ? 'on' : 'off' }),
)
watch(
  () => props.minimap,
  (v) => editorInstance.value?.updateOptions({ minimap: { enabled: v } }),
)
watch(
  () => props.wordWrap,
  (v) => editorInstance.value?.updateOptions({ wordWrap: v ? 'on' : 'off' }),
)
watch(
  () => props.tabSize,
  (v) => editorInstance.value?.updateOptions({ tabSize: v }),
)

/** options（外部覆盖项）变化：合并更新（深度监听） */
watch(
  () => props.options,
  (opts) => {
    if (!editorInstance.value || !opts) return
    editorInstance.value.updateOptions({ ...opts })
  },
  { deep: true },
)

/** jsonSchemas 变化：重新应用（全局 defaults） */
watch(
  () => props.jsonSchemas,
  () => {
    // applyJsonSchemas()
  },
  { deep: true },
)

/** ===================== expose：给外部拿 editor 做高级操作 ===================== */

export interface CodeEditorExpose {
  /** 获取 editor 实例（可能为 null） */
  getEditor: () => MonacoEditor.IStandaloneCodeEditor | null
  /** 获取 model 实例（可能为 null） */
  getModel: () => MonacoEditor.ITextModel | null
  /** 聚焦 */
  focus: () => void
  /** layout */
  layout: () => void
  /** 设置内容（会走 v-model 同步） */
  setValue: (value: string) => void
  /** 获取内容 */
  getValue: () => string
  /** 手动触发格式化 */
  format: () => Promise<void>
}

defineExpose<CodeEditorExpose>({
  getEditor: () => editorInstance.value,
  getModel: () => modelInstance.value,
  focus: () => editorInstance.value?.focus(),
  layout: () => editorInstance.value?.layout(),
  setValue: (value: string) => {
    modelValue.value = value
  },
  getValue: () => editorInstance.value?.getValue() ?? modelValue.value ?? '',
  format: async () => {
    if (!props.enableFormat) return
    await formatDocument()
  },
})

/** ===================== 生命周期 ===================== */
onMounted(() => {
  nextTick(() => createEditor())
})

onUnmounted(() => {
  destroyEditor()
})
</script>

<template>
  <div class="code-editor-root">
    <!-- Monaco 容器 -->
    <div ref="editorContainer" class="code-editor"></div>

    <!-- placeholder 覆盖层：内容为空时显示 -->
    <div v-if="showPlaceholder" class="code-editor-placeholder" aria-hidden="true">
      {{ placeholder }}
    </div>

    <!-- 复制按钮：默认显示，可通过 showCopy 关闭 -->
    <button v-if="showCopy" class="code-editor-copy" type="button" title="复制" @click="handleCopy">
      Copy
    </button>
  </div>
</template>

<style scoped>
/* 根容器：必须 relative，方便 placeholder/copy 绝对定位覆盖 */
.code-editor-root {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Monaco 编辑器必须有明确宽高 */
.code-editor {
  width: 100%;
  height: 100%;
}

/* placeholder：仅展示，不可选中/不可点击 */
.code-editor-placeholder {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;

  pointer-events: none;
  user-select: none;

  opacity: 0.55;
  font-size: 13px;
  line-height: 18px;
  white-space: pre-wrap;
}

/* Copy 按钮：简单通用样式（你也可以改成项目统一 Button） */
.code-editor-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;

  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;

  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}
</style>
