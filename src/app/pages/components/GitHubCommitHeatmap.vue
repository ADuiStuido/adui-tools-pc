<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import dayjs from 'dayjs'

/** GitHub stats/commit_activity: week 是 unix seconds，days 是 Sun..Sat */
interface Week {
  total?: number
  week: number // seconds
  days: readonly [number, number, number, number, number, number, number]
}

interface RepoCommitHeatmap {
  weeks: readonly Week[]
  owner: string
  repo: string
  hint?: string | null
}

/** Naive UI Heatmap 更稳的输入：timestamp(ms) + value */
interface HeatmapDataItem {
  timestamp: number // milliseconds
  value?: number | null
}

const owner = 'ADuiStuido'
const repo = 'adui-tools-pc'

const loading = ref<boolean>(false)
const errorMsg = ref<string | null>(null)
const hint = ref<string | null>(null)
const weeks = ref<readonly Week[]>([])

const DAY_SECONDS = 24 * 60 * 60

const heatmapData = computed<readonly HeatmapDataItem[]>(() => {
  const out: HeatmapDataItem[] = []
  for (const w of weeks.value) {
    for (let i = 0; i < 7; i += 1) {
      const v = w.days[i] ?? 0
      // ✅ GitHub: seconds -> NaiveUI: ms
      const tsMs = (w.week + i * DAY_SECONDS) * 1000
      out.push({ timestamp: tsMs, value: v })
    }
  }
  return out
})

const startDate = computed(() => {
  const d = heatmapData.value
  return d.length > 0 ? d[0]?.timestamp : null
})

const endDate = computed(() => {
  const d = heatmapData.value
  return d.length > 0 ? d[d.length - 1]?.timestamp : null
})

const totalCommits = computed<number>(() => {
  // 优先用 total（如果后端带），否则按 days 求和
  let sum = 0
  for (const w of weeks.value) {
    if (typeof w.total === 'number') {
      sum += w.total
    } else {
      sum += w.days.reduce((a, b) => a + b, 0)
    }
  }
  return sum
})

const load = async (): Promise<void> => {
  loading.value = true
  errorMsg.value = null
  hint.value = null
  try {
    const data = await invoke<RepoCommitHeatmap>('github_repo_commit_activity', { owner, repo })
    weeks.value = data.weeks
    hint.value = data.hint ?? null
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

const formatDate = (timestampMs: number): string => dayjs(timestampMs).format('YYYY-MM-DD')
</script>

<template>
  <n-card size="small" :bordered="false">
    <template #header>
      <div class="flex items-center justify-between gap-12px">
        <div class="text-14px font-600">仓库提交热力图</div>
        <n-tag size="small" class="font-mono"> {{ owner }}/{{ repo }} </n-tag>
      </div>
    </template>

    <n-alert v-if="hint" type="info" :bordered="false" class="mb-10px">
      {{ hint }}
    </n-alert>

    <n-alert v-if="errorMsg" type="error" :bordered="false" class="mb-10px">
      {{ errorMsg }}
    </n-alert>

    <div class="flex items-center justify-between gap-10px mb-10px">
      <div class="flex items-center gap-10px">
        <n-button size="tiny" :loading="loading" @click="load">刷新</n-button>
        <n-text depth="3" class="text-12px"> 最近一年提交记录（总计：{{ totalCommits }}） </n-text>
      </div>
    </div>

    <n-spin :show="loading">
      <div class="overflow-x-auto">
        <div v-if="!heatmapData.length" class="text-12px opacity-70 py-10px">暂无数据</div>
        <n-heatmap
          size="small"
          v-else-if="startDate !== null && endDate !== null"
          :data="[...heatmapData]"
          :start-date="startDate"
          :end-date="endDate"
        >
          <template #tooltip="{ timestamp, value }">
            <div class="text-12px leading-18px">
              <div class="font-mono">{{ formatDate(timestamp) }}</div>
              <div>commits：{{ value ?? 0 }}</div>
            </div>
          </template>
        </n-heatmap>
      </div>
    </n-spin>
  </n-card>
</template>
