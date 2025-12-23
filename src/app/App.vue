<script setup lang="ts">
import { registerAllMenuListen } from '@/app/bootstrap/register.ts'

registerAllMenuListen()
</script>

<template>
  <div class="w-100vw h-100vh">
    <router-view />
  </div>
</template>

<style scoped></style>
