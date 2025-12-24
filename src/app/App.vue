<script setup lang="ts">
import { registerAllMenuListen } from '@/app/bootstrap/register.ts'
import AppProviders from '@/ui/AppProviders.vue'

const router = useRouter()

let unlisten: undefined | (() => void)

registerAllMenuListen(router).then((fn) => {
  unlisten = fn
})

onBeforeUnmount(() => {
  unlisten?.()
})
</script>

<template>
  <app-providers>
    <div class="w-100vw h-100vh">
      <router-view />
    </div>
  </app-providers>
</template>

<style scoped></style>
