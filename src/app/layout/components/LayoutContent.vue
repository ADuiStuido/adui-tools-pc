<script setup lang="ts"></script>

<template>
  <n-layout-content>
    <div class="w-full content px-20px py-20px overflow-auto">
      <router-view />
    </div>
  </n-layout-content>
</template>

<style scoped lang="less">
.content {
  height: calc(100vh - 84px);
}
</style>
