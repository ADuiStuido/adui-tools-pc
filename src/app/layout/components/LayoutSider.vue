<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NIcon, type MenuOption } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import SvgIcon from '@/ui/SvgIcon.vue'

const appTitle = import.meta.env.VITE_APP_TITLE
const route = useRoute()
const router = useRouter()

function renderIcon(icon: string) {
  return () => h(NIcon, { size: 22 }, { default: () => h(SvgIcon, { name: icon }) })
}

/** 当前 toolKey：/tools/{toolId} */
const activeToolKey = computed(() => {
  const seg = route.path.split('/').filter(Boolean) // ['tools','json','json-parsing']
  const toolId = seg[1]
  return toolId ? `/tools/${toolId}` : '/tools'
})

/** tools 主菜单（只要 /tools/{toolId}） */
const toolRoutes = computed(() => {
  const all = router.getRoutes()

  // 从所有页面路由里收集 toolId（依赖 meta.title 的页面）
  const pages = all
    .filter((r) => r.path.startsWith('/tools/'))
    .filter((r) => Boolean(r.meta?.title))

  const toolIds = Array.from(
    new Set(pages.map((r) => r.path.split('/').filter(Boolean)[1]).filter(Boolean)),
  ) as string[]

  return toolIds.map((toolId) => {
    const toolRoute = all.find((r) => r.path === `/tools/${toolId}`)
    return {
      toolId,
      path: toolRoute?.path ?? `/tools/${toolId}`,
      name: toolRoute?.name ?? `tool.${toolId}`,
      meta: toolRoute?.meta ?? { toolId, title: toolId },
    }
  })
})

const menuOptions = computed<MenuOption[]>(() => {
  return toolRoutes.value.map((tool) => ({
    label: tool.meta?.title ?? tool.name,
    key: tool.path, // /tools/json
    icon: tool.meta?.icon ? renderIcon(tool.meta.icon as string) : undefined,
  }))
})

function renderMenuLabel(option: MenuOption) {
  return h('div', { className: 'select-none' }, option.label as string)
}

/** 点击工具：跳到该工具的默认子页（第一个有 meta.title 的页面） */
const handleToolClick = (toolPath: string) => {
  const all = router.getRoutes()
  const pages = all
    .filter((r) => r.path.startsWith(toolPath + '/'))
    .filter((r) => Boolean(r.meta?.title))
    // 排一下，保证稳定（也可以按你自己的 meta.order）
    .sort((a, b) => {
      const ao = (a.meta?.order as number) ?? 0
      const bo = (b.meta?.order as number) ?? 0
      return ao - bo
    })

  const target = pages[0]?.path ?? toolPath
  router.push({ path: target })
}

const collapsed = ref(false)
</script>

<template>
  <n-layout-sider
    :collapsed="collapsed"
    collapse-mode="width"
    :collapsed-width="65"
    :width="220"
    show-trigger="arrow-circle"
    bordered
    @update-collapsed="(v) => (collapsed = v)"
  >
    <div id="logo" class="w-full px-10px py-10px select-none">
      <div class="w-full flex justify-center items-center gap-10px rounded-sm overflow-hidden">
        <img class="size-40px" src="@/assets/logo/adui-tools-logo.svg" :alt="appTitle" />
        <div v-if="!collapsed" class="title text-24px font-bold text-nowrap">{{ appTitle }}</div>
      </div>
    </div>

    <div class="w-full h-2px line"></div>

    <n-menu
      :collapsed="collapsed"
      :collapsed-width="65"
      :options="menuOptions"
      :value="activeToolKey"
      :render-label="renderMenuLabel"
      @update:value="handleToolClick"
    />
  </n-layout-sider>
</template>

<style scoped lang="less">
.title {
  background: linear-gradient(125deg, #5b2b82 0%, #5b2b82 50%, #6cff00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.line {
  background: linear-gradient(125deg, #5b2b82 0%, #5b2b82 50%, #6cff00 100%);
}
</style>
