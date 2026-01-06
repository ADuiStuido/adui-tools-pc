<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import CodeEditor from '@/common/components/CodeEditor.vue'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonArray
type JsonObject = { readonly [key: string]: JsonValue }
type JsonArray = readonly JsonValue[]

interface ParseOk {
  readonly ok: true
  readonly value: JsonValue
}
interface ParseFail {
  readonly ok: false
  readonly error: string
}
type ParseResult = ParseOk | ParseFail

const message = useMessage()

const text = ref<string>('')

const autoFormat = ref<boolean>(true)
const indentSize = ref<2 | 4>(2)
const sortKeys = ref<boolean>(false)

function parseJson(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, error: '请输入 JSON 内容' }

  try {
    const v = JSON.parse(trimmed) as unknown
    return { ok: true, value: v as JsonValue }
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    return { ok: false, error: err }
  }
}

function sortJsonKeys(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortJsonKeys)
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, JsonValue>
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b))
    const next: Record<string, JsonValue> = {}
    for (const k of keys) next[k] = sortJsonKeys(obj[k])
    return next as JsonObject
  }
  return value
}

function formatJson(value: JsonValue, space: number): string {
  return JSON.stringify(value, null, space)
}

function minifyJson(value: JsonValue): string {
  return JSON.stringify(value)
}

const parsed = computed<ParseResult>(() => parseJson(text.value))

const prettyText = computed<string>(() => {
  if (!parsed.value.ok) return ''
  const v = sortKeys.value ? sortJsonKeys(parsed.value.value) : parsed.value.value
  return formatJson(v, indentSize.value)
})

const minifiedText = computed<string>(() => {
  if (!parsed.value.ok) return ''
  const v = sortKeys.value ? sortJsonKeys(parsed.value.value) : parsed.value.value
  return minifyJson(v)
})

const output = computed<string>(() => {
  if (!parsed.value.ok) {
    return `// JSON 解析失败\n// ${parsed.value.error}\n`
  }
  // 默认输出美化后的 JSON
  return prettyText.value
})

function setSample(): void {
  text.value = JSON.stringify(
    {
      name: 'ADui Tools',
      version: '1.0.0',
      enabled: true,
      tags: ['json', 'tools'],
      meta: { createdAt: new Date().toISOString(), count: 3 },
    },
    null,
    2,
  )
}

async function copyOutput(): Promise<void> {
  try {
    await navigator.clipboard.writeText(output.value)
    message.success('已复制')
  } catch {
    message.error('复制失败（可能缺少剪贴板权限）')
  }
}

function applyPrettyToInput(): void {
  if (!parsed.value.ok) return
  text.value = prettyText.value
}

function applyMinifyToInput(): void {
  if (!parsed.value.ok) return
  text.value = minifiedText.value
}

// 自动格式化：当输入可解析时，把“格式化后的文本”写回左侧输入
watch(
  () => text.value,
  () => {
    if (!autoFormat.value) return
    if (!parsed.value.ok) return
    const next = prettyText.value
    // 避免死循环：内容一致就不写回
    if (next !== text.value.trim()) {
      text.value = next
    }
  },
)
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="toolbar">
      <n-space align="center" :wrap="true">
        <n-button size="small" @click="setSample">示例</n-button>

        <n-divider vertical />

        <n-switch v-model:value="autoFormat" size="small" />
        <n-text depth="3">自动格式化</n-text>

        <n-divider vertical />

        <n-select
          v-model:value="indentSize"
          size="small"
          style="width: 110px"
          :options="[
            { label: '缩进 2', value: 2 },
            { label: '缩进 4', value: 4 },
          ]"
        />

        <n-checkbox v-model:checked="sortKeys">Key 排序</n-checkbox>

        <n-divider vertical />

        <n-button size="small" :disabled="!parsed.ok" @click="applyPrettyToInput">美化</n-button>
        <n-button size="small" :disabled="!parsed.ok" @click="applyMinifyToInput">压缩</n-button>

        <n-divider vertical />

        <n-button size="small" @click="copyOutput">复制右侧</n-button>

        <n-text depth="3" class="ml-8px">
          <template v-if="parsed.ok">✅ JSON 有效</template>
          <template v-else>❌ {{ parsed.error }}</template>
        </n-text>
      </n-space>
    </div>

    <n-split direction="horizontal" class="flex-1 min-h-0" :max="0.75" :min="0.25">
      <template #1>
        <div class="pane">
          <n-input type="textarea" style="height: 100%" :resizable="false" v-model:value="text" />
        </div>
      </template>

      <template #2>
        <div class="pane">
          <code-editor :model-value="output" language="json" />
        </div>
      </template>
    </n-split>
  </div>
</template>

<style scoped>
.toolbar {
  padding: 10px 12px;
}

.pane {
  height: 100%;
  min-height: 0;
}
</style>
