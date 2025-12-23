<script setup lang="ts">
interface Props {
  name: string
  prefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  prefix: 'icon',
})
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<template>
  <svg aria-hidden="true">
    <use :xlink:href="symbolId" fill="currentColor" />
  </svg>
</template>

<style scoped></style>
