<script setup lang="ts">
const appTitle = import.meta.env.VITE_APP_TITLE
</script>

<template>
  <div class="w-full h-30px tools-bar flex justify-between items-center px-20px">
    <div class="flex items-center gap-10px">
      <img class="size-16px" src="@/assets/images/adui-tools-logo.svg" :alt="appTitle" />
      <div class="color-white">{{ appTitle }}</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.tools-bar {
  background: linear-gradient(125deg, #5b2b82 0%, #5b2b82 50%, #6cff00 100%);
}
</style>
