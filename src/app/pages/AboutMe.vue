<script setup lang="ts">
import GitHubCommitHeatmap from '@/app/pages/components/GitHubCommitHeatmap.vue'

type DepKind = 'Frontend' | 'Backend'
interface TechItem {
  name: string
  version: string
  note?: string
  kind: DepKind
}

interface TechSection {
  title: string
  items: readonly TechItem[]
}

const product = {
  product: 'ADui Tools',
  org: 'ADui Studio',
  description: '一个面向开发者的跨平台 AI & 实用工具桌面应用。',
} as const

const techSections: readonly TechSection[] = [
  {
    title: '核心框架',
    items: [
      {
        name: 'Tauri',
        version: '^2.9.6 (CLI) / 2.9.5 (Rust)',
        note: '跨平台桌面框架',
        kind: 'Backend',
      },
      { name: 'Vue', version: '^3.5.25', kind: 'Frontend' },
      { name: 'Vue Router', version: '^4.6.3', kind: 'Frontend' },
      { name: 'Vite', version: '^7.2.4', kind: 'Frontend' },
      { name: 'TypeScript', version: '~5.9.0', kind: 'Frontend' },
    ],
  },
  {
    title: 'UI & 样式',
    items: [
      { name: 'Naive UI', version: '^2.43.2', kind: 'Frontend' },
      { name: 'UnoCSS', version: '^66.5.10', note: '原子化 CSS', kind: 'Frontend' },
      { name: 'Less', version: '^4.5.1', kind: 'Frontend' },
      { name: 'vfonts', version: '^0.0.3', kind: 'Frontend' },
      { name: '@vicons/ionicons5', version: '^0.13.0', kind: 'Frontend' },
    ],
  },
  {
    title: '状态 & 工具库',
    items: [
      { name: 'Pinia', version: '^3.0.4', kind: 'Frontend' },
      { name: 'pinia-plugin-persistedstate', version: '^4.7.1', kind: 'Frontend' },
      { name: '@vueuse/core', version: '^14.1.0', kind: 'Frontend' },
      { name: 'dayjs', version: '^1.11.19', kind: 'Frontend' },
      { name: 'lodash-es', version: '^4.17.22', kind: 'Frontend' },
      { name: 'uuid', version: '1 (features: v4)', note: '会话/主键等', kind: 'Backend' },
      { name: 'chrono', version: '0.4 (features: serde)', note: '时间处理', kind: 'Backend' },
    ],
  },
  {
    title: '后端能力（Rust）',
    items: [
      { name: 'tauri-build', version: '2.5.3', kind: 'Backend' },
      { name: 'tauri-plugin-log', version: '2', note: '文件/控制台日志输出', kind: 'Backend' },
      { name: 'log', version: '0.4', note: '日志门面', kind: 'Backend' },

      {
        name: 'reqwest',
        version: '0.12 (json, multipart, rustls-tls)',
        note: 'HTTP / 上传 / TLS',
        kind: 'Backend',
      },
      { name: 'multipart', version: '0.18.0', note: '文件上传', kind: 'Backend' },

      { name: 'serde', version: '1 (derive)', note: '序列化', kind: 'Backend' },
      { name: 'serde_json', version: '1', kind: 'Backend' },

      {
        name: 'tokio',
        version: '1 (sync, macros, rt-multi-thread)',
        note: '异步运行时',
        kind: 'Backend',
      },

      {
        name: 'rusqlite',
        version: '=0.37.0 (bundled)',
        note: 'SQLite（内置 sqlite3）',
        kind: 'Backend',
      },
      { name: 'r2d2', version: '0.8', note: '连接池', kind: 'Backend' },
      { name: 'r2d2_sqlite', version: '=0.31.0', note: 'SQLite 连接池适配', kind: 'Backend' },

      { name: 'thiserror', version: '2', note: '错误定义', kind: 'Backend' },
      { name: 'base64', version: '0.22', kind: 'Backend' },
      { name: 'urlencoding', version: '2', kind: 'Backend' },
    ],
  },
  {
    title: '工程化（开发依赖）',
    items: [
      { name: 'ESLint', version: '^9.39.1', kind: 'Frontend' },
      { name: 'Prettier', version: '3.6.2', kind: 'Frontend' },
      { name: 'Vitest', version: '^4.0.14', kind: 'Frontend' },
      { name: 'vue-tsc', version: '^3.1.5', kind: 'Frontend' },
      { name: 'Husky', version: '^9.1.7', kind: 'Frontend' },
      { name: 'Commitizen', version: '^4.3.1', note: '配合 cz-git 规范提交', kind: 'Frontend' },
    ],
  },
]

const tagTypeByKind = (kind: DepKind): 'default' | 'success' => {
  return kind === 'Frontend' ? 'success' : 'default'
}
</script>

<template>
  <div class="w-100vw h-100vh px-20px py-20px overflow-y-auto">
    <div class="mx-auto my-0">
      <div>
        <div class="flex justify-center items-center gap-10px">
          <div class="flex flex-col items-center">
            <img
              class="size-100px select-none"
              src="@/assets/logo/adui-studio-logo.svg"
              alt="ADui Studio Logo"
            />
            <div class="text-20px">ADui Studio</div>
          </div>
          <n-divider vertical />
          <div class="flex flex-col items-center">
            <img
              class="size-100px select-none"
              src="@/assets/logo/adui-tools-logo.svg"
              alt="ADui Tools Logo"
            />
            <div class="text-20px">ADui Tools</div>
          </div>
        </div>
      </div>

      <git-hub-commit-heatmap />

      <!-- 介绍 -->
      <div class="mt-16px text-center">
        <div class="mt-6px text-14px opacity-80">
          {{ product.description }}
        </div>
      </div>

      <!-- 技术栈 -->
      <n-card class="mt-12px" size="small" :bordered="false">
        <template #header>
          <div class="text-14px font-600">主要技术与依赖版本</div>
        </template>

        <div class="grid gap-12px">
          <div v-for="sec in techSections" :key="sec.title">
            <div class="text-13px font-600 opacity-85 mb-8px">{{ sec.title }}</div>

            <div class="grid gap-8px">
              <div
                v-for="item in sec.items"
                :key="item.name"
                class="flex items-start justify-between gap-12px rounded-10px px-12px py-10px bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.06)]"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-8px min-w-0">
                    <div class="text-13px font-600 truncate">{{ item.name }}</div>
                    <n-tag size="small" :type="tagTypeByKind(item.kind)" class="shrink-0">
                      {{ item.kind }}
                    </n-tag>
                  </div>

                  <div v-if="item.note" class="mt-2px text-12px opacity-70 leading-18px">
                    {{ item.note }}
                  </div>
                </div>

                <n-tag size="small" type="default" class="shrink-0 font-mono">
                  {{ item.version }}
                </n-tag>
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <div class="mt-14px flex justify-center">
        <n-text depth="3" class="text-12px">© {{ product.org }} · {{ product.product }}</n-text>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
