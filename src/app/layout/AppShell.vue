<script setup lang="ts"></script>

<template>
  <n-layout has-sider>
    <n-layout-sider bordered>侧边栏</n-layout-sider>
    <n-layout>
      <n-layout-header>头部</n-layout-header>
      <n-layout-content>
        <div>内容</div>
        <router-view />
      </n-layout-content>
      <n-layout-footer> 底部 </n-layout-footer>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>
