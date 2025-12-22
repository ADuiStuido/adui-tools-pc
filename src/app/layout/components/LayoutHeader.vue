<script setup lang="ts">
import { computed, h } from 'vue'
import { type MenuOption, NIcon } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import SvgIcon from '@/components/SvgIcon.vue'

const route = useRoute()
const router = useRouter()

const currentToolId = computed(() => {
  const seg = route.path.split('/').filter(Boolean)
  return seg[1] ?? ''
})

function renderIcon(icon: string) {
  return () => h(NIcon, { size: 22 }, { default: () => h(SvgIcon, { name: icon }) })
}

/** 当前工具下的子页面（/tools/{toolId}/{page}，有 meta.title 才显示） */
const headerOptions = computed<MenuOption[]>(() => {
  if (!currentToolId.value) return []

  const base = `/tools/${currentToolId.value}`

  const pages = router
    .getRoutes()
    .filter((r) => r.path.startsWith(base + '/'))
    .filter((r) => Boolean(r.meta?.title))
    .sort((a, b) => {
      const ao = (a.meta?.order as number) ?? 0
      const bo = (b.meta?.order as number) ?? 0
      return ao - bo
    })

  return pages.map((p) => ({
    label: p.meta!.title as string,
    key: p.path,
    icon: p.meta?.icon ? renderIcon(p.meta.icon as string) : undefined,
  }))
})

const handleHeaderClick = (path: string) => {
  router.push({ path })
}
</script>

<template>
  <n-layout-header bordered>
    <div class="w-full h-60px flex items-center px-12px">
      <n-menu
        mode="horizontal"
        :options="headerOptions"
        :value="route.path"
        @update:value="handleHeaderClick"
      />
    </div>
  </n-layout-header>
</template>

<style scoped></style>
