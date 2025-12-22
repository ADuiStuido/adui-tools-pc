<script setup lang="ts">
import LayoutSider from '@/app/layout/components/LayoutSider.vue'
import LayoutHeader from '@/app/layout/components/LayoutHeader.vue'
import LayoutContent from '@/app/layout/components/LayoutContent.vue'
import LayoutFooter from '@/app/layout/components/LayoutFooter.vue'
import ToolsBar from '@/app/layout/components/ToolsBar.vue'
</script>

<template>
  <tools-bar />
  <div style="height: calc(100vh - 30px)">
    <n-layout has-sider class="w-full h-full">
      <layout-sider />
      <n-layout embedded>
        <layout-header />
        <layout-content />
        <layout-footer />
      </n-layout>
    </n-layout>
  </div>
</template>

<style scoped></style>
