// src/common/lib/monaco/monaco-environment.ts

// 注意：这里导入的是 “Worker 构造器”，Vite 会自动产出正确的 worker 资源与 MIME
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

type MonacoEnvironment = {
  getWorker: (moduleId: string, label: string) => Worker
}

type GlobalWithMonaco = typeof globalThis & {
  MonacoEnvironment?: MonacoEnvironment
}

type WorkerCtor = new () => Worker

export function setupMonacoEnvironment(): void {
  const g = globalThis as GlobalWithMonaco

  // 防止重复设置
  if (g.MonacoEnvironment?.getWorker) return

  const pickWorker = (label: string): WorkerCtor => {
    // label 是 Monaco 内部传入的语言标识
    if (label === 'json') return JsonWorker
    if (label === 'css' || label === 'scss' || label === 'less') return CssWorker
    if (label === 'html' || label === 'handlebars' || label === 'razor') return HtmlWorker
    if (label === 'typescript' || label === 'javascript') return TsWorker
    return EditorWorker
  }

  g.MonacoEnvironment = {
    getWorker: (_moduleId: string, label: string) => {
      const Ctor = pickWorker(label)
      return new Ctor()
    },
  }
}
