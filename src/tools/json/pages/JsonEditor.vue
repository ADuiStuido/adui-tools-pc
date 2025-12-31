<script setup lang="ts">
import CodeEditor from '@/common/components/CodeEditor.vue'

const jsonValue = ref<string>('')
</script>

<template>
  <code-editor v-model="jsonValue" language="json" />
</template>

<style scoped></style>
