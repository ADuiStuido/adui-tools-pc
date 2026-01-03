<script setup lang="ts">
import { computed, ref } from 'vue'
import CodeEditor from '@/common/components/CodeEditor.vue'

const jsonValue = ref<string>('')

const dartValue = computed<string>(() => jsonToDart(jsonValue.value))

/* ================== types ================== */

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
interface JsonObject {
  readonly [key: string]: JsonValue
}

interface DartClass {
  name: string
  fields: DartField[]
}

interface DartField {
  name: string
  type: string
  isNullable: boolean
}

/* ================== main ================== */

function jsonToDart(input: string): string {
  const text = input.trim()
  if (!text) return '// 请输入 JSON'

  const parsed = safeParse(text)
  if (!parsed.ok) return `// JSON 解析失败：${parsed.error}`

  const root = normalizeRoot(parsed.value)
  const classes: DartClass[] = []
  buildClass(root.name, root.value, classes)

  return classes.map(renderClass).join('\n\n')
}

/* ================== parse ================== */

function safeParse(input: string): { ok: true; value: JsonValue } | { ok: false; error: string } {
  try {
    const v: unknown = JSON.parse(input)
    if (!isJsonValue(v)) return { ok: false, error: '非法 JSON 结构' }
    return { ok: true, value: v }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : '未知错误' }
  }
}

function normalizeRoot(value: JsonValue): { name: string; value: JsonObject } {
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]
    if (isJsonObject(first)) {
      return { name: 'Root', value: first }
    }
  }
  if (isJsonObject(value)) {
    return { name: 'User', value }
  }
  return { name: 'Root', value: {} }
}

/* ================== build ================== */

function buildClass(name: string, obj: JsonObject, classes: DartClass[]): void {
  const fields: DartField[] = []

  for (const [key, val] of Object.entries(obj)) {
    const fieldType = resolveType(capitalize(key), val, classes)
    fields.push({
      name: key,
      type: fieldType,
      isNullable: val === null,
    })
  }

  classes.unshift({ name, fields })
}

function resolveType(className: string, value: JsonValue, classes: DartClass[]): string {
  if (value === null) return 'dynamic'
  if (typeof value === 'string') return 'String'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double'
  if (typeof value === 'boolean') return 'bool'

  if (Array.isArray(value)) {
    if (value.length === 0) return 'List<dynamic>'
    // 使用非空断言，因为我们已经检查了 length > 0
    const firstItem = value[0]!
    return `List<${resolveType(className, firstItem, classes)}>`
  }

  if (isJsonObject(value)) {
    buildClass(className, value, classes)
    return className
  }

  return 'dynamic'
}

/* ================== render ================== */

function renderClass(cls: DartClass): string {
  const fields = cls.fields
    .map((f) => `  final ${f.type}${f.isNullable ? '?' : ''} ${f.name};`)
    .join('\n')

  const ctorParams = cls.fields.map((f) => `    required this.${f.name},`).join('\n')

  const fromJsonParams = cls.fields
    .map((f) => `      ${f.name}: json['${f.name}'] as ${f.type}${f.isNullable ? '?' : ''},`)
    .join('\n')

  const toJsonMap = cls.fields
    .map((f) => {
      const isPrimitive = ['String', 'int', 'double', 'bool', 'dynamic'].includes(f.type)
      const isList = f.type.startsWith('List<')

      // 修复 TS2532: 通过 charAt(0) 安全访问或显式检查长度
      const firstChar = f.type.charAt(0)
      const isCustomObject =
        f.type.length > 0 && firstChar === firstChar.toUpperCase() && !isPrimitive && !isList

      const valueExpression = isCustomObject ? `${f.name}.toJson()` : f.name
      return `      '${f.name}': ${valueExpression},`
    })
    .join('\n')

  return `
class ${cls.name} {
${fields}

  ${cls.name}({
${ctorParams}
  });

  factory ${cls.name}.fromJson(Map<String, dynamic> json) {
    return ${cls.name}(
${fromJsonParams}
    );
  }

  Map<String, dynamic> toJson() {
    return {
${toJsonMap}
    };
  }
}
`.trim()
}

/* ================== utils ================== */

function isJsonValue(v: unknown): v is JsonValue {
  if (v === null) return true
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return true
  if (Array.isArray(v)) return v.every(isJsonValue)
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).every(isJsonValue)
  return false
}

function isJsonObject(v: unknown): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<template>
  <n-split direction="horizontal" class="h-full" :min="0.25" :max="0.75">
    <template #1>
      <code-editor v-model="jsonValue" language="json" />
    </template>
    <template #2>
      <code-editor :model-value="dartValue" language="dart" />
    </template>
  </n-split>
</template>

<style scoped></style>
