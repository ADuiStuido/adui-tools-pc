<script setup lang="ts">
import { computed, ref } from 'vue'
import CodeEditor from '@/common/components/CodeEditor.vue'

const jsonValue = ref<string>('')

// 右侧 SQL：由 jsonValue 派生（实时同步）
const sqlValue = computed<string>(() => jsonToSql(jsonValue.value))

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

interface JsonObject {
  readonly [key: string]: JsonValue
}

interface WrappedRows {
  readonly table: string
  readonly rows: readonly JsonObject[]
}

const DEFAULT_TABLE = 'my_table'

function jsonToSql(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return '-- 请输入 JSON'

  const parsed = safeJsonParse(trimmed)
  if (!parsed.ok) return `-- JSON 解析失败：${parsed.error}`

  const normalized = normalizeRows(parsed.value)
  if (!normalized.ok) return `-- 不支持的 JSON 结构：${normalized.error}`

  const table = normalized.value.table
  const rows = normalized.value.rows
  if (rows.length === 0) return '-- 无数据行'

  // 收集所有列（union）
  const colSet = new Set<string>()
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      if (k === '__table') continue
      colSet.add(k)
    }
  }
  const columns = [...colSet]
  if (columns.length === 0) return '-- 未发现可用字段'

  const createSql = buildCreateTable(table, rows, columns)
  const insertSql = buildInserts(table, rows, columns)

  return [createSql, '', insertSql].join('\n')
}

function safeJsonParse(
  input: string,
): { ok: true; value: JsonValue } | { ok: false; error: string } {
  try {
    const v: unknown = JSON.parse(input)
    if (!isJsonValue(v)) return { ok: false, error: '根节点不是合法 JSON 值' }
    return { ok: true, value: v }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : '未知错误' }
  }
}

function normalizeRows(
  value: JsonValue,
):
  | { ok: true; value: { table: string; rows: readonly JsonObject[] } }
  | { ok: false; error: string } {
  // 1) { table, rows }
  if (isWrappedRows(value)) {
    return { ok: true, value: { table: value.table || DEFAULT_TABLE, rows: value.rows } }
  }

  // 2) Array<Object>
  if (Array.isArray(value)) {
    const objs = value.filter(isJsonObject)
    if (objs.length !== value.length) return { ok: false, error: '数组元素必须都是对象' }

    // 支持 __table 覆盖
    const table = pickTableFromRows(objs) ?? DEFAULT_TABLE
    return { ok: true, value: { table, rows: objs } }
  }

  // 3) Single object -> single row
  if (isJsonObject(value)) {
    const row = value
    const table =
      typeof row.__table === 'string' && row.__table.trim() ? row.__table.trim() : DEFAULT_TABLE
    return { ok: true, value: { table, rows: [row] } }
  }

  return { ok: false, error: '根节点需为对象 / 对象数组 / {table, rows}' }
}

function pickTableFromRows(rows: readonly JsonObject[]): string | null {
  for (const r of rows) {
    const t = r.__table
    if (typeof t === 'string' && t.trim()) return t.trim()
  }
  return null
}

function buildCreateTable(
  table: string,
  rows: readonly JsonObject[],
  columns: readonly string[],
): string {
  const lines: string[] = []
  lines.push(`CREATE TABLE IF NOT EXISTS ${quoteIdent(table)}
              (`)

  const colDefs: string[] = columns.map((c) => {
    const sqlType = inferColumnType(rows, c)
    return `  ${quoteIdent(c)} ${sqlType} NULL`
  })

  lines.push(colDefs.join(',\n'))
  lines.push(');')
  return lines.join('\n')
}

function inferColumnType(rows: readonly JsonObject[], col: string): 'INTEGER' | 'REAL' | 'TEXT' {
  let sawNumber = false
  let sawFloat = false
  let sawBoolean = false
  let sawOther = false

  for (const r of rows) {
    const v = r[col]
    if (v === null || v === undefined) continue
    if (typeof v === 'number') {
      sawNumber = true
      if (!Number.isInteger(v)) sawFloat = true
      continue
    }
    if (typeof v === 'boolean') {
      sawBoolean = true
      continue
    }
    if (typeof v === 'string') continue
    // object/array -> fallback TEXT (JSON string)
    sawOther = true
  }

  if (sawOther) return 'TEXT'
  if (sawFloat) return 'REAL'
  if (sawNumber || sawBoolean) return 'INTEGER'
  return 'TEXT'
}

function buildInserts(
  table: string,
  rows: readonly JsonObject[],
  columns: readonly string[],
): string {
  const colList = columns.map(quoteIdent).join(', ')
  const valuesLines = rows.map((r) => {
    const values = columns.map((c) => sqlLiteral(r[c]))
    return `(${values.join(', ')})`
  })

  return `INSERT INTO ${quoteIdent(table)} (${colList})
          VALUES ${valuesLines.join(',\n')};`
}

function sqlLiteral(v: JsonValue | undefined): string {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL'
  if (typeof v === 'boolean') return v ? '1' : '0'
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`
  // object/array -> JSON string
  return `'${JSON.stringify(v).replace(/'/g, "''")}'`
}

function quoteIdent(name: string): string {
  // SQLite / MySQL 通用一点：反引号；并做最基本转义
  return `\`${name.replace(/`/g, '``')}\``
}

/** ===== type guards（禁止 any）===== */
function isJsonValue(v: unknown): v is JsonValue {
  if (v === null) return true
  const t = typeof v
  if (t === 'string' || t === 'number' || t === 'boolean') return true
  if (Array.isArray(v)) return v.every(isJsonValue)
  if (t === 'object') return isJsonObject(v)
  return false
}

function isJsonObject(v: unknown): v is JsonObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function isWrappedRows(v: JsonValue): v is WrappedRows {
  if (!isJsonObject(v)) return false

  // 显式断言为 Record 方便进行属性检查，解决“未解析变量”报错
  const data = v as Record<string, unknown>
  const table = data.table
  const rows = data.rows

  if (typeof table !== 'string') return false
  if (!Array.isArray(rows)) return false
  return rows.every(isJsonObject)
}
</script>

<template>
  <n-split direction="horizontal" class="h-full" :max="0.75" :min="0.25">
    <template #1>
      <code-editor v-model="jsonValue" language="json" />
    </template>
    <template #2>
      <code-editor :model-value="sqlValue" language="sql" />
    </template>
  </n-split>
</template>

<style scoped></style>
