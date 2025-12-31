import type * as MonacoNS from 'monaco-editor'

export const JETBRAINS_LIGHT = 'jetbrains-light'
export const JETBRAINS_DARK = 'jetbrains-dark'

// 使用模块级 WeakSet 记录是否已注册，避免使用 any
const jetbrainsThemeRegistry: WeakSet<typeof MonacoNS> = new WeakSet()

export function registerJetBrainsThemes(monaco: typeof MonacoNS) {
  // 仅注册一次
  if (jetbrainsThemeRegistry.has(monaco)) return
  jetbrainsThemeRegistry.add(monaco)

  // Light 主题
  monaco.editor.defineTheme(JETBRAINS_LIGHT, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '2b2d30' }, // 默认
      { token: 'comment', foreground: '808080', fontStyle: 'italic' },
      { token: 'string', foreground: '006400' },
      { token: 'number', foreground: '1c00cf' },
      { token: 'keyword', foreground: 'a626a4', fontStyle: 'bold' },
      { token: 'type', foreground: '005cc5' },
      { token: 'storage.type', foreground: '005cc5', fontStyle: 'bold' },
      { token: 'function', foreground: '795e26' },
      { token: 'variable', foreground: '2b2d30' },
      { token: 'constant', foreground: '0b7a75' },
      { token: 'class', foreground: '005cc5', fontStyle: 'bold' },
      { token: 'interface', foreground: '0b7a75' },
      { token: 'enum', foreground: '0b7a75' },
      { token: 'decorator', foreground: 'ab6526' },
      { token: 'operator', foreground: '2b2d30' },
      { token: 'regexp', foreground: 'd12f1b' },
      // JSON
      { token: 'string.key.json', foreground: 'a626a4' },
      { token: 'string.value.json', foreground: '006400' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#2b2d30',
      'editorLineNumber.foreground': '#a0a1a7',
      'editorLineNumber.activeForeground': '#2b2d30',
      'editor.selectionBackground': '#b3d4fc',
      'editor.selectionHighlightBackground': '#b3d4fc66',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.rangeHighlightBackground': '#f6f8fa',
      'editorCursor.foreground': '#007acc',
      'editorIndentGuide.background': '#e0e0e0',
      'editorIndentGuide.activeBackground': '#c0c0c0',
      'editorBracketMatch.background': '#add6ff4d',
      'editorBracketMatch.border': '#6ca0ff',
      'editorGutter.background': '#ffffff',
      'scrollbarSlider.background': '#c0c0c099',
      'scrollbarSlider.hoverBackground': '#a0a0a099',
      'scrollbarSlider.activeBackground': '#80808099',
      'minimap.background': '#ffffff',
      'minimap.selectionHighlight': '#b3d4fc',
    },
  })

  // Dark 主题
  monaco.editor.defineTheme(JETBRAINS_DARK, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'd4d4d4' }, // 默认
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'keyword', foreground: 'c586c0', fontStyle: 'bold' },
      { token: 'type', foreground: '4fc1ff' },
      { token: 'storage.type', foreground: '4fc1ff', fontStyle: 'bold' },
      { token: 'function', foreground: 'dcdcaa' },
      { token: 'variable', foreground: 'd4d4d4' },
      { token: 'constant', foreground: '4ec9b0' },
      { token: 'class', foreground: '4fc1ff', fontStyle: 'bold' },
      { token: 'interface', foreground: '4ec9b0' },
      { token: 'enum', foreground: '4ec9b0' },
      { token: 'decorator', foreground: 'd19a66' },
      { token: 'operator', foreground: 'd4d4d4' },
      { token: 'regexp', foreground: 'd16969' },
      // JSON
      { token: 'string.key.json', foreground: 'c586c0' },
      { token: 'string.value.json', foreground: 'ce9178' },
    ],
    colors: {
      'editor.background': '#1f1f1f',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editor.selectionBackground': '#264f78',
      'editor.selectionHighlightBackground': '#264f7866',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editor.rangeHighlightBackground': '#2a2a2a',
      'editorCursor.foreground': '#afffff',
      'editorIndentGuide.background': '#3a3a3a',
      'editorIndentGuide.activeBackground': '#5a5a5a',
      'editorBracketMatch.background': '#515c6a80',
      'editorBracketMatch.border': '#7e8692',
      'editorGutter.background': '#1f1f1f',
      'scrollbarSlider.background': '#66666699',
      'scrollbarSlider.hoverBackground': '#88888899',
      'scrollbarSlider.activeBackground': '#aaaaaa99',
      'minimap.background': '#1f1f1f',
      'minimap.selectionHighlight': '#264f78',
    },
  })
}
